"use client";

import { PostData } from "@/lib/posts";
import PostRow from "@/components/PostRow";

/**
 * 전체 글 목록.
 * 2026-06-28: 카테고리 페이지(CategoryLanding)와 일관성 통일 — 10개씩 페이지네이션을
 * 제거하고 한 화면에 전체를 표시한다(다른 카테고리 목록과 동일 동작).
 */
export default function BlogListClient({ posts }: { posts: PostData[] }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl text-slate-200">📝</div>
          <p className="text-slate-400">아직 등록된 글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
