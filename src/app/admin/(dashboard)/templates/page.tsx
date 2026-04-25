import { requireAuth } from "@/lib/admin/auth";
import { listTemplates } from "@/lib/crm/email";
import { TemplatesManager } from "./_components/TemplatesManager";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuth();
  const sp = await searchParams;
  const slugRaw = sp.slug;
  const focusSlug = typeof slugRaw === "string" ? slugRaw : null;

  const rows = await listTemplates();
  const templates = rows.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
          Email Templates
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Reusable email bodies. Use {"{{first_name}}"}, {"{{name}}"}, {"{{email}}"} or{" "}
          {"{{agent_name}}"} placeholders $— they get replaced when you send.
        </p>
      </div>
      <TemplatesManager initial={templates} focusSlug={focusSlug} />
    </div>
  );
}
