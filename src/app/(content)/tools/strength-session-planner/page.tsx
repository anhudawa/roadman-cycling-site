"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import {
  buildStrengthPlacementPlan,
  DAY_NAMES,
  PLACEMENT_RULES,
  RIDE_CONTEXT_LABELS,
  type RideContext,
  type StrengthWindow,
  type WeekDayInput,
} from "@/lib/strength-placement";

const INITIAL_WEEK: WeekDayInput[] = DAY_NAMES.map((day, index) => {
  const rides: RideContext[] = [
    "off-bike",
    "key",
    "easy",
    "endurance",
    "off-bike",
    "easy",
    "long",
  ];
  const windows: StrengthWindow[] = [45, 0, 45, 0, 60, 0, 0];
  return { day, ride: rides[index], strengthWindow: windows[index] };
});

const RIDE_OPTIONS = Object.entries(RIDE_CONTEXT_LABELS) as Array<
  [RideContext, string]
>;
const WINDOW_OPTIONS: StrengthWindow[] = [0, 30, 45, 60];

function windowLabel(window: StrengthWindow): string {
  return window === 0 ? "No gym window" : `${window} minutes`;
}

export default function StrengthSessionPlannerPage() {
  const [week, setWeek] = useState<WeekDayInput[]>(INITIAL_WEEK);
  const [requestedSessions, setRequestedSessions] = useState<1 | 2>(2);
  const plan = useMemo(
    () => buildStrengthPlacementPlan(week, requestedSessions),
    [week, requestedSessions],
  );
  const placementByIndex = new Map(
    plan.placements.map((placement) => [placement.dayIndex, placement]),
  );

  function updateRide(dayIndex: number, ride: RideContext) {
    setWeek((current) =>
      current.map((day, index) =>
        index === dayIndex ? { ...day, ride } : day,
      ),
    );
  }

  function updateWindow(dayIndex: number, strengthWindow: StrengthWindow) {
    setWeek((current) =>
      current.map((day, index) =>
        index === dayIndex ? { ...day, strengthWindow } : day,
      ),
    );
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-coral">
              Free deterministic planning tool
            </p>
            <h1
              className="font-heading leading-[0.95] text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              CYCLING STRENGTH SESSION PLANNER
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground-muted">
              Map the week you actually ride. Roadman finds the
              least-conflicting 30, 45 or 60-minute strength windows while
              protecting key and long rides.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
              <section
                className="rounded-2xl border border-white/10 bg-background-elevated p-5 md:p-7"
                aria-labelledby="week-heading"
              >
                <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                      Step 1
                    </p>
                    <h2
                      id="week-heading"
                      className="mt-2 font-heading text-2xl text-off-white"
                    >
                      MAP YOUR REAL WEEK
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-muted">
                      Choose the main riding demand and the gym time genuinely
                      available on each day. A ride-day window means lifting
                      after the ride.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-foreground-subtle">
                      Sessions wanted
                    </span>
                    <div className="flex rounded-lg border border-white/10 bg-charcoal p-1">
                      {([1, 2] as const).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setRequestedSessions(count)}
                          aria-pressed={requestedSessions === count}
                          className={`min-w-14 rounded-md px-4 py-2 font-heading text-sm transition-colors ${
                            requestedSessions === count
                              ? "bg-coral text-off-white"
                              : "text-foreground-muted hover:text-off-white"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {week.map((day, dayIndex) => {
                    const placement = placementByIndex.get(dayIndex);
                    return (
                      <div
                        key={day.day}
                        className={`grid gap-3 rounded-xl border p-4 md:grid-cols-[120px_1fr_170px] md:items-center ${
                          placement
                            ? "border-coral/40 bg-coral/[0.07]"
                            : "border-white/10 bg-white/[0.025]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 md:block">
                          <p className="font-heading text-lg text-off-white">
                            {day.day}
                          </p>
                          {placement && (
                            <span className="rounded-full bg-coral px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-off-white md:mt-2 md:inline-block">
                              Place strength
                            </span>
                          )}
                        </div>
                        <label className="block">
                          <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-foreground-subtle md:hidden">
                            Ride context
                          </span>
                          <select
                            aria-label={`${day.day} ride context`}
                            value={day.ride}
                            onChange={(event) =>
                              updateRide(
                                dayIndex,
                                event.target.value as RideContext,
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-3 text-sm text-off-white outline-none transition-colors focus:border-coral"
                          >
                            {RIDE_OPTIONS.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-foreground-subtle md:hidden">
                            Strength window
                          </span>
                          <select
                            aria-label={`${day.day} strength window`}
                            value={day.strengthWindow}
                            onChange={(event) =>
                              updateWindow(
                                dayIndex,
                                Number(event.target.value) as StrengthWindow,
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-3 text-sm text-off-white outline-none transition-colors focus:border-coral"
                          >
                            {WINDOW_OPTIONS.map((value) => (
                              <option key={value} value={value}>
                                {windowLabel(value)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>

              <aside className="space-y-5" aria-live="polite">
                <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-background-elevated p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                    Your placement
                  </p>
                  <h2 className="mt-2 font-heading text-3xl text-off-white">
                    PROTECT THE BIKE. PLACE THE GYM.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    {plan.summary}
                  </p>

                  {plan.placements.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {plan.placements.map((placement, index) => (
                        <div
                          key={placement.day}
                          className="rounded-xl border border-white/10 bg-charcoal/70 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.15em] text-foreground-subtle">
                                Session {index + 1}
                              </p>
                              <p className="mt-1 font-heading text-2xl text-off-white">
                                {placement.day.toUpperCase()}
                              </p>
                            </div>
                            <span className="rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">
                              {placement.duration} min
                            </span>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {placement.reasons.map((reason) => (
                              <li
                                key={reason}
                                className="flex gap-2 text-sm leading-relaxed text-foreground-muted"
                              >
                                <span className="text-emerald-400">✓</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                          {placement.cautions.length > 0 && (
                            <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.07] p-3">
                              {placement.cautions.map((caution) => (
                                <p
                                  key={caution}
                                  className="text-xs leading-relaxed text-amber-100/80"
                                >
                                  {caution}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-foreground-muted">
                      Add a gym window to the week and the placement will appear
                      here.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-background-elevated p-6">
                  <h3 className="font-heading text-lg text-off-white">
                    THE RULES YOU CAN INSPECT
                  </h3>
                  <ol className="mt-4 space-y-3">
                    {PLACEMENT_RULES.map((rule, index) => (
                      <li
                        key={rule}
                        className="flex gap-3 text-sm leading-relaxed text-foreground-muted"
                      >
                        <span className="font-heading text-coral">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-foreground-subtle">
                    This tool places time; it does not prescribe exercises,
                    sets, load, rehabilitation or a medical decision. Re-run it
                    when the riding week changes.
                  </p>
                </div>

                <div className="rounded-2xl border border-coral/25 bg-coral/[0.06] p-6 text-center">
                  <p className="font-heading text-xl text-off-white">
                    WANT THE SESSION INSIDE THE WEEK?
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
                    Roadman&apos;s upcoming iPhone app will connect this
                    placement logic to cyclist-specific strength, daily
                    readiness and recovery context.
                  </p>
                  <Link
                    href="/app"
                    data-track="strength_placement_app"
                    className="mt-5 inline-flex items-center justify-center rounded-md bg-coral px-6 py-3 font-heading text-sm uppercase tracking-wider text-off-white transition-colors hover:bg-coral/90"
                  >
                    Join App Early Access
                  </Link>
                </div>
              </aside>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="strength-session-planner" />
      </main>
      <Footer />
    </>
  );
}
