"use client";

import { motion } from "framer-motion";

/**
 * Hand-drawn envelope SVG with a coral pulse + paper-plane lift on
 * mount. Sits at the top of the check-email page so the act of
 * receiving feels tangible.
 */
export function EmailSentAnimation() {
  return (
    <div className="relative h-32 md:h-40 flex items-center justify-center mb-8">
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
      >
        <span className="block h-24 w-24 rounded-full border border-coral/40" />
      </motion.div>
      <motion.svg
        viewBox="0 0 64 64"
        className="relative h-20 w-20 md:h-24 md:w-24 text-coral"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Sign-in email sent"
        role="img"
      >
        <rect
          x="6"
          y="14"
          width="52"
          height="36"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <motion.path
          d="M6 17 L32 36 L58 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
        />
        <motion.path
          d="M40 24 L52 28 L46 30 L48 38 L42 33 L36 36 Z"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9, ease: "backOut" }}
          style={{ transformOrigin: "44px 31px" }}
        />
      </motion.svg>
    </div>
  );
}
