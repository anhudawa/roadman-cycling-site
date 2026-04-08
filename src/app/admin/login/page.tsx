"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-coral text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-coral hover:bg-coral-hover disabled:opacity-50 text-off-white font-heading text-lg tracking-wider rounded-lg transition-colors"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}
