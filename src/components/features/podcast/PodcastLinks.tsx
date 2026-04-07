"use client";

interface PodcastLinksProps {
  spotifyId?: string;
  episodeTitle: string;
  className?: string;
}

export function PodcastLinks({
  spotifyId,
  episodeTitle,
  className = "",
}: PodcastLinksProps) {
  // Roadman Cycling Podcast show-level links
  const APPLE_PODCASTS_URL =
    "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549";
  const SPOTIFY_SHOW_URL =
    "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC";
  const YOUTUBE_URL = "https://youtube.com/@theroadmanpodcast";

  const spotifyEpisodeUrl = spotifyId
    ? `https://open.spotify.com/episode/${spotifyId}`
    : SPOTIFY_SHOW_URL;

  const links = [
    {
      label: "Spotify",
      href: spotifyEpisodeUrl,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      ),
    },
    {
      label: "Apple Podcasts",
      href: APPLE_PODCASTS_URL,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.6-.12 1.2-.72 1.32-.6.12-1.2-.12-1.32-.72-.264-1.368-.816-2.4-1.74-3.36-1.32-1.392-2.94-2.088-4.92-2.088-3.456 0-6.48 3.024-6.48 6.48 0 1.584.576 3.024 1.536 4.176.36.432.312 1.08-.12 1.44-.432.36-1.08.312-1.44-.12C3.744 15.264 2.904 13.392 2.904 11.4c0-4.464 3.72-8.832 8.96-8.832zM11.7 6.744c1.584 0 3.072.624 4.2 1.776 1.032 1.056 1.584 2.4 1.584 3.84 0 .984-.264 1.968-.768 2.856-.36.6-1.08.84-1.68.48-.6-.36-.84-1.08-.48-1.68.288-.504.432-1.056.432-1.632 0-.912-.36-1.776-.984-2.424-.72-.72-1.68-1.104-2.712-1.08-2.064.048-3.648 1.776-3.648 3.96 0 .816.24 1.608.672 2.28.36.6.12 1.32-.48 1.68-.6.36-1.32.12-1.68-.48-.672-1.08-1.008-2.28-1.008-3.48.024-3.36 2.784-6.12 6.552-6.096zM12 10.8c.72 0 1.2.504 1.2 1.2 0 .168-.024.312-.072.456l-.696 4.416c-.096.6-.504.888-1.056.888-.552 0-.96-.288-1.056-.888l-.696-4.416c-.048-.144-.072-.288-.072-.456 0-.696.48-1.2 1.2-1.2h1.248zm-.624 8.568c0-.72.576-1.296 1.296-1.296s1.296.576 1.296 1.296-.576 1.296-1.296 1.296-1.296-.576-1.296-1.296z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: YOUTUBE_URL,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={className}>
      <p className="text-xs text-foreground-subtle uppercase tracking-widest font-heading mb-3">
        Listen on
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Listen to ${episodeTitle} on ${link.label}`}
            className="
              inline-flex items-center gap-2 px-4 py-2.5
              bg-white/5 border border-white/10 rounded-lg
              text-sm text-foreground-muted font-body
              hover:bg-white/10 hover:border-white/20 hover:text-off-white
              transition-all
            "
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
