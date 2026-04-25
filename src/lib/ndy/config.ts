// NDY Sales Assistant configuration
// URLs that depend on external services go here so they can be updated in one place.

export const NDY_CONFIG = {
  // Skool checkout links
  skoolStandard: 'https://www.skool.com/roadmancycling/about',
  skoolPremium: 'https://www.skool.com/roadmancycling/about',

  // Calendly links — update when account is created
  // Falls back to /contact until Calendly is configured
  calendlyInnerCircle: process.env.NEXT_PUBLIC_CALENDLY_INNER_CIRCLE || '/contact',
  calendlyPremium: process.env.NEXT_PUBLIC_CALENDLY_PREMIUM || '/contact',

  // Beehiiv — nurture sequence for not-a-fit prospects
  beehiivApiKey: process.env.BEEHIIV_API_KEY || '',
  beehiivPublicationId: process.env.BEEHIIV_PUBLICATION_ID || '',

  // Contact fallback
  contactPage: '/contact',

  // Free resources link
  freeResources: '/community/clubhouse',
} as const;
