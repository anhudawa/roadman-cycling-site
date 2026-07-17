-- Add SEO metadata columns to content_clusters for cluster management
ALTER TABLE content_clusters
  ADD COLUMN target_query TEXT,
  ADD COLUMN related_queries TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN status TEXT NOT NULL DEFAULT 'planned',
  ADD COLUMN archived_at TIMESTAMPTZ;

CREATE INDEX idx_clusters_status ON content_clusters(status);
CREATE INDEX idx_clusters_archived ON content_clusters(archived_at);
