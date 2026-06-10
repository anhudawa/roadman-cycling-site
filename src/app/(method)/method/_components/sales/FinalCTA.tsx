import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden border-t border-white/5">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(76,18,115,0.55) 0%, rgba(33,1,64,0.0) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent"
      />

      <Container width="default" className="text-center">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.4em] text-coral mb-6">
            NOT DONE YET
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[0.92] text-[clamp(2.5rem,8vw,7rem)] max-w-[16ch] mx-auto">
            Stop guessing.
            <br />
            <span className="text-coral">Start riding</span>
            <br />
            with a system.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-[55ch] mx-auto text-lg md:text-xl text-foreground-muted leading-relaxed">
            Twelve weeks from now, you can be in the exact same place — same FTP, same
            questions, same folder of saved tweets, same week on repeat. Or you can be on the
            other side of a system that took 1,400+ conversations to build. The twelve weeks
            pass either way.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-[48ch] mx-auto font-heading uppercase text-base md:text-lg text-off-white leading-snug">
            If you&apos;re still reading this far down, you already know it&apos;s for you.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link
              href="/method/checkout?tier=standard"
              className="inline-flex justify-center font-heading uppercase tracking-wider text-base bg-coral text-charcoal hover:bg-coral-hover transition-colors px-8 py-4 rounded-sm w-full sm:w-auto"
            >
              Enrol Now — $297
            </Link>
            <Link
              href="/method/checkout?tier=premium"
              className="inline-flex justify-center font-heading uppercase tracking-wider text-base border border-white/20 text-off-white hover:border-coral hover:text-coral transition-colors px-8 py-4 rounded-sm w-full sm:w-auto"
            >
              Premium — $397
            </Link>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-8 text-sm text-foreground-muted">
            Lifetime access · 30-day refund · Open immediately
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
