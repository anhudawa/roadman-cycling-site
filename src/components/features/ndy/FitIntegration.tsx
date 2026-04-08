"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { FitOverlay } from "./FitOverlay";
import type { RoutingDecision } from "@/lib/ndy/types";

const DECISION_TO_TIER: Record<string, string> = {
  standard: "tier-standard",
  premium: "tier-premium",
  inner_circle: "tier-vip",
};

export function FitIntegration() {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = useCallback((decision: RoutingDecision) => {
    setIsOpen(false);

    const tierId = DECISION_TO_TIER[decision];
    if (!tierId) return; // not_a_fit: no scroll

    // Delay to let overlay close animation finish
    setTimeout(() => {
      const el = document.getElementById(tierId);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight pulse, remove after animation
      el.classList.add("tier-highlight-active");
      setTimeout(() => el.classList.remove("tier-highlight-active"), 3000);
    }, 600);
  }, []);

  return (
    <>
      <div className="text-center">
        <p className="text-foreground-muted text-base mb-4">
          Not sure which tier fits? Two minutes, no email required.
        </p>
        <Button
          onClick={() => setIsOpen(true)}
          variant="primary"
          size="lg"
        >
          Find Your Fit
        </Button>
        <p className="text-foreground-subtle text-xs mt-3">
          8 quick questions. We&apos;ll point you in the right direction.
        </p>
      </div>

      <FitOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
