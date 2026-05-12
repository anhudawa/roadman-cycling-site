"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function ProfileLoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      window.location.href = "/profile/login?sent=1";
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/10 bg-charcoal/60 p-5 space-y-3">
      <label className="block">
        <span className="font-heading uppercase text-[10px] tracking-[0.25em] text-foreground-muted">
          EMAIL
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-1 w-full rounded-md border border-white/15 bg-charcoal/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-coral px-5 py-3 font-heading uppercase tracking-[0.15em] text-sm text-charcoal disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
