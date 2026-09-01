import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { Card } from "@/components/ui";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { ROADMAN_APP_TESTING_STANDARD } from "@/data/app-testing-standard";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const STANDARD = ROADMAN_APP_TESTING_STANDARD;

export const metadata: Metadata = {
  title: { absolute: "How Roadman Will Test Its Cycling Training App" },
  description:
    "Roadman's public testing standard for its cycling strength and recovery app: beta stages, metrics, denominators, claim boundaries and reporting rules.",
  alternates: { canonical: STANDARD.canonicalUrl },
  openGraph: {
    title: "How Roadman Will Test Its Cycling Training App",
    description:
      "The public prelaunch protocol separating app usability, adherence, decision agreement and evidence of effectiveness.",
    type: "article",
    url: STANDARD.canonicalUrl,
    siteName: "Roadman Cycling",
  },
};

export default function AppTestingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${STANDARD.canonicalUrl}#webpage`,
              url: STANDARD.canonicalUrl,
              name: "Roadman cycling app testing standard",
              description: metadata.description,
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software` },
              dateModified: STANDARD.updatedDate,
              mainEntity: { "@id": `${STANDARD.canonicalUrl}#protocol` },
            },
            {
              "@type": "TechArticle",
              "@id": `${STANDARD.canonicalUrl}#protocol`,
              headline: "How Roadman will test its cycling training app",
              description: STANDARD.answer,
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              datePublished: STANDARD.updatedDate,
              dateModified: STANDARD.updatedDate,
              proficiencyLevel: "Intermediate",
              about: [
                "Cycling training app testing",
                "Cycling strength app evidence",
                "Training readiness app validation",
                "Digital product evaluation",
              ],
              citation: STANDARD.sources.map((source) => source.href),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_ORIGIN,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Cycling strength and recovery app",
                  item: ROADMAN_APP_PRODUCT.canonicalUrl,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Testing standard",
                  item: STANDARD.canonicalUrl,
                },
              ],
            },
          ],
        }}
      />
      <Header />

      <main id="main-content">
        <Section
          background="deep-purple"
          grain
          className="pt-32 pb-16 md:pt-40"
        >
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.22em] text-coral">
              PUBLIC TESTING STANDARD · {STANDARD.version.toUpperCase()}
            </p>
            <h1
              className="mt-5 font-heading leading-[0.95] text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              HOW ROADMAN WILL TEST
              <span className="block text-coral">THE CYCLING APP.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-foreground-muted md:text-xl">
              A beta can show that riders used a product. It cannot, by itself,
              prove that the product improved performance. This is the public
              protocol Roadman will use to keep those claims separate.
            </p>
            <div className="mt-8 rounded-2xl border border-coral/25 bg-coral/[0.08] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                The short answer
              </p>
              <p className="mt-3 text-lg leading-relaxed text-off-white">
                {STANDARD.answer}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link className="text-coral hover:text-coral/80" href="/app">
                App early access →
              </Link>
              <Link
                className="text-foreground-muted hover:text-coral"
                href="/app/methodology"
              >
                Read the decision methodology →
              </Link>
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container width="narrow">
            <div className="grid gap-4 sm:grid-cols-3">
              <ProtocolFact label="Protocol version" value={STANDARD.version} />
              <ProtocolFact label="Status" value="Public prelaunch protocol" />
              <ProtocolFact
                label="Last reviewed"
                value={STANDARD.updatedDate}
              />
            </div>

            <div className="mt-12 rounded-2xl border border-amber-400/35 bg-amber-50 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Current evidence state
              </p>
              <h2 className="mt-3 font-heading text-3xl text-charcoal">
                {STANDARD.currentClaimState.label}
              </h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-charcoal/70">
                {STANDARD.currentClaimState.detail}
              </p>
            </div>

            <div className="mt-16">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE CLAIM LADDER
              </p>
              <h2
                className="mt-3 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIVE PHASES. NO SKIPPED STEPS.
              </h2>
              <p className="mt-5 max-w-3xl leading-relaxed text-charcoal/70">
                Each phase answers a different question. Passing an earlier
                phase permits only its narrow claim; it does not borrow the
                language of a later effectiveness study.
              </p>
              <div className="mt-8 space-y-5">
                {STANDARD.phases.map((phase) => (
                  <article
                    key={phase.id}
                    className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm md:p-8"
                  >
                    <div className="grid gap-6 lg:grid-cols-[76px_1fr]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-deep-purple font-heading text-xl text-coral">
                        {phase.stage}
                      </div>
                      <div>
                        <h3 className="font-heading text-3xl text-charcoal">
                          {phase.title}
                        </h3>
                        <p className="mt-2 text-lg font-semibold text-coral">
                          {phase.question}
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <PhaseDetail label="Method" value={phase.method} />
                          <PhaseDetail
                            label="Roadman will publish"
                            value={phase.publish}
                          />
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <ClaimBox
                            tone="allowed"
                            label="Claim this phase may support"
                          >
                            {phase.claimAllowed}
                          </ClaimBox>
                          <ClaimBox
                            tone="blocked"
                            label="Claim this phase cannot support"
                          >
                            {phase.claimNotAllowed}
                          </ClaimBox>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple">
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.2em] text-coral">
              THE MEASUREMENT DICTIONARY
            </p>
            <h2
              className="mt-3 font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              DEFINE THE NUMBER BEFORE REPORTING IT.
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-foreground-muted">
              Roadman will publish raw counts and denominators with every rate.
              “Completed” will never quietly mean “opened,” and people lost to
              follow-up will not disappear from the account.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {STANDARD.measures.map((measure) => (
                <Card
                  key={measure.name}
                  className="h-full p-6"
                  hoverable={false}
                >
                  <h3 className="font-heading text-2xl text-off-white">
                    {measure.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-foreground-muted">
                    {measure.definition}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container width="narrow">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  REPORTING CONTRACT
                </p>
                <h2
                  className="mt-3 font-heading text-charcoal"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHAT WE WILL SHOW EVEN WHEN THE RESULT IS MESSY.
                </h2>
                <p className="mt-5 leading-relaxed text-charcoal/70">
                  The tested product version matters. So do missing data,
                  drop-outs, overrides and results that do not favour Roadman.
                  Those details are part of the result, not footnotes to hide.
                </p>
              </div>
              <ol className="space-y-3">
                {STANDARD.reportingCommitments.map((commitment, index) => (
                  <li
                    key={commitment}
                    className="grid grid-cols-[40px_1fr] gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm"
                  >
                    <span className="font-heading text-xl text-coral">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed text-charcoal/75">
                      {commitment}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="max-w-3xl">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                HOW TO READ THE SOURCES
              </p>
              <h2
                className="mt-3 font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                REPORTING GUIDANCE IS NOT PRODUCT VALIDATION.
              </h2>
              <p className="mt-5 leading-relaxed text-foreground-muted">
                These frameworks inform what Roadman should define and disclose.
                Referencing them does not certify the app, make it a medical
                device or prove the quality of a future study. Any result will
                still stand or fall on its design, execution and data.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <MethodLink
                href="/app/methodology"
                label="Decision methodology"
              />
              <MethodLink
                href="/tools/strength-session-planner"
                label="Strength-session preview"
              />
              <MethodLink
                href="/tools/training-readiness"
                label="Readiness-check preview"
              />
            </div>

            <EvidenceBlock
              reviewedSources={STANDARD.sources}
              lastReviewed={STANDARD.updatedDate}
              reviewedBy={STANDARD.reviewedBy}
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

function ProtocolFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
        {label}
      </p>
      <p className="mt-2 font-heading text-xl text-charcoal">{value}</p>
    </div>
  );
}

function PhaseDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-deep-purple/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-coral">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{value}</p>
    </div>
  );
}

function ClaimBox({
  children,
  label,
  tone,
}: {
  children: ReactNode;
  label: string;
  tone: "allowed" | "blocked";
}) {
  return (
    <div
      className={
        tone === "allowed"
          ? "rounded-xl border border-emerald-700/20 bg-emerald-50 p-4"
          : "rounded-xl border border-red-700/20 bg-red-50 p-4"
      }
    >
      <p
        className={
          tone === "allowed"
            ? "text-xs font-semibold uppercase tracking-wider text-emerald-800"
            : "text-xs font-semibold uppercase tracking-wider text-red-800"
        }
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
        {children}
      </p>
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
