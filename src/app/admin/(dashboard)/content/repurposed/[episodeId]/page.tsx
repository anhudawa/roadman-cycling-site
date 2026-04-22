import Link from "next/link";
import { getEpisodeDetail, approveAllContent } from "../actions";
import ContentCard from "./ContentCard";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata = {
  title: "Episode Content | Roadman Admin",
};

// ---------------------------------------------------------------------------
// Status badge (server-renderable)
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "pending";
  const styles: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10",
    approved: "text-green-400 bg-green-400/10",
    partial: "text-blue-400 bg-blue-400/10",
    rejected: "text-red-400 bg-red-400/10",
    amended: "text-blue-400 bg-blue-400/10",
  };
  const style = styles[s] ?? "text-foreground-subtle bg-white/5";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Approve-All button (must be a form/server action submit)
// ---------------------------------------------------------------------------

function ApproveAllButton({ episodeId }: { episodeId: number }) {
  async function handleApproveAll() {
    "use server";
    await approveAllContent(episodeId);
  }

  return (
    <form action={handleApproveAll}>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 hover:border-green-500/40 transition-colors"
      >
        Approve All
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ episodeId: string }>;
}) {
  const { episodeId: episodeIdStr } = await params;
  const episodeId = parseInt(episodeIdStr, 10);

  if (isNaN(episodeId)) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/content/repurposed"
          className="text-foreground-subtle hover:text-off-white transition-colors text-sm"
        >
          &larr; Content Pipeline
        </Link>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-10 text-center">
          <p className="text-foreground-subtle text-sm">Invalid episode ID.</p>
        </div>
      </div>
    );
  }

  let detail: Awaited<ReturnType<typeof getEpisodeDetail>> = null;
  try {
    detail = await getEpisodeDetail(episodeId);
  } catch {
    // DB not provisioned or error — fall through to error state
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/content/repurposed"
          className="text-foreground-subtle hover:text-off-white transition-colors text-sm"
        >
          &larr; Content Pipeline
        </Link>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-10 text-center">
          <p className="text-foreground-subtle text-sm">Episode not found.</p>
          <p className="text-foreground-subtle/60 text-xs mt-1 font-mono">
            ID: {episodeId}
          </p>
        </div>
      </div>
    );
  }

  const { episode, contentPieces } = detail;

  const approvedCount = contentPieces.filter((p) => p.status === "approved").length;
  const totalCount = contentPieces.length;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/content/repurposed"
          className="text-foreground-subtle hover:text-off-white transition-colors text-sm"
        >
          &larr; Content Pipeline
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {episode.episodeNumber != null && (
              <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-raised)] text-[var(--color-fg)]">
                #{episode.episodeNumber}
              </span>
            )}
            <h1 className="font-heading text-2xl text-off-white tracking-wider">
              {episode.episodeTitle ?? episode.episodeSlug}
            </h1>
            <StatusBadge status={episode.status} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {episode.pillar && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-bad-tint)] text-[var(--color-bad)]">
                {episode.pillar}
              </span>
            )}
            <span className="text-foreground-subtle text-xs">
              {approvedCount}/{totalCount} approved
            </span>
            {episode.generatedAt && (
              <span className="text-foreground-subtle text-xs">
                Generated{" "}
                {new Date(episode.generatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {totalCount > 0 && <ApproveAllButton episodeId={episodeId} />}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-info)] transition-all"
              style={{ width: `${Math.round((approvedCount / totalCount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Content grid */}
      {contentPieces.length === 0 ? (
        <div className="bg-background-elevated border border-white/5 rounded-xl p-10 text-center">
          <p className="text-foreground-subtle text-sm">
            No content pieces found for this episode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {contentPieces.map((piece) => (
            <ContentCard key={piece.id} piece={piece} episodeId={episodeId} />
          ))}
        </div>
      )}
    </div>
  );
}
