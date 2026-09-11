/** Selected strength pages have one product next step and a stable source ID. */
export const GOOD_LEGS_EDITORIAL_SOURCES: Readonly<Record<string, string>> = {
  "the-science-of-getting-faster-after-40-dr-andy-galpin": "andy-galpin-episode",
  "ep-2054-i-tried-keegan-swensons-insane-strength-routine-heres-what-n": "art-oconnor-episode",
  "why-cyclists-need-to-strength-train-with-chris-peden": "chris-peden-episode",
  "andy-galpin-fast-twitch-fibres-cyclist-after-40": "galpin-strength-guide",
  "art-oconnor-strength-training-cyclists": "art-strength-guide",
  "strength-training-cyclists-over-40-what-works": "strength-over-40-guide",
  "cycling-strength-training-12-week-beginner-plan": "beginner-strength-plan",
  "cycling-strength-training-guide": "strength-guide",
  "why-were-building-good-legs": "goodlegs-origin",
};

export function getGoodLegsEditorialSource(slug: string): string | undefined {
  return Object.hasOwn(GOOD_LEGS_EDITORIAL_SOURCES, slug)
    ? GOOD_LEGS_EDITORIAL_SOURCES[slug]
    : undefined;
}
