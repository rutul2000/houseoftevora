import { supabase, Product } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
export default async function Shop({ searchParams }: { searchParams: { category?: string; sort?: string } }) {
  const db = supabase();
  if (!db) return <div className="max-w-7xl mx-auto px-4 mt-10"><h1 className="text-4xl mb-6">Shop</h1><p>The collection is arriving soon.</p></div>;
  let q = db.from("products").select("*, categories!inner(slug)");
  if (searchParams.category) q = q.eq("categories.slug", searchParams.category);
  const s = searchParams.sort;
  q = s === "price-asc" ? q.order("price_inr") : s === "price-desc" ? q.order("price_inr", { ascending: false }) : q.order("created_at", { ascending: false });
  const { data } = await q;
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <h1 className="text-4xl mb-6">Shop</h1>
      <div className="flex gap-4 text-sm mb-8">
        <a href="?sort=newest">Newest</a><a href="?sort=price-asc">Price: Low to High</a><a href="?sort=price-desc">Price: High to Low</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{(data as Product[] | null)?.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
