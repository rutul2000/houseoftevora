import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const ok = expected.length === (razorpay_signature || "").length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: o } = await db.from("orders").update({ paid: true, status: "confirmed", razorpay_payment_id }).eq("razorpay_order_id", razorpay_order_id).select("id").single();
  if (o) { const { data: items } = await db.from("order_items").select("variant_id,qty").eq("order_id", o.id);
    for (const i of items || []) await db.rpc("decrement_stock", { vid: i.variant_id, n: i.qty }); }
  return NextResponse.json({ ok: true });
}
