import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { MARKERS, type MarkerRange } from "@/lib/blood-engine/markers";
import { MedicalDisclaimer } from "../MedicalDisclaimer";

export const metadata: Metadata = {
  title: "The Cyclist's Blood Marker Reference — 17 markers, athlete-optimal ranges",
  description:
    "What 17 blood markers actually mean for a masters cyclist — and the athlete-optimal ranges that matter, not the standard lab ranges your GP reads from.",
  alternates: { canonical: "https://roadmancycling.com/blood-engine/markers" },
};

function fmtRange(r: MarkerRange): string {
  if (r.low !== null && r.high !== null) return `${r.low}–${r.high}`;
  if (r.low !== null) return `>${r.low}`;
  if (r.high !== null) return `<${r.high}`;
  return "—";
}

export default function MarkersReferencePage() {
  return (
    <>
      <Section background="deep-purple">
        <Container width="narrow">
          <p className="font-heading tracking-[0.3em] text-coral text-sm mb-4">
            Reference
          </p>
          <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-6">
            The 17-marker panel
          </h1>
          <p className="text-body-lg text-foreground-muted mb-4">
            These are the markers Blood Engine reads. The athlete-optimal
            ranges below are tuned for masters endurance athletes — not the
            general-population numbers your clinic prints at the bottom of the
            page.
          </p>
          <p className="text-body-lg text-foreground-muted">
            Sources: Stanford FASTR, Gatorade Sports Science Institute, Athlete
            Blood Test, sports medicine literature. We&apos;re iterating these with
            sports medicine doctors before launch — bring any panel from any
            provider and Blood Engine will read it through this lens.
          </p>
        </Container>
      </Section>

      <Section background="charcoal">
        <Container>
          <div className="grid md:grid-cols-2 gap-5">
            {MARKERS.map((m) => (
              <article
                key={m.id}
                className="rounded-lg border border-white/10 bg-background-elevated p-6"
              >
                <header className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="font-heading uppercase text-off-white text-2xl leading-tight">
                    {m.displayName}
                  </h2>
                  <span className="text-xs font-heading uppercase tracking-wider text-foreground-subtle whitespace-nowrap mt-1">
                    {m.canonicalUnit}
                  </span>
                </header>

                <p className="text-foreground-muted mb-4">{m.cyclingContext}</p>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-charcoal/50 px-3 py-2">
                    <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                      Standard lab
                    </dt>
                    <dd className="text-foreground-muted">{m.standardLabRange}</dd>
                  </div>
                  <div className="rounded-md bg-coral-muted px-3 py-2 border border-coral/30">
                    <dt className="text-[10px] font-heading uppercase tracking-wider text-coral mb-1">
                      Athlete-optimal (M)
                    </dt>
                    <dd className="text-off-white tabular-nums">
                      {fmtRange(m.optimal.m)} {m.canonicalUnit}
                    </dd>
                  </div>
                  <div className="rounded-md bg-charcoal/50 px-3 py-2">
                    <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                      Accepted units
                    </dt>
                    <dd className="text-foreground-muted">
                      {m.allowedUnits.join(", ")}
                    </dd>
                  </div>
                  <div className="rounded-md bg-coral-muted/50 px-3 py-2 border border-coral/20">
                    <dt className="text-[10px] font-heading uppercase tracking-wider text-coral/80 mb-1">
                      Athlete-optimal (F)
                    </dt>
                    <dd className="text-off-white tabular-nums">
                      {fmtRange(m.optimal.f)} {m.canonicalUnit}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="deep-purple">
        <Container width="narrow" className="text-center">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-6">
            Run a panel through the engine
          </h2>
          <p className="text-body-lg text-foreground-muted mb-8">
            Bring any blood test, get cycling-specific interpretation back.
            €97 lifetime access — every retest decoded forever.
          </p>
          <Button href="/blood-engine" size="lg">
            How Blood Engine works →
          </Button>
          <p className="mt-4 text-sm text-foreground-subtle">
            Already a member?{" "}
            <Link href="/blood-engine/dashboard" className="text-coral hover:underline">
              Open your dashboard
            </Link>
            .
          </p>
        </Container>
      </Section>

      <Section background="charcoal">
        <Container width="narrow">
          <MedicalDisclaimer variant="muted" />
        </Container>
      </Section>
    </>
  );
}
