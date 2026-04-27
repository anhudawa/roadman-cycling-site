"use client";

import { useState, useEffect, useCallback } from "react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  /** Selector for the article container to scan for headings */
  containerSelector?: string;
}

export function TableOfContents({
  containerSelector = ".prose-roadman",
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);

  // Extract headings on mount
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const elements = container.querySelectorAll("h2, h3");
    const items: TocHeading[] = [];

    elements.forEach((el, i) => {
      // Generate an ID if one doesn't exist
      if (!el.id) {
        el.id = `heading-${i}-${el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- active heading observer
    setHeadings(items);
  }, [containerSelector]);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Offset for fixed header
      setTimeout(() => {
        window.scrollBy(0, -100);
      }, 300);
    }
  }, []);

  // Don't render if fewer than 3 headings
  if (headings.length < 3) return null;

  return (
    <nav
      className="hidden xl:block fixed top-32 right-[max(1rem,calc((100vw-1200px)/2-20px))] w-56 z-30 rounded-lg border border-white/10 bg-charcoal/85 backdrop-blur-md shadow-xl shadow-black/30 p-4"
      aria-label="Table of contents"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-3 text-foreground-muted hover:text-off-white transition-colors cursor-pointer"
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        <span className="font-heading text-xs tracking-widest uppercase">
          On this page
        </span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {isOpen && (
        <ul className="space-y-1 border-l border-white/10">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={`
                  block text-left w-full text-xs leading-relaxed py-1 cursor-pointer
                  transition-colors border-l-2 -ml-[2px]
                  ${level === 3 ? "pl-5" : "pl-3"}
                  ${
                    activeId === id
                      ? "border-coral text-coral"
                      : "border-transparent text-foreground-subtle hover:text-foreground-muted hover:border-white/20"
                  }
                `}
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
