import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "You're in · The Method",
};

/**
 * /method/welcome
 *
 * Post-payment landing. Stripe redirects here on success. The actual
 * fulfilment (welcome email with magic link) is fired by the webhook,
 * which is asynchronous — so we tell the rider what to expect rather
 * than trying to grant access in this page's request lifecycle.
 *
 * The page deliberately does NOT attempt to read enrollment status
 * from the session_id query param — that would invite a race against
 * the webhook on slow days. The email is the source of truth for
 * "you have access".
 */
export default function MethodWelcomePage() {
  return (
    <Container as="section" width="narrow" className="min-h-[80vh] py-20 flex flex-col justify-center">
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        THE ROADMAN METHOD
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-7xl mb-6">
        You're in.
      </h1>
      <p className="text-xl text-off-white mb-3">
        We've sent your sign-in link to the email on file. It usually arrives
        in under a minute.
      </p>
      <p className="text-foreground-muted mb-8">
        Open the email, tap "Start The Method", and Module 01 will be waiting.
        No password to remember.
      </p>
      <div className="rounded-lg border border-white/10 bg-charcoal/60 p-6">
        <h2 className="font-heading uppercase tracking-wider text-lg mb-2">
          Didn't get the email?
        </h2>
        <p className="text-sm text-foreground-muted mb-4">
          Check spam first. Still nothing in two minutes? Request a fresh link
          from the sign-in page — same email you used at checkout.
        </p>
        <a
          href="/method/login"
          className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-coral hover:text-coral-hover"
        >
          GO TO SIGN-IN →
        </a>
      </div>
    </Container>
  );
}
