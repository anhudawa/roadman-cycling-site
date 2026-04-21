import { redirect } from "next/navigation";

// Leads consolidated into the Funnel page (which covers signups, per-source
// breakdown, and cohort retention). Redirect preserves bookmarks.
export default function LeadsRedirect() {
  redirect("/admin/funnel");
}
