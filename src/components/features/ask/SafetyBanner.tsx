export function SafetyBanner({ flags }: { flags: string[] }) {
  if (!flags || flags.length === 0) return null;
  const label = flags.includes("medical")
    ? "This sounds medical $€” please see a GP first."
    : flags.includes("injury")
      ? "Injuries need a physio, not a podcast. Get it looked at."
      : flags.includes("weight")
        ? "Extreme weight cuts are dangerous $€” dietitian first."
        : "Please check with a qualified professional before acting on this.";

  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-500/[0.08] p-3 mb-3">
      <p className="text-amber-200 text-xs font-medium">
        <span className="font-heading tracking-widest uppercase mr-2">Safety note</span>
        {label}
      </p>
    </div>
  );
}
