import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";

export function WhatIfSection() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-deep-purple/40 via-charcoal to-charcoal"
        style={{
          background:
            "linear-gradient(180deg, rgba(33,1,64,0.55) 0%, rgba(37,37,38,1) 80%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <Container width="default">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            THE TURN
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5.5vw,5rem)] max-w-[22ch]">
            What if you had{" "}
            <span className="text-coral">the same system</span> the World Tour uses —
            scaled to your hours?
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-12 grid gap-12 md:grid-cols-3 max-w-[1100px]">
            <Outcome
              week="WEEKS 1–3"
              title="Clarity"
              body="The noise stops. You open your training app and you know exactly what today's session is for — and what it isn't. The two leaks costing you watts have names. You've stopped second-guessing every ride."
            />
            <Outcome
              week="WEEKS 4–9"
              title="Momentum"
              body="The numbers move. Not because you're riding more — because you're riding right. The climb you used to dread, you settle into. The group ride where you clung on at 90%, you sit in at 75%. The scale moves and the power holds."
            />
            <Outcome
              week="WEEKS 10–12"
              title="Ownership"
              body="You don't have a plan anymore. You have a system. Work blows up, you get sick, the week falls apart — and you adjust it yourself, calmly, because you understand why every piece is there. You've become the coach you were paying to look for."
            />
          </div>
        </Reveal>

        <Reveal delay={280}>
          <blockquote className="mt-20 border-l-2 border-coral pl-6 md:pl-10 max-w-[65ch]">
            <p className="font-heading uppercase text-2xl md:text-3xl leading-tight text-off-white">
              &ldquo;Doing things right involves training in an ordinary way with great
              consistency — and amazingly, that prepares us for extraordinary
              performances.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-foreground-muted">
              <span className="text-coral">—</span> Professor Stephen Seiler, on the
              Roadman Cycling Podcast
            </footer>
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}

function Outcome({ week, title, body }: { week: string; title: string; body: string }) {
  return (
    <div>
      <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">{week}</p>
      <h3 className="font-heading uppercase text-3xl md:text-4xl text-off-white mb-4">
        {title}
      </h3>
      <p className="text-base text-foreground-muted leading-relaxed">{body}</p>
    </div>
  );
}
