"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/method/logout", { method: "POST" });
      startTransition(() => {
        router.push("/method/login");
        router.refresh();
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 hover:border-coral hover:text-coral disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 font-heading uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.97]"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
