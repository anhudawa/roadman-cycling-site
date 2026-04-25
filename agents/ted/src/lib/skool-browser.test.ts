import { describe, it, expect } from "vitest";
import { splitTitleAndBody } from "./skool-browser";

describe("splitTitleAndBody", () => {
  it("uses the first line as the title and the rest as the body", () => {
    const { title, body } = splitTitleAndBody(
      "Question for the group.\n\nZ2 vs intervals — which would you pick?\n\n— Ted"
    );
    expect(title).toBe("Question for the group");
    expect(body).toContain("Z2 vs intervals");
    expect(body).toContain("— Ted");
  });

  it("strips trailing punctuation from the title", () => {
    expect(splitTitleAndBody("Is Z2 still worth it?\n\nBody").title).toBe(
      "Is Z2 still worth it"
    );
    expect(splitTitleAndBody("Real talk!\n\nBody").title).toBe("Real talk");
  });

  it("handles leading blank lines", () => {
    const { title, body } = splitTitleAndBody("\n\n\nWelcome in, Alice.\n\nDrop a reply.\n\n— Ted");
    expect(title).toBe("Welcome in, Alice");
    expect(body).toContain("Drop a reply");
  });

  it("caps the title at 200 chars", () => {
    const long = "a".repeat(500);
    const { title } = splitTitleAndBody(`${long}\n\nbody`);
    expect(title.length).toBe(200);
  });

  it("returns the full body when there's only one line", () => {
    const { title, body } = splitTitleAndBody("Single line only");
    expect(title).toBe("Single line only");
    // No remainder → body falls back to the whole text
    expect(body).toContain("Single line only");
  });

  it("returns empty strings for all-whitespace input", () => {
    const { title, body } = splitTitleAndBody("   \n\n  ");
    expect(title).toBe("");
    expect(body).toBe("");
  });
});
