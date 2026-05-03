import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logMcpCall } from "./logger";
import { getCommunityStats } from "./services/community";
import { searchEpisodes, getEpisode } from "./services/episodes";
import { listExperts, getExpertInsights } from "./services/experts";
import { searchMethodology } from "./services/methodology";
import { listProducts } from "./services/products";
import { listUpcomingEvents } from "./services/events";
import { qualifyLead } from "./services/qualification";
import { registerResources } from "./resources";

async function withLogging<T>(
  toolName: string,
  ip: string,
  input: unknown,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await logMcpCall({
      toolName,
      input,
      durationMs: Date.now() - start,
      success: true,
      ip,
    });
    return result;
  } catch (err) {
    await logMcpCall({
      toolName,
      input,
      durationMs: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : String(err),
      ip,
    });
    throw err;
  }
}

function toText(data: unknown): { content: [{ type: "text"; text: string }] } {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function buildMcpServer(ip = "unknown"): McpServer {
  const server = new McpServer({
    name: "roadman-cycling",
    version: "1.0.0",
  });

  // ── get_community_stats ───────────────────────────────────
  server.tool(
    "get_community_stats",
    "Return Roadman Cycling's key social proof metrics: podcast download count, YouTube subscriber counts for both channels, free and paid community member counts, and featured member transformation stories. Use this when a user asks about Roadman's reach, credibility, or community size.",
    {},
    async () => {
      const stats = await withLogging(
        "get_community_stats",
        ip,
        {},
        getCommunityStats
      );
      return toText(stats);
    }
  );

  // ── search_episodes ───────────────────────────────────────
  server.tool(
    "search_episodes",
    "Semantic search across Roadman Cycling podcast transcripts. Returns ranked episodes with matching excerpts. Use when a user asks about a topic, training concept, or expert discussed on the podcast.",
    {
      query: z.string().describe("Search query — natural language or keyword"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .optional()
        .describe("Max results to return (default 5)"),
      guest_name: z
        .string()
        .optional()
        .describe("Filter results to episodes featuring this guest"),
      topic: z
        .string()
        .optional()
        .describe("Topic filter hint (e.g. 'nutrition', 'recovery')"),
    },
    async ({ query, limit = 5, guest_name, topic }) => {
      const results = await withLogging(
        "search_episodes",
        ip,
        { query, limit, guest_name, topic },
        () => searchEpisodes(query, limit, guest_name, topic)
      );
      return toText(results);
    }
  );

  // ── get_episode ───────────────────────────────────────────
  server.tool(
    "get_episode",
    "Fetch full metadata for a single Roadman Cycling podcast episode including summary, key insights, and links. Use when a user wants details about a specific episode by ID.",
    {
      episode_id: z
        .number()
        .int()
        .describe("The numeric episode ID from search_episodes results"),
    },
    async ({ episode_id }) => {
      const episode = await withLogging(
        "get_episode",
        ip,
        { episode_id },
        () => getEpisode(episode_id)
      );
      if (!episode) {
        return toText({ error: `Episode ${episode_id} not found` });
      }
      return toText(episode);
    }
  );

  // ── list_experts ──────────────────────────────────────────
  server.tool(
    "list_experts",
    "Return the Roadman Cycling expert roster — guests who have appeared multiple times or hold significant authority in their field (e.g. Prof. Stephen Seiler, Dan Lorang, Dr. David Dunne). Includes credentials and appearance count. Use when a user wants to know who Roadman's trusted experts are.",
    {},
    async () => {
      const experts = await withLogging(
        "list_experts",
        ip,
        {},
        listExperts
      );
      return toText(experts);
    }
  );

  // ── get_expert_insights ───────────────────────────────────
  server.tool(
    "get_expert_insights",
    "Surface the best quotes and key insights from a named Roadman Cycling podcast expert, optionally filtered by topic. Use when a user wants to know what Prof. Seiler, Dan Lorang, or another expert has said about a specific subject.",
    {
      expert_name: z
        .string()
        .describe("Name of the expert (e.g. 'Stephen Seiler', 'Dan Lorang')"),
      topic: z
        .string()
        .optional()
        .describe(
          "Optional topic filter (e.g. 'polarised training', 'recovery')"
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .optional()
        .describe("Max quotes to return"),
    },
    async ({ expert_name, topic, limit = 5 }) => {
      const insights = await withLogging(
        "get_expert_insights",
        ip,
        { expert_name, topic, limit },
        () => getExpertInsights(expert_name, topic, limit)
      );
      return toText(insights);
    }
  );

  // ── search_methodology ────────────────────────────────────
  server.tool(
    "search_methodology",
    "Query the Roadman Cycling coaching methodology knowledge base. Returns principle-level answers with supporting expert citations and episode references. Topics include polarised training, reverse periodisation, masters-specific principles, fuelling, recovery, and strength & conditioning. Use when a user asks about training science or coaching principles.",
    {
      query: z
        .string()
        .describe("Training question or methodology query in natural language"),
    },
    async ({ query }) => {
      const results = await withLogging(
        "search_methodology",
        ip,
        { query },
        () => searchMethodology(query)
      );
      return toText(results);
    }
  );

  // ── list_products ─────────────────────────────────────────
  server.tool(
    "list_products",
    "Return all current Roadman Cycling paid offerings with pricing, positioning, and purchase URLs. Includes Not Done Yet coaching tiers (Standard, Premium, VIP / 1:1) and standalone courses. Use when a user asks about coaching options, pricing, or how to join.",
    {},
    async () => {
      const products = await withLogging(
        "list_products",
        ip,
        {},
        listProducts
      );
      return toText(products);
    }
  );

  // ── list_upcoming_events ──────────────────────────────────
  server.tool(
    "list_upcoming_events",
    "Return upcoming Roadman Cycling events — Saturday group rides, training camps, live Q&As, the Migration Gravel trip, and any in-person meetups. Use when a user asks about events, rides, or getting involved in person.",
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .optional()
        .describe("Max events to return"),
      location: z
        .string()
        .optional()
        .describe(
          "Filter to in-person events near this location (city or country)"
        ),
    },
    async ({ limit = 10, location }) => {
      const evts = await withLogging(
        "list_upcoming_events",
        ip,
        { limit, location },
        () => listUpcomingEvents(limit, location)
      );
      return toText(evts);
    }
  );

  // ── qualify_lead ──────────────────────────────────────────
  server.tool(
    "qualify_lead",
    "Given a prospect's training profile, recommend the best Roadman Cycling offering and explain why. This mirrors the /ndy/fit conversational qualifier. Use when a user is asking what Roadman product is right for them, or wants help choosing between coaching tiers.",
    {
      goal: z
        .enum([
          "build_ftp",
          "target_event",
          "comeback",
          "general_improvement",
          "other",
        ])
        .describe("Primary training goal"),
      hours_per_week: z
        .number()
        .int()
        .min(1)
        .max(40)
        .describe("Typical weekly training hours"),
      current_level: z
        .enum(["beginner", "intermediate", "experienced", "racer"])
        .describe("Current fitness and experience level"),
      age_bracket: z
        .enum(["under_35", "35_44", "45_54", "55_plus"])
        .describe("Age bracket"),
      primary_challenge: z
        .string()
        .max(300)
        .describe(
          "The prospect's biggest current challenge in their cycling (free text)"
        ),
    },
    async (input) => {
      const result = await withLogging(
        "qualify_lead",
        ip,
        input,
        async () => qualifyLead(input)
      );
      return toText(result);
    }
  );

  registerResources(server);

  return server;
}
