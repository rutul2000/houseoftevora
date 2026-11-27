import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  const { items, customer, coupon } = await req.json();
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  if (!/^[1-9][0-9]{5}$/.test(customer?.pin || "") || !/^\S+@\S+\.\S+$/.test(customer?.email || "")) return NextResponse.json({ error: "Invalid email or PIN code." }, { status: 400 });
  const db = supabaseAdmin();
  const { data: vs } = await db.from("variants").select("id,size,color,stock,products(name,price_inr)").in("id", items.map((i: any) => i.variant_id));
  let subtotal = 0; const rows: any[] = [];
  for (const i of items) {
    const v: any = vs?.find(x => x.id === i.variant_id); const qty = Math.max(1, Math.min(10, Number(i.qty) || 1));
    if (!v || v.stock < qty) return NextResponse.json({ error: "An item is out of stock." }, { status: 409 });
    subtotal += v.products.price_inr * qty; rows.push({ variant_id: v.id, name: v.products.name, size: v.size, color: v.color, qty, unit_price_inr: v.products.price_inr });
  }
  let discount = 0;
  if (coupon) { const { data: c } = await db.from("coupons").select("*").eq("code", String(coupon).toUpperCase()).eq("active", true).maybeSingle();
    if (c && subtotal >= (c.min_order_inr || 0)) discount = c.percent_off ? Math.round(subtotal * c.percent_off / 100) : c.flat_off_inr || 0; }
  const shipping = subtotal - discount >= 1499 ? 0 : 99; const total = subtotal - discount + shipping;
  const order_no = "TEV" + Date.now().toString(36).toUpperCase();
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: order_no }) });
  if (!r.ok) return NextResponse.json({ error: "Payment provider error. Try again." }, { status: 502 });
  const rz = await r.json();
  const { data: o, error } = await db.from("orders").insert({ order_no, email: customer.email, phone: customer.phone, address: customer, subtotal_inr: subtotal, discount_inr: discount, shipping_inr: shipping, total_inr: total, razorpay_order_id: rz.id }).select("id").single();
  if (error || !o) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  await db.from("order_items").insert(rows.map(r => ({ ...r, order_id: o.id })));
  return NextResponse.json({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: total * 100, razorpay_order_id: rz.id, order_no });
}
