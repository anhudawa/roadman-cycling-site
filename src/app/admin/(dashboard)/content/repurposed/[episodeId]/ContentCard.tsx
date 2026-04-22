"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { approveContent, rejectContent } from "../actions";
import ChatPanel from "./ChatPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentPiece = {
  id: number;
  episodeId: number;
  contentType: string;
  content: string;
  status: string | null;
  version: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  chatMessageCount: number;
};

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "pending";
  const styles: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10",
    approved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
    amended: "text-blue-400 bg-blue-400/10",
  };
  const style = styles[s] ?? "text-foreground-subtle bg-white/5";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Content-type badge
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog",
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  "quote-card": "Quote Card",
  "episode-page": "Episode Page",
  "episode-meta": "SEO / Meta",
  "episode-citation": "AI Citation",
};

function TypeBadge({ contentType }: { contentType: string }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-foreground-muted uppercase tracking-wide">
      {TYPE_LABELS[contentType] ?? contentType}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Per-type content renderers
// ---------------------------------------------------------------------------

function BlogContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  let title = "";
  let excerpt = "";
  let body = content;
  let seoDescription = "";
  try {
    const parsed = JSON.parse(content);
    title = parsed.title ?? "";
    excerpt = parsed.excerpt ?? "";
    body = parsed.body ?? content;
    seoDescription = parsed.seoDescription ?? "";
  } catch {
    // plain text blog content
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  const preview = body.slice(0, 500);
  const hasMore = body.length > 500;

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-off-white">{title}</p>}
      {excerpt && <p className="text-xs text-foreground-muted italic">{excerpt}</p>}
      {seoDescription && (
        <p className="text-xs text-foreground-subtle">Meta: {seoDescription}</p>
      )}
      <p className="text-xs text-foreground-subtle">{words} words</p>
      <div className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">
        {expanded ? body : preview}
        {hasMore && !expanded && <span className="text-foreground-subtle">…</span>}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-off-white hover:text-white transition-colors underline"
        >
          {expanded ? "Show less" : "Show full"}
        </button>
      )}
    </div>
  );
}

function TwitterContent({ content }: { content: string }) {
  let tweets: string[] = [];
  try {
    const parsed = JSON.parse(content);
    const raw: unknown[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed.tweets) ? parsed.tweets : [parsed];
    tweets = raw.map((t) =>
      typeof t === "string" ? t : typeof t === "object" && t !== null && "text" in t ? String((t as { text: string }).text) : String(t)
    );
  } catch {
    tweets = [content];
  }

  return (
    <ol className="space-y-3">
      {tweets.map((tweet, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 text-xs font-mono text-foreground-subtle pt-0.5 w-5 text-right">
            {i + 1}.
          </span>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-foreground-muted leading-relaxed">{tweet}</p>
            <p className="text-xs text-foreground-subtle">{tweet.length} chars</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function InstagramContent({ content }: { content: string }) {
  let caption = "";
  let hashtags: string[] = [];
  try {
    const parsed = JSON.parse(content);
    caption = parsed.caption ?? parsed.text ?? String(parsed);
    hashtags = parsed.hashtags ?? [];
    // If hashtags is a string, split it
    if (typeof hashtags === "string") {
      hashtags = (hashtags as string).split(/\s+/).filter((h) => h.startsWith("#"));
    }
  } catch {
    caption = content;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">{caption}</p>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-300"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkedInContent({ content }: { content: string }) {
  let text = "";
  try {
    const parsed = JSON.parse(content);
    text = parsed.post ?? parsed.text ?? parsed.content ?? String(parsed);
  } catch {
    text = content;
  }

  return (
    <div className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed space-y-3">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function FacebookContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  let angle = "";
  let text = "";
  try {
    const parsed = JSON.parse(content);
    angle = parsed.angle ?? parsed.hook ?? "";
    text = parsed.post ?? parsed.text ?? parsed.content ?? String(parsed);
  } catch {
    text = content;
  }

  const preview = text.slice(0, 300);
  const hasMore = text.length > 300;

  return (
    <div className="space-y-2">
      {angle && (
        <p className="text-xs text-foreground-subtle italic">
          Angle: {angle}
        </p>
      )}
      <div className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">
        {expanded ? text : preview}
        {hasMore && !expanded && <span className="text-foreground-subtle">…</span>}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-off-white hover:text-white transition-colors underline"
        >
          {expanded ? "Show less" : "Show full"}
        </button>
      )}
    </div>
  );
}

function EpisodePageContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.slice(0, 600);
  const hasMore = content.length > 600;

  return (
    <div className="space-y-2">
      <div className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">
        {expanded ? content : preview}
        {hasMore && !expanded && <span className="text-foreground-subtle">...</span>}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-off-white hover:text-white transition-colors underline"
        >
          {expanded ? "Show less" : "Show full"}
        </button>
      )}
    </div>
  );
}

function EpisodeMetaContent({ content }: { content: string }) {
  let seoTitle = "";
  let metaDescription = "";
  try {
    const parsed = JSON.parse(content);
    seoTitle = parsed.seoTitle ?? "";
    metaDescription = parsed.metaDescription ?? "";
  } catch {
    return <p className="text-sm text-foreground-muted whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-foreground-subtle mb-1">SEO Title</p>
        <p className="text-sm text-off-white font-medium">{seoTitle}</p>
      </div>
      <div>
        <p className="text-xs text-foreground-subtle mb-1">Meta Description ({metaDescription.length} chars)</p>
        <p className="text-sm text-foreground-muted">{metaDescription}</p>
      </div>
    </div>
  );
}

function EpisodeCitationContent({ content }: { content: string }) {
  return (
    <div className="text-sm text-foreground-muted leading-relaxed border-l-2 border-[var(--color-border-strong)] pl-3">
      {content}
    </div>
  );
}

function QuoteCardContent({ content }: { content: string }) {
  let quote = "";
  let speaker = "";
  let context = "";
  try {
    const parsed = JSON.parse(content);
    quote = parsed.quote ?? parsed.text ?? String(parsed);
    speaker = parsed.speaker ?? parsed.attribution ?? "";
    context = parsed.context ?? parsed.description ?? "";
  } catch {
    quote = content;
  }

  return (
    <div className="space-y-2">
      <blockquote className="text-sm text-off-white italic leading-relaxed border-l-2 border-[var(--color-border-strong)] pl-3">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {speaker && (
        <p className="text-xs text-foreground-muted font-medium">— {speaker}</p>
      )}
      {context && (
        <p className="text-xs text-foreground-subtle">{context}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action buttons
// ---------------------------------------------------------------------------

function ActionButtons({
  contentId,
  episodeId,
  currentStatus,
  currentContent,
  contentType,
  chatOpen,
  onToggleChat,
  onImageUploaded,
}: {
  contentId: number;
  episodeId: number;
  currentStatus: string | null;
  currentContent: string;
  contentType: string;
  chatOpen: boolean;
  onToggleChat: () => void;
  onImageUploaded?: (imagePath: string) => void;
}) {
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("contentId", String(contentId));

      const res = await fetch("/api/admin/content/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error);
      }

      const { imagePath } = await res.json();
      onImageUploaded?.(imagePath);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const PUBLISH_MESSAGES: Record<string, string> = {
    "episode-page": "Episode page is now live on the site",
    "blog": "Blog post is now live on the site",
  };

  const handleApprove = () => {
    setOptimisticStatus("approved");
    setPublishedMessage(null);
    startTransition(async () => {
      try {
        await approveContent(contentId);
        const msg = PUBLISH_MESSAGES[contentType];
        if (msg) setPublishedMessage(msg);
      } catch {
        setOptimisticStatus(currentStatus);
      }
    });
  };

  const handleReject = () => {
    setOptimisticStatus("rejected");
    startTransition(async () => {
      try {
        await rejectContent(contentId);
      } catch {
        setOptimisticStatus(currentStatus);
      }
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
      {publishedMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-green-400 text-sm">&#10003;</span>
          <span className="text-sm text-green-400">{publishedMessage}</span>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending || optimisticStatus === "approved"}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          optimisticStatus === "approved"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-white/5 text-foreground-muted hover:bg-green-500/15 hover:text-green-400 border border-white/10 hover:border-green-500/20"
        }`}
      >
        {optimisticStatus === "approved" ? "Approved" : "Approve"}
      </button>

      <button
        type="button"
        onClick={handleReject}
        disabled={isPending || optimisticStatus === "rejected"}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          optimisticStatus === "rejected"
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-white/5 text-foreground-muted hover:bg-red-500/15 hover:text-red-400 border border-white/10 hover:border-red-500/20"
        }`}
      >
        {optimisticStatus === "rejected" ? "Rejected" : "Reject"}
      </button>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(currentContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border-white/10"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      {contentType === "blog" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border-white/10 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onToggleChat}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ml-auto ${
          chatOpen
            ? "bg-[#F16363]/20 text-[#F16363] border-[#F16363]/30"
            : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border-white/10"
        }`}
      >
        Chat
      </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ContentCard export
// ---------------------------------------------------------------------------

export default function ContentCard({
  piece,
  episodeId,
}: {
  piece: ContentPiece;
  episodeId: number;
}) {
  const [content, setContent] = useState(piece.content);
  const [chatOpen, setChatOpen] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleContentUpdated = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleImageUploaded = useCallback((imagePath: string) => {
    setFeaturedImage(imagePath);
    // Store image path in the blog content JSON
    try {
      const parsed = JSON.parse(content);
      parsed.featuredImage = imagePath;
      setContent(JSON.stringify(parsed));
    } catch {
      // not JSON content, ignore
    }
  }, [content]);

  function renderContent() {
    switch (piece.contentType) {
      case "blog":
        return <BlogContent content={content} />;
      case "twitter":
        return <TwitterContent content={content} />;
      case "instagram":
        return <InstagramContent content={content} />;
      case "linkedin":
        return <LinkedInContent content={content} />;
      case "facebook":
        return <FacebookContent content={content} />;
      case "quote-card":
        return <QuoteCardContent content={content} />;
      case "episode-page":
        return <EpisodePageContent content={content} />;
      case "episode-meta":
        return <EpisodeMetaContent content={content} />;
      case "episode-citation":
        return <EpisodeCitationContent content={content} />;
      default:
        return (
          <p className="text-sm text-foreground-muted whitespace-pre-wrap">{content}</p>
        );
    }
  }

  return (
    <div className="rounded-[var(--radius-admin-lg)] bg-[var(--color-raised)] border border-[var(--color-border)] flex flex-col">
      <div className="p-5 flex flex-col gap-3">
        {/* Card header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TypeBadge contentType={piece.contentType} />
          <StatusBadge status={piece.status} />
        </div>

        {/* Content */}
        <div className="flex-1">{renderContent()}</div>

        {/* Version note */}
        {piece.version > 1 && (
          <p className="text-xs text-foreground-subtle">v{piece.version}</p>
        )}

        {/* Featured image preview */}
        {featuredImage && (
          <div className="mt-2">
            <p className="text-xs text-foreground-subtle mb-1">Featured Image</p>
            <img
              src={featuredImage}
              alt="Featured"
              className="w-full max-h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <ActionButtons
          contentId={piece.id}
          episodeId={episodeId}
          currentStatus={piece.status}
          currentContent={content}
          contentType={piece.contentType}
          chatOpen={chatOpen}
          onToggleChat={() => {
            const opening = !chatOpen;
            setChatOpen(opening);
            if (opening) {
              setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
            }
          }}
          onImageUploaded={handleImageUploaded}
        />
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div ref={chatRef}>
          <ChatPanel
            contentId={piece.id}
            onContentUpdated={handleContentUpdated}
          />
        </div>
      )}
    </div>
  );
}
