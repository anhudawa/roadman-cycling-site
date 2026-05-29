import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getProgressSummary } from "@/lib/method/progress";
import { LogoutButton } from "../_components/LogoutButton";
import { ResetProgressButton } from "../_components/ResetProgressButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account · The Method",
  robots: { index: false, follow: false },
};

const PREMIUM_THRESHOLD_CENTS = 35000; // $350+ → Premium tier
const DAY_MS = 24 * 60 * 60 * 1000;

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
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/account] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  const enrollment = session.enrollment;
  const progress = await getProgressSummary(enrollment.id);
  const tier = resolveTier(enrollment.tier, enrollment.amountCents);
  const isPremium = tier === "Premium";
  const ndyTrialUrl =
    process.env.METHOD_NDY_TRIAL_URL ??
    "/community/not-done-yet?from=method-premium";
  const billingPortalUrl = process.env.STRIPE_METHOD_BILLING_PORTAL_URL ?? null;
  const supportEmail =
    process.env.METHOD_SUPPORT_EMAIL ?? "sarah@roadmancycling.com";
  const daysEnrolled = daysSince(enrollment.paidAt);

  return (
    <Container as="section" width="narrow" className="py-12 md:py-20 space-y-10 md:space-y-12">
      <header>
        <p className="font-heading text-xs sm:text-sm tracking-[0.3em] text-coral mb-3">
          THE ROADMAN METHOD
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl">
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

      <SummaryStrip
        tier={tier}
        completedCount={progress.completedCount}
        totalCount={progress.totalCount}
        daysEnrolled={daysEnrolled}
      />

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

      <section className="rounded-xl border border-coral/30 bg-gradient-to-br from-deep-purple/30 via-charcoal/70 to-charcoal p-6 md:p-8">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          WHERE THE METHOD LEADS
        </p>
        <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
          Not Done Yet
        </h2>
        {isPremium ? (
          <>
            <p className="text-foreground-muted mb-5 max-w-xl">
              Your Premium enrolment includes priority access to a Not Done Yet
              trial — the ongoing coaching community where the Method framework
              gets sharpened week after week: live calls with Anthony, updated
              TrainingPeaks plans, and a cohort training to the same standard.
            </p>
            <a
              href={ndyTrialUrl}
              className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-sm text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
            >
              Claim your Not Done Yet trial →
            </a>
          </>
        ) : (
          <>
            <p className="text-foreground-muted mb-5 max-w-xl">
              The Method is the system. Not Done Yet is where riders keep it
              sharp — weekly live coaching with Anthony, updated TrainingPeaks
              plans, and the accountability of a cohort. Most graduates who
              keep climbing carry on here.
            </p>
            <a
              href="/community/not-done-yet?from=method-account"
              className="inline-flex items-center gap-2 rounded-md border border-coral/50 hover:bg-coral hover:text-off-white px-5 py-2.5 font-heading uppercase tracking-wider text-sm text-coral transition-colors active:scale-[0.97]"
            >
              See Not Done Yet →
            </a>
          </>
        )}
      </section>

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

/**
 * The `tier` column is the source of truth (set at checkout). For rows
 * created before the column existed it defaults to "standard", so we let a
 * Premium-sized payment override an apparent Standard tier as a corrective.
 */
function resolveTier(tier: string | null, amountCents: number | null): string {
  if (tier === "premium") return "Premium";
  if (amountCents && amountCents >= PREMIUM_THRESHOLD_CENTS) return "Premium";
  return "Standard";
}

function daysSince(start: Date | null): number {
  if (!start) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / DAY_MS));
}

function SummaryStrip({
  tier,
  completedCount,
  totalCount,
  daysEnrolled,
}: {
  tier: string;
  completedCount: number;
  totalCount: number;
  daysEnrolled: number;
}) {
  const items = [
    { label: "Tier", value: tier },
    { label: "Progress", value: `${completedCount}/${totalCount}` },
    {
      label: "Enrolled",
      value: daysEnrolled > 0 ? `${daysEnrolled}d` : "Today",
    },
  ];
  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4 rounded-xl border border-white/10 bg-charcoal/60 p-4 sm:p-5">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <dt className="text-[10px] sm:text-[11px] font-heading uppercase tracking-[0.25em] text-foreground-muted mb-1">
            {item.label}
          </dt>
          <dd className="font-heading uppercase text-base sm:text-xl text-off-white">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
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
