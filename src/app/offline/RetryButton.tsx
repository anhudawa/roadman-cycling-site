"use client";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center font-heading tracking-wider uppercase text-sm border border-white/20 hover:border-coral/60 text-off-white px-6 py-3 rounded-md transition-colors min-h-[44px]"
    >
      Retry
    </button>
  );
}
