import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { findVariant, COUPONS } from "@/lib/catalog";
export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: "Checkout is not set up yet. Please check back soon." }, { status: 503 });
  const { items, customer, coupon } = await req.json();
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  if (!/^[1-9][0-9]{5}$/.test(customer?.pin || "") || !/^\S+@\S+\.\S+$/.test(customer?.email || "")) return NextResponse.json({ error: "Invalid email or PIN code." }, { status: 400 });
  let subtotal = 0; const rows: any[] = [];
  for (const i of items) {
    const f = findVariant(i.variant_id); const qty = Math.max(1, Math.min(10, Number(i.qty) || 1));
    if (!f || f.variant.stock < 1) return NextResponse.json({ error: "An item is unavailable." }, { status: 409 });
    subtotal += f.product.price_inr * qty; rows.push({ name: f.product.name, size: f.variant.size, color: f.variant.color, qty, unit_price_inr: f.product.price_inr });
  }
  const c = COUPONS[String(coupon || "").toUpperCase()];
  const discount = c && subtotal >= c.min ? Math.round(subtotal * c.percent / 100) : 0;
  const shipping = subtotal - discount >= 1499 ? 0 : 99; const total = subtotal - discount + shipping;
  const order_no = "TEV" + Date.now().toString(36).toUpperCase();
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: order_no }) });
  if (!r.ok) return NextResponse.json({ error: "Payment provider error. Try again." }, { status: 502 });
  const rz = await r.json(); const db = supabaseAdmin();
  const { data: o, error } = await db.from("orders").insert({ order_no, email: customer.email, phone: customer.phone, address: customer, subtotal_inr: subtotal, discount_inr: discount, shipping_inr: shipping, total_inr: total, razorpay_order_id: rz.id }).select("id").single();
  if (error || !o) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  await db.from("order_items").insert(rows.map(x => ({ ...x, order_id: o.id })));
  return NextResponse.json({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: total * 100, razorpay_order_id: rz.id, order_no });
}
