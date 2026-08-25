import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,_rgba(76,18,115,0.45)_0%,_rgba(33,1,64,0.0)_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent"
      />

      <Container as="section" width="wide" className="pt-20 md:pt-32 pb-16 md:pb-24">
        <Reveal>
          <p className="font-heading text-xs md:text-sm tracking-[0.4em] text-coral mb-6">
            THE ROADMAN METHOD · A 12-WEEK COACHING SYSTEM
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-heading uppercase leading-[0.92] text-[clamp(2.75rem,9vw,8rem)] max-w-[18ch]">
            Build the system that
            <br />
            <span className="text-coral">breaks your plateau.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-8 max-w-[58ch] text-lg md:text-xl text-foreground-muted leading-relaxed">
            You&apos;re training hard. You&apos;re just not getting faster. The Roadman Method is the
            12-week system that fixes that — five pillars, built from 1,400+ podcast episodes
            with the coaches, scientists and pros who move the World Tour. Six hours a week.
            Lifetime access. Yours to keep.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center">
            <a
              href="#pricing"
              className="inline-flex justify-center font-heading uppercase tracking-wider text-base bg-coral text-charcoal hover:bg-coral-hover transition-all active:scale-[0.97] px-7 py-4 rounded-sm"
            >
              Enrol Now — $297
            </a>
            <a
              href="#what-you-get"
              className="inline-flex justify-center font-heading uppercase tracking-wider text-sm text-off-white hover:text-coral active:text-coral-hover transition-colors px-2 py-4"
            >
              See the 12 weeks →
            </a>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-[900px]">
            <Stat metric="100M+" label="podcast downloads" />
            <Stat metric="12" label="weekly modules" />
            <Stat metric="5" label="performance pillars" />
            <Stat metric="Lifetime" label="access, one payment" />
          </div>
        </Reveal>
      </Container>

      <Link
        href="/method/login"
        className="hidden md:block absolute bottom-6 right-6 text-xs font-heading uppercase tracking-[0.3em] text-foreground-muted hover:text-off-white transition-colors"
      >
        Already a member? Sign in →
      </Link>
    </section>
  );
}

function Stat({ metric, label }: { metric: string; label: string }) {
  return (
    <div className="border-l border-white/10 pl-4">
      <p className="font-heading text-3xl md:text-4xl text-off-white leading-none">{metric}</p>
      <p className="mt-2 text-xs md:text-sm text-foreground-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}
