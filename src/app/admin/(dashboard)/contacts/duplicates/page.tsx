import { requireAdmin } from "@/lib/admin/auth";
import { findDuplicateGroups } from "@/lib/crm/dedup";
import { DuplicatesClient } from "./DuplicatesClient";

export const dynamic = "force-dynamic";

export default async function DuplicatesPage() {
  await requireAdmin();
  const groups = await findDuplicateGroups(50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider">
          DUPLICATE CONTACTS
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          {groups.length} potential duplicate {groups.length === 1 ? "group" : "groups"} detected.
          Pick a primary record and merge $— this is irreversible.
        </p>
      </div>
      <DuplicatesClient initialGroups={groups} />
    </div>
  );
}
