import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flower2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 select-none">
        <span className="text-8xl opacity-20">🌿</span>
        <span className="absolute inset-0 flex items-center justify-center text-5xl">404</span>
      </div>

      <Flower2 className="w-8 h-8 text-[#c9a0b4] mb-4" />

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800 mb-3">
        These flowers weren&apos;t found
      </h1>
      <p className="text-stone-400 max-w-sm mb-10 leading-relaxed">
        The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back to something beautiful.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/bouquets">
          <Button className="bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full px-8">
            Browse bouquets
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-8">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
