export interface RepurposeState {
  lastRepurposeDate: string;
  processedEpisodeSlugs: string[];
}

export interface BlogOutput {
  mdxContent: string;
  slug: string;
}

export interface TwitterThread {
  tweets: { text: string; index: number }[];
  episodeSlug: string;
  generatedAt: string;
}

export interface InstagramPost {
  caption: string;
  hashtags: string[];
  episodeSlug: string;
  generatedAt: string;
}

export interface LinkedInPost {
  post: string;
  episodeSlug: string;
  generatedAt: string;
}

export interface FacebookPost {
  post: string;
  angle: string;
  episodeSlug: string;
  generatedAt: string;
}

export interface SocialOutput {
  twitter: TwitterThread;
  instagram: InstagramPost;
  linkedin: LinkedInPost;
  facebook: FacebookPost;
}

export interface ExtractedQuote {
  text: string;
  speaker: string;
  context: string;
}

export interface QuoteCardPaths {
  squarePath: string;
  landscapePath: string;
}

export interface RepurposeResult {
  blog: BlogOutput | null;
  social: SocialOutput | null;
  quotes: { extracted: ExtractedQuote[]; cardPaths: QuoteCardPaths[] } | null;
}

export interface EpisodeInput {
  slug: string;
  title: string;
  episodeNumber: number;
  guest?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  youtubeId?: string;
  pillar: string;
  type: string;
  keywords: string[];
  seoDescription: string;
  transcript: string;
}
