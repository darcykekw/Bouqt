"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  message?: string;
};

export default function RegisterFormCard({ action, error, message }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      animate={error && !reduce ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-[#E7E5E1] shadow-sm p-8"
    >
      <h1 className="font-serif font-bold text-xl text-[#1C1917] mb-6">Create an account</h1>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-5 p-3 bg-[#A8B5A2]/20 border border-[#A8B5A2]/30 rounded-xl text-[#6B8A65] text-sm">
          {message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="float-label-wrap">
          <input
            id="email"
            name="email"
            type="email"
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
            name="password"
            type="password"
            placeholder=" "
            required
            minLength={6}
            autoComplete="new-password"
            className="input-rose-focus w-full px-3 rounded-xl border border-[#E7E5E1] bg-white text-[#1C1917] h-14 text-sm outline-none transition-colors"
          />
          <label htmlFor="password">Password (min. 6 characters)</label>
        </div>

        <button
          type="submit"
          className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full py-3.5 font-semibold text-base transition-colors mt-2"
        >
          Create account
        </button>
      </form>
    </motion.div>
  );
}
