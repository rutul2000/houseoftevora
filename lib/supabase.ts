import { createClient } from "@supabase/supabase-js";
export const supabase = () => { const u = process.env.NEXT_PUBLIC_SUPABASE_URL, k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; return u && k ? createClient(u, k) : null; };
export const supabaseAdmin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export type Variant = { id: string; size: string; color: string; stock: number };
export type Product = { id: string; slug: string; sku: string; name: string; description: string; fabric: string; price_inr: number; mrp_inr: number; images: string[]; variants?: Variant[] };
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const off = (p: Product) => Math.round(100 - (p.price_inr / p.mrp_inr) * 100);
