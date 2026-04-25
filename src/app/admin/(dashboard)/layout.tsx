import { requireAuth } from "@/lib/admin/auth";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./_components/CommandPalette";
import { countOverdueTasksFor } from "@/lib/crm/tasks";
import { db } from "@/lib/db";
import {
  tedDrafts,
  tedWelcomeQueue,
  tedSurfaceDrafts,
} from "@/lib/db/schema";
import { inArray, sql } from "drizzle-orm";

async function countTedPending(): Promise<number> {
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
    // Tables may not exist pre-migration; show no badge.
    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  let overdueTasks = 0;
  try {
    overdueTasks = await countOverdueTasksFor(user.slug);
  } catch {
    // table may not exist yet in some envs $€” swallow
  }

  const tedPending = await countTedPending();

  return (
    <div className="min-h-screen bg-charcoal flex">
      <AdminSidebar
        currentUser={{ slug: user.slug, name: user.name, email: user.email, role: user.role }}
        overdueTaskCount={overdueTasks}
        tedPendingCount={tedPending}
      />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
        {/* Top bar with notification bell */}
        <div className="sticky top-0 z-20 bg-charcoal/80 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-end px-4 sm:px-6 lg:px-8 h-12 max-w-7xl mx-auto">
            <NotificationBell />
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
