import Link from "next/link";
import { ScrollReveal } from "@/components/ui";

type Variant = "dark" | "light";

interface ChoosePathProps {
  /** Background treatment. Dark for charcoal/deep-purple sections, light for off-white sections. */
  variant?: Variant;
  /** Override the default eyebrow tag. */
  eyebrow?: string;
  /** Override the default H2. */
  heading?: string;
  /** Optional sub-heading paragraph below the H2. */
  subheading?: string;
  /** Extra classes on the outer <section>. */
  className?: string;
  /** Analytics source — appended to data-track on each CTA. */
  source?: string;
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="w-7 h-7 shrink-0"
  >
    {children}
  </svg>
);

const ICONS = {
  plateau: (
    <Icon>
      <path d="M3 17 L8 12 L12 14 L21 6" />
      <path d="M3 21 L21 21" opacity={0.4} />
      <circle cx={21} cy={6} r={1.2} />
    </Icon>
  ),
  event: (
    <Icon>
      <path d="M5 3 L5 21" />
      <path d="M5 4 L18 4 L15 8 L18 12 L5 12" />
    </Icon>
  ),
  masters: (
    <Icon>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7 L12 12 L15 14" />
      <path d="M12 3 L12 4" />
      <path d="M12 20 L12 21" />
    </Icon>
  ),
  weight: (
    <Icon>
      <path d="M5 7 L19 7 L21 21 L3 21 Z" />
      <path d="M9 4 L15 4" />
      <path d="M9 4 L9 7" />
      <path d="M15 4 L15 7" />
      <path d="M9 14 L12 17 L15 14" />
    </Icon>
  ),
  structure: (
    <Icon>
      <rect x={3} y={3} width={7} height={7} />
      <rect x={14} y={3} width={7} height={7} />
      <rect x={3} y={14} width={7} height={7} />
      <rect x={14} y={14} width={7} height={7} />
    </Icon>
  ),
  strength: (
    <Icon>
      <path d="M3 9 L3 15" />
      <path d="M6 6 L6 18" />
      <path d="M6 12 L18 12" />
      <path d="M18 6 L18 18" />
      <path d="M21 9 L21 15" />
    </Icon>
  ),
  newsletter: (
    <Icon>
      <rect x={3} y={5} width={18} height={14} rx={1} />
      <path d="M3 7 L12 13 L21 7" />
    </Icon>
  ),
  ask: (
    <Icon>
      <path d="M4 5 L20 5 A1 1 0 0 1 21 6 L21 16 A1 1 0 0 1 20 17 L13 17 L9 21 L9 17 L4 17 A1 1 0 0 1 3 16 L3 6 A1 1 0 0 1 4 5 Z" />
      <path d="M9.5 9.5 A2.5 2.5 0 1 1 12 12 L12 13" />
      <circle cx={12} cy={15} r={0.6} fill="currentColor" stroke="none" />
    </Icon>
  ),
};

interface PathItem {
  icon: keyof typeof ICONS;
  problem: string;
  description: string;
  cta: string;
  href: string;
  /** Track key — appended to source for analytics. */
  track: string;
}

const PATHS: readonly PathItem[] = [
  {
    icon: "plateau",
    problem: "I've plateaued.",
    description:
      "Stuck on the same FTP for months. Twelve questions, four minutes — one specific answer to what's holding you back.",
    cta: "Run the diagnostic",
    href: "/plateau",
    track: "plateau",
  },
  {
    icon: "event",
    problem: "I'm training for an event.",
    description:
      "A sportive, race or fondo on the calendar. Predict your time on the actual course and see what to fix before race day.",
    cta: "Predict your race",
    href: "/predict",
    track: "event",
  },
  {
    icon: "masters",
    problem: "I'm over 40 and not recovering.",
    description:
      "The plan that worked at 30 is breaking you at 50. Coaching built around what changes after 40 — and what still works.",
    cta: "See masters coaching",
    href: "/coaching/masters-cyclists",
    track: "masters",
  },
  {
    icon: "weight",
    problem: "I need to lose weight without losing power.",
    description:
      "Find your race weight for your build, then check you're eating enough to keep the watts. No diet-culture nonsense.",
    cta: "Find your race weight",
    href: "/tools/race-weight",
    track: "weight",
  },
  {
    icon: "structure",
    problem: "I need structure.",
    description:
      "A weekly plan that adapts to your life. Coaching across all five pillars — training, nutrition, strength, recovery, community.",
    cta: "See the coaching",
    href: "/coaching",
    track: "structure",
  },
  {
    icon: "strength",
    problem: "I need strength training.",
    description:
      "Cycling-specific S&C that transfers to the bike. Periodised with your riding so you get stronger without wrecking your legs.",
    cta: "Start the strength plan",
    href: "/strength-training",
    track: "strength",
  },
  {
    icon: "newsletter",
    problem: "I just want weekly advice.",
    description:
      "The Saturday Spin. One email, every Saturday. What's working, what the pros do, how to apply it this week. Free.",
    cta: "Subscribe free",
    href: "/newsletter",
    track: "newsletter",
  },
  {
    icon: "ask",
    problem: "I want expert answers.",
    description:
      "Ask Roadman is Anthony's coaching brain on tap. Any cycling question — answers grounded in 1,400+ podcast episodes.",
    cta: "Ask a question",
    href: "/ask",
    track: "ask",
  },
] as const;

export function ChoosePath({
  variant = "dark",
  eyebrow = "CHOOSE YOUR PATH",
  heading = "WHAT DO YOU NEED RIGHT NOW?",
  subheading,
  className = "",
  source = "choosepath",
}: ChoosePathProps) {
  const isDark = variant === "dark";

  const sectionBg = isDark
    ? "bg-charcoal border-y border-white/5"
    : "bg-off-white border-y border-charcoal/5";
  const eyebrowText = "text-coral";
  const headingText = isDark ? "text-off-white" : "text-charcoal";
  const subheadingText = isDark ? "text-foreground-muted" : "text-mid-grey";
  const cardBg = isDark
    ? "bg-background-elevated border-white/5 hover:border-coral/40 focus-within:border-coral/40"
    : "bg-white border-charcoal/8 hover:border-coral/50 focus-within:border-coral/50 shadow-sm hover:shadow-md";
  const cardProblemText = isDark
    ? "text-off-white group-hover:text-coral"
    : "text-charcoal group-hover:text-coral";
  const cardDescText = isDark ? "text-foreground-muted" : "text-mid-grey";
  const cardIconColor = isDark ? "text-coral/80" : "text-coral";
  const dotColor = isDark
    ? "var(--color-off-white)"
    : "var(--color-charcoal)";

  return (
    <section
      className={`relative overflow-hidden py-14 md:py-20 ${sectionBg} ${className}`}
    >
      {/* Subtle dotted texture matches PersonaRouter — only on dark variant */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p
            className={`font-heading text-xs sm:text-sm tracking-widest mb-3 ${eyebrowText}`}
          >
            {eyebrow}
          </p>
          <h2
            className={`font-heading ${headingText}`}
            style={{ fontSize: "var(--text-section)" }}
          >
            {heading}
          </h2>
          {subheading && (
            <p
              className={`mt-4 max-w-xl mx-auto leading-relaxed ${subheadingText}`}
            >
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {PATHS.map((p, i) => (
            <ScrollReveal
              key={p.href}
              direction="up"
              delay={(i % 4) * 0.06}
              eager={i < 4}
            >
              <Link
                href={p.href}
                data-track={`${source}_${p.track}`}
                className={`group relative flex flex-col h-full rounded-xl border p-4 sm:p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${cardBg}`}
              >
                <div
                  className={`mb-3 md:mb-4 transition-colors group-hover:text-coral ${cardIconColor}`}
                >
                  {ICONS[p.icon]}
                </div>
                <p
                  className={`font-heading text-base sm:text-lg md:text-xl leading-tight mb-2 transition-colors ${cardProblemText}`}
                >
                  &ldquo;{p.problem}&rdquo;
                </p>
                <p
                  className={`text-xs sm:text-sm leading-relaxed mb-4 flex-1 ${cardDescText}`}
                >
                  {p.description}
                </p>
                <span className="text-xs sm:text-sm font-body font-medium text-coral mt-auto">
                  {p.cta} <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
