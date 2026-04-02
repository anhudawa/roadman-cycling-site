"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";

interface BlogContentProps {
  source: MDXRemoteSerializeResult;
}

export function BlogContent({ source }: BlogContentProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <MDXRemote {...source} />
    </div>
  );
}
