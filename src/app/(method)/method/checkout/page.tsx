import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CheckoutForm } from "../_components/CheckoutForm";
import { Reveal } from "../_components/sales/Reveal";

export const metadata: Metadata = {
  title: "Join · The Roadman Method",
  description:
    "Twelve weeks. Five pillars. One framework. Built on 1,400+ podcast episodes and interviews with World Tour coaches and sport scientists.",
  // Transactional URLs (including tier/cancelled query variants) should not
  // compete with the canonical Method sales page in organic search.
  robots: { index: false, follow: true },
};

export default async function MethodCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const cancelled = params.cancelled === "1";
  const tier = params.tier === "premium" ? "premium" : "standard";

  return (
    <>
      <Hero />

      <Container as="section" width="default" className="pb-24 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 xl:gap-20">
          <div className="space-y-16 lg:space-y-20">
            <OrderSummary tier={tier} />
            <TrustBand />
            <PriceAnchor />
            <Guarantee />
            <ClosingNote />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CheckoutCard cancelled={cancelled} />
          </aside>
        </div>
      </Container>
    </>
  );
}

function Hero() {
  return (
    <Container as="section" width="default" className="pt-20 pb-12 md:pt-28 md:pb-20">
      <Reveal>
        <p className="font-heading text-sm tracking-[0.4em] text-coral mb-5">
          CHECKOUT — THE ROADMAN METHOD
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h1 className="font-heading uppercase leading-[0.92] text-[clamp(2.75rem,8vw,6.5rem)] mb-6 max-w-[15ch]">
          One step left.
        </h1>
      </Reveal>
      <Reveal delay={140}>
        <p className="text-lg md:text-xl text-foreground-muted max-w-[58ch] leading-relaxed">
          Twelve weeks of structured training. Five pillars covered properly.
          A system you keep for life. Module 01 opens the second you log in.
        </p>
      </Reveal>
    </Container>
  );
}

function CheckoutCard({ cancelled }: { cancelled: boolean }) {
  return (
    <div className="rounded-sm border border-coral/30 bg-[color:var(--color-elevated)] p-6 md:p-8 shadow-[0_30px_80px_-30px_rgba(241,99,99,0.3)]">
      {cancelled && (
        <p
          role="status"
          className="mb-6 rounded-sm border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral"
        >
          Checkout cancelled — you weren&apos;t charged. Pick it back up when you&apos;re ready.
        </p>
      )}
      <p className="font-heading text-xs tracking-[0.4em] text-foreground-muted mb-2">
        ENROL
      </p>
      <p className="font-heading uppercase text-3xl text-off-white leading-tight mb-6">
        Get The Method.
      </p>
      <CheckoutForm />
      <ul className="mt-7 pt-6 border-t border-white/10 space-y-3 text-xs md:text-sm text-foreground-muted">
        <Reassurance>
          Secure checkout handled by Stripe. We never see or store your card
          details.
        </Reassurance>
        <Reassurance>
          Access opens the moment payment confirms — we email a one-click login
          link to get you in.
        </Reassurance>
        <Reassurance>
          30-day full refund. No interrogation, no friction.
        </Reassurance>
      </ul>
    </div>
  );
}

function Reassurance({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 leading-relaxed">
      <span aria-hidden className="text-coral mt-0.5 shrink-0">
        →
      </span>
      <span>{children}</span>
    </li>
  );
}

function OrderSummary({ tier }: { tier: "standard" | "premium" }) {
  return (
    <Reveal>
      <SectionHeader eyebrow="WHAT YOU’RE GETTING" title="The full system, end to end." />

      <div className="mt-10 space-y-10">
        <SummaryBlock title="The 12-week course">
          <SummaryList
            items={[
              "12 video lessons with Anthony — 12 to 15 minutes each, no fluff",
              "12 written companion guides — the same material to read on the train",
              "12 worksheets, protocol cards, and downloadable templates",
              tier === "premium"
                ? "A personalised TrainingPeaks plan built around your Week-1 audit"
                : "A TrainingPeaks plan for every block — load it and ride",
            ]}
          />
        </SummaryBlock>

        <SummaryBlock title="The five pillars">
          <ul className="grid gap-3 sm:grid-cols-2">
            {PILLAR_TILES.map((p) => (
              <li
                key={p.label}
                className="flex items-baseline gap-3 rounded-sm border border-white/10 bg-charcoal/40 px-4 py-3"
              >
                <span className="font-heading text-xs tracking-[0.3em] text-coral">
                  {p.num}
                </span>
                <span className="font-heading uppercase text-base text-off-white">
                  {p.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
            Coaching architecture from the people behind Froome and Cavendish.
            Nutrition from a World Tour performance dietitian. S&amp;C built on
            the 2025 masters meta-analysis. Recovery treated as training.
            Le Métier — the craft the spreadsheet can&apos;t teach you.
          </p>
        </SummaryBlock>

        <SummaryBlock title="The extras included">
          <SummaryList
            items={[
              "Entry & Exit Assessment — a measurable baseline at Week 1 and a measurable result at Week 12",
              "The Roadman Session Library — every key session ready to load",
              "Single-page Method summary — the whole framework on one sheet to keep on the bike",
              "Discussion threads inside the Not Done Yet community",
              tier === "premium"
                ? "Mid-course plan adjustment at Week 6 + a written training-data review at the end"
                : "Every future update included for life",
            ]}
          />
        </SummaryBlock>

        <p className="text-sm text-foreground-muted leading-relaxed">
          Lifetime access. One payment. No subscription, no upsells inside the
          course. Finish it once. Run it again next season with new goals.
        </p>
      </div>
    </Reveal>
  );
}

function SummaryBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-heading uppercase tracking-[0.25em] text-xs text-coral mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SummaryList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-base text-off-white/90 leading-relaxed"
        >
          <span
            aria-hidden
            className="font-heading text-coral mt-0.5 shrink-0 leading-none"
          >
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TrustBand() {
  return (
    <Reveal>
      <SectionHeader
        eyebrow="THE WORK BEHIND THE WORK"
        title="Built on the conversations most coaches never get."
      />

      <ul className="mt-10 grid gap-px bg-white/10 sm:grid-cols-3 rounded-sm overflow-hidden">
        {STATS.map((s) => (
          <li key={s.label} className="bg-charcoal p-6 md:p-7">
            <p className="font-heading text-3xl md:text-4xl text-coral leading-none mb-2">
              {s.metric}
            </p>
            <p className="font-heading uppercase tracking-[0.2em] text-xs text-foreground-muted">
              {s.label}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-base text-off-white/90 leading-relaxed max-w-[58ch]">
        Every module is built from on-the-record conversations with the people
        who actually move performance forward —{" "}
        <span className="text-coral">Professor Stephen Seiler</span> on
        polarised training,{" "}
        <span className="text-coral">Dan Lorang</span> on periodisation,{" "}
        <span className="text-coral">Dr. David Dunne</span> on fuelling, and{" "}
        <span className="text-coral">John Wakefield</span> on the torque
        protocols Bora-Hansgrohe riders run twice a week.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {MEMBER_QUOTES.map((q) => (
          <div
            key={q.who}
            className="rounded-sm border border-white/10 bg-[color:var(--color-elevated)]/40 p-6"
          >
            <p className="font-heading uppercase text-xl text-coral leading-tight mb-3">
              {q.headline}
            </p>
            <p className="text-sm text-off-white/90 leading-relaxed mb-4">
              {q.detail}
            </p>
            <p className="font-heading text-xs tracking-[0.3em] text-foreground-muted uppercase">
              — {q.who}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function Guarantee() {
  return (
    <Reveal>
      <div className="relative rounded-sm border border-coral/30 bg-[color:var(--color-elevated)]/60 p-8 md:p-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(241,99,99,0.12) 0%, rgba(37,37,38,0) 60%)",
          }}
        />
        <p className="font-heading text-sm tracking-[0.4em] text-coral mb-4">
          THE GUARANTEE
        </p>
        <h3 className="font-heading uppercase leading-[1] text-3xl md:text-4xl text-off-white mb-6 max-w-[18ch]">
          Thirty days. Full refund. No interrogation.
        </h3>
        <div className="space-y-4 text-base md:text-lg text-off-white/90 leading-relaxed max-w-[62ch]">
          <p>
            Open the course. Watch the first few modules. Do the worksheets.
            Load the TrainingPeaks plan and ride a week of it.
          </p>
          <p>
            If, inside 30 days, you&apos;re not seeing a measurable shift in
            clarity, structure, or progress — email us. We refund you in full
            and you keep what you&apos;ve learned.
          </p>
          <p className="text-foreground-muted text-sm">
            We&apos;re not asking for a 500-word essay on why. A one-line email
            is enough. We&apos;d rather build a refund into the offer than build
            a course that needs to hide behind one.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function ClosingNote() {
  return (
    <Reveal>
      <div className="border-t border-white/5 pt-12">
        <p className="font-heading text-sm tracking-[0.4em] text-coral mb-5">
          ONE MORE THING
        </p>
        <div className="space-y-4 text-base md:text-lg text-off-white/90 leading-relaxed max-w-[60ch]">
          <p>
            You&apos;ve probably been on the fence for a while. That&apos;s
            fair — you&apos;ve been burned by generic plans, by influencer
            programmes, by advice that doesn&apos;t survive contact with a real
            job and a real family.
          </p>
          <p>
            This is different in one specific way. The work in here is the
            distillation of 1,400+ episodes with the people the World Tour
            actually listens to. The same names, the same principles, the same
            sessions — just packaged so you can finish it in twelve weeks and
            walk away with a system you understand well enough to run yourself.
          </p>
          <p className="font-heading uppercase tracking-wider text-coral">
            Not done yet. Neither am I. Let&apos;s go.
          </p>
          <p className="text-sm text-foreground-muted">
            — Anthony Walsh, Host, Roadman Cycling Podcast
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function PriceAnchor() {
  return (
    <Reveal>
      <SectionHeader eyebrow="DO THE MATHS" title="What this work costs everywhere else." />

      <ul className="mt-10 space-y-px bg-white/10 rounded-sm overflow-hidden">
        {PRICE_COMPARISONS.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-4 bg-charcoal px-5 py-4 md:px-6 md:py-5"
          >
            <div className="min-w-0">
              <p className="font-heading uppercase text-base md:text-lg text-off-white leading-tight">
                {row.label}
              </p>
              <p className="text-sm text-foreground-muted">{row.note}</p>
            </div>
            <p className="font-heading text-xl md:text-2xl text-foreground-muted whitespace-nowrap shrink-0">
              {row.price}
            </p>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-4 bg-coral/10 px-5 py-5 md:px-6 md:py-6">
          <div className="min-w-0">
            <p className="font-heading uppercase text-lg md:text-xl text-off-white leading-tight">
              The Roadman Method
            </p>
            <p className="text-sm text-off-white/80">
              One payment. Lifetime access. Run it again every season.
            </p>
          </div>
          <p className="font-heading text-2xl md:text-3xl text-coral whitespace-nowrap shrink-0">
            Once
          </p>
        </li>
      </ul>

      <p className="mt-6 text-base md:text-lg text-off-white/90 leading-relaxed max-w-[58ch]">
        A one-to-one coach for a single season costs more than the Method costs
        once — and you&apos;d hand it back the day you stopped paying. This is the
        same thinking, the same names, the same sessions, built to keep. You
        finish owning the framework, not renting it.
      </p>
    </Reveal>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <p className="font-heading text-sm tracking-[0.4em] text-coral mb-4">
        {eyebrow}
      </p>
      <h2 className="font-heading uppercase leading-[0.98] text-[clamp(1.75rem,3.6vw,3rem)] max-w-[20ch]">
        {title}
      </h2>
    </>
  );
}

const PILLAR_TILES: ReadonlyArray<{ num: string; label: string }> = [
  { num: "01", label: "Coaching" },
  { num: "02", label: "Nutrition" },
  { num: "03", label: "Strength & Conditioning" },
  { num: "04", label: "Recovery" },
  { num: "05", label: "Le Métier" },
];

const PRICE_COMPARISONS: ReadonlyArray<{
  label: string;
  note: string;
  price: string;
}> = [
  {
    label: "A one-to-one coach",
    note: "Monthly fee, every month, forever — stop paying and it stops.",
    price: "$200–400/mo",
  },
  {
    label: "A week at a training camp",
    note: "One block of structure. Flights and hotel on top.",
    price: "$2,000+",
  },
  {
    label: "A training-app subscription",
    note: "Workouts, not understanding. Billed for as long as you ride.",
    price: "$20/mo",
  },
];

const STATS: ReadonlyArray<{ metric: string; label: string }> = [
  { metric: "100M+", label: "Podcast downloads" },
  { metric: "1,400+", label: "Long-form episodes" },
  { metric: "300+", label: "Expert interviews" },
];

const MEMBER_QUOTES = [
  {
    headline: "Cat 3 to Cat 1.",
    detail:
      "Eighteen months in the system. The structure was the difference, not the volume.",
    who: "James, 41",
  },
  {
    headline: "20% body fat to 7%.",
    detail:
      "Without restriction, without losing power. Race-week W/kg up 12%.",
    who: "Mark, 47",
  },
  {
    headline: "Women's National Series.",
    detail:
      "From group-ride survivor to top-ten in the local national series — at 44, after a six-year break.",
    who: "Sarah, 44",
  },
] as const;
