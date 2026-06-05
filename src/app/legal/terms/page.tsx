import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Bouqt",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#E8748A] transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Terms of Service</h1>
      <p className="text-sm text-stone-400 mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Orders and fulfilment</h2>
          <p>
            Placing an order does not guarantee fulfilment. Each order is manually reviewed and
            confirmed by our team. You will receive a notification once your order is confirmed and
            being prepared.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Availability</h2>
          <p>
            All bouquets are subject to availability. Stock counts are updated in real time, but in
            rare cases a product may sell out between the time you add it to your cart and when we
            process your order. We will contact you if this happens.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Pickup and delivery</h2>
          <p>
            Pickup orders must be collected within the agreed time window. Delivery is available
            within our service area. A flat delivery fee of ₱150 applies to all delivery orders.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Cancellations</h2>
          <p>
            Orders may be cancelled before they are confirmed. Once confirmed and preparation has
            begun, cancellations cannot be accepted. Please contact us as soon as possible if you
            need to make changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Contact</h2>
          <p>
            For any concerns, visit the{" "}
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
