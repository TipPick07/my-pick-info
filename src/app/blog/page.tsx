import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-10">
          {/* 배지 */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            💡 팁픽 인사이트
          </div>

          {/* 메인 타이틀 */}
          <h2 className="text-5xl md:text-6xl tracking-tight leading-[1.15]">
            <span className="font-black text-slate-900">팁픽</span>{" "}
            <span
              className="font-serif italic font-semibold text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00CCFF 0%, #33FF99 100%)" }}
            >
              인사이트
            </span>
          </h2>

          {/* 서브 설명 */}
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            수도권 생활의 질을 높이는 한 끗 차이,{" "}
            <span className="font-black text-slate-700">팁픽이 엄선한 진짜 정보들</span>만 모았습니다.
          </p>

          {/* 네온 장식 선 */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 rounded-full" style={{ background: "linear-gradient(to right, transparent, #00CCFF)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#00CCFF", boxShadow: "0 0 8px rgba(0,204,255,0.8)" }} />
            <div className="h-0.5 w-16 rounded-full" style={{ background: "linear-gradient(to left, transparent, #33FF99)" }} />
          </div>
        </section>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
          className="group bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,204,255,0.15)] hover:border-[rgba(0,204,255,0.3)] transition-all duration-700 hover:-translate-y-2 flex flex-col"
            >
              {/* 이미지 영역 */}
              <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                <img 
                  src={post.image || '/images/blogs/default.png'} 
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-[1000ms]" 
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black shadow-lg border border-white/50 tracking-wider" style={{ color: "#00CCFF" }}>
                  {post.category}
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="p-7 space-y-3 flex flex-col flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1" style={{ color: "#00AACC" }}>💡 팁픽 큐레이션</span>
                  <span>{post.date}</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-snug transition-colors group-hover:text-[#00CCFF]">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-auto">
                  {post.summary}
                </p>

                <div className="pt-3 flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
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
