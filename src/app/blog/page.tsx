import Link from "next/link";
import Header from "@/components/Header";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            에디터의 <span className="text-indigo-600 font-serif italic font-medium">시선</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            수도권의 숨은 매력과 꼭 필요한 정보를 에디터가 선별하여 전해드립니다.
          </p>
        </section>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 flex flex-col"
            >
              {/* 이미지 영역 */}
              <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                <img 
                  src={post.image || '/images/blogs/default.png'} 
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-[1000ms]" 
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black text-indigo-600 shadow-lg border border-white/50 tracking-wider">
                  {post.category}
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="p-7 space-y-3 flex flex-col flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>에디터 큐레이션</span>
                  <span>{post.date}</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-auto">
                  {post.summary}
                </p>

                <div className="pt-3 flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
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

      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-400 text-sm">
          <div className="space-y-4">
            <h4 className="text-white font-bold">수도권N라이프</h4>
            <p className="leading-relaxed">수도권의 로컬 문화와 생활 정보를 큐레이션하여 전해드리는 디지털 매거진입니다.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">바로가기</h4>
            <ul className="space-y-2">
              <li><Link href="/festivals/" className="hover:text-white transition-colors">축제/행사</Link></li>
              <li><Link href="/benefits/" className="hover:text-white transition-colors">지원금 혜택</Link></li>
              <li><Link href="/blog/" className="hover:text-white transition-colors text-white">블로그</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">정보</h4>
            <p>데이터 출처: 공공데이터포털</p>
            <p>마지막 업데이트: 2026.04.05</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
