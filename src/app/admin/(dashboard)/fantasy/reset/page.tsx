import { requireAdmin } from "@/lib/admin/auth";
import { loadGameConfig } from "@/lib/fantasy/queries";
import { previewReset } from "@/lib/fantasy/reset";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/admin/ui";
import { ResetPanel } from "./ResetPanel";

export const dynamic = "force-dynamic";

export default async function FantasyResetPage() {
  await requireAdmin();

  const config = await loadGameConfig();
  let preview = null;
  try {
    preview = await previewReset("demo-full");
  } catch {
    // DB unreachable — the panel still renders, counts load on demand.
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo & reset"
        subtitle="Demo the full game before launch, then wipe it clean before the Tour. Locked once Stage 1 rolls out."
      />

      <Card>
        <CardHeader
          title="How the demo window works"
          subtitle={
            <>
              1. Set <code>demoMode</code> to <code>true</code> in Config — signups get tagged as
              demo and the public game shows a demo banner. 2. Seed fictional riders with{" "}
              <code>npm run fantasy:seed-demo</code>, build teams, enter results, publish scores.
              3. Before launch: run the full demo wipe below, set <code>demoMode</code> back to{" "}
              <code>false</code>, import the real startlist.
            </>
          }
        />
        <CardBody compact className="pt-0">
          <p className="text-sm text-foreground-muted">
            demoMode is currently{" "}
            <code className={config.demoMode ? "text-[var(--color-warn)]" : "text-[var(--color-good)]"}>
              {String(config.demoMode)}
            </code>
            . Stages, the 23 pro teams, game config, and the audit log are never touched by either
            reset.
          </p>
        </CardBody>
      </Card>

      <ResetPanel initialPreview={preview} />
    </div>
  );
}
