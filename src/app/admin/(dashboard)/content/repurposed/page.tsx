import Link from "next/link";
import { getEpisodes } from "./actions";

export const metadata = {
  title: "Content Pipeline | Roadman Admin",
};

type Episode = Awaited<ReturnType<typeof getEpisodes>>[number];

const FILTERS = ["all", "pending", "approved", "partial"] as const;
type Filter = (typeof FILTERS)[number];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10",
    approved: "text-green-400 bg-green-400/10",
    partial: "text-blue-400 bg-blue-400/10",
  };
  const style = styles[status] ?? "text-foreground-subtle bg-white/5";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PillarBadge({ pillar }: { pillar: string | null }) {
  if (!pillar) return null;
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-bad-tint)] text-[var(--color-bad)] truncate max-w-[120px]">
      {pillar}
    </span>
  );
}

function ContentProgress({
  approved,
  total,
}: {
  approved: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <p className="text-xs text-foreground/60">
        {approved}/{total} approved
      </p>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-info)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const generatedDate = episode.generatedAt
    ? new Date(episode.generatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/admin/content/repurposed/${episode.id}`}
      className="block rounded-[var(--radius-admin-lg)] bg-[var(--color-raised)] border border-[var(--color-border)] p-4 hover:border-[var(--color-border-strong)] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {episode.episodeNumber != null && (
            <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-raised)] text-[var(--color-fg)]">
              #{episode.episodeNumber}
            </span>
          )}
          <h3 className="text-foreground font-semibold text-sm truncate group-hover:text-off-white transition-colors">
            {episode.episodeTitle ?? episode.episodeSlug}
          </h3>
        </div>
        <StatusBadge status={episode.status ?? "pending"} />
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <PillarBadge pillar={episode.pillar} />
        <span className="text-foreground/60 text-xs">{generatedDate}</span>
      </div>

      <ContentProgress
        approved={episode.approvedContent ?? 0}
        total={episode.totalContent ?? 0}
      />
    </Link>
  );
}

export default async function ContentPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const filterParam = typeof resolved.filter === "string" ? resolved.filter : "all";
  const activeFilter: Filter = FILTERS.includes(filterParam as Filter)
    ? (filterParam as Filter)
    : "all";

  let episodes: Episode[] = [];
  try {
    episodes = await getEpisodes(activeFilter === "all" ? undefined : activeFilter);
  } catch {
    // DB not provisioned — empty state shown below
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          CONTENT PIPELINE
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Review and approve generated podcast content
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/content/repurposed" : `/admin/content/repurposed?filter=${f}`}
            className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              activeFilter === f
                ? "bg-[var(--color-raised)] text-[var(--color-fg)]"
                : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Link>
        ))}
      </div>

      {/* Episode grid */}
      {episodes.length === 0 ? (
        <div className="rounded-[var(--radius-admin-lg)] bg-[var(--color-raised)] border border-[var(--color-border)] p-10 text-center">
          <svg
            className="w-8 h-8 text-foreground-subtle mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
          <p className="text-foreground-subtle text-sm mb-1">
            No repurposed content yet.
          </p>
          <p className="text-foreground-subtle/70 text-xs font-mono">
            Run <span className="bg-white/5 px-1.5 py-0.5 rounded">npm run repurpose:latest</span> to generate content from your latest podcast episode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
