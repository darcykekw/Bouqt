import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Bouqt",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#E8748A] transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Privacy Policy</h1>
      <p className="text-sm text-stone-400 mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">What we collect</h2>
          <p>
            When you create an account or place an order, we collect your email address, delivery
            address, and order details. We do not collect payment card data — all payments are
            handled externally.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">How we use your data</h2>
          <p>
            Your information is used solely to process and fulfil your orders, send you order
            confirmations, and improve our service. We do not sell or share your data with third
            parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Cookies</h2>
          <p>
            We use session cookies to keep you signed in. Your cart is stored locally in your
            browser and is never sent to our servers until you check out.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Data retention</h2>
          <p>
            Order records are retained for accounting purposes. You may request deletion of your
            account and associated data by contacting us directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Contact</h2>
          <p>
            Questions about this policy? Reach us via the{" "}
            <Link href="/#contact" className="text-[#E8748A] hover:underline">
              contact section
            </Link>{" "}
            on our homepage.
          </p>
        </section>
      </div>
    </div>
  );
}
