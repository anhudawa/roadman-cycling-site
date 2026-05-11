import type { ResourceLink } from "@/lib/method/modules";

interface ResourceListProps {
  resources: readonly ResourceLink[];
}

/**
 * Sidebar list of downloadables / external links for a module. The
 * TrainingPeaks plan gets pulled out into its own callout above this
 * list (see TrainingPeaksCallout) — we still render it here so the
 * full inventory stays visible on long modules.
 */
const KIND_LABEL: Record<ResourceLink["kind"], string> = {
  pdf: "PDF",
  "training-peaks": "TRAININGPEAKS",
  external: "LINK",
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
        <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
          Resources
        </h2>
        <p className="text-sm text-foreground-muted">
          PDF protocol and TrainingPeaks plan land here once published.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Resources
      </h2>
      <ul className="space-y-1">
        {resources.map((resource) => (
          <li key={resource.href}>
            <a
              href={resource.href}
              target={resource.kind === "pdf" ? undefined : "_blank"}
              rel={resource.kind === "pdf" ? undefined : "noopener noreferrer"}
              className="group flex items-center justify-between gap-3 rounded-md py-2.5 px-3 -mx-3 hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-3 min-w-0">
                <ResourceIcon kind={resource.kind} />
                <span className="text-off-white group-hover:text-coral transition-colors truncate">
                  {resource.title}
                </span>
              </span>
              <span className="font-heading text-[10px] tracking-[0.25em] text-foreground-muted whitespace-nowrap">
                {KIND_LABEL[resource.kind]}
                {resource.kind === "pdf" && resource.sizeLabel
                  ? ` · ${resource.sizeLabel}`
                  : ""}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResourceIcon({ kind }: { kind: ResourceLink["kind"] }) {
  const className = "h-4 w-4 text-coral/70 flex-shrink-0";
  if (kind === "pdf") {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden>
        <path
          d="M3 1 H10 L13 4 V15 H3 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M10 1 V4 H13" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "training-peaks") {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden>
        <path
          d="M2 12 L6 6 L9 9 L14 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M9 4 H12 V7 M12 4 L7 9 M11 9 V13 H3 V5 H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
