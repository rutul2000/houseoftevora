"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
export type Line = { variant_id: string; name: string; size: string; color: string; price: number; qty: number };
const Ctx = createContext<{ lines: Line[]; add: (l: Line) => void; remove: (id: string) => void; clear: () => void }>(null as never);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem("tevora-cart") || "[]")); } catch {} }, []);
  const save = (l: Line[]) => { setLines(l); try { localStorage.setItem("tevora-cart", JSON.stringify(l)); } catch {} };
  const add = (l: Line) => save(lines.some(x => x.variant_id === l.variant_id) ? lines.map(x => x.variant_id === l.variant_id ? { ...x, qty: x.qty + l.qty } : x) : [...lines, l]);
  return <Ctx.Provider value={{ lines, add, remove: id => save(lines.filter(x => x.variant_id !== id)), clear: () => save([]) }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
