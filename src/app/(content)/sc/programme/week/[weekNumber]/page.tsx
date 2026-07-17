import type { Metadata } from "next";
import { getWeek, type Phase } from "@/lib/sc-programme";
import WorkoutTracker from "./WorkoutTracker";

/* ------------------------------------------------------------------ */
/*  Static generation                                                  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({ weekNumber: String(i + 1) }));
}

type Props = { params: Promise<{ weekNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { weekNumber } = await params;
  const week = getWeek(Number(weekNumber));
  return {
    title: `Week ${weekNumber} — ${week?.phaseLabel ?? "S&C Programme"} | Roadman Cycling`,
    description: `Week ${weekNumber} of the 12-week Strength & Conditioning programme. ${week?.phaseLabel}. Push/Pull split with video demos and workout tracking.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Phase colour mapping                                               */
/* ------------------------------------------------------------------ */

const PHASE_META: Record<Phase, { bg: string; tag: string }> = {
  gpp: { bg: "bg-[#4C1273]", tag: "GPP" },
  strength: { bg: "bg-[#F16363]", tag: "STRENGTH" },
  power: { bg: "bg-[#4AAE8C]", tag: "POWER" },
  deload: { bg: "bg-[#545559]", tag: "DELOAD" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function WeekDetailPage({ params }: Props) {
  const { weekNumber } = await params;
  const weekNum = Number(weekNumber);
  const week = getWeek(weekNum);

  if (!week) {
    return (
      <div className="bg-[#210140] min-h-screen flex items-center justify-center">
        <p className="text-[#B0B0B5] text-lg">Week not found.</p>
      </div>
    );
  }

  const meta = PHASE_META[week.phase];
  const prevWeek = weekNum > 1 ? weekNum - 1 : null;
  const nextWeek = weekNum < 12 ? weekNum + 1 : null;

  return (
    <WorkoutTracker
      weekNumber={weekNum}
      phaseLabel={week.phaseLabel}
      days={week.days}
      coreCircuit={week.coreCircuit}
      gluteActivation={week.gluteActivation}
      prevWeek={prevWeek}
      nextWeek={nextWeek}
      phaseBg={meta.bg}
      phaseTag={meta.tag}
      isDeload={week.isDeload}
    />
  );
}
