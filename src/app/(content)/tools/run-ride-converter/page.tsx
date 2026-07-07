import { getPostBySlug } from "@/lib/blog";
import { getTopicBySlug } from "@/lib/topics";
import type { ToolNextStepsPost } from "@/components/features/tools/ToolNextSteps";
import RunRideConverterClient from "./RunRideConverterClient";

/**
 * Server wrapper for the client-side converter. The calculator itself is
 * interactive ("use client"), but its post-result reading recommendations
 * come from the fs-backed blog/topics libraries, which can't be bundled
 * into a client component — so the lookups happen here and the resolved
 * post metadata is passed down as props.
 */
function featuredPostsForTopic(topicSlug: string): ToolNextStepsPost[] {
  const topic = getTopicBySlug(topicSlug);
  return (topic?.featuredPostSlugs ?? [])
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
    }));
}

export default function RunRideConverterPage() {
  return (
    <RunRideConverterClient
      runToRidePosts={featuredPostsForTopic("cycling-for-runners")}
      rideToRunPosts={featuredPostsForTopic("running-for-cyclists")}
    />
  );
}
