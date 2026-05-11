import type { ModuleAvailability } from "@/lib/method/access";

interface LockedModuleNoticeProps {
  availability: ModuleAvailability;
  className?: string;
}

export function LockedModuleNotice({
  availability,
  className = "",
}: LockedModuleNoticeProps) {
  const days = availability.daysUntilUnlock;
  const unlocksAt = availability.unlocksAt;
  return (
    <section
      className={`rounded-lg border border-coral/20 bg-charcoal/60 p-8 md:p-12 text-center ${className}`}
    >
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        LOCKED
      </p>
      <h2 className="font-heading uppercase leading-[0.95] text-3xl md:text-4xl mb-4">
        Unlocks in {days} day{days === 1 ? "" : "s"}
      </h2>
      <p className="text-foreground-muted max-w-md mx-auto">
        We drip the modules one per week so you can do the work, not just read
        the work. Stack the wins from the earlier weeks first.
      </p>
      {unlocksAt && (
        <p className="mt-4 text-xs text-foreground-muted">
          Unlocks{" "}
          {unlocksAt.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </section>
  );
}
