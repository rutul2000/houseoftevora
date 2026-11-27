import Link from "next/link";
import { supabase, Product } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
export const revalidate = 60;
export default async function Home() {
  const { data } = await supabase().from("products").select("*").order("created_at", { ascending: false }).limit(8);
  return (
    <>
      <section className="bg-champagne">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-36">
          <img src="/logo.jpg" alt="House of Tevora" className="w-64 mb-8 mix-blend-multiply" />
          <h1 className="text-5xl md:text-7xl text-burgundy max-w-2xl leading-tight">Elegance in Every Thread</h1>
          <p className="mt-6 max-w-md text-lg">Discover timeless ethnic wear crafted for the modern woman.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/shop?sort=newest" className="bg-burgundy text-ivory px-6 py-3">Shop New Collection</Link>
            <Link href="/shop?category=kurtis" className="border border-burgundy text-burgundy px-6 py-3">Explore Kurtis</Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl mb-8">New Arrivals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{(data as Product[] | null)?.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    </>
  );
}
