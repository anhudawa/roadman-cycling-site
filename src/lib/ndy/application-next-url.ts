const publicOrigin = "https://www.roadmancycling.com";
const actionFragment = /^#(?:join|questions)\/[a-f0-9]{64}$/;

/** Accept only the personal action URL issued by this deployment or production. */
export function safeApplicationNextUrl(value: string | undefined, currentOrigin: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.origin !== currentOrigin && url.origin !== publicOrigin) return null;
    if (url.pathname !== "/apply/next" || url.search || !actionFragment.test(url.hash)) return null;
    return url.href;
  } catch {
    return null;
  }
}
