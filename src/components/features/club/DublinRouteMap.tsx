"use client";

import { motion } from "framer-motion";

/**
 * Stylised SVG map of Dublin showing Roadman CC ride routes.
 * Locations: Phoenix Park (Thursday), 360 Cycles Clontarf (Sat/Sun),
 * with route traces heading north along the coast.
 *
 * This is a hand-crafted illustration, not a real map.
 * Positions are approximate and artistic, not GPS-accurate.
 */
export function DublinRouteMap() {
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl bg-deep-purple/30 border border-white/5">
      <svg
        viewBox="0 0 1200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Dublin Bay water */}
        <path
          d="M 700 0 Q 750 100 800 150 Q 850 200 900 220 Q 950 240 1000 250 Q 1050 260 1100 270 L 1200 280 L 1200 0 Z"
          fill="rgba(33, 1, 64, 0.6)"
          stroke="rgba(250, 250, 250, 0.05)"
          strokeWidth="1"
        />
        {/* Coastline */}
        <motion.path
          d="M 700 0 Q 720 60 740 100 Q 760 140 790 170 Q 820 200 860 220 Q 900 235 950 245 Q 1000 252 1050 260 Q 1100 265 1200 270"
          stroke="rgba(250, 250, 250, 0.15)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* River Liffey */}
        <motion.path
          d="M 0 260 Q 100 255 200 258 Q 300 262 400 260 Q 500 258 600 262 Q 650 264 700 260 Q 720 258 750 265"
          stroke="rgba(250, 250, 250, 0.08)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        />

        {/* Grid lines — subtle Dublin street grid */}
        {[180, 220, 260, 300, 340].map((y) => (
          <line
            key={`h-${y}`}
            x1="200"
            y1={y}
            x2="700"
            y2={y}
            stroke="rgba(250, 250, 250, 0.03)"
            strokeWidth="1"
          />
        ))}
        {[300, 400, 500, 600].map((x) => (
          <line
            key={`v-${x}`}
            x1={x}
            y1="150"
            x2={x}
            y2="380"
            stroke="rgba(250, 250, 250, 0.03)"
            strokeWidth="1"
          />
        ))}

        {/* Phoenix Park outline */}
        <motion.ellipse
          cx="250"
          cy="200"
          rx="100"
          ry="60"
          stroke="rgba(250, 250, 250, 0.1)"
          strokeWidth="1.5"
          fill="rgba(250, 250, 250, 0.02)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        />

        {/* Thursday Route — Phoenix Park Circuit */}
        <motion.path
          d="M 250 170 Q 310 160 340 180 Q 360 200 340 230 Q 310 250 250 240 Q 190 230 170 200 Q 180 170 250 170"
          stroke="#F16363"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
        />

        {/* Saturday Route — Clontarf heading north */}
        <motion.path
          d="M 720 180 Q 700 160 680 130 Q 660 100 640 70 Q 620 40 580 20 Q 540 10 500 15 Q 460 25 440 50 Q 430 70 450 90 Q 480 100 520 95 Q 560 90 600 100 Q 640 120 670 150 Q 700 170 720 180"
          stroke="#F16363"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 2, ease: "easeOut" }}
        />

        {/* Sunday Route — Clontarf shorter loop */}
        <motion.path
          d="M 720 180 Q 690 150 660 130 Q 630 115 600 120 Q 570 130 560 150 Q 560 170 580 185 Q 610 195 650 190 Q 690 185 720 180"
          stroke="#4C1273"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.5, ease: "easeOut" }}
        />

        {/* Location pins */}
        {/* Phoenix Park — Thursday */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <circle cx="250" cy="200" r="6" fill="#F16363" />
          <circle cx="250" cy="200" r="10" fill="none" stroke="#F16363" strokeWidth="1" opacity="0.4" />
          <text x="250" y="230" textAnchor="middle" fill="#FAFAFA" fontSize="11" fontFamily="sans-serif" fontWeight="600">
            PHOENIX PARK
          </text>
          <text x="250" y="244" textAnchor="middle" fill="#A0A0A5" fontSize="9" fontFamily="sans-serif">
            Thu 6:30pm
          </text>
        </motion.g>

        {/* 360 Cycles Clontarf — Sat/Sun */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <circle cx="720" cy="180" r="6" fill="#F16363" />
          <circle cx="720" cy="180" r="10" fill="none" stroke="#F16363" strokeWidth="1" opacity="0.4" />
          <text x="720" y="210" textAnchor="middle" fill="#FAFAFA" fontSize="11" fontFamily="sans-serif" fontWeight="600">
            CLONTARF
          </text>
          <text x="720" y="224" textAnchor="middle" fill="#A0A0A5" fontSize="9" fontFamily="sans-serif">
            Sat 9:30am · Sun 10am
          </text>
        </motion.g>

        {/* Dublin City Centre label */}
        <motion.text
          x="480"
          y="275"
          textAnchor="middle"
          fill="rgba(250, 250, 250, 0.12)"
          fontSize="14"
          fontFamily="sans-serif"
          letterSpacing="6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          DUBLIN
        </motion.text>

        {/* Dublin Bay label */}
        <motion.text
          x="950"
          y="140"
          textAnchor="middle"
          fill="rgba(250, 250, 250, 0.08)"
          fontSize="11"
          fontFamily="sans-serif"
          letterSpacing="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          DUBLIN BAY
        </motion.text>

        {/* Route legend */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <line x1="40" y1="420" x2="70" y2="420" stroke="#F16363" strokeWidth="2.5" strokeDasharray="6 4" />
          <text x="80" y="424" fill="#A0A0A5" fontSize="10" fontFamily="sans-serif">Thursday Circuit</text>

          <line x1="40" y1="440" x2="70" y2="440" stroke="#F16363" strokeWidth="2.5" />
          <text x="80" y="444" fill="#A0A0A5" fontSize="10" fontFamily="sans-serif">Saturday Main Ride</text>

          <line x1="40" y1="460" x2="70" y2="460" stroke="#4C1273" strokeWidth="2" />
          <text x="80" y="464" fill="#A0A0A5" fontSize="10" fontFamily="sans-serif">Sunday Spin</text>
        </motion.g>
      </svg>
    </div>
  );
}
