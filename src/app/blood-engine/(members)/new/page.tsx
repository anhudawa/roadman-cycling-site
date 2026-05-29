import { Section, Container } from "@/components/layout";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { listReports } from "@/lib/blood-engine/db";
import type { ReportContext } from "@/lib/blood-engine/schemas";
import { NewReportWizard } from "./NewReportWizard";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const user = await requireBloodEngineAccess();
  const tosAlreadyAccepted = !!user.tosAcceptedAt;

  // Pre-fill demographic / training context from the user's most recent report.
  // Symptoms and drawDate are intentionally NOT carried forward — those should
  // reflect the new report, not the last one.
  const previous = await listReports(user.id);
  const lastCtx = previous[0]?.context as ReportContext | undefined;
  const initialContext = lastCtx
    ? {
        age: lastCtx.age,
        sex: lastCtx.sex,
        trainingHoursPerWeek: lastCtx.trainingHoursPerWeek,
        trainingPhase: lastCtx.trainingPhase,
      }
    : null;

  return (
    <Section background="deep-purple">
      <Container width="narrow">
        <p className="font-heading tracking-[0.3em] text-coral text-sm mb-4">
          New report
        </p>
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-10">
          Decode your bloodwork
        </h1>
        <NewReportWizard
          tosAlreadyAccepted={tosAlreadyAccepted}
          initialContext={initialContext}
          hasPreviousReports={previous.length > 0}
        />
      </Container>
    </Section>
  );
}
