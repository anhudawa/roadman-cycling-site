"use client";

import { useEffect, useState } from "react";

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
  readAt: string | null;
  createdAt: string;
}

export default function ApplicationsPage() {
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

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const personaColors: Record<string, string> = {
    plateau: "bg-red-500/10 text-red-400 border-red-500/20",
    "event-prep": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    comeback: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    listener: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  if (loading) {
    return (
      <div className="p-8 text-foreground-muted">Loading applications...</div>
    );
  }

  const unreadCount = applications.filter((a) => !a.readAt).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl text-off-white">
            COHORT APPLICATIONS
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {applications.length} total &middot; {unreadCount} unread
          </p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-1/3 overflow-y-auto space-y-1 pr-2">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => markRead(app)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selected?.id === app.id
                  ? "border-coral/30 bg-coral/5"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {!app.readAt && (
                  <span className="w-2 h-2 rounded-full bg-coral shrink-0" />
                )}
                <span className="text-off-white text-sm font-medium truncate">
                  {app.name}
                </span>
                <span className="text-foreground-subtle text-xs ml-auto shrink-0">
                  {timeAgo(app.createdAt)}
                </span>
              </div>
              <p className="text-foreground-muted text-xs truncate">
                {app.goal}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {app.persona && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      personaColors[app.persona] || personaColors.listener
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
          ))}
          {applications.length === 0 && (
            <p className="text-foreground-subtle text-sm p-4">
              No applications yet.
            </p>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="bg-white/[0.02] rounded-lg border border-white/5 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl text-off-white">
                    {selected.name}
                  </h2>
                  <p className="text-foreground-muted text-sm">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.persona && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-medium ${
                        personaColors[selected.persona] || personaColors.listener
                      }`}
                    >
                      {selected.persona}
                    </span>
                  )}
                  <a
                    href={`mailto:${selected.email}?subject=Your NDY Cohort 2 Application`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-coral text-off-white text-sm font-medium hover:bg-coral/90 transition-colors"
                  >
                    Reply
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    GOAL
                  </p>
                  <p className="text-off-white text-sm">{selected.goal}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    HOURS/WEEK
                  </p>
                  <p className="text-off-white text-sm">{selected.hours}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    FRUSTRATION
                  </p>
                  <p className="text-off-white text-sm">{selected.frustration}</p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    FTP
                  </p>
                  <p className="text-off-white text-sm">
                    {selected.ftp || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    APPLIED
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
                  <p className="text-foreground-subtle text-xs tracking-wider mb-1">
                    COHORT
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
