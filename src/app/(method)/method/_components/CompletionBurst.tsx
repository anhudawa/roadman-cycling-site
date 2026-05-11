"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CompletionBurstProps {
  show: boolean;
}

/**
 * Coral particle burst rendered when a module is marked complete.
 * Pure visual feedback; mounted alongside the toggle button. Particles
 * fan out from centre and fade — no library, just framer-motion.
 */
export function CompletionBurst({ show }: CompletionBurstProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: 14 }).map((_, idx) => {
            const angle = (idx / 14) * Math.PI * 2;
            const distance = 80 + (idx % 3) * 12;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            return (
              <motion.span
                key={idx}
                className="absolute h-1.5 w-1.5 rounded-full bg-coral"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: idx * 0.012,
                }}
                style={{ filter: "drop-shadow(0 0 8px var(--color-coral))" }}
              />
            );
          })}
          <motion.span
            className="absolute h-20 w-20 rounded-full border-2 border-coral"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
