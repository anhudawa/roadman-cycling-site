"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global Cmd+K search trigger.
 * Place this in the Header $€” it renders nothing visible but registers the
 * keyboard shortcut to navigate to /search.
 */
export function SearchTrigger() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Invisible component $€” only provides the keyboard shortcut
  return null;
}
