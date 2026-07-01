/**
 * Stage-profile glyphs for the stage strip and stage cards. Hand-drawn
 * SVG polylines, not icon-font shortcuts: flat is a near-line, hilly
 * rolls, mountain spikes to a peak, TTs get the clock-line treatment.
 * Stroke inherits currentColor so the strip can tint today's stage coral.
 */

export type StageGlyphType = "ttt" | "itt" | "flat" | "hilly" | "mountain";

const PATHS: Record<StageGlyphType, string> = {
  flat: "M1 16 L10 14.5 L22 15.5 L34 14 L47 15",
  hilly: "M1 16 L8 11 L14 14 L21 8.5 L28 13 L36 9.5 L42 13.5 L47 11",
  mountain: "M1 16 L9 12 L15 13.5 L24 4 L30 9 L38 2.5 L43 8 L47 6",
  itt: "M1 12 L12 12 M16 12 L30 12 M34 12 L47 12",
  ttt: "M1 9 L14 9 M5 13 L18 13 M9 17 L22 17 M26 9 L39 9 M30 13 L43 13",
};

export function ProfileGlyph({
  type,
  className,
}: {
  type: StageGlyphType;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 20"
      fill="none"
      aria-hidden="true"
      className={className}
      role="presentation"
    >
      <path
        d={PATHS[type]}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const STAGE_TYPE_LABEL: Record<StageGlyphType, string> = {
  ttt: "Team time trial",
  itt: "Individual time trial",
  flat: "Flat",
  hilly: "Hilly",
  mountain: "Mountain",
};
