"use client";

import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/profile/logout", { method: "POST" });
        } finally {
          window.location.href = "/";
        }
      }}
      className="text-sm text-foreground-muted underline hover:text-coral disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
