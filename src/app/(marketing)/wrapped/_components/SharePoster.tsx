"use client";

import { useRef, useState } from "react";
import type { CardId } from "@/lib/season-wrapped/cards";
import type { WrappedData } from "@/lib/season-wrapped/types";
import {
  formatHours,
  formatKm,
  formatM,
} from "@/lib/season-wrapped/format";
import { biggestMonth, climbingMetaphor } from "@/lib/season-wrapped/cards";

interface Props {
  cardId: CardId;
  data: WrappedData;
}

const W = 1080;
const H = 1920;

const HEADLINE_F = "Bebas Neue, system-ui, sans-serif";
const BODY_F = "Work Sans, system-ui, sans-serif";

/**
 * Shareable 1080×1920 (Stories format) SVG poster for a Wrapped card.
 *
 * The same component renders all 8 cards by switching the body section
 * on cardId. SVG serialised → canvas → PNG so users can save or post
 * via the Web Share API (no html2canvas dependency).
 */
export function SharePoster({ cardId, data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState<null | "share" | "download" | "copy">(null);
  const [copied, setCopied] = useState(false);
  const firstName = data.rider.firstName ?? "You";
  const year = data.year;

  async function rasterize(): Promise<Blob | null> {
    const svgEl = svgRef.current;
    if (!svgEl) return null;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      img.src = url;
      const loadedImg = await loaded;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#210140";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(loadedImg, 0, 0, W, H);
      return await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), "image/png", 0.95),
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await rasterize();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roadman-wrapped-${data.year}-${cardId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const blob = await rasterize();
      const text = `My ${data.year} on the bike — wrapped by Roadman Cycling.`;
      if (
        blob &&
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator
      ) {
        const file = new File([blob], "wrapped.png", { type: "image/png" });
        const shareData: ShareData = {
          title: "Roadman Season Wrapped",
          text,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title: "Roadman Season Wrapped", text });
        return;
      }
    } catch {
      // user cancelled — ignore
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    setBusy("copy");
    try {
      const blob = await rasterize();
      if (
        blob &&
        typeof navigator !== "undefined" &&
        "clipboard" in navigator &&
        typeof window !== "undefined" &&
        "ClipboardItem" in window
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch {
          // fall through
        }
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `My ${data.year} on the bike — wrapped by Roadman. https://roadmancycling.com/wrapped`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] mx-auto max-w-[280px]">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full h-auto"
          aria-label={`Roadman Season Wrapped poster — ${cardId}`}
        >
          <defs>
            <linearGradient id="wrapped-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#210140" />
              <stop offset="55%" stopColor="#2A0150" />
              <stop offset="100%" stopColor="#4C1273" />
            </linearGradient>
            <radialGradient id="wrapped-glow" cx="0.78" cy="0.18" r="0.65">
              <stop offset="0%" stopColor="#F16363" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F16363" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wrapped-strip" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F16363" />
              <stop offset="100%" stopColor="#4C1273" />
            </linearGradient>
          </defs>

          <rect width={W} height={H} fill="url(#wrapped-bg)" />
          <rect width={W} height={H} fill="url(#wrapped-glow)" />

          <rect x={80} y={120} width={120} height={10} fill="#F16363" />
          <text
            x={80}
            y={185}
            fill="#F16363"
            fontFamily={HEADLINE_F}
            fontSize={36}
            letterSpacing={6}
          >
            ROADMAN · SEASON {year} WRAPPED
          </text>

          <g transform="translate(80, 280)">
            {posterBody(cardId, data, firstName)}
          </g>

          <rect x={80} y={1620} width={920} height={6} fill="url(#wrapped-strip)" />
          <text
            x={80}
            y={1720}
            fill="#FAFAFA"
            fontFamily={HEADLINE_F}
            fontSize={56}
            letterSpacing={4}
          >
            NOT DONE YET.
          </text>
          <text
            x={80}
            y={1790}
            fill="rgba(250,250,250,0.6)"
            fontFamily={BODY_F}
            fontSize={26}
          >
            Get yours · roadmancycling.com/wrapped
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <PosterButton
          onClick={handleShare}
          disabled={busy !== null}
          loading={busy === "share"}
          variant="primary"
        >
          Share to Stories
        </PosterButton>
        <PosterButton
          onClick={handleCopy}
          disabled={busy !== null}
          loading={busy === "copy"}
          variant="ghost"
        >
          {copied ? "Copied" : "Copy"}
        </PosterButton>
        <PosterButton
          onClick={handleDownload}
          disabled={busy !== null}
          loading={busy === "download"}
          variant="ghost"
        >
          Download
        </PosterButton>
      </div>
    </div>
  );
}

function PosterButton({
  children,
  onClick,
  disabled,
  loading,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: "primary" | "ghost";
}) {
  const base =
    "rounded-md py-2.5 px-3 text-[11px] font-display uppercase tracking-[0.18em] transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-coral text-charcoal hover:bg-coral-hover"
      : "bg-white/[0.06] text-off-white border border-white/10 hover:bg-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {loading ? "…" : children}
    </button>
  );
}

function posterBody(cardId: CardId, data: WrappedData, firstName: string) {
  switch (cardId) {
    case "year_total":
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            {firstName.toUpperCase()}'S YEAR ON THE BIKE
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={300} letterSpacing={-6}>
            {formatKm(data.totals.distanceM)}
          </text>
          <text y={340} fill="#F16363" fontFamily={HEADLINE_F} fontSize={56} letterSpacing={6}>
            KILOMETRES
          </text>
          <text y={500} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={32}>
            {data.totals.rides} rides · {formatHours(data.totals.timeS)} hours.
          </text>
        </>
      );
    case "climbing": {
      const c = climbingMetaphor(data.totals.elevationM);
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            CLIMBING MACHINE
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={260} letterSpacing={-4}>
            {c.headline}
          </text>
          <text y={360} fill="#F16363" fontFamily={HEADLINE_F} fontSize={48} letterSpacing={4}>
            {formatM(data.totals.elevationM)} m UP
          </text>
          <foreignObject x={0} y={420} width={920} height={400}>
            <div
              style={{
                color: "rgba(250,250,250,0.85)",
                fontFamily: BODY_F,
                fontSize: 30,
                lineHeight: 1.4,
              }}
            >
              {c.detail}
            </div>
          </foreignObject>
        </>
      );
    }
    case "biggest_month": {
      const top = biggestMonth(data);
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            YOUR BIGGEST MONTH
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={220} letterSpacing={-2}>
            {top.monthName.toUpperCase()}
          </text>
          <text y={360} fill="#F16363" fontFamily={HEADLINE_F} fontSize={56} letterSpacing={4}>
            {top.distanceKm.toLocaleString("en-GB")} km · {top.elevationM.toLocaleString("en-GB")} m
          </text>
          <text y={490} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={30}>
            {top.blurb}
          </text>
          <PosterMonthBars data={data} y={620} />
        </>
      );
    }
    case "long_one": {
      const km = formatKm(data.longestRide.distanceM);
      const elev = formatM(data.longestRide.elevationM);
      const name = data.longestRide.name;
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            THE LONG ONE
          </text>
          <text
            y={260}
            fill="#FAFAFA"
            fontFamily={HEADLINE_F}
            fontSize={name ? 160 : 240}
            letterSpacing={-4}
          >
            {name ? name.toUpperCase() : `${km} KM`}
          </text>
          {name ? (
            <text y={350} fill="#F16363" fontFamily={HEADLINE_F} fontSize={64} letterSpacing={4}>
              {km} km · {elev} m
            </text>
          ) : (
            <text y={360} fill="#F16363" fontFamily={HEADLINE_F} fontSize={56} letterSpacing={4}>
              {elev} m elevation
            </text>
          )}
          <text y={500} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={30}>
            One day. One ride. The story you'll tell next.
          </text>
        </>
      );
    }
    case "power_story": {
      const start = data.ftp.start.watts;
      const end = data.ftp.end.watts;
      const delta = end - start;
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            POWER STORY
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={300} letterSpacing={-4}>
            {delta >= 0 ? "+" : ""}
            {delta}W
          </text>
          <text y={350} fill="#F16363" fontFamily={HEADLINE_F} fontSize={56} letterSpacing={4}>
            {start}W → {end}W
          </text>
          <text y={490} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={30}>
            FTP gain across the season.
          </text>
        </>
      );
    }
    case "personality":
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            RIDING PERSONALITY
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={220} letterSpacing={-2}>
            {data.personality.archetype === "all_rounder"
              ? "ALL-ROUNDER"
              : data.personality.archetype.toUpperCase()}
          </text>
          <text y={360} fill="#F16363" fontFamily={HEADLINE_F} fontSize={48} letterSpacing={4}>
            SPIRIT RIDER · {data.personality.spiritRider.toUpperCase()}
          </text>
          <foreignObject x={0} y={420} width={920} height={520}>
            <div
              style={{
                color: "rgba(250,250,250,0.85)",
                fontFamily: BODY_F,
                fontSize: 30,
                lineHeight: 1.45,
              }}
            >
              {data.personality.body}
            </div>
          </foreignObject>
        </>
      );
    case "streak":
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            YOUR STREAK
          </text>
          <text y={260} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={300} letterSpacing={-4}>
            {data.streak.longestWeeksUnbroken}
          </text>
          <text y={350} fill="#F16363" fontFamily={HEADLINE_F} fontSize={56} letterSpacing={4}>
            WEEKS UNBROKEN
          </text>
          <text y={490} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={30}>
            {data.streak.daysRidden} days on the bike across the year.
          </text>
        </>
      );
    case "not_done_yet":
      return (
        <>
          <text fill="rgba(250,250,250,0.7)" fontFamily={HEADLINE_F} fontSize={42} letterSpacing={3}>
            {data.year + 1} IS LOADING
          </text>
          <text y={280} fill="#FAFAFA" fontFamily={HEADLINE_F} fontSize={210} letterSpacing={-3}>
            NOT DONE
          </text>
          <text y={460} fill="#F16363" fontFamily={HEADLINE_F} fontSize={210} letterSpacing={-3}>
            YET.
          </text>
          <text y={620} fill="rgba(250,250,250,0.85)" fontFamily={BODY_F} fontSize={30}>
            Last year was the warm-up. Next year is the work.
          </text>
        </>
      );
  }
}

function PosterMonthBars({ data, y }: { data: WrappedData; y: number }) {
  const max = Math.max(1, ...data.monthly.map((m) => m.distanceM));
  const top = [...data.monthly].sort((a, b) => b.distanceM - a.distanceM)[0]?.month;
  const barW = 60;
  const gap = 14;
  const totalWidth = data.monthly.length * barW + (data.monthly.length - 1) * gap;
  const startX = (920 - totalWidth) / 2;
  const maxH = 360;
  const labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return (
    <g transform={`translate(0, ${y})`}>
      {data.monthly.map((m, i) => {
        const h = (m.distanceM / max) * maxH;
        const xPos = startX + i * (barW + gap);
        const isTop = m.month === top;
        return (
          <g key={m.month}>
            <rect
              x={xPos}
              y={maxH - h}
              width={barW}
              height={h}
              fill={isTop ? "#F16363" : "rgba(255,255,255,0.18)"}
              rx={6}
            />
            <text
              x={xPos + barW / 2}
              y={maxH + 36}
              fill={isTop ? "#F16363" : "rgba(255,255,255,0.5)"}
              fontFamily={HEADLINE_F}
              fontSize={22}
              letterSpacing={2}
              textAnchor="middle"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
}
