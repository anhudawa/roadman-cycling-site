import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getFuelState } from "@/lib/method/fuel-state";
import type { FuelPlannerState } from "@/lib/fuel-planner/storage";
import { FuelCalendar } from "./_components/FuelCalendar";
import { FuelPlannerSync } from "./_components/FuelPlannerSync";
import { PlannerNav } from "./_components/PlannerNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fuel Planner · The Method",
  robots: { index: false, follow: false },
};

export default async function FuelPlannerPage() {
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/fuel-planner] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  const serverFuelState = (await getFuelState(session.enrollment.id).catch(
    () => null,
  )) as FuelPlannerState | null;

  return (
    <Container as="section" width="wide" className="py-8 md:py-12">
      <header className="mb-6">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
          THE ROADMAN METHOD
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-3xl sm:text-4xl md:text-5xl">
          Fuel planner
        </h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-foreground-muted">
          Your training plan, fuelled. Daily macros and in-ride carbs prescribed
          session by session — built on the Hexis/Impey Fuel For The Work
          Required methodology.
        </p>
      </header>

      <PlannerNav active="calendar" />
      <FuelPlannerSync serverState={serverFuelState}>
        <FuelCalendar />
      </FuelPlannerSync>
    </Container>
  );
}
