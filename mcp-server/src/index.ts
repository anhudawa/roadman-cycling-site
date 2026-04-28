#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const PKG_NAME = "@roadman/mcp-server";
const PKG_VERSION = "0.1.0";

const DEFAULT_BASE_URL = "https://roadmancycling.com";
const BASE_URL = (process.env.ROADMAN_BASE_URL ?? DEFAULT_BASE_URL).replace(
  /\/+$/,
  "",
);
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = `${PKG_NAME}/${PKG_VERSION} (+${BASE_URL})`;

async function getJson(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "application/json" },
    });
    const body = await res.text();
    if (!res.ok) {
      throw new Error(
        `Roadman API ${res.status} ${res.statusText} for ${url}: ${body.slice(0, 500)}`,
      );
    }
    try {
      return JSON.parse(body);
    } catch {
      throw new Error(
        `Roadman API returned non-JSON for ${url}: ${body.slice(0, 500)}`,
      );
    }
  } finally {
    clearTimeout(timer);
  }
}

function ok(value: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}

function err(message: string): CallToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

function fail(error: unknown): CallToolResult {
  return err(error instanceof Error ? error.message : String(error));
}

interface FeedDoc<T> {
  generatedAt?: string;
  baseUrl?: string;
  count?: number;
  items?: T[];
}

interface FeedItem {
  id: string;
  title?: string;
  entities?: string[];
}

const server = new McpServer(
  { name: PKG_NAME, version: PKG_VERSION },
  { capabilities: { tools: {} } },
);

server.registerTool(
  "search_roadman",
  {
    title: "Search Roadman Cycling",
    description:
      "Full-text search across Roadman Cycling articles, podcast episodes, topic hubs, and glossary terms. Returns relevance-ranked results with titles, summaries, URLs, and basic metadata. Read-only.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe("Free-text query, e.g. 'ftp plateau' or 'race weight'."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Max results to return (1–100, default 20)."),
      type: z
        .enum(["article", "episode", "topic", "glossary"])
        .optional()
        .describe("Restrict results to a single content type."),
    },
  },
  async ({ query, limit, type }) => {
    try {
      const params = new URLSearchParams({ q: query });
      if (limit !== undefined) params.set("limit", String(limit));
      if (type) params.set("type", type);
      return ok(await getJson(`/api/v1/search?${params.toString()}`));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_article",
  {
    title: "Fetch Roadman article",
    description:
      "Fetch the full body, metadata, citations, and related content for a single Roadman Cycling blog article by slug. Body is delivered as raw markdown. Read-only.",
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          "Article slug, e.g. 'why-your-ftp-is-not-improving'. The trailing path segment of /blog/<slug>.",
        ),
    },
  },
  async ({ slug }) => {
    try {
      const qs = new URLSearchParams({ id: slug, type: "article" });
      return ok(await getJson(`/api/v1/fetch?${qs.toString()}`));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_episode",
  {
    title: "Fetch Roadman podcast episode",
    description:
      "Fetch the metadata for a single Roadman Cycling Podcast episode by slug. Returns the entry from /feeds/episodes.json matching the slug. Body/transcript is omitted from the feed; use search and fetch_article for transcript-backed articles. Read-only.",
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          "Episode slug, the trailing path segment of /podcast/<slug>.",
        ),
    },
  },
  async ({ slug }) => {
    try {
      const feed = (await getJson("/feeds/episodes.json")) as FeedDoc<FeedItem>;
      const item = feed.items?.find((i) => i.id === slug);
      if (!item) return err(`No episode found with slug "${slug}".`);
      return ok({
        baseUrl: feed.baseUrl ?? BASE_URL,
        generatedAt: feed.generatedAt ?? new Date().toISOString(),
        item,
      });
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_guest",
  {
    title: "Fetch Roadman podcast guest",
    description:
      "Fetch the profile metadata for a single podcast guest by slug. Returns the entry from /feeds/guests.json matching the slug, including their episode list. Read-only.",
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          "Guest slug, the trailing path segment of /guests/<slug> (e.g. 'inigo-san-millan').",
        ),
    },
  },
  async ({ slug }) => {
    try {
      const feed = (await getJson("/feeds/guests.json")) as FeedDoc<FeedItem>;
      const item = feed.items?.find((i) => i.id === slug);
      if (!item) return err(`No guest found with slug "${slug}".`);
      return ok({
        baseUrl: feed.baseUrl ?? BASE_URL,
        generatedAt: feed.generatedAt ?? new Date().toISOString(),
        item,
      });
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_glossary_term",
  {
    title: "Fetch Roadman glossary term",
    description:
      "Resolve a cycling-performance abbreviation or term (e.g. 'FTP', 'RED-S', 'lactate threshold') against the Roadman glossary. Match is case-insensitive against slug, title, and related-term aliases. Read-only.",
    inputSchema: {
      term: z
        .string()
        .min(1)
        .describe("Term, abbreviation, or slug to look up. Case-insensitive."),
    },
  },
  async ({ term }) => {
    try {
      const feed = (await getJson("/feeds/glossary.json")) as FeedDoc<
        FeedItem & { definition?: string }
      >;
      const needle = term.trim().toLowerCase();
      const item = feed.items?.find((i) => {
        if (i.id.toLowerCase() === needle) return true;
        if (i.title && i.title.toLowerCase() === needle) return true;
        if (i.entities?.some((e) => e.toLowerCase() === needle)) return true;
        return false;
      });
      if (!item) return err(`No glossary term found matching "${term}".`);
      return ok({
        baseUrl: feed.baseUrl ?? BASE_URL,
        generatedAt: feed.generatedAt ?? new Date().toISOString(),
        item,
      });
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_tool_result",
  {
    title: "Run a Roadman calculator tool",
    description:
      "Run one of the Roadman Cycling on-site calculator tools (e.g. 'ftp-zones', 'race-weight') and return the structured result. Tool names map to URL slugs under /tools/. Inputs are passed through as URL query-string parameters. Read-only.",
    inputSchema: {
      tool_name: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/i, "tool_name must be a URL-safe slug")
        .describe("Tool slug, e.g. 'ftp-zones' or 'race-weight'."),
      params: z
        .record(
          z.string(),
          z.union([z.string(), z.number(), z.boolean()]),
        )
        .optional()
        .describe(
          "Query-string parameters for the tool, as a flat key/value object. Each tool's required params are documented at /tools/<tool_name>.",
        ),
    },
  },
  async ({ tool_name, params }) => {
    try {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params ?? {})) {
        search.set(k, String(v));
      }
      const qs = search.toString();
      const path = `/api/v1/tools/${encodeURIComponent(tool_name)}${qs ? `?${qs}` : ""}`;
      return ok(await getJson(path));
    } catch (e) {
      return fail(e);
    }
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  process.stderr.write(
    `[${PKG_NAME}] fatal: ${e instanceof Error ? e.stack ?? e.message : String(e)}\n`,
  );
  process.exit(1);
});
