"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
} from "@/components/admin/ui";

export interface OverrideRow {
  key: string;
  valueJson: string;
  updatedBy: string;
  updatedAt: string;
}

interface Banner {
  tone: "good" | "bad";
  text: string;
}

export function ConfigManager({
  overrides,
  knownKeys,
}: {
  overrides: OverrideRow[];
  knownKeys: string[];
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [valueJson, setValueJson] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  async function save() {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setBanner({ tone: "bad", text: "Key is required." });
      return;
    }
    try {
      JSON.parse(valueJson);
    } catch {
      setBanner({ tone: "bad", text: "Value must be valid JSON (strings need quotes)." });
      return;
    }
    setBusy("save");
    setBanner(null);
    try {
      const res = await fetch("/api/admin/fantasy/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmedKey, valueJson }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setBanner({
          tone: "bad",
          text: typeof data.error === "string" ? data.error : "Save failed",
        });
        return;
      }
      setBanner({
        tone: data.knownKey === false ? "bad" : "good",
        text:
          data.knownKey === false
            ? `Saved "${trimmedKey}", but it is not a known config key — mergeConfig will ignore it.`
            : `Saved override for "${trimmedKey}".`,
      });
      setKey("");
      setValueJson("");
      router.refresh();
    } catch {
      setBanner({ tone: "bad", text: "Network error — try again" });
    } finally {
      setBusy(null);
    }
  }

  async function remove(overrideKey: string) {
    if (!window.confirm(`Delete the override for "${overrideKey}"? The launch default applies again.`)) {
      return;
    }
    setBusy(`delete-${overrideKey}`);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/fantasy/config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: overrideKey }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setBanner({
          tone: "bad",
          text: typeof data.error === "string" ? data.error : "Delete failed",
        });
        return;
      }
      setBanner({ tone: "good", text: `Deleted override "${overrideKey}".` });
      router.refresh();
    } catch {
      setBanner({ tone: "bad", text: "Network error — try again" });
    } finally {
      setBusy(null);
    }
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
          {banner.text}
        </div>
      )}

      <Card>
        <CardHeader
          title="Overrides"
          subtitle="Stored fantasy_game_config rows. Deleting one reverts that key to its launch default."
        />
        {overrides.length === 0 ? (
          <CardBody compact className="pt-0">
            <p className="text-sm text-foreground-subtle">
              No overrides stored — the game runs on launch defaults.
            </p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Key
                  </th>
                  <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Value
                  </th>
                  <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Updated by
                  </th>
                  <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Updated
                  </th>
                  <th className="text-right px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-[var(--color-border)] last:border-b-0 align-top"
                  >
                    <td className="px-6 py-2.5 text-sm text-off-white font-mono whitespace-nowrap">
                      {row.key}
                    </td>
                    <td className="px-6 py-2.5 text-xs text-foreground-muted font-mono max-w-md truncate">
                      {row.valueJson}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                      {row.updatedBy}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                      {new Date(row.updatedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => remove(row.key)}
                        loading={busy === `delete-${row.key}`}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Set override"
          subtitle="Value is JSON: numbers bare (2), strings quoted, arrays/objects in brackets. Partial objects shallow-merge (e.g. jerseyDailyPoints)."
        />
        <CardBody compact className="pt-0 space-y-3">
          <div className="max-w-sm">
            <label htmlFor="config-key" className="block text-xs text-foreground-muted mb-1.5">
              Key
            </label>
            <Input
              id="config-key"
              list="config-keys"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. tttIndividualTimes"
            />
            <datalist id="config-keys">
              {knownKeys.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
          <div className="max-w-xl">
            <label htmlFor="config-value" className="block text-xs text-foreground-muted mb-1.5">
              Value (JSON)
            </label>
            <Textarea
              id="config-value"
              rows={4}
              value={valueJson}
              onChange={(e) => setValueJson(e.target.value)}
              placeholder='e.g. false, 2, or {"yellow": 12}'
            />
          </div>
          <Button variant="secondary" onClick={save} loading={busy === "save"}>
            Save override
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
