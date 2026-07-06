/**
 * Decorative furniture for the homepage Tour hero. Three motifs, all purely
 * presentational and hidden from assistive tech:
 *   1. A maillot-jaune "sunrise" glow that slowly breathes behind the copy.
 *   2. A two-layer mountain silhouette — the Tour's defining image — with a
 *      thin jersey-yellow ridge line catching the light.
 *   3. Vignette gradients that seat the content and deepen the purple.
 *
 * Sits inside a `relative` Section (which already clips overflow) and behind a
 * `relative z-10` Container. Colours are hand-mixed from the deep-purple family
 * so the silhouette reads as depth, not a separate hue.
 */
export function TourHeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Maillot-jaune sunrise glow */}
      <div
        className="tdf-hero-glow absolute left-1/2 top-0 h-[460px] w-[880px] max-w-[130%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,215,0,0.30), rgba(255,215,0,0.07) 55%, transparent 76%)",
        }}
      />

      {/* Ambient vignettes — warm top, deep bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -12%, rgba(255,215,0,0.10), transparent 46%), linear-gradient(180deg, rgba(33,1,64,0) 42%, rgba(12,0,26,0.6) 100%)",
        }}
      />

      {/* Mountain range — the Tour motif */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[60%] w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        role="presentation"
      >
        {/* Far range */}
        <path
          d="M0,400 L0,232 L150,150 L300,222 L470,92 L650,204 L820,120 L1010,212 L1180,108 L1330,192 L1440,140 L1440,400 Z"
          fill="#2c0a54"
          fillOpacity="0.55"
        />
        {/* Near range */}
        <path
          d="M0,400 L0,302 L120,250 L260,320 L360,238 L520,330 L680,258 L760,312 L920,250 L1080,332 L1220,268 L1340,322 L1440,278 L1440,400 Z"
          fill="#170130"
        />
        {/* Sunrise ridge line on the near range */}
        <path
          d="M0,302 L120,250 L260,320 L360,238 L520,330 L680,258 L760,312 L920,250 L1080,332 L1220,268 L1340,322 L1440,278"
          fill="none"
          stroke="#FFD700"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

type TricolourProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/**
 * The French tricolour as a slim accent bar. `horizontal` renders blue → white
 * → red left-to-right (a flag tick); `vertical` stacks the three as an
 * editorial placket beside a headline.
 */
export function Tricolour({ orientation = "horizontal", className = "" }: TricolourProps) {
  const vertical = orientation === "vertical";
  const seg = vertical ? "h-1/3 w-full" : "h-full w-1/3";
  return (
    <span
      aria-hidden
      className={`inline-flex overflow-hidden rounded-[2px] ${vertical ? "flex-col" : "flex-row"} ${className}`}
    >
      <span className={`${seg} bg-tdf-tricolour-blue`} />
      <span className={`${seg} bg-off-white`} />
      <span className={`${seg} bg-tdf-tricolour-red`} />
    </span>
  );
}
