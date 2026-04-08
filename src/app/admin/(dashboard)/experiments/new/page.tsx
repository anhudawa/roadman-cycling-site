"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ABElementType, ABVariant } from "@/lib/ab/types";

const ELEMENT_TYPES: { value: ABElementType; label: string }[] = [
  { value: "headline", label: "Headline" },
  { value: "cta_button", label: "CTA Button" },
  { value: "form_copy", label: "Form Copy" },
  { value: "hero_image", label: "Hero Image" },
  { value: "layout", label: "Layout" },
];

export default function NewExperimentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [page, setPage] = useState("/");
  const [element, setElement] = useState<ABElementType>("headline");
  // Page path suggestions for quick selection
  const PAGE_PATHS = ["/", "/newsletter", "/podcast", "/skool", "/blog"];
  const [controlContent, setControlContent] = useState("");
  const [variants, setVariants] = useState<ABVariant[]>([]);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = searchParams.get("page");
    const e = searchParams.get("element");
    const c = searchParams.get("content");
    if (p) setPage(p);
    if (e && ELEMENT_TYPES.some((t) => t.value === e)) setElement(e as ABElementType);
    if (c) setControlContent(c);
    if (p && e) {
      const pageName = p === "/" ? "Homepage" : p.replace(/^\//, "").replace(/-/g, " ");
      const elementName = e.replace(/_/g, " ");
      setName(`${pageName} ${elementName} test`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerateVariants() {
    if (!controlContent.trim()) {
      setError("Enter the control content before generating variants.");
      return;
    }
    setError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/experiments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          currentContent: controlContent,
          elementType: element,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate variants");
      }

      const data = await res.json();
      setVariants(data.variants ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate variants");
    } finally {
      setGenerating(false);
    }
  }

  function updateVariant(idx: number, field: "label" | "content", value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function addManualVariant() {
    setVariants((prev) => [
      ...prev,
      {
        id: `var_manual_${Date.now()}`,
        label: `Variant ${prev.length + 1}`,
        content: "",
      },
    ]);
  }

  async function handleSubmit() {
    if (!name.trim() || !page.trim() || !controlContent.trim()) {
      setError("Name, page, and control content are required.");
      return;
    }

    const allVariants = [
      { label: "Control", content: controlContent },
      ...variants.map((v) => ({ label: v.label, content: v.content })),
    ];

    if (allVariants.length < 2) {
      setError("You need at least one variant besides the control.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          page,
          element,
          variants: allVariants,
          createdBy: "manual",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create experiment");
      }

      router.push("/admin/experiments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create experiment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          NEW EXPERIMENT
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Set up a new A/B test to measure conversion impact
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5 space-y-4">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
          BASIC INFO
        </h2>

        <div>
          <label className="block text-sm text-foreground-muted mb-1.5">
            Experiment Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Homepage hero CTA copy"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground-muted mb-1.5">
              Target Page URL
            </label>
            <input
              type="text"
              list="page-paths"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="/"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/50 transition-colors"
            />
            <datalist id="page-paths">
              {PAGE_PATHS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm text-foreground-muted mb-1.5">
              Element Type
            </label>
            <select
              value={element}
              onChange={(e) => setElement(e.target.value as ABElementType)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-off-white focus:outline-none focus:border-coral/50 transition-colors appearance-none"
            >
              {ELEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-charcoal">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control variant */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5 space-y-4">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
          CONTROL (CURRENT CONTENT)
        </h2>
        <textarea
          value={controlContent}
          onChange={(e) => setControlContent(e.target.value)}
          placeholder="Enter the current content for this element..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/50 transition-colors resize-none"
        />

        <button
          onClick={handleGenerateVariants}
          disabled={generating}
          className="px-4 py-2 bg-coral hover:bg-coral/90 disabled:bg-coral/40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
                />
              </svg>
              Generate Variants with AI
            </>
          )}
        </button>
      </div>

      {/* Generated / manual variants */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
            TEST VARIANTS
          </h2>
          <button
            onClick={addManualVariant}
            className="text-xs text-coral hover:text-coral/80 transition-colors"
          >
            + Add manually
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              No variants yet. Generate with AI or add manually.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <div
                key={variant.id}
                className="p-4 rounded-lg border border-white/5 bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={variant.label}
                    onChange={(e) => updateVariant(idx, "label", e.target.value)}
                    className="bg-transparent text-sm text-off-white font-medium focus:outline-none border-b border-transparent focus:border-coral/50 transition-colors"
                  />
                  <button
                    onClick={() => removeVariant(idx)}
                    className="text-xs text-foreground-subtle hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={variant.content}
                  onChange={(e) => updateVariant(idx, "content", e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/50 transition-colors resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-coral hover:bg-coral/90 disabled:bg-coral/40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? "Creating..." : "Create Experiment"}
        </button>
        <button
          onClick={() => router.push("/admin/experiments")}
          className="px-4 py-2.5 text-foreground-muted hover:text-off-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
