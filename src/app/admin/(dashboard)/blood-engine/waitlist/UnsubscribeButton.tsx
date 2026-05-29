"use client";

import { useState, useTransition } from "react";
import { unsubscribeAction } from "./actions";

export function UnsubscribeButton({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <span className="text-foreground-subtle text-xs">unsubscribed</span>;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Unsubscribe ${email}?`)) return;
        startTransition(async () => {
          await unsubscribeAction(email);
          setDone(true);
        });
      }}
      className="font-heading tracking-wider uppercase text-[11px] text-foreground-subtle hover:text-coral transition-colors cursor-pointer"
    >
      {pending ? "…" : "Unsubscribe"}
    </button>
  );
}
