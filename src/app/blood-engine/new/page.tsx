import { Section, Container } from "@/components/layout";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { NewReportWizard } from "./NewReportWizard";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const user = await requireBloodEngineAccess();
  const tosAlreadyAccepted = !!user.tosAcceptedAt;

  return (
    <Section background="deep-purple">
      <Container width="narrow">
        <p className="font-heading tracking-[0.3em] text-coral text-sm mb-4">
          New report
        </p>
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-10">
          Decode your bloodwork
        </h1>
        <NewReportWizard tosAlreadyAccepted={tosAlreadyAccepted} />
      </Container>
    </Section>
  );
}
