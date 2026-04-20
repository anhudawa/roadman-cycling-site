import type { Instrumentation } from "next";

/**
 * Next.js 16 instrumentation hook.
 *
 * Captures server-side errors (Server Components, Route Handlers,
 * Server Actions) and records them into the events table with
 * type="error_report" so we have a single queryable history.
 *
 * Intentionally zero external deps — all data stays in our own
 * Vercel Postgres. Sentry would be a useful add for source maps
 * and frontend session replay, but this gives us a baseline right
 * now: every prod 500 is durably logged and can be counted/filtered
 * via the existing events machinery.
 *
 * Runtime-safe: the events insert uses Drizzle + Vercel Postgres
 * which runs on Node. The Edge runtime branch logs to stderr only
 * (Vercel captures it). This avoids bundling pg drivers into edge
 * functions.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const error = err as Error & { digest?: string };
  const message = error?.message ?? "Unknown error";
  const digest = error?.digest ?? "";
  const stack = (error?.stack ?? "").slice(0, 2000);

  // Always surface to stderr — Vercel logs catch this even if the
  // DB insert below fails.
  console.error(
    "[instrumentation] server error",
    JSON.stringify({
      message,
      digest,
      path: request?.path,
      method: request?.method,
      routePath: context?.routePath,
      routeType: context?.routeType,
    }),
  );

  // Edge runtime: don't attempt DB insert — pg drivers aren't
  // available. The console.error above is the durable record.
  if (process.env.NEXT_RUNTIME === "edge") return;

  try {
    // Dynamic import so the Edge bundle never pulls this in.
    const { recordEvent } = await import("@/lib/admin/events-store");
    await recordEvent("error_report", request?.path ?? context?.routePath ?? "/", {
      source: "server",
      meta: {
        message: message.slice(0, 500),
        digest,
        stack,
        routePath: context?.routePath ?? "",
        routeType: context?.routeType ?? "",
        method: request?.method ?? "",
      },
    });
  } catch (reportErr) {
    // If the DB itself is the cause of the error we're reporting,
    // don't recurse — just log and move on.
    console.error("[instrumentation] error-report insert failed:", reportErr);
  }
};
