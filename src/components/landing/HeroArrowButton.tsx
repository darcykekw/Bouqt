"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroArrowButton({ href, children }: { href: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <Link href={href}>
      <motion.button
        whileHover={reduce ? {} : { scale: 1.03 }}
        whileTap={reduce ? {} : { scale: 0.97 }}
        className="inline-flex items-center gap-2.5 bg-[#E8748A] hover:bg-[#d4607a] text-white font-semibold
          rounded-full px-8 py-3.5 text-base transition-colors group"
      >
        {children}
        <motion.span
          animate={reduce ? {} : { x: 0 }}
          whileHover={reduce ? {} : { x: 4 }}
          className="transition-transform"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </motion.button>
    </Link>
  );
}
