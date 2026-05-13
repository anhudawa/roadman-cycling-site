/**
 * Generate the Masters Cycling Training Report 2026 PDF.
 *
 * Reads the canonical MDX at content/blog/masters-cycling-training-report-2026.mdx,
 * renders a branded print template (dark theme, Bebas Neue headers, Work Sans
 * body, coral accents), and writes the result to:
 *
 *   public/downloads/masters-cycling-training-report-2026.pdf
 *
 * This is the file served by the squeeze page's Resend welcome email. Re-run
 * after any substantive edit to the underlying MDX:
 *
 *   npx tsx scripts/generate-masters-report-pdf.ts
 *
 * The lightweight markdown converter below is deliberately bespoke — the
 * report only uses headings, paragraphs, bullet lists, bold/italic, and inline
 * links, plus two custom JSX components (<DownloadCSVButton/>, <CiteBlock/>)
 * which are replaced with paragraph stand-ins. A general-purpose markdown
 * pipeline would carry more weight than the script earns.
 */

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { chromium } from "playwright";

const ROOT = dirname(new URL(import.meta.url).pathname).replace(/\/scripts$/, "");
const MDX_PATH = join(ROOT, "content/blog/masters-cycling-training-report-2026.mdx");
const OUTPUT_PATH = join(
  ROOT,
  "public/downloads/masters-cycling-training-report-2026.pdf",
);

interface ReportFrontmatter {
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  updatedDate?: string;
  answerCapsule: string;
  keyTakeaways: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(md: string): string {
  let s = escapeHtml(md);
  // Bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text* (avoid matching ** which is already gone)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const isInternal = href.startsWith("/");
    const url = isInternal ? `https://roadmancycling.com${href}` : href;
    return `<a href="${url}">${text}</a>`;
  });
  return s;
}

/**
 * Convert the MDX body into print-friendly HTML.
 *
 * Recognises:
 *  - `## heading`  → <h2>
 *  - `### heading` → <h3>
 *  - `- item`      → <ul><li>
 *  - blank line    → paragraph break
 *  - inline links / bold / italic
 *  - `<DownloadCSVButton .../>` and `<CiteBlock .../>` → replaced with a
 *    short callout so the PDF reader isn't staring at raw JSX.
 */
function mdToHtml(md: string): string {
  // Strip MDX component blocks. These are not useful in print.
  const stripped = md
    .replace(/<DownloadCSVButton[^/]*\/>/g, "")
    .replace(/<DownloadCSVButton[\s\S]*?\/>/g, "")
    .replace(/<CiteBlock[\s\S]*?\/>/g, (m) => {
      // Extract title/author/year/url from the JSX and render a clean cite line
      const title = m.match(/title="([^"]+)"/)?.[1] ?? "";
      const author = m.match(/author="([^"]+)"/)?.[1] ?? "";
      const year = m.match(/year="([^"]+)"/)?.[1] ?? "";
      const url = m.match(/url="([^"]+)"/)?.[1] ?? "";
      return `\n> **Cite this report.** ${author} (${year}). _${title}_. ${url}\n`;
    });

  const lines = stripped.split("\n");
  const out: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const joined = paragraph.join(" ").trim();
    if (joined) out.push(`<p>${renderInline(joined)}</p>`);
    paragraph = [];
  };
  const closeListIfOpen = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (/^## /.test(line)) {
      flushParagraph();
      closeListIfOpen();
      const text = line.replace(/^## /, "");
      out.push(`<h2>${renderInline(text)}</h2>`);
      continue;
    }
    if (/^### /.test(line)) {
      flushParagraph();
      closeListIfOpen();
      const text = line.replace(/^### /, "");
      out.push(`<h3>${renderInline(text)}</h3>`);
      continue;
    }
    if (/^- /.test(line)) {
      flushParagraph();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      const text = line.replace(/^- /, "");
      out.push(`<li>${renderInline(text)}</li>`);
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      closeListIfOpen();
      continue;
    }
    if (line.trim() === "---") {
      flushParagraph();
      closeListIfOpen();
      out.push('<hr class="section-divider" />');
      continue;
    }
    // Blockquote (for our cite-this stand-in)
    if (/^> /.test(line)) {
      flushParagraph();
      closeListIfOpen();
      const text = line.replace(/^> /, "");
      out.push(`<blockquote>${renderInline(text)}</blockquote>`);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  closeListIfOpen();

  return out.join("\n");
}

function buildPrintHtml(fm: ReportFrontmatter, body: string): string {
  const today = new Date(fm.updatedDate ?? fm.publishDate).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(fm.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 22mm 16mm;
      background: #252526;
      @bottom-left {
        content: "Roadman Cycling · The Masters Cycling Training Report 2026";
        font-family: "Work Sans", sans-serif;
        font-size: 8pt;
        color: #888888;
      }
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: "Work Sans", sans-serif;
        font-size: 8pt;
        color: #888888;
      }
    }
    @page :first {
      margin: 0;
      @bottom-left { content: ""; }
      @bottom-right { content: ""; }
    }
    @page toc {
      @bottom-left { content: ""; }
      @bottom-right { content: ""; }
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #252526;
      color: #FAFAFA;
      font-family: "Work Sans", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a {
      color: #F16363;
      text-decoration: none;
      border-bottom: 1px solid rgba(241, 99, 99, 0.4);
    }
    strong { color: #FAFAFA; font-weight: 600; }
    em { font-style: italic; color: #E4E4E4; }
    h1, h2, h3, h4 {
      font-family: "Bebas Neue", "Work Sans", sans-serif;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #FAFAFA;
      margin: 0;
    }
    h2 {
      font-size: 24pt;
      line-height: 1.05;
      margin-top: 24pt;
      margin-bottom: 10pt;
      padding-top: 12pt;
      border-top: 1px solid rgba(255,255,255,0.08);
      page-break-before: auto;
      page-break-after: avoid;
    }
    h2:first-of-type { page-break-before: avoid; }
    h3 {
      font-size: 14pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #F16363;
      margin-top: 18pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    p { margin: 0 0 10pt 0; orphans: 3; widows: 3; }
    ul { margin: 0 0 12pt 0; padding-left: 18pt; }
    li { margin-bottom: 5pt; }
    li::marker { color: #F16363; }
    blockquote {
      margin: 14pt 0;
      padding: 10pt 14pt;
      border-left: 3px solid #F16363;
      background: rgba(241, 99, 99, 0.08);
      color: #FAFAFA;
      font-size: 10pt;
    }
    hr.section-divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 18pt 0;
    }

    /* ── Cover page ───────────────────────────────────────── */
    .cover {
      page: cover;
      width: 210mm;
      height: 297mm;
      padding: 30mm 22mm;
      background: radial-gradient(ellipse at 20% 0%, rgba(76, 18, 115, 0.6), transparent 55%),
                  radial-gradient(ellipse at 80% 100%, rgba(33, 1, 64, 0.85), transparent 50%),
                  #252526;
      color: #FAFAFA;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      position: relative;
    }
    .cover::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #F16363 50%, transparent);
    }
    .cover .brand {
      font-family: "Bebas Neue", sans-serif;
      font-size: 12pt;
      letter-spacing: 0.42em;
      color: #FAFAFA;
    }
    .cover .eyebrow {
      font-family: "Bebas Neue", sans-serif;
      letter-spacing: 0.32em;
      font-size: 11pt;
      color: #F16363;
      margin-bottom: 14mm;
    }
    .cover h1 {
      font-family: "Bebas Neue", sans-serif;
      font-size: 72pt;
      line-height: 0.92;
      letter-spacing: 0.005em;
      margin-bottom: 8mm;
    }
    .cover h1 .accent { color: #F16363; display: block; }
    .cover .deck {
      font-family: "Work Sans", sans-serif;
      font-size: 13pt;
      line-height: 1.45;
      color: rgba(250,250,250,0.78);
      max-width: 150mm;
      margin-bottom: 16mm;
    }
    .cover .meta {
      display: flex;
      flex-direction: column;
      gap: 6pt;
      font-family: "Bebas Neue", sans-serif;
      letter-spacing: 0.24em;
      font-size: 10pt;
      color: rgba(250,250,250,0.7);
    }
    .cover .meta strong { color: #F16363; font-weight: 400; }
    .cover .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14pt;
      border-top: 1px solid rgba(255,255,255,0.12);
      padding-top: 14pt;
      margin-top: 10mm;
    }
    .cover .stats .stat {
      font-family: "Bebas Neue", sans-serif;
    }
    .cover .stats .stat .value {
      display: block;
      font-size: 28pt;
      color: #F16363;
      line-height: 1;
    }
    .cover .stats .stat .label {
      display: block;
      font-size: 8.5pt;
      letter-spacing: 0.18em;
      color: rgba(250,250,250,0.65);
      margin-top: 6pt;
      font-family: "Work Sans", sans-serif;
      text-transform: uppercase;
      font-weight: 500;
    }

    /* ── TOC ─────────────────────────────────────────────── */
    .toc {
      page: toc;
      padding: 6mm 0;
      page-break-after: always;
    }
    .toc h2 {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
      font-size: 28pt;
      margin-bottom: 14pt;
    }
    .toc ol {
      list-style: none;
      counter-reset: toc-item;
      padding: 0;
      margin: 0;
    }
    .toc li {
      counter-increment: toc-item;
      display: flex;
      align-items: baseline;
      padding: 7pt 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      font-family: "Work Sans", sans-serif;
    }
    .toc li::before {
      content: counter(toc-item, decimal-leading-zero);
      font-family: "Bebas Neue", sans-serif;
      color: #F16363;
      width: 24pt;
      font-size: 12pt;
      letter-spacing: 0.06em;
    }
    .toc li .title {
      flex: 1;
      color: #FAFAFA;
      font-size: 11pt;
    }

    /* ── Body container ──────────────────────────────────── */
    .body {
      padding: 0;
    }
    .answer-capsule {
      margin: 0 0 18pt 0;
      padding: 14pt 16pt;
      border: 1px solid rgba(241,99,99,0.4);
      border-radius: 6pt;
      background: rgba(241,99,99,0.05);
    }
    .answer-capsule .label {
      font-family: "Bebas Neue", sans-serif;
      letter-spacing: 0.24em;
      font-size: 9pt;
      color: #F16363;
      margin-bottom: 6pt;
    }
    .answer-capsule p {
      margin: 0;
      font-size: 10pt;
      color: #FAFAFA;
    }
    .takeaways {
      margin: 12pt 0 18pt 0;
      padding: 0;
    }
    .takeaways h3 {
      margin-top: 0;
    }
    .takeaways ul { padding-left: 18pt; }
    .takeaways li { color: rgba(250,250,250,0.92); }

    /* ── Closing CTA page ────────────────────────────────── */
    .cta-page {
      page-break-before: always;
      padding-top: 30mm;
      text-align: center;
    }
    .cta-page .eyebrow {
      font-family: "Bebas Neue", sans-serif;
      letter-spacing: 0.32em;
      font-size: 11pt;
      color: #F16363;
    }
    .cta-page h2 {
      border-top: none;
      padding-top: 0;
      font-size: 42pt;
      line-height: 1;
      margin: 12pt 0 14pt 0;
    }
    .cta-page .cta-list {
      max-width: 130mm;
      margin: 0 auto;
      text-align: left;
      list-style: none;
      padding: 0;
    }
    .cta-page .cta-list li {
      padding: 10pt 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .cta-page .cta-list li::before {
      content: "→";
      color: #F16363;
      margin-right: 8pt;
    }
    .cta-page .closing {
      margin-top: 24pt;
      font-family: "Bebas Neue", sans-serif;
      font-size: 18pt;
      letter-spacing: 0.18em;
      color: #FAFAFA;
    }
    .cta-page .closing .accent { color: #F16363; }
  </style>
</head>
<body>

  <!-- ── COVER ───────────────────────────────────────────── -->
  <section class="cover">
    <div>
      <div class="brand">ROADMAN&nbsp;&nbsp;CYCLING</div>
    </div>
    <div>
      <div class="eyebrow">2026 REFERENCE · TRAINING AFTER 40</div>
      <h1>
        THE MASTERS<br/>
        CYCLING<br/>
        TRAINING<br/>
        <span class="accent">REPORT 2026</span>
      </h1>
      <p class="deck">${escapeHtml(fm.excerpt)}</p>
      <div class="meta">
        <div><strong>BY</strong> &nbsp; ${escapeHtml(fm.author).toUpperCase()}</div>
        <div><strong>UPDATED</strong> &nbsp; ${today.toUpperCase()}</div>
        <div><strong>EDITORIAL</strong> &nbsp; ROADMAN CYCLING COACHING TEAM</div>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><span class="value">18</span><span class="label">Sections</span></div>
      <div class="stat"><span class="value">40+</span><span class="label">Peer-reviewed citations</span></div>
      <div class="stat"><span class="value">5</span><span class="label">Named case studies</span></div>
      <div class="stat"><span class="value">12-WK</span><span class="label">Sample block</span></div>
    </div>
  </section>

  <!-- ── TOC ─────────────────────────────────────────────── -->
  <section class="toc">
    <h2>Contents</h2>
    <ol>
      <li><span class="title">The 48-year-old at the back of the Sunday group</span></li>
      <li><span class="title">How we compiled this report</span></li>
      <li><span class="title">What actually declines after 35, 45, and 55</span></li>
      <li><span class="title">What doesn&rsquo;t decline nearly as fast as you think</span></li>
      <li><span class="title">The training distribution question</span></li>
      <li><span class="title">Zone 2 and the volume question</span></li>
      <li><span class="title">Intensity that still works after 40</span></li>
      <li><span class="title">Strength training &mdash; the non-negotiable</span></li>
      <li><span class="title">Recovery architecture</span></li>
      <li><span class="title">Nutrition and body composition</span></li>
      <li><span class="title">Female masters cyclists</span></li>
      <li><span class="title">Planning the season when life is noisy</span></li>
      <li><span class="title">Case studies &mdash; masters who got faster</span></li>
      <li><span class="title">Metrics that matter and metrics that don&rsquo;t</span></li>
      <li><span class="title">Common masters mistakes from 1,400 podcast episodes</span></li>
      <li><span class="title">A 12-week sample block for a 48-year-old masters cyclist</span></li>
      <li><span class="title">What we don&rsquo;t know</span></li>
      <li><span class="title">Further reading</span></li>
      <li><span class="title">Closing &mdash; back to the 48-year-old at the back</span></li>
    </ol>
  </section>

  <!-- ── BODY ────────────────────────────────────────────── -->
  <section class="body">
    <div class="answer-capsule">
      <div class="label">EXECUTIVE SUMMARY</div>
      <p>${escapeHtml(fm.answerCapsule)}</p>
    </div>

    <div class="takeaways">
      <h3>Three things to take into Monday</h3>
      <ul>
        ${fm.keyTakeaways.map((t) => `<li>${renderInline(t)}</li>`).join("\n        ")}
      </ul>
    </div>

    ${body}
  </section>

  <!-- ── Closing CTA ─────────────────────────────────────── -->
  <section class="cta-page">
    <div class="eyebrow">WHERE TO NEXT</div>
    <h2>YOU&rsquo;RE NOT <span style="color:#F16363">DONE YET</span></h2>
    <ul class="cta-list">
      <li><strong>Plateau Diagnostic.</strong> Four-minute audit that returns a specific prescription. <a href="https://roadmancycling.com/go">roadmancycling.com/go</a></li>
      <li><strong>Strength Training programme.</strong> 12-week structure, video on every movement, masters-appropriate dose. <a href="https://roadmancycling.com/strength-training">roadmancycling.com/strength-training</a></li>
      <li><strong>Apply for coaching.</strong> Not Done Yet &mdash; the long-form version of this report, with accountability and 1:1 programming. <a href="https://roadmancycling.com/apply">roadmancycling.com/apply</a></li>
      <li><strong>Ask Roadman.</strong> On-site assistant trained on 1,400+ podcast episodes. <a href="https://roadmancycling.com/ask">roadmancycling.com/ask</a></li>
    </ul>
    <div class="closing">GET <span class="accent">THE WORK</span> DONE.</div>
    <p style="margin-top:18pt;color:rgba(250,250,250,0.55);font-size:9pt;">
      &copy; ${new Date().getFullYear()} Roadman Cycling &middot; Published ${today}<br/>
      Editorial, not peer-reviewed. Cite with attribution. Email corrections to ted@roadmancycling.com.
    </p>
  </section>

</body>
</html>`;
}

async function main() {
  const raw = readFileSync(MDX_PATH, "utf8");
  const { data, content } = matter(raw);
  const fm = data as ReportFrontmatter;

  const html = buildPrintHtml(fm, mdToHtml(content));

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // setContent with a deliberately permissive waitUntil — networkidle hangs
    // when Google Fonts decides to keep the connection open. domcontentloaded
    // + an explicit fonts wait is enough to get Bebas Neue rendered.
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      // @ts-expect-error — `document.fonts` is the FontFaceSet API
      await document.fonts.ready;
    });

    await page.pdf({
      path: OUTPUT_PATH,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(`[masters-report-pdf] Wrote ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[masters-report-pdf] Failed:", err);
  process.exit(1);
});
