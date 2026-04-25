"use client";

import { useState } from "react";
import Link from "next/link";
import type { DuplicateGroup, DuplicateReason } from "@/lib/crm/dedup";

function reasonLabel(r: DuplicateReason): string {
  switch (r) {
    case "phone":
      return "Phone match";
    case "name+metadata":
      return "Name + metadata";
    case "name-only":
      return "Name match";
  }
}

function reasonClass(r: DuplicateReason): string {
  switch (r) {
    case "phone":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "name+metadata":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "name-only":
      return "bg-white/5 text-foreground-muted border-white/10";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "$—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface GroupState extends DuplicateGroup {
  key: string;
  primaryId: number;
  busy: boolean;
  error: string | null;
  dismissed: boolean;
}

export function DuplicatesClient({ initialGroups }: { initialGroups: DuplicateGroup[] }) {
  const [groups, setGroups] = useState<GroupState[]>(() =>
    initialGroups.map((g, idx) => ({
      ...g,
      key: `${idx}-${g.contacts.map((c) => c.id).join("-")}`,
      primaryId: g.contacts[0]?.id ?? 0,
      busy: false,
      error: null,
      dismissed: false,
    }))
  );

  function setPrimary(key: string, id: number) {
    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, primaryId: id } : g))
    );
  }

  async function mergeGroup(key: string, secondaryId: number) {
    const group = groups.find((g) => g.key === key);
    if (!group) return;
    if (group.primaryId === secondaryId) return;

    const primary = group.contacts.find((c) => c.id === group.primaryId);
    const secondary = group.contacts.find((c) => c.id === secondaryId);
    if (!primary || !secondary) return;

    const confirmed = window.confirm(
      `This will delete ${secondary.email} and move its data to ${primary.email}. Continue?`
    );
    if (!confirmed) return;

    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, busy: true, error: null } : g))
    );

    try {
      const res = await fetch("/api/admin/crm/contacts/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryId: group.primaryId, secondaryId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Merge failed (${res.status})`);

      // Remove the merged secondary from the group; if group now has <2 contacts, dismiss it.
      setGroups((prev) =>
        prev.map((g) => {
          if (g.key !== key) return g;
          const remaining = g.contacts.filter((c) => c.id !== secondaryId);
          return {
            ...g,
            contacts: remaining,
            busy: false,
            dismissed: remaining.length < 2,
          };
        })
      );
    } catch (err) {
      setGroups((prev) =>
        prev.map((g) =>
          g.key === key
            ? { ...g, busy: false, error: err instanceof Error ? err.message : "Merge failed" }
            : g
        )
      );
    }
  }

  const visible = groups.filter((g) => !g.dismissed);

  if (visible.length === 0) {
    return (
      <div className="text-center py-16 text-foreground-subtle">
        <p className="text-lg font-heading tracking-wider">NO DUPLICATES DETECTED</p>
        <p className="text-sm mt-1">Nice and tidy.</p>
        <Link
          href="/admin/contacts"
          className="inline-block mt-4 px-3 py-2 font-body font-semibold text-[13px] border border-[var(--color-border)] text-[var(--color-fg-muted)] rounded-[var(--radius-admin-md)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((g) => (
        <div
          key={g.key}
          className="bg-background-elevated rounded-xl border border-white/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border font-heading ${reasonClass(
                g.reason
              )}`}
            >
              {reasonLabel(g.reason)}
            </span>
            <span className="text-[11px] text-foreground-subtle">
              {g.contacts.length} contacts
            </span>
          </div>

          {g.error && (
            <div className="mb-3 px-3 py-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {g.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.contacts.map((c) => {
              const isPrimary = c.id === g.primaryId;
              return (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3 text-sm ${
                    isPrimary
                      ? "border-[var(--color-info)]/40 bg-[var(--color-info-tint)]"
                      : "border-[var(--color-border)] bg-[var(--color-sunken)]"
                  }`}
                >
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`primary-${g.key}`}
                      checked={isPrimary}
                      onChange={() => setPrimary(g.key, c.id)}
                      disabled={g.busy}
                      className="mt-1 accent-[var(--color-info)]"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="text-[var(--color-fg)] hover:underline truncate block font-medium"
                        target="_blank"
                      >
                        {c.name ?? c.email}
                      </Link>
                      <p className="text-xs text-foreground-muted truncate">{c.email}</p>
                      {c.phone && (
                        <p className="text-xs text-foreground-subtle">{c.phone}</p>
                      )}
                      <dl className="mt-2 space-y-0.5 text-[11px] text-foreground-subtle">
                        <div className="flex justify-between gap-2">
                          <dt>Owner</dt>
                          <dd className="text-foreground-muted">{c.owner ?? "$—"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Stage</dt>
                          <dd className="text-foreground-muted capitalize">
                            {c.lifecycleStage}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Created</dt>
                          <dd className="text-foreground-muted">{formatDate(c.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Last activity</dt>
                          <dd className="text-foreground-muted">
                            {formatDate(c.lastActivityAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </label>

                  {!isPrimary && (
                    <button
                      onClick={() => mergeGroup(g.key, c.id)}
                      disabled={g.busy}
                      className="mt-3 w-full px-3 py-1.5 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)] disabled:opacity-50"
                    >
                      {g.busy ? "Merging..." : "Merge into primary"}
                    </button>
                  )}
                  {isPrimary && (
                    <div className="mt-3 font-body font-semibold text-[13px] text-[var(--color-info)] text-center">
                      Primary (kept)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
