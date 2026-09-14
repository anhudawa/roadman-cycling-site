import { describe, expect, it } from "vitest";
import { classifyContactSpam } from "./contact-spam";

describe("classifyContactSpam", () => {
  it("catches the generated name and message pattern used by the current bot", () => {
    for (const submission of [
      { name: "Zqvpx Rtmkqzvn", message: "vftfAisJcOPuficIvrzOVKUz" },
      { name: "Qweryt Asdfghjk", message: "QGJlXUvdKxmTrRRn" },
      { name: "Poqiwe Zmxncbva", message: "KttvtIrTKhtviZUVdHHy" },
      { name: "Ncoie Parwyqvw", message: "NMoUVPSYQfWMuAINzip" },
      { name: "Qrawebx Dtfttyut", message: "DnfyvhlIfvbpCbFqHy" },
      { name: "Wgrict Cswws", message: "MVMqDKnQQjUxRGJOKAW" },
    ]) {
      expect(classifyContactSpam(submission)).toBe("synthetic_payload");
    }
  });

  it("catches the older single-token name variant on every subject", () => {
    for (const subject of [
      "sponsorship",
      "partnership",
      "press",
      "guest",
      "general",
    ]) {
      expect(
        classifyContactSpam({
          name: "gNIkSZCMsjSavWuIM",
          subject,
          message: "JlRsjfOAAvGksxPmBYH",
        }),
      ).toBe("synthetic_payload");
    }
  });

  it("does not flag representative genuine enquiries", () => {
    for (const submission of [
      {
        name: "Morgan Taylor",
        subject: "sponsorship",
        message:
          "Hi Anthony and team, our cycling brand would love to discuss a podcast sponsorship for the spring campaign.",
      },
      {
        name: "Sam",
        subject: "general",
        message:
          "I paid for the strength programme this morning but have not received the access email.",
      },
      {
        name: "Jamie O'Neill",
        subject: "partnership",
        message:
          "We are organising a gravel event in Ireland and would like to explore a partnership.",
      },
      {
        name: "Áine Ní Bhraonáin",
        subject: "guest",
        message:
          "Could you invite our sports scientist to discuss recovery on the podcast?",
      },
      {
        name: "John Smith",
        subject: "sponsorship",
        message: "WouldLoveToSponsorRoadman",
      },
      {
        name: "Jo Li",
        subject: "general",
        message: "Please call me",
      },
    ]) {
      expect(classifyContactSpam(submission)).toBeNull();
    }
  });

  it("quietly traps a filled honeypot", () => {
    expect(
      classifyContactSpam({
        name: "Morgan Taylor",
        subject: "sponsorship",
        message: "A real-looking message",
        website: "https://spam.example",
      }),
    ).toBe("honeypot");
  });
});
