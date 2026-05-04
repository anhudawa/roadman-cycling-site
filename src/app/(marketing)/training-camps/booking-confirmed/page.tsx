import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { db } from "@/lib/db";
import { campBookings } from "@/lib/db/schema";
import { CAMPS, formatCampDates, type CampConfig } from "@/lib/camps/camps";

export const metadata: Metadata = {
  title: "Booking confirmed — Roadman Training Camps",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ camp?: string; session_id?: string }>;
}

const STRIPE_SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;

type CampSelection = "road" | "gravel" | "both" | null;

function parseCamp(value: string | undefined): CampSelection {
  const v = (value ?? "").toLowerCase();
  if (v === "road" || v === "gravel" || v === "both") return v;
  return null;
}

interface ResolvedBooking {
  selection: "road" | "gravel" | "both";
  rows: { camp: "road" | "gravel"; status: string; paidAt: Date | null }[];
}

async function resolveBooking(
  sessionId: string,
  campHint: CampSelection,
): Promise<ResolvedBooking | null> {
  try {
    const rows = await db
      .select({
        camp: campBookings.camp,
        status: campBookings.status,
        paidAt: campBookings.paidAt,
      })
      .from(campBookings)
      .where(eq(campBookings.stripeSessionId, sessionId));
    if (rows.length === 0) return null;
    const camps = rows.map((r) => r.camp as "road" | "gravel");
    const selection: "road" | "gravel" | "both" =
      camps.includes("road") && camps.includes("gravel")
        ? "both"
        : camps[0];
    return {
      selection: campHint && campHint === "both" ? "both" : selection,
      rows: rows.map((r) => ({
        camp: r.camp as "road" | "gravel",
        status: r.status,
        paidAt: r.paidAt ?? null,
      })),
    };
  } catch (err) {
    console.error("[booking-confirmed] DB lookup failed:", err);
    return null;
  }
}

function dateLineFor(selection: "road" | "gravel" | "both"): string {
  if (selection === "both") {
    return `${formatCampDates(CAMPS.road)} → ${formatCampDates(CAMPS.gravel)} · Can Sagnari, Girona`;
  }
  const cfg = CAMPS[selection];
  return `${formatCampDates(cfg)} · Can Sagnari, Girona`;
}

function headlineFor(selection: "road" | "gravel" | "both"): string {
  if (selection === "both") return "BOTH CAMPS — LOCKED IN.";
  if (selection === "road") return "GIRONA ROAD — LOCKED IN.";
  return "GIRONA GRAVEL — LOCKED IN.";
}

const NEXT_STEPS: { title: string; body: string }[] = [
  {
    title: "Confirmation email",
    body:
      "A receipt and full kit list lands in your inbox within minutes. If it's not there in 30, check spam — then ping us.",
  },
  {
    title: "Flights & transfers",
    body:
      "Once you've booked flights, reply to that email with your times. We'll sort the airport pickup from Girona (GRO) both ways.",
  },
  {
    title: "Travel insurance",
    body:
      "Get this in place before you fly. Cycling cover, medical, and trip cancellation. Non-negotiable — no refunds if you can't make the trip.",
  },
  {
    title: "The Clubhouse",
    body:
      "We'll add you to a private channel for camp-goers in the run-up. Ride questions, kit chat, the lot.",
  },
];

export default async function CampBookingConfirmedPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const sessionId = (params.session_id ?? "").trim();
  const validSession = STRIPE_SESSION_ID_RE.test(sessionId);
  const campHint = parseCamp(params.camp);

  // Edge case: someone hitting this page directly without a session_id, or
  // with a malformed one. We don't expose any "your booking" copy and guide
  // them back to the camps overview.
  if (!validSession) {
    return <NoSessionView />;
  }

  const resolved = await resolveBooking(sessionId, campHint);

  // Edge case: valid-looking session_id but no matching booking row. Most
  // likely the webhook hasn't landed yet (rare but possible) or the URL was
  // copy-pasted from someone else's flow. Show a holding state rather than
  // claiming a confirmation we can't prove.
  if (!resolved) {
    return <ProcessingView campHint={campHint} />;
  }

  const selection = resolved.selection;
  const headline = headlineFor(selection);
  const dateLine = dateLineFor(selection);
  const allPaid = resolved.rows.every((r) => r.paidAt !== null);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="!pt-32 !pb-16 md:!pt-40 md:!pb-24">
          <Container className="text-center relative">
            <p className="text-coral font-heading text-5xl md:text-6xl mb-5 md:mb-6 leading-none">
              &#10003;
            </p>
            <p className="font-heading text-coral text-[11px] md:text-sm tracking-[0.35em] md:tracking-[0.4em] mb-4 md:mb-5">
              ROADMAN TRAINING CAMPS &middot; GIRONA 2026
            </p>
            <h1
              className="font-heading text-off-white mb-3 md:mb-4 leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 11vw, 6rem)" }}
            >
              {headline}
            </h1>
            <p className="text-foreground-subtle text-[11px] md:text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
              {dateLine}
            </p>
            <p className="text-foreground-muted text-lg md:text-xl max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed">
              {allPaid
                ? "Payment received. Your spot is booked."
                : "Payment received. We're finalising your booking now — your confirmation email follows in a few minutes."}
            </p>
            <p className="text-foreground-muted text-[15px] md:text-base max-w-xl mx-auto leading-relaxed">
              If anything looks off — flight times, dietary changes, mate
              joining you — just reply to that email. Anthony will see it.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
              WHAT HAPPENS NEXT
            </p>
            <h2
              className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              FOUR THINGS BEFORE YOU FLY.
            </h2>
            <ol className="space-y-5 md:space-y-6">
              {NEXT_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 flex gap-4 md:gap-5"
                >
                  <span
                    className="font-heading text-coral text-2xl md:text-3xl leading-none shrink-0 w-9 md:w-12"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-off-white text-lg md:text-xl tracking-wide uppercase mb-2">
                      {step.title}
                    </h3>
                    <p className="text-foreground-muted leading-relaxed text-[15px] md:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-16 md:!py-20">
          <Container className="text-center">
            <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
              QUESTIONS BEFORE THEN
            </p>
            <h2
              className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              REPLY TO THE EMAIL — OR EMAIL ANTHONY DIRECT.
            </h2>
            <p className="text-foreground-muted text-[15px] md:text-base max-w-xl mx-auto leading-relaxed mb-7 md:mb-8">
              <Link
                href="mailto:anthony@roadmancycling.com"
                className="text-coral hover:underline break-all sm:break-normal"
              >
                anthony@roadmancycling.com
              </Link>{" "}
              · we read everything that comes in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button href="/training-camps" size="lg">
                Back to camps overview
              </Button>
              <Button href="/community/clubhouse" variant="ghost" size="lg">
                Join the Clubhouse
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function NoSessionView() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-24 pb-16 md:pt-20">
            <p className="font-heading text-coral text-[11px] md:text-sm tracking-[0.35em] md:tracking-[0.4em] mb-5 md:mb-6">
              ROADMAN TRAINING CAMPS &middot; GIRONA 2026
            </p>
            <h1
              className="font-heading text-off-white mb-5 md:mb-6 leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 10vw, 5.5rem)" }}
            >
              NOTHING TO CONFIRM HERE — YET.
            </h1>
            <p className="text-foreground-muted text-lg md:text-xl max-w-xl mx-auto mb-7 md:mb-8 leading-relaxed">
              This page only loads after a successful Stripe payment. If you
              were trying to book, head back to the camp page and finish
              checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center mb-8 md:mb-10">
              <Button href={CAMPS.road.href} size="lg">
                Girona Road · 10–15 Oct
              </Button>
              <Button href={CAMPS.gravel.href} variant="ghost" size="lg">
                Girona Gravel · 16–21 Oct
              </Button>
            </div>
            <p className="text-foreground-subtle text-xs md:text-sm leading-relaxed">
              Already paid and seeing this by mistake? Email{" "}
              <Link
                href="mailto:anthony@roadmancycling.com"
                className="text-coral hover:underline break-all sm:break-normal"
              >
                anthony@roadmancycling.com
              </Link>{" "}
              and we&apos;ll sort it.
            </p>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function ProcessingView({ campHint }: { campHint: CampSelection }) {
  const camp: CampConfig | null =
    campHint === "road"
      ? CAMPS.road
      : campHint === "gravel"
        ? CAMPS.gravel
        : null;
  const dateLine =
    campHint === "both"
      ? `${formatCampDates(CAMPS.road)} → ${formatCampDates(CAMPS.gravel)} · Can Sagnari, Girona`
      : camp
        ? `${formatCampDates(camp)} · Can Sagnari, Girona`
        : "Roadman Training Camps · Girona 2026";
  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-24 pb-16 md:pt-20">
            <p className="text-coral font-heading text-5xl md:text-6xl mb-5 md:mb-6 leading-none">
              &#10003;
            </p>
            <h1
              className="font-heading text-off-white mb-3 md:mb-4 leading-[0.95]"
              style={{ fontSize: "clamp(2.25rem, 9vw, 5rem)" }}
            >
              PAYMENT RECEIVED — FINALISING YOUR SPOT.
            </h1>
            <p className="text-foreground-subtle text-[11px] md:text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
              {dateLine}
            </p>
            <p className="text-foreground-muted text-lg md:text-xl max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed">
              Stripe&apos;s passed us the green light. We&apos;re assigning
              your room and queueing the confirmation email — usually under a
              minute. Refresh this page if you want to see the full
              confirmation, or just wait for the email.
            </p>
            <p className="text-foreground-muted text-[15px] md:text-base max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
              Hang tight. If you don&apos;t see anything in your inbox in 15
              minutes, email us and we&apos;ll check the booking by hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button href="/training-camps" size="lg">
                Back to camps overview
              </Button>
              <Button
                href="mailto:anthony@roadmancycling.com"
                variant="ghost"
                size="lg"
              >
                Email Anthony
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

