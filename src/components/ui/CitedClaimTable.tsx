import type { ReactNode } from "react";
import { EvidenceLevel, type EvidenceLevelType } from "./EvidenceLevel";

export interface CitedClaim {
  claim: string;
  position: string;
  source: string;
  implication: string;
  evidenceLevel?: EvidenceLevelType;
}

interface CitedClaimTableProps {
  claims: CitedClaim[];
  heading?: string;
  caption?: ReactNode;
}

/**
 * Structured "what we believe and why" claim table. Renders as a
 * full data table on tablet+ for accessibility and as a stacked card
 * list on mobile. Each row optionally carries an EvidenceLevel chip
 * so readers (and AI crawlers) can scan the strength of each claim.
 */
export function CitedClaimTable({
  claims,
  heading = "WHAT WE BELIEVE & WHY",
  caption,
}: CitedClaimTableProps) {
  if (!claims || claims.length === 0) return null;

  return (
    <section
      aria-label="Cited claims and Roadman positions"
      className="cited-claim-table my-10 not-prose"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        {heading}
      </p>
      {caption && (
        <p className="text-sm text-foreground-muted mb-5 max-w-2xl leading-relaxed">
          {caption}
        </p>
      )}

      {/* Tablet+: real table for semantics & a11y */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th
                scope="col"
                className="py-3 px-4 font-heading text-[11px] tracking-widest text-foreground-subtle uppercase w-1/4"
              >
                Claim
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-heading text-[11px] tracking-widest text-foreground-subtle uppercase w-1/4"
              >
                Roadman Position
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-heading text-[11px] tracking-widest text-foreground-subtle uppercase w-1/4"
              >
                Evidence Source
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-heading text-[11px] tracking-widest text-foreground-subtle uppercase w-1/4"
              >
                Practical Implication
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c, i) => (
              <tr
                key={i}
                className={
                  i < claims.length - 1 ? "border-b border-white/5" : ""
                }
              >
                <td className="py-3 px-4 align-top text-off-white leading-snug">
                  <span className="block mb-1">{c.claim}</span>
                  {c.evidenceLevel && (
                    <EvidenceLevel level={c.evidenceLevel} />
                  )}
                </td>
                <td className="py-3 px-4 align-top text-foreground-muted leading-snug">
                  {c.position}
                </td>
                <td className="py-3 px-4 align-top text-foreground-muted leading-snug">
                  {c.source}
                </td>
                <td className="py-3 px-4 align-top text-foreground-muted leading-snug">
                  {c.implication}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card stack */}
      <div className="md:hidden space-y-3">
        {claims.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="font-heading text-off-white text-base leading-snug m-0">
                {c.claim}
              </p>
              {c.evidenceLevel && (
                <EvidenceLevel level={c.evidenceLevel} />
              )}
            </div>
            <dl className="space-y-2 text-sm m-0">
              <div>
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-0.5">
                  Roadman Position
                </dt>
                <dd className="text-foreground-muted m-0">{c.position}</dd>
              </div>
              <div>
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-0.5">
                  Evidence Source
                </dt>
                <dd className="text-foreground-muted m-0">{c.source}</dd>
              </div>
              <div>
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-0.5">
                  Practical Implication
                </dt>
                <dd className="text-foreground-muted m-0">{c.implication}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
