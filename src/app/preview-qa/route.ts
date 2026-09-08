// A real, narrow browsing context for responsive QA. Never available in production.
export const dynamic = "force-dynamic";

const PAGES = [
  "/coaching", "/blog/best-cycling-coach-uk", "/blog/best-cycling-coach-usa",
  "/blog/dragon-ride-training-guide", "/races/dragon-ride", "/races",
  "/tools/training-load", "/tools/tyre-pressure", "/tools/hr-zones",
  "/answers/what-is-ctl", "/glossary/training-peaks-ctl",
  "/topics/ftp-training", "/event/wicklow-200-training-plan", "/plan/wicklow-200",
  "/blog/best-online-cycling-coach-how-to-choose", "/blog/how-much-does-online-cycling-coach-cost-2026",
  "/watch/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
];

export function GET(request: Request) {
  const headers = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
  if (process.env.VERCEL_ENV !== "preview") return new Response("Not found", { status: 404, headers });
  const query = new URL(request.url).searchParams;
  const path = query.get("path") || PAGES[0];
  const width = Number(query.get("width") || 390);
  if (!PAGES.includes(path) || ![320, 390, 430].includes(width)) return new Response("Invalid QA selection", { status: 400, headers });
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Roadman preview QA</title>
<style>body{margin:12px;background:#eee;color:#111;font:14px system-ui}form{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}iframe{display:block;border:0;background:white}label{display:flex;gap:6px;align-items:center}</style></head><body>
<form method="get"><label>Page <select name="path">${PAGES.map(p => `<option value="${p}"${p === path ? " selected" : ""}>${p}</option>`).join("")}</select></label>
<label>Width <select name="width">${[320, 390, 430].map(w => `<option${w === width ? " selected" : ""}>${w}</option>`).join("")}</select></label><button>Review</button><span>${width} × 844 CSS pixels · preview only</span></form>
<iframe title="Roadman mobile QA" src="${path}" width="${width}" height="844"></iframe></body></html>`, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}
