"use client";

import { motion } from "framer-motion";
import type { FtpPoint } from "@/lib/season-wrapped/types";

interface Props {
  start: FtpPoint;
  end: FtpPoint;
  history?: FtpPoint[];
}

/**
 * Animated FTP progression line — start point, end point, and
 * (optionally) intermediate samples.
 */
export function PowerLine({ start, end, history }: Props) {
  const points: FtpPoint[] = history && history.length >= 2 ? history : [start, end];
  const minW = Math.min(...points.map((p) => p.watts));
  const maxW = Math.max(...points.map((p) => p.watts));
  const range = Math.max(20, maxW - minW);

  const W = 480;
  const H = 160;
  const padX = 12;
  const padY = 22;

  const x = (i: number) =>
    padX + (i / Math.max(1, points.length - 1)) * (W - padX * 2);
  const y = (w: number) =>
    padY + (1 - (w - minW) / range) * (H - padY * 2);

  const polyline = points
    .map((p, i) => `${x(i).toFixed(1)},${y(p.watts).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`FTP from ${start.watts}W to ${end.watts}W`}
    >
      <defs>
        <linearGradient id="ftpLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4C1273" />
          <stop offset="100%" stopColor="#F16363" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={polyline}
        fill="none"
        stroke="url(#ftpLine)"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={x(i)}
          cy={y(p.watts)}
          r={i === 0 || i === points.length - 1 ? 6 : 3}
          fill={i === points.length - 1 ? "#F16363" : "#FAFAFA"}
          stroke="#210140"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + 0.15 * i }}
        />
      ))}
      {/* End-point label */}
      <motion.text
        x={x(points.length - 1)}
        y={y(end.watts) - 14}
        textAnchor="end"
        fill="#F16363"
        fontFamily="var(--font-heading), sans-serif"
        fontSize="20"
        letterSpacing="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        {end.watts}W
      </motion.text>
      <motion.text
        x={x(0)}
        y={y(start.watts) + 22}
        fill="rgba(250,250,250,0.5)"
        fontFamily="var(--font-heading), sans-serif"
        fontSize="14"
        letterSpacing="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        {start.watts}W
      </motion.text>
    </svg>
  );
}
