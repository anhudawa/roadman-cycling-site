/*
 * Roadman Cycling — service worker.
 *
 * Strategy:
 *   /_next/static/**, /images/**, /fonts/**, /og-image.jpg, /icon-*.png,
 *   Google Fonts                                  → cache-first (immutable / stable)
 *   /_next/image**                                → stale-while-revalidate
 *   /api/**, /admin/**, SSE responses             → network-only (never cache)
 *   Navigation requests                           → network-first, fallback to /offline
 *
 * Bump CACHE_VERSION on any breaking change to invalidate every client.
 * Clients can also send { type: "SKIP_WAITING" } to take a new SW live
 * immediately — used by the registration helper after a fresh install.
 */

const CACHE_VERSION = "roadman-pwa-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // addAll is atomic — if any precache URL fails the install fails,
      // which is what we want for the offline fallback.
      await cache.addAll(PRECACHE_URLS);
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Server-Sent Events / Anthropic streams — must always hit the network.
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/event-stream")) return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Only handle http(s) — skip chrome-extension://, data:, etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Never cache cross-origin requests except the Google Fonts allowlist.
  const sameOrigin = url.origin === self.location.origin;
  const isGoogleFont =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isGoogleFont) return;

  // Hard exclusions on the same origin.
  if (sameOrigin) {
    if (url.pathname.startsWith("/api/")) return;
    if (url.pathname.startsWith("/admin/")) return;
  }

  // Cache-first: hashed Next assets, public images, public fonts, brand
  // icons, the og image, and Google Fonts.
  if (
    isGoogleFont ||
    (sameOrigin &&
      (url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname.startsWith("/fonts/") ||
        url.pathname.startsWith("/icon-") ||
        url.pathname === "/og-image.jpg" ||
        url.pathname === "/favicon.ico"))
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Stale-while-revalidate: optimised images.
  if (sameOrigin && url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(req, IMAGE_CACHE));
    return;
  }

  // Navigation requests: network-first with /offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(networkFirstNavigation(req));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok && response.type !== "opaque") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    // Last-resort match — useful for opaque responses that may have been
    // cached previously.
    const fallback = await cache.match(request);
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("You are offline.", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
