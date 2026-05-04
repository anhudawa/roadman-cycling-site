"use client";

import { useState } from "react";

export interface FAQItem {
  q: string;
  a: string;
}

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full text-left py-5 md:py-6 flex items-start justify-between gap-4 hover:opacity-90 transition-opacity"
            >
              <span className="font-heading text-off-white text-[17px] md:text-lg tracking-wide leading-tight pr-2">
                {item.q.toUpperCase()}
              </span>
              <span
                aria-hidden
                className={`shrink-0 mt-0.5 text-coral text-2xl leading-none transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="text-foreground-muted leading-relaxed pb-6 text-[15px] md:text-base">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
