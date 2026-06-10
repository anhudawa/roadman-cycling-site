import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { GUARANTEE } from "./data";

export function Guarantee() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(241,99,99,0.12) 0%, rgba(37,37,38,0) 60%)",
        }}
      />
      <Container width="default">
        <div className="mx-auto max-w-[900px] rounded-sm border border-coral/30 bg-[color:var(--color-elevated)]/40 p-8 md:p-14">
          <Reveal>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-6">
              {GUARANTEE.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-heading uppercase leading-[1.02] text-[clamp(1.75rem,4.2vw,3.5rem)] max-w-[22ch]">
              {GUARANTEE.heading}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-8 max-w-[68ch] text-lg text-off-white/90 leading-relaxed">
              {GUARANTEE.body}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 font-heading uppercase tracking-wider text-coral text-lg">
              {GUARANTEE.signoff}
              <br />
              <span className="text-off-white/80 text-sm tracking-[0.3em]">
                {GUARANTEE.signature}
              </span>
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
