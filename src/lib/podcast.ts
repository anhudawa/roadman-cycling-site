import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { type ContentPillar, type EpisodeType } from "@/types";

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

export interface EpisodeFrontmatter {
  title: string;
  episodeNumber: number;
  guest?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  spotifyId?: string;
  youtubeId?: string;
  pillar: ContentPillar;
  type: EpisodeType;
  keywords: string[];
  seoTitle?: string;
  seoDescription: string;
}

export interface EpisodeMeta extends EpisodeFrontmatter {
  slug: string;
}

export interface EpisodeFull extends EpisodeMeta {
  content: string;
}

function ensurePodcastDir() {
  if (!fs.existsSync(PODCAST_DIR)) {
    fs.mkdirSync(PODCAST_DIR, { recursive: true });
  }
}

export function getAllEpisodes(): EpisodeMeta[] {
  ensurePodcastDir();
  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));

  const episodes = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(PODCAST_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    const frontmatter = data as EpisodeFrontmatter;

    return {
      ...frontmatter,
      slug,
    };
  });

  return episodes.sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getEpisodeBySlug(slug: string): EpisodeFull | null {
  ensurePodcastDir();
  const filePath = path.join(PODCAST_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as EpisodeFrontmatter;

  return {
    ...frontmatter,
    slug,
    content,
  };
}

export function getAllEpisodeSlugs(): string[] {
  ensurePodcastDir();
  return fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
