import { describe, it, expect } from "vitest";
import {
  EMAIL_REGEX,
  clampString,
  escapeHtml,
  normaliseEmail,
} from "./validation";

describe("normaliseEmail", () => {
  it("accepts a well-formed email and lowercases it", () => {
    expect(normaliseEmail("Anthony@Roadman.com")).toBe("anthony@roadman.com");
  });

  it("trims surrounding whitespace", () => {
    expect(normaliseEmail("  user@site.com  ")).toBe("user@site.com");
  });

  it("rejects missing domain", () => {
    expect(normaliseEmail("foo@")).toBeNull();
  });

  it("rejects missing local part", () => {
    expect(normaliseEmail("@bar.com")).toBeNull();
  });

  it("rejects missing TLD", () => {
    expect(normaliseEmail("foo@bar")).toBeNull();
  });

  it("rejects non-string", () => {
    expect(normaliseEmail(undefined)).toBeNull();
    expect(normaliseEmail(42)).toBeNull();
    expect(normaliseEmail(null)).toBeNull();
    expect(normaliseEmail({})).toBeNull();
  });

  it("rejects empty string", () => {
    expect(normaliseEmail("")).toBeNull();
    expect(normaliseEmail("   ")).toBeNull();
  });

  it("rejects emails over the 200 char cap", () => {
    const huge = "a".repeat(200) + "@site.com";
    expect(normaliseEmail(huge)).toBeNull();
  });
});

describe("EMAIL_REGEX", () => {
  it("matches common valid emails", () => {
    for (const e of [
      "a@b.co",
      "first.last@domain.com",
      "user+tag@sub.domain.io",
      "user_name@domain.co.uk",
    ]) {
      expect(EMAIL_REGEX.test(e)).toBe(true);
    }
  });

  it("rejects common invalid emails", () => {
    for (const e of ["foo@", "@bar", "foo@bar", "foo bar@site.com", "a@b"]) {
      expect(EMAIL_REGEX.test(e)).toBe(false);
    }
  });
});

describe("clampString", () => {
  it("trims and returns up to max", () => {
    expect(clampString("  hello  ", 20)).toBe("hello");
  });

  it("truncates to the max length", () => {
    expect(clampString("abcdef", 3)).toBe("abc");
  });

  it("returns null for empty after trim", () => {
    expect(clampString("   ", 20)).toBeNull();
    expect(clampString("", 20)).toBeNull();
  });

  it("returns null for non-string", () => {
    expect(clampString(undefined, 20)).toBeNull();
    expect(clampString(null, 20)).toBeNull();
    expect(clampString(42, 20)).toBeNull();
  });
});

describe("escapeHtml", () => {
  it("escapes all five HTML special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
    expect(escapeHtml("'single'")).toBe("&#39;single&#39;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("handles injection attempts in user input", () => {
    const malicious = `<img src=x onerror="alert('pwn')">`;
    const safe = escapeHtml(malicious);
    // The dangerous bits are the tag brackets and the quotes that
    // delimit the attribute $€” once those are escaped, the browser
    // renders the whole thing as visible text, which is fine.
    expect(safe).not.toContain("<img");
    expect(safe).not.toContain(">");
    expect(safe).toContain("&lt;img");
    expect(safe).toContain("&gt;");
    expect(safe).toContain("&quot;");
    expect(safe).toContain("&#39;");
  });

  it("is idempotent for already-escaped strings after one pass", () => {
    // Important because an attacker could double-encode to bypass.
    // Our escape converts & $†’ &amp;, so escape(escape(x)) is NOT
    // identical to escape(x). We escape exactly once before using
    // in HTML; consumers shouldn't double-apply.
    const once = escapeHtml("a & b");
    const twice = escapeHtml(once);
    expect(once).toBe("a &amp; b");
    expect(twice).toBe("a &amp;amp; b");
  });
});
