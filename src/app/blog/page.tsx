import { Metadata } from 'next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSortedPostsData } from "@/lib/posts";
import BlogListClient from "@/components/BlogListClient";
import { isPostCategoryLive } from "@/config/categories";

export const metadata: Metadata = {
  title: "전체 글 — 경제·지원금·생활정보 | 팁픽(Tip-Pick)",
  description: "팁픽의 모든 글 — 정부 지원금, 경제·세금, 실생활 정보를 한곳에서 확인하세요.",
  openGraph: {
    title: "전체 글 — 경제·지원금·생활정보 | 팁픽(Tip-Pick)",
    description: "정부 지원금·경제·생활정보를 한곳에서 확인하세요.",
    url: "https://tip-pick.com/blog/",
  }
};

export default function BlogListPage() {
  const posts = getSortedPostsData().filter((p) => isPostCategoryLive(p.category));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-4 py-12 space-y-10">

        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-200 bg-cyan-50 text-brand-dark">
            📝 전체 글
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            전체 글
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            경제·지원금·생활정보 —{" "}
            <span className="font-black text-slate-700">팁픽이 엄선한 진짜 정보</span>만 모았습니다.
          </p>

          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 rounded-full" style={{ background: "linear-gradient(to right, transparent, #00CCFF)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#00CCFF", boxShadow: "0 0 8px rgba(0,204,255,0.8)" }} />
            <div className="h-0.5 w-16 rounded-full" style={{ background: "linear-gradient(to left, transparent, #33FF99)" }} />
          </div>
        </section>

        {/* Blog List — 가로형 1열 리스트 (10개씩 페이징) */}
        <BlogListClient posts={posts} />
      </main>

      <Footer />
    </div>
  );
}
