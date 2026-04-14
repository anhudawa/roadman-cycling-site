"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

const CONFIRM_PHRASE = "delete my account";

export function DangerZone() {
  const [confirmText, setConfirmText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blood-engine/me/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete account");
      }
      // User is signed out by the server; bounce them to the public landing.
      window.location.href = "/blood-engine?deleted=1";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <div className="rounded-lg border border-coral/40 bg-coral-muted p-6 mb-6">
        <h2 className="font-heading uppercase text-coral text-xl mb-2">
          Delete account
        </h2>
        <p className="text-sm text-off-white/80 mb-4">
          Permanently delete your Blood Engine account, every report, and the
          interpretation history. This can&apos;t be undone. Stripe billing
          history is kept for tax compliance but is no longer linked to you.
        </p>
        <Button onClick={() => setConfirming(true)} variant="outline">
          Delete my account
        </Button>
      </div>
    );
  }

  const matches = confirmText === CONFIRM_PHRASE;

  return (
    <div className="rounded-lg border border-coral bg-coral-muted p-6 mb-6">
      <h2 className="font-heading uppercase text-coral text-xl mb-2">
        Confirm permanent deletion
      </h2>
      <p className="text-sm text-off-white/90 mb-4">
        Type{" "}
        <code className="bg-charcoal/50 px-2 py-0.5 rounded text-coral">
          {CONFIRM_PHRASE}
        </code>{" "}
        below to confirm. This is final.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={CONFIRM_PHRASE}
        className="w-full px-4 py-3 rounded-md bg-background-elevated border border-white/10 text-off-white focus:border-coral focus:outline-none mb-4"
        autoComplete="off"
      />
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="ghost"
          onClick={() => {
            setConfirming(false);
            setConfirmText("");
            setError(null);
          }}
        >
          Cancel
        </Button>
        <Button onClick={onDelete} disabled={!matches || loading}>
          {loading ? "Deleting…" : "Permanently delete"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
    </div>
  );
}
