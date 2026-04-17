export function MigrationBanner() {
  return (
    <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm">
      <div className="font-semibold text-yellow-300 mb-1">
        Ted database tables aren&apos;t set up yet
      </div>
      <div className="text-foreground-subtle text-xs leading-relaxed">
        The <code className="px-1 rounded bg-white/5">ted_*</code> tables haven&apos;t been
        created on this environment. Run the migrations, then reload:
      </div>
      <pre className="mt-2 rounded-md bg-charcoal/60 border border-white/10 p-3 text-xs text-white font-mono overflow-x-auto">
        npm run db:migrate
      </pre>
      <div className="text-xs text-foreground-subtle mt-2">
        Or apply these two SQL files directly in the Vercel Postgres console:{" "}
        <code className="px-1 rounded bg-white/5">
          drizzle/0019_ted_community_agent.sql
        </code>{" "}
        and{" "}
        <code className="px-1 rounded bg-white/5">
          drizzle/0020_ted_surface_drafts.sql
        </code>
        . Every Ted admin page will start working once those complete.
      </div>
    </div>
  );
}
