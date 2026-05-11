"use client";

/**
 * Error boundary for /method/*.
 *
 * Catches any uncaught exception in the method tree (DB down,
 * missing env, component throw) and renders a recovery UI instead
 * of crashing the entire page — which in some edge cases can
 * trigger a redirect loop.
 */
export default function MethodError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center space-y-6">
        <p className="font-heading text-xs tracking-[0.3em] text-coral">
          SOMETHING WENT WRONG
        </p>
        <h1 className="font-heading uppercase text-3xl md:text-4xl text-off-white">
          We hit a bump
        </h1>
        <p className="text-foreground-muted">
          This page didn&apos;t load properly. Try refreshing — and if that
          still hangs, clear your session and sign in again. Your progress is
          safe.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="font-heading text-sm tracking-wider bg-coral text-off-white px-6 py-3 rounded-md hover:bg-coral-hover transition-colors active:scale-[0.97]"
          >
            TRY AGAIN
          </button>
          <a
            href="/api/method/logout"
            className="font-heading text-sm tracking-wider border border-white/20 text-off-white px-6 py-3 rounded-md hover:border-white/40 transition-colors"
          >
            CLEAR SESSION &amp; SIGN IN
          </a>
        </div>
        <p className="pt-2 text-xs text-foreground-muted">
          Still stuck? Email{" "}
          <a
            href="mailto:sarah@roadmancycling.com"
            className="text-coral underline-offset-4 hover:underline"
          >
            sarah@roadmancycling.com
          </a>{" "}
          — we&apos;ll fix it for you.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-6 text-left text-xs text-red-400 bg-black/30 p-4 rounded overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
