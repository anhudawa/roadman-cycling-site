import { requireAuth } from "@/lib/admin/auth";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./_components/CommandPalette";
import { countOverdueTasksFor } from "@/lib/crm/tasks";

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
    // table may not exist yet in some envs — swallow
  }

  return (
    <div className="min-h-screen bg-charcoal flex">
      <AdminSidebar
        currentUser={{ slug: user.slug, name: user.name, email: user.email }}
        overdueTaskCount={overdueTasks}
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
