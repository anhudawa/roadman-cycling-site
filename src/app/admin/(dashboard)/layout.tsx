import { requireAuth } from "@/lib/admin/auth";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-charcoal flex">
      <AdminSidebar />
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
    </div>
  );
}
