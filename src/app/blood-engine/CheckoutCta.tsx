"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface Props {
  size?: "md" | "lg";
}

export function CheckoutCta({ size = "lg" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blood-engine/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={onClick} disabled={loading} size={size} variant="primary">
        {loading ? "Starting…" : "Get lifetime access — €97"}
      </Button>
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
    </>
  );
}
