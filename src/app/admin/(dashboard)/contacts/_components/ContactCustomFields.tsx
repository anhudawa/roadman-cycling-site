"use client";

import { useEffect, useState } from "react";

type FieldType = "text" | "longtext" | "number" | "date" | "url" | "select" | "boolean";

interface Option {
  label: string;
  value: string;
}

interface FieldDef {
  id: number;
  key: string;
  label: string;
  type: FieldType;
  options: Option[];
  helpText: string | null;
  sortOrder: number;
}

export function ContactCustomFields({
  contactId,
  initialDefs,
  initialValues,
}: {
  contactId: number;
  initialDefs: FieldDef[];
  initialValues: Record<string, unknown>;
}) {
  const [defs] = useState<FieldDef[]>(initialDefs);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  if (defs.length === 0) {
    return (
      <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
        <h3 className="font-heading text-sm text-off-white tracking-wider uppercase mb-2">
          Custom fields
        </h3>
        <p className="text-xs text-foreground-subtle">
          No custom fields defined yet. Admins can add them in{" "}
          <a href="/admin/settings" className="text-coral hover:underline">
            Settings
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
      <h3 className="font-heading text-sm text-off-white tracking-wider uppercase mb-3">
        Custom fields
      </h3>
      <div className="flex flex-col gap-3">
        {defs.map((def) => (
          <FieldRow
            key={def.id}
            contactId={contactId}
            def={def}
            value={values[def.key]}
            onSaved={(newValues) => setValues(newValues)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldRow({
  contactId,
  def,
  value,
  onSaved,
}: {
  contactId: number;
  def: FieldDef;
  value: unknown;
  onSaved: (values: Record<string, unknown>) => void;
}) {
  const [draft, setDraft] = useState<string>(toInputString(value));
  const [checked, setChecked] = useState<boolean>(value === true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toInputString(value));
    setChecked(value === true);
  }, [value]);

  async function save(newValue: unknown) {
    setStatus("saving");
    setErrMsg(null);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/custom-values`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: def.key, value: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      onSaved(data.values ?? {});
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  function baseInputClass() {
    return "w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white focus:outline-none focus:border-coral/50";
  }

  let input: React.ReactNode = null;
  if (def.type === "longtext") {
    input = (
      <textarea
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => save(draft)}
        className={baseInputClass()}
      />
    );
  } else if (def.type === "number") {
    input = (
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => save(draft === "" ? null : draft)}
        className={baseInputClass()}
      />
    );
  } else if (def.type === "date") {
    input = (
      <input
        type="date"
        value={draft.slice(0, 10)}
        onChange={(e) => {
          setDraft(e.target.value);
          save(e.target.value || null);
        }}
        className={baseInputClass()}
      />
    );
  } else if (def.type === "url") {
    input = (
      <div className="flex flex-col gap-1">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          placeholder="https://..."
          className={baseInputClass()}
        />
        {typeof value === "string" && value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-coral hover:underline truncate"
          >
            {value}
          </a>
        )}
      </div>
    );
  } else if (def.type === "select") {
    input = (
      <select
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          save(e.target.value || null);
        }}
        className={baseInputClass()}
      >
        <option value="">—</option>
        {def.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (def.type === "boolean") {
    input = (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            save(e.target.checked);
          }}
          className="w-4 h-4 accent-coral"
        />
        <span className="text-xs text-foreground-muted">
          {checked ? "Yes" : "No"}
        </span>
      </label>
    );
  } else {
    input = (
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => save(draft)}
        className={baseInputClass()}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium flex items-center gap-1">
          {def.label}
          {def.helpText && (
            <span
              title={def.helpText}
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/10 text-[9px] text-foreground-muted cursor-help"
            >
              ?
            </span>
          )}
        </label>
        <span className="text-[10px] text-foreground-subtle">
          {status === "saving" && "saving..."}
          {status === "saved" && <span className="text-emerald-300">saved</span>}
          {status === "error" && (
            <span className="text-red-300" title={errMsg ?? ""}>
              error
            </span>
          )}
        </span>
      </div>
      {input}
    </div>
  );
}

function toInputString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}
