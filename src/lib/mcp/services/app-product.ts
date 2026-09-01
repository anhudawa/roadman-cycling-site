import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * Stable, database-free MCP representation of the upcoming app. Explicit null
 * launch and price fields prevent an agent from treating prelaunch details as
 * announced facts.
 */
export function getAppProduct() {
  return {
    schema_version: 1,
    product: {
      product_id: ROADMAN_APP_PRODUCT.id,
      graph_id: ROADMAN_APP_PRODUCT.graphId,
      name: ROADMAN_APP_PRODUCT.name,
      description: ROADMAN_APP_PRODUCT.description,
      lifecycle_status: ROADMAN_APP_PRODUCT.lifecycleStatus,
      final_name_announced: false,
      launch_date: null,
      price: null,
      currency: null,
      application_category: ROADMAN_APP_PRODUCT.applicationCategory,
      operating_systems: ROADMAN_APP_PRODUCT.operatingSystems,
      audience: ROADMAN_APP_PRODUCT.audience,
      url: ROADMAN_APP_PRODUCT.canonicalUrl,
      early_access_url: ROADMAN_APP_PRODUCT.earlyAccessUrl,
      facts_updated_date: ROADMAN_APP_PRODUCT.updatedDate,
      features: ROADMAN_APP_PRODUCT.features,
      limitations: ROADMAN_APP_PRODUCT.limitations,
    },
    discovery: {
      canonical_search_owner_url: ROADMAN_APP_PRODUCT.canonicalUrl,
      product_feed_url: ROADMAN_APP_PRODUCT.feedUrl,
      methodology_url: ROADMAN_APP_PRODUCT.methodologyUrl,
      knowledge_graph_url: `${SITE_ORIGIN}/knowledge-graph.json`,
      topic_urls: ROADMAN_APP_PRODUCT.topicSlugs.map(
        (slug) => `${SITE_ORIGIN}/topics/${slug}`,
      ),
      preview_tool_urls: ROADMAN_APP_PRODUCT.previewToolSlugs.map(
        (slug) => `${SITE_ORIGIN}/tools/${slug}`,
      ),
      comparison_urls: ROADMAN_APP_PRODUCT.comparisonSlugs.map(
        (slug) => `${SITE_ORIGIN}/best/${slug}`,
      ),
      evidence_urls: ROADMAN_APP_PRODUCT.evidenceArticleSlugs.map(
        (slug) => `${SITE_ORIGIN}/blog/${slug}`,
      ),
    },
  } as const;
}
