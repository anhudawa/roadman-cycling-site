"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency, STAGE_LABELS, type DealStage } from "@/lib/crm/deals";

interface DealRow {
  id: number;
  title: string;
  valueCents: number;
  currency: string;
  stage: DealStage;
  ownerSlug: string | null;
  expectedCloseDate: string | null;
  closedAt: string | null;
}

export function ContactDealsSection({ contactId }: { contactId: number }) {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/deals?contactId=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
          Deals
        </p>
        <Link
          href={`/admin/deals?new=1&contactId=${contactId}`}
          className="font-body font-semibold text-[13px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:underline"
        >
          + Add deal
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-foreground-subtle">Loading…</p>
      ) : deals.length === 0 ? (
        <p className="text-sm text-foreground-subtle">No deals linked.</p>
      ) : (
        <ul className="space-y-2">
          {deals.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/deals/${d.id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] bg-[var(--color-sunken)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition"
              >
                <div className="min-w-0">
                  <p className="text-sm text-off-white truncate">{d.title}</p>
                  <p className="text-[11px] text-foreground-subtle">
                    {STAGE_LABELS[d.stage]}
                    {d.ownerSlug ? ` · ${d.ownerSlug}` : ""}
                    {d.expectedCloseDate
                      ? ` · close ${new Date(d.expectedCloseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : ""}
                  </p>
                </div>
                <span className="text-[var(--color-fg)] text-sm font-mono tabular-nums shrink-0">
                  {formatCurrency(d.valueCents, d.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
