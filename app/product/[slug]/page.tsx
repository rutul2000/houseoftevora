import { notFound } from "next/navigation";
import { supabase, Product, inr, off } from "@/lib/supabase";
import AddToCart from "./AddToCart";
export const dynamic = "force-dynamic";
export default async function PDP({ params }: { params: { slug: string } }) {
  const db = supabase();
  if (!db) notFound();
  const { data } = await db.from("products").select("*, variants(*)").eq("slug", params.slug).single();
  if (!data) notFound();
  const p = data as Product;
  return (
    <div className="max-w-6xl mx-auto px-4 mt-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-[3/4] bg-champagne">{p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}</div>
      <div>
        <h1 className="text-4xl">{p.name}</h1><p className="text-xs text-charcoal/60 mt-1">SKU {p.sku}</p>
        <p className="mt-4 text-xl">{inr(p.price_inr)} <s className="text-charcoal/50 text-base">{inr(p.mrp_inr)}</s> <span className="text-burgundy text-base">{off(p)}% off</span></p>
        <p className="mt-4">{p.description}</p><p className="mt-2 text-sm">Fabric: {p.fabric}</p>
        <AddToCart p={p} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, offers: { "@type": "Offer", priceCurrency: "INR", price: p.price_inr } }) }} />
    </div>
  );
}
