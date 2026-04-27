import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * EpisodePlaylistCTA — for podcast episode pages and topic hubs.
 * Captures email and triggers the curated-playlist Beehiiv
 * automation. The optional `topic` prop is stored on the subscriber
 * as `playlist_topic` so multiple playlist offers can coexist
 * without colliding in Beehiiv.
 */
export interface EpisodePlaylistCTAProps {
  /**
   * The playlist topic — usually the same as the article/topic hub
   * (e.g. "Sleep & recovery", "Pogačar episodes"). Used in the
   * heading and stored as a custom field on the subscriber.
   */
  topic?: string;
  source?: string;
  className?: string;
}

export function EpisodePlaylistCTA({
  topic,
  source = "episode-playlist-cta",
  className,
}: EpisodePlaylistCTAProps) {
  const heading = topic
    ? `GET THE CURATED ${topic.toUpperCase()} PLAYLIST`
    : "GET THIS CURATED PLAYLIST";

  const subheading = topic
    ? `Hand-picked Roadman episodes on ${topic.toLowerCase()}, in the order we'd actually want a member to listen. One email, every link.`
    : "Hand-picked Roadman episodes on this topic, in the order we'd actually want a member to listen. One email, every link.";

  return (
    <LeadMagnetCapture
      magnet="episode-playlist"
      eyebrow="LISTEN IN ORDER"
      heading={heading}
      subheading={subheading}
      buttonText="EMAIL THE PLAYLIST"
      source={source}
      context={topic}
      className={className}
    />
  );
}
