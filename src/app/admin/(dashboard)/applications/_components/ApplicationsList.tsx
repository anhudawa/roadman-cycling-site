"use client";

import { useEffect, useState } from "react";
import {
  APPLICATION_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  type ApplicationStage,
  isApplicationStage,
} from "@/lib/crm/pipeline";

interface Application {
  id: number;
  name: string;
  email: string;
  goal: string;
  hours: string;
  ftp: string | null;
  frustration: string;
  cohort: string;
  persona: string | null;
  status: string;
  readAt: string | null;
  createdAt: string;
}

const PERSONA_COLORS: Record<string, string> = {
  plateau: "bg-red-500/10 text-red-400 border-red-500/20",
  "event-prep": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  comeback: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  listener: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markRead(app: Application) {
    setSelected(app);
    if (!app.readAt) {
      await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, readAt: new Date().toISOString() } : a
        )
      );
    }
  }

  async function updateStage(app: Application, stage: ApplicationStage) {
    const prev = applications;
    setApplications((arr) =>
      arr.map((a) => (a.id === app.id ? { ...a, status: stage } : a))
    );
    setSelected((cur) => (cur?.id === app.id ? { ...cur, status: stage } : cur));
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setApplications(prev);
    }
  }

  if (loading) {
    return <div className="p-8 text-foreground-muted">Loading applications...</div>;
  }

  const unreadCount = applications.filter((a) => !a.readAt).length;

  return (
    <div>
      <p className="text-foreground-muted text-sm mb-4">
        {applications.length} total &middot; {unreadCount} unread
      </p>
      <div className="flex gap-6 h-[calc(100vh-260px)]">
        {/* List */}
        <div className="w-1/3 overflow-y-auto space-y-1 pr-2">
          {applications.map((app) => {
            const stageKey: ApplicationStage = isApplicationStage(app.status)
              ? app.status
              : "awaiting_response";
            const sc = STAGE_COLORS[stageKey];
            return (
              <button
                key={app.id}
                onClick={() => markRead(app)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selected?.id === app.id
                    ? "border-l-2 border-l-[var(--color-coral)] border-[var(--color-border-strong)] bg-white/[0.04]"
                    : "border-[var(--color-border)] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!app.readAt && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] shrink-0" aria-label="Unread" />
                  )}
                  <span className="text-off-white text-sm font-medium truncate">
                    {app.name}
                  </span>
                  <span className="text-foreground-subtle text-xs ml-auto shrink-0">
                    {timeAgo(app.createdAt)}
                  </span>
                </div>
                <p className="text-foreground-muted text-xs truncate">{app.goal}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {app.persona && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        PERSONA_COLORS[app.persona] ?? PERSONA_COLORS.listener
                      }`}
                    >
                      {app.persona}
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${sc.badge}`}
                  >
                    {STAGE_LABELS[stageKey]}
                  </span>
                  <span className="text-foreground-subtle text-[10px]">
                    {app.hours}
                  </span>
                </div>
              </button>
            );
          })}
          {applications.length === 0 && (
            <p className="text-foreground-subtle text-sm p-4">No applications yet.</p>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="bg-background-elevated rounded-lg border border-white/5 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl text-off-white tracking-wider uppercase">
                    {selected.name}
                  </h2>
                  <p className="text-foreground-muted text-sm">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.persona && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-medium ${
                        PERSONA_COLORS[selected.persona] ?? PERSONA_COLORS.listener
                      }`}
                    >
                      {selected.persona}
                    </span>
                  )}
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      // selected.cohort is stored as "cohort-2" / "cohort-3"
                      // — pretty-print it in the email subject so the recipient
                      // sees e.g. "Your NDY Cohort 3 Application".
                      `Your NDY ${selected.cohort.replace(/^cohort-/, "Cohort ")} Application`,
                    )}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-admin-md)] bg-[var(--color-coral)] text-white font-body font-semibold text-[14px] hover:bg-[var(--color-coral-hover)] transition-colors"
                  >
                    Reply
                  </a>
                </div>
              </div>

              {/* Stage selector */}
              <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-3">
                  Pipeline Stage
                </p>
                <div className="flex flex-wrap gap-2">
                  {APPLICATION_STAGES.map((stage) => {
                    const sc = STAGE_COLORS[stage];
                    const active =
                      (isApplicationStage(selected.status)
                        ? selected.status
                        : "awaiting_response") === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => updateStage(selected, stage)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                          active
                            ? `${sc.badge} ring-1 ring-current`
                            : "border-white/10 text-foreground-subtle hover:border-white/20"
                        }`}
                      >
                        {STAGE_LABELS[stage]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    Goal
                  </p>
                  <p className="text-off-white text-sm">{selected.goal}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    Hours/week
                  </p>
                  <p className="text-off-white text-sm">{selected.hours}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    Frustration
                  </p>
                  <p className="text-off-white text-sm">{selected.frustration}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    FTP
                  </p>
                  <p className="text-off-white text-sm">
                    {selected.ftp || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    Applied
                  </p>
                  <p className="text-off-white text-sm">
                    {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-1">
                    Cohort
                  </p>
                  <p className="text-off-white text-sm">{selected.cohort}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-foreground-subtle">
              Select an application to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
