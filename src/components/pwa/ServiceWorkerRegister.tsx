"use client";

import { useEffect } from "react";

/**
 * Registers the Roadman service worker in production builds only.
 *
 * Dev mode is intentionally skipped — Next.js HMR + a SW makes for
 * miserable debugging (stale chunks, ghost requests). The SW only ships
 * once the app is built and served from a production origin.
 *
 * The kill-switch: if the user-controlled flag `NEXT_PUBLIC_DISABLE_PWA`
 * is set to "1", any previously installed SW is unregistered and we
 * bail. That gives us a one-deploy escape hatch if the SW ever
 * misbehaves in the wild.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const disabled =
      process.env.NEXT_PUBLIC_DISABLE_PWA === "1" ||
      process.env.NODE_ENV !== "production";

    if (disabled) {
      // Tear down any previously installed SW so a kill-switch flip
      // actually clears the cache for users who already have one.
      if (process.env.NEXT_PUBLIC_DISABLE_PWA === "1") {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister().catch(() => {}));
        });
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // If a fresh SW is waiting (we have an old one active), nudge it
          // to take over so the next reload uses the new cache rules.
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                installing.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
        })
        .catch(() => {
          // Registration is best-effort; failures shouldn't break the app.
        });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
