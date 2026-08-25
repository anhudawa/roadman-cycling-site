export const BLOG_POSTS_PER_PAGE = 50;

export function getBlogArchivePageCount(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / BLOG_POSTS_PER_PAGE));
}

export function getBlogArchivePage<T>(posts: readonly T[], page: number): T[] {
  const start = (page - 1) * BLOG_POSTS_PER_PAGE;
  return posts.slice(start, start + BLOG_POSTS_PER_PAGE);
}

export function getBlogArchiveHref(page: number): string {
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}
