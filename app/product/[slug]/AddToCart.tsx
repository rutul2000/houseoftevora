"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { Product } from "@/lib/supabase";
export default function AddToCart({ p }: { p: Product }) {
  const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [err, setErr] = useState("");
  const { add } = useCart(); const router = useRouter();
  const sizes = [...new Set(p.variants!.map(v => v.size))]; const colors = [...new Set(p.variants!.map(v => v.color))];
  const go = (buy: boolean) => {
    const v = p.variants!.find(v => v.size === size && v.color === color);
    if (!size || !color) return setErr("Choose a size and a colour.");
    if (!v || v.stock < 1) return setErr("That combination is out of stock.");
    add({ variant_id: v.id, name: p.name, size, color, price: p.price_inr, qty: 1 });
    buy ? router.push("/cart") : setErr("Added to cart.");
  };
  const chip = (on: boolean) => `px-3 py-2 border ${on ? "bg-burgundy text-ivory border-burgundy" : "border-champagne"}`;
  return (
    <div className="mt-6 space-y-5">
      <div><p className="text-sm mb-2">Size</p><div className="flex gap-2 flex-wrap">{sizes.map(s => <button key={s} onClick={() => setSize(s)} className={chip(s === size)}>{s}</button>)}</div></div>
      <div><p className="text-sm mb-2">Colour</p><div className="flex gap-2">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={chip(c === color)}>{c}</button>)}</div></div>
      {err && <p role="alert" className="text-burgundy text-sm">{err}</p>}
      <div className="flex gap-3"><button onClick={() => go(false)} className="border border-burgundy text-burgundy px-6 py-3">Add to Cart</button><button onClick={() => go(true)} className="bg-burgundy text-ivory px-6 py-3">Buy Now</button></div>
    </div>
  );
}
