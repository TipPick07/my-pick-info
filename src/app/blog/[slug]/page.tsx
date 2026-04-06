import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import AdBanner from "@/components/AdBanner";
import CoupangBanner from "@/components/CoupangBanner";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);

  return {
    title: `${post?.title} | 팁픽(Tip-Pick) 인사이트`,
    description: post?.summary,
    openGraph: {
      title: post?.title,
      description: post?.summary,
      type: 'article',
      publishedTime: post?.date,
      authors: [post?.author || '팁픽(Tip-Pick)'],
      tags: post?.tags,
    },
  };
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
      {/* BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "datePublished": post.date,
            "description": post.summary,
            "author": {
              "@type": "Organization",
              "name": "수도권 팁픽(Tip-Pick)"
            },
            "publisher": {
              "@type": "Organization",
              "name": "수도권 팁픽(Tip-Pick)",
              "url": "https://tip-pick.com"
            }
          })
        }}
      />
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://tip-pick.com" },
              { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://tip-pick.com/blog" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://tip-pick.com/blog/${post.slug}` }
            ]
          })
        }}
      />
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

          {/* AI Disclosure & Source Link */}
          <div className="mt-16 pt-10 border-t-2 border-slate-50 space-y-8">
            <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">
                💡 **AI 생성 정보 안내**<br />
                이 글은 공공데이터포털 정보를 바탕으로 AI가 작성하였습니다. 
                정확한 내용은 아래 **[공공서비스 공식 정보]**를 통해 다시 한번 확인해주시기 바랍니다.
              </p>

              {/* Official Data Section */}
              <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <h4 className="text-indigo-900 font-black text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  공공서비스 공식 정보
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 text-sm">
                    <span className="text-slate-400 font-bold">지원 대상</span>
                    <span className="text-slate-700 font-medium">{post.officialTarget || '포털 확인 필요'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 text-sm">
                    <span className="text-slate-400 font-bold">신청 마감</span>
                    <span className="text-slate-700 font-medium">{post.officialDeadline || '상시'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 text-sm pt-4 border-t border-slate-50">
                    <span className="text-slate-400 font-bold">상세 내용</span>
                    <p className="text-slate-600 leading-relaxed text-[13px]">
                      {post.officialDetails || '공식 홈페이지를 통해 상세 내용을 확인해 주세요.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Original Source</p>
                {post.link ? (
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-black hover:underline underline-offset-4"
                  >
                    공공서비스 원문 바로가기 →
                  </a>
                ) : (
                  <span className="text-slate-300 font-bold italic">출처 링크를 준비 중입니다.</span>
                )}
              </div>

              <div className="text-right">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-2">Last Updated</p>
                <p className="text-slate-900 font-black">최종 업데이트: {post.date}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Monetization Banners */}
        <AdBanner />
        <CoupangBanner />
      </main>

      <Footer />
    </div>
  );
}
