import type { Metadata } from "next";
import Link from "next/link";
import { StageStrip, type StageStripStage } from "@/components/features/fantasy/StageStrip";
import stagesData from "@/data/fantasy/stages-2026.json";

export const metadata: Metadata = {
  title: "Roadman Fantasy Tour — pick 8, ride the Tour de France 2026",
  description:
    "100 credits, 8 riders, 21 stages from Barcelona to Paris. Free fantasy Tour de France with daily scoring and mini-leagues for your club. Teams lock 4 July 2026.",
  alternates: { canonical: "/fantasy" },
};

// The landing page is fully static (Section 7: static-render everything
// pre-login). The stage strip reads the same verified data file the
// seed script loads, so it works before the database is even reachable.
const stages = (stagesData.stages as StageStripStage[]).map((s) => ({ ...s }));

const HOW_IT_WORKS = [
  {
    title: "Pick your eight",
    body: "100 credits, 8 riders, max 3 from one trade team, at least one rider at 6 credits or under. You cannot afford all the galácticos. That's the game.",
  },
  {
    title: "Captain the right wheel",
    body: "One captain per stage scores double, and you can change him every morning before roll-out. Sprinter for Bordeaux, climber for Alpe d'Huez.",
  },
  {
    title: "Settle it on the club run",
    body: "Eight transfers for three weeks, a bonus on each rest day, and mini-leagues with a 6-character code. Saturday's coffee stop just got an agenda.",
  },
];

export default function FantasyLandingPage() {
  return (
    <>
      {/* Hero — the route IS the thesis: Barcelona to Paris, 21 tiles. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-deep-purple via-charcoal to-charcoal">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:pt-24">
          <p className="mb-4 font-heading text-sm tracking-[0.35em] text-jersey-yellow">
            TOUR DE FRANCE · 4–26 JULY 2026 · FREE TO PLAY
          </p>
          <h1 className="font-heading text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.9] tracking-tight">
            PICK 8.
            <br />
            RIDE THE TOUR.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-off-white/80">
            21 stages, Barcelona to Paris, with Alpe d&apos;Huez two days running for the first
            time in Grand Tour history. Build a squad of 8 inside 100 credits, score off the
            official results every evening, and put a mini-league on the line with your club mates.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/fantasy/build"
              className="rounded-md bg-jersey-yellow px-8 py-4 font-heading text-lg tracking-[0.15em] text-charcoal transition-colors hover:bg-jersey-yellow-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jersey-yellow"
            >
              BUILD YOUR TEAM →
            </Link>
            <p className="text-sm text-mid-grey">
              No signup needed to start picking.
              <br />
              Teams lock at noon on 4 July, race day.
            </p>
          </div>
          <p className="mt-6 block w-fit max-w-2xl rounded-md border border-jersey-yellow/40 bg-jersey-yellow/10 px-4 py-2.5 text-sm text-off-white/90">
            <span className="font-heading tracking-[0.2em] text-jersey-yellow">THE PRIZE: </span>
            win the global league, ride our Girona training camp on us (ex flights &amp; transfers).{" "}
            <Link href="/fantasy/rules" className="underline hover:text-off-white">
              Full rules
            </Link>
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="mb-3 font-heading text-base tracking-[0.3em] text-off-white/60">
            THE ROUTE — 3,333 KM
          </h2>
          <StageStrip stages={stages} />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-charcoal">
        {/* French tricolour accent */}
        <div className="flex h-[2px]" aria-hidden="true">
          <div className="flex-1 bg-tdf-blue" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-tdf-red" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-heading text-4xl tracking-wide sm:text-5xl">HOW IT&apos;S PLAYED</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-white/10 bg-deep-purple/40 p-6"
              >
                <h3 className="font-heading text-2xl tracking-wide text-jersey-yellow">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-off-white/75">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring teaser + daily email */}
      <section className="border-t border-white/10 bg-charcoal">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl tracking-wide">POINTS WHERE IT HURTS</h2>
            <ul className="mt-6 space-y-3 text-off-white/80">
              <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span>Stage win</span>
                <span className="font-heading text-xl text-jersey-yellow">50</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span>Yellow jersey, every day he holds it</span>
                <span className="font-heading text-xl text-jersey-yellow">10</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span>Combativity award</span>
                <span className="font-heading text-xl text-jersey-yellow">12</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span>Final GC winner in Paris</span>
                <span className="font-heading text-xl text-jersey-yellow">200</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Your captain, every stage</span>
                <span className="font-heading text-xl text-jersey-yellow">×2</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-deep-purple/40 p-6">
            <h2 className="font-heading text-2xl tracking-wide">THE 06:30 EMAIL</h2>
            <p className="mt-3 leading-relaxed text-off-white/75">
              Every stage morning: where you stand, what today&apos;s road does, who it suits, and
              one tap into your team before transfers lock at roll-out. No password. Read it with
              the first coffee, make your move, get on with your day.
            </p>
            <p className="mt-4 text-sm text-mid-grey">
              Rest days unlock a bonus transfer — those two Mondays decide more leagues than any
              summit finish.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-charcoal to-deep-purple">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-heading text-5xl tracking-wide sm:text-6xl">
            THE STARTLIST IS SETTLING.
            <br />
            YOUR BUDGET ISN&apos;T GETTING BIGGER.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-off-white/70">
            Squads are provisional until the team presentation in Barcelona on 1 July — pick now,
            tune later. Unlimited free changes until noon on race day, 4 July.
          </p>
          <Link
            href="/fantasy/build"
            className="mt-8 inline-block rounded-md bg-jersey-yellow px-10 py-4 font-heading text-lg tracking-[0.15em] text-charcoal transition-colors hover:bg-jersey-yellow-deep"
          >
            START PICKING →
          </Link>
        </div>
      </section>
    </>
  );
}
