import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import BouqtHeaderWrapper from "@/components/BouqtHeaderWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Toaster } from "@/components/ui/sonner";
import PageTransition from "@/components/PageTransition";
import CartInitializer from "@/components/CartInitializer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Bouqt — Fresh Bouquets, Made With Heart",
  description: "Handcrafted bouquets for every moment. Browse our collection and order for pickup or delivery.",
  openGraph: {
    title: "Bouqt — Fresh Bouquets, Made With Heart",
    description: "Handcrafted bouquets for every moment.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5]">
        <CartInitializer />
        <BouqtHeaderWrapper />
        <main className="flex-1 pt-16">
          <PageTransition>{children}</PageTransition>
        </main>
        <FooterWrapper />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
