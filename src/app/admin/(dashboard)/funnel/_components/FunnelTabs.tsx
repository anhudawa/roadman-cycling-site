import Link from "next/link";

type FunnelView = "lifecycle" | "acquisition";

interface FunnelTabsProps {
  active: FunnelView;
}

const TABS: Array<{ key: FunnelView; label: string; href: string; description: string }> = [
  {
    key: "acquisition",
    label: "Acquisition",
    href: "/admin/funnel/acquisition",
    description: "Visit → Engagement → Email → Paid → Community",
  },
  {
    key: "lifecycle",
    label: "Lifecycle",
    href: "/admin/funnel",
    description: "Email → Skool → Trial → Paid → Active 30d",
  },
];

export function FunnelTabs({ active }: FunnelTabsProps) {
  return (
    <div className="border-b border-white/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <nav className="flex gap-1" aria-label="Funnel views">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-white/20"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
