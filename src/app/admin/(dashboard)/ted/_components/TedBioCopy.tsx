"use client";

import { useState } from "react";

const TED_BIO = `Ted $— Roadman Cycling's AI community assistant. I surface good conversations, welcome new members, and make sure nothing important gets missed. Anthony still runs the show. Built by the Roadman team. If something's off, reply to the post and one of us will sort it.`;

export function TedBioCopy() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(TED_BIO);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API blocked $— user can still select the text */
    }
  }

  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-foreground-subtle uppercase tracking-wide">
          Ted&apos;s Skool profile bio
        </div>
        <button
          onClick={copy}
          className="text-xs px-2 py-1 rounded-md bg-white/10 text-white hover:bg-white/15"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-foreground-subtle leading-relaxed">{TED_BIO}</p>
    </div>
  );
}
