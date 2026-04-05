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
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-indigo-600">
                  <span className="bg-indigo-50 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-slate-400 font-medium">{post.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {post.summary}
                </p>

                <div className="pt-4 flex flex-wrap gap-2">
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
