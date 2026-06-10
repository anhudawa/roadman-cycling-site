import { notFound } from "next/navigation";
import { ClusterHubPage, hubMetadata } from "@/components/features/hubs/ClusterHubPage";
import { getClusterHubByPath } from "@/lib/cluster-hubs";

const def = getClusterHubByPath("/masters/vo2max");

export const metadata = def ? hubMetadata(def) : {};

export default function MastersVo2maxHubPage() {
  if (!def) notFound();
  return <ClusterHubPage def={def} />;
}
