/**
 * Returns 410 Gone for ClickFunnels URLs that should be permanently
 * removed from search indexes. Called via next.config.ts rewrites.
 */
export function GET() {
  return new Response("410 Gone $— this page has been permanently removed.", {
    status: 410,
    headers: { "Content-Type": "text/plain" },
  });
}
