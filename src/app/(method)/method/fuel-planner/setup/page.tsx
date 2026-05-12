import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { AssessmentForm } from "../_components/AssessmentForm";
import { PlannerNav } from "../_components/PlannerNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rider setup · Fuel Planner",
  robots: { index: false, follow: false },
};

export default async function FuelPlannerSetupPage() {
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/fuel-planner/setup] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  return (
    <Container as="section" width="narrow" className="py-8 md:py-12">
      <header className="mb-6">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
          FUEL PLANNER
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-3xl sm:text-4xl md:text-5xl">
          Rider setup
        </h1>
        <p className="mt-2 text-sm md:text-base text-foreground-muted">
          Tell the engine who&apos;s riding. Resting metabolic rate, exercise
          energy, and macro targets all flow from these inputs.
        </p>
      </header>

      <PlannerNav active="setup" />
      <AssessmentForm />
    </Container>
  );
}
