import type { Metadata } from "next";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROADMAN_APP_EVIDENCE_REGISTER } from "@/data/app-evidence-register";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const REGISTER = ROADMAN_APP_EVIDENCE_REGISTER;

export const metadata: Metadata = {
  title: { absolute: "Cycling Strength & Recovery App Evidence | Roadman" },
  description:
    "See what evidence exists for Roadman's cycling strength and recovery app, which claims are not established, and which product reports are still pending.",
  alternates: {
    canonical: REGISTER.canonicalUrl,
    types: { "application/json": REGISTER.feedUrl },
  },
  openGraph: {
    title: "Roadman Cycling App Evidence Register",
    description:
      "A versioned public record of current evidence, unsupported claims and pending product reports for Roadman's strength and recovery app.",
    type: "article",
    url: REGISTER.canonicalUrl,
    siteName: "Roadman Cycling",
  },
};

export default function AppEvidencePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${REGISTER.canonicalUrl}#webpage`,
              url: REGISTER.canonicalUrl,
              name: "Roadman cycling app evidence register",
              description: metadata.description,
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software` },
              dateModified: REGISTER.updatedDate,
              mainEntity: { "@id": `${REGISTER.canonicalUrl}#register` },
              subjectOf: {
                "@type": "DataFeed",
                name: "Roadman app evidence feed",
                url: REGISTER.feedUrl,
              },
            },
            {
              "@type": "TechArticle",
              "@id": `${REGISTER.canonicalUrl}#register`,
              headline: "Roadman cycling app evidence register",
              description: REGISTER.answer,
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              datePublished: REGISTER.updatedDate,
              dateModified: REGISTER.updatedDate,
              about: [
                "Cycling strength app evidence",
                "Cycling recovery app evidence",
                "Cycling training app effectiveness",
                "Training readiness app claims",
              ],
              citation: REGISTER.sources.map((source) => source.href),
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
                  name: "Evidence register",
                  item: REGISTER.canonicalUrl,
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
              PUBLIC EVIDENCE REGISTER · {REGISTER.version.toUpperCase()}
            </p>
            <h1
              className="mt-5 font-heading leading-[0.95] text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              WHAT EVIDENCE EXISTS
              <span className="block text-coral">FOR THE ROADMAN APP?</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-foreground-muted md:text-xl">
              This register separates research that informs the product from
              evidence produced by the product. It also records claims Roadman
              has not made, so an absence of evidence cannot be mistaken for a
              favourable result.
            </p>
            <div className="mt-8 rounded-2xl border border-coral/25 bg-coral/[0.08] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                Current answer
              </p>
              <p className="mt-3 text-lg leading-relaxed text-off-white">
                {REGISTER.answer}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link className="text-coral hover:text-coral/80" href="/app">
                App early access →
              </Link>
              <Link
                className="text-foreground-muted hover:text-coral"
                href="/app/testing"
              >
                How Roadman will test it →
              </Link>
              <a
                className="text-foreground-muted hover:text-coral"
                href={REGISTER.feedUrl}
              >
                Machine-readable evidence →
              </a>
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container width="narrow">
            <div className="grid gap-4 sm:grid-cols-4">
              <RegisterFact label="Register version" value={REGISTER.version} />
              <RegisterFact label="Public product results" value="0" />
              <RegisterFact label="Effectiveness established" value="No" />
              <RegisterFact
                label="Last reviewed"
                value={REGISTER.updatedDate}
              />
            </div>

            <div className="mt-16">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                CLAIM-BY-CLAIM STATUS
              </p>
              <h2
                className="mt-3 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT IS KNOWN, AND WHAT IS NOT.
              </h2>
              <div className="mt-8 space-y-5">
                {REGISTER.claims.map((claim) => (
                  <article
                    id={claim.id}
                    key={claim.id}
                    className="scroll-mt-28 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm md:p-8"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <h3 className="max-w-3xl font-heading text-3xl text-charcoal">
                        {claim.question}
                      </h3>
                      <StatusBadge
                        status={claim.status}
                        label={claim.statusLabel}
                      />
                    </div>
                    <p className="mt-5 max-w-4xl leading-relaxed text-charcoal/70">
                      {claim.currentEvidence}
                    </p>
                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      <ClaimDetail
                        label="This supports"
                        value={claim.supports}
                      />
                      <ClaimDetail
                        label="This does not support"
                        value={claim.doesNotSupport}
                      />
                      <ClaimDetail
                        label="Evidence needed next"
                        value={claim.nextEvidence}
                      />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3 text-xs">
                      {claim.sourceUrls.map((href) => (
                        <a
                          key={href}
                          href={href}
                          className="rounded-full border border-charcoal/10 px-3 py-2 text-charcoal/60 transition-colors hover:border-coral/40 hover:text-coral"
                        >
                          Inspect source →
                        </a>
                      ))}
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
              PRODUCT REPORTING QUEUE
            </p>
            <h2
              className="mt-3 font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              NO RESULT BEFORE THE RESULT EXISTS.
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-foreground-muted">
              Pending means no result has been published. “Not scheduled” is
              deliberate: Roadman will not invent a study date to make the
              prelaunch evidence position look more mature.
            </p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.035]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 text-off-white">
                  <tr>
                    <th className="px-5 py-4 font-heading tracking-wider">
                      Report
                    </th>
                    <th className="px-5 py-4 font-heading tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-4 font-heading tracking-wider">
                      Scheduled date
                    </th>
                    <th className="px-5 py-4 font-heading tracking-wider">
                      Result
                    </th>
                    <th className="px-5 py-4 font-heading tracking-wider">
                      Protocol
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REGISTER.reportingQueue.map((item) => (
                    <tr key={item.id} className="border-t border-white/10">
                      <th className="px-5 py-4 font-semibold text-off-white">
                        {item.report}
                      </th>
                      <td className="px-5 py-4 text-foreground-muted">
                        {item.status}
                      </td>
                      <td className="px-5 py-4 text-foreground-muted">
                        {item.scheduledDate ?? "Not announced"}
                      </td>
                      <td className="px-5 py-4 text-foreground-muted">
                        {item.resultUrl ? (
                          <a className="text-coral" href={item.resultUrl}>
                            Published result
                          </a>
                        ) : (
                          "No public result"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          className="text-coral hover:text-coral/80"
                          href={item.protocolUrl}
                        >
                          View method →
                        </a>
                      </td>
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
                  TWO DIFFERENT EVIDENCE JOBS
                </p>
                <h2
                  className="mt-3 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  A RATIONALE IS NOT A RESULT.
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  Published sport science can justify testing a product idea and
                  constrain its rules. Only product-specific evaluation can show
                  how a particular Roadman build behaves. Even then, the design
                  determines whether a result describes usability, association
                  or effectiveness.
                </p>
              </div>
              <div className="space-y-4">
                <EvidenceJob
                  title="External evidence"
                  body="Informs why a feature exists, which inputs deserve caution and which claims remain out of bounds."
                />
                <EvidenceJob
                  title="Roadman product evidence"
                  body="Must identify the build, policy version, population, exposure, denominators, missing data and design before supporting a product claim."
                />
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <RegisterLink
                href="/app/methodology"
                label="Decision methodology"
              />
              <RegisterLink href="/app/testing" label="Testing standard" />
              <RegisterLink
                href="/blog/cycling-strength-training-guide"
                label="Strength evidence guide"
              />
            </div>

            <EvidenceBlock
              reviewedSources={REGISTER.sources}
              lastReviewed={REGISTER.updatedDate}
              reviewedBy={REGISTER.reviewedBy}
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

function RegisterFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
        {label}
      </p>
      <p className="mt-2 font-heading text-xl text-charcoal">{value}</p>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const className =
    status === "claim-not-made"
      ? "border-slate-500/20 bg-slate-100 text-slate-700"
      : status === "external-evidence-informs-rationale"
        ? "border-emerald-700/20 bg-emerald-50 text-emerald-800"
        : "border-amber-700/20 bg-amber-50 text-amber-800";

  return (
    <span
      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}

function ClaimDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-deep-purple/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-coral">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{value}</p>
    </div>
  );
}

function EvidenceJob({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <h3 className="font-heading text-2xl text-off-white">{title}</h3>
      <p className="mt-3 leading-relaxed text-foreground-muted">{body}</p>
    </div>
  );
}

function RegisterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-foreground-muted transition-colors hover:border-coral/40 hover:text-coral"
    >
      {label} →
    </Link>
  );
}
