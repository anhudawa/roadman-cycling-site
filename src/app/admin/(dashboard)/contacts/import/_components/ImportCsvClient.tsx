"use client";

import Link from "next/link";
import { useState } from "react";

const TARGET_FIELDS = [
  { value: "", label: "— Ignore —" },
  { value: "email", label: "Email" },
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone" },
  { value: "owner", label: "Owner" },
  { value: "tags", label: "Tags" },
] as const;

type TargetField = "" | "email" | "name" | "phone" | "owner" | "tags";

interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{ row: number; reason: string }>;
}

// Minimal RFC-4180-ish CSV parser (handles quotes + embedded commas/newlines).
function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      cur.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      cur.push(field);
      field = "";
      rows.push(cur);
      cur = [];
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // flush last field
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1).filter((r) => r.some((v) => v.trim().length > 0));
  return { headers, rows: dataRows };
}

function autoMap(header: string): TargetField {
  const h = header.trim().toLowerCase();
  if (h === "email" || h === "e-mail" || h === "email address") return "email";
  if (h === "name" || h === "full name" || h === "contact name") return "name";
  if (h === "phone" || h === "phone number" || h === "mobile") return "phone";
  if (h === "owner" || h === "assigned" || h === "assigned to") return "owner";
  if (h === "tags" || h === "tag" || h === "labels") return "tags";
  return "";
}

export function ImportCsvClient() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<TargetField[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    const p = parseCsv(text);
    if (p.headers.length === 0) {
      setError("CSV is empty or unreadable");
      setParsed(null);
      return;
    }
    setParsed(p);
    setMapping(p.headers.map(autoMap));
  }

  async function runImport() {
    if (!parsed) return;
    const emailIdx = mapping.indexOf("email");
    if (emailIdx === -1) {
      setError("You must map one column to Email");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const rows = parsed.rows.map((r) => {
        const obj: Record<string, string> = {};
        mapping.forEach((target, idx) => {
          if (!target) return;
          const v = r[idx];
          if (v !== undefined) obj[target] = v;
        });
        return obj;
      });
      const res = await fetch("/api/admin/crm/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<ImportResult> & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `Import failed (${res.status})`);
      }
      setResult({
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        errors: data.errors ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function updateMapping(idx: number, value: TargetField) {
    setMapping((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  const previewRows = parsed?.rows.slice(0, 10) ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
        <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-2">
          CSV file
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) handleFile(f);
          }}
          className="block text-sm text-[var(--color-fg)] file:mr-4 file:px-3 file:py-2 file:rounded-[var(--radius-admin-md)] file:border-0 file:bg-[var(--color-raised)] file:text-[var(--color-fg)] file:font-body file:font-semibold file:text-[13px]"
        />
        {fileName && (
          <p className="mt-2 text-xs text-foreground-muted">
            Loaded: <span className="text-off-white">{fileName}</span>
            {parsed ? ` · ${parsed.rows.length} rows · ${parsed.headers.length} columns` : ""}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {parsed && (
        <div className="bg-background-elevated rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
              Column mapping · first 10 rows
            </p>
            <button
              type="button"
              onClick={runImport}
              disabled={importing}
              className="px-3 py-2 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)] disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${parsed.rows.length} rows`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02]">
                <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                  {parsed.headers.map((h, idx) => (
                    <th key={idx} className="px-4 py-3 font-medium min-w-[160px]">
                      <div className="text-off-white normal-case text-xs mb-1">{h}</div>
                      <select
                        value={mapping[idx] ?? ""}
                        onChange={(e) =>
                          updateMapping(idx, e.target.value as TargetField)
                        }
                        className="w-full px-2 py-1 text-xs bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
                      >
                        {TARGET_FIELDS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, rIdx) => (
                  <tr key={rIdx} className="border-t border-white/5">
                    {parsed.headers.map((_h, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-2 text-xs text-foreground-muted whitespace-nowrap"
                      >
                        {r[cIdx] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[var(--color-elevated)] rounded-[var(--radius-admin-lg)] border border-[var(--color-good)]/30 p-4">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-2">
            Import complete
          </p>
          <p className="text-sm text-off-white">
            <span className="text-green-400">{result.created} created</span>
            {" · "}
            <span className="text-blue-400">{result.updated} updated</span>
            {" · "}
            <span className={result.errors.length > 0 ? "text-amber-400" : "text-foreground-muted"}>
              {result.errors.length} errors
            </span>
          </p>
          {result.errors.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-foreground-muted cursor-pointer hover:text-off-white">
                View errors
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-foreground-muted">
                {result.errors.slice(0, 50).map((e, i) => (
                  <li key={i}>
                    Row {e.row + 2}: {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="mt-4">
            <Link
              href="/admin/contacts"
              className="inline-block px-3 py-2 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)]"
            >
              View contacts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
