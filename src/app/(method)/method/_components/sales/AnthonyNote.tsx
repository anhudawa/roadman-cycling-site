import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";

export function AnthonyNote() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="narrow">
        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            A NOTE FROM ANTHONY
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-heading uppercase leading-[1.05] text-[clamp(1.75rem,4vw,3.5rem)] mb-10">
            Why I built this.
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <div className="space-y-6 text-lg text-off-white/90 leading-relaxed">
            <p>
              I started the podcast because I had questions nobody was answering properly.
              How do real World Tour coaches actually build a season? What does Pogačar's
              week look like? Why does my FTP plateau when my mate's keeps climbing on
              less volume?
            </p>

            <p>
              Three hundred episodes in, I had answers. Better than answers — I had
              patterns. The same principles came back again and again, from completely
              different parts of the sport. Seiler on intensity distribution. Lorang on
              consistency. Dunne on fuelling. Wakefield on torque. Every conversation,
              another piece of the same puzzle.
            </p>

            <p>
              The problem was — that's a lot of podcasts. Hundreds of hours. And serious
              amateur cyclists, the people who actually want to get faster, don't have
              hundreds of hours. They have jobs and families and a Saturday morning.
            </p>

            <p>
              The Roadman Method is what happens when you take everything I've learned
              from those conversations, throw away the fluff, and build it into a 12-week
              system that respects the fact you have a life. It's the course I wish
              someone had handed me when I was stuck at 86 kilos and a flat FTP, doing
              the same week over and over and wondering what I was missing.
            </p>

            <p>
              You're not done yet. Neither am I. Let's go.
            </p>

            <p className="pt-4 font-heading uppercase tracking-wider text-coral">
              — Anthony Walsh
              <br />
              <span className="text-foreground-muted text-sm tracking-[0.3em]">
                Host, Roadman Cycling Podcast
              </span>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
