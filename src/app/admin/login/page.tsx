"use client";

import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Surface ?error= param from Google OAuth callback redirects.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read URL search param on mount
    if (e) setError(e);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email, password } : { password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Cookie is set by the API response — navigate to dashboard
      window.location.href = "/admin";
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

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

        <a
          href="/api/admin/auth/google/start?next=/admin"
          className="w-full mb-4 flex items-center justify-center gap-3 py-3 bg-white hover:bg-white/90 text-[#3c4043] font-heading tracking-wider rounded-lg transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </a>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-charcoal text-[10px] uppercase tracking-widest text-foreground-subtle">
              or password
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="username"
              autoFocus
              className="w-full px-4 py-3 bg-background-elevated border border-white/10 rounded-lg text-off-white placeholder:text-foreground-subtle focus-ring focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/30 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-background-elevated border border-white/10 rounded-lg text-off-white placeholder:text-foreground-subtle focus-ring focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/30 transition-colors"
            />
          </div>

          {error && (
            <p className="text-[var(--color-bad)] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] disabled:opacity-50 text-off-white border border-[var(--color-border-strong)] font-heading text-lg tracking-wider rounded-lg transition-colors"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          <p className="text-[11px] text-foreground-subtle text-center pt-2">
            Leave email blank to use legacy admin password.
          </p>
        </form>
      </div>
    </div>
  );
}
