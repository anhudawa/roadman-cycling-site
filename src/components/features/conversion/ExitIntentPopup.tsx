"use client";

import { useState, useEffect, useCallback } from "react";
import { EmailCapture } from "./EmailCapture";

/**
 * Exit-intent popup for email capture.
 * Desktop: fires when mouse leaves viewport toward top (close/back button).
 * Mobile: fires after 45s on page if user hasn't subscribed.
 * Only shows once per session. Respects prior dismissal.
 */
export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const triggerPopup = useCallback(() => {
    // Don't show if already dismissed or already showing
    if (dismissed || show) return;

    // Don't show if user already subscribed (check sessionStorage)
    if (sessionStorage.getItem("roadman_exit_shown")) return;

    setShow(true);
    sessionStorage.setItem("roadman_exit_shown", "1");
  }, [dismissed, show]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    setDismissed(true);
  }, []);

  useEffect(() => {
    // Don't initialize if already shown this session
    if (sessionStorage.getItem("roadman_exit_shown")) return;

    // Delay activation — don't trigger on immediate bounces
    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, 5000);

    // Desktop: mouse leaves viewport toward top
    const handleMouseLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0) {
        triggerPopup();
      }
    };

    // Mobile: show after 45s of engagement (no mouse events on mobile)
    const mobileTimer = setTimeout(() => {
      if (!armed) return;
      // Only trigger on mobile-sized screens
      if (window.innerWidth < 768) {
        triggerPopup();
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(armTimer);
      clearTimeout(mobileTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [triggerPopup]);

  // Close on escape key
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, handleDismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to newsletter"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="relative w-full max-w-lg animate-slide-up">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-foreground-muted hover:text-off-white hover:border-coral/30 transition-all"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-deep-purple grain-overlay rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          {/* Coral accent bar */}
          <div className="h-1 bg-gradient-to-r from-coral via-coral/80 to-purple" />

          <div className="p-8 md:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-coral/10 border border-coral/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-heading text-3xl md:text-4xl text-off-white mb-3">
                BEFORE YOU GO
              </h2>
              <p className="text-foreground-muted leading-relaxed max-w-sm mx-auto">
                Join 60,000+ cyclists getting <span className="text-off-white font-medium">The Saturday Spin</span> — the week&apos;s sharpest training insights, every Saturday morning.
              </p>
            </div>

            <EmailCapture
              variant="minimal"
              source="exit-intent"
              buttonText="GET FASTER"
              heading=""
              subheading=""
            />

            <p className="text-center text-foreground-subtle text-xs mt-4">
              One email per week. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
