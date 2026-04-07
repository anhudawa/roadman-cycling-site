"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Page transition wrapper.
 * - Always renders children immediately (no FOIC)
 * - After hydration, subsequent navigations get a subtle fade+slide
 * - Uses useState/useEffect to avoid hydration mismatch
 */

export default function Template({ children }: { children: React.ReactNode }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Enable animations after first hydration completes
    // This runs only on the client, after the initial render matches the server
    setShouldAnimate(true);
  }, []);

  if (!shouldAnimate) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.3, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
