import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  tedDrafts,
  tedWelcomeQueue,
  tedSurfaceDrafts,
} from "@/lib/db/schema";
import { inArray, sql } from "drizzle-orm";
import { TedNav } from "./_components/TedNav";

export const metadata: Metadata = {
  title: "Ted | Roadman Admin",
};

export const dynamic = "force-dynamic";

async function countPendingApprovals(): Promise<number> {
  try {
    const [prompts, welcomes, surfaces] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(tedDrafts)
        .where(inArray(tedDrafts.status, ["draft", "voice_flagged"])),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tedWelcomeQueue)
        .where(inArray(tedWelcomeQueue.status, ["drafted", "failed"])),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tedSurfaceDrafts)
        .where(inArray(tedSurfaceDrafts.status, ["drafted", "voice_flagged"])),
    ]);
    return (
      Number(prompts[0]?.count ?? 0) +
      Number(welcomes[0]?.count ?? 0) +
      Number(surfaces[0]?.count ?? 0)
    );
  } catch {
    // Table may not exist in some envs (pre-migration) — degrade to 0.
    return 0;
  }
}

export default async function TedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pendingCount = await countPendingApprovals();
  return (
    <div className="space-y-4">
      <TedNav pendingCount={pendingCount} />
      {children}
    </div>
  );
}
