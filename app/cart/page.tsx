"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/supabase";
declare global { interface Window { Razorpay: any } }
const loadRzp = () => new Promise<void>(r => { if (window.Razorpay) return r(); const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => r(); document.body.appendChild(s); });
export default function Cart() {
  const { lines, remove, clear } = useCart();
  const [f, setF] = useState({ name: "", email: "", phone: "", line1: "", city: "", state: "", pin: "", coupon: "" });
  const [msg, setMsg] = useState("");
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function pay() {
    if (!/^[1-9][0-9]{5}$/.test(f.pin)) return setMsg("Enter a valid 6-digit PIN code.");
    if (!f.name || !f.email || !f.line1) return setMsg("Fill in name, email and address.");
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: lines.map(l => ({ variant_id: l.variant_id, qty: l.qty })), customer: f, coupon: f.coupon }) });
    const o = await res.json(); if (!res.ok) return setMsg(o.error);
    await loadRzp();
    new window.Razorpay({ key: o.key, amount: o.amount, currency: "INR", order_id: o.razorpay_order_id, name: "House of Tevora", prefill: { name: f.name, email: f.email, contact: f.phone },
      theme: { color: "#6B2335" },
      handler: async (r: any) => { const v = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) }); if (v.ok) { clear(); setMsg(`Order ${o.order_no} confirmed. Check your email.`); } else setMsg("Payment could not be verified. Contact support with your payment ID."); } }).open();
  }
  const inp = "border border-champagne bg-white px-3 py-2 w-full";
  return (
    <div className="max-w-3xl mx-auto px-4 mt-10">
      <h1 className="text-4xl mb-6">Your cart</h1>
      {lines.length === 0 ? <p>{msg || "Your cart is empty."}</p> : <>
        {lines.map(l => <div key={l.variant_id} className="flex justify-between border-b border-champagne py-3"><span>{l.name} · {l.size} · {l.color} × {l.qty}</span><span>{inr(l.price * l.qty)} <button onClick={() => remove(l.variant_id)} className="ml-3 text-burgundy text-sm">Remove</button></span></div>)}
        <p className="mt-4 text-right">Subtotal {inr(subtotal)} (shipping and discounts are calculated at payment)</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <input className={inp} placeholder="Full name" onChange={set("name")} /><input className={inp} placeholder="Email" onChange={set("email")} />
          <input className={inp} placeholder="Phone" onChange={set("phone")} /><input className={inp} placeholder="Coupon code" onChange={set("coupon")} />
          <input className={`${inp} col-span-2`} placeholder="Address" onChange={set("line1")} />
          <input className={inp} placeholder="City" onChange={set("city")} /><input className={inp} placeholder="State" onChange={set("state")} />
          <input className={inp} placeholder="PIN code" onChange={set("pin")} />
        </div>
        {msg && <p role="alert" className="mt-4 text-burgundy">{msg}</p>}
        <button onClick={pay} className="mt-6 bg-burgundy text-ivory px-8 py-3">Pay securely with Razorpay</button>
      </>}
    </div>
  );
}
