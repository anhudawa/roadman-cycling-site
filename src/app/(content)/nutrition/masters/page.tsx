import { notFound } from "next/navigation";
import { ClusterHubPage, hubMetadata } from "@/components/features/hubs/ClusterHubPage";
import { getClusterHubByPath } from "@/lib/cluster-hubs";

const def = getClusterHubByPath("/nutrition/masters");

export const metadata = def ? hubMetadata(def) : {};

export default function MastersNutritionHubPage() {
  if (!def) notFound();
  return <ClusterHubPage def={def} />;
}
