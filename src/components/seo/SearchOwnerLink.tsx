import Link from "next/link";
import type { SearchOwner } from "@/lib/seo/search-ownership";

export function SearchOwnerLink({ owner }: { owner: SearchOwner }) {
  return (
    <aside
      aria-label="Canonical Roadman guide"
      className="not-prose mb-8 rounded-xl border border-coral/20 bg-coral/[0.04] px-5 py-4"
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-1">
        EXPLORE THE MAIN ROADMAN RESOURCE
      </p>
      <p className="text-foreground-muted text-sm leading-relaxed mb-2">
        This page is part of Roadman&apos;s broader coverage of{" "}
        {owner.primaryQuery}.
      </p>
      <Link
        href={owner.path}
        data-track={`search_owner_${owner.id}`}
        className="font-heading text-off-white text-base hover:text-coral transition-colors"
      >
        {owner.label} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
