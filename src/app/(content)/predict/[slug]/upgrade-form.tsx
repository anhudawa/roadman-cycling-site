"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

export function UpgradeForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/paid-reports/availability", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setAvailable(Boolean(data?.stripeReady && data?.raceReportReady));
        }
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (available === false) {
      setError("Race Report checkout is not configured on this environment yet.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/predict/${slug}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Could not start checkout.");
        setSubmitting(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network issue — try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleUpgrade} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
          maxLength={120}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for delivery"
          className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
          maxLength={200}
        />
      </div>
      {error && <p className="text-coral text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={submitting || !email || available === false}
        size="lg"
        className="w-full"
      >
        {submitting
          ? "Opening checkout…"
          : available === false
            ? "Checkout not configured"
            : "Get the Race Report — $29"}
      </Button>
      <p className="text-off-white/50 text-xs text-center">
        Secure checkout via Stripe. Private report link lands in your inbox in under a minute.
      </p>
    </form>
  );
}
