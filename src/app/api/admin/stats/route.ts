import { isAuthenticated } from "@/lib/admin/auth";
import {
  getDashboardStats,
  getPageStats,
  getRecentLeads,
  getTrafficStats,
  getLeadTotals,
} from "@/lib/admin/events-store";

export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "dashboard";

  try {
    switch (view) {
      case "dashboard":
        return Response.json(await getDashboardStats());

      case "emails":
        return Response.json(await getPageStats());

      case "leads":
        return Response.json({
          leads: await getRecentLeads(),
          totals: await getLeadTotals(),
        });

      case "traffic":
        return Response.json(await getTrafficStats());

      default:
        return Response.json({ error: "Unknown view" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Admin Stats API] Error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
