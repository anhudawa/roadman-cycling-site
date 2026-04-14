interface AICitationBlockProps {
  children: React.ReactNode;
}

/**
 * Renders the AI-generated citation / attribution block that appears
 * at the end of podcast show-notes. Contains factual claims, credentials,
 * and data points referenced in the episode.
 */
export function AICitationBlock({ children }: AICitationBlockProps) {
  return (
    <aside
      className="rounded-lg p-5 my-8 border-l-3 border-foreground-subtle/40 bg-background-elevated/50 text-sm text-foreground-muted leading-relaxed"
      aria-label="Episode sources and citations"
    >
      {children}
    </aside>
  );
}
