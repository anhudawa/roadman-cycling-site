import Link from "next/link";

interface PlannerNavProps {
  active: "calendar" | "setup" | "week";
}

const TABS = [
  { key: "calendar", label: "Calendar", href: "/method/fuel-planner" },
  { key: "week", label: "Week pattern", href: "/method/fuel-planner/week" },
  { key: "setup", label: "Rider setup", href: "/method/fuel-planner/setup" },
] as const;

export function PlannerNav({ active }: PlannerNavProps) {
  return (
    <nav
      aria-label="Fuel planner sections"
      className="flex flex-wrap items-center gap-1 border-b border-white/10 mb-8"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={[
              "font-heading uppercase tracking-wider text-xs px-3 py-3 -mb-px border-b-2 transition-colors",
              isActive
                ? "text-coral border-coral"
                : "text-foreground-muted border-transparent hover:text-off-white",
            ].join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
