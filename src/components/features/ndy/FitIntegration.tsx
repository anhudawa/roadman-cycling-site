"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { FitOverlay } from "./FitOverlay";

export function FitIntegration() {
  const [isOpen, setIsOpen] = useState(false);

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
      />
    </>
  );
}
