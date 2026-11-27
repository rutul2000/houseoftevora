import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata = { title: "House of Tevora — Elegance in Every Thread", description: "Kurtis, ethnic wear and dresses for the modern Indian woman." };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}><body>
      <CartProvider>
        <div className="bg-burgundy text-ivory text-center text-sm py-2">Free shipping on orders above ₹1,499</div>
        <header className="sticky top-0 z-20 bg-ivory/95 backdrop-blur border-b border-champagne">
          <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" aria-label="House of Tevora — home"><img src="/logo-sm.jpg" alt="House of Tevora" width={180} height={78} className="h-14 w-auto mix-blend-multiply" /></Link>
            <div className="flex gap-6 text-sm">
              <Link href="/shop">Shop All</Link><Link href="/shop?category=kurtis">Kurtis</Link>
              <Link href="/shop?category=dresses">Dresses</Link><Link href="/shop?category=ethnic-wear">Ethnic Wear</Link>
              <Link href="/shop?sort=newest">New Arrivals</Link><Link href="/cart">Cart</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-24 bg-champagne py-10 text-center text-sm">© House of Tevora. Shipping across India.</footer>
      </CartProvider>
    </body></html>
  );
}
