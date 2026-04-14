"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blood-engine/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not send link");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-coral/30 bg-coral-muted p-6 text-off-white">
        <p className="font-heading uppercase tracking-wider text-coral mb-2">Check your inbox</p>
        <p>
          If an account exists for <span className="text-coral">{email}</span>, a sign-in link is on its
          way. The link expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <label className="block">
        <span className="font-heading tracking-wider uppercase text-sm text-off-white block mb-2">
          Email
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-background-elevated border border-white/10 text-off-white focus:border-coral focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? "Sending…" : "Email me a sign-in link"}
      </Button>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </form>
  );
}
