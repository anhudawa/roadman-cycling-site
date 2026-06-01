import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { EXPERTS, METHOD_TESTIMONIALS, TRUSTPILOT } from "./data";

export function SocialProof() {
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container width="wide">
        <div className="mb-16 max-w-[820px]">
          <Reveal>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
              THE WORK BEHIND THE WORK
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)]">
              Built on the conversations
              <br />
              <span className="text-coral">most coaches never get.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 text-lg text-foreground-muted leading-relaxed">
              The Roadman Cycling Podcast has crossed 100 million downloads. Across 1,400+
              long-form episodes, Anthony has put the people who actually move performance
              forward — World Tour coaches, sports scientists, pros — on record. Every
              module in this course is built from those conversations.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3 rounded-sm overflow-hidden mb-24">
          {EXPERTS.map((expert, i) => (
            <Reveal
              key={expert.name}
              delay={50 * i}
              as="li"
              className="bg-charcoal p-7 md:p-8"
            >
              <p className="font-heading uppercase text-xl text-off-white mb-3 leading-tight">
                {expert.name}
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {expert.credit}
              </p>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
            FROM THE COMMUNITY
          </p>
          <h3 className="font-heading uppercase text-3xl md:text-4xl text-off-white mb-6 max-w-[24ch]">
            Real results, the same system.
          </h3>
        </Reveal>

        <Reveal delay={60}>
          <a
            href={TRUSTPILOT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-12 text-sm text-foreground-muted hover:text-off-white transition-colors"
          >
            <span className="font-heading uppercase tracking-[0.2em] text-coral">
              ★ {TRUSTPILOT.score.toFixed(1)} on Trustpilot
            </span>
            <span>
              from {TRUSTPILOT.reviewCount} verified reviews — the quotes below
              are from real members.
            </span>
          </a>
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-3">
          {METHOD_TESTIMONIALS.map((result, i) => (
            <Reveal
              key={result.member}
              delay={80 * i}
              as="li"
              className="rounded-sm border border-white/10 bg-[color:var(--color-elevated)]/40 p-8"
            >
              <p className="font-heading uppercase text-2xl md:text-3xl text-coral leading-tight mb-4">
                {result.headline}
              </p>
              <p className="text-base text-off-white/90 leading-relaxed mb-6">
                {result.body}
              </p>
              <p className="text-xs font-heading uppercase tracking-[0.3em] text-foreground-muted">
                — {result.member}
              </p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200}>
          <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80">
            <Logo>100M+ downloads</Logo>
            <Divider />
            <Logo>61K YouTube subscribers</Logo>
            <Divider />
            <Logo>113 paid community members</Logo>
            <Divider />
            <Logo>27,000+ on the email list</Logo>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Logo({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading uppercase tracking-[0.2em] text-xs md:text-sm text-foreground-muted">
      {children}
    </p>
  );
}
function Divider() {
  return <span aria-hidden className="hidden md:block w-px h-4 bg-white/15" />;
}
