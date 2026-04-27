import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { Card, CardBody, PageHeader } from "@/components/admin/ui";
import {
  listAllPrompts,
  getLatestRunMatrix,
  type BrandPrompt,
  type LatestRun,
} from "@/lib/citation-tests/store";
import {
  createPromptAction,
  togglePromptAction,
  deletePromptAction,
  runNowAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function CitationsAdminPage() {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/admin/my-day");

  let prompts: BrandPrompt[] = [];
  let matrix: LatestRun[] = [];
  try {
    [prompts, matrix] = await Promise.all([
      listAllPrompts(),
      getLatestRunMatrix(),
    ]);
  } catch {
    // brand_prompts or brand_citation_runs missing — render empty state.
  }

  // Group latest runs by promptId for the matrix column.
  const byPrompt = new Map<number, LatestRun[]>();
  for (const r of matrix) {
    const list = byPrompt.get(r.promptId) ?? [];
    list.push(r);
    byPrompt.set(r.promptId, list);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brand citation tests"
        subtitle="Prompts run weekly against ChatGPT, Perplexity, Claude, Gemini"
        actions={
          <form action={runNowAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs rounded bg-[var(--color-accent)] text-white hover:opacity-90"
            >
              Run now
            </button>
          </form>
        }
      />

      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Add prompt
          </h2>
          <form action={createPromptAction} className="flex flex-col gap-3">
            <textarea
              name="prompt"
              required
              rows={2}
              placeholder="e.g. What is zone 2 training and how should an amateur cyclist do it?"
              className="text-sm bg-transparent border border-[var(--color-border)] rounded p-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]"
            />
            <div className="flex gap-3">
              <input
                name="category"
                defaultValue="general"
                className="text-sm bg-transparent border border-[var(--color-border)] rounded p-2 flex-1 text-[var(--color-fg)]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
              >
                Add
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Prompts ({prompts.length})
          </h2>
          {prompts.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-subtle)]">
              No prompts yet. Run{" "}
              <code className="text-[10px] px-1 py-0.5 rounded bg-white/5">
                npm run seed:brand-prompts
              </code>{" "}
              to load the 12 starter prompts, or add one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
                    <th className="pb-2 pr-4">Prompt</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Latest results</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((p) => {
                    const runs = byPrompt.get(p.id) ?? [];
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-white/[0.03] align-top"
                      >
                        <td className="py-2 pr-4 text-sm text-[var(--color-fg)] max-w-[28rem]">
                          {p.prompt}
                        </td>
                        <td className="py-2 pr-4 text-xs text-[var(--color-fg-muted)]">
                          {p.category}
                        </td>
                        <td className="py-2 pr-4 text-xs">
                          {runs.length === 0 ? (
                            <span className="text-[var(--color-fg-subtle)]">
                              —
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {runs.map((r) => {
                                const cls = r.error
                                  ? "bg-[var(--color-bad-tint)] text-[var(--color-bad)]"
                                  : r.mentioned
                                    ? "bg-[var(--color-good-tint)] text-[var(--color-good)]"
                                    : "bg-[var(--color-warn-tint)] text-[var(--color-warn)]";
                                const glyph = r.error
                                  ? "✕"
                                  : r.mentioned
                                    ? "✓"
                                    : "○";
                                return (
                                  <span
                                    key={r.model}
                                    title={`${r.model} · ${r.ranAt
                                      .toISOString()
                                      .slice(0, 10)}${r.error ? " · " + r.error : ""}`}
                                    className={`px-1.5 py-0.5 rounded text-[10px] ${cls}`}
                                  >
                                    {r.model.split(":")[0]} {glyph}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-xs">
                          <form action={togglePromptAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              type="hidden"
                              name="enabled"
                              value={String(!p.enabled)}
                            />
                            <button
                              type="submit"
                              className="underline text-[var(--color-fg-muted)]"
                            >
                              {p.enabled ? "Disable" : "Enable"}
                            </button>
                          </form>
                        </td>
                        <td className="py-2 text-right">
                          <form action={deletePromptAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              className="text-xs text-[var(--color-bad)] underline"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
