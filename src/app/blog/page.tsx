import { Metadata } from 'next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSortedPostsData } from "@/lib/posts";
import BlogListClient from "@/components/BlogListClient";

export const metadata: Metadata = {
  title: "팁픽 인사이트 | 스마트한 수도권 생활 가이드 - 팁픽(Tip-Pick)",
  description: "데이터는 공공기관이, 꿀팁은 팁픽이. 팁픽 에디터가 전하는 생생한 혜택 정보와 생활 꿀팁을 확인하세요.",
  openGraph: {
    title: "팁픽 인사이트 | 스마트한 수도권 생활 가이드 - 팁픽(Tip-Pick)",
    description: "팁픽 에디터가 엄선한 유용한 생활 정보와 인사이트를 만나보세요.",
    url: "https://tip-pick.com/blog/",
  }
};

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-10">

        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            💡 팁픽 인사이트
          </div>

          <h2 className="text-5xl md:text-6xl tracking-tight leading-[1.15]">
            <span className="font-black text-slate-900">팁픽</span>{" "}
            <span
              className="font-serif italic font-semibold text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00CCFF 0%, #33FF99 100%)" }}
            >
              인사이트
            </span>
          </h2>

          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            수도권 생활의 질을 높이는 한 끗 차이,{" "}
            <span className="font-black text-slate-700">팁픽이 엄선한 진짜 정보들</span>만 모았습니다.
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
