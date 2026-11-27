import type { Product } from "@/lib/supabase";

// ── EDIT THIS FILE to add products, change prices, or mark sizes out of stock. ──
// Photos: put files in public/products/ and list them as "/products/<file>.jpg" in `images`.
// `soldOut` lists "SIZE|Colour" combinations that are unavailable, e.g. ["XS|Ivory", "XXL|Burgundy"].
type Item = { slug: string; sku: string; name: string; description: string; fabric: string; category: string; occasion: string;
  price_inr: number; mrp_inr: number; colors: string[]; images: string[]; soldOut?: string[]; added: string };

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const ITEMS: Item[] = [
  { slug: "meher-anarkali-kurti", sku: "TEV-001", name: "Meher Anarkali Kurti", description: "Flared Anarkali in soft chanderi with gold zari trim.", fabric: "Chanderi", category: "kurtis", occasion: "festive", price_inr: 2499, mrp_inr: 3499, colors: ["Burgundy", "Ivory"], images: ["/products/kurti_1.jpg"], added: "2026-11-27" },
  { slug: "ishani-straight-kurti", sku: "TEV-002", name: "Ishani Straight Kurti", description: "Everyday straight kurti in breathable cotton.", fabric: "Cotton", category: "kurtis", occasion: "casual", price_inr: 1299, mrp_inr: 1799, colors: ["Ivory", "Sage"], images: ["/products/kurti_2.jpg"], added: "2026-11-26" },
  { slug: "noor-coord-set", sku: "TEV-003", name: "Noor Co-Ord Set", description: "Block-print kurta and trousers set.", fabric: "Rayon", category: "co-ord-sets", occasion: "office", price_inr: 2199, mrp_inr: 2999, colors: ["Indigo", "Ivory"], images: ["/products/kurti_3.jpg"], added: "2026-11-25" },
  { slug: "saanvi-ethnic-dress", sku: "TEV-004", name: "Saanvi Ethnic Dress", description: "A-line dress with burgundy embroidery.", fabric: "Georgette", category: "dresses", occasion: "party", price_inr: 2899, mrp_inr: 3999, colors: ["Burgundy"], images: ["/products/kurti_4.jpg"], added: "2026-11-24" },
];

export const COUPONS: Record<string, { percent: number; min: number }> = { WELCOME10: { percent: 10, min: 999 } };

const toProduct = (i: Item): Product & { category: string; added: string } => ({
  id: i.slug, slug: i.slug, sku: i.sku, name: i.name, description: i.description, fabric: i.fabric,
  price_inr: i.price_inr, mrp_inr: i.mrp_inr, images: i.images, category: i.category, added: i.added,
  variants: i.colors.flatMap(color => SIZES.map(size => ({ id: `${i.slug}|${size}|${color}`, size, color, stock: i.soldOut?.includes(`${size}|${color}`) ? 0 : 10 }))),
});

export function getProducts(o: { category?: string; sort?: string; limit?: number } = {}) {
  let list = ITEMS.filter(i => !o.category || i.category === o.category).map(toProduct);
  list.sort((a, b) => o.sort === "price-asc" ? a.price_inr - b.price_inr : o.sort === "price-desc" ? b.price_inr - a.price_inr : b.added.localeCompare(a.added));
  return o.limit ? list.slice(0, o.limit) : list;
}
export const getProduct = (slug: string) => { const i = ITEMS.find(x => x.slug === slug); return i ? toProduct(i) : null; };
export function findVariant(id: string) {
  const [slug] = String(id).split("|"); const p = getProduct(slug);
  const variant = p?.variants?.find(v => v.id === id); return p && variant ? { product: p, variant } : null;
}
