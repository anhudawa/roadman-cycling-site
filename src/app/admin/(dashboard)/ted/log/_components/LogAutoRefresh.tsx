"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function LogAutoRefresh({ intervalSeconds = 30 }: { intervalSeconds?: number }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);

  useEffect(() => {
    if (!enabled) return;
    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [enabled, intervalSeconds, router]);

  return (
    <label className="flex items-center gap-2 text-xs text-foreground-subtle">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => {
          setEnabled(e.target.checked);
          if (e.target.checked) setSecondsLeft(intervalSeconds);
        }}
        className="accent-emerald-400"
      />
      Auto-refresh {enabled ? `(${secondsLeft}s)` : "off"}
    </label>
  );
}
