"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DAY_LABELS,
  generateCalendar,
} from "@/lib/fuel-planner";
import type { DayPlan, MealMacros, WeekPlan } from "@/lib/fuel-planner/types";
import { loadState } from "@/lib/fuel-planner/storage";

const FUEL_CATEGORY_LABEL: Record<string, string> = {
  REST: "Rest",
  LOW: "Low",
  LOW_MODERATE: "Low-Mod",
  MODERATE: "Moderate",
  MODERATE_HIGH: "Mod-High",
  HIGH: "High",
  VERY_HIGH: "V.High",
};

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
  const [missingProfile, setMissingProfile] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => {
    const state = loadState();
    if (!state) {
      setMissingProfile(true);
      return;
    }
    const generated = generateCalendar(state.profile, state.pattern, state.meals, {
      startDate: state.startDate,
      numWeeks: 12,
    });
    setWeeks(generated);
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

  return (
    <div className="space-y-6">
      <WeekNav
        weeks={weeks}
        activeIndex={activeWeek}
        onChange={setActiveWeek}
      />

      <WeekSummary week={week} />

      <ol className="grid gap-3 md:gap-4">
        {week.days.map((day, i) => (
          <li key={day.date}>
            <DayCard day={day} dayLabel={DAY_LABELS[i] ?? ""} />
          </li>
        ))}
      </ol>

      <ProfileBar />
    </div>
  );
}

/* ─── Week navigation ──────────────────────────────────────── */

function WeekNav({
  weeks,
  activeIndex,
  onChange,
}: {
  weeks: WeekPlan[];
  activeIndex: number;
  onChange: (i: number) => void;
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
