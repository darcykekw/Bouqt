import Link from "next/link";
import { register } from "@/app/auth/actions";
import RegisterFormCard from "@/components/auth/RegisterFormCard";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

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
            Join us — flowers are better shared.
          </p>
        </div>

        <RegisterFormCard action={register} error={params.error} message={params.message} />

        <p className="mt-6 text-center text-sm text-stone-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E8748A] font-medium link-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
