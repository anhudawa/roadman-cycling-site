import { Container, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { labelFor } from "@/lib/diagnostic/profiles";
import type { StoredSubmission } from "@/lib/diagnostic/store";
import { firstNameFromEmail } from "./firstNameFromEmail";

const SKOOL_BASE = "https://www.skool.com/roadmancycling/about";

function skoolUrlFor(profile: StoredSubmission["primaryProfile"]): string {
  const params = new URLSearchParams({
    utm_source: "diagnostic",
    utm_medium: "apply",
    utm_campaign: profile,
  });
  return `${SKOOL_BASE}?${params.toString()}`;
}

interface SummaryTileProps {
  label: string;
  value: string;
}

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-xl border border-coral/20 bg-white/[0.03] p-5 text-left">
      <p className="font-heading text-coral text-xs tracking-widest mb-2">
        {label.toUpperCase()}
      </p>
      <p className="text-off-white text-base leading-snug">{value}</p>
    </div>
  );
}

export function PersonalisedDiagnosticBlock({
  submission,
}: {
  submission: StoredSubmission;
}) {
  const firstName = firstNameFromEmail(submission.email);
  const profileLabel = labelFor(
    submission.primaryProfile,
    submission.closeToBreakthrough
  );
  const goal = submission.answers.goal?.trim() || null;
  const hours = submission.answers.hoursPerWeek;
  const ctaHref = skoolUrlFor(submission.primaryProfile);

  return (
    <Section
      background="deep-purple"
      grain
      className="pt-32 pb-16 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-coral/5 blur-[120px] pointer-events-none" />

      <Container width="narrow" className="relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 border border-coral/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
              <span className="text-coral text-sm font-medium tracking-wide">
                YOUR DIAGNOSTIC RESULT
              </span>
            </div>

            <h1
              className="font-heading text-off-white leading-[0.95]"
              style={{ fontSize: "clamp(2.25rem, 6vw, 4.25rem)" }}
            >
              BASED ON YOUR DIAGNOSTIC,
              <br />
              HERE&apos;S YOUR RECOMMENDED PATH
            </h1>

            <p className="text-foreground-muted text-lg md:text-xl mt-6 max-w-xl mx-auto">
              Hi {firstName} — you came back as{" "}
              <span className="text-coral font-semibold">{profileLabel}</span>.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <SummaryTile label="Your profile" value={profileLabel} />
            {goal && <SummaryTile label="Your goal" value={goal} />}
            <SummaryTile label="Training hours" value={`${hours} hrs/wk`} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mt-12 text-center">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-coral text-off-white font-heading text-lg tracking-wider hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
            >
              START YOUR 7-DAY FREE TRIAL →
            </a>
            <p className="text-foreground-subtle text-sm mt-4">
              $195/month after trial · cancel anytime · 113 riders inside
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
