"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ContactOption {
  id: number;
  name: string | null;
  email: string;
}

const OWNERS = [
  { value: "ted", label: "Ted" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
];

const DURATIONS = [15, 30, 45, 60, 90];

export function NewBookingForm({
  currentSlug,
  prefilledContact,
  triggerLabel = "+ NEW BOOKING",
  triggerClassName,
  onCreated,
}: {
  currentSlug: string;
  prefilledContact?: { id: number; name: string | null; email: string } | null;
  triggerLabel?: string;
  triggerClassName?: string;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [ownerSlug, setOwnerSlug] = useState(currentSlug);

  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(
    prefilledContact ?? null
  );
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
        const res = await fetch(
          `/api/admin/crm/contacts?search=${encodeURIComponent(contactQuery)}&limit=8`
        );
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
    setScheduledAt("");
    setDurationMinutes(30);
    setLocation("");
    setNotes("");
    setOwnerSlug(currentSlug);
    setContactQuery("");
    setSelectedContact(prefilledContact ?? null);
    setContactResults([]);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title required");
    if (!scheduledAt) return setError("Scheduled date/time required");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/crm/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          contactId: selectedContact?.id ?? null,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes,
          location: location.trim() || null,
          notes: notes.trim() || null,
          ownerSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create booking");
        setSubmitting(false);
        return;
      }
      reset();
      setOpen(false);
      if (onCreated) onCreated();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const defaultTrigger =
    "px-4 py-2 bg-coral hover:bg-coral-hover text-off-white font-heading text-sm tracking-wider rounded-lg transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-off-white tracking-wider mb-4">
              NEW BOOKING
            </h2>
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
                  placeholder="e.g. Discovery call"
                  className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
                />
              </div>

              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Contact
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
                      className="text-xs text-foreground-subtle hover:text-coral"
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
                      className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
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
                              {c.name && (
                                <span className="text-foreground-subtle text-xs block">
                                  {c.email}
                                </span>
                              )}
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
                    Scheduled
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Zoom link, phone, address..."
                  className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral resize-y"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
                  Owner
                </label>
                <select
                  value={ownerSlug}
                  onChange={(e) => setOwnerSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-coral"
                >
                  {OWNERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-coral text-sm">{error}</p>}

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
                  className="px-4 py-2 bg-coral hover:bg-coral-hover disabled:opacity-50 text-off-white font-heading text-sm tracking-wider rounded-lg"
                >
                  {submitting ? "CREATING..." : "CREATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
