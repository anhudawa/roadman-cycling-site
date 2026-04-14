"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEAL_STAGES,
  STAGE_LABELS,
  formatCurrency,
  type DealStage,
} from "@/lib/crm/deals";

const OWNERS = [
  { value: "", label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

interface DealData {
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function DealEditor({ deal: initial }: { deal: DealData }) {
  const router = useRouter();
  const [deal, setDeal] = useState<DealData>(initial);
  const [title, setTitle] = useState(initial.title);
  const [value, setValue] = useState(String((initial.valueCents ?? 0) / 100));
  const [currency, setCurrency] = useState(initial.currency);
  const [stage, setStage] = useState<DealStage>(initial.stage);
  const [owner, setOwner] = useState(initial.ownerSlug ?? "");
  const [source, setSource] = useState(initial.source ?? "");
  const [closeDate, setCloseDate] = useState(initial.expectedCloseDate ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/crm/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          valueCents: Math.round(parseFloat(value || "0") * 100),
          currency,
          stage,
          ownerSlug: owner || null,
          source: source || null,
          expectedCloseDate: closeDate || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setDeal((d) => ({ ...d, ...data.deal }));
      setMsg("Saved");
      window.setTimeout(() => setMsg(null), 2500);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this deal?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/deals/${deal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/deals");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/deals")}
          className="text-xs text-foreground-subtle hover:text-off-white transition-colors"
        >
          &larr; Back to deals
        </button>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
            {deal.title}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {formatCurrency(deal.valueCents, deal.currency)} · {STAGE_LABELS[deal.stage]}
          </p>
          {deal.contactId && (
            <Link
              href={`/admin/contacts/${deal.contactId}`}
              className="inline-block mt-2 text-xs text-coral hover:underline"
            >
              {deal.contactName ?? deal.contactEmail} →
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={remove}
            disabled={busy}
            className="px-3 py-1.5 border border-red-500/30 text-red-300 text-xs font-heading tracking-wider uppercase rounded hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="px-4 py-2 bg-coral text-white text-sm font-heading tracking-wider rounded-lg hover:bg-coral/90 uppercase disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      {msg && (
        <div className="fixed bottom-6 right-6 z-50 bg-coral text-white px-4 py-2 rounded-lg shadow-lg text-sm font-heading tracking-wider uppercase">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Field label="Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Field label="Value" className="col-span-2">
                <input
                  type="number"
                  step="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                />
              </Field>
              <Field label="Currency">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                >
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Field label="Stage">
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as DealStage)}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
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
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                >
                  {OWNERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Field label="Expected Close">
                <input
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                />
              </Field>
              <Field label="Source">
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
                />
              </Field>
            </div>
            <Field label="Notes" className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50 resize-none"
              />
            </Field>
            {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
              Meta
            </p>
            <dl className="space-y-2 text-xs">
              <Row label="Created">{fmt(deal.createdAt)}</Row>
              <Row label="Updated">{fmt(deal.updatedAt)}</Row>
              <Row label="Closed">{deal.closedAt ? fmt(deal.closedAt) : "—"}</Row>
              <Row label="Contact">
                {deal.contactId ? (
                  <Link
                    href={`/admin/contacts/${deal.contactId}`}
                    className="text-coral hover:underline"
                  >
                    {deal.contactName ?? deal.contactEmail}
                  </Link>
                ) : (
                  "—"
                )}
              </Row>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
      {children}
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-foreground-subtle uppercase tracking-widest text-[10px]">
        {label}
      </dt>
      <dd className="text-off-white text-right">{children}</dd>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
