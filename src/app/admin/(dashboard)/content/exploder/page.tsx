"use client";

import { useState } from "react";

interface Video {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

interface Idea {
  title: string;
  hook: string;
}

interface GeneratedContent {
  linkedin: string;
  facebook: string;
  blog: { title: string; body: string };
  x_thread: string[];
}

type Step = "videos" | "ideas" | "content";
type ContentTab = "linkedin" | "facebook" | "blog" | "x_thread";

export default function ExploderPage() {
  const [step, setStep] = useState<Step>("videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>("linkedin");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch videos on first load
  const loadVideos = async () => {
    if (videos.length > 0) return;
    setLoading(true);
    setLoadingMsg("Fetching videos from YouTube...");
    setError("");
    try {
      const res = await fetch("/api/admin/exploder/videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data.videos);
      setFilteredVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  // Initial load
  if (videos.length === 0 && !loading && !error) {
    loadVideos();
  }

  const handleSearch = (q: string) => {
    setSearch(q);
    if (!q.trim()) {
      setFilteredVideos(videos);
    } else {
      const lower = q.toLowerCase();
      setFilteredVideos(
        videos.filter((v) => v.title.toLowerCase().includes(lower))
      );
    }
  };

  const selectVideo = async (video: Video) => {
    setSelectedVideo(video);
    setStep("ideas");
    setIdeas([]);
    setSelectedIdea(null);
    setContent(null);
    setLoading(true);
    setLoadingMsg("Generating 5 content ideas...");
    setError("");

    try {
      const res = await fetch("/api/admin/exploder/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoTitle: video.title }),
      });
      if (!res.ok) throw new Error("Failed to generate ideas");
      const data = await res.json();
      setIdeas(data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate ideas");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const selectIdea = async (idea: Idea) => {
    if (!selectedVideo) return;
    setSelectedIdea(idea);
    setStep("content");
    setContent(null);
    setActiveTab("linkedin");
    setLoading(true);
    setLoadingMsg("Writing LinkedIn, Facebook, Blog & X thread...");
    setError("");

    try {
      const res = await fetch("/api/admin/exploder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoTitle: selectedVideo.title, idea }),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      const data = await res.json();
      setContent(data.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate content"
      );
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const goBack = () => {
    if (step === "content") {
      setStep("ideas");
      setContent(null);
      setSelectedIdea(null);
    } else if (step === "ideas") {
      setStep("videos");
      setSelectedVideo(null);
      setIdeas([]);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getContentText = (tab: ContentTab): string => {
    if (!content) return "";
    switch (tab) {
      case "linkedin":
        return content.linkedin;
      case "facebook":
        return content.facebook;
      case "blog":
        return `${content.blog.title}\n\n${content.blog.body}`;
      case "x_thread":
        return content.x_thread.join("\n\n");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            CONTENT EXPLODER
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {step === "videos" && "Pick a YouTube video to explode into content"}
            {step === "ideas" && `5 angles from: ${selectedVideo?.title}`}
            {step === "content" && `Generated from: ${selectedIdea?.title}`}
          </p>
        </div>
        {step !== "videos" && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:text-off-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span
          className={
            step === "videos"
              ? "text-coral font-medium"
              : "text-foreground-subtle cursor-pointer hover:text-off-white"
          }
          onClick={() => step !== "videos" && setStep("videos")}
        >
          1. Pick Video
        </span>
        <svg className="w-3 h-3 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span
          className={
            step === "ideas"
              ? "text-coral font-medium"
              : step === "content"
                ? "text-foreground-subtle cursor-pointer hover:text-off-white"
                : "text-foreground-subtle/50"
          }
          onClick={() => step === "content" && setStep("ideas")}
        >
          2. Choose Angle
        </span>
        <svg className="w-3 h-3 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span
          className={
            step === "content"
              ? "text-coral font-medium"
              : "text-foreground-subtle/50"
          }
        >
          3. Copy Content
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-4 text-red-300 hover:text-red-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground-muted text-sm">{loadingMsg}</p>
          </div>
        </div>
      )}

      {/* Step 1: Video list */}
      {step === "videos" && !loading && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-3 bg-background-elevated border border-white/10 rounded-lg text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/50"
            />
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[calc(100vh-320px)] overflow-y-auto">
            {filteredVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => selectVideo(video)}
                className="flex gap-3 p-3 bg-background-elevated border border-white/5 rounded-lg hover:border-coral/30 transition-colors text-left group"
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-32 h-18 object-cover rounded shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-off-white font-medium line-clamp-2 group-hover:text-coral transition-colors">
                    {video.title}
                  </p>
                  <p className="text-xs text-foreground-subtle mt-1">
                    {new Date(video.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-foreground-subtle group-hover:text-coral shrink-0 mt-1 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            ))}
          </div>

          {filteredVideos.length === 0 && !loading && (
            <p className="text-center text-foreground-subtle py-8">
              {search ? "No videos match your search." : "No videos found."}
            </p>
          )}
        </div>
      )}

      {/* Step 2: Ideas */}
      {step === "ideas" && !loading && ideas.length > 0 && (
        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => selectIdea(idea)}
              className="w-full text-left p-4 bg-background-elevated border border-white/5 rounded-lg hover:border-coral/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-coral/10 text-coral text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm text-off-white font-medium group-hover:text-coral transition-colors">
                    {idea.title}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    {idea.hook}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-foreground-subtle group-hover:text-coral shrink-0 ml-auto mt-1 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Generated content */}
      {step === "content" && !loading && content && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-background-elevated rounded-lg p-1 border border-white/5">
            {(
              [
                { key: "linkedin", label: "LinkedIn" },
                { key: "facebook", label: "Facebook" },
                { key: "blog", label: "Blog" },
                { key: "x_thread", label: "X Thread" },
              ] as { key: ContentTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-coral text-white"
                    : "text-foreground-muted hover:text-off-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content display */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm text-foreground-muted tracking-wider uppercase">
                {activeTab === "x_thread"
                  ? "X THREAD"
                  : activeTab === "blog"
                    ? content.blog.title.toUpperCase()
                    : activeTab.toUpperCase() + " POST"}
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(getContentText(activeTab), activeTab)
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  copied === activeTab
                    ? "bg-green-500/10 text-green-400"
                    : "bg-coral/10 text-coral hover:bg-coral/20"
                }`}
              >
                {copied === activeTab ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap">
              {activeTab === "linkedin" && content.linkedin}
              {activeTab === "facebook" && content.facebook}
              {activeTab === "blog" && (
                <>
                  <h2 className="text-lg font-heading text-off-white mb-4">
                    {content.blog.title}
                  </h2>
                  {content.blog.body}
                </>
              )}
              {activeTab === "x_thread" && (
                <div className="space-y-3">
                  {content.x_thread.map((tweet, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white/[0.03] rounded-lg border border-white/5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-coral font-bold shrink-0">
                          {i + 1}/{content.x_thread.length}
                        </span>
                        <p className="text-sm">{tweet}</p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <span
                          className={`text-[10px] ${
                            tweet.length > 280
                              ? "text-red-400"
                              : "text-foreground-subtle"
                          }`}
                        >
                          {tweet.length}/280
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Regenerate */}
          <div className="flex gap-3">
            <button
              onClick={() => selectedIdea && selectIdea(selectedIdea)}
              className="px-4 py-2 bg-white/5 text-foreground-muted text-sm rounded-lg hover:bg-white/10 hover:text-off-white transition-colors"
            >
              Regenerate All
            </button>
            <button
              onClick={goBack}
              className="px-4 py-2 bg-white/5 text-foreground-muted text-sm rounded-lg hover:bg-white/10 hover:text-off-white transition-colors"
            >
              Pick Different Angle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
