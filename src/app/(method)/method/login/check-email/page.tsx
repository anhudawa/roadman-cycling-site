import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { EmailSentAnimation } from "../../_components/EmailSentAnimation";

export const metadata: Metadata = {
  title: "Check your email · The Method",
  robots: { index: false, follow: false },
};

/**
 * /method/login/check-email
 *
 * Interstitial after the rider requests a sign-in link. We surface
 * which email we sent to (when query carries it) so the rider knows
 * which inbox to open. The animation keeps the page from feeling like
 * a dead-end stub.
 */
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const params = await searchParams;
  const recipient = params.to?.trim() ?? "";

  return (
    <Container as="section" width="narrow" className="min-h-[80vh] py-20 flex flex-col justify-center">
      <EmailSentAnimation />
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3 text-center">
        SIGN-IN LINK SENT
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl text-center mb-5">
        Check your inbox
      </h1>
      {recipient ? (
        <p className="text-lg text-foreground-muted text-center mb-3">
          We&apos;ve sent a one-tap sign-in link to{" "}
          <span className="text-off-white font-heading uppercase tracking-wider">
            {recipient}
          </span>
          .
        </p>
      ) : (
        <p className="text-lg text-foreground-muted text-center mb-3">
          If that email is on the list, a sign-in link is on the way.
        </p>
      )}
      <p className="text-foreground-muted text-center mb-10">
        The link expires in 15 minutes and only works once. Open it on the
        device you want to ride from.
      </p>

      <div className="rounded-lg border border-white/10 bg-charcoal/60 p-5 md:p-6">
        <p className="font-heading uppercase tracking-wider text-sm text-coral mb-2">
          Nothing in your inbox?
        </p>
        <ol className="space-y-2 text-sm text-foreground-muted list-decimal list-inside">
          <li>Give it sixty seconds — sometimes it lands a beat behind.</li>
          <li>Check spam, or the &ldquo;Promotions&rdquo; tab in Gmail.</li>
          <li>
            Still nothing?{" "}
            <a
              href="/method/login"
              className="text-coral underline-offset-4 hover:underline"
            >
              Request a fresh link
            </a>
            .
          </li>
        </ol>
      </div>

      <p className="mt-10 text-xs text-foreground-muted text-center">
        Wrong email at checkout? Write to{" "}
        <a
          href="mailto:support@roadmancycling.com"
          className="text-coral underline-offset-4 hover:underline"
        >
          support@roadmancycling.com
        </a>{" "}
        and we&apos;ll move your access.
      </p>
    </Container>
  );
}
