import type { ResourceLink } from "@/lib/method/modules";

interface ResourceListProps {
  resources: readonly ResourceLink[];
}

const KIND_LABEL: Record<ResourceLink["kind"], string> = {
  pdf: "PDF",
  "training-peaks": "TRAININGPEAKS",
  external: "LINK",
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <section className="rounded-lg border border-white/10 bg-charcoal/60 p-5">
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
    <section className="rounded-lg border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Resources
      </h2>
      <ul className="space-y-2">
        {resources.map((resource) => (
          <li key={resource.href}>
            <a
              href={resource.href}
              target={resource.kind === "pdf" ? undefined : "_blank"}
              rel={resource.kind === "pdf" ? undefined : "noopener noreferrer"}
              className="group flex items-baseline justify-between gap-3 rounded-md py-2 px-3 -mx-3 hover:bg-white/5"
            >
              <span className="text-off-white group-hover:text-coral transition-colors">
                {resource.title}
              </span>
              <span className="font-heading text-[10px] tracking-[0.25em] text-foreground-muted">
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
