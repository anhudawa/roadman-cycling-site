import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-old/**",
    "**/.next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktrees share the project root but have their own source copies.
    ".claude/worktrees/**",
    // Separate application with its own package, TypeScript and lint config.
    "roadman-os/**",
  ]),
]);

export default eslintConfig;
