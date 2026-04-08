"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  // When login succeeds, navigate client-side so the cookie is applied first
  useEffect(() => {
    if (state?.success) {
      router.push("/admin");
    }
  }, [state?.success, router]);

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl text-off-white tracking-wider">
            ROADMAN ADMIN
          </h1>
          <p className="text-foreground-muted text-sm mt-2">
            Dashboard access
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              required
              autoFocus
              className="w-full px-4 py-3 bg-background-elevated border border-white/10 rounded-lg text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-coral text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || state?.success}
            className="w-full py-3 bg-coral hover:bg-coral-hover disabled:opacity-50 text-off-white font-heading text-lg tracking-wider rounded-lg transition-colors"
          >
            {state?.success ? "REDIRECTING..." : isPending ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}
