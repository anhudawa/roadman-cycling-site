#!/usr/bin/env node
// Smoke test: spawns dist/index.js, sends JSON-RPC initialize + tools/list
// over stdio, prints the registered tool names, and exits.
//
// Usage:  node scripts/smoke.mjs
// Returns non-zero on any protocol error or if fewer than 7 tools register.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, "..", "dist", "index.js");

const child = spawn(process.execPath, [entry], {
  stdio: ["pipe", "pipe", "inherit"],
  env: { ...process.env },
});

let buf = "";
const pending = new Map();
let nextId = 1;

child.stdout.on("data", (chunk) => {
  buf += chunk.toString("utf8");
  let nl;
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  }
});

function send(method, params) {
  const id = nextId++;
  const payload = { jsonrpc: "2.0", id, method, params };
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify(payload) + "\n");
  });
}

function notify(method, params) {
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n",
  );
}

const TIMEOUT_MS = 5000;
const timeout = setTimeout(() => {
  console.error(`smoke: timed out after ${TIMEOUT_MS}ms`);
  child.kill("SIGKILL");
  process.exit(2);
}, TIMEOUT_MS);

try {
  const initResult = await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "roadman-mcp-smoke", version: "0.0.0" },
  });
  notify("notifications/initialized");

  const list = await send("tools/list", {});
  const tools = list.tools ?? [];
  const names = tools.map((t) => t.name).sort();

  console.log("server:", initResult.serverInfo?.name, initResult.serverInfo?.version);
  console.log("tools:", names);

  const expected = [
    "fetch_article",
    "fetch_episode",
    "fetch_glossary_term",
    "fetch_guest",
    "fetch_tool_result",
    "fetch_training_plan",
    "search_roadman",
  ];
  const missing = expected.filter((n) => !names.includes(n));
  if (missing.length) {
    console.error("smoke: missing tools:", missing);
    process.exit(1);
  }
  console.log(`smoke: OK — all ${expected.length} tools registered`);
} catch (e) {
  console.error("smoke: failed:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  clearTimeout(timeout);
  child.kill("SIGTERM");
}
