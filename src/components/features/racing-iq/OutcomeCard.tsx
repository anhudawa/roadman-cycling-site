"use client";

import type { Scenario } from "@/lib/racing-iq/types";

/**
 * Decision resolution + the expert reveal, shown while the world is
 * still frozen. Quote copy is a placeholder slot — real quotes come
 * from the podcast archive via Anthony; nothing here is invented.
 */
export function OutcomeCard({
  scenario,
  outcomeText,
  onContinue,
  continueLabel,
}: {
  scenario: Scenario;
  outcomeText: string;
  onContinue: () => void;
  continueLabel: string;
}) {
  const showQuote = !scenario.expert.quote.startsWith("[");
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-h-full w-full max-w-2xl overflow-y-auto px-4 pb-14 pt-2 sm:pb-16">
      <div className="riq-lower-third-in space-y-2">
        <div
          className="border-l-[3px] border-coral bg-charcoal/85 p-4 backdrop-blur-md sm:p-5"
          role="status"
          aria-live="polite"
        >
          <p className="font-heading text-xs tracking-[0.3em] text-off-white/50">
            HOW IT PLAYS OUT
          </p>
          <p className="mt-2 text-sm leading-relaxed text-off-white/90 sm:text-[15px]">
            {outcomeText}
          </p>
        </div>

        <div className="border border-purple/60 bg-deep-purple/85 p-4 backdrop-blur-md sm:p-5">
          <p className="font-heading text-xs tracking-[0.3em] text-coral">
            THE EXPERT’S TAKE
          </p>
          {showQuote ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-off-white/85">
                {scenario.expert.prompt}
              </p>
              <blockquote className="mt-2 border-l-2 border-coral/70 pl-3 text-[15px] italic leading-relaxed text-off-white">
                “{scenario.expert.quote}”
                <footer className="mt-1 text-xs not-italic text-off-white/55">
                  — {scenario.expert.attribution}
                </footer>
              </blockquote>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-off-white/85">
                {scenario.teaches}
              </p>
              {/* Visible slot marker so review builds show exactly where
                  the archive quote lands once supplied. */}
              <p className="mt-2 text-[11px] tracking-wide text-off-white/35">
                {scenario.expert.quote}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="block w-full bg-coral px-4 py-3 text-center font-heading text-lg uppercase tracking-[0.2em] text-off-white transition-colors hover:bg-coral-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
