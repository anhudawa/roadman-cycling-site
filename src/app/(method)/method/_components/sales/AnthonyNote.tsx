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
              I&apos;ll be honest with you. I started the podcast because I was stuck and a
              bit embarrassed about it. Eighty-six kilos. A flat FTP. Riding the same
              week over and over, telling everyone I was training, quietly wondering what
              everyone else knew that I didn&apos;t.
            </p>

            <p>
              So I started asking. How does a real World Tour coach build a season? Why
              does my FTP sit there while my mate&apos;s climbs on half the volume? I got the
              people who actually know in a room and I asked them the questions I was too
              proud to ask out loud.
            </p>

            <p>
              Three hundred episodes in, I had answers. Better than answers — patterns.
              The same principles kept coming back from completely different corners of the
              sport. Seiler on intensity distribution. Lorang on consistency. Dunne on
              fuelling. Wakefield on torque. Every conversation, another piece of the same
              puzzle clicking into place.
            </p>

            <p>
              And here&apos;s the thing that bothered me. That&apos;s hundreds of hours of podcast.
              The riders who most need it — the ones with a job, a family, a Saturday
              morning and a real desire to get faster — are the ones who can&apos;t sit through
              it. The answers existed. They were just buried.
            </p>

            <p>
              The Roadman Method is me digging them out. Everything I&apos;ve learned from those
              conversations, the fluff thrown away, built into twelve weeks that respect the
              fact you have a life. It&apos;s the course I wish someone had handed me at 86 kilos
              and a flat FTP — instead of another plan that ignored everything except the bike.
            </p>

            <p>
              You&apos;re not done yet. Neither am I. Let&apos;s go.
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
