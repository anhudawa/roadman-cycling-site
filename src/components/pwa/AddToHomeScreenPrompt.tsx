"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "roadman-a2hs-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari uses a non-standard `navigator.standalone`.
  const nav = window.navigator as unknown as { standalone?: boolean };
  return nav.standalone === true;
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 768px)").matches;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/Android/.test(ua);
}

/**
 * Subtle "Add to Home Screen" prompt.
 *
 *   - Mobile viewports only (≤768px)
 *   - Shows once per session (sessionStorage flag clears on browser close)
 *   - Skipped entirely if the app is already installed (standalone mode)
 *   - Android/Chrome path: triggers on `beforeinstallprompt`, calls
 *     `prompt()` when the user accepts
 *   - iOS path: shows a textual hint with the share-sheet steps because
 *     iOS Safari never fires the event
 */
export function AddToHomeScreenPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosFallback, setIosFallback] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (!isMobileViewport()) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    const onBefore = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBefore);

    // iOS doesn't fire `beforeinstallprompt`. Show the textual hint after
    // a short settle so it doesn't compete with the cohort banner / header.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      iosTimer = setTimeout(() => {
        if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
          setIosFallback(true);
          setVisible(true);
        }
      }, 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferred) {
      dismiss();
      return;
    }
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // user cancelled or browser declined; fall through to dismiss
    }
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Add Roadman to your home screen"
      className="md:hidden fixed left-3 right-3 bottom-[88px] z-[56] rounded-xl border border-white/10 bg-charcoal/95 backdrop-blur shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="font-heading text-[11px] tracking-[0.25em] text-coral uppercase mb-1">
            Roadman, on tap
          </p>
          {iosFallback ? (
            <p className="text-off-white text-sm leading-snug">
              Tap{" "}
              <span aria-hidden="true" className="px-1">
                ⬆︎
              </span>
              <span className="sr-only">the Share button</span> then{" "}
              <span className="font-medium">Add to Home Screen</span> to
              install.
            </p>
          ) : (
            <p className="text-off-white text-sm leading-snug">
              Add Roadman to your home screen — one tap to your next session.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {!iosFallback && (
            <button
              type="button"
              onClick={install}
              className="font-heading tracking-wider uppercase text-[12px] bg-coral hover:bg-coral-hover text-off-white px-3 py-2 rounded-md transition-colors min-h-[40px]"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="text-foreground-subtle hover:text-off-white text-[12px] tracking-wider uppercase font-heading px-3 py-2 min-h-[40px]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
