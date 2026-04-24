import Link from "next/link";
import { ScrollReveal } from "@/components/ui";

/**
 * Persona router — 4 tiles that route visitors to the right entry point
 * based on where they are in their cycling journey.
 *
 * Mirrors Roadman's 4 audience personas:
 *   - Tom    → plateaued club racer                 (FTP focus)
 *   - Mark   → event-specific gran fondo achiever   (plans focus)
 *   - James  → comeback athlete                     (return-from-break focus)
 *   - Dave   → podcast loyalist, passive consumer   (podcast focus)
 *
 * Each tile uses the persona's dominant emotional trigger as the opener
 * ("I've stopped getting faster", "I'm training for...") rather than
 * generic category labels. The CTA lands on the piece of content that
 * resonates with that persona's current state.
 */

const personas = [
  {
    opener: "I've stopped getting faster.",
    detail:
      "Plateaued FTP, same results for months. Take the 3-question diagnostic — find out what's actually keeping you stuck.",
    cta: "Break the plateau",
    href: "/you/plateau",
    accent: "coral",
  },
  {
    opener: "I've got a target event.",
    detail:
      "A sportive, race, or fondo on the calendar. Find which phase you should be in right now — and the week's anchor session.",
    cta: "Build the plan",
    href: "/you/event",
    accent: "purple",
  },
  {
    opener: "I'm coming back.",
    detail:
      "Life got in the way. Injury, kids, work, a crash. Rebuild the engine without wasting months — the right way back.",
    cta: "Rebuild the engine",
    href: "/you/comeback",
    accent: "coral",
  },
  {
    opener: "I want to train like the pros.",
    detail:
      "You listen. You've absorbed the principles. The short path from here: the best conversations, the core concepts, what to do next.",
    cta: "Start here",
    href: "/you/listener",
    accent: "purple",
  },
] as const;

const accentStyles = {
  coral: {
    border: "hover:border-coral/40 focus:border-coral/40",
    ring: "group-hover:ring-coral/10",
    opener: "group-hover:text-coral",
    cta: "text-coral",
  },
  purple: {
    border: "hover:border-purple/40 focus:border-purple/40",
    ring: "group-hover:ring-purple/10",
    opener: "group-hover:text-[color:var(--color-purple-hover)]",
    cta: "text-[color:var(--color-purple-hover)]",
  },
} as const;

export function PersonaRouter() {
  return (
    <section className="bg-charcoal border-t border-white/5 py-14 md:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-off-white) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="font-heading text-coral text-xs sm:text-sm tracking-widest mb-3">
            WHERE ARE YOU RIGHT NOW?
          </p>
          <h2
            className="font-heading text-off-white"
            style={{ fontSize: "var(--text-section)" }}
          >
            FIND YOUR STARTING POINT.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p, i) => {
            const styles = accentStyles[p.accent];
            return (
              <ScrollReveal
                key={p.opener}
                direction="up"
                delay={i * 0.08}
                eager={i < 2}
              >
                {/* Tile body routes to the persona page. Secondary Apply
                    link below gives high-intent visitors a direct path to
                    /apply without the detour. Kept as a sibling so nested
                    <a> inside <a> is avoided. */}
                <div
                  className={`
                    group relative flex flex-col h-full
                    bg-background-elevated rounded-xl
                    border border-white/5 ${styles.border}
                    p-6 md:p-7
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]
                  `}
                >
                  <Link
                    href={p.href}
                    className="flex flex-col flex-1 focus:outline-none"
                  >
                    <p
                      className={`font-heading text-lg md:text-xl text-off-white leading-tight mb-3 transition-colors ${styles.opener}`}
                    >
                      &ldquo;{p.opener}&rdquo;
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed mb-6 flex-1">
                      {p.detail}
                    </p>
                    <span
                      className={`text-sm font-body font-medium ${styles.cta}`}
                    >
                      {p.cta} <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Link>
                  <Link
                    href="/apply"
                    className="mt-3 pt-3 border-t border-white/5 text-xs font-body text-coral/80 hover:text-coral transition-colors"
                  >
                    Or apply to join &rarr;
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
