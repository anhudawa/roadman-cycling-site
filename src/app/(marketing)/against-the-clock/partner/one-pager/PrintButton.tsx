"use client";

/**
 * Print / save-as-PDF trigger for the Against the Clock one-pager.
 * Hidden on the printed sheet via the `.no-print` class in the page's
 * print stylesheet — it only exists for the on-screen toolbar.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center justify-center gap-2 rounded-md font-heading uppercase tracking-wider text-sm px-6 py-3 text-off-white transition-colors"
      style={{ backgroundColor: "#F16363" }}
    >
      Print / Save as PDF
    </button>
  );
}
