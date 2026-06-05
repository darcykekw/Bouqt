"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type BouqtSignInProps = {
  heading?: string;
  signupText?: string;
  loginText?: string;
  loginUrl?: string;
};

export default function BouqtSignIn({
  heading = "Welcome back",
  signupText = "Don't have an account?",
  loginText = "Create one",
  loginUrl = "/register",
}: BouqtSignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const router = useRouter();
  const reduce = useReducedMotion();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      if (!reduce) setShake((s) => s + 1);
    } else {
      router.push("/bouquets");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-6 relative overflow-hidden">
      {/* Faded watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-serif font-bold text-[#1C1917] select-none"
          style={{ fontSize: "clamp(8rem, 20vw, 18rem)", opacity: 0.03, lineHeight: 1 }}
        >
          Bouqt
        </span>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-2xl text-[#1C1917] hover:text-[#E8748A] transition-colors">
            Bouqt
          </Link>
          <p className="mt-1.5 text-stone-400 text-sm font-light">
            Fresh bouquets, made with intention.
          </p>
        </div>

        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-[#E7E5E1] shadow-sm p-8"
        >
          <h1 className="font-serif font-bold text-xl text-[#1C1917] mb-6">{heading}</h1>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="float-label-wrap">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                autoComplete="email"
                className="input-rose-focus w-full px-3 rounded-xl border border-[#E7E5E1] bg-white text-[#1C1917] h-14 text-sm outline-none transition-colors"
              />
              <label htmlFor="email">Email address</label>
            </div>

            <div className="float-label-wrap">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                autoComplete="current-password"
                className="input-rose-focus w-full px-3 rounded-xl border border-[#E7E5E1] bg-white text-[#1C1917] h-14 text-sm outline-none transition-colors"
              />
              <label htmlFor="password">Password</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#E8748A] hover:bg-[#d4607a] disabled:opacity-60 text-white rounded-full py-3.5 font-semibold text-base transition-colors mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-sm text-stone-400">
          {signupText}{" "}
          <Link href={loginUrl} className="text-[#E8748A] font-medium link-underline">
            {loginText}
          </Link>
        </p>
      </div>
    </div>
  );
}
