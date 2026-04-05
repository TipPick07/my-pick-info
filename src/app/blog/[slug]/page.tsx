import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import Header from "@/components/Header";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// SSG를 위한 정적 경로 생성
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = getPostData(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        {/* Navigation Row */}
        <div className="flex items-center gap-4 mb-12">
          <Link 
            href="/blog"
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-all group"
          >
            <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">←</span>
            목록으로
          </Link>
        </div>

        {/* Post Header */}
        <header className="space-y-6 text-center mb-16">
          <div className="inline-block bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-indigo-100">
            {post.category}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            {post.title}
          </h2>

          <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-400">
            <span>{post.date}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-indigo-600 font-bold">EDITORS PICK</span>
          </div>

          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto italic border-l-4 border-indigo-200 pl-4 py-2">
            "{post.summary}"
          </p>
        </header>

        {/* Post Content */}
        <article className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-img:rounded-3xl prose-img:shadow-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-400 text-sm text-center md:text-left">
          <div className="space-y-4">
            <h4 className="text-white font-bold">수도권N라이프</h4>
            <p>데이터 출처: 공공데이터포털</p>
            <p>마지막 업데이트: 2026.04.05</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
