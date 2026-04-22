import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listTasks, countOpenTasksFor, type TaskDueFilter, type TaskStatusFilter } from "@/lib/crm/tasks";
import { TasksTable } from "./_components/TasksTable";
import { AddTaskButton } from "./_components/AddTaskButton";

export const dynamic = "force-dynamic";

const SCOPE_OPTIONS = [
  { value: "mine", label: "My Tasks" },
  { value: "all", label: "All Tasks" },
];
const STATUS_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];
const DUE_OPTIONS: { value: TaskDueFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "overdue", label: "Overdue" },
];

function linkFor(base: Record<string, string>, override: Record<string, string>): string {
  const merged = { ...base, ...override };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/admin/tasks?${s}` : "/admin/tasks";
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  const scope = (typeof sp.scope === "string" ? sp.scope : "mine") === "all" ? "all" : "mine";
  const statusRaw = typeof sp.status === "string" ? sp.status : "open";
  const status: TaskStatusFilter = (["open", "completed", "all"] as const).includes(
    statusRaw as TaskStatusFilter
  )
    ? (statusRaw as TaskStatusFilter)
    : "open";
  const dueRaw = typeof sp.due === "string" ? sp.due : "any";
  const due: TaskDueFilter = (["any", "today", "this_week", "overdue"] as const).includes(
    dueRaw as TaskDueFilter
  )
    ? (dueRaw as TaskDueFilter)
    : "any";

  const assignedTo = scope === "mine" ? user.slug : undefined;

  const [{ rows }, myOpenCount] = await Promise.all([
    listTasks({ assignedTo, status, due, limit: 200 }),
    countOpenTasksFor(user.slug),
  ]);

  const base = { scope, status, due };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider">TASKS</h1>
          <p className="text-sm text-foreground-muted mt-1">
            {myOpenCount} open {myOpenCount === 1 ? "task" : "tasks"} assigned to you
          </p>
        </div>
        <AddTaskButton currentSlug={user.slug} />
      </div>

      {/* Scope tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/5">
        {SCOPE_OPTIONS.map((s) => {
          const active = scope === s.value;
          return (
            <Link
              key={s.value}
              href={linkFor(base, { scope: s.value })}
              className={`px-4 py-2 text-sm font-heading tracking-wider border-b-2 -mb-px transition-colors ${
                active
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {s.label.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-foreground-subtle uppercase tracking-widest">Status:</span>
          {STATUS_OPTIONS.map((s) => (
            <Link
              key={s.value}
              href={linkFor(base, { status: s.value })}
              className={`px-2 py-1 rounded border ${
                status === s.value
                  ? "border-[var(--color-border-strong)] bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground-subtle uppercase tracking-widest">Due:</span>
          {DUE_OPTIONS.map((d) => (
            <Link
              key={d.value}
              href={linkFor(base, { due: d.value })}
              className={`px-2 py-1 rounded border ${
                due === d.value
                  ? "border-[var(--color-border-strong)] bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>
      </div>

      <TasksTable rows={rows} />
    </div>
  );
}
