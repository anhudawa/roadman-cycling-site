"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/method/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Could not request a sign-in link.");
        return;
      }
      router.push("/method/login/check-email");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="font-heading text-xs tracking-[0.25em] text-foreground-muted uppercase">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-charcoal/80 px-4 py-3 text-off-white placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-coral hover:bg-coral-hover disabled:opacity-60 px-6 py-3 font-heading uppercase tracking-wider text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
      >
        {pending ? "Sending..." : "Send sign-in link"}
      </button>
    </form>
  );
}
