"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatVideoTime, getVideoMomentHref, getYouTubeEmbedUrl, parseVideoTime } from "@/lib/seo/video-seek";

interface WatchVideoProps {
  youtubeId: string;
  title: string;
  watchUrl: string;
}

export function WatchVideoFrame({ youtubeId, title, start = 0 }: Omit<WatchVideoProps, "watchUrl"> & { start?: number }) {
  return (
    <div id="video" className="relative aspect-video min-h-[202px] w-full min-w-0 scroll-mt-24 overflow-hidden rounded-xl border border-white/10 bg-black shadow-[var(--shadow-elevated)]">
      <iframe
        src={getYouTubeEmbedUrl(youtubeId, start)}
        width="100%"
        height="100%"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        title={`Watch ${title}`}
      />
    </div>
  );
}

export function WatchVideo({ youtubeId, title, watchUrl }: WatchVideoProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const start = parseVideoTime(searchParams.get("t")) ?? 0;
  const [error, setError] = useState<string | null>(null);
  const momentHref = getVideoMomentHref(watchUrl, start);

  function jump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("time") ?? "").trim();
    const seconds = parseVideoTime(value);
    if (seconds === null) {
      setError("Enter seconds, minutes:seconds or hours:minutes:seconds, for example 12:30.");
      return;
    }
    setError(null);
    const target = new URL(getVideoMomentHref(watchUrl, seconds));
    router.push(`${target.pathname}${target.search}${target.hash}`, { scroll: false });
  }

  return (
    <>
      <WatchVideoFrame youtubeId={youtubeId} title={title} start={start} />
      <form onSubmit={jump} className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="video-time" className="mb-2 block text-sm text-off-white">Go to a time in this interview</label>
          <input key={start} id="video-time" name="time" type="text" defaultValue={formatVideoTime(start)}
            aria-describedby={error ? "video-time-error" : undefined} aria-invalid={Boolean(error)}
            className="w-36 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-off-white focus:border-coral focus:outline-none" />
        </div>
        <button type="submit" className="rounded-lg border border-coral px-4 py-2 text-coral hover:bg-coral/10">Go to time</button>
        <a href={momentHref} className="py-2 text-sm text-coral underline underline-offset-4">Link to {formatVideoTime(start)}</a>
        {start > 0 && <a href={`${watchUrl}#video`} className="py-2 text-sm text-foreground-muted underline underline-offset-4">Start from the beginning</a>}
        {error && <p id="video-time-error" role="alert" className="w-full text-sm text-coral">{error}</p>}
      </form>
      <p className="mt-2 text-xs text-foreground-subtle">Use the time link to share a specific passage. Press play in the video to watch.</p>
    </>
  );
}
