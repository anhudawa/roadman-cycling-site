import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getSubmissionDetail } from "@/lib/diagnostic/store";
import { PROFILE_LABELS, labelFor } from "@/lib/diagnostic/profiles";
import { QUESTIONS } from "@/lib/diagnostic/questions";
import type { Profile } from "@/lib/diagnostic/types";
import { RegenerateButton } from "../RegenerateButton";

/**
 * Admin detail view of a single diagnostic submission. Built for
 * voice QA: shows the rendered breakdown side-by-side with the raw
 * model output, validation result, the user's exact answers, and
 * everything else needed to decide whether the LLM did its job.
 *
 * Auth-gated by requireAuth(). Never link to this from a public
 * surface — slug exposure here is fine because it's already
 * unguessable.
 */

export const dynamic = "force-dynamic";

export default async function DiagnosticAdminDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAuth();

  const { slug } = await params;
  const submission = await getSubmissionDetail(slug);
  if (!submission) notFound();

  const profileLabel = labelFor(
    submission.primaryProfile,
    submission.closeToBreakthrough
  );

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-1">
            Submission · {submission.slug}
          </p>
          <h1 className="text-2xl font-semibold text-white">
            {profileLabel}
            {submission.retakeNumber > 1 && (
              <span className="ml-3 text-sm font-normal text-foreground-subtle">
                retake #{submission.retakeNumber}
              </span>
            )}
          </h1>
          <p className="text-sm text-foreground-subtle mt-1 font-mono">
            {submission.email} ·{" "}
            {submission.createdAt.toISOString().slice(0, 16).replace("T", " ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/diagnostic"
            className="text-sm rounded-md bg-white/5 border border-white/10 text-foreground-subtle hover:text-white hover:bg-white/10 px-3 py-1.5"
          >
            ← All submissions
          </Link>
          <Link
            href={`/diagnostic/${submission.slug}`}
            target="_blank"
            className="text-sm rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5"
          >
            Open public results ↗
          </Link>
          <RegenerateButton slug={submission.slug} />
        </div>
      </header>

      {/* ── Top-line facts ──────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Fact label="Generation source" value={submission.generationSource}>
          {submission.generationSource === "llm" ? (
            <Tag variant="ok">LLM</Tag>
          ) : (
            <Tag variant="warn">Fallback</Tag>
          )}
        </Fact>
        <Fact
          label="Severe multi-system"
          value={submission.severeMultiSystem ? "yes" : "no"}
        />
        <Fact
          label="Close to breakthrough"
          value={submission.closeToBreakthrough ? "yes" : "no"}
        />
        <Fact
          label="Updated"
          value={submission.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Scores ────────────────────────────────── */}
        <section className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
            Scores
          </h2>
          <ul className="space-y-2 text-sm">
            {(
              Object.entries(submission.scores) as Array<[Profile, number]>
            ).map(([profile, score]) => {
              const isPrimary = profile === submission.primaryProfile;
              const isSecondary = profile === submission.secondaryProfile;
              return (
                <li
                  key={profile}
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className={
                      isPrimary
                        ? "text-[var(--color-bad)] font-semibold"
                        : isSecondary
                          ? "text-white"
                          : "text-foreground-muted"
                    }
                  >
                    {PROFILE_LABELS[profile]}
                    {isPrimary && " · primary"}
                    {isSecondary && " · secondary"}
                  </span>
                  <span className="font-mono text-white">{score}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Demographics ──────────────────────────── */}
        <section className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
            Demographics
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Age">{submission.answers.age}</Row>
            <Row label="Hours / week">{submission.answers.hoursPerWeek}</Row>
            <Row label="FTP">{submission.ftp ? `${submission.ftp}w` : "—"}</Row>
            <Row label="Goal">{submission.goal ?? "—"}</Row>
          </dl>
        </section>
      </div>

      {/* ── Answers ──────────────────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
          Answers
        </h2>
        <ol className="space-y-3 text-sm">
          {QUESTIONS.map((q, i) => {
            const value = submission.answers[q.key];
            const option =
              typeof value === "number"
                ? q.options.find((o) => o.value === value)
                : null;
            return (
              <li
                key={q.key}
                className="border-b border-white/5 pb-3 last:border-b-0"
              >
                <p className="text-foreground-subtle text-xs">
                  Q{i + 1} · {PROFILE_LABELS[q.primary]}
                </p>
                <p className="text-foreground-muted">{q.prompt}</p>
                <p className="text-white mt-1">
                  →{" "}
                  <span className="font-medium">{option?.label ?? "—"}</span>{" "}
                  <span className="text-foreground-subtle font-mono text-xs">
                    (value {value ?? "?"})
                  </span>
                </p>
              </li>
            );
          })}
          {submission.answers.Q13 && (
            <li className="pt-2">
              <p className="text-foreground-subtle text-xs">
                Q13 · open-ended
              </p>
              <p className="text-white italic">
                &ldquo;{submission.answers.Q13}&rdquo;
              </p>
            </li>
          )}
        </ol>
      </section>

      {/* ── Rendered breakdown ──────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
          Rendered breakdown (what the user saw)
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-foreground-subtle">Headline</p>
            <p className="text-white font-heading text-lg">
              {submission.breakdown.headline}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">Diagnosis</p>
            <p className="text-foreground-muted">
              {submission.breakdown.diagnosis}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">
              Why this is happening
            </p>
            <div className="text-foreground-muted whitespace-pre-wrap">
              {submission.breakdown.whyThisIsHappening}
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">What it&rsquo;s costing</p>
            <p className="text-foreground-muted">
              {submission.breakdown.whatItsCosting}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">The fix</p>
            <ol className="list-decimal pl-5 text-foreground-muted space-y-2">
              {submission.breakdown.fix.map((step) => (
                <li key={step.step}>
                  <strong className="text-white">{step.title}</strong> —{" "}
                  {step.detail}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">Why alone</p>
            <p className="text-foreground-muted">
              {submission.breakdown.whyAlone}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">Next move</p>
            <p className="text-foreground-muted">
              {submission.breakdown.nextMove}
            </p>
          </div>
          {submission.breakdown.secondaryNote && (
            <div>
              <p className="text-xs text-foreground-subtle">Secondary note</p>
              <p className="text-foreground-muted">
                {submission.breakdown.secondaryNote}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Generation meta + raw model output (LLM only) ── */}
      {submission.generationMeta && (
        <section className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
            Generation meta
          </h2>
          <pre className="text-xs text-foreground-muted bg-black/40 rounded-md p-3 overflow-x-auto">
            {JSON.stringify(submission.generationMeta, null, 2)}
          </pre>
        </section>
      )}
      {submission.rawModelOutput && (
        <section className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
            Raw model output
          </h2>
          <pre className="text-xs text-foreground-muted bg-black/40 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
            {submission.rawModelOutput}
          </pre>
        </section>
      )}

      {/* ── Attribution ─────────────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm uppercase tracking-widest text-foreground-subtle mb-4">
          Attribution
        </h2>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <Row label="UTM source">{submission.utm.source ?? "—"}</Row>
          <Row label="UTM medium">{submission.utm.medium ?? "—"}</Row>
          <Row label="UTM campaign">{submission.utm.campaign ?? "—"}</Row>
          <Row label="UTM content">{submission.utm.content ?? "—"}</Row>
          <Row label="UTM term">{submission.utm.term ?? "—"}</Row>
          <Row label="Beehiiv id">
            {submission.beehiivSubscriberId ?? "—"}
          </Row>
          <Row label="Referrer">{submission.referrer ?? "—"}</Row>
          <Row label="User agent">
            <span className="break-all text-xs">
              {submission.userAgent ?? "—"}
            </span>
          </Row>
        </dl>
      </section>
    </div>
  );
}

function Fact({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4">
      <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
        {label}
      </p>
      {children ?? <p className="text-white text-sm">{value}</p>}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-foreground-subtle w-32 shrink-0 text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-foreground-muted">{children}</dd>
    </div>
  );
}

function Tag({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "ok" | "warn";
}) {
  const cls =
    variant === "ok"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  );
}
