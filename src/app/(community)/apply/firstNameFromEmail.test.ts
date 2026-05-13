import { describe, expect, it } from "vitest";
import { firstNameFromEmail } from "./firstNameFromEmail";

describe("firstNameFromEmail", () => {
  it("titlecases a simple local-part", () => {
    expect(firstNameFromEmail("anthony@roadmancycling.com")).toBe("Anthony");
  });

  it("splits on '.' and takes the first segment", () => {
    expect(firstNameFromEmail("first.last@example.com")).toBe("First");
  });

  it("splits on '_' and takes the first segment", () => {
    expect(firstNameFromEmail("john_doe@example.com")).toBe("John");
  });

  it("splits on '-' and takes the first segment", () => {
    expect(firstNameFromEmail("jane-smith@example.com")).toBe("Jane");
  });

  it("strips gmail '+tag' suffixes", () => {
    expect(firstNameFromEmail("anthony+newsletter@gmail.com")).toBe("Anthony");
  });

  it("lowercases the rest of the segment", () => {
    expect(firstNameFromEmail("ANTHONY@example.com")).toBe("Anthony");
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(firstNameFromEmail("  anthony@example.com  ")).toBe("Anthony");
  });

  it("falls back to 'rider' when input has no local part", () => {
    expect(firstNameFromEmail("@example.com")).toBe("rider");
  });

  it("falls back to 'rider' when the local part is only separators", () => {
    expect(firstNameFromEmail("...@example.com")).toBe("rider");
  });

  it("falls back to 'rider' for empty input", () => {
    expect(firstNameFromEmail("")).toBe("rider");
  });

  it("handles a single character local part", () => {
    expect(firstNameFromEmail("a@example.com")).toBe("A");
  });

  it("handles emails with numbers in the first segment", () => {
    expect(firstNameFromEmail("mark2@example.com")).toBe("Mark2");
  });
});
