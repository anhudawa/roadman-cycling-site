import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { FOR_THIS, NOT_FOR_THIS } from "./data";

export function WhoThisIsFor() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="default">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            QUALIFICATION
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)] max-w-[18ch]">
            Be honest with yourself.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-[60ch] text-lg text-foreground-muted leading-relaxed">
            This isn't a course for everyone. The riders who finish it and tell us it
            changed how they think about cycling have a few things in common. Read both
            lists. If the right column sounds like you, save your money.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2 rounded-sm overflow-hidden">
          <div className="bg-charcoal p-8 md:p-10">
            <p className="font-heading uppercase text-xs tracking-[0.3em] text-coral mb-5">
              THIS IS FOR YOU IF —
            </p>
            <ul className="space-y-5">
              {FOR_THIS.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="font-heading text-coral text-lg leading-none mt-0.5">
                    +
                  </span>
                  <p className="text-base text-off-white/90 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[color:var(--color-elevated)]/50 p-8 md:p-10">
            <p className="font-heading uppercase text-xs tracking-[0.3em] text-foreground-muted mb-5">
              SAVE YOUR MONEY IF —
            </p>
            <ul className="space-y-5">
              {NOT_FOR_THIS.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="font-heading text-foreground-muted text-lg leading-none mt-0.5">
                    —
                  </span>
                  <p className="text-base text-foreground-muted leading-relaxed">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
