"use client";

/**
 * Styled loader: the stage's route profile draws itself while the
 * world compiles behind it. No spinners, ever.
 */
export function LoadingSequence({ done }: { done: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-deep-purple transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <p className="font-heading text-sm tracking-[0.45em] text-coral">
        ROADMAN CYCLING PRESENTS
      </p>
      <h1 className="mt-2 font-heading text-6xl uppercase leading-none tracking-wide text-off-white sm:text-7xl">
        Racing IQ
      </h1>
      <p className="mt-2 text-sm tracking-wide text-off-white/60">
        Stage 1 · 120km · One race. Seven decisions.
      </p>

      <svg
        viewBox="0 0 560 110"
        className="mt-10 w-[min(85vw,560px)]"
        role="img"
        aria-label="Stage route profile loading"
      >
        {/* The stage profile: valley, plain, descent, the climb, town. */}
        <path
          className="riq-route-path"
          d="M 0 88 L 60 84 L 110 86 L 160 70 L 205 74 L 250 52 L 290 58 L 330 30 L 365 44 L 420 40 L 470 16 L 510 36 L 560 32"
          fill="none"
          stroke="#F16363"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle className="riq-loader-dot" r="4" fill="#FAFAFA" />
        {/* Marker labels in broadcast style */}
        <g fill="rgba(250,250,250,0.45)" fontSize="9" fontFamily="var(--font-body)">
          <text x="2" y="104">KM 0</text>
          <text x="240" y="104">CROSSWINDS</text>
          <text x="448" y="104">THE CLIMB</text>
          <text x="532" y="104">FINISH</text>
        </g>
      </svg>

      <p className="mt-8 font-heading text-xs tracking-[0.35em] text-off-white/45">
        BUILDING THE RACE…
      </p>
    </div>
  );
}
