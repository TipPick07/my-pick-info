import Link from "next/link";

interface BlogPost {
  id: string;
  category: string;
  title: string;
  author: string;
  date: string;
  image: string;
  content: string;
}

// 정적 배포를 위해 미리 경로를 생성합니다.
export async function generateStaticParams() {
  const data = require("../../../../public/data/pick-info.json");
  return data.blogPosts.map((post: { id: string }) => ({
    id: post.id,
  }));
}

async function getBlogPost(id: string) {
  const data = require("../../../../public/data/pick-info.json");
  return data.blogPosts.find((post: BlogPost) => post.id === id);
}

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">글을 찾는 중...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <main className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 목록으로
          </Link>
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
            <span>{post.category}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>수도권N라이프 매거진</span>
          </div>
        </div>

        {/* Article Header */}
        <div className="space-y-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm font-bold text-slate-500">
            <span className="text-slate-900">{post.author}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{post.date}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <article className="prose prose-slate prose-lg max-w-none">
          <div className="space-y-8 text-slate-600 leading-[1.8] font-medium text-lg md:text-xl">
            {post.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>

        {/* Newsletter or Footer CTA removed as requested */}
      </main>
    </div>
  );
}
