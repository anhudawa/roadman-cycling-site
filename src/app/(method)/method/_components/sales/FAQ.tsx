import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { FAQ as FAQ_DATA } from "./data";

export function FAQ() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="default">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            COMMON QUESTIONS
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)] mb-16 max-w-[20ch]">
            Things you'd ask if we were on the phone.
          </h2>
        </Reveal>

        <ul className="grid gap-px bg-white/10 rounded-sm overflow-hidden">
          {FAQ_DATA.map((item, i) => (
            <Reveal key={item.q} delay={40 * i} as="li" className="bg-charcoal">
              <details className="group p-6 md:p-8">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                  <h3 className="font-heading uppercase text-lg md:text-xl text-off-white leading-snug">
                    {item.q}
                  </h3>
                  <span
                    aria-hidden
                    className="font-heading text-coral text-2xl leading-none mt-0.5 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-base text-foreground-muted leading-relaxed max-w-[70ch]">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
