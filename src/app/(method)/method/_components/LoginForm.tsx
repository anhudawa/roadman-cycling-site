"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  defaultEmail?: string;
}

/**
 * Email-only sign-in. POSTs to /api/method/login which mints a magic
 * link and emails it via Resend. We never reveal whether the email is
 * enrolled — the API responds 200 either way to prevent enumeration.
 */
export function LoginForm({ defaultEmail = "" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const trimmed = email.trim().toLowerCase();
      const res = await fetch("/api/method/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Could not request a sign-in link.");
        return;
      }
      const params = new URLSearchParams({ to: trimmed });
      router.push(`/method/login/check-email?${params.toString()}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="font-heading text-xs tracking-[0.25em] text-foreground-muted uppercase">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
          className="w-full rounded-md border border-white/15 bg-charcoal/80 px-4 py-3.5 text-off-white placeholder:text-foreground-muted/60 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all"
          placeholder="you@example.com"
        />
      </label>
      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-md border border-coral/40 bg-coral/10 px-4 py-2.5 text-sm text-coral"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 font-heading uppercase tracking-wider text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border-2 border-off-white/40 border-t-off-white motion-safe:animate-spin"
              aria-hidden
            />
            Sending...
          </span>
        ) : (
          "Send sign-in link"
        )}
      </button>
      <p className="text-[11px] text-foreground-muted text-center">
        We&apos;ll email a one-tap link. No passwords, ever.
      </p>
    </form>
  );
}
