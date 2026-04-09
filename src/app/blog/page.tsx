import { Metadata } from 'next';
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSortedPostsData } from "@/lib/posts";

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

        {/* Blog List — 가로형 1열 리스트 */}
        <div className="max-w-3xl mx-auto space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-center bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-[0_4px_24px_rgba(0,204,255,0.14)] hover:border-[rgba(0,204,255,0.3)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* 왼쪽 정방형 썸네일 */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={post.image || '/images/blogs/korea-welfare-benefit-322.png'}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  style={{ filter: "saturate(1.05) brightness(0.96)" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/blogs/korea-welfare-benefit-322.png';
                  }}
                />
                {/* 민트 브랜드 톤 오버레이 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "rgba(0,204,255,0.07)" }}
                />
                <div
                  className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black shadow border border-white/50 tracking-wider"
                  style={{ color: "#00CCFF" }}
                >
                  {post.category}
                </div>
              </div>

              {/* 오른쪽 텍스트 */}
              <div className="flex-1 px-6 py-5 flex flex-col justify-between gap-2 min-h-[144px] md:min-h-[176px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span style={{ color: "#00AACC" }}>💡 팁픽 큐레이션</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-slate-800 line-clamp-2 leading-snug transition-colors group-hover:text-[#00CCFF]">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 5).map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="text-6xl text-slate-200">📝</div>
              <p className="text-slate-400">아직 등록된 블로그 게시글이 없습니다.</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
