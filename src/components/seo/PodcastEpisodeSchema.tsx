import { JsonLd } from "./JsonLd";

interface PodcastEpisodeSchemaProps {
  title: string;
  description: string;
  episodeNumber: number;
  datePublished: string;
  /** Duration in "MM:SS" or "H:MM:SS" format */
  duration: string;
  url: string;
  image?: string;
  spotifyId?: string;
  guest?: string;
  guestCredential?: string;
}

/**
 * Converts "MM:SS" or "H:MM:SS" to ISO 8601 duration.
 */
function toIsoDuration(duration: string): string {
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  return `PT${parts[0]}M`;
}

/**
 * PodcastEpisode structured data for Google rich results.
 * Uses schema.org PodcastEpisode type with PodcastSeries link.
 */
export function PodcastEpisodeSchema({
  title,
  description,
  episodeNumber,
  datePublished,
  duration,
  url,
  image,
  spotifyId,
  guest,
  guestCredential,
}: PodcastEpisodeSchemaProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        name: title,
        url,
        description,
        episodeNumber,
        datePublished,
        timeRequired: toIsoDuration(duration),
        ...(image && { image }),
        partOfSeries: {
          "@type": "PodcastSeries",
          name: "The Roadman Cycling Podcast",
          url: "https://roadmancycling.com/podcast",
        },
        ...(spotifyId && {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: `https://open.spotify.com/episode/${spotifyId}`,
          },
        }),
        ...(guest && {
          actor: {
            "@type": "Person",
            name: guest,
            description: guestCredential,
          },
        }),
      }}
    />
  );
}
