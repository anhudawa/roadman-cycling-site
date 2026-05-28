import {
  getAllExpertTopicPairs,
  getIndexableExpertTopicPairs,
  getExpertsWithTopics,
  getActiveExpertTopics,
  getExpertTopicPage,
  EXPERT_TOPICS,
} from "@/lib/experts";
import { getAllAnswers } from "@/lib/answers";

const pairs = getAllExpertTopicPairs();
const indexable = getIndexableExpertTopicPairs();
const experts = getExpertsWithTopics();
const activeTopics = getActiveExpertTopics();

console.log("EXPERT-TOPIC PAIRS:", pairs.length);
console.log("EXPERTS WITH >=1 TOPIC:", experts.length);
console.log("TOPIC CATALOGUE SIZE:", EXPERT_TOPICS.length);
console.log("ACTIVE TOPICS:", activeTopics.length);
console.log("ANSWER PAGES:", getAllAnswers().length);
console.log("\n--- index split ---");
console.log("INDEXABLE:", indexable.length);
console.log("NOINDEX:", pairs.length - indexable.length);
const indexableKeys = new Set(
  indexable.map((p) => `${p.expertSlug}/${p.topicSlug}`),
);
let editorial = 0;
let viaQuotes = 0;
let viaEpisodesPlusIdeas = 0;
let noindex = 0;
for (const { expertSlug, topicSlug } of pairs) {
  const page = getExpertTopicPage(expertSlug, topicSlug);
  if (!page) continue;
  if (!indexableKeys.has(`${expertSlug}/${topicSlug}`)) {
    noindex++;
    continue;
  }
  if (page.enrichment === "editorial") {
    editorial++;
    continue;
  }
  if (page.quotes.length > 0) {
    viaQuotes++;
    continue;
  }
  viaEpisodesPlusIdeas++;
}
console.log(
  `  editorial: ${editorial}  on-topic-quote: ${viaQuotes}  episode+ideas: ${viaEpisodesPlusIdeas}  noindex: ${noindex}`,
);
console.log("\n--- per-expert topic counts (indexable/total) ---");
for (const e of experts) {
  const total = e.topics.length;
  const idx = e.topics.filter((t) =>
    indexableKeys.has(`${e.slug}/${t.slug}`),
  ).length;
  console.log(
    `${e.slug}\t${idx}/${total}\t${e.topics
      .map((t) =>
        indexableKeys.has(`${e.slug}/${t.slug}`) ? t.slug : `${t.slug}*`,
      )
      .join(",")}`,
  );
}
console.log("\n* = noindex,follow");
