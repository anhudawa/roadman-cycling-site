import { asc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { fantasyProTeams, fantasyRiders } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { RidersManager, type ProTeamOption, type RiderRow } from "./RidersManager";

export const dynamic = "force-dynamic";

export default async function FantasyRidersPage() {
  await requireAdmin();

  const riderRows = await db
    .select({
      id: fantasyRiders.id,
      name: fantasyRiders.name,
      pcsId: fantasyRiders.pcsId,
      proTeamId: fantasyRiders.proTeamId,
      proTeamName: fantasyProTeams.name,
      proTeamCode: fantasyProTeams.code,
      riderClass: fantasyRiders.riderClass,
      price: fantasyRiders.price,
      status: fantasyRiders.status,
      countryCode: fantasyRiders.countryCode,
      sourceUrl: fantasyRiders.sourceUrl,
      abandonedAfterStage: fantasyRiders.abandonedAfterStage,
    })
    .from(fantasyRiders)
    .innerJoin(fantasyProTeams, eq(fantasyProTeams.id, fantasyRiders.proTeamId))
    .orderBy(sql`${fantasyRiders.price} DESC`, asc(fantasyRiders.name));

  const teams: ProTeamOption[] = await db
    .select({
      id: fantasyProTeams.id,
      name: fantasyProTeams.name,
      code: fantasyProTeams.code,
    })
    .from(fantasyProTeams)
    .orderBy(asc(fantasyProTeams.name));

  const riders: RiderRow[] = riderRows;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startlist"
        subtitle="Rider pool, pricing, and the provisional → confirmed lifecycle. Every change needs a source URL."
      />
      <RidersManager riders={riders} teams={teams} />
    </div>
  );
}
