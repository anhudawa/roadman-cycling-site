"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResponse } from "@/app/api/admin/crm/search/route";

interface FlatResult {
  key: string;
  group: string;
  label: string;
  sublabel?: string;
  href: string;
}

function emptyResponse(): SearchResponse {
  return {
    contacts: [],
    tasks: [],
    templates: [],
    emails: [],
    activities: [],
    applications: [],
  };
}

function flatten(res: SearchResponse): FlatResult[] {
  const out: FlatResult[] = [];
  for (const c of res.contacts) {
    out.push({
      key: `contact-${c.id}`,
      group: "Contacts",
      label: c.name ?? c.email,
      sublabel: c.email,
      href: `/admin/contacts/${c.id}`,
    });
  }
  for (const t of res.tasks) {
    out.push({
      key: `task-${t.id}`,
      group: "Tasks",
      label: t.title,
      sublabel: t.contactName ?? undefined,
      href: t.contactId ? `/admin/contacts/${t.contactId}` : `/admin/tasks`,
    });
  }
  for (const tpl of res.templates) {
    out.push({
      key: `template-${tpl.id}`,
      group: "Templates",
      label: tpl.name,
      sublabel: tpl.subject,
      href: `/admin/templates?slug=${encodeURIComponent(tpl.slug)}`,
    });
  }
  for (const e of res.emails) {
    out.push({
      key: `email-${e.id}`,
      group: "Emails",
      label: e.subject,
      sublabel: e.contactName ?? undefined,
      href: `/admin/contacts/${e.contactId}`,
    });
  }
  for (const a of res.activities) {
    out.push({
      key: `activity-${a.id}`,
      group: "Activities",
      label: a.title,
      sublabel: a.contactName ?? undefined,
      href: `/admin/contacts/${a.contactId}`,
    });
  }
  for (const app of res.applications) {
    out.push({
      key: `app-${app.id}`,
      group: "Applications",
      label: app.name,
      sublabel: `${app.email} · ${app.status}`,
      href: app.contactId ? `/admin/contacts/${app.contactId}` : "/admin/applications",
    });
  }
  return out;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResponse>(emptyResponse());
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const flat = useMemo(() => flatten(results), [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setResults(emptyResponse());
    setActiveIdx(0);
  }, []);

  // Open via keyboard or custom event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        close();
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("roadman:open-search", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("roadman:open-search", onOpen as EventListener);
    };
  }, [open, close]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults(emptyResponse());
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/crm/search?q=${encodeURIComponent(term)}&limit=10`,
          { signal: ctrl.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as SearchResponse;
          setResults(data);
          setActiveIdx(0);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [q, open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const target = flat[activeIdx];
      if (target) {
        router.push(target.href);
        close();
      }
    }
  }

  if (!open) return null;

  const grouped: Record<string, FlatResult[]> = {};
  for (const r of flat) {
    if (!grouped[r.group]) grouped[r.group] = [];
    grouped[r.group].push(r);
  }
  const groupOrder = ["Contacts", "Tasks", "Templates", "Emails", "Activities", "Applications"];

  let runningIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl bg-background-elevated border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <svg className="w-5 h-5 text-foreground-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search contacts, tasks, templates, emails, activities, applications..."
            className="flex-1 bg-transparent text-off-white text-sm placeholder:text-foreground-subtle focus:outline-none"
          />
          {loading && (
            <span className="text-xs text-foreground-subtle">Searching...</span>
          )}
          <kbd className="text-[10px] text-foreground-subtle bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <div className="px-4 py-8 text-sm text-foreground-subtle text-center">
              Type to search contacts, tasks, templates, emails, activities, applications
            </div>
          ) : flat.length === 0 ? (
            <div className="px-4 py-8 text-sm text-foreground-subtle text-center">
              {loading ? "Searching..." : "No results."}
            </div>
          ) : (
            groupOrder.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="py-2">
                  <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-foreground-subtle font-heading">
                    {group}
                  </p>
                  {items.map((item) => {
                    const idx = runningIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          router.push(item.href);
                          close();
                        }}
                        className={`w-full text-left flex items-center justify-between gap-3 px-4 py-2 transition-colors ${
                          isActive ? "bg-coral/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${isActive ? "text-coral" : "text-off-white"}`}>
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="text-xs text-foreground-subtle truncate">
                              {item.sublabel}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
