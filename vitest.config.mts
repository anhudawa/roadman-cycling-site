import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Tests cover code under agents/, which is intentionally excluded from
    // the Next.js tsconfig. Resolve the application's @ alias explicitly so
    // those integration tests load the same canonical entity registry as the
    // production extraction scripts.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.next/**', '**/.claude/worktrees/**'],
    // Several API/SEO tests cold-load the entire content corpus (every MDX
    // post, episode, topic, glossary term, guest and tool) on first call —
    // a read that costs tens of seconds. The default pool spins up one worker
    // per core (≈9 here), and each re-transforms that whole graph
    // independently, so they thrash CPU and the cold reads balloon past any
    // sane timeout — and a test that times out mid-flight pollutes the next
    // one's mock state.
    //
    // Capping the worker count bounds that transform contention so the
    // heavy reads stay near their floor (~40s) instead of spiking, while
    // keeping enough parallelism that the suite isn't serialised (a single
    // process bloats over 800+ tests and is dramatically slower). The
    // generous timeout is the safety net on a loaded machine — a ceiling,
    // not a delay, so fast tests are unaffected.
    maxWorkers: 4,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
