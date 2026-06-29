"use client";

import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { SkoolTrialButton } from "@/components/features/community/SkoolTrialButton";
import { SKOOL_URL } from "./constants";

/**
 * The Fantasy Tour de France placeholder — the centrepiece of the whole
 * overlay. The game itself is being built separately; this section sells
 * it, captures intent (newsletter = the launch announcement channel), and
 * points to the community where it will live.
 */
export function FantasyPlaceholder({ id = "fantasy" }: { id?: string }) {
  return (
    <div id={id} className="relative">
      <div className="relative rounded-2xl border border-jersey-yellow/30 bg-gradient-to-br from-jersey-yellow/[0.08] via-deep-purple/40 to-charcoal p-6 sm:p-10 overflow-hidden">
        {/* Ambient jersey glow */}
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.16), transparent 70%)" }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-jersey-yellow/40 bg-jersey-yellow/10 px-3 py-1 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-jersey-yellow opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-jersey-yellow" />
            </span>
            <span className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em]">
              COMING FOR JULY · BUILT BY ROADMAN
            </span>
          </div>

          <h2
            className="font-heading text-off-white leading-[0.95] mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            FANTASY TOUR DE FRANCE
            <span className="block text-jersey-yellow">PICK EIGHT. BEAT THE BUNCH.</span>
          </h2>

          <p className="text-foreground-muted max-w-2xl leading-relaxed mb-6">
            Build your eight-rider roster, score points across all 21 stages, and
            settle it on a live leaderboard inside the Roadman community. Climbers,
            sprinters, a time-trial specialist, your wildcard for the breakaway —
            the squad that reads the race best wins. We&rsquo;re finishing the game
            mechanics now. Get on the list and you&rsquo;ll be first through the gate
            when it opens.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {[
              { k: "DRAFT YOUR EIGHT", v: "A roster within a points budget — balance the mountains against the bunch sprints." },
              { k: "SCORE EVERY STAGE", v: "Stage results, the jerseys, and breakaway points tally daily through July." },
              { k: "CLIMB THE BOARD", v: "League table inside the Roadman community — bragging rights all month." },
            ].map((card) => (
              <div
                key={card.k}
                className="rounded-lg border border-white/8 bg-white/[0.03] p-4"
              >
                <p className="font-heading text-jersey-yellow text-sm tracking-wider mb-1">
                  {card.k}
                </p>
                <p className="text-xs text-foreground-muted leading-relaxed">{card.v}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <p className="font-heading text-off-white text-lg tracking-wide mb-3">
                NOTIFY ME WHEN IT LAUNCHES
              </p>
              <EmailCapture
                variant="minimal"
                source="tour-fantasy-waitlist"
                buttonText="NOTIFY ME"
              />
            </div>

            <div className="rounded-lg border border-jersey-yellow/20 bg-charcoal/40 p-5">
              <p className="font-heading text-off-white text-lg tracking-wide mb-2">
                WHERE IT WILL LIVE
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                The Fantasy Tour runs inside the Roadman community on Skool — same
                place the leagues, the live calls, and the rest of the crew already
                are. Join free and you&rsquo;re ready to play on day one.
              </p>
              <SkoolTrialButton
                href={SKOOL_URL}
                source="tour-fantasy"
                variant="primary"
                className="!bg-jersey-yellow !text-charcoal hover:!bg-jersey-yellow-deep !shadow-none w-full"
              >
                Join the Community Free
              </SkoolTrialButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
