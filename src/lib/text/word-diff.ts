export type DiffToken = { token: string; kind: "kept" | "removed" | "added" };

/**
 * Word-level LCS diff. Splits both strings on whitespace (keeping separators
 * as tokens) and returns an interleaved sequence marking each token as
 * kept / removed / added. Suitable for short posts (Ted drafts cap at ~120
 * words); O(n*m) in token counts.
 */
export function wordDiff(before: string, after: string): DiffToken[] {
  const beforeTokens = before.split(/(\s+)/);
  const afterTokens = after.split(/(\s+)/);

  const n = beforeTokens.length;
  const m = afterTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        beforeTokens[i - 1] === afterTokens[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const out: DiffToken[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (beforeTokens[i - 1] === afterTokens[j - 1]) {
      out.unshift({ token: beforeTokens[i - 1], kind: "kept" });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.unshift({ token: beforeTokens[i - 1], kind: "removed" });
      i--;
    } else {
      out.unshift({ token: afterTokens[j - 1], kind: "added" });
      j--;
    }
  }
  while (i > 0) {
    out.unshift({ token: beforeTokens[i - 1], kind: "removed" });
    i--;
  }
  while (j > 0) {
    out.unshift({ token: afterTokens[j - 1], kind: "added" });
    j--;
  }
  return out;
}
