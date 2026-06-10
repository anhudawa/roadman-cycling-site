import type { GameResult } from "@/lib/racing-iq/types";

/**
 * Archetype share card — broadcast lower-third meets trading card.
 * Rendered to a 1080×1920 canvas (Instagram story safe) and downloaded
 * as PNG. Brand palette and type only.
 */

const W = 1080;
const H = 1920;

const CHARCOAL = "#252526";
const DEEP_PURPLE = "#210140";
const CORAL = "#F16363";
const PURPLE = "#4C1273";
const OFF_WHITE = "#FAFAFA";

async function ensureFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('700 120px "Bebas Neue"'),
      document.fonts.load('400 120px "Bebas Neue"'),
      document.fonts.load('400 34px "Work Sans"'),
      document.fonts.load('600 34px "Work Sans"'),
    ]);
  } catch {
    // System fallbacks still render a usable card.
  }
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/images/logo-white.png";
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawAxis(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: number,
  y: number
): void {
  const x = 110;
  const barW = W - 220;
  ctx.font = '400 44px "Bebas Neue", sans-serif';
  ctx.fillStyle = OFF_WHITE;
  ctx.textAlign = "left";
  ctx.fillText(label.toUpperCase(), x, y);
  ctx.textAlign = "right";
  ctx.fillStyle = CORAL;
  ctx.fillText(String(value), x + barW, y);
  ctx.textAlign = "left";
  // Track
  ctx.fillStyle = "rgba(250,250,250,0.14)";
  ctx.fillRect(x, y + 22, barW, 14);
  // Fill
  ctx.fillStyle = CORAL;
  ctx.fillRect(x, y + 22, Math.round(barW * (value / 100)), 14);
}

function drawMatches(
  ctx: CanvasRenderingContext2D,
  remaining: number,
  total: number,
  y: number
): void {
  const cx = W / 2;
  const spacing = 64;
  const startX = cx - ((total - 1) * spacing) / 2;
  for (let i = 0; i < total; i++) {
    const x = startX + i * spacing;
    const lit = i < remaining;
    // Stick
    ctx.fillStyle = lit ? "#d9b38c" : "#3a3a3c";
    ctx.fillRect(x - 5, y, 10, 92);
    // Head / ember
    ctx.beginPath();
    ctx.ellipse(x, y - 6, 13, 19, 0, 0, Math.PI * 2);
    ctx.fillStyle = lit ? CORAL : "#4a3134";
    ctx.fill();
    if (lit) {
      ctx.save();
      ctx.shadowColor = "rgba(241,99,99,0.8)";
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.restore();
    }
  }
}

export async function renderShareCard(
  result: GameResult,
  matchesLeft: number
): Promise<HTMLCanvasElement> {
  await ensureFonts();
  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background: deep purple into charcoal, broadcast-dark.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, DEEP_PURPLE);
  bg.addColorStop(0.55, "#1c0a33");
  bg.addColorStop(1, CHARCOAL);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Faint route profile motif across the middle
  ctx.strokeStyle = "rgba(76,18,115,0.55)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-20, 1240);
  const profile = [0.92, 0.88, 0.9, 0.74, 0.78, 0.55, 0.62, 0.3, 0.46, 0.42, 0.14, 0.38, 0.34];
  profile.forEach((p, i) => {
    ctx.lineTo((i / (profile.length - 1)) * (W + 40) - 20, 1100 + p * 260);
  });
  ctx.stroke();

  // Pin-line border (the logo's frame language)
  ctx.strokeStyle = "rgba(250,250,250,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, W - 84, H - 84);

  // Header
  ctx.textAlign = "center";
  ctx.fillStyle = CORAL;
  ctx.font = '400 42px "Bebas Neue", sans-serif';
  ctx.fillText("R A C I N G   I Q", W / 2, 180);
  ctx.fillStyle = "rgba(250,250,250,0.55)";
  ctx.font = '400 30px "Work Sans", sans-serif';
  ctx.fillText("Stage 1 · 120km · Seven decisions", W / 2, 232);

  // Verdict
  ctx.fillStyle = "rgba(250,250,250,0.6)";
  ctx.font = '400 46px "Bebas Neue", sans-serif';
  ctx.fillText("THE VERDICT IS IN — YOU ARE", W / 2, 420);

  ctx.fillStyle = OFF_WHITE;
  ctx.font = '400 128px "Bebas Neue", sans-serif';
  const nameLines = wrapText(ctx, result.archetype.name.toUpperCase(), W - 200);
  let y = 560;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, y);
    y += 130;
  }

  // Coral rule
  ctx.fillStyle = CORAL;
  ctx.fillRect(W / 2 - 90, y - 70, 180, 8);

  // Roast
  ctx.fillStyle = "rgba(250,250,250,0.85)";
  ctx.font = 'italic 400 40px "Work Sans", sans-serif';
  const roastLines = wrapText(ctx, `“${result.archetype.roast}”`, W - 260);
  let ry = y + 20;
  for (const line of roastLines) {
    ctx.fillText(line, W / 2, ry);
    ry += 56;
  }

  // Axes
  const axesTop = Math.max(ry + 90, 1010);
  drawAxis(ctx, "Tactical nous", result.axes.nous, axesTop);
  drawAxis(ctx, "Match management", result.axes.match, axesTop + 130);
  drawAxis(ctx, "Self-knowledge", result.axes.self, axesTop + 260);

  // Matches left
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(250,250,250,0.55)";
  ctx.font = '400 38px "Bebas Neue", sans-serif';
  ctx.fillText("MATCHES LEFT AT THE LINE", W / 2, axesTop + 430);
  drawMatches(ctx, matchesLeft, 5, axesTop + 470);

  // Footer panel
  ctx.fillStyle = PURPLE;
  ctx.fillRect(42, H - 250, W - 84, 208);
  if (logo) {
    const logoW = 300;
    const logoH = (logo.height / logo.width) * logoW;
    ctx.drawImage(logo, W / 2 - logoW / 2, H - 232, logoW, logoH);
  }
  ctx.fillStyle = "rgba(250,250,250,0.85)";
  ctx.font = '600 32px "Work Sans", sans-serif';
  ctx.fillText(
    "What's your Racing IQ?  roadmancycling.com/racing-iq",
    W / 2,
    H - 92
  );

  return canvas;
}

export async function downloadShareCard(
  result: GameResult,
  matchesLeft: number
): Promise<void> {
  const canvas = await renderShareCard(result, matchesLeft);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `racing-iq-${result.archetype.id}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
