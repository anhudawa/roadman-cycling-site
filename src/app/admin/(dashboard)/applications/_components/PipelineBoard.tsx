"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APPLICATION_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  type ApplicationStage,
} from "@/lib/crm/pipeline";

export interface KanbanApplication {
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
  contactId: number | null;
}

export type StageMap = Record<ApplicationStage, KanbanApplication[]>;

interface Props {
  initialStages: StageMap;
  cohorts: string[];
  initialCohort: string;
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

export function PipelineBoard({ initialStages, cohorts, initialCohort }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<StageMap>(initialStages);
  const [cohort, setCohort] = useState(initialCohort);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<ApplicationStage | null>(null);
  const [hoverStage, setHoverStage] = useState<ApplicationStage | null>(null);
  const [detail, setDetail] = useState<KanbanApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);

  const totalCount = useMemo(
    () =>
      APPLICATION_STAGES.reduce(
        (sum, s) => sum + (stages[s]?.length ?? 0),
        0
      ),
    [stages]
  );

  async function changeCohort(next: string) {
    setCohort(next);
    setLoadingCohort(true);
    try {
      const url = `/api/admin/applications?view=kanban${
        next !== "all" ? `&cohort=${encodeURIComponent(next)}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setStages(data.stages as StageMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoadingCohort(false);
    }
  }

  function findCard(id: number): { stage: ApplicationStage; card: KanbanApplication } | null {
    for (const s of APPLICATION_STAGES) {
      const c = stages[s].find((x) => x.id === id);
      if (c) return { stage: s, card: c };
    }
    return null;
  }

  async function moveCard(id: number, from: ApplicationStage, to: ApplicationStage) {
    if (from === to) return;
    const found = findCard(id);
    if (!found) return;

    // optimistic
    const prev = stages;
    setStages((s) => {
      const next: StageMap = { ...s };
      next[from] = s[from].filter((c) => c.id !== id);
      next[to] = [{ ...found.card, status: to }, ...s[to]];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/applications/${id}/stage`, {
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
      setError(err instanceof Error ? err.message : "Failed to move card");
      window.setTimeout(() => setError(null), 4000);
    }
  }

  function openCard(app: KanbanApplication) {
    if (app.contactId) {
      router.push(`/admin/contacts/${app.contactId}`);
    } else {
      setDetail(app);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-foreground-subtle text-xs tracking-widest uppercase">
          Cohort
        </label>
        <select
          value={cohort}
          onChange={(e) => changeCohort(e.target.value)}
          disabled={loadingCohort}
          className="bg-background-elevated border border-white/10 text-off-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-coral/40"
        >
          <option value="all">All cohorts</option>
          {cohorts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-foreground-subtle text-xs ml-2">
          {totalCount} application{totalCount === 1 ? "" : "s"}
        </span>
        {error && (
          <span className="ml-auto text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
            {error}
          </span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {APPLICATION_STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const cards = stages[stage] ?? [];
          const isHover = hoverStage === stage;
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
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {cards.length === 0 && (
                  <div className="text-foreground-subtle text-xs text-center py-8 border border-dashed border-white/5 rounded-lg">
                    No applications
                  </div>
                )}
                {cards.map((app) => {
                  const dragging = dragId === app.id;
                  return (
                    <button
                      key={app.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(app.id);
                        setDragFrom(stage);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(app.id));
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragFrom(null);
                        setHoverStage(null);
                      }}
                      onClick={() => openCard(app)}
                      className={`block w-full text-left p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-coral/30 transition cursor-grab active:cursor-grabbing ${
                        dragging ? `opacity-40 scale-[0.98] ring-1 ${color.ring}` : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-off-white text-sm font-semibold truncate">
                          {app.name}
                        </span>
                        <span className="ml-auto text-foreground-subtle text-[10px] shrink-0">
                          {timeAgo(app.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground-muted text-xs truncate mb-1">
                        {truncate(app.goal, 70)}
                      </p>
                      <p className="text-foreground-subtle text-[11px] leading-snug mb-2">
                        {truncate(app.frustration, 80)}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.persona && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                              PERSONA_COLORS[app.persona] ?? PERSONA_COLORS.listener
                            }`}
                          >
                            {app.persona}
                          </span>
                        )}
                        <span className="text-foreground-subtle text-[10px]">
                          {app.hours}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading tracking-wider uppercase text-off-white text-lg">
                  {detail.name}
                </h2>
                <p className="text-foreground-muted text-xs">{detail.email}</p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-foreground-subtle hover:text-off-white text-sm"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-foreground-subtle text-[10px] tracking-widest uppercase">Goal</p>
                <p className="text-off-white">{detail.goal}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-[10px] tracking-widest uppercase">Frustration</p>
                <p className="text-off-white">{detail.frustration}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-foreground-subtle text-[10px] tracking-widest uppercase">Hours</p>
                  <p className="text-off-white">{detail.hours}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-[10px] tracking-widest uppercase">FTP</p>
                  <p className="text-off-white">{detail.ftp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-[10px] tracking-widest uppercase">Cohort</p>
                  <p className="text-off-white">{detail.cohort}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
