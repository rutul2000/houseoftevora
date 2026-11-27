import Link from "next/link";
import { Product, inr, off } from "@/lib/supabase";
export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="aspect-[3/4] bg-champagne overflow-hidden">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="h-full flex items-end p-3 text-burgundy/60 text-xs">Photo coming soon</div>}
      </div>
      <h3 className="mt-3 text-lg">{p.name}</h3>
      <p className="text-sm"><span className="font-medium">{inr(p.price_inr)}</span> <s className="text-charcoal/50">{inr(p.mrp_inr)}</s> <span className="text-burgundy">{off(p)}% off</span></p>
    </Link>
  );
}
