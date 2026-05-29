import { BLOOD_ENGINE_DISCLAIMER } from "../../../content/blood-engine/disclaimer";

type Variant = "prominent" | "muted";

interface Props {
  variant?: Variant;
  className?: string;
}

/**
 * The mandatory medical disclaimer surface. ALWAYS visible — never small print.
 *
 * - "prominent" → bordered coral box used on the report page and the ToS step.
 *   This is the legally-required placement.
 * - "muted" → calmer styling for footer / dashboard contexts where the user
 *   has already accepted the ToS.
 *
 * Source of truth for the copy is `content/blood-engine/disclaimer.ts`.
 * Bump DISCLAIMER_VERSION there if you ever change the wording.
 */
export function MedicalDisclaimer({ variant = "prominent", className = "" }: Props) {
  if (variant === "prominent") {
    return (
      <div
        role="note"
        aria-label="Medical disclaimer"
        className={`rounded-lg border border-coral/40 bg-coral-muted p-6 text-off-white ${className}`}
      >
        <p className="font-heading uppercase tracking-wider text-coral mb-2">
          Medical disclaimer
        </p>
        <p className="text-sm leading-relaxed">{BLOOD_ENGINE_DISCLAIMER}</p>
      </div>
    );
  }

  return (
    <div
      role="note"
      aria-label="Medical disclaimer"
      className={`rounded-lg border border-coral/20 bg-coral-muted p-6 text-sm text-off-white/90 leading-relaxed ${className}`}
    >
      {BLOOD_ENGINE_DISCLAIMER}
    </div>
  );
}
