import { getAllPosts } from "@/lib/blog";
import { toBlogSearchItem } from "@/lib/blog-search";

export const dynamic = "force-static";
export function GET() {
  return Response.json({ posts: getAllPosts().map(toBlogSearchItem) }, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Robots-Tag": "noindex" },
  });
}
