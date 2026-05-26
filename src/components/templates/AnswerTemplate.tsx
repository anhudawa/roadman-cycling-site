import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { EvidenceLevel } from "@/components/ui/EvidenceLevel";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { AuthorBio } from "@/components/features/blog/AuthorBio";
import { CONTENT_PILLARS } from "@/types";
import { type AnswerPage } from "@/lib/answers";

interface ResolvedEpisode {
  title: string;
  href: string;
}

interface AnswerTemplateProps {
  answer: AnswerPage;
  /** Related episodes pre-resolved by the route (title + href). */
  relatedEpisodes: ResolvedEpisode[];
  /** Episode slug → title, for expert-evidence "heard it here" links. */
  episodeTitleBySlug: Record<string, string>;
  /** Analytics source string. */
  source: string;
}

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * AnswerTemplate — the citation-optimised /answers layout.
 *
 * Deliberately lightweight: server-rendered, no client-side animation,
 * native <details> accordions, minimal JS. Fast LCP is the point — these
 * pages exist to be read (and cited) quickly by humans and AI engines.
 *
 * The `.answer-capsule` class on the direct answer is referenced by the
 * Article JSON-LD SpeakableSpecification emitted in the route, so the
 * answer-first capsule is the chunk crawlers are told to lift.
 *
 * Section order mirrors the answer-page spec: direct answer → who it's
 * for → the Roadman view → expert evidence → do this week → common
 * mistakes → FAQ → related episodes → related topics → author/trust.
 */
export function AnswerTemplate({
  answer,
  relatedEpisodes,
  episodeTitleBySlug,
  source,
}: AnswerTemplateProps) {
  const { color } = CONTENT_PILLARS[answer.pillar];
  const updated = answer.updatedDate || answer.publishDate;

  return (
    <main id="main-content">
      {/* Hero */}
      <Section background="deep-purple" grain className="pt-32 pb-12">
        <Container width="narrow">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge pillar={answer.pillar} size="md" />
            <span className="font-heading text-coral text-xs tracking-[0.3em] uppercase">
              Answer
            </span>
          </div>
          <h1
            className="font-heading text-off-white mb-5"
            style={{ fontSize: "var(--text-hero)" }}
          >
            {answer.question.toUpperCase()}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground-muted">
            <span>By Anthony Walsh</span>
            <span aria-hidden="true">&middot;</span>
            <span>Roadman Cycling</span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-foreground-subtle">
              Updated <time dateTime={updated}>{dateFmt(updated)}</time>
            </span>
          </div>
        </Container>
      </Section>

      <Section background="charcoal" className="!py-12">
        <Container width="narrow">
          {/* 1 — Direct answer (the citable capsule) */}
          <AnswerCapsule
            text={answer.directAnswer}
            pillar={answer.pillar}
            keyTakeaways={answer.keyTakeaways}
          />

          {/* Evidence grade */}
          <EvidenceLevel
            level={answer.evidenceLevel}
            variant="block"
            note={answer.evidenceNote}
          />

          {/* 2 — Who this answer is for */}
          {answer.whoFor.length > 0 && (
            <section className="mt-12" aria-labelledby={`whofor-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                WHO THIS IS FOR
              </p>
              <h2
                id={`whofor-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                IS THIS YOU?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {answer.whoFor.map((w) => (
                  <div
                    key={w.label}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="font-heading text-off-white text-base mb-1.5">
                      {w.label}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {w.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3 — The Roadman view (editorial stance) */}
          {answer.roadmanView.length > 0 && (
            <section
              className="mt-12 rounded-xl border-l-4 p-5 md:p-6"
              style={{
                borderColor: color,
                backgroundColor: `color-mix(in srgb, ${color} 5%, var(--color-charcoal))`,
              }}
              aria-labelledby={`view-${source}`}
            >
              <p
                className="font-heading text-xs tracking-[0.3em] mb-3"
                style={{ color }}
              >
                THE ROADMAN VIEW
              </p>
              <h2 id={`view-${source}`} className="sr-only">
                The Roadman view
              </h2>
              <div className="space-y-4">
                {answer.roadmanView.map((p, i) => (
                  <p
                    key={i}
                    className="text-off-white text-base leading-relaxed font-body m-0"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* 4 — Expert evidence */}
          {answer.expertEvidence.length > 0 && (
            <section className="mt-12" aria-labelledby={`evidence-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                EXPERT EVIDENCE
              </p>
              <h2
                id={`evidence-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                WHAT THE EXPERTS SAY
              </h2>
              <ul className="space-y-4 list-none p-0">
                {answer.expertEvidence.map((e) => {
                  const epTitle = e.episodeSlug
                    ? episodeTitleBySlug[e.episodeSlug]
                    : undefined;
                  return (
                    <li
                      key={`${e.name}-${e.insight.slice(0, 24)}`}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-2 mb-2">
                        {e.guestSlug ? (
                          <Link
                            href={`/guests/${e.guestSlug}`}
                            className="font-heading text-off-white hover:text-coral transition-colors"
                          >
                            {e.name}
                          </Link>
                        ) : (
                          <span className="font-heading text-off-white">
                            {e.name}
                          </span>
                        )}
                        {e.credential && (
                          <span className="text-foreground-subtle text-xs">
                            {e.credential}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground-muted text-sm md:text-base leading-relaxed m-0">
                        {e.insight}
                      </p>
                      {e.episodeSlug && epTitle && (
                        <Link
                          href={`/podcast/${e.episodeSlug}`}
                          className="inline-flex items-center gap-1 mt-3 text-coral text-sm hover:text-coral/80 transition-colors"
                        >
                          Hear it: {epTitle}
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 5 — Practical application */}
          {answer.practicalApplication.length > 0 && (
            <section className="mt-12" aria-labelledby={`apply-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                PRACTICAL APPLICATION
              </p>
              <h2
                id={`apply-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                DO THIS WEEK
              </h2>
              <ol className="space-y-4 list-none p-0 m-0">
                {answer.practicalApplication.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-heading text-sm"
                      style={{
                        color,
                        backgroundColor: `color-mix(in srgb, ${color} 12%, var(--color-charcoal))`,
                      }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-heading text-off-white text-base mb-1">
                        {step.title}
                      </p>
                      <p className="text-foreground-muted text-sm md:text-base leading-relaxed m-0">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* 6 — Common mistakes */}
          {answer.commonMistakes.length > 0 && (
            <section className="mt-12" aria-labelledby={`mistakes-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                COMMON MISTAKES
              </p>
              <h2
                id={`mistakes-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                WHAT CYCLISTS GET WRONG
              </h2>
              <ul className="space-y-3 list-none p-0">
                {answer.commonMistakes.map((m) => (
                  <li
                    key={m.mistake}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-off-white text-sm md:text-base leading-relaxed mb-2">
                      <span
                        className="font-heading text-xs tracking-widest mr-2"
                        style={{ color: "#F16363" }}
                      >
                        MISTAKE
                      </span>
                      {m.mistake}
                    </p>
                    <p className="text-foreground-muted text-sm md:text-base leading-relaxed m-0">
                      <span
                        className="font-heading text-xs tracking-widest mr-2"
                        style={{ color: "#4CAF50" }}
                      >
                        FIX
                      </span>
                      {m.fix}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 7 — FAQ (native accordion, no JS; mirrors FAQPage JSON-LD) */}
          {answer.faq.length > 0 && (
            <section className="mt-12" aria-labelledby={`faq-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                FAQ
              </p>
              <h2
                id={`faq-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <div className="space-y-3">
                {answer.faq.map((f) => (
                  <details
                    key={f.question}
                    className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-coral/30 open:border-coral/30 transition-colors"
                  >
                    <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 px-5 py-4 font-heading text-off-white text-base md:text-lg leading-snug">
                      <span>{f.question}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-coral text-xl font-heading transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-foreground-muted text-sm md:text-base leading-relaxed">
                      {f.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 8 — Related episodes */}
          {relatedEpisodes.length > 0 && (
            <section className="mt-12" aria-label="Related podcast episodes">
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                RELATED EPISODES
              </p>
              <h2 className="font-heading text-off-white text-2xl mb-6">
                HEAR THE CONVERSATIONS
              </h2>
              <div className="space-y-3">
                {relatedEpisodes.map((ep) => (
                  <Link
                    key={ep.href}
                    href={ep.href}
                    className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                  >
                    <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors m-0">
                      {ep.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 9 — Related topics */}
          {answer.relatedTopics.length > 0 && (
            <section className="mt-12" aria-label="Related topics">
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                RELATED TOPICS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {answer.relatedTopics.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:border-coral/30 transition-colors group"
                  >
                    <p className="font-heading text-off-white text-sm leading-snug group-hover:text-coral transition-colors m-0">
                      {r.label}{" "}
                      <span aria-hidden="true" className="text-coral">
                        &rarr;
                      </span>
                    </p>
                    {r.description && (
                      <p className="text-foreground-subtle text-xs mt-1.5 leading-snug m-0">
                        {r.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Light coaching CTA — single server-rendered button, no JS */}
          <div className="mt-12 rounded-lg border border-coral/30 bg-coral/[0.05] p-6 text-center">
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
              STILL GUESSING?
            </p>
            <p className="font-heading text-off-white text-xl mb-4">
              A coach removes the guesswork.
            </p>
            <Button href="/apply" size="lg" dataTrack={`answer_${source}_apply`}>
              Apply for Coaching
            </Button>
          </div>

          {/* 10 — Author + trust (E-E-A-T) */}
          <EvidenceBlock
            experts={answer.expertEvidence
              .filter((e) => e.guestSlug)
              .map((e) => ({
                name: e.name,
                role: e.credential,
                href: `/guests/${e.guestSlug}`,
              }))}
            episodes={relatedEpisodes}
            lastReviewed={dateFmt(updated)}
            reviewedBy={answer.reviewedBy || "Anthony Walsh"}
          />

          <AuthorBio />
        </Container>
      </Section>
    </main>
  );
}
