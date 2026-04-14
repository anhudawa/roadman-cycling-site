"use client";

import { useRef, useState } from "react";

export interface AttachmentRow {
  id: number;
  contactId: number | null;
  filename: string;
  contentType: string | null;
  sizeBytes: number | null;
  blobUrl: string;
  blobPathname: string;
  uploadedBySlug: string | null;
  createdAt: string;
}

interface Props {
  contactId: number;
  initial: AttachmentRow[];
  currentUser: { slug: string; role?: "admin" | "member" };
}

function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FileIcon({ contentType }: { contentType: string | null }) {
  const ct = (contentType ?? "").toLowerCase();
  let kind: "image" | "pdf" | "doc" | "other" = "other";
  if (ct.startsWith("image/")) kind = "image";
  else if (ct.includes("pdf")) kind = "pdf";
  else if (ct.includes("word") || ct.includes("officedocument") || ct.includes("msword") || ct.includes("text/")) kind = "doc";

  const fill = {
    image: "text-cyan-400",
    pdf: "text-coral",
    doc: "text-blue-400",
    other: "text-foreground-subtle",
  }[kind];

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`shrink-0 ${fill}`}
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      {kind === "image" ? (
        <circle cx="10" cy="14" r="1.5" />
      ) : kind === "pdf" ? (
        <path d="M8 14h8M8 17h5" />
      ) : kind === "doc" ? (
        <path d="M8 13h8M8 16h8M8 19h5" />
      ) : (
        <path d="M9 15h6" />
      )}
    </svg>
  );
}

export function ContactAttachments({ contactId, initial, currentUser }: Props) {
  const [items, setItems] = useState<AttachmentRow[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = currentUser.role === "admin";

  async function uploadFile(file: File) {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }
    setUploading(true);
    const optimisticId = -Date.now();
    const optimistic: AttachmentRow = {
      id: optimisticId,
      contactId,
      filename: file.name,
      contentType: file.type || null,
      sizeBytes: file.size,
      blobUrl: "#",
      blobPathname: "",
      uploadedBySlug: currentUser.slug,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [optimistic, ...prev]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/attachments`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }
      setItems((prev) => prev.map((it) => (it.id === optimisticId ? data.attachment : it)));
    } catch (e) {
      setItems((prev) => prev.filter((it) => it.id !== optimisticId));
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(att: AttachmentRow) {
    if (att.id < 0) return;
    if (!confirm(`Delete ${att.filename}?`)) return;
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== att.id));
    try {
      const res = await fetch(`/api/admin/crm/attachments/${att.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
          Attachments
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[10px] font-heading tracking-wider uppercase text-coral hover:underline disabled:opacity-40"
        >
          {uploading ? "Uploading…" : "+ Upload"}
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border border-dashed rounded p-3 text-center text-xs text-foreground-subtle mb-3 transition ${
          dragOver ? "border-coral/60 bg-coral/5 text-off-white" : "border-white/10"
        }`}
      >
        Drop files here or{" "}
        <button
          type="button"
          className="text-coral hover:underline"
          onClick={() => inputRef.current?.click()}
        >
          browse
        </button>
        . Max 10MB.
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-3" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-foreground-subtle">No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => {
            const canDelete = isAdmin || a.uploadedBySlug === currentUser.slug;
            const isPending = a.id < 0;
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded border border-white/5 bg-background-deep ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <FileIcon contentType={a.contentType} />
                <div className="min-w-0 flex-1">
                  {isPending ? (
                    <p className="text-sm text-off-white truncate">{a.filename}</p>
                  ) : (
                    <a
                      href={a.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-off-white truncate hover:text-coral block"
                    >
                      {a.filename}
                    </a>
                  )}
                  <p className="text-[11px] text-foreground-subtle">
                    {formatSize(a.sizeBytes)}
                    {a.uploadedBySlug ? ` · ${a.uploadedBySlug}` : ""} · {formatDate(a.createdAt)}
                  </p>
                </div>
                {canDelete && !isPending && (
                  <button
                    type="button"
                    onClick={() => remove(a)}
                    className="text-[11px] text-foreground-subtle hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
