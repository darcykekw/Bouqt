"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="font-serif font-bold text-2xl text-[#1C1917] mb-2">Something went wrong</h1>
        <p className="text-stone-400 font-light mb-8 leading-relaxed">
          An unexpected error occurred. This has been noted and we&apos;ll look into it.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full px-7 py-2.5 text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-[#E7E5E1] text-stone-600 hover:border-stone-400 rounded-full px-7 py-2.5 text-sm font-semibold transition-colors"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] text-stone-300 font-mono">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
