"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface ContactOption {
  id: number;
  name: string | null;
  email: string;
}

const ASSIGNEES = [
  { value: "ted", label: "Ted" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
];

export function AddTaskButton({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentSlug);
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!contactQuery.trim() || selectedContact) {
      setContactResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/crm/contacts?search=${encodeURIComponent(contactQuery)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setContactResults(data.rows ?? []);
        }
      } catch {
        /* ignore */
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [contactQuery, open, selectedContact]);

  function reset() {
    setTitle("");
    setDueAt("");
    setAssignedTo(currentSlug);
    setContactQuery("");
    setSelectedContact(null);
    setContactResults([]);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          contactId: selectedContact?.id ?? null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          assignedTo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create task");
        setSubmitting(false);
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] font-body font-semibold text-[14px] rounded-[var(--radius-admin-md)] transition-colors"
      >
        Add task
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-off-white tracking-wider mb-4">NEW TASK</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
                />
              </div>

              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Contact (optional)
                </label>
                {selectedContact ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-charcoal border border-white/10 rounded-lg">
                    <span className="text-sm text-off-white">
                      {selectedContact.name ?? selectedContact.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(null);
                        setContactQuery("");
                      }}
                      className="text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={contactQuery}
                      onChange={(e) => {
                        setContactQuery(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => setShowResults(true)}
                      placeholder="Search name or email..."
                      className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
                    />
                    {showResults && contactResults.length > 0 && (
                      <ul className="absolute z-10 left-0 right-0 mt-1 bg-background-deep border border-white/10 rounded-lg max-h-48 overflow-auto">
                        {contactResults.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContact(c);
                                setShowResults(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
                            >
                              <span className="text-off-white">{c.name ?? c.email}</span>
                              {c.name && <span className="text-foreground-subtle text-xs block">{c.email}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                    Due
                  </label>
                  <input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                    Assigned
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
                  >
                    {ASSIGNEES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-[var(--color-bad)] text-sm">{error}</p>}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-foreground-muted hover:text-off-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] disabled:opacity-50 text-[var(--color-fg)] border border-[var(--color-border-strong)] font-body font-semibold text-[14px] rounded-[var(--radius-admin-md)]"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
