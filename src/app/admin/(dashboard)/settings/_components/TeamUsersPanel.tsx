"use client";

import { useState } from "react";

interface TeamUserRow {
  id: number;
  email: string;
  name: string;
  slug: string;
  role: "admin" | "member" | string;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TeamUsersPanel({ initial, currentUserId }: { initial: TeamUserRow[]; currentUserId: number }) {
  const [users, setUsers] = useState<TeamUserRow[]>(initial);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plaintext, setPlaintext] = useState<{ label: string; password: string } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newDraft, setNewDraft] = useState({ email: "", name: "", slug: "" });
  const [creating, setCreating] = useState(false);

  function patchUser(u: TeamUserRow) {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }

  async function toggleActive(u: TeamUserRow) {
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team-users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !u.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      patchUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(u: TeamUserRow, role: "admin" | "member") {
    if (role === u.role) return;
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team-users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      patchUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function rotate(u: TeamUserRow) {
    if (!confirm(`Rotate password for ${u.email}? The new password will be shown once.`)) return;
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team-users/${u.id}/rotate-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPlaintext({ label: `New password for ${u.email}`, password: data.plaintextPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotate failed");
    } finally {
      setBusyId(null);
    }
  }

  async function createUser() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setUsers((prev) => [...prev, data.user]);
      setPlaintext({ label: `Password for new user ${data.user.email}`, password: data.plaintextPassword });
      setShowNew(false);
      setNewDraft({ email: "", name: "", slug: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {plaintext && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded">
          <div className="text-[11px] uppercase tracking-widest text-amber-300 font-medium mb-1">
            {plaintext.label}
          </div>
          <code className="block font-mono text-base text-off-white bg-background-deep p-2 rounded border border-white/10 select-all">
            {plaintext.password}
          </code>
          <p className="text-xs text-amber-200 mt-2">
            Copy now — won&apos;t be shown again.
          </p>
          <button
            type="button"
            onClick={() => setPlaintext(null)}
            className="mt-2 text-[11px] text-foreground-subtle hover:text-off-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm uppercase tracking-widest text-off-white">Team Members</h2>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="px-3 py-1.5 text-xs bg-[var(--color-coral)] text-background-deep font-medium rounded hover:bg-[var(--color-coral-hover)]"
        >
          {showNew ? "Cancel" : "+ Add team member"}
        </button>
      </div>

      {showNew && (
        <div className="bg-background-elevated border border-white/10 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="email"
            placeholder="email"
            value={newDraft.email}
            onChange={(e) => setNewDraft((d) => ({ ...d, email: e.target.value }))}
            className="px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
          />
          <input
            type="text"
            placeholder="name"
            value={newDraft.name}
            onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
            className="px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
          />
          <input
            type="text"
            placeholder="slug"
            value={newDraft.slug}
            onChange={(e) => setNewDraft((d) => ({ ...d, slug: e.target.value }))}
            className="px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
          />
          <button
            type="button"
            onClick={createUser}
            disabled={creating || !newDraft.email || !newDraft.name || !newDraft.slug}
            className="px-3 py-2 bg-[var(--color-coral)] text-background-deep font-medium rounded text-sm hover:bg-[var(--color-coral-hover)] disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-off-white font-medium">
                    {u.name}
                    {isSelf && <span className="ml-1 text-[10px] text-foreground-subtle">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{u.email}</td>
                  <td className="px-4 py-3 text-foreground-muted">{u.slug}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id || isSelf}
                      onChange={(e) => changeRole(u, e.target.value as "admin" | "member")}
                      className="px-2 py-1 bg-background-deep border border-white/10 rounded text-xs text-off-white disabled:opacity-50"
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        u.active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {u.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted text-xs">
                    {formatWhen(u.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        disabled={busyId === u.id || isSelf}
                        className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-foreground-muted hover:text-off-white disabled:opacity-50"
                      >
                        Toggle active
                      </button>
                      <button
                        type="button"
                        onClick={() => rotate(u)}
                        disabled={busyId === u.id}
                        className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-foreground-muted hover:text-off-white disabled:opacity-50"
                      >
                        Rotate password
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
