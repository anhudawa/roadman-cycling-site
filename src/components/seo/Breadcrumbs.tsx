import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Visual breadcrumb navigation component.
 * Renders as: Home > Parent > Current Page
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-foreground-subtle">
        <li>
          <Link
            href="/"
            className="hover:text-coral transition-colors"
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className="text-foreground-subtle/50">/</span>
            {item.href && i < items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-coral transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
