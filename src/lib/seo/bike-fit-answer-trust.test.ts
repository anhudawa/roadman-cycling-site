import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ANSWER_PAGES } from "@/lib/answers";
import { bikefitAnswers } from "@/lib/answers-data/bikefit";
import { highVolumeQuery4Answers } from "@/lib/answers-data/high-volume-queries-4";
import { highVolumeQuery12Answers } from "@/lib/answers-data/high-volume-queries-12";
import { highVolumeQuery14Answers } from "@/lib/answers-data/high-volume-queries-14";

const governedSlugs = [
  "signs-you-need-a-bike-fit",
  "signs-your-bike-doesnt-fit-properly",
  "why-do-my-knees-hurt-cycling",
  "cycling-knee-pain-causes-and-fixes",
  "how-to-manage-knee-pain-from-cycling",
  "how-to-fix-lower-back-pain-cycling",
  "why-do-my-hands-go-numb-cycling",
  "how-to-stop-neck-pain-cycling",
  "why-do-my-feet-go-numb-cycling",
  "how-to-set-saddle-height",
  "is-a-professional-bike-fit-worth-it",
  "how-to-set-cleat-position",
  "should-i-switch-to-shorter-cranks",
  "how-often-update-bike-fit",
  "how-to-check-saddle-fore-aft-position",
  "how-to-adjust-handlebar-height-cycling",
  "how-aggressive-should-my-position-be",
  "bike-fit-comfort-vs-power",
  "aero-without-losing-power",
  "does-bike-fit-change-with-age",
  "womens-bike-fit",
  "handlebar-width-cycling",
  "handlebar-reach-and-stem",
  "indoor-training-position",
  "how-to-prevent-saddle-sores",
  "how-to-choose-the-right-saddle",
  "how-to-choose-a-saddle",
  "cycling-with-bad-knees",
] as const;

const governed = governedSlugs.map((slug) => {
  const page = ANSWER_PAGES.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Missing governed bike-fit answer: ${slug}`);
  return page;
});

describe("bike-fit answer extraction trust", () => {
  it("applies a reviewed override to every priority answer", () => {
    const sourceSlugs = [
      ...[...bikefitAnswers, ...highVolumeQuery4Answers]
        .filter((page) => page.cluster === "bikefit")
        .map((page) => page.slug),
      ...highVolumeQuery12Answers
        .filter((page) => page.slug === "cycling-with-bad-knees")
        .map((page) => page.slug),
      ...highVolumeQuery14Answers
        .filter((page) => page.slug === "how-to-manage-knee-pain-from-cycling")
        .map((page) => page.slug),
    ];

    expect(new Set(governedSlugs)).toEqual(new Set(sourceSlugs));
    expect(governed).toHaveLength(governedSlugs.length);

    for (const page of governed) {
      expect(page.updatedDate).toBe("2026-08-25");
      expect(page.reviewedBy).toContain("cited bike-fit");
      expect(page.keyTakeaways.length).toBeGreaterThanOrEqual(4);
      expect(page.practicalApplication.length).toBeGreaterThanOrEqual(3);
      expect(page.commonMistakes.length).toBeGreaterThanOrEqual(3);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);

      const answerWords = page.directAnswer.split(/\s+/).filter(Boolean).length;
      expect(answerWords).toBeGreaterThanOrEqual(40);
      expect(answerWords).toBeLessThanOrEqual(90);
    }
  });

  it("removes unsupported diagnoses, guarantees and calendar rules from rendered data", () => {
    const rendered = JSON.stringify(governed);

    for (const staleClaim of [
      "Cycling knee pain is caused by bike fit issues in roughly 80% of cases",
      "Most cases resolve with a saddle height change of 5–10mm",
      "A professional bike fit diagnoses which of these is the culprit in under two hours",
      "Pain behind the knee: saddle almost certainly too high",
      "find you 10-20 watts of free power",
      "Many riders gain 10–20 watts",
      "Review your bike fit every 2–3 years",
      "Every 2–3 years is a sensible baseline review",
      "Most amateur road cyclists benefit from bars 2-6 cm below the saddle",
      "If it drops well in front, your saddle is too far forward",
      "Saddle 5mm too high causes knee pain",
      "Lower back pain while cycling comes from two sources",
      "Numb hands while cycling come from one primary cause",
      "Numb feet while cycling are usually caused by one of three things",
      "About 80% of bike-related pain",
      "The eight most common signs your bike does not fit properly are",
      "your flexibility at 45 is not your flexibility at 35",
      "Go too narrow and you pay for it",
      "20–40mm narrower than shoulder width often costs nothing in power",
      "women typically need narrower handlebars",
      "a 5–10mm bar rise takes a little weight off",
      "Roughly 80% of the drag on a bike at speed is you",
      "change and shower within 30 minutes",
      "Most recurring saddle sores resolve",
      "A saddle nose angled upward even 2–3 degrees dramatically increases",
      "Sit bone width plus 20–30mm is the starting number",
      "More padding usually means more pressure",
      "A central cut-out or channel relieves perineal pressure for most riders",
      "Dr Andy Pruitt's clinical data from 30,000+ bike fits",
      "85% of cycling knee pain resolves",
      "Reduce training volume by 30% for two to three weeks",
      "Nine times out of ten, a small adjustment",
      "A professional bike fit is essential for riders with existing knee conditions",
    ]) {
      expect(rendered).not.toContain(staleClaim);
    }
  });

  it("publishes the central evidence limitations in extractable answers", () => {
    const bySlug = Object.fromEntries(governed.map((page) => [page.slug, page]));

    expect(bySlug["how-to-set-saddle-height"].evidenceNote).toContain(
      "PMID 32022807",
    );
    expect(bySlug["how-to-set-cleat-position"].evidenceNote).toContain(
      "PMID 35129429",
    );
    expect(bySlug["should-i-switch-to-shorter-cranks"].evidenceNote).toContain(
      "PMID 40342376",
    );
    expect(bySlug["why-do-my-knees-hurt-cycling"].evidenceNote).toContain(
      "PMID 35151569",
    );
    expect(bySlug["how-often-update-bike-fit"].directAnswer).toContain(
      "There is no evidence-backed rule",
    );
    expect(bySlug["cycling-with-bad-knees"].evidenceNote).toContain(
      "PMID 33167714",
    );
    expect(
      bySlug["how-to-manage-knee-pain-from-cycling"].directAnswer,
    ).toContain("Pain location helps describe the symptom");
    expect(
      bySlug["how-to-adjust-handlebar-height-cycling"].directAnswer,
    ).toContain("Carbon steerers, integrated cockpits");
  });

  it("routes priority AI questions and discovery updates to reviewed answers", () => {
    const prompts = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "scripts/ai-benchmark-prompts.json"),
        "utf8",
      ),
    );
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 202,
          target_page: "/answers/how-often-update-bike-fit",
        }),
        expect.objectContaining({
          id: 203,
          target_page: "/answers/why-do-my-knees-hurt-cycling",
        }),
        expect.objectContaining({
          id: 204,
          target_page: "/answers/should-i-switch-to-shorter-cranks",
        }),
      ]),
    );

    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    for (const slug of governedSlugs) {
      expect(indexNowSource).toContain(`"${slug}"`);
    }
  });
});
