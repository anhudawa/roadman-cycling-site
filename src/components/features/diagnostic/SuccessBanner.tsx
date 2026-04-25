"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Post-submit success banner. Renders once when the results page is
 * loaded with `?fresh=1` (i.e. the user just completed the
 * diagnostic and we redirected them here). Auto-dismisses after 8s
 * or on click, and never re-shows on subsequent visits to the same
 * URL because we strip the param from the address bar after mount.
 *
 * Closes the email-gate loop: the user gave us their email and the
 * very next thing they see is "$œ“ Sent. Check your inbox."
 */
export function SuccessBanner({ emailHint }: { emailHint?: string }) {
  const searchParams = useSearchParams();
  const isFresh = searchParams.get("fresh") === "1";
  const [visible, setVisible] = useState(isFresh);

  useEffect(() => {
    if (!isFresh) return;
    // Strip the ?fresh=1 from the address bar so a refresh / back-
    // forward doesn't re-trigger the banner.
    const url = new URL(window.location.href);
    url.searchParams.delete("fresh");
    window.history.replaceState({}, "", url.toString());

    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, [isFresh]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-1rem)]"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="w-full text-left rounded-lg bg-emerald-500/15 border border-emerald-500/40 backdrop-blur px-4 py-3 cursor-pointer flex items-start gap-3"
      >
        <span aria-hidden="true" className="text-emerald-400 text-lg leading-none mt-0.5">
          $œ“
        </span>
        <span className="text-sm text-off-white">
          <strong className="font-semibold">Sent.</strong>{" "}
          {emailHint
            ? `A copy is on the way to ${emailHint}.`
            : "A copy is on the way to your inbox."}{" "}
          Save the link $€” some riders come back a few weeks in.
        </span>
      </button>
    </div>
  );
}
