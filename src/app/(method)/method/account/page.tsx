import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getProgressSummary } from "@/lib/method/progress";
import { LogoutButton } from "../_components/LogoutButton";
import { ResetProgressButton } from "../_components/ResetProgressButton";

export const metadata: Metadata = {
  title: "Account · The Method",
  robots: { index: false, follow: false },
};

const PREMIUM_THRESHOLD_CENTS = 35000; // $350+ → Premium tier

/**
 * /method/account
 *
 * Account settings. Phase 1 surface area:
 *   - read-only enrollment fields (email, name, status, tier, joined)
 *   - billing portal link (Stripe Customer Portal — env-configured)
 *   - reset progress (destructive, two-step confirm)
 *   - sign-out
 *   - support contact
 *
 * Self-service email change / re-enrollment lives in Phase 2.
 */
export default async function MethodAccountPage() {
  const session = await getMethodSession();
  if (!session) redirect("/method/login");

  const enrollment = session.enrollment;
  const progress = await getProgressSummary(enrollment.id);
  const tier = inferTier(enrollment.amountCents);
  const billingPortalUrl = process.env.STRIPE_METHOD_BILLING_PORTAL_URL ?? null;
  const supportEmail =
    process.env.METHOD_SUPPORT_EMAIL ?? "support@roadmancycling.com";

  return (
    <Container as="section" width="narrow" className="py-14 md:py-20 space-y-12">
      <header>
        <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
          THE ROADMAN METHOD
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl">
          Account
        </h1>
        <p className="mt-3 text-foreground-muted max-w-lg">
          The dial-in panel — billing, progress, sign-out. Anything not handled
          here, write to us at{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="text-coral underline-offset-4 hover:underline"
          >
            {supportEmail}
          </a>
          .
        </p>
      </header>

      <Section title="Enrollment">
        <DetailGrid>
          <Detail label="Email" value={enrollment.email} />
          {enrollment.name && <Detail label="Name" value={enrollment.name} />}
          <Detail label="Tier" value={tier} />
          <Detail
            label="Status"
            value={
              <span className="capitalize">{enrollment.status}</span>
            }
          />
          {enrollment.paidAt && (
            <Detail
              label="Joined"
              value={enrollment.paidAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
          {enrollment.amountCents && (
            <Detail
              label="Paid"
              value={formatPrice(enrollment.amountCents, enrollment.currency)}
            />
          )}
        </DetailGrid>
      </Section>

      <Section title="Billing">
        <p className="text-foreground-muted mb-5">
          The Method is a one-time payment with lifetime access — there&apos;s
          nothing recurring to manage. For receipts or to update card details
          on a refunded re-enroll, use the Stripe portal.
        </p>
        {billingPortalUrl ? (
          <a
            href={billingPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 hover:border-coral hover:text-coral px-5 py-2.5 font-heading uppercase tracking-wider text-sm transition-colors active:scale-[0.97]"
          >
            Open billing portal →
          </a>
        ) : (
          <p className="text-sm text-foreground-muted">
            For receipts, reply to your purchase confirmation email or write to{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-coral underline-offset-4 hover:underline"
            >
              {supportEmail}
            </a>
            .
          </p>
        )}
      </Section>

      <Section title="Progress">
        <p className="text-foreground-muted mb-5">
          Your dashboard is currently showing{" "}
          <span className="text-off-white font-heading uppercase tracking-wider">
            {progress.completedCount} / {progress.totalCount}
          </span>{" "}
          modules complete. Resetting clears your completion log so you can
          start the twelve weeks fresh — useful if you&apos;re re-running The
          Method into a new event window.
        </p>
        <ResetProgressButton completedCount={progress.completedCount} />
      </Section>

      <Section title="Support">
        <p className="text-foreground-muted mb-3">
          Stuck on the work, the protocol, or the platform? Write to us. We
          read every email.
        </p>
        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-2 font-heading uppercase tracking-wider text-coral hover:text-coral-hover"
        >
          {supportEmail} →
        </a>
      </Section>

      <Section title="Session">
        <LogoutButton />
      </Section>
    </Container>
  );
}

function inferTier(amountCents: number | null): string {
  if (!amountCents) return "Standard";
  return amountCents >= PREMIUM_THRESHOLD_CENTS ? "Premium" : "Standard";
}

function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(0)} ${currency.toUpperCase()}`;
  }
}

/* ─────────────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
      <h2 className="font-heading uppercase tracking-wider text-xl mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>;
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-5 sm:block sm:space-y-1 py-2 sm:py-0 border-t sm:border-t-0 border-white/5 first:border-t-0">
      <dt className="text-[11px] font-heading uppercase tracking-[0.25em] text-foreground-muted">
        {label}
      </dt>
      <dd className="text-off-white">{value}</dd>
    </div>
  );
}
