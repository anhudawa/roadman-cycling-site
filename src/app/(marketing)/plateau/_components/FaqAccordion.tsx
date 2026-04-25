"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  /**
   * Index of the FAQ that should render open on first paint. Used to
   * promote the no-hard-sell answer above the fold of the FAQ section
   * — the one line of copy the audit flagged as best-in-class for
   * disarming cold traffic.
   */
  defaultOpenIndex?: number;
}

export function FaqAccordion({ items, defaultOpenIndex = 0 }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <dl className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div
            key={item.q}
            className={`
              rounded-xl border bg-background-elevated overflow-hidden
              transition-colors
              ${isOpen ? "border-coral/40" : "border-white/10 hover:border-white/25"}
            `}
            style={{ transitionDuration: "var(--duration-normal)" }}
          >
            <dt>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="
                  w-full flex items-center justify-between gap-4
                  text-left px-6 py-5 cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60
                "
              >
                <span className="font-heading text-lg md:text-xl text-off-white tracking-wide">
                  {item.q}
                </span>
                <motion.span
                  className="shrink-0 text-coral"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </motion.span>
              </button>
            </dt>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.dd
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.2, delay: isOpen ? 0.05 : 0 },
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-foreground-muted leading-relaxed">
                    {item.a}
                  </p>
                </motion.dd>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </dl>
  );
}
