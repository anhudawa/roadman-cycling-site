import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { SegmentBuilder } from "../_components/SegmentBuilder";

export const dynamic = "force-dynamic";

export default async function NewSegmentPage() {
  await requireAuth();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/segments" className="text-xs text-foreground-subtle hover:text-accent">
          $Üê Segments
        </Link>
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase mt-2">
          New Segment
        </h1>
      </div>
      <SegmentBuilder mode="create" />
    </div>
  );
}
