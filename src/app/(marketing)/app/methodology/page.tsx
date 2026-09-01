import type { Metadata } from "next";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { Card } from "@/components/ui";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { ROADMAN_APP_DECISION_POLICY } from "@/data/app-methodology";
import { ENTITY_IDS } from "@/lib/brand-facts";

const POLICY = ROADMAN_APP_DECISION_POLICY;

export const metadata: Metadata = {
  title: { absolute: "Cycling App Readiness & Strength Methodology | Roadman" },
  description:
    "See how Roadman's cycling strength and recovery app will place gym work, apply readiness guardrails, protect key rides and explain every change.",
  alternates: { canonical: POLICY.canonicalUrl },
  openGraph: {
    title: "Roadman App Decision Methodology",
    description:
      "The public rules, inputs, evidence limits and safety boundaries behind Roadman's cycling strength and recovery app.",
    type: "article",
    url: POLICY.canonicalUrl,
    siteName: "Roadman Cycling",
  },
};

export default function AppMethodologyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${POLICY.canonicalUrl}#webpage`,
              url: POLICY.canonicalUrl,
              name: "Roadman app readiness and strength methodology",
              description: metadata.description,
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software` },
              dateModified: POLICY.updatedDate,
              mainEntity: { "@id": `${POLICY.canonicalUrl}#methodology` },
            },
            {
              "@type": "TechArticle",
              "@id": `${POLICY.canonicalUrl}#methodology`,
              headline: "How the Roadman cycling app makes training decisions",
              description: POLICY.answer,
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              datePublished: POLICY.updatedDate,
              dateModified: POLICY.updatedDate,
              proficiencyLevel: "Intermediate",
              about: [
                "Cycling strength training",
                "Training readiness",
                "Cycling recovery",
                "Concurrent training",
              ],
              citation: POLICY.sources.map((source) => source.href),
            },
          ],
        }}
      />
      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16 md:pt-40">
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.22em] text-coral">
              PUBLIC DECISION POLICY · {POLICY.version.toUpperCase()}
            </p>
            <h1
              className="mt-5 font-heading leading-[0.95] text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              HOW THE ROADMAN APP
              <span className="block text-coral">MAKES A TRAINING DECISION.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-foreground-muted md:text-xl">
              This is the public contract behind Roadman&apos;s upcoming cycling
              strength and recovery app: what can change a session, what cannot,
              and where the system must stop.
            </p>
            <div className="mt-8 rounded-2xl border border-coral/25 bg-coral/[0.08] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                The short answer
              </p>
              <p className="mt-3 text-lg leading-relaxed text-off-white">
                {POLICY.answer}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link className="text-coral hover:text-coral/80" href="/app">
                App early access →
              </Link>
              <a
                className="text-foreground-muted hover:text-coral"
                href={ROADMAN_APP_PRODUCT.feedUrl}
              >
                Machine-readable product record →
              </a>
              <Link className="text-foreground-muted hover:text-coral" href="/app/testing">
                Public testing standard →
              </Link>
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container width="narrow">
            <div className="grid gap-4 sm:grid-cols-3">
              <PolicyFact label="Policy version" value={POLICY.version} />
              <PolicyFact label="Status" value="Prelaunch public draft" />
              <PolicyFact label="Last reviewed" value={POLICY.updatedDate} />
            </div>

            <div className="mt-16">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE DECISION SEQUENCE
              </p>
              <h2
                className="mt-3 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUR STAGES. ONE VISIBLE REASON.
              </h2>
              <div className="mt-8 space-y-4">
                {POLICY.stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="grid gap-4 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm md:grid-cols-[64px_1fr_1fr]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-deep-purple font-heading text-lg text-coral">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl text-charcoal">
                        {stage.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
                        <strong className="text-charcoal">Inputs: </strong>
                        {stage.inputs}
                      </p>
                    </div>
                    <div className="rounded-xl bg-deep-purple/[0.06] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-coral">
                        Permitted output
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                        {stage.output}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple">
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.2em] text-coral">
              NON-NEGOTIABLE GUARDRAILS
            </p>
            <h2
              className="mt-3 font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              WHAT THE SYSTEM IS NOT ALLOWED TO DO.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {POLICY.invariantRules.map((rule, index) => (
                <Card key={rule} className="h-full p-6" hoverable={false}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-coral">
                    RULE {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 leading-relaxed text-off-white">{rule}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.2em] text-coral">
              INPUT BOUNDARIES
            </p>
            <h2
              className="mt-3 font-heading text-charcoal"
              style={{ fontSize: "var(--text-section)" }}
            >
              CONTEXT IS NOT A DIAGNOSIS.
            </h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-charcoal/10 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-deep-purple text-off-white">
                  <tr>
                    <th className="px-5 py-4 font-heading tracking-wider">Input</th>
                    <th className="px-5 py-4 font-heading tracking-wider">May support</th>
                    <th className="px-5 py-4 font-heading tracking-wider">Cannot establish</th>
                  </tr>
                </thead>
                <tbody>
                  {POLICY.inputBoundaries.map((row) => (
                    <tr key={row.input} className="border-t border-charcoal/10 align-top">
                      <th className="px-5 py-4 font-semibold text-charcoal">{row.input}</th>
                      <td className="px-5 py-4 leading-relaxed text-charcoal/70">{row.maySupport}</td>
                      <td className="px-5 py-4 leading-relaxed text-charcoal/70">{row.cannotEstablish}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  EVIDENCE BOUNDARY
                </p>
                <h2
                  className="mt-3 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RESEARCH INFORMS THE RULES. IT DOES NOT VALIDATE THIS APP.
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  Strength-training trials, athlete-monitoring reviews and
                  consensus statements inform the cautious direction of the
                  system. They do not prove that this exact policy predicts
                  readiness, prevents injury or improves an individual rider.
                </p>
                <p className="mt-4 leading-relaxed text-foreground-muted">
                  Before launch, Roadman will describe product testing separately
                  from published sport-science evidence. A usability result is not
                  a performance result, and neither becomes a medical claim.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-coral">
                  Change log
                </p>
                <h3 className="mt-3 font-heading text-2xl text-off-white">
                  {POLICY.version} · initial public contract
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  Published the four-stage decision sequence, training ceiling,
                  non-diagnostic input boundaries, protected external plan and
                  visible-reason requirement. Thresholds remain under prelaunch
                  testing and are not represented here as validated cut-offs.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MethodLink href="/app/testing" label="See the testing standard" />
              <MethodLink href="/tools/strength-session-planner" label="Preview strength placement" />
              <MethodLink href="/tools/training-readiness" label="Use the readiness check" />
              <MethodLink href="/blog/cycling-strength-training-guide" label="Read the strength evidence" />
              <MethodLink href="/blog/daily-training-readiness-check-cycling-guide" label="Read the readiness limits" />
            </div>

            <EvidenceBlock
              reviewedSources={POLICY.sources}
              lastReviewed={POLICY.updatedDate}
              reviewedBy={POLICY.reviewedBy}
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

function PolicyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">{label}</p>
      <p className="mt-2 font-heading text-xl text-charcoal">{value}</p>
    </div>
  );
}

function MethodLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-foreground-muted transition-colors hover:border-coral/40 hover:text-coral"
    >
      {label} →
    </Link>
  );
}
