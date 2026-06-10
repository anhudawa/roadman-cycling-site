"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Num,
  Pill,
  Select,
  type PillTone,
} from "@/components/admin/ui";

export interface RiderRow {
  id: number;
  name: string;
  pcsId: string | null;
  proTeamId: number;
  proTeamName: string;
  proTeamCode: string;
  riderClass: "gc" | "sprint" | "climb" | "break";
  price: number;
  status: "provisional" | "confirmed" | "removed" | "dns" | "abandoned";
  countryCode: string | null;
  sourceUrl: string;
  abandonedAfterStage: number | null;
}

export interface ProTeamOption {
  id: number;
  name: string;
  code: string;
}

const RIDER_CLASSES = ["gc", "sprint", "climb", "break"] as const;
const RIDER_STATUSES = ["provisional", "confirmed", "removed", "dns", "abandoned"] as const;
const ABANDON_REASONS = ["DNS", "DNF", "HD", "DSQ"] as const;

const STATUS_TONES: Record<RiderRow["status"], PillTone> = {
  provisional: "warn",
  confirmed: "good",
  removed: "neutral",
  dns: "neutral",
  abandoned: "bad",
};

interface Banner {
  tone: "good" | "bad";
  lines: string[];
}

async function postJson(
  url: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

function errorLines(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.errors)) return data.errors.map(String);
  return [typeof data.error === "string" ? data.error : "Request failed"];
}

export function RidersManager({
  riders,
  teams,
}: {
  riders: RiderRow[];
  teams: ProTeamOption[];
}) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  // Add-rider form
  const [addOpen, setAddOpen] = useState(false);
  const [add, setAdd] = useState({
    name: "",
    proTeamId: "",
    riderClass: "gc",
    price: "10",
    countryCode: "",
    pcsId: "",
    sourceUrl: "",
  });

  // Confirm-team form
  const [confirmTeamId, setConfirmTeamId] = useState("");
  const [confirmSource, setConfirmSource] = useState("");

  // Inline edit / abandon state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState({ price: "", riderClass: "gc", status: "provisional" });
  const [abandoningId, setAbandoningId] = useState<number | null>(null);
  const [abandon, setAbandon] = useState({ stage: "1", reason: "DNF" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = riders.filter(
    (r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (teamFilter === "all" || r.proTeamId === Number(teamFilter)),
  );

  async function run(key: string, action: () => Promise<Banner>) {
    setBusy(key);
    setBanner(null);
    try {
      setBanner(await action());
    } catch {
      setBanner({ tone: "bad", lines: ["Network error — try again"] });
    } finally {
      setBusy(null);
    }
  }

  function addRider() {
    if (!add.sourceUrl.trim()) {
      setBanner({ tone: "bad", lines: ["A source URL is required to add a rider."] });
      return;
    }
    run("add", async () => {
      const { ok, data } = await postJson("/api/admin/fantasy/riders", "POST", {
        name: add.name.trim(),
        proTeamId: Number(add.proTeamId),
        riderClass: add.riderClass,
        price: Number(add.price),
        countryCode: add.countryCode.trim(),
        pcsId: add.pcsId.trim(),
        sourceUrl: add.sourceUrl.trim(),
      });
      if (!ok) return { tone: "bad", lines: errorLines(data) };
      setAdd({
        name: "",
        proTeamId: add.proTeamId,
        riderClass: add.riderClass,
        price: "10",
        countryCode: "",
        pcsId: "",
        sourceUrl: add.sourceUrl,
      });
      router.refresh();
      return { tone: "good", lines: [`Added ${String(add.name).trim()}`] };
    });
  }

  function saveEdit(rider: RiderRow) {
    run(`edit-${rider.id}`, async () => {
      const { ok, data } = await postJson("/api/admin/fantasy/riders", "PATCH", {
        id: rider.id,
        price: Number(edit.price),
        riderClass: edit.riderClass,
        status: edit.status,
      });
      if (!ok) return { tone: "bad", lines: errorLines(data) };
      setEditingId(null);
      router.refresh();
      return { tone: "good", lines: [`Updated ${rider.name}`] };
    });
  }

  function confirmTeam() {
    run("confirm-team", async () => {
      const { ok, data } = await postJson("/api/admin/fantasy/riders/confirm-team", "POST", {
        proTeamId: Number(confirmTeamId),
        sourceUrl: confirmSource.trim(),
      });
      if (!ok) return { tone: "bad", lines: errorLines(data) };
      setConfirmSource("");
      router.refresh();
      return {
        tone: "good",
        lines: [`Confirmed ${Number(data.confirmed ?? 0)} provisional rider(s)`],
      };
    });
  }

  function markAbandoned(rider: RiderRow) {
    run(`abandon-${rider.id}`, async () => {
      const { ok, data } = await postJson("/api/admin/fantasy/riders/abandon", "POST", {
        riderId: rider.id,
        stageNumber: Number(abandon.stage),
        reason: abandon.reason,
      });
      if (!ok) return { tone: "bad", lines: errorLines(data) };
      setAbandoningId(null);
      router.refresh();
      return {
        tone: "good",
        lines: [`${rider.name} marked ${abandon.reason} after stage ${abandon.stage}`],
      };
    });
  }

  function importCsv(file: File) {
    run("import", async () => {
      const text = await file.text();
      const res = await fetch("/api/admin/fantasy/pricing", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) return { tone: "bad", lines: errorLines(data) };
      const lines = [`Prices updated for ${Number(data.updated ?? 0)} rider(s)`];
      const unmatched = Array.isArray(data.unmatched) ? data.unmatched : [];
      const errors = Array.isArray(data.errors) ? data.errors : [];
      if (unmatched.length > 0) lines.push(`Unmatched: ${unmatched.join(", ")}`);
      for (const err of errors) lines.push(String(err));
      router.refresh();
      return {
        tone: unmatched.length > 0 || errors.length > 0 ? "bad" : "good",
        lines,
      };
    });
  }

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-[var(--radius-admin-md)] border px-4 py-3 text-sm ${
            banner.tone === "good"
              ? "bg-[var(--color-good-tint)] border-[var(--color-good)]/30 text-[var(--color-good)]"
              : "bg-[var(--color-bad-tint)] border-[var(--color-bad)]/30 text-[var(--color-bad)]"
          }`}
        >
          {banner.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confirm a team's startlist */}
        <Card>
          <CardHeader
            title="Confirm team"
            subtitle="Sets every provisional rider on the team to confirmed, with the announcement as source"
          />
          <CardBody compact className="flex flex-wrap items-end gap-3 pt-0">
            <div className="min-w-[180px] flex-1">
              <label htmlFor="confirm-team" className="block text-xs text-foreground-muted mb-1.5">
                Pro team
              </label>
              <Select
                id="confirm-team"
                value={confirmTeamId}
                onChange={(e) => setConfirmTeamId(e.target.value)}
              >
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[200px] flex-[2]">
              <label htmlFor="confirm-source" className="block text-xs text-foreground-muted mb-1.5">
                Source URL (official announcement)
              </label>
              <Input
                id="confirm-source"
                type="url"
                value={confirmSource}
                onChange={(e) => setConfirmSource(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <Button
              variant="secondary"
              onClick={confirmTeam}
              loading={busy === "confirm-team"}
              disabled={!confirmTeamId || !confirmSource.trim()}
            >
              Confirm riders
            </Button>
          </CardBody>
        </Card>

        {/* Pricing sheet CSV */}
        <Card>
          <CardHeader
            title="Pricing sheet"
            subtitle="CSV columns: name,pcs_id,team,class,price,country. Import updates prices by pcs_id or exact name."
          />
          <CardBody compact className="flex flex-wrap items-center gap-3 pt-0">
            <Button variant="secondary" href="/api/admin/fantasy/pricing">
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              loading={busy === "import"}
            >
              Import prices…
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importCsv(file);
                e.target.value = "";
              }}
            />
          </CardBody>
        </Card>
      </div>

      {/* Add rider */}
      <Card>
        <CardHeader
          title="Add rider"
          action={
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(!addOpen)}>
              {addOpen ? "Hide" : "Show"}
            </Button>
          }
        />
        {addOpen && (
          <CardBody compact className="pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="add-name" className="block text-xs text-foreground-muted mb-1.5">
                  Name
                </label>
                <Input
                  id="add-name"
                  value={add.name}
                  onChange={(e) => setAdd({ ...add, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="add-team" className="block text-xs text-foreground-muted mb-1.5">
                  Pro team
                </label>
                <Select
                  id="add-team"
                  value={add.proTeamId}
                  onChange={(e) => setAdd({ ...add, proTeamId: e.target.value })}
                >
                  <option value="">Select team…</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="add-class" className="block text-xs text-foreground-muted mb-1.5">
                  Class
                </label>
                <Select
                  id="add-class"
                  value={add.riderClass}
                  onChange={(e) => setAdd({ ...add, riderClass: e.target.value })}
                >
                  {RIDER_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="add-price" className="block text-xs text-foreground-muted mb-1.5">
                  Price (4–24)
                </label>
                <Input
                  id="add-price"
                  type="number"
                  min={4}
                  max={24}
                  value={add.price}
                  onChange={(e) => setAdd({ ...add, price: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="add-country" className="block text-xs text-foreground-muted mb-1.5">
                  Country code
                </label>
                <Input
                  id="add-country"
                  value={add.countryCode}
                  onChange={(e) => setAdd({ ...add, countryCode: e.target.value })}
                  placeholder="e.g. SI"
                />
              </div>
              <div>
                <label htmlFor="add-pcs" className="block text-xs text-foreground-muted mb-1.5">
                  PCS id (optional)
                </label>
                <Input
                  id="add-pcs"
                  value={add.pcsId}
                  onChange={(e) => setAdd({ ...add, pcsId: e.target.value })}
                  placeholder="tadej-pogacar"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="add-source" className="block text-xs text-foreground-muted mb-1.5">
                  Source URL (required)
                </label>
                <Input
                  id="add-source"
                  type="url"
                  value={add.sourceUrl}
                  onChange={(e) => setAdd({ ...add, sourceUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={addRider}
                loading={busy === "add"}
                disabled={!add.name.trim() || !add.proTeamId || !add.sourceUrl.trim()}
              >
                Add rider
              </Button>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Rider table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-sm text-foreground-muted">
            <Num>{filtered.length}</Num> of <Num>{riders.length}</Num> riders
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-auto"
            >
              <option value="all">All statuses</option>
              {RIDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by team"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-auto"
            >
              <option value="all">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Rider
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Team
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Class
                </th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Price
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Source
                </th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-foreground-subtle text-sm">
                    No riders match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rider) => {
                  const isEditing = editingId === rider.id;
                  const isAbandoning = abandoningId === rider.id;
                  return (
                    <tr
                      key={rider.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 align-top"
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-off-white">{rider.name}</span>
                        <span className="block text-xs text-foreground-subtle">
                          {[rider.countryCode, rider.pcsId].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                        {rider.proTeamCode}
                      </td>
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <Select
                            aria-label="Class"
                            value={edit.riderClass}
                            onChange={(e) => setEdit({ ...edit, riderClass: e.target.value })}
                            className="w-24"
                          >
                            {RIDER_CLASSES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <span className="text-sm text-foreground-muted">{rider.riderClass}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <Input
                            aria-label="Price"
                            type="number"
                            min={4}
                            max={24}
                            value={edit.price}
                            onChange={(e) => setEdit({ ...edit, price: e.target.value })}
                            className="w-20 inline-block"
                          />
                        ) : (
                          <Num className="text-sm text-off-white">{rider.price}</Num>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <Select
                            aria-label="Status"
                            value={edit.status}
                            onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                            className="w-32"
                          >
                            {RIDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Pill tone={STATUS_TONES[rider.status]}>
                            {rider.status}
                            {rider.status === "abandoned" && rider.abandonedAfterStage
                              ? ` (st ${rider.abandonedAfterStage})`
                              : ""}
                          </Pill>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        <a
                          href={rider.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-info)] hover:underline"
                        >
                          source
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {isEditing ? (
                          <span className="inline-flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => saveEdit(rider)}
                              loading={busy === `edit-${rider.id}`}
                            >
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </span>
                        ) : isAbandoning ? (
                          <span className="inline-flex items-center gap-2">
                            <Input
                              aria-label="Stage"
                              type="number"
                              min={1}
                              max={21}
                              value={abandon.stage}
                              onChange={(e) => setAbandon({ ...abandon, stage: e.target.value })}
                              className="w-16 inline-block"
                            />
                            <Select
                              aria-label="Reason"
                              value={abandon.reason}
                              onChange={(e) => setAbandon({ ...abandon, reason: e.target.value })}
                              className="w-20"
                            >
                              {ABANDON_REASONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </Select>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => markAbandoned(rider)}
                              loading={busy === `abandon-${rider.id}`}
                            >
                              Confirm
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setAbandoningId(null)}>
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <span className="inline-flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAbandoningId(null);
                                setEditingId(rider.id);
                                setEdit({
                                  price: String(rider.price),
                                  riderClass: rider.riderClass,
                                  status: rider.status,
                                });
                              }}
                            >
                              Edit
                            </Button>
                            {rider.status !== "abandoned" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingId(null);
                                  setAbandoningId(rider.id);
                                }}
                              >
                                Abandon
                              </Button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
