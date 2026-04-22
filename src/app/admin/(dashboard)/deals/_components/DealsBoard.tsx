"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEAL_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  formatCurrency,
  type DealStage,
} from "@/lib/crm/deals";

export interface KanbanDeal {
  id: number;
  contactId: number | null;
  contactName: string | null;
  contactEmail: string | null;
  title: string;
  valueCents: number;
  currency: string;
  stage: DealStage;
  ownerSlug: string | null;
  source: string | null;
  expectedCloseDate: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StageMap = Record<DealStage, KanbanDeal[]>;

interface Props {
  initialStages: StageMap;
  stats: {
    openPipelineValueCents: number;
    wonThisMonthCents: number;
    avgDealSizeCents: number;
    openCount: number;
  };
  defaultCurrency: string;
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function DealsBoard({ initialStages, stats, defaultCurrency }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<StageMap>(initialStages);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<DealStage | null>(null);
  const [hoverStage, setHoverStage] = useState<DealStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const totalCount = useMemo(
    () => DEAL_STAGES.reduce((sum, s) => sum + (stages[s]?.length ?? 0), 0),
    [stages]
  );

  function findCard(id: number): { stage: DealStage; card: KanbanDeal } | null {
    for (const s of DEAL_STAGES) {
      const c = stages[s].find((x) => x.id === id);
      if (c) return { stage: s, card: c };
    }
    return null;
  }

  async function moveCard(id: number, from: DealStage, to: DealStage) {
    if (from === to) return;
    const found = findCard(id);
    if (!found) return;
    const prev = stages;
    setStages((s) => {
      const next: StageMap = { ...s };
      next[from] = s[from].filter((c) => c.id !== id);
      next[to] = [{ ...found.card, stage: to }, ...s[to]];
      return next;
    });
    try {
      const res = await fetch(`/api/admin/crm/deals/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: to }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setError(null);
    } catch (err) {
      setStages(prev);
      setError(err instanceof Error ? err.message : "Failed to move");
      window.setTimeout(() => setError(null), 4000);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Open Pipeline"
          value={formatCurrency(stats.openPipelineValueCents, defaultCurrency)}
        />
        <StatCard
          label="Won This Month"
          value={formatCurrency(stats.wonThisMonthCents, defaultCurrency)}
          accent
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(stats.avgDealSizeCents, defaultCurrency)}
        />
        <StatCard label="Open Deals" value={String(stats.openCount)} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-foreground-subtle text-xs">
          {totalCount} deal{totalCount === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="ml-auto px-3 py-1.5 bg-coral text-white text-xs font-heading tracking-wider rounded-lg hover:bg-coral/90 uppercase"
        >
          + New Deal
        </button>
        {error && (
          <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
            {error}
          </span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const cards = stages[stage] ?? [];
          const isHover = hoverStage === stage;
          const totalValue = cards.reduce((s, c) => s + c.valueCents, 0);
          const stageCurrency = cards[0]?.currency ?? defaultCurrency;
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                if (hoverStage !== stage) setHoverStage(stage);
              }}
              onDragLeave={() => {
                if (hoverStage === stage) setHoverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setHoverStage(null);
                if (dragId !== null && dragFrom) {
                  moveCard(dragId, dragFrom, stage);
                }
                setDragId(null);
                setDragFrom(null);
              }}
              className={`shrink-0 w-72 flex flex-col rounded-xl border border-white/5 bg-background-elevated transition ${
                isHover ? "ring-1 ring-coral" : ""
              }`}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                <h3 className="font-heading tracking-wider uppercase text-off-white text-xs">
                  {STAGE_LABELS[stage]}
                </h3>
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium ${color.badge}`}
                >
                  {cards.length}
                </span>
              </div>
              <div className="px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-widest text-foreground-subtle tabular-nums">
                {formatCurrency(totalValue, stageCurrency)}
              </div>
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {cards.length === 0 && (
                  <div className="text-foreground-subtle text-xs text-center py-8 border border-dashed border-white/5 rounded-lg">
                    No deals
                  </div>
                )}
                {cards.map((deal) => {
                  const dragging = dragId === deal.id;
                  const closeDate = fmtDate(deal.expectedCloseDate);
                  return (
                    <button
                      key={deal.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(deal.id);
                        setDragFrom(stage);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragFrom(null);
                        setHoverStage(null);
                      }}
                      onClick={() => router.push(`/admin/deals/${deal.id}`)}
                      className={`block w-full text-left p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-[var(--color-border-strong)] transition cursor-grab active:cursor-grabbing ${
                        dragging ? `opacity-40 scale-[0.98] ring-1 ${color.ring}` : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-off-white text-sm font-semibold truncate">
                          {deal.title}
                        </span>
                      </div>
                      <p className="text-coral text-sm font-heading tracking-wider tabular-nums mb-2">
                        {formatCurrency(deal.valueCents, deal.currency)}
                      </p>
                      {(deal.contactName || deal.contactEmail) && (
                        <p className="text-foreground-muted text-[11px] truncate mb-1">
                          {deal.contactName ?? deal.contactEmail}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {deal.ownerSlug && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-coral/15 text-coral border-coral/30 capitalize">
                            {deal.ownerSlug}
                          </span>
                        )}
                        {closeDate && (
                          <span className="text-foreground-subtle text-[10px] ml-auto">
                            {closeDate}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <NewDealModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
        {label}
      </p>
      <p
        className={`font-heading text-xl tracking-wider mt-1 tabular-nums ${
          accent ? "text-coral" : "text-off-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface ContactHit {
  id: number;
  name: string | null;
  email: string;
}

const OWNERS = [
  { value: "", label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

function NewDealModal({
  onClose,
  onCreated,
  initialContactId,
  initialContactLabel,
}: {
  onClose: () => void;
  onCreated: () => void;
  initialContactId?: number | null;
  initialContactLabel?: string | null;
}) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [stage, setStage] = useState<DealStage>("qualified");
  const [owner, setOwner] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [source, setSource] = useState("");
  const [contactQuery, setContactQuery] = useState(initialContactLabel ?? "");
  const [contactId, setContactId] = useState<number | null>(
    initialContactId ?? null
  );
  const [hits, setHits] = useState<ContactHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function searchContacts(q: string) {
    setContactQuery(q);
    setContactId(null);
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/crm/contacts?search=${encodeURIComponent(q)}&limit=8`
      );
      if (res.ok) {
        const data = await res.json();
        setHits(data.rows ?? []);
      }
    } catch {
      /* silent */
    } finally {
      setSearching(false);
    }
  }

  async function submit() {
    if (!title.trim()) {
      setErr("Title required");
      return;
    }
    const valueCents = Math.round(parseFloat(value || "0") * 100);
    if (!Number.isFinite(valueCents)) {
      setErr("Invalid value");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/crm/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          valueCents,
          currency,
          stage,
          ownerSlug: owner || null,
          contactId,
          expectedCloseDate: closeDate || null,
          source: source || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-background-elevated border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="font-heading tracking-wider uppercase text-off-white text-lg">
            New Deal
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-subtle hover:text-off-white text-sm"
          >
            Close
          </button>
        </div>

        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
          />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field label="Value" className="col-span-2">
            <input
              type="number"
              step="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            />
          </Field>
          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            >
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Stage">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Owner">
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            >
              {OWNERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Contact">
          <input
            type="text"
            placeholder="Search by name or email"
            value={contactQuery}
            onChange={(e) => searchContacts(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
          />
          {contactId && (
            <p className="text-[10px] text-coral mt-1">Linked: id #{contactId}</p>
          )}
          {!contactId && hits.length > 0 && (
            <ul className="mt-1 max-h-36 overflow-y-auto border border-white/10 rounded bg-background-deep">
              {hits.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setContactId(h.id);
                      setContactQuery(h.name ?? h.email);
                      setHits([]);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 text-off-white"
                  >
                    {h.name ?? "—"}{" "}
                    <span className="text-foreground-subtle">{h.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searching && (
            <p className="text-[10px] text-foreground-subtle mt-1">searching…</p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Expected Close">
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            />
          </Field>
          <Field label="Source">
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
            />
          </Field>
        </div>

        {err && <p className="text-xs text-red-400">{err}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase border border-white/10 text-foreground-muted rounded hover:text-off-white"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase bg-coral text-white rounded hover:bg-coral/90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
