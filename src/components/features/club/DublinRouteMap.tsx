"use client";

import { motion } from "framer-motion";

/**
 * Stylised SVG map of Dublin showing Roadman CC ride routes.
 * Premium design: gradient backgrounds, glowing routes, animated pins,
 * topographic-style contour lines for depth.
 */
export function DublinRouteMap() {
  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl border border-white/5">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-purple via-[#1a0a2e] to-charcoal" />

      <svg
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full"
      >
        <defs>
          {/* Route glow filter */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Coral gradient for routes */}
          <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F16363" />
            <stop offset="100%" stopColor="#E84E4E" />
          </linearGradient>
          {/* Radial glow for pins */}
          <radialGradient id="pinRadial">
            <stop offset="0%" stopColor="#F16363" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F16363" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Topographic contour lines — create depth and terrain feel */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.ellipse
            key={`contour-${i}`}
            cx={300 + i * 15}
            cy={280 - i * 8}
            rx={180 + i * 40}
            ry={100 + i * 25}
            stroke={`rgba(250, 250, 250, ${0.015 + i * 0.003})`}
            strokeWidth="0.5"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}

        {/* Dublin Bay — water area with subtle gradient */}
        <motion.path
          d="M 750 0 Q 800 80 840 140 Q 880 200 930 240 Q 980 270 1050 290 Q 1120 305 1200 310 L 1200 0 Z"
          fill="rgba(33, 1, 64, 0.5)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Coastline — glowing */}
        <motion.path
          d="M 750 0 Q 770 50 790 100 Q 810 150 840 190 Q 870 220 910 245 Q 950 262 1000 275 Q 1060 288 1120 296 Q 1160 302 1200 306"
          stroke="rgba(250, 250, 250, 0.2)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        <motion.path
          d="M 750 0 Q 770 50 790 100 Q 810 150 840 190 Q 870 220 910 245 Q 950 262 1000 275 Q 1060 288 1120 296 Q 1160 302 1200 306"
          stroke="rgba(76, 18, 115, 0.4)"
          strokeWidth="6"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />

        {/* River Liffey */}
        <motion.path
          d="M 0 310 Q 150 305 300 308 Q 450 312 550 310 Q 650 308 720 312 Q 760 314 790 320"
          stroke="rgba(250, 250, 250, 0.06)"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        />

        {/* Street grid — subtle texture */}
        {[240, 280, 320, 360].map((y) => (
          <line key={`h-${y}`} x1="250" y1={y} x2="730" y2={y} stroke="rgba(250, 250, 250, 0.02)" strokeWidth="0.5" />
        ))}
        {[350, 450, 550, 650].map((x) => (
          <line key={`v-${x}`} x1={x} y1="200" x2={x} y2="420" stroke="rgba(250, 250, 250, 0.02)" strokeWidth="0.5" />
        ))}

        {/* Phoenix Park — filled area */}
        <motion.path
          d="M 160 230 Q 200 180 280 175 Q 350 178 380 210 Q 395 240 370 275 Q 340 300 270 305 Q 200 300 165 270 Q 150 250 160 230"
          stroke="rgba(250, 250, 250, 0.08)"
          strokeWidth="1"
          fill="rgba(250, 250, 250, 0.015)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* ===================== ROUTES ===================== */}

        {/* Thursday Circuit — Phoenix Park (dashed, glowing) */}
        <motion.path
          d="M 270 215 Q 330 195 360 220 Q 375 245 355 275 Q 325 295 270 290 Q 215 280 200 250 Q 200 225 270 215"
          stroke="url(#coralGrad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 5"
          filter="url(#routeGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
        />

        {/* Saturday Main Ride — Clontarf north loop (solid, glowing) */}
        <motion.path
          d="M 760 210 Q 740 180 710 145 Q 680 110 640 80 Q 600 55 550 45 Q 500 40 460 55 Q 430 70 420 100 Q 420 130 450 150 Q 490 165 540 155 Q 590 145 640 160 Q 690 180 730 200 Q 750 208 760 210"
          stroke="url(#coralGrad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter="url(#routeGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 2, ease: "easeOut" }}
        />

        {/* Sunday Spin — shorter Clontarf loop (purple, softer) */}
        <motion.path
          d="M 760 210 Q 730 185 700 170 Q 665 160 635 168 Q 610 180 608 200 Q 612 220 635 230 Q 670 238 710 232 Q 745 222 760 210"
          stroke="#4C1273"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 3, ease: "easeOut" }}
        />

        {/* ===================== LOCATION PINS ===================== */}

        {/* Phoenix Park pin */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 1.2 }}
        >
          {/* Glow */}
          <circle cx="270" cy="250" r="30" fill="url(#pinRadial)" />
          {/* Pulse ring */}
          <motion.circle
            cx="270" cy="250" r="12"
            fill="none" stroke="#F16363" strokeWidth="1"
            initial={{ r: 6, opacity: 0.8 }}
            animate={{ r: 20, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          {/* Dot */}
          <circle cx="270" cy="250" r="5" fill="#F16363" />
          <circle cx="270" cy="250" r="2" fill="#FAFAFA" />
        </motion.g>

        {/* Phoenix Park label */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <rect x="185" y="322" width="170" height="52" rx="6" fill="rgba(37, 37, 38, 0.85)" stroke="rgba(250, 250, 250, 0.1)" strokeWidth="0.5" />
          <text x="270" y="343" textAnchor="middle" fill="#FAFAFA" fontSize="15" fontWeight="700" fontFamily="sans-serif" letterSpacing="1.5">
            PHOENIX PARK
          </text>
          <text x="270" y="363" textAnchor="middle" fill="#F16363" fontSize="13" fontFamily="sans-serif">
            Thu 6:30pm · The Circuit
          </text>
        </motion.g>

        {/* Clontarf pin */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 1.8 }}
        >
          {/* Glow */}
          <circle cx="760" cy="210" r="30" fill="url(#pinRadial)" />
          {/* Pulse ring */}
          <motion.circle
            cx="760" cy="210" r="12"
            fill="none" stroke="#F16363" strokeWidth="1"
            initial={{ r: 6, opacity: 0.8 }}
            animate={{ r: 20, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
          {/* Dot */}
          <circle cx="760" cy="210" r="5" fill="#F16363" />
          <circle cx="760" cy="210" r="2" fill="#FAFAFA" />
        </motion.g>

        {/* Clontarf label */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
        >
          <rect x="680" y="242" width="160" height="52" rx="6" fill="rgba(37, 37, 38, 0.85)" stroke="rgba(250, 250, 250, 0.1)" strokeWidth="0.5" />
          <text x="760" y="263" textAnchor="middle" fill="#FAFAFA" fontSize="15" fontWeight="700" fontFamily="sans-serif" letterSpacing="1.5">
            360 CYCLES
          </text>
          <text x="760" y="283" textAnchor="middle" fill="#F16363" fontSize="13" fontFamily="sans-serif">
            Sat 9:30am · Sun 10am
          </text>
        </motion.g>

        {/* ===================== LABELS ===================== */}

        {/* Dublin watermark */}
        <motion.text
          x="500"
          y="330"
          textAnchor="middle"
          fill="rgba(250, 250, 250, 0.04)"
          fontSize="80"
          fontWeight="700"
          fontFamily="sans-serif"
          letterSpacing="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
        >
          DUBLIN
        </motion.text>

        {/* Dublin Bay label */}
        <motion.text
          x="1020"
          y="160"
          textAnchor="middle"
          fill="rgba(250, 250, 250, 0.06)"
          fontSize="13"
          fontFamily="sans-serif"
          letterSpacing="5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          DUBLIN BAY
        </motion.text>

        {/* Route legend */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          <rect x="30" y="505" width="230" height="75" rx="8" fill="rgba(37, 37, 38, 0.6)" stroke="rgba(250, 250, 250, 0.05)" strokeWidth="0.5" />
          <line x1="50" y1="528" x2="80" y2="528" stroke="#F16363" strokeWidth="2.5" strokeDasharray="6 4" />
          <text x="90" y="532" fill="#A0A0A5" fontSize="12" fontFamily="sans-serif">Thursday Circuit · 40km</text>

          <line x1="50" y1="548" x2="80" y2="548" stroke="#F16363" strokeWidth="2.5" />
          <text x="90" y="552" fill="#A0A0A5" fontSize="12" fontFamily="sans-serif">Saturday Main Ride · 90km</text>

          <line x1="50" y1="568" x2="80" y2="568" stroke="#4C1273" strokeWidth="2" />
          <text x="90" y="572" fill="#A0A0A5" fontSize="12" fontFamily="sans-serif">Sunday Spin · 80km</text>
        </motion.g>
      </svg>
    </div>
  );
}
