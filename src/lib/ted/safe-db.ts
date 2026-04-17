// Helpers that let every /admin/ted page render even when the ted_* tables
// haven't been migrated yet on the target DB. If Postgres replies 42P01
// ("undefined_table"), the query returns the fallback and flags
// `migrationsNeeded=true` so the page can prompt the operator to migrate.

export interface SafeResult<T> {
  data: T;
  migrationsNeeded: boolean;
  error: string | null;
}

function isUndefinedTable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("42P01") ||
    msg.toLowerCase().includes("does not exist") ||
    msg.toLowerCase().includes("relation")
  );
}

export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<SafeResult<T>> {
  try {
    return { data: await fn(), migrationsNeeded: false, error: null };
  } catch (err) {
    const migrationsNeeded = isUndefinedTable(err);
    return {
      data: fallback,
      migrationsNeeded,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Merge many SafeResults — aggregate their data + surface the first error. */
export function anyNeedsMigration(results: SafeResult<unknown>[]): boolean {
  return results.some((r) => r.migrationsNeeded);
}
