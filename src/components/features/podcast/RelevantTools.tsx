import Link from "next/link";
import type { PodcastToolMatch } from "@/lib/podcast-tools";

interface RelevantToolsProps {
  tools: PodcastToolMatch[];
  className?: string;
}

/**
 * "Use these tools" panel on a podcast episode page. Mirrors the visual
 * pattern of FREE TRAINING PLANS so the two sections sit side-by-side
 * without competing for attention. Tools are matched by pillar + keyword
 * scoring in `getRelevantTools` and capped to a small set (typically 3).
 */
export function RelevantTools({ tools, className = "" }: RelevantToolsProps) {
  if (!tools.length) return null;
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 ${className}`}
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        USE THESE TOOLS
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={tool.href}
              className="block rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-3 transition-all"
            >
              <p className="font-heading text-off-white text-sm tracking-wider mb-1">
                {tool.title.toUpperCase()} <span className="text-coral">→</span>
              </p>
              <p className="text-foreground-muted text-xs leading-relaxed">
                {tool.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
