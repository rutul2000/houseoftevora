import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const ok = expected.length === (razorpay_signature || "").length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const db = supabaseAdmin();
  await db.from("orders").update({ paid: true, status: "confirmed", razorpay_payment_id }).eq("razorpay_order_id", razorpay_order_id);
  return NextResponse.json({ ok: true });
}
