"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DAY_LABELS,
  generateCalendar,
} from "@/lib/fuel-planner";
import type {
  CarbLoadAnnotation,
  DayPlan,
  MealMacros,
  UserProfile,
  WeekPlan,
} from "@/lib/fuel-planner/types";
import { dietaryMeta } from "@/lib/fuel-planner/dietary";
import { loadState } from "@/lib/fuel-planner/storage";

const FUEL_CATEGORY_COLOUR: Record<string, string> = {
  REST: "text-foreground-muted",
  LOW: "text-sky-300",
  LOW_MODERATE: "text-emerald-300",
  MODERATE: "text-yellow-300",
  MODERATE_HIGH: "text-orange-300",
  HIGH: "text-coral",
  VERY_HIGH: "text-fuchsia-300",
};

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  am_snack: "AM snack",
  lunch: "Lunch",
  pm_snack: "PM snack",
  dinner: "Dinner",
};

const PHASE_LABEL: Record<WeekPlan["phase"], string> = {
  base: "Base",
  threshold: "Threshold",
  vo2: "VO2",
  race_specific: "Race-specific",
  taper: "Taper",
};

export function FuelCalendar() {
  const router = useRouter();
  const [weeks, setWeeks] = useState<WeekPlan[] | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => {
    const state = loadState();
    if (!state) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect empty localStorage on mount
      setMissingProfile(true);
      return;
    }
    const generated = generateCalendar(state.profile, state.pattern, state.meals, {
      startDate: state.startDate,
      numWeeks: 12,
    });
    setWeeks(generated);
    setProfile(state.profile);
  }, []);

  // Redirect once we detect no profile
  useEffect(() => {
    if (missingProfile) {
      const t = setTimeout(
        () => router.push("/method/fuel-planner/setup"),
        50,
      );
      return () => clearTimeout(t);
    }
  }, [missingProfile, router]);

  const week = useMemo(() => (weeks ? weeks[activeWeek] : null), [weeks, activeWeek]);

  if (missingProfile) {
    return (
      <p className="text-foreground-muted">
        No rider profile yet — redirecting to setup…
      </p>
    );
  }

  if (!weeks || !week) {
    return <p className="text-foreground-muted">Building your calendar…</p>;
  }

  const diet = profile?.dietaryPreferences ?? [];

  return (
    <>
      <div className="space-y-6 print:hidden">
        <WeekNav
          weeks={weeks}
          activeIndex={activeWeek}
          onChange={setActiveWeek}
          onPrint={() => window.print()}
        />

        {diet.length > 0 && <DietaryBanner prefs={diet} />}

        <CarbLoadPanel week={week} />

        <WeekSummary week={week} />

        <ol className="grid gap-3 md:gap-4">
          {week.days.map((day, i) => (
            <li key={day.date}>
              <DayCard day={day} dayLabel={DAY_LABELS[i] ?? ""} />
            </li>
          ))}
        </ol>

        <MethodologyFooter />

        <ProfileBar />
      </div>

      {profile && <PrintableWeek week={week} profile={profile} />}
    </>
  );
}

/* ─── Week navigation ──────────────────────────────────────── */

function WeekNav({
  weeks,
  activeIndex,
  onChange,
  onPrint,
}: {
  weeks: WeekPlan[];
  activeIndex: number;
  onChange: (i: number) => void;
  onPrint: () => void;
}) {
  const active = weeks[activeIndex];
  if (!active) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-charcoal/60 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-1">
            WEEK {active.weekNumber} · {PHASE_LABEL[active.phase].toUpperCase()}
            {active.isRecoveryWeek ? " · RECOVERY" : ""}
          </p>
          <h2 className="font-heading uppercase text-2xl md:text-3xl">
            {formatRange(active.startDate)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <NavButton
            onClick={() => onChange(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            label="← Prev"
          />
          <NavButton
            onClick={() =>
              onChange(Math.min(weeks.length - 1, activeIndex + 1))
            }
            disabled={activeIndex >= weeks.length - 1}
            label="Next →"
          />
          <button
            type="button"
            onClick={onPrint}
            className="font-heading uppercase tracking-wider text-xs border border-coral/60 bg-coral/10 text-coral hover:bg-coral/20 px-3 py-2 rounded-sm transition-colors"
          >
            Print / PDF
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {weeks.map((w, i) => (
          <button
            key={w.weekNumber}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`Jump to week ${w.weekNumber}`}
            aria-pressed={i === activeIndex}
            className={[
              "font-heading uppercase tracking-wider text-xs px-2.5 py-1.5 rounded-sm border transition-colors",
              i === activeIndex
                ? "bg-coral text-charcoal border-coral"
                : w.isRecoveryWeek
                  ? "border-white/20 bg-charcoal/40 text-foreground-muted hover:text-off-white"
                  : "border-white/10 bg-charcoal/30 text-foreground-muted hover:text-off-white hover:border-white/30",
            ].join(" ")}
          >
            W{w.weekNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-heading uppercase tracking-wider text-xs border border-white/10 bg-charcoal/40 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10 px-3 py-2 rounded-sm transition-colors"
    >
      {label}
    </button>
  );
}

/* ─── Week summary ──────────────────────────────────────── */

function WeekSummary({ week }: { week: WeekPlan }) {
  const { weeklyTotals } = week;
  const trainingDays = week.days.filter((d) => d.session != null).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
      <SummaryStat label="Training days" value={trainingDays.toString()} />
      <SummaryStat
        label="Training hrs"
        value={`${weeklyTotals.trainingHours.toFixed(1)}h`}
      />
      <SummaryStat
        label="Weekly kcal"
        value={Math.round(weeklyTotals.calories).toLocaleString()}
      />
      <SummaryStat label="Carbs g" value={weeklyTotals.carbsG.toLocaleString()} />
      <SummaryStat
        label="Protein g"
        value={weeklyTotals.proteinG.toLocaleString()}
      />
      <SummaryStat label="Fat g" value={weeklyTotals.fatG.toLocaleString()} />
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-charcoal/40 px-3 py-2.5">
      <p className="font-heading uppercase text-[10px] tracking-wider text-foreground-muted">
        {label}
      </p>
      <p className="font-heading text-lg md:text-xl text-off-white">{value}</p>
    </div>
  );
}

/* ─── Day card ──────────────────────────────────────── */

function DayCard({ day, dayLabel }: { day: DayPlan; dayLabel: string }) {
  const fuelCat = day.session?.fuelCategory ?? "REST";
  const accent = FUEL_CATEGORY_COLOUR[fuelCat] ?? "text-foreground-muted";
  const dateLabel = formatShortDate(day.date);

  return (
    <article className="rounded-xl border border-white/10 bg-charcoal/60 overflow-hidden">
      <header className="grid md:grid-cols-[180px_1fr_auto] gap-3 md:gap-5 items-start p-4 md:p-5 border-b border-white/5">
        <div>
          <p className="font-heading uppercase tracking-wider text-xs text-foreground-muted">
            {dayLabel} · {dateLabel}
          </p>
          <p className={["font-heading uppercase text-lg", accent].join(" ")}>
            {day.session ? day.session.name : "Rest"}
          </p>
          {day.session && (
            <p className="text-xs text-foreground-muted mt-1">
              {day.session.durationMin} min · IF {day.session.intensityFactor.toFixed(2)} ·{" "}
              {day.session.startTime}
              {day.session.isCompetition && (
                <span className="ml-2 text-coral">RACE DAY</span>
              )}
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <MacroPill label="Kcal" value={day.totals.calories.toString()} />
          <MacroPill label="Carbs" value={`${day.totals.carbsG}g`} />
          <MacroPill label="Protein" value={`${day.totals.proteinG}g`} />
          <MacroPill label="Fat" value={`${day.totals.fatG}g`} />
        </div>

        <div className="text-right">
          <p className="font-heading uppercase text-[10px] tracking-wider text-foreground-muted">
            In-ride
          </p>
          <p
            className={[
              "font-heading text-2xl",
              day.totals.inRideCarbsGPerHr > 0 ? "text-coral" : "text-foreground-muted",
            ].join(" ")}
          >
            {day.totals.inRideCarbsGPerHr > 0
              ? `${day.totals.inRideCarbsGPerHr}g/hr`
              : "—"}
          </p>
          {day.session && day.totals.exerciseKcal > 0 && (
            <p className="text-[10px] text-foreground-muted mt-0.5">
              {day.totals.exerciseKj} kJ · {day.totals.exerciseKcal} kcal
            </p>
          )}
        </div>
      </header>

      {day.carbLoad && <CarbLoadStrip load={day.carbLoad} />}

      <ol className="divide-y divide-white/5">
        {day.meals.map((meal) => (
          <li key={meal.slot}>
            <MealRow meal={meal} />
          </li>
        ))}
      </ol>
    </article>
  );
}

const CARB_LOAD_STAGE_LABEL: Record<CarbLoadAnnotation["stage"], string> = {
  load: "Carb-load",
  peak: "Peak load",
  race: "Race day",
};

function CarbLoadStrip({ load }: { load: CarbLoadAnnotation }) {
  return (
    <div className="border-b border-coral/20 bg-coral/[0.07] px-4 md:px-5 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-heading uppercase tracking-wider text-xs text-coral">
          {CARB_LOAD_STAGE_LABEL[load.stage]} · {load.label}
        </span>
        <span className="font-heading text-lg text-off-white">
          {load.targetCarbsG}g carbs
        </span>
        <span className="text-xs text-foreground-muted">
          {load.gPerKg} g/kg target
        </span>
      </div>
      <p className="text-xs text-foreground-muted mt-1">{load.trainingNote}</p>
    </div>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-charcoal/40 px-2.5 py-1.5 text-center">
      <p className="font-heading uppercase text-[10px] tracking-wider text-foreground-muted">
        {label}
      </p>
      <p className="font-heading text-base text-off-white">{value}</p>
    </div>
  );
}

function MealRow({ meal }: { meal: MealMacros }) {
  const tag = meal.isPostWorkout ? "POST" : meal.isPreWorkout ? "PRE" : null;
  return (
    <div className="grid grid-cols-[80px_120px_1fr_auto] md:grid-cols-[100px_180px_1fr_auto] gap-3 items-center px-4 md:px-5 py-3">
      <span className="font-mono text-xs text-foreground-muted">{meal.time}</span>
      <span className="font-heading uppercase tracking-wider text-sm text-off-white">
        {MEAL_LABEL[meal.slot] ?? meal.slot}
        {tag && (
          <span className="ml-2 text-[10px] tracking-widest text-coral">{tag}</span>
        )}
      </span>
      <span className="text-xs text-foreground-muted">
        <span className="text-off-white">{meal.carbsG}g</span> C ·{" "}
        <span className="text-off-white">{meal.proteinG}g</span> P ·{" "}
        <span className="text-off-white">{meal.fatG}g</span> F
      </span>
      <span className="font-heading text-sm text-off-white">{meal.calories} kcal</span>
    </div>
  );
}

/* ─── Profile bar (footer) ──────────────────────────────────────── */

function ProfileBar() {
  const [state, setState] = useState<ReturnType<typeof loadState>>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
  useEffect(() => setState(loadState()), []);
  if (!state) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-charcoal/40 p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-foreground-muted">
        <span className="text-off-white">{state.profile.weightKg}kg</span> ·{" "}
        <span className="text-off-white">{state.profile.ftp}W FTP</span> ·{" "}
        <span className="text-off-white">
          {goalLabel(state.profile.bodyCompGoal)}
        </span>{" "}
        ·{" "}
        <span className="text-off-white">
          {activityLabel(state.profile.activityLevel)}
        </span>{" "}
        off-bike
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/method/fuel-planner/setup"
          className="font-heading uppercase tracking-wider text-xs border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          Edit rider
        </Link>
        <Link
          href="/method/fuel-planner/week"
          className="font-heading uppercase tracking-wider text-xs border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          Edit week
        </Link>
      </div>
    </div>
  );
}

/* ─── Dietary banner ──────────────────────────────────────── */

function DietaryBanner({
  prefs,
}: {
  prefs: NonNullable<UserProfile["dietaryPreferences"]>;
}) {
  const metas = prefs.map(dietaryMeta);
  return (
    <div className="rounded-xl border border-pillar-nutrition/30 bg-pillar-nutrition/[0.06] p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-heading uppercase tracking-wider text-xs text-foreground-muted">
          Eating
        </span>
        {metas.map((m) => (
          <span
            key={m.value}
            className="font-heading uppercase tracking-wider text-[10px] px-2 py-1 rounded-sm border border-pillar-nutrition/50 text-pillar-nutrition"
          >
            {m.label}
          </span>
        ))}
      </div>
      <ul className="space-y-1">
        {metas.map((m) => (
          <li key={m.value} className="text-xs text-foreground-muted">
            <span className="text-off-white">{m.short}:</span> {m.guidance}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-foreground-muted/70 mt-2">
        Targets are unchanged — these are food-source swaps to hit the same
        macros.
      </p>
    </div>
  );
}

/* ─── Competition carb-load protocol panel ────────────────── */

function CarbLoadPanel({ week }: { week: WeekPlan }) {
  const loadDays = week.days
    .map((d, i) => ({ day: d, label: DAY_LABELS[i] ?? "" }))
    .filter((x) => x.day.carbLoad);

  if (loadDays.length === 0) return null;

  return (
    <div className="rounded-xl border border-coral/30 bg-coral/[0.06] p-4 md:p-5">
      <p className="font-heading text-xs tracking-[0.3em] text-coral mb-1">
        COMPETITION CARB-LOAD PROTOCOL
      </p>
      <p className="text-sm text-foreground-muted mb-4 max-w-2xl">
        A race needs glycogen stores topped right out. This is the Impey
        48-hour carbohydrate-load and taper — 8–12 g/kg across the two days
        into the race, layered on top of your daily plan.
      </p>
      <ol className="grid sm:grid-cols-3 gap-3">
        {loadDays.map(({ day, label }) => {
          const load = day.carbLoad!;
          return (
            <li
              key={day.date}
              className="rounded-lg border border-white/10 bg-charcoal/40 p-3"
            >
              <p className="font-heading uppercase tracking-wider text-[10px] text-coral mb-1">
                {label} · {load.label}
              </p>
              <p className="font-heading text-2xl text-off-white">
                {load.targetCarbsG}
                <span className="text-sm text-foreground-muted ml-1">
                  g carbs
                </span>
              </p>
              <p className="text-[11px] text-foreground-muted mb-1.5">
                {load.gPerKg} g/kg bodyweight
              </p>
              <p className="text-xs text-foreground-muted">
                {load.trainingNote}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-foreground-muted/70 mt-3">
        Protocol: Impey, building on Morton&apos;s Fuel For The Work Required.
        On-the-bike fuelling targets follow Jeukendrup.
      </p>
    </div>
  );
}

/* ─── Methodology attribution + resources ─────────────────── */

function MethodologyFooter() {
  return (
    <div className="rounded-xl border border-white/10 bg-charcoal/40 p-4 md:p-5 space-y-4">
      <div>
        <p className="font-heading uppercase tracking-wider text-xs text-foreground-muted mb-2">
          The methodology
        </p>
        <p className="text-xs text-foreground-muted max-w-2xl">
          Daily macros use Mifflin-St Jeor for resting metabolic rate and the
          Hexis/Impey Fuel For The Work Required model to periodise carbs
          around training. Carbohydrate periodisation builds on{" "}
          <span className="text-off-white">Morton</span>; the race carb-load is{" "}
          <span className="text-off-white">Impey</span>; in-ride carb targets
          (up to 90 g/hr of multiple transportable carbohydrates) follow{" "}
          <span className="text-off-white">Jeukendrup</span>.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/methodology"
          className="font-heading uppercase tracking-wider text-xs border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          The Method protocol →
        </Link>
        <Link
          href="/tools/fuelling"
          className="font-heading uppercase tracking-wider text-xs border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          In-ride fuelling calculator →
        </Link>
        <a
          href="https://www.myfitnesspal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading uppercase tracking-wider text-xs border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          Track in MyFitnessPal ↗
        </a>
      </div>
      <p className="text-[11px] text-foreground-muted/70">
        Log the day&apos;s carb, protein and fat targets in MyFitnessPal (or
        your tracker of choice) to keep yourself honest against the plan.
      </p>
    </div>
  );
}

/* ─── Printable week (light theme, print-only) ────────────── */

function PrintableWeek({
  week,
  profile,
}: {
  week: WeekPlan;
  profile: UserProfile;
}) {
  const diet = profile.dietaryPreferences ?? [];
  return (
    <div className="fuel-print-area hidden print:block text-black">
      <div className="mb-4 border-b border-black/30 pb-2">
        <p className="text-[11px] tracking-[0.3em] uppercase">
          Roadman Method · Fuel Planner
        </p>
        <h1 className="font-heading uppercase text-3xl leading-none">
          Week {week.weekNumber} · {PHASE_LABEL[week.phase]}
          {week.isRecoveryWeek ? " · Recovery" : ""}
        </h1>
        <p className="text-sm">{formatRange(week.startDate)}</p>
        <p className="text-xs mt-1">
          {profile.weightKg}kg · {profile.ftp}W FTP ·{" "}
          {goalLabel(profile.bodyCompGoal)}
          {diet.length > 0
            ? ` · ${diet.map((d) => dietaryMeta(d).label).join(", ")}`
            : ""}
        </p>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-black/40">
            <th className="py-1 pr-2 font-heading uppercase">Day</th>
            <th className="py-1 pr-2 font-heading uppercase">Session</th>
            <th className="py-1 pr-2 font-heading uppercase text-right">Kcal</th>
            <th className="py-1 pr-2 font-heading uppercase text-right">Carb</th>
            <th className="py-1 pr-2 font-heading uppercase text-right">Prot</th>
            <th className="py-1 pr-2 font-heading uppercase text-right">Fat</th>
            <th className="py-1 font-heading uppercase text-right">In-ride</th>
          </tr>
        </thead>
        <tbody>
          {week.days.map((day, i) => (
            <tr key={day.date} className="border-b border-black/15 align-top">
              <td className="py-1.5 pr-2 whitespace-nowrap">
                {DAY_LABELS[i]} {formatShortDate(day.date)}
              </td>
              <td className="py-1.5 pr-2">
                {day.session ? day.session.name : "Rest"}
                {day.session?.isCompetition ? " (RACE)" : ""}
                {day.carbLoad ? (
                  <div className="text-[10px]">
                    Carb-load {day.carbLoad.label}: {day.carbLoad.targetCarbsG}g
                    ({day.carbLoad.gPerKg} g/kg)
                  </div>
                ) : null}
              </td>
              <td className="py-1.5 pr-2 text-right">{day.totals.calories}</td>
              <td className="py-1.5 pr-2 text-right">{day.totals.carbsG}g</td>
              <td className="py-1.5 pr-2 text-right">{day.totals.proteinG}g</td>
              <td className="py-1.5 pr-2 text-right">{day.totals.fatG}g</td>
              <td className="py-1.5 text-right">
                {day.totals.inRideCarbsGPerHr > 0
                  ? `${day.totals.inRideCarbsGPerHr}g/hr`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-black/40 font-heading">
            <td className="py-1.5 pr-2 uppercase" colSpan={2}>
              Week total
            </td>
            <td className="py-1.5 pr-2 text-right">
              {Math.round(week.weeklyTotals.calories)}
            </td>
            <td className="py-1.5 pr-2 text-right">
              {week.weeklyTotals.carbsG}g
            </td>
            <td className="py-1.5 pr-2 text-right">
              {week.weeklyTotals.proteinG}g
            </td>
            <td className="py-1.5 pr-2 text-right">{week.weeklyTotals.fatG}g</td>
            <td className="py-1.5 text-right">
              {week.weeklyTotals.trainingHours}h
            </td>
          </tr>
        </tfoot>
      </table>

      {diet.length > 0 && (
        <div className="mt-3 text-[11px]">
          <p className="font-heading uppercase">Dietary notes</p>
          {diet.map((d) => {
            const m = dietaryMeta(d);
            return (
              <p key={m.value}>
                <strong>{m.short}:</strong> {m.guidance}
              </p>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[10px] text-black/60">
        Roadman Method Fuel Planner · Mifflin-St Jeor RMR + Hexis/Impey FFTWR ·
        carb periodisation after Morton · race carb-load after Impey · in-ride
        carbs after Jeukendrup. Targets are a starting point — adjust to how you
        feel and perform.
      </p>
    </div>
  );
}

/* ─── Formatting ──────────────────────────────────────── */

function formatRange(weekStartISO: string): string {
  const start = parseISO(weekStartISO);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return `${formatShortDate(weekStartISO)} – ${formatShortDate(toISO(end))}`;
}

function formatShortDate(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function toISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function goalLabel(g: string): string {
  if (g === "lose") return "Cut";
  if (g === "gain") return "Build";
  return "Maintain";
}

function activityLabel(a: string): string {
  return a.charAt(0).toUpperCase() + a.slice(1);
}
