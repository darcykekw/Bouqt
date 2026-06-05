"use client";

import { motion, useReducedMotion } from "framer-motion";

const items = [
  {
    num: "01",
    title: "Handcrafted with care",
    body: "Every arrangement is assembled by hand, with careful attention to quality and presentation — not mass-produced or pre-packaged.",
  },
  {
    num: "02",
    title: "Always fresh and in stock",
    body: "We only list what is currently available. Every bouquet on our site is ready to be prepared fresh for your order.",
  },
  {
    num: "03",
    title: "Pickup or delivery",
    body: "Choose to collect your order in person or have it delivered to your address. You may also include a personal note with any order.",
  },
  {
    num: "04",
    title: "Personal order confirmation",
    body: "Every order is reviewed and confirmed by our team. You will receive a notification as soon as your bouquet is being prepared.",
  },
];

export default function WhySection() {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={item.num}
          className="grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr] gap-6 sm:gap-10 py-10 border-b border-[#E7E5E1] last:border-0">
          <span className="font-serif font-bold text-3xl sm:text-4xl text-[#E8748A]/25 select-none leading-none pt-1">
            {item.num}
          </span>
          <div>
            <h3 className="font-serif font-bold text-[#1C1917] text-xl sm:text-2xl mb-2">{item.title}</h3>
            <p className="text-stone-500 font-light leading-relaxed">{item.body}</p>
            {/* Animated divider */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className="mt-5 h-px bg-[#E8748A]/40"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
