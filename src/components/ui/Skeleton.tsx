interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

/** Skeleton for a single podcast episode card */
export function EpisodeCardSkeleton() {
  return (
    <div className="p-5 md:p-6 bg-background-elevated rounded-lg border border-white/5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="skeleton w-16 h-5 rounded-full" />
            <div className="skeleton w-12 h-4 rounded" />
          </div>
          <div className="skeleton skeleton-heading w-3/4" />
          <div className="skeleton skeleton-text w-1/2" />
        </div>
        <div className="shrink-0 text-right space-y-2">
          <div className="skeleton w-14 h-5 rounded ml-auto" />
          <div className="skeleton w-20 h-4 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the podcast search page */
export function PodcastSearchSkeleton() {
  return (
    <div>
      {/* Search bar skeleton */}
      <div className="mb-6">
        <div className="skeleton w-full h-14 rounded-xl" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-9 rounded-full"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>

      {/* Result count skeleton */}
      <div className="skeleton w-32 h-4 mx-auto mb-4 rounded" />

      {/* Episode cards */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <EpisodeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for a single guest card */
export function GuestCardSkeleton() {
  return (
    <div className="p-6 bg-background-elevated rounded-lg border border-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton skeleton-heading w-2/3" />
        <div className="skeleton w-8 h-4 rounded" />
      </div>
      <div className="skeleton skeleton-text w-full mb-2" />
      <div className="skeleton skeleton-text w-3/4 mb-3" />
      <div className="flex gap-2">
        <div className="skeleton w-16 h-5 rounded-full" />
        <div className="skeleton w-14 h-5 rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton for the guest grid page */
export function GuestGridSkeleton() {
  return (
    <>
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-9 rounded-full"
            style={{ width: `${50 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GuestCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
