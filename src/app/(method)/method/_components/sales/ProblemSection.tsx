import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";

const SYMPTOMS = [
  {
    headline: "Your FTP hasn't moved in months.",
    body:
      "You've tested. And re-tested. The number sits there, immovable, while you keep doing the work that used to make it climb.",
  },
  {
    headline: "Every podcast says something different.",
    body:
      "Polarised. Sweet spot. Pyramidal. High-volume, low-volume, fasted rides, double thresholds. You've read it all and you're more confused than when you started.",
  },
  {
    headline: "Group rides feel harder than they should.",
    body:
      "You're holding the wheel. You're staying with it. But you're working at 90% to do what others do at 75%, and it's getting old.",
  },
  {
    headline: "You feel guilty about rest days.",
    body:
      "So you fill them with 'easy' rides that aren't easy enough. Then wonder why the hard sessions don't go anywhere.",
  },
  {
    headline: "You know you should lift weights.",
    body:
      "Everyone says so. You don't know what to do, when to do it, or how to fit it in without destroying tomorrow's session. So you don't.",
  },
  {
    headline: "You're information-rich and system-poor.",
    body:
      "You've consumed more training content than most coaches have read. You don't have a system. You have a folder of saved tweets.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="default">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            THE PROBLEM
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)] max-w-[20ch]">
            You've done the hours.
            <br />
            <span className="text-foreground-muted">The hours stopped working.</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-8 max-w-[60ch] text-lg text-foreground-muted leading-relaxed">
            This is the quiet shame of the serious amateur. You're doing more than most.
            You care about it more than your friends understand. And the bike has stopped
            paying you back. If any of the below sounds like the inside of your head right
            now — you're in the right place.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
          {SYMPTOMS.map((symptom, i) => (
            <Reveal key={symptom.headline} delay={80 * i} as="li" className="bg-charcoal p-8 md:p-10">
              <p className="font-heading uppercase text-xl md:text-2xl leading-tight text-off-white mb-3">
                {symptom.headline}
              </p>
              <p className="text-base text-foreground-muted leading-relaxed">{symptom.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
