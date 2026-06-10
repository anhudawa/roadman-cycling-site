import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { PILLARS } from "./data";
import { PILLAR_STYLES } from "./pillarStyles";

export function MethodOverview() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="wide">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20 md:items-end mb-20">
          <Reveal>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
              THE METHOD
            </p>
            <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)]">
              Five pillars.
              <br />
              Twelve weeks.
              <br />
              <span className="text-coral">One system.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-lg text-foreground-muted leading-relaxed max-w-[55ch]">
              Most training programmes give you a calendar of workouts. That&apos;s not a
              system — that&apos;s a queue. The Roadman Method is built on the principle that
              every pillar interacts with the others. Train without recovering and you
              stagnate. Recover without fuelling and you go backwards. Lift without
              periodising and you arrive at your event broken.
              <br />
              <br />
              We address all five. In sequence. In the order that builds on what came
              before.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-5 rounded-sm overflow-hidden">
          {PILLARS.map((pillar, i) => {
            const style = PILLAR_STYLES[pillar.id];
            return (
              <Reveal
                key={pillar.id}
                delay={80 * i}
                as="li"
                className={`group relative bg-charcoal p-8 md:p-10 hover:bg-[color:var(--color-elevated)] transition-colors`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${style.bg}`}>
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: `var(${style.cssVar})` }}
                  />
                </div>
                <p className={`font-heading text-xs tracking-[0.3em] ${style.text} mb-3`}>
                  PILLAR {pillar.number}
                </p>
                <h3 className="font-heading uppercase text-2xl md:text-3xl text-off-white mb-4 leading-tight">
                  {pillar.name}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6">
                  {pillar.blurb}
                </p>
                <p className="text-xs font-heading uppercase tracking-wider text-foreground-muted">
                  Weeks {pillar.weeks.join(" · ")}
                </p>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={200}>
          <p className="mt-16 max-w-[60ch] text-base text-foreground-muted leading-relaxed">
            Each pillar appears at least twice across the 12 weeks. The first pass builds
            the foundation. The second pass goes deeper at a higher level. By Week 12 you
            haven&apos;t just learned the components — you&apos;ve practised the integration.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
