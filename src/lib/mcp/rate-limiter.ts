import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (ratelimit) return ratelimit;
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.MCP_RATE_LIMIT_RPM ?? 60),
      "1 m"
    ),
    prefix: "roadman_mcp",
  });
  return ratelimit;
}

export async function checkRateLimit(
  ip: string
): Promise<{ success: boolean; remaining?: number }> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // No Redis configured — allow all (dev mode)
    return { success: true };
  }
  const result = await getRatelimit().limit(ip);
  return { success: result.success, remaining: result.remaining };
}
