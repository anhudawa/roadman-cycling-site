/**
 * Page transition wrapper.
 *
 * Previously this used `framer-motion` to fade and slide each page on
 * route change. Two problems with that approach:
 *
 * 1. Animating any transform property (e.g. `y`) leaves a residual
 *    sub-pixel matrix on the wrapping div, which creates a new
 *    containing block for `position: fixed` descendants. That broke
 *    the header — when the page scrolled, the fixed header scrolled
 *    with the page, taking the home-link logo off-screen and trapping
 *    users on whatever route they were on.
 * 2. The opacity-only fallback occasionally got stuck at the initial
 *    0.3 opacity, leaving the whole page at 30% visibility.
 *
 * The transition was nice-to-have, not load-bearing. Removing it lets
 * the header stay truly fixed and removes a class of intermittent
 * rendering bugs across the site.
 */

export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
