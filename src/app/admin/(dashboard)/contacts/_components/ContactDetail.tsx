"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OWNERS = [
  { value: "", label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

const STAGES = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

interface Contact {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  owner: string | null;
  tags: string[];
  customFields: Record<string, unknown>;
  lifecycleStage: string;
  firstSeenAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  source: string | null;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  body: string | null;
  meta: Record<string, unknown> | null;
  authorName: string | null;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
  assignedTo: string | null;
  createdBy: string | null;
  createdAt: string;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const dys = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dys < 30) return `${dys}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface BeehiivEnrichment {
  subscriberId: string;
  status: "active" | "unsubscribed" | "pending" | "inactive";
  subscribedAt: string | null;
  tier: string | null;
  totalOpens: number;
  totalClicks: number;
  lastOpenedAt: string | null;
  lastClickedAt: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

interface StripeSubSummary {
  id: string;
  status: string;
  priceId: string;
  productName: string;
  currentPeriodEnd: string | null;
  amountCents: number;
}

interface StripeEnrichment {
  customerId: string;
  lifetimeValueCents: number;
  subscriptions: StripeSubSummary[];
  lastPaymentAt: string | null;
  totalPayments: number;
}

interface EnrichmentBlob {
  beehiiv: BeehiivEnrichment | null;
  stripe: StripeEnrichment | null;
  enrichedAt: string;
}

function extractEnrichmentBlob(cf: Record<string, unknown>): EnrichmentBlob | null {
  const e = cf?.enrichment;
  if (!e || typeof e !== "object") return null;
  return e as EnrichmentBlob;
}

function formatGbp(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function beehiivStatusClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "unsubscribed":
    case "inactive":
    default:
      return "bg-white/5 text-foreground-muted border-white/10";
  }
}

function activityDotColor(type: string): string {
  switch (type) {
    case "contact_submission":
      return "bg-coral";
    case "cohort_application":
      return "bg-amber-400";
    case "note":
      return "bg-blue-400";
    case "email_sent":
      return "bg-purple-400";
    case "stage_change":
      return "bg-green-400";
    case "assigned":
      return "bg-cyan-400";
    case "enrichment_beehiiv":
      return "bg-pink-400";
    case "enrichment_stripe_purchase":
      return "bg-emerald-400";
    case "tag_added":
    case "tag_removed":
      return "bg-white/30";
    case "task_created":
    case "task_completed":
      return "bg-yellow-400";
    default:
      return "bg-white/20";
  }
}

export function ContactDetail({
  contact: initialContact,
  activities: initialActivities,
  tasks: initialTasks,
}: {
  contact: Contact;
  activities: Activity[];
  tasks: Task[];
}) {
  const router = useRouter();
  const [contact, setContact] = useState(initialContact);
  const [activities, setActivities] = useState(initialActivities);
  const [tasks, setTasks] = useState(initialTasks);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [newTag, setNewTag] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskAssigned, setTaskAssigned] = useState("");
  const [busy, setBusy] = useState(false);

  async function patchContact(updates: Partial<Contact>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CRM-User": "admin" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        if (data.activity) setActivities((prev) => [data.activity, ...prev]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    if (!noteTitle.trim() && !noteBody.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contact.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CRM-User": "admin" },
        body: JSON.stringify({
          type: "note",
          title: noteTitle.trim() || "Note",
          body: noteBody.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [data.activity, ...prev]);
        setNoteTitle("");
        setNoteBody("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function addTag() {
    const tag = newTag.trim();
    if (!tag) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contact.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CRM-User": "admin" },
        body: JSON.stringify({ tag }),
      });
      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        if (data.activity) setActivities((prev) => [data.activity, ...prev]);
        setNewTag("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeTag(tag: string) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/crm/contacts/${contact.id}/tags/${encodeURIComponent(tag)}`,
        {
          method: "DELETE",
          headers: { "X-CRM-User": "admin" },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        if (data.activity) setActivities((prev) => [data.activity, ...prev]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contact.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CRM-User": "admin" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          dueAt: taskDue || null,
          assignedTo: taskAssigned || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        if (data.activity) setActivities((prev) => [data.activity, ...prev]);
        setTaskTitle("");
        setTaskDue("");
        setTaskAssigned("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function completeTask(taskId: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CRM-User": "admin" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        if (data.activity) setActivities((prev) => [data.activity, ...prev]);
      }
    } finally {
      setBusy(false);
    }
  }

  const openTasks = tasks.filter((t) => !t.completedAt);
  const customFieldEntries = Object.entries(contact.customFields ?? {}).filter(
    ([k]) => k !== "enrichment"
  );
  const enrichment = extractEnrichmentBlob(contact.customFields);

  async function refreshEnrichment() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contact.id}/enrich`, {
        method: "POST",
        headers: { "X-CRM-User": "admin" },
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/contacts")}
          className="text-xs text-foreground-subtle hover:text-off-white transition-colors"
        >
          &larr; Back to contacts
        </button>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider">
            {(contact.name ?? contact.email).toUpperCase()}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">{contact.email}</p>
          {contact.phone && (
            <p className="text-sm text-foreground-muted">{contact.phone}</p>
          )}
        </div>
        <a
          href={`mailto:${contact.email}`}
          className="px-4 py-2 bg-coral text-white text-sm font-heading tracking-wider rounded-lg hover:bg-coral/90 transition-colors"
        >
          EMAIL
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column: timeline + tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add note */}
          <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
              Add Note
            </p>
            <input
              type="text"
              placeholder="Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-2 px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
            />
            <textarea
              placeholder="Body (optional)"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={3}
              className="w-full mb-2 px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50 resize-none"
            />
            <button
              onClick={addNote}
              disabled={busy}
              className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase bg-coral/20 text-coral border border-coral/30 rounded hover:bg-coral/30 disabled:opacity-50"
            >
              Add Note
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-4">
              Timeline
            </p>
            {activities.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${activityDotColor(a.type)}`} />
                      <span className="flex-1 w-px bg-white/5 mt-1" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm text-off-white">{a.title}</p>
                        <span className="text-xs text-foreground-subtle shrink-0">
                          {relativeTime(a.createdAt)}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mt-0.5">
                        {a.type.replace(/_/g, " ")}
                        {a.authorName ? ` · ${a.authorName}` : ""}
                      </p>
                      {a.body && (
                        <p className="text-sm text-foreground-muted mt-2 whitespace-pre-wrap">
                          {a.body}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
              Tasks
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              />
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className="px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              />
              <select
                value={taskAssigned}
                onChange={(e) => setTaskAssigned(e.target.value)}
                className="px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              >
                <option value="">Unassigned</option>
                {OWNERS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addTask}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase bg-coral/20 text-coral border border-coral/30 rounded hover:bg-coral/30 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {openTasks.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No open tasks.</p>
            ) : (
              <ul className="space-y-2">
                {openTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-3 rounded border border-white/5 bg-background-deep"
                  >
                    <div>
                      <p className="text-sm text-off-white">{t.title}</p>
                      <p className="text-xs text-foreground-subtle">
                        {t.dueAt
                          ? `Due ${new Date(t.dueAt).toLocaleDateString("en-GB")}`
                          : "No due date"}
                        {t.assignedTo ? ` · ${t.assignedTo}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => completeTask(t.id)}
                      disabled={busy}
                      className="px-2 py-1 text-xs rounded border border-white/10 text-foreground-muted hover:border-green-400/30 hover:text-green-400"
                    >
                      Complete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-background-elevated rounded-xl border border-white/5 p-4 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                Owner
              </label>
              <select
                value={contact.owner ?? ""}
                onChange={(e) =>
                  patchContact({ owner: e.target.value === "" ? null : e.target.value })
                }
                disabled={busy}
                className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              >
                {OWNERS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                Stage
              </label>
              <select
                value={contact.lifecycleStage}
                onChange={(e) => patchContact({ lifecycleStage: e.target.value })}
                disabled={busy}
                className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(contact.tags ?? []).length === 0 ? (
                  <span className="text-xs text-foreground-subtle">None</span>
                ) : (
                  contact.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded bg-coral/10 text-coral/90 border border-coral/20 flex items-center gap-1"
                    >
                      {t}
                      <button
                        onClick={() => removeTag(t)}
                        disabled={busy}
                        className="text-coral/70 hover:text-coral"
                        aria-label={`Remove tag ${t}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTag();
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                />
                <button
                  onClick={addTag}
                  disabled={busy}
                  className="px-2 py-1 text-xs border border-white/10 text-foreground-muted rounded hover:border-coral/30"
                >
                  Add
                </button>
              </div>
            </div>

            {customFieldEntries.length > 0 && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-2">
                  Custom Fields
                </label>
                <dl className="space-y-1 text-xs">
                  {customFieldEntries.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-foreground-subtle capitalize">{k}</dt>
                      <dd className="text-foreground-muted text-right break-words max-w-[60%]">
                        {v === null || v === undefined ? "—" : String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="pt-2 border-t border-white/5 text-xs text-foreground-subtle space-y-1">
              {contact.source && (
                <div>
                  Source: <span className="text-foreground-muted">{contact.source}</span>
                </div>
              )}
              {contact.firstSeenAt && (
                <div>
                  First seen:{" "}
                  <span className="text-foreground-muted">
                    {new Date(contact.firstSeenAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Enrichment card */}
          <div className="bg-background-elevated rounded-xl border border-white/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium font-heading">
                Enrichment
              </p>
              {enrichment?.enrichedAt && (
                <span className="text-[10px] text-foreground-subtle">
                  {relativeTime(enrichment.enrichedAt)}
                </span>
              )}
            </div>

            {!enrichment ? (
              <p className="text-xs text-foreground-subtle">
                Not enriched yet — click Refresh.
              </p>
            ) : (
              <>
                {/* Beehiiv */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-heading">
                    Beehiiv
                  </p>
                  {enrichment.beehiiv ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded border capitalize ${beehiivStatusClass(
                            enrichment.beehiiv.status
                          )}`}
                        >
                          {enrichment.beehiiv.status}
                        </span>
                        {enrichment.beehiiv.tier && (
                          <span className="px-2 py-0.5 rounded bg-coral/10 text-coral/90 border border-coral/20">
                            {enrichment.beehiiv.tier}
                          </span>
                        )}
                      </div>
                      {enrichment.beehiiv.subscribedAt && (
                        <div className="flex justify-between text-foreground-muted">
                          <span className="text-foreground-subtle">Subscribed</span>
                          <span>
                            {new Date(enrichment.beehiiv.subscribedAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-foreground-muted">
                        <span className="text-foreground-subtle">Opens / Clicks</span>
                        <span>
                          {enrichment.beehiiv.totalOpens} / {enrichment.beehiiv.totalClicks}
                        </span>
                      </div>
                      {enrichment.beehiiv.lastOpenedAt && (
                        <div className="flex justify-between text-foreground-muted">
                          <span className="text-foreground-subtle">Last open</span>
                          <span>{relativeTime(enrichment.beehiiv.lastOpenedAt)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-subtle">Not a subscriber</p>
                  )}
                </div>

                {/* Stripe */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-heading">
                    Stripe
                  </p>
                  {enrichment.stripe ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-foreground-subtle">LTV</span>
                        <span className="text-off-white font-medium">
                          {formatGbp(enrichment.stripe.lifetimeValueCents)}
                        </span>
                      </div>
                      <div className="flex justify-between text-foreground-muted">
                        <span className="text-foreground-subtle">Payments</span>
                        <span>{enrichment.stripe.totalPayments}</span>
                      </div>
                      {enrichment.stripe.lastPaymentAt && (
                        <div className="flex justify-between text-foreground-muted">
                          <span className="text-foreground-subtle">Last payment</span>
                          <span>{relativeTime(enrichment.stripe.lastPaymentAt)}</span>
                        </div>
                      )}
                      {enrichment.stripe.subscriptions
                        .filter((s) => s.status === "active" || s.status === "trialing")
                        .map((s) => (
                          <div
                            key={s.id}
                            className="mt-2 p-2 rounded border border-green-500/20 bg-green-500/5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-green-400 text-[10px] uppercase tracking-widest font-heading">
                                {s.status}
                              </span>
                              <span className="text-off-white text-xs">
                                {formatGbp(s.amountCents)}
                              </span>
                            </div>
                            <div className="text-foreground-muted mt-1">{s.productName}</div>
                            {s.currentPeriodEnd && (
                              <div className="text-[10px] text-foreground-subtle mt-0.5">
                                Renews {new Date(s.currentPeriodEnd).toLocaleDateString("en-GB")}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-subtle">Not a customer</p>
                  )}
                </div>
              </>
            )}

            <button
              onClick={refreshEnrichment}
              disabled={busy}
              className="w-full px-3 py-2 text-xs font-heading tracking-wider uppercase bg-coral/20 text-coral border border-coral/30 rounded hover:bg-coral/30 disabled:opacity-50"
            >
              Refresh from Beehiiv + Stripe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
