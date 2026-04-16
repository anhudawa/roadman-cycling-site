import { db } from "@/lib/db";
import { tedKillSwitch } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { SettingsPanel } from "./_components/SettingsPanel";
import { TriggerPanel } from "./_components/TriggerPanel";

export const dynamic = "force-dynamic";

export default async function TedSettingsPage() {
  await requireAuth();

  const rows = await db
    .select()
    .from(tedKillSwitch)
    .where(eq(tedKillSwitch.id, 1))
    .limit(1);

  const row = rows[0];
  const state = row ?? {
    id: 1,
    paused: false,
    pausedBySlug: null,
    pausedAt: null,
    reason: null,
    postPromptEnabled: false,
    postWelcomeEnabled: false,
    surfaceThreadsEnabled: false,
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted — settings</h1>
        <p className="text-sm text-foreground-subtle">
          Kill switch + per-job posting gates. Scheduled jobs read these on every run.
        </p>
      </div>

      <SettingsPanel
        initial={{
          paused: state.paused,
          reason: state.reason ?? "",
          postPromptEnabled: state.postPromptEnabled,
          postWelcomeEnabled: state.postWelcomeEnabled,
          surfaceThreadsEnabled: state.surfaceThreadsEnabled,
        }}
      />

      <TriggerPanel />
    </div>
  );
}
