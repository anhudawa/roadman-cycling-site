import { redirect } from "next/navigation";

// Revenue consolidated into Mission Control (which now shows MRR, glide
// path, churn, and pulls from the same Stripe snapshot table). Keep this
// route as a permanent redirect so bookmarks don't 404.
export default function RevenueRedirect() {
  redirect("/admin/mission-control");
}
