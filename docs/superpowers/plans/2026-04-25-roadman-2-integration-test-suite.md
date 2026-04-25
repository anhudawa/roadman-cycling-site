# Roadman 2.0 Integration Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add integration tests for every new Roadman 2.0 API route, following the exact patterns established in `src/app/api/diagnostic/submit/route.test.ts`.

**Architecture:** Each test file mocks all external collaborators (DB, Anthropic, Stripe, Resend, Voyage) using `vi.hoisted()` + `vi.mock()`, tests the orchestration layer via HTTP `Request`/`Response`, and uses dynamic `import()` inside each `it()` to avoid module-cache poisoning between tests.

**Tech Stack:** Vitest 4.1.3, Node test environment (`environment: 'node'` in vitest.config.mts), TypeScript path aliases (`@/…`).

---

## Reference: canonical test pattern

Before writing any test, internalize `src/app/api/diagnostic/submit/route.test.ts`:

```typescript
// 1. Hoist ALL mock fns so vi.mock factories can close over them
const mocks = vi.hoisted(() => ({
  someFn: vi.fn(),
}));

// 2. Mock every collaborator module
vi.mock("@/lib/some-module", () => ({ someFn: mocks.someFn }));

// 3. Valid request body constant
const VALID_BODY = { ... };

// 4. Request factory helper
function req(body: unknown): Request {
  return new Request("https://example.test/api/...", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// 5. describe + beforeEach reset + afterEach restoreAllMocks
describe("POST /api/...", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.someFn.mockResolvedValue({ /* success defaults */ });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  // 6. Dynamic import INSIDE each test
  it("happy path returns 200", async () => {
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);
  });
});
```

---

## File Structure

**Created:**
- `src/app/api/ask/route.test.ts`
- `src/app/api/ask/session/route.test.ts`
- `src/app/api/diagnostic/[slug]/route.test.ts`
- `src/app/api/diagnostic/[slug]/regenerate/route.test.ts`
- `src/app/api/tools/report/route.test.ts`
- `src/app/api/reports/checkout/route.test.ts`
- `src/app/api/reports/download/[token]/route.test.ts`
- `src/app/api/webhooks/stripe/route.test.ts`
- `src/app/api/mcp/route.test.ts`
- `src/app/api/admin/stats/route.test.ts`
- `src/app/api/admin/diagnostic/export/route.test.ts`
- `src/app/robots.test.ts`
- `src/components/seo/JsonLd.test.tsx`
- `src/app/llms.txt/route.test.ts`

---

## Task 1: Ask Roadman — POST /api/ask

**Files:**
- Create: `src/app/api/ask/route.test.ts`
- Reference: `src/app/api/ask/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/ask/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkAskRateLimit: vi.fn(),
  getOrCreateAnonSessionKey: vi.fn(),
  loadSession: vi.fn(),
  loadSessionByAnonKey: vi.fn(),
  loadSessionByRiderProfile: vi.fn(),
  createSession: vi.fn(),
  touchSession: vi.fn(),
  streamAnswer: vi.fn(),
  createSseStream: vi.fn(),
}));

vi.mock("@/lib/ask/rate-limit", () => ({
  checkAskRateLimit: mocks.checkAskRateLimit,
}));
vi.mock("@/lib/rider-profile/anon-session", () => ({
  getOrCreateAnonSessionKey: mocks.getOrCreateAnonSessionKey,
}));
vi.mock("@/lib/ask/store", () => ({
  loadSession: mocks.loadSession,
  loadSessionByAnonKey: mocks.loadSessionByAnonKey,
  loadSessionByRiderProfile: mocks.loadSessionByRiderProfile,
  createSession: mocks.createSession,
  touchSession: mocks.touchSession,
}));
vi.mock("@/lib/ask/orchestrator", () => ({
  streamAnswer: mocks.streamAnswer,
}));
vi.mock("@/lib/ask/stream", () => ({
  createSseStream: mocks.createSseStream,
  sseFormat: vi.fn(),
}));

const SESSION = {
  id: "11111111-1111-1111-1111-111111111111",
  riderProfileId: null,
  anonSessionKey: "anon_abc",
  ipHash: "deadbeef12345678",
  userAgent: null,
  startedAt: new Date(),
  lastActivityAt: new Date(),
  messageCount: 0,
};

// Minimal SSE stream mock — enqueued events can be inspected via enqueueCapture
let enqueueCapture: unknown[] = [];
const mockCtrl = {
  enqueue: vi.fn((event: unknown) => { enqueueCapture.push(event); }),
  close: vi.fn(),
};

const VALID_BODY = { query: "How do I break through a plateau?" };

function req(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://example.test/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("GET /api/ask", () => {
  it("returns 405 with hint to use POST", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(405);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.error).toMatch(/POST/i);
  });
});

describe("POST /api/ask", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    enqueueCapture = [];

    mocks.checkAskRateLimit.mockResolvedValue({ success: true });
    mocks.getOrCreateAnonSessionKey.mockResolvedValue("anon_abc");
    mocks.loadSession.mockResolvedValue(null);
    mocks.loadSessionByAnonKey.mockResolvedValue(null);
    mocks.loadSessionByRiderProfile.mockResolvedValue(null);
    mocks.createSession.mockResolvedValue(SESSION);
    mocks.touchSession.mockResolvedValue(undefined);
    mocks.streamAnswer.mockResolvedValue(undefined);

    // createSseStream returns a { response, controller } where controller
    // is a Promise that resolves to an object with enqueue/close
    const readable = new ReadableStream();
    mocks.createSseStream.mockReturnValue({
      response: new Response(readable, {
        headers: { "content-type": "text/event-stream" },
      }),
      controller: Promise.resolve(mockCtrl),
    });
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("rejects non-JSON body with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req("not json"));
    expect(res.status).toBe(400);
    const data = (await res.json()) as Record<string, unknown>;
    expect((data.error as Record<string, unknown>).code).toBe("invalid_json");
  });

  it("rejects a query that is too short with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ query: "X" }));
    expect(res.status).toBe(400);
    expect(mocks.checkAskRateLimit).not.toHaveBeenCalled();
  });

  it("rejects a query exceeding 2000 chars with 400", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ query: "A".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it("rejects with 429 when rate limit is exceeded", async () => {
    mocks.checkAskRateLimit.mockResolvedValue({
      success: false,
      retryAfterSeconds: 60,
    });
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(429);
    const data = (await res.json()) as Record<string, unknown>;
    expect((data.error as Record<string, unknown>).code).toBe("rate_limited");
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("creates a new session when none exists and returns streaming response", async () => {
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        anonSessionKey: "anon_abc",
        riderProfileId: null,
      }),
    );
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });

  it("loads existing session by sessionId when provided", async () => {
    mocks.loadSession.mockResolvedValue(SESSION);
    const { POST } = await import("./route");
    await POST(
      req({ ...VALID_BODY, sessionId: "11111111-1111-1111-1111-111111111111" }),
    );
    expect(mocks.loadSession).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
    );
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.touchSession).toHaveBeenCalledWith(SESSION.id);
  });

  it("falls back to anonKey session when no sessionId provided", async () => {
    mocks.loadSessionByAnonKey.mockResolvedValue(SESSION);
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    expect(mocks.loadSessionByAnonKey).toHaveBeenCalledWith("anon_abc");
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("sends session_ack meta event immediately", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    // The first enqueued event must be the session acknowledgement
    expect(mockCtrl.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: "meta" }),
    );
    const ackEvent = enqueueCapture.find(
      (e) =>
        (e as Record<string, unknown>).type === "meta" &&
        ((e as Record<string, unknown>).data as Record<string, unknown>)
          ?.kind === "session_ack",
    );
    expect(ackEvent).toBeTruthy();
  });

  it("returns 500 when createSession throws", async () => {
    mocks.createSession.mockRejectedValue(new Error("db down"));
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(500);
    const data = (await res.json()) as Record<string, unknown>;
    expect(
      (data.error as Record<string, unknown>).code,
    ).toBe("session_failed");
  });

  it("uses profile tier rate limit when riderProfileId is provided", async () => {
    const { POST } = await import("./route");
    await POST(req({ ...VALID_BODY, riderProfileId: 42 }));
    expect(mocks.checkAskRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "profile", sessionKey: "profile:42" }),
    );
  });

  it("uses anon tier rate limit when no riderProfileId", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    expect(mocks.checkAskRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "anon" }),
    );
  });

  it("passes seed to streamAnswer when provided", async () => {
    const { POST } = await import("./route");
    await POST(
      req({
        ...VALID_BODY,
        seed: { tool: "ftp-zones", slug: "my-ftp-result" },
      }),
    );
    expect(mocks.streamAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        seed: { tool: "ftp-zones", slug: "my-ftp-result" },
      }),
      expect.anything(),
    );
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npm run test:run -- src/app/api/ask/route.test.ts
```
Expected: all pass (or identify issues with mock shapes that need fixing).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ask/route.test.ts
git commit -m "test: integration tests for POST /api/ask chat endpoint"
```

---

## Task 2: Ask Session — GET /api/ask/session

**Files:**
- Create: `src/app/api/ask/session/route.test.ts`
- Reference: `src/app/api/ask/session/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/ask/session/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadSession: vi.fn(),
  loadSessionByAnonKey: vi.fn(),
  listSessionMessages: vi.fn(),
  readAnonSessionKey: vi.fn(),
  loadProfileById: vi.fn(),
}));

vi.mock("@/lib/ask/store", () => ({
  loadSession: mocks.loadSession,
  loadSessionByAnonKey: mocks.loadSessionByAnonKey,
  listSessionMessages: mocks.listSessionMessages,
}));
vi.mock("@/lib/rider-profile/anon-session", () => ({
  readAnonSessionKey: mocks.readAnonSessionKey,
}));
vi.mock("@/lib/rider-profile/store", () => ({
  loadById: mocks.loadProfileById,
}));

const SESSION = {
  id: "sess-uuid-1234",
  riderProfileId: null,
  startedAt: new Date("2026-04-01T10:00:00Z"),
  lastActivityAt: new Date("2026-04-01T10:05:00Z"),
  messageCount: 3,
};

const MESSAGES = [
  {
    id: 1,
    role: "user",
    content: "How do I train for a century?",
    citations: null,
    ctaRecommended: null,
    safetyFlags: null,
    createdAt: new Date("2026-04-01T10:00:00Z"),
  },
];

function req(sessionId?: string): Request {
  const url = sessionId
    ? `https://example.test/api/ask/session?sessionId=${sessionId}`
    : "https://example.test/api/ask/session";
  return new Request(url, { method: "GET" });
}

describe("GET /api/ask/session", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.loadSession.mockResolvedValue(SESSION);
    mocks.loadSessionByAnonKey.mockResolvedValue(SESSION);
    mocks.listSessionMessages.mockResolvedValue(MESSAGES);
    mocks.readAnonSessionKey.mockResolvedValue("anon_abc");
    mocks.loadProfileById.mockResolvedValue(null);
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns session + messages when valid sessionId provided", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("sess-uuid-1234"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect((data.session as Record<string, unknown>).id).toBe("sess-uuid-1234");
    expect(data.messages).toHaveLength(1);
  });

  it("loads session by anonKey when no sessionId is provided", async () => {
    const { GET } = await import("./route");
    const res = await GET(req());
    expect(mocks.readAnonSessionKey).toHaveBeenCalled();
    expect(mocks.loadSessionByAnonKey).toHaveBeenCalledWith("anon_abc");
    expect(res.status).toBe(200);
  });

  it("returns null session when no session exists", async () => {
    mocks.loadSessionByAnonKey.mockResolvedValue(null);
    mocks.readAnonSessionKey.mockResolvedValue("anon_abc");
    const { GET } = await import("./route");
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.session).toBeNull();
    expect(data.messages).toEqual([]);
  });

  it("returns null session when no anonKey cookie exists", async () => {
    mocks.readAnonSessionKey.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(req());
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.session).toBeNull();
  });

  it("returns profile when session has riderProfileId", async () => {
    const withProfile = { ...SESSION, riderProfileId: 99 };
    mocks.loadSession.mockResolvedValue(withProfile);
    mocks.loadProfileById.mockResolvedValue({
      id: 99,
      firstName: "Alice",
      ageRange: "45-54",
      discipline: "road",
      mainGoal: "improve_ftp",
      coachingInterest: "yes",
    });
    const { GET } = await import("./route");
    const res = await GET(req("sess-uuid-1234"));
    const data = (await res.json()) as Record<string, unknown>;
    expect((data.profile as Record<string, unknown>).firstName).toBe("Alice");
  });

  it("returns 500 on unexpected error", async () => {
    mocks.loadSession.mockRejectedValue(new Error("db timeout"));
    const { GET } = await import("./route");
    const res = await GET(req("sess-uuid-1234"));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/ask/session/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ask/session/route.test.ts
git commit -m "test: integration tests for GET /api/ask/session"
```

---

## Task 3: Diagnostic Read — GET /api/diagnostic/[slug]

**Files:**
- Create: `src/app/api/diagnostic/[slug]/route.test.ts`
- Reference: `src/app/api/diagnostic/[slug]/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/diagnostic/[slug]/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSubmissionBySlug: vi.fn(),
  maskEmail: vi.fn(),
}));

vi.mock("@/lib/diagnostic/store", () => ({
  getSubmissionBySlug: mocks.getSubmissionBySlug,
}));
vi.mock("@/lib/admin/events-store", () => ({
  maskEmail: mocks.maskEmail,
}));

const STORED = {
  slug: "test1234ab",
  primaryProfile: "underRecovered",
  secondaryProfile: null,
  severeMultiSystem: false,
  closeToBreakthrough: false,
  breakdown: { headline: "You are tired", diagnosis: "Under-recovery" },
  email: "cyclist@example.com",
  createdAt: new Date("2026-01-15T10:00:00Z"),
};

function req(slug: string): Request {
  return new Request(`https://example.test/api/diagnostic/${slug}`);
}

function params(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/diagnostic/[slug]", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.getSubmissionBySlug.mockResolvedValue(STORED);
    mocks.maskEmail.mockReturnValue("cy***@example.com");
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns 200 with render-safe fields for a valid slug", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("test1234ab"), params("test1234ab"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.slug).toBe("test1234ab");
    expect(data.primaryProfile).toBe("underRecovered");
    expect(data.emailHint).toBe("cy***@example.com");
    expect(data.createdAt).toBe("2026-01-15T10:00:00.000Z");
    expect(data.breakdown).toBeTruthy();
  });

  it("never exposes the raw email address", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("test1234ab"), params("test1234ab"));
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.email).toBeUndefined();
  });

  it("returns 404 for an unknown slug", async () => {
    mocks.getSubmissionBySlug.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(req("unknown"), params("unknown"));
    expect(res.status).toBe(404);
  });

  it("returns 404 without hitting DB when slug exceeds 32 chars", async () => {
    const longSlug = "a".repeat(33);
    const { GET } = await import("./route");
    const res = await GET(req(longSlug), params(longSlug));
    expect(res.status).toBe(404);
    expect(mocks.getSubmissionBySlug).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- "src/app/api/diagnostic/\[slug\]/route.test.ts"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/diagnostic/[slug]/route.test.ts"
git commit -m "test: integration tests for GET /api/diagnostic/[slug]"
```

---

## Task 4: Diagnostic Regenerate — POST /api/diagnostic/[slug]/regenerate

**Files:**
- Create: `src/app/api/diagnostic/[slug]/regenerate/route.test.ts`
- Reference: `src/app/api/diagnostic/[slug]/regenerate/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/diagnostic/[slug]/regenerate/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getSubmissionBySlug: vi.fn(),
  replaceBreakdown: vi.fn(),
  generateBreakdown: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/diagnostic/store", () => ({
  getSubmissionBySlug: mocks.getSubmissionBySlug,
  replaceBreakdown: mocks.replaceBreakdown,
}));
vi.mock("@/lib/diagnostic/generator", () => ({
  generateBreakdown: mocks.generateBreakdown,
}));

const STORED = {
  slug: "test1234ab",
  primaryProfile: "underRecovered",
  secondaryProfile: null,
  answers: { Q1: 3, Q2: 2, Q3: 3 },
};

const GENERATION = {
  breakdown: { headline: "Updated headline" },
  source: "llm",
  rawModelOutput: null,
  validation: null,
  attempts: 1,
  errors: [],
};

function req(slug: string): Request {
  return new Request(
    `https://example.test/api/diagnostic/${slug}/regenerate`,
    { method: "POST" },
  );
}

function params(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("POST /api/diagnostic/[slug]/regenerate", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.requireAuth.mockResolvedValue(undefined);
    mocks.getSubmissionBySlug.mockResolvedValue(STORED);
    mocks.generateBreakdown.mockResolvedValue(GENERATION);
    mocks.replaceBreakdown.mockResolvedValue({ slug: "test1234ab" });
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns 200 with generation metadata on happy path", async () => {
    const { POST } = await import("./route");
    const res = await POST(req("test1234ab"), params("test1234ab"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.success).toBe(true);
    expect(data.source).toBe("llm");
    expect(data.attempts).toBe(1);
  });

  it("calls requireAuth before touching the DB", async () => {
    const { POST } = await import("./route");
    await POST(req("test1234ab"), params("test1234ab"));
    expect(mocks.requireAuth.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.getSubmissionBySlug.mock.invocationCallOrder[0],
    );
  });

  it("returns 404 for an unknown slug", async () => {
    mocks.getSubmissionBySlug.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(req("unknown"), params("unknown"));
    expect(res.status).toBe(404);
    expect(mocks.generateBreakdown).not.toHaveBeenCalled();
  });

  it("passes profile + answers to generateBreakdown", async () => {
    const { POST } = await import("./route");
    await POST(req("test1234ab"), params("test1234ab"));
    expect(mocks.generateBreakdown).toHaveBeenCalledWith(
      "underRecovered",
      null,
      STORED.answers,
    );
  });

  it("returns 500 when replaceBreakdown returns null", async () => {
    mocks.replaceBreakdown.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(req("test1234ab"), params("test1234ab"));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- "src/app/api/diagnostic/\[slug\]/regenerate/route.test.ts"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/diagnostic/[slug]/regenerate/route.test.ts"
git commit -m "test: integration tests for POST /api/diagnostic/[slug]/regenerate"
```

---

## Task 5: Tool Calculator Reports — POST /api/tools/report

**Files:**
- Create: `src/app/api/tools/report/route.test.ts`
- Reference: `src/app/api/tools/report/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/tools/report/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateToolReport: vi.fn(),
  subscribeToBeehiiv: vi.fn(),
  upsertContact: vi.fn(),
  addActivity: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@/lib/tools/reports", () => ({
  generateToolReport: mocks.generateToolReport,
}));
vi.mock("@/lib/integrations/beehiiv", () => ({
  subscribeToBeehiiv: mocks.subscribeToBeehiiv,
}));
vi.mock("@/lib/crm/contacts", () => ({
  upsertContact: mocks.upsertContact,
  addActivity: mocks.addActivity,
}));

const FUELLING_REPORT = {
  html: "<html>Your fuelling strategy</html>",
  subject: "Your Fuelling Strategy — Roadman Cycling",
  beehiivTag: "used-fuelling-tool",
  beehiivFields: { last_tool: "fuelling" },
};

const FTP_REPORT = {
  html: "<html>Your FTP zones</html>",
  subject: "Your FTP Zones — Roadman Cycling",
  beehiivTag: "used-ftp-zones-tool",
  beehiivFields: { last_tool: "ftp-zones" },
};

function req(body: unknown): Request {
  return new Request("https://example.test/api/tools/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/tools/report", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
    });
    mocks.generateToolReport.mockReturnValue(FUELLING_REPORT);
    mocks.subscribeToBeehiiv.mockResolvedValue({
      subscriberId: "sub_123",
      created: true,
    });
    mocks.upsertContact.mockResolvedValue({ id: "contact_1" });
    mocks.addActivity.mockResolvedValue(undefined);
    process.env.RESEND_API_KEY = "test-resend-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
  });

  it("returns 400 for an unrecognised tool slug", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ tool: "not-real", email: "a@b.com", inputs: {} }));
    expect(res.status).toBe(400);
    expect(mocks.generateToolReport).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing or invalid email", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ tool: "fuelling", email: "not-email", inputs: {} }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when inputs are missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ tool: "fuelling", email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 422 when generateToolReport returns null", async () => {
    mocks.generateToolReport.mockReturnValue(null);
    const { POST } = await import("./route");
    const res = await POST(req({ tool: "fuelling", email: "a@b.com", inputs: { weight: 70 } }));
    expect(res.status).toBe(422);
  });

  it("returns 200 with emailSent:true for a valid fuelling request", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      req({ tool: "fuelling", email: "cyclist@example.com", inputs: { weight: 70, duration: 3 } }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.success).toBe(true);
    expect(data.emailSent).toBe(true);
  });

  it("returns 200 with emailSent:true for a valid ftp-zones request", async () => {
    mocks.generateToolReport.mockReturnValue(FTP_REPORT);
    const { POST } = await import("./route");
    const res = await POST(
      req({ tool: "ftp-zones", email: "cyclist@example.com", inputs: { ftp: 260 } }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.emailSent).toBe(true);
    expect(mocks.generateToolReport).toHaveBeenCalledWith(
      "ftp-zones",
      expect.objectContaining({ ftp: 260 }),
    );
  });

  it("returns 200 with emailSent:false when Resend returns non-ok", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("rate limited"),
    });
    const { POST } = await import("./route");
    const res = await POST(
      req({ tool: "fuelling", email: "a@b.com", inputs: {} }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.emailSent).toBe(false);
  });

  it("fires Beehiiv and CRM side-effects on a successful report send", async () => {
    const { POST } = await import("./route");
    await POST(req({ tool: "fuelling", email: "a@b.com", inputs: {} }));
    expect(mocks.subscribeToBeehiiv).toHaveBeenCalled();
    expect(mocks.upsertContact).toHaveBeenCalled();
    expect(mocks.addActivity).toHaveBeenCalled();
  });

  it("still returns 200 when Beehiiv side-effect throws", async () => {
    mocks.subscribeToBeehiiv.mockRejectedValue(new Error("beehiiv down"));
    const { POST } = await import("./route");
    const res = await POST(req({ tool: "fuelling", email: "a@b.com", inputs: {} }));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/tools/report/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/tools/report/route.test.ts
git commit -m "test: integration tests for POST /api/tools/report (fuelling + ftp-zones)"
```

---

## Task 6: Paid Reports Checkout — POST /api/reports/checkout

**Files:**
- Create: `src/app/api/reports/checkout/route.test.ts`
- Reference: `src/app/api/reports/checkout/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/reports/checkout/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
  createOrder: vi.fn(),
  createPaidReport: vi.fn(),
  upsertRiderProfile: vi.fn(),
  getToolResultBySlug: vi.fn(),
  logCrmSync: vi.fn(),
  isPaidProductSlug: vi.fn(),
  stripeSessionCreate: vi.fn(),
  dbUpdate: vi.fn(),
}));

vi.mock("@/lib/paid-reports/products", () => ({
  getProductBySlug: mocks.getProductBySlug,
}));
vi.mock("@/lib/paid-reports/orders", () => ({
  createOrder: mocks.createOrder,
}));
vi.mock("@/lib/paid-reports/reports", () => ({
  createPaidReport: mocks.createPaidReport,
}));
vi.mock("@/lib/rider-profile/store", () => ({
  upsertByEmail: mocks.upsertRiderProfile,
}));
vi.mock("@/lib/tool-results/store", () => ({
  getToolResultBySlug: mocks.getToolResultBySlug,
}));
vi.mock("@/lib/paid-reports/crm-sync-log", () => ({
  logCrmSync: mocks.logCrmSync,
}));
vi.mock("@/lib/paid-reports/types", () => ({
  isPaidProductSlug: mocks.isPaidProductSlug,
}));
vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = { sessions: { create: mocks.stripeSessionCreate } };
  },
}));
// DB dynamic import mock (the route uses dynamic import for the update backfill)
vi.mock("@/lib/db", () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(mocks.dbUpdate()),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({ orders: {} }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

const PRODUCT = {
  slug: "ftp-deep-dive",
  name: "FTP Deep Dive Report",
  description: "Personalised FTP analysis",
  priceCents: 2900,
  currency: "usd",
  stripePriceId: "price_test_ftp",
  active: true,
};

const ORDER = { id: 101 };
const PAID_REPORT = { id: 201 };
const PROFILE = { id: 55 };

const VALID_BODY = {
  productSlug: "ftp-deep-dive",
  email: "cyclist@example.com",
};

function req(body: unknown): Request {
  return new Request("https://example.test/api/reports/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/reports/checkout", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.isPaidProductSlug.mockReturnValue(true);
    mocks.getProductBySlug.mockResolvedValue(PRODUCT);
    mocks.upsertRiderProfile.mockResolvedValue(PROFILE);
    mocks.createOrder.mockResolvedValue(ORDER);
    mocks.createPaidReport.mockResolvedValue(PAID_REPORT);
    mocks.stripeSessionCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });
    mocks.logCrmSync.mockResolvedValue(undefined);
    mocks.dbUpdate.mockReturnValue(undefined);
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("returns 400 for an invalid email", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, email: "not-valid" }));
    expect(res.status).toBe(400);
    expect(mocks.getProductBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown productSlug", async () => {
    mocks.isPaidProductSlug.mockReturnValue(false);
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, productSlug: "not-real" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when product is not active", async () => {
    mocks.getProductBySlug.mockResolvedValue({ ...PRODUCT, active: false });
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(404);
  });

  it("returns 404 when toolResultSlug does not exist", async () => {
    mocks.getToolResultBySlug.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, toolResultSlug: "missing-slug" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when toolResult email does not match", async () => {
    mocks.getToolResultBySlug.mockResolvedValue({
      id: 77,
      slug: "some-result",
      email: "other@example.com",
      toolSlug: "ftp_zones",
    });
    const { POST } = await import("./route");
    const res = await POST(req({ ...VALID_BODY, toolResultSlug: "some-result" }));
    expect(res.status).toBe(403);
  });

  it("returns 500 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(500);
  });

  it("returns 200 with url, orderId, paidReportId on happy path", async () => {
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.url).toContain("checkout.stripe.com");
    expect(data.orderId).toBe(101);
    expect(data.paidReportId).toBe(201);
  });

  it("creates order then paid_report, then Stripe session in that order", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    expect(mocks.createOrder.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.createPaidReport.mock.invocationCallOrder[0],
    );
    expect(mocks.createPaidReport.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.stripeSessionCreate.mock.invocationCallOrder[0],
    );
  });

  it("returns 502 when Stripe session has no url", async () => {
    mocks.stripeSessionCreate.mockResolvedValue({ id: "cs_test_no_url", url: null });
    const { POST } = await import("./route");
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(502);
  });

  it("embeds order_id and paid_report_id in Stripe metadata", async () => {
    const { POST } = await import("./route");
    await POST(req(VALID_BODY));
    expect(mocks.stripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          type: "paid_report",
          order_id: "101",
          paid_report_id: "201",
        }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/reports/checkout/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reports/checkout/route.test.ts
git commit -m "test: integration tests for POST /api/reports/checkout"
```

---

## Task 7: Paid Reports Download — GET /api/reports/download/[token]

**Files:**
- Create: `src/app/api/reports/download/[token]/route.test.ts`
- Reference: `src/app/api/reports/download/[token]/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/reports/download/[token]/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getPaidReportByToken: vi.fn(),
  incrementDownloadCount: vi.fn(),
  recordPaidReportServerEvent: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@/lib/paid-reports/reports", () => ({
  getPaidReportByToken: mocks.getPaidReportByToken,
  incrementDownloadCount: mocks.incrementDownloadCount,
}));
vi.mock("@/lib/analytics/paid-report-events", () => ({
  PAID_REPORT_EVENTS: { DOWNLOADED: "report_downloaded" },
  recordPaidReportServerEvent: mocks.recordPaidReportServerEvent,
}));

const READY_REPORT = {
  id: 1,
  orderId: 101,
  productSlug: "ftp-deep-dive",
  email: "cyclist@example.com",
  status: "generated",
  pdfUrl: "https://blob.vercel-storage.com/reports/report-1.pdf",
};

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF

function req(token: string): NextRequest {
  return new Request(
    `https://example.test/api/reports/download/${token}`,
  ) as NextRequest;
}

function params(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe("GET /api/reports/download/[token]", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.getPaidReportByToken.mockResolvedValue(READY_REPORT);
    mocks.incrementDownloadCount.mockResolvedValue(undefined);
    mocks.recordPaidReportServerEvent.mockResolvedValue(undefined);
    mocks.fetch.mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(PDF_BYTES);
          controller.close();
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns 400 for a token shorter than 20 chars", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("short"), params("short"));
    expect(res.status).toBe(400);
    expect(mocks.getPaidReportByToken).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown token", async () => {
    mocks.getPaidReportByToken.mockResolvedValue(null);
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(404);
  });

  it("returns 410 Gone for a revoked report", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      ...READY_REPORT,
      status: "revoked",
    });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(410);
  });

  it("returns 410 Gone for a refunded report", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      ...READY_REPORT,
      status: "refunded",
    });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(410);
  });

  it("returns 409 when report is not yet generated", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      ...READY_REPORT,
      status: "pending_payment",
    });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(409);
  });

  it("returns 404 when report has no pdfUrl", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      ...READY_REPORT,
      pdfUrl: null,
    });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(404);
  });

  it("returns 502 when blob fetch fails", async () => {
    mocks.fetch.mockResolvedValue({ ok: false, body: null });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(502);
  });

  it("streams the PDF with correct headers on happy path", async () => {
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain(".pdf");
    expect(res.headers.get("cache-control")).toContain("private");
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
  });

  it("increments download count after successful delivery", async () => {
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    await GET(req(token), params(token));
    expect(mocks.incrementDownloadCount).toHaveBeenCalledWith(
      READY_REPORT.id,
    );
  });

  it("records analytics event after successful delivery", async () => {
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    await GET(req(token), params(token));
    expect(mocks.recordPaidReportServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "report_downloaded",
        email: READY_REPORT.email,
        productSlug: READY_REPORT.productSlug,
      }),
    );
  });

  it("accepts report with status 'delivered' as deliverable", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      ...READY_REPORT,
      status: "delivered",
    });
    const { GET } = await import("./route");
    const token = "a".repeat(32);
    const res = await GET(req(token), params(token));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- "src/app/api/reports/download/\[token\]/route.test.ts"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/reports/download/[token]/route.test.ts"
git commit -m "test: integration tests for GET /api/reports/download/[token]"
```

---

## Task 8: Stripe Webhook — POST /api/webhooks/stripe

**Files:**
- Create: `src/app/api/webhooks/stripe/route.test.ts`
- Reference: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/webhooks/stripe/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  markOrderPaid: vi.fn(),
  markOrderRefunded: vi.fn(),
  getPaidReportByOrderId: vi.fn(),
  markPaymentConfirmed: vi.fn(),
  markPaidReportRefunded: vi.fn(),
  generateAndDeliverPaidReport: vi.fn(),
  logCrmSync: vi.fn(),
  recordPaidReportServerEvent: vi.fn(),
  refreshLeadScore: vi.fn(),
  upsertOnTrialStart: vi.fn(),
  upsertOnPaid: vi.fn(),
  upsertOnChurn: vi.fn(),
  getSlots: vi.fn(),
  updateSlot: vi.fn(),
  notifySpotlightPurchase: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mocks.constructEvent };
    customers = {
      retrieve: vi.fn().mockResolvedValue({ deleted: false, email: "a@b.com", id: "cus_1" }),
    };
  },
}));
vi.mock("@/lib/paid-reports/orders", () => ({
  markOrderPaid: mocks.markOrderPaid,
  markOrderRefunded: mocks.markOrderRefunded,
}));
vi.mock("@/lib/paid-reports/reports", () => ({
  getPaidReportByOrderId: mocks.getPaidReportByOrderId,
  markPaymentConfirmed: mocks.markPaymentConfirmed,
  markRefunded: mocks.markPaidReportRefunded,
}));
vi.mock("@/lib/paid-reports/generator", () => ({
  generateAndDeliverPaidReport: mocks.generateAndDeliverPaidReport,
}));
vi.mock("@/lib/paid-reports/crm-sync-log", () => ({
  logCrmSync: mocks.logCrmSync,
}));
vi.mock("@/lib/analytics/paid-report-events", () => ({
  PAID_REPORT_EVENTS: { CHECKOUT_SUCCESS: "checkout_success" },
  recordPaidReportServerEvent: mocks.recordPaidReportServerEvent,
}));
vi.mock("@/lib/paid-reports/lead-score", () => ({
  refreshLeadScore: mocks.refreshLeadScore,
}));
vi.mock("@/lib/admin/subscribers-store", () => ({
  upsertOnTrialStart: mocks.upsertOnTrialStart,
  upsertOnPaid: mocks.upsertOnPaid,
  upsertOnChurn: mocks.upsertOnChurn,
}));
vi.mock("@/lib/inventory", () => ({
  getSlots: mocks.getSlots,
  updateSlot: mocks.updateSlot,
}));
vi.mock("@/lib/notifications", () => ({
  notifySpotlightPurchase: mocks.notifySpotlightPurchase,
}));
// The refund handler dynamically imports db and schema — stub them
vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({ orders: {} }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

function req(body: string, signature = "valid-sig"): NextRequest {
  return new Request("https://example.test/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body,
  }) as NextRequest;
}

const PAID_REPORT_CHECKOUT_COMPLETED = {
  type: "checkout.session.completed",
  id: "evt_123",
  data: {
    object: {
      id: "cs_test_abc",
      payment_intent: "pi_test_abc",
      customer_email: "cyclist@example.com",
      customer_details: { email: "cyclist@example.com", name: "Alice" },
      amount_total: 2900,
      metadata: {
        type: "paid_report",
        order_id: "101",
        paid_report_id: "201",
        product_slug: "ftp-deep-dive",
        tool_result_slug: "",
        rider_profile_id: "55",
      },
    },
  },
};

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    mocks.constructEvent.mockReturnValue(PAID_REPORT_CHECKOUT_COMPLETED);
    mocks.markOrderPaid.mockResolvedValue({ flipped: true });
    mocks.markPaymentConfirmed.mockResolvedValue(undefined);
    mocks.generateAndDeliverPaidReport.mockResolvedValue(undefined);
    mocks.logCrmSync.mockResolvedValue(undefined);
    mocks.recordPaidReportServerEvent.mockResolvedValue(undefined);
    mocks.refreshLeadScore.mockResolvedValue(undefined);
    mocks.getPaidReportByOrderId.mockResolvedValue({ id: 201 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("returns 500 when Stripe env vars are missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { POST } = await import("./route");
    const res = await POST(req("{}"));
    expect(res.status).toBe(500);
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const { POST } = await import("./route");
    const noSigReq = new Request("https://example.test/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    }) as NextRequest;
    const res = await POST(noSigReq);
    expect(res.status).toBe(400);
  });

  it("returns 400 when signature verification fails", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("signature mismatch");
    });
    const { POST } = await import("./route");
    const res = await POST(req("{}", "bad-sig"));
    expect(res.status).toBe(400);
  });

  it("marks order paid and triggers report generation for paid_report checkout", async () => {
    const { POST } = await import("./route");
    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.received).toBe(true);
    expect(mocks.markOrderPaid).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 101 }),
    );
    expect(mocks.markPaymentConfirmed).toHaveBeenCalledWith(201);
    expect(mocks.generateAndDeliverPaidReport).toHaveBeenCalledWith(201);
  });

  it("skips generation if order is already paid (idempotency)", async () => {
    mocks.markOrderPaid.mockResolvedValue({ flipped: false });
    const { POST } = await import("./route");
    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
    expect(mocks.generateAndDeliverPaidReport).not.toHaveBeenCalled();
  });

  it("returns 200 for an unhandled event type", async () => {
    mocks.constructEvent.mockReturnValue({ type: "payment_intent.created", data: { object: {} } });
    const { POST } = await import("./route");
    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.received).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/webhooks/stripe/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/stripe/route.test.ts
git commit -m "test: integration tests for POST /api/webhooks/stripe (paid reports lifecycle)"
```

---

## Task 9: MCP Server — POST /api/mcp

**Files:**
- Create: `src/app/api/mcp/route.test.ts`
- Reference: `src/app/api/mcp/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/mcp/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  buildMcpServer: vi.fn(),
  serverConnect: vi.fn(),
  handleRequest: vi.fn(),
}));

vi.mock("@/lib/mcp/rate-limiter", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));
vi.mock("@/lib/mcp/server", () => ({
  buildMcpServer: mocks.buildMcpServer,
}));
vi.mock(
  "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js",
  () => ({
    WebStandardStreamableHTTPServerTransport: class MockTransport {
      handleRequest = mocks.handleRequest;
    },
  }),
);

const MCP_JSON_BODY = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {},
});

function req(body = MCP_JSON_BODY): Request {
  return new Request("https://example.test/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("GET /api/mcp", () => {
  it("returns 405 with discovery hint", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(405);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.error).toMatch(/mcp\.json/i);
  });
});

describe("POST /api/mcp", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ success: true });
    mocks.buildMcpServer.mockReturnValue({
      connect: mocks.serverConnect,
    });
    mocks.serverConnect.mockResolvedValue(undefined);
    mocks.handleRequest.mockResolvedValue(
      new Response(
        JSON.stringify({ jsonrpc: "2.0", id: 1, result: { tools: [] } }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns 429 with jsonrpc error when rate limit is exceeded", async () => {
    mocks.checkRateLimit.mockResolvedValue({ success: false });
    const { POST } = await import("./route");
    const res = await POST(req());
    expect(res.status).toBe(429);
    const data = (await res.json()) as Record<string, unknown>;
    expect((data as Record<string, unknown>).jsonrpc).toBe("2.0");
    expect(
      ((data as Record<string, unknown>).error as Record<string, unknown>)
        .code,
    ).toBe(-32000);
  });

  it("passes the client IP to buildMcpServer", async () => {
    const { POST } = await import("./route");
    const reqWithIp = new Request("https://example.test/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.42",
      },
      body: MCP_JSON_BODY,
    });
    await POST(reqWithIp);
    expect(mocks.buildMcpServer).toHaveBeenCalledWith("203.0.113.42");
  });

  it("connects the server to the transport and delegates the request", async () => {
    const { POST } = await import("./route");
    const res = await POST(req());
    expect(mocks.serverConnect).toHaveBeenCalled();
    expect(mocks.handleRequest).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("falls back to 'unknown' IP when no forwarding header", async () => {
    const { POST } = await import("./route");
    await POST(req());
    expect(mocks.buildMcpServer).toHaveBeenCalledWith("unknown");
  });

  it("uses x-real-ip when x-forwarded-for is absent", async () => {
    const { POST } = await import("./route");
    const reqWithRealIp = new Request("https://example.test/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-real-ip": "10.0.0.1",
      },
      body: MCP_JSON_BODY,
    });
    await POST(reqWithRealIp);
    expect(mocks.buildMcpServer).toHaveBeenCalledWith("10.0.0.1");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/mcp/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/mcp/route.test.ts
git commit -m "test: integration tests for POST /api/mcp server"
```

---

## Task 10: Admin Stats — GET /api/admin/stats

**Files:**
- Create: `src/app/api/admin/stats/route.test.ts`
- Reference: `src/app/api/admin/stats/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/admin/stats/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getDashboardStats: vi.fn(),
  getPageStats: vi.fn(),
  getRecentLeads: vi.fn(),
  getTrafficStats: vi.fn(),
  getLeadTotals: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  isAuthenticated: mocks.isAuthenticated,
}));
vi.mock("@/lib/admin/events-store", () => ({
  getDashboardStats: mocks.getDashboardStats,
  getPageStats: mocks.getPageStats,
  getRecentLeads: mocks.getRecentLeads,
  getTrafficStats: mocks.getTrafficStats,
  getLeadTotals: mocks.getLeadTotals,
}));

function req(view?: string): Request {
  const url = view
    ? `https://example.test/api/admin/stats?view=${view}`
    : "https://example.test/api/admin/stats";
  return new Request(url);
}

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.isAuthenticated.mockResolvedValue(true);
    mocks.getDashboardStats.mockResolvedValue({ totalLeads: 1000 });
    mocks.getPageStats.mockResolvedValue([]);
    mocks.getRecentLeads.mockResolvedValue([]);
    mocks.getLeadTotals.mockResolvedValue({ total: 0 });
    mocks.getTrafficStats.mockResolvedValue({ aiReferrals: 0 });
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    mocks.isAuthenticated.mockResolvedValue(false);
    const { GET } = await import("./route");
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(mocks.getDashboardStats).not.toHaveBeenCalled();
  });

  it("returns dashboard stats when view=dashboard (default)", async () => {
    const { GET } = await import("./route");
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(mocks.getDashboardStats).toHaveBeenCalled();
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.totalLeads).toBe(1000);
  });

  it("returns page stats when view=emails", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("emails"));
    expect(res.status).toBe(200);
    expect(mocks.getPageStats).toHaveBeenCalled();
  });

  it("returns leads + totals when view=leads", async () => {
    mocks.getRecentLeads.mockResolvedValue([{ email: "a@b.com" }]);
    mocks.getLeadTotals.mockResolvedValue({ total: 1 });
    const { GET } = await import("./route");
    const res = await GET(req("leads"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.leads).toHaveLength(1);
    expect((data.totals as Record<string, unknown>).total).toBe(1);
  });

  it("returns traffic stats when view=traffic", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("traffic"));
    expect(res.status).toBe(200);
    expect(mocks.getTrafficStats).toHaveBeenCalled();
  });

  it("returns 400 for an unknown view", async () => {
    const { GET } = await import("./route");
    const res = await GET(req("not-real"));
    expect(res.status).toBe(400);
  });

  it("returns 500 when a stats function throws", async () => {
    mocks.getDashboardStats.mockRejectedValue(new Error("db down"));
    const { GET } = await import("./route");
    const res = await GET(req());
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/admin/stats/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/stats/route.test.ts
git commit -m "test: integration tests for GET /api/admin/stats"
```

---

## Task 11: Admin Diagnostic Export — GET /api/admin/diagnostic/export

**Files:**
- Create: `src/app/api/admin/diagnostic/export/route.test.ts`
- Reference: `src/app/api/admin/diagnostic/export/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/api/admin/diagnostic/export/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  dbSelect: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        orderBy: () => Promise.resolve(mocks.dbSelect()),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({ diagnosticSubmissions: {} }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, desc: vi.fn() };
});

const SUBMISSION_ROW = {
  slug: "abc1234567",
  createdAt: new Date("2026-04-01T09:00:00Z"),
  email: "cyclist@example.com",
  primaryProfile: "underRecovered",
  secondaryProfile: null,
  retakeNumber: 1,
  generationSource: "llm",
  severeMultiSystem: false,
  closeToBreakthrough: false,
  scores: {
    underRecovered: 11,
    polarisation: 3,
    strengthGap: 5,
    fuelingDeficit: 6,
  },
  age: "45-54",
  hoursPerWeek: "9-12",
  ftp: 285,
  goal: "Etape",
  utmSource: "facebook",
  utmMedium: null,
  utmCampaign: "plateau-test",
  utmContent: null,
  utmTerm: null,
};

describe("GET /api/admin/diagnostic/export", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.requireAuth.mockResolvedValue(undefined);
    mocks.dbSelect.mockReturnValue([SUBMISSION_ROW]);
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("calls requireAuth before reading data", async () => {
    const { GET } = await import("./route");
    await GET();
    expect(mocks.requireAuth).toHaveBeenCalled();
    expect(mocks.requireAuth.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.dbSelect.mock.invocationCallOrder[0],
    );
  });

  it("returns text/csv content-type", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });

  it("includes content-disposition attachment header with filename", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const cd = res.headers.get("content-disposition") ?? "";
    expect(cd).toContain("attachment");
    expect(cd).toContain(".csv");
  });

  it("sets cache-control to no-store", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("includes a header row with the expected columns", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    const headerRow = text.split("\n")[0];
    expect(headerRow).toContain("slug");
    expect(headerRow).toContain("email");
    expect(headerRow).toContain("primary_profile");
    expect(headerRow).toContain("score_under_recovered");
    expect(headerRow).toContain("utm_source");
  });

  it("includes submission data in the CSV body", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("abc1234567");
    expect(text).toContain("cyclist@example.com");
    expect(text).toContain("underRecovered");
  });

  it("applies RFC 4180 double-quote escaping to fields with commas or quotes", async () => {
    mocks.dbSelect.mockReturnValue([
      {
        ...SUBMISSION_ROW,
        goal: 'Win "the big one", definitely',
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    // RFC 4180: field is wrapped in double-quotes and internal quotes doubled
    expect(text).toContain('"Win ""the big one"", definitely"');
  });

  it("returns just the header row when there are no submissions", async () => {
    mocks.dbSelect.mockReturnValue([]);
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    const lines = text.trim().split("\n");
    expect(lines).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/api/admin/diagnostic/export/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/diagnostic/export/route.test.ts
git commit -m "test: integration tests for GET /api/admin/diagnostic/export (CSV)"
```

---

## Task 12: SEO — robots.ts

**Files:**
- Create: `src/app/robots.test.ts`
- Reference: `src/app/robots.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/robots.test.ts
import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots()", () => {
  it("disallows /api/ for all user agents", () => {
    const result = robots();
    const wildcard = Array.isArray(result.rules)
      ? result.rules.find((r) =>
          Array.isArray(r.userAgent)
            ? r.userAgent.includes("*")
            : r.userAgent === "*",
        )
      : result.rules;
    expect(wildcard?.disallow).toContain("/api/");
  });

  it("disallows /admin/ for all user agents", () => {
    const result = robots();
    const wildcard = Array.isArray(result.rules)
      ? result.rules.find((r) =>
          Array.isArray(r.userAgent)
            ? r.userAgent.includes("*")
            : r.userAgent === "*",
        )
      : result.rules;
    expect(wildcard?.disallow).toContain("/admin/");
  });

  it("explicitly allows GPTBot", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.flatMap((r) =>
      Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent],
    );
    expect(agents).toContain("GPTBot");
  });

  it("explicitly allows ClaudeBot", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.flatMap((r) =>
      Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent],
    );
    expect(agents).toContain("ClaudeBot");
  });

  it("lists at least one sitemap URL", () => {
    const result = robots();
    const sitemaps = Array.isArray(result.sitemap)
      ? result.sitemap
      : [result.sitemap];
    expect(sitemaps.length).toBeGreaterThan(0);
    for (const url of sitemaps) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("includes the sitemap-index", () => {
    const result = robots();
    const sitemaps = Array.isArray(result.sitemap)
      ? result.sitemap
      : [result.sitemap];
    expect(sitemaps.some((u) => u?.includes("sitemap-index.xml"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/robots.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.test.ts
git commit -m "test: robots.ts disallow rules, AI-crawler allowlist, sitemap listing"
```

---

## Task 13: SEO — JSON-LD Schema Components

**Files:**
- Create: `src/components/seo/JsonLd.test.tsx`
- Reference: `src/components/seo/JsonLd.tsx`

Note: Uses `react-dom/server`'s `renderToStaticMarkup` which works in the Node test environment without jsdom.

- [ ] **Step 1: Write the test file**

```tsx
// src/components/seo/JsonLd.test.tsx
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  OrganizationJsonLd,
  PodcastEpisodeJsonLd,
} from "./JsonLd";

function extractJsonLd(html: string): Record<string, unknown> {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("No JSON-LD script tag found in rendered HTML");
  return JSON.parse(match[1]) as Record<string, unknown>;
}

describe("OrganizationJsonLd", () => {
  it("renders a @graph with 4 entities", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    expect(data["@context"]).toBe("https://schema.org");
    const graph = data["@graph"] as unknown[];
    expect(graph).toHaveLength(4);
  });

  it("includes Organization, WebSite, Person, and PodcastSeries types", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    const types = (data["@graph"] as Array<Record<string, unknown>>).map(
      (e) => e["@type"],
    );
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("Person");
    expect(types).toContain("PodcastSeries");
  });

  it("Organization entity references the Person by @id", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    const org = (data["@graph"] as Array<Record<string, unknown>>).find(
      (e) => e["@type"] === "Organization",
    );
    expect(org?.founder).toHaveProperty("@id");
  });
});

describe("ArticleJsonLd", () => {
  const PROPS = {
    title: "How to Build a Base Phase",
    description: "Everything you need to know about base training.",
    url: "https://roadmancycling.com/blog/base-phase",
    datePublished: "2026-01-10",
    dateModified: "2026-03-01",
    category: "Training",
  };

  it("emits @type Article", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("Article");
  });

  it("includes headline and description", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.headline).toBe(PROPS.title);
    expect(data.description).toBe(PROPS.description);
  });

  it("includes datePublished and dateModified", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.datePublished).toBe("2026-01-10");
    expect(data.dateModified).toBe("2026-03-01");
  });

  it("references author and publisher by @id", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect((data.author as Record<string, unknown>)["@id"]).toBeTruthy();
    expect((data.publisher as Record<string, unknown>)["@id"]).toBeTruthy();
  });

  it("omits dateModified when not provided", () => {
    const html = renderToStaticMarkup(
      <ArticleJsonLd {...PROPS} dateModified={undefined} />,
    );
    const data = extractJsonLd(html);
    expect(data.dateModified).toBeUndefined();
  });
});

describe("FAQPageJsonLd", () => {
  const QUESTIONS = [
    { question: "What is FTP?", answer: "Functional Threshold Power." },
    { question: "How do I train zone 2?", answer: "Keep HR below 75% max." },
  ];

  it("emits @type FAQPage", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={QUESTIONS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("FAQPage");
  });

  it("maps each question to a Question/Answer pair", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={QUESTIONS} />);
    const data = extractJsonLd(html);
    const entities = data.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0].name).toBe("What is FTP?");
    expect(
      (entities[0].acceptedAnswer as Record<string, unknown>).text,
    ).toBe("Functional Threshold Power.");
  });

  it("returns null (renders nothing) when questions array is empty", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={[]} />);
    expect(html).toBe("");
  });
});

describe("BreadcrumbJsonLd", () => {
  const ITEMS = [
    { name: "Home", url: "https://roadmancycling.com" },
    { name: "Blog", url: "https://roadmancycling.com/blog" },
    { name: "FTP Guide", url: "https://roadmancycling.com/blog/ftp-guide" },
  ];

  it("emits @type BreadcrumbList", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("BreadcrumbList");
  });

  it("assigns 1-indexed positions to each item", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[0].position).toBe(1);
    expect(list[1].position).toBe(2);
    expect(list[2].position).toBe(3);
  });

  it("includes name and item URL for each breadcrumb", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[2].name).toBe("FTP Guide");
    expect(list[2].item).toBe("https://roadmancycling.com/blog/ftp-guide");
  });
});

describe("PodcastEpisodeJsonLd", () => {
  const PROPS = {
    title: "Breaking Through Your Plateau",
    description: "We talk about FTP stagnation with Dr. Wakefield.",
    url: "https://roadmancycling.com/podcast/ep-2200",
    datePublished: "2026-04-01",
    duration: "PT45M",
    episodeNumber: 2200,
  };

  it("emits @type PodcastEpisode", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("PodcastEpisode");
  });

  it("includes name, description, url, and datePublished", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.name).toBe(PROPS.title);
    expect(data.description).toBe(PROPS.description);
    expect(data.url).toBe(PROPS.url);
    expect(data.datePublished).toBe("2026-04-01");
  });

  it("includes duration when provided", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.timeRequired).toBe("PT45M");
  });

  it("includes episodeNumber when provided", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.episodeNumber).toBe(2200);
  });

  it("links back to the podcast series @id", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect((data.partOfSeries as Record<string, unknown>)["@id"]).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/seo/JsonLd.test.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/JsonLd.test.tsx
git commit -m "test: JSON-LD schema component structure (Article, FAQ, Breadcrumb, Podcast, Org)"
```

---

## Task 14: SEO — llms.txt Route

**Files:**
- Create: `src/app/llms.txt/route.test.ts`
- Reference: `src/app/llms.txt/route.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/app/llms.txt/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAllPosts: vi.fn(),
  getAllEpisodes: vi.fn(),
}));

vi.mock("@/lib/blog", () => ({ getAllPosts: mocks.getAllPosts }));
vi.mock("@/lib/podcast", () => ({ getAllEpisodes: mocks.getAllEpisodes }));

// tagUrlForAICrawler just appends UTM params — use real implementation
vi.mock("@/lib/analytics/ai-referrer", () => ({
  tagUrlForAICrawler: (url: string, source: string) =>
    `${url}?utm_source=${source}&utm_medium=ai-crawler`,
}));

const MOCK_POSTS = Array.from({ length: 5 }, (_, i) => ({
  slug: `post-slug-${i}`,
  title: `Post Title ${i}`,
  description: `Description for post ${i}`,
  publishedAt: `2026-0${i + 1}-01`,
  category: "Training",
}));

const MOCK_EPISODES = Array.from({ length: 5 }, (_, i) => ({
  slug: `ep-${2000 + i}`,
  title: `Episode ${2000 + i}`,
  description: `Episode description ${i}`,
  publishedAt: `2026-0${i + 1}-01`,
  episodeNumber: 2000 + i,
}));

describe("GET /llms.txt", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.getAllPosts.mockReturnValue(MOCK_POSTS);
    mocks.getAllEpisodes.mockReturnValue(MOCK_EPISODES);
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("returns 200 with text/plain content-type", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("returns a non-empty body", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text.length).toBeGreaterThan(100);
  });

  it("includes the Roadman Cycling brand name", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("Roadman Cycling");
  });

  it("tags links with UTM source llms-txt", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("utm_source=llms-txt");
  });

  it("includes a blog posts section with links", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("post-slug-0");
  });

  it("includes a podcast episodes section", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("ep-2000");
  });

  it("sets a cache-control header", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const cc = res.headers.get("cache-control") ?? "";
    expect(cc).toMatch(/max-age/i);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/app/llms.txt/route.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/llms.txt/route.test.ts
git commit -m "test: llms.txt route — content-type, UTM tagging, brand sections"
```

---

## Final Step: Run the Full Suite

- [ ] **Run all new tests together**

```bash
npm run test:run -- \
  src/app/api/ask/route.test.ts \
  src/app/api/ask/session/route.test.ts \
  "src/app/api/diagnostic/[slug]/route.test.ts" \
  "src/app/api/diagnostic/[slug]/regenerate/route.test.ts" \
  src/app/api/tools/report/route.test.ts \
  src/app/api/reports/checkout/route.test.ts \
  "src/app/api/reports/download/[token]/route.test.ts" \
  src/app/api/webhooks/stripe/route.test.ts \
  src/app/api/mcp/route.test.ts \
  src/app/api/admin/stats/route.test.ts \
  src/app/api/admin/diagnostic/export/route.test.ts \
  src/app/robots.test.ts \
  src/components/seo/JsonLd.test.tsx \
  src/app/llms.txt/route.test.ts
```
Expected: all 14 test files pass.

- [ ] **Final commit if any fixups were needed**

```bash
git add -p
git commit -m "test: fixup — adjust mock shapes after running full integration suite"
```

- [ ] **Push branch**

```bash
git push -u origin HEAD
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Ask Roadman chat — POST /api/ask: validation, rate limiting, session management, streaming response, session_ack event
- ✅ Ask Roadman sessions — GET /api/ask/session: load by id, by anonKey, with profile
- ✅ Diagnostics read — GET /api/diagnostic/[slug]: masked email, 404 guards
- ✅ Diagnostics regenerate — POST /api/diagnostic/[slug]/regenerate: auth, 404, DB failure
- ✅ Calculator tool reports — POST /api/tools/report: fuelling, ftp-zones, email/Beehiiv/CRM side-effects
- ✅ Paid reports checkout — POST /api/reports/checkout: full validation chain, Stripe session creation, metadata
- ✅ Secure token download — GET /api/reports/download/[token]: all status cases, streaming, analytics
- ✅ Stripe webhooks — POST /api/webhooks/stripe: signature verification, paid report lifecycle, idempotency
- ✅ MCP server — POST /api/mcp: rate limiting, IP extraction, server delegation, GET 405
- ✅ Admin stats — GET /api/admin/stats: auth, all view cases
- ✅ Admin export — GET /api/admin/diagnostic/export: auth, CSV structure, RFC 4180 escaping
- ✅ SEO robots.ts — disallow rules, AI crawler allowlist, sitemaps
- ✅ SEO JSON-LD — all 5 component types with correct schema.org structure
- ✅ SEO llms.txt — content-type, UTM tagging, brand content, cache header

**No placeholders:** every step contains actual test code or an exact shell command.
