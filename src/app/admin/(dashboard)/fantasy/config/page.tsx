import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { fantasyGameConfig } from "@/lib/db/schema";
import { loadGameConfig } from "@/lib/fantasy/queries";
import { LAUNCH_DEFAULTS } from "@/lib/fantasy/config";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/admin/ui";
import { ConfigManager, type OverrideRow } from "./ConfigManager";

export const dynamic = "force-dynamic";

export default async function FantasyConfigPage() {
  await requireAdmin();

  const config = await loadGameConfig();
  const overrideRows = await db
    .select()
    .from(fantasyGameConfig)
    .orderBy(asc(fantasyGameConfig.key));

  const overrides: OverrideRow[] = overrideRows.map((row) => ({
    key: row.key,
    valueJson: JSON.stringify(row.value),
    updatedBy: row.updatedBy ?? "—",
    updatedAt: row.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Game config"
        subtitle="Every rule number in the game, tunable without a deploy. Overrides merge over the launch defaults per key."
      />

      <Card>
        <CardHeader
          title="Effective config"
          subtitle={
            <>
              Launch defaults merged with the overrides below. Note: <code>tttIndividualTimes</code>{" "}
              is the Stage 1 fallback toggle — set it to <code>false</code> if ASO only publishes
              per-team TTT results, so riders score from the team-order table instead of
              individual positions.
            </>
          }
        />
        <CardBody compact className="pt-0">
          <pre className="text-xs font-mono text-foreground-muted bg-[var(--color-sunken)] border border-[var(--color-border)] rounded-[var(--radius-admin-md)] p-4 overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </CardBody>
      </Card>

      <ConfigManager overrides={overrides} knownKeys={Object.keys(LAUNCH_DEFAULTS)} />
    </div>
  );
}
