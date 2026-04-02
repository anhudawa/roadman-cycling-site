"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
      {/* Video background placeholder — replace src with real cycling footage */}
      <div className="absolute inset-0 bg-charcoal">
        {/* When video is available, uncomment:
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/videos/hero-cycling.mp4" type="video/mp4" />
        </video>
        */}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-purple/50 via-charcoal/70 to-charcoal" />

      <div className="relative z-10 text-center px-5 md:px-8 max-w-[1200px] mx-auto w-full pt-20">
        <motion.h1
          className="font-heading text-off-white leading-none mb-6"
          style={{ fontSize: "var(--text-hero)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          CYCLING IS HARD.
          <br />
          <motion.span
            className="text-coral"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            WE MAKE IT LESS HARD.
          </motion.span>
        </motion.h1>

        <motion.p
          className="font-body text-foreground-muted max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          The podcast trusted by 100 million listeners. The community where
          serious cyclists stop guessing and start getting faster.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button href="/podcast" size="lg">
            Listen Now
          </Button>
          <Button href="/community/clubhouse" variant="ghost" size="lg">
            Join Free
          </Button>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div
            className="w-0.5 h-12 bg-gradient-to-b from-coral to-transparent"
            animate={{ scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
