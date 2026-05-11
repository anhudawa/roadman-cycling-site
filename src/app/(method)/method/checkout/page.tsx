import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CheckoutForm } from "../_components/CheckoutForm";

export const metadata: Metadata = {
  title: "Join · The Roadman Method",
  description:
    "Twelve weeks. One framework. Built on conversations with World Tour coaches and sport scientists.",
};

/**
 * Sales page. Phase 1 ships a structural placeholder — the long-form
 * sales copy is being drafted separately. The form posts to
 * /api/method/checkout and redirects the rider to Stripe Checkout.
 */
export default async function MethodCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const params = await searchParams;
  const cancelled = params.cancelled === "1";

  return (
    <>
      <Container as="section" width="default" className="pt-20 pb-12">
        <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
          THE ROADMAN METHOD
        </p>
        <h1 className="font-heading uppercase leading-[0.92] text-[clamp(3rem,9vw,7rem)] mb-6">
          Twelve weeks.<br />One framework.
        </h1>
        <p className="text-xl md:text-2xl text-foreground-muted max-w-3xl leading-relaxed">
          Built on conversations with World Tour coaches and sport scientists.
          Distilled into the protocol Anthony actually uses with riders inside
          Not Done Yet.
        </p>
      </Container>

      <Container as="section" width="default" className="pb-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6 text-foreground-muted">
            <h2 className="font-heading uppercase tracking-wider text-3xl text-off-white">
              What's inside
            </h2>
            <ul className="space-y-3">
              {WHATS_INSIDE.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-coral mt-1">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="pt-4 text-sm">
              Lifetime access. One payment. No subscription.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-charcoal/60 p-6 md:p-8 backdrop-blur-sm">
            {cancelled && (
              <p className="mb-6 rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
                Checkout cancelled — you weren't charged. Come back when ready.
              </p>
            )}
            <CheckoutForm />
            <p className="mt-6 text-xs text-foreground-muted">
              Secure checkout via Stripe. We don't store your card details.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}

const WHATS_INSIDE: readonly string[] = [
  "Twelve weekly modules — video, written protocol, downloadable PDF",
  "TrainingPeaks plan for every block",
  "Strength foundation built for cyclists, not generic gym work",
  "Nutrition that fuels the work — not just a deficit calculator",
  "Recovery treated as training, not the bit you skip",
  "Discussion threads inside the Not Done Yet community",
];
