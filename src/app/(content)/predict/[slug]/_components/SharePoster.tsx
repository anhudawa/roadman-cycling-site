"use client";

import { useRef, useState } from "react";

interface Props {
  courseName: string;
  predictedTimeS: number;
  toleranceMinutes: number;
  distanceKm: number;
  elevationGainM: number;
  averagePowerW: number | null;
  averageSpeedKmh: number;
  shareUrl: string;
}

const W = 1080;
const H = 1080;

/**
 * Shareable square poster for the prediction. Renders an SVG and lets the
 * rider download it as PNG or post via the Web Share API where supported.
 * Mobile-first — the share button uses navigator.share when available.
 */
export function SharePoster({
  courseName,
  predictedTimeS,
  toleranceMinutes,
  distanceKm,
  elevationGainM,
  averagePowerW,
  averageSpeedKmh,
  shareUrl,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState<null | "share" | "download">(null);

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
      const safe = courseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      a.download = `${safe}-prediction.png`;
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
      const text = `${formatDuration(predictedTimeS)} on ${courseName} · predicted by Roadman`;
      // Files share when supported; otherwise fall back to URL share.
      if (
        blob &&
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator
      ) {
        const file = new File([blob], "prediction.png", { type: "image/png" });
        const shareData: ShareData = {
          title: "My race prediction",
          text,
          url: shareUrl,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: "My race prediction",
          text,
          url: shareUrl,
        });
        return;
      }
      const nav = (typeof navigator !== "undefined" ? navigator : null) as
        | (Navigator & { clipboard?: { writeText: (s: string) => Promise<void> } })
        | null;
      if (nav?.clipboard) {
        await nav.clipboard.writeText(`${text}\n${shareUrl}`);
      }
    } catch {
      // user cancelled or permission denied — silent
    } finally {
      setBusy(null);
    }
  }

  const finishStr = formatDuration(predictedTimeS);

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-deep-purple shadow-[var(--shadow-elevated)]">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          aria-label="Shareable prediction poster"
        >
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#210140" />
              <stop offset="60%" stopColor="#2A0150" />
              <stop offset="100%" stopColor="#4C1273" />
            </linearGradient>
            <radialGradient id="glow" cx="0.7" cy="0.25" r="0.7">
              <stop offset="0%" stopColor="#F16363" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F16363" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="strip" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F16363" />
              <stop offset="100%" stopColor="#4C1273" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#bg)" />
          <rect width={W} height={H} fill="url(#glow)" />
          {/* coral accent bars */}
          <rect x="80" y="120" width="120" height="10" fill="#F16363" />
          <text
            x="80"
            y="180"
            fill="#F16363"
            fontFamily="Bebas Neue, system-ui"
            fontSize="34"
            letterSpacing="6"
          >
            ROADMAN · RACE PREDICTOR
          </text>
          <text
            x="80"
            y="285"
            fill="#FAFAFA"
            fontFamily="Bebas Neue, system-ui"
            fontSize="68"
            letterSpacing="2"
          >
            {truncate(courseName.toUpperCase(), 28)}
          </text>
          <text
            x="80"
            y="345"
            fill="rgba(250,250,250,0.6)"
            fontFamily="Work Sans, system-ui"
            fontSize="28"
          >
            {distanceKm.toFixed(0)} km · {elevationGainM} m elevation
          </text>

          {/* finish time */}
          <text
            x="80"
            y="500"
            fill="rgba(241,99,99,1)"
            fontFamily="Bebas Neue, system-ui"
            fontSize="38"
            letterSpacing="8"
          >
            PREDICTED FINISH
          </text>
          <text
            x="80"
            y="700"
            fill="#FAFAFA"
            fontFamily="Bebas Neue, system-ui"
            fontSize="220"
            letterSpacing="-4"
          >
            {finishStr}
          </text>
          <text
            x="80"
            y="755"
            fill="rgba(250,250,250,0.7)"
            fontFamily="Work Sans, system-ui"
            fontSize="32"
          >
            ± {toleranceMinutes} min · {averageSpeedKmh.toFixed(1)} km/h avg
            {averagePowerW ? ` · ${averagePowerW} W` : ""}
          </text>

          {/* gradient bar */}
          <rect x="80" y="850" width="920" height="6" fill="url(#strip)" />

          {/* footer */}
          <text
            x="80"
            y="930"
            fill="#FAFAFA"
            fontFamily="Bebas Neue, system-ui"
            fontSize="42"
            letterSpacing="4"
          >
            CYCLING IS HARD.
          </text>
          <text
            x="80"
            y="975"
            fill="#F16363"
            fontFamily="Bebas Neue, system-ui"
            fontSize="42"
            letterSpacing="4"
          >
            OUR PODCAST WILL HELP.
          </text>
          <text
            x="80"
            y="1030"
            fill="rgba(250,250,250,0.5)"
            fontFamily="Work Sans, system-ui"
            fontSize="22"
          >
            Predict yours · roadmancycling.com/predict
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="bg-coral hover:bg-coral-hover text-off-white font-display tracking-wider uppercase text-sm rounded-md py-3 transition disabled:opacity-50"
        >
          {busy === "share" ? "Preparing…" : "Share"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy !== null}
          className="bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-off-white font-display tracking-wider uppercase text-sm rounded-md py-3 transition disabled:opacity-50"
        >
          {busy === "download" ? "Saving…" : "Download PNG"}
        </button>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
