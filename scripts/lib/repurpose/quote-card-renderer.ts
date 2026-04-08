import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { type ExtractedQuote, type QuoteCardPaths } from "./types.js";

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  // Try local file first (Work Sans Bold preferred for headings, Regular as fallback)
  const candidates = [
    path.resolve(process.cwd(), "public/fonts/WorkSans-Bold.ttf"),
    path.resolve(process.cwd(), "public/fonts/WorkSans-Regular.ttf"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const buf = fs.readFileSync(candidate);
      fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      return fontCache;
    }
  }

  // Fallback: fetch from Google Fonts
  try {
    const cssUrl =
      "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap";
    const cssRes = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });
    const css = await cssRes.text();

    // Extract a woff2 URL from the CSS
    const woff2Match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (!woff2Match) {
      throw new Error("Could not parse woff2 URL from Google Fonts CSS");
    }

    const fontRes = await fetch(woff2Match[1]);
    fontCache = await fontRes.arrayBuffer();
    return fontCache;
  } catch (err) {
    throw new Error(
      `quote-card-renderer: Failed to load font — ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Card dimension definitions
// ---------------------------------------------------------------------------

interface CardDims {
  width: number;
  height: number;
  quoteFontSize: number;
  speakerFontSize: number;
  contextFontSize: number;
  padding: number;
}

const SQUARE: CardDims = {
  width: 1080,
  height: 1080,
  quoteFontSize: 36,
  speakerFontSize: 24,
  contextFontSize: 18,
  padding: 80,
};

const LANDSCAPE: CardDims = {
  width: 1200,
  height: 675,
  quoteFontSize: 32,
  speakerFontSize: 22,
  contextFontSize: 16,
  padding: 60,
};

// ---------------------------------------------------------------------------
// Element builder (plain JS objects — satori-compatible, NOT JSX)
// ---------------------------------------------------------------------------

function buildCardElement(
  quote: ExtractedQuote,
  episodeNumber: number,
  dims: CardDims
): object {
  const { width, height, quoteFontSize, speakerFontSize, contextFontSize, padding } = dims;
  const innerWidth = width - padding * 2;

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "#252526",
        position: "relative" as const,
        padding: `${padding}px`,
        boxSizing: "border-box" as const,
        justifyContent: "center",
        alignItems: "flex-start",
      },
      children: [
        // Episode badge — top-left
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute" as const,
              top: `${padding}px`,
              left: `${padding}px`,
              backgroundColor: "#F16363",
              color: "#FAFAFA",
              fontSize: `${contextFontSize}px`,
              fontWeight: 700,
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "14px",
              paddingRight: "14px",
              borderRadius: "6px",
              letterSpacing: "1px",
            },
            children: `EP ${episodeNumber}`,
          },
        },

        // Wordmark — bottom-right
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute" as const,
              bottom: `${padding}px`,
              right: `${padding}px`,
              color: "#666666",
              fontSize: `${contextFontSize - 2}px`,
              fontWeight: 700,
              letterSpacing: "3px",
            },
            children: "ROADMAN CYCLING",
          },
        },

        // Quote text
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              color: "#FAFAFA",
              fontSize: `${quoteFontSize}px`,
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: `${innerWidth}px`,
              marginBottom: "24px",
              marginTop: `${contextFontSize + 32}px`, // clear badge
            },
            children: `"${quote.text}"`,
          },
        },

        // Speaker name
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              color: "#F16363",
              fontSize: `${speakerFontSize}px`,
              fontWeight: 700,
              marginBottom: "8px",
              maxWidth: `${innerWidth}px`,
            },
            children: `— ${quote.speaker}`,
          },
        },

        // Context
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              color: "#AAAAAA",
              fontSize: `${contextFontSize}px`,
              fontWeight: 400,
              maxWidth: `${innerWidth}px`,
              lineHeight: 1.4,
            },
            children: quote.context,
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Satori render → PNG buffer
// ---------------------------------------------------------------------------

async function renderCard(
  element: object,
  width: number,
  height: number,
  fontData: ArrayBuffer,
  backgroundImage?: string
): Promise<Buffer> {
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width,
    height,
    fonts: [
      {
        name: "Work Sans",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const rendered = resvg.render();
  const textPng = rendered.asPng();

  if (!backgroundImage || !fs.existsSync(backgroundImage)) {
    // No background — return the text layer directly
    return Buffer.from(textPng);
  }

  // Compose: bg image → dark gradient overlay → coral tint → text layer
  const bg = await sharp(backgroundImage)
    .resize(width, height, { fit: "cover" })
    .toBuffer();

  // Dark gradient overlay (SVG)
  const gradientSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#252526" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#252526" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
  </svg>`;

  const gradientBuf = Buffer.from(gradientSvg);

  // Coral tint overlay (10% opacity)
  const coralSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#F16363" opacity="0.10"/>
  </svg>`;
  const coralBuf = Buffer.from(coralSvg);

  const composed = await sharp(bg)
    .composite([
      { input: gradientBuf, blend: "over" },
      { input: coralBuf, blend: "over" },
      { input: Buffer.from(textPng), blend: "over" },
    ])
    .png()
    .toBuffer();

  return composed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface QuoteCardResult {
  squarePath: string;
  landscapePath: string;
}

export async function renderQuoteCards(
  quotes: ExtractedQuote[],
  episodeNumber: number,
  guestImage: string | undefined,
  outputDir: string
): Promise<QuoteCardPaths[]> {
  const quotesDir = path.join(outputDir, "quotes");
  if (!fs.existsSync(quotesDir)) {
    fs.mkdirSync(quotesDir, { recursive: true });
  }

  const fontData = await loadFont();
  const results: QuoteCardPaths[] = [];

  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i];
    const n = i + 1;

    // Square card
    const squareEl = buildCardElement(quote, episodeNumber, SQUARE);
    const squarePng = await renderCard(
      squareEl,
      SQUARE.width,
      SQUARE.height,
      fontData,
      guestImage
    );
    const squarePath = path.join(quotesDir, `quote-${n}-square.png`);
    fs.writeFileSync(squarePath, squarePng);

    // Landscape card
    const landscapeEl = buildCardElement(quote, episodeNumber, LANDSCAPE);
    const landscapePng = await renderCard(
      landscapeEl,
      LANDSCAPE.width,
      LANDSCAPE.height,
      fontData,
      guestImage
    );
    const landscapePath = path.join(quotesDir, `quote-${n}-landscape.png`);
    fs.writeFileSync(landscapePath, landscapePng);

    results.push({ squarePath, landscapePath });
    console.log(`  quote-card-renderer: wrote quote-${n} (square + landscape)`);
  }

  return results;
}
