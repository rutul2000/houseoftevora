import { getProducts } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
export default function Shop({ searchParams }: { searchParams: { category?: string; sort?: string } }) {
  const data = getProducts({ category: searchParams.category, sort: searchParams.sort });
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <h1 className="text-4xl mb-6">Shop</h1>
      <div className="flex gap-4 text-sm mb-8">
        <a href="?sort=newest">Newest</a><a href="?sort=price-asc">Price: Low to High</a><a href="?sort=price-desc">Price: High to Low</a>
      </div>
      {data.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{data.map(p => <ProductCard key={p.id} p={p} />)}</div> : <p>No pieces in this collection yet.</p>}
    </div>
  );
}
