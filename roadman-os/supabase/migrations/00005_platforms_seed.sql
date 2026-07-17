-- ==========================================================================
-- Roadman OS — Platform Seed Data
-- Seeds the 10 core Roadman Cycling distribution platforms.
-- ==========================================================================

INSERT INTO platforms (name, slug, icon_url, base_url, supported_types, is_active)
VALUES
  (
    'YouTube (Main)',
    'youtube-main',
    NULL,
    'https://youtube.com/@theroadmanpodcast',
    ARRAY['podcast_episode','youtube_video','live_stream','webinar']::asset_type[],
    TRUE
  ),
  (
    'YouTube (Clips)',
    'youtube-clips',
    NULL,
    'https://youtube.com/@roadmanpodcastclips',
    ARRAY['clip','short']::asset_type[],
    TRUE
  ),
  (
    'Instagram',
    'instagram',
    NULL,
    'https://instagram.com/roadman.cycling',
    ARRAY['social_post','reel','story','carousel','quote_card','infographic']::asset_type[],
    TRUE
  ),
  (
    'Facebook',
    'facebook',
    NULL,
    'https://facebook.com/RoadmanCycling',
    ARRAY['social_post','youtube_video','live_stream','blog_post']::asset_type[],
    TRUE
  ),
  (
    'TikTok',
    'tiktok',
    NULL,
    'https://tiktok.com/@roadmancycling',
    ARRAY['reel','short','clip']::asset_type[],
    TRUE
  ),
  (
    'Twitter/X',
    'twitter-x',
    NULL,
    'https://x.com/roadmancycling',
    ARRAY['social_post','thread','quote_card']::asset_type[],
    TRUE
  ),
  (
    'LinkedIn',
    'linkedin',
    NULL,
    'https://linkedin.com/company/roadmancycling',
    ARRAY['social_post','blog_post','newsletter','carousel']::asset_type[],
    TRUE
  ),
  (
    'Beehiiv Newsletter',
    'beehiiv-newsletter',
    NULL,
    'https://roadmancycling.beehiiv.com',
    ARRAY['newsletter']::asset_type[],
    TRUE
  ),
  (
    'Skool Community',
    'skool-community',
    NULL,
    'https://www.skool.com/roadmancycling',
    ARRAY['blog_post','course_module']::asset_type[],
    TRUE
  ),
  (
    'Website (Blog)',
    'website-blog',
    NULL,
    'https://roadmancycling.com/blog',
    ARRAY['blog_post','podcast_episode','youtube_video']::asset_type[],
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;
