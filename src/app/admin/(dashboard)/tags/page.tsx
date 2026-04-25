import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin/auth";
import { listAllTags } from "@/lib/crm/tags";
import { TagsClient } from "./TagsClient";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin");

  const tags = await listAllTags();
  const totalUsage = tags.reduce((sum, t) => sum + t.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider">TAGS</h1>
        <p className="text-sm text-foreground-muted mt-1">
          {tags.length} distinct tag{tags.length === 1 ? "" : "s"} $· {totalUsage} total usage
          {totalUsage === 1 ? "" : "s"} across contacts. Rename to fix typos, merge variants,
          or delete unused tags.
        </p>
      </div>
      <TagsClient initialTags={tags} />
    </div>
  );
}
