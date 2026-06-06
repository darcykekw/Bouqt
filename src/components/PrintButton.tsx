"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2 bg-[#E8748A] text-white text-sm font-medium rounded-full hover:bg-[#d4607a] transition-colors"
    >
      Print this ticket
    </button>
  );
}
