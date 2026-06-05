"use client";

import { Menu, X } from "lucide-react";

type MenuToggleProps = {
  open: boolean;
  onToggle: () => void;
};

export default function MenuToggle({ open, onToggle }: MenuToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
    >
      <span
        className={`absolute transition-all duration-200 ${open ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
      >
        <X className="w-5 h-5" />
      </span>
      <span
        className={`absolute transition-all duration-200 ${open ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}
      >
        <Menu className="w-5 h-5" />
      </span>
    </button>
  );
}
