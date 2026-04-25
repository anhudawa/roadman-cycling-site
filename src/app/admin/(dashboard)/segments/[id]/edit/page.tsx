import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getSegment } from "@/lib/crm/segments";
import { SegmentBuilder, type SegmentDraft } from "../../_components/SegmentBuilder";

export const dynamic = "force-dynamic";

export default async function EditSegmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const segment = await getSegment(id);
  if (!segment) notFound();

  const draft: SegmentDraft = {
    id: segment.id,
    name: segment.name,
    description: segment.description ?? "",
    filters: segment.filters,
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/segments/${id}`} className="text-xs text-foreground-subtle hover:text-accent">
          $Üê {segment.name}
        </Link>
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase mt-2">
          Edit Segment
        </h1>
      </div>
      <SegmentBuilder mode="edit" initial={draft} />
    </div>
  );
}
