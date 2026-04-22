"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { updateSlotScriptAction } from "@/app/admin/inventory/actions";

export function ScriptEditor({
  slotId,
  initialScript,
}: {
  slotId: string;
  initialScript: string | null;
}) {
  const [value, setValue] = useState(initialScript ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleBlur = useCallback(() => {
    if (value !== (initialScript ?? "")) {
      startTransition(async () => {
        await updateSlotScriptAction(slotId, value);
        setSaved(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setSaved(false), 2000);
      });
    }
  }, [slotId, value, initialScript]);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Write the ad read script here..."
        rows={3}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white placeholder-foreground-subtle focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]/20 outline-none resize-y transition-colors"
      />
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {isPending && (
          <span className="text-[10px] text-foreground-subtle">Saving...</span>
        )}
        {saved && !isPending && (
          <span className="text-[10px] text-green-400">Saved</span>
        )}
      </div>
    </div>
  );
}
