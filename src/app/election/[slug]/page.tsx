import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import AdBanner from "@/components/AdBanner";
import SafeImage from "@/components/SafeImage";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug, 'election');

  const description = post?.summary || '';
  const ogImage = post?.image || 'https://tip-pick.com/images/og-default.png';

  return {
    title: `${post?.title} | 우리 동네 선거 공약 - 팁픽(Tip-Pick)`,
    description,
    alternates: {
      canonical: `https://tip-pick.com/election/${slug}`,
    },
    openGraph: {
      title: post?.title,
      description,
      url: `https://tip-pick.com/election/${slug}`,
      siteName: '수도권 팁픽',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post?.date,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
      }],
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData('election');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function ElectionPostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = getPostData(resolvedParams.slug, 'election');

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        {/* Navigation Row */}
        <div className="flex items-center gap-4 mb-12">
          <Link 
            href="/election"
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#00CCFF] transition-all group"
          >
            <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-[#00CCFF] group-hover:text-white transition-all">←</span>
            목록으로
          </Link>
        </div>

        {/* Post Header */}
        <header className="space-y-6 text-center mb-16">
          <div 
            className="inline-block bg-[#00CCFF] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-cyan-100"
          >
            {post.region} 공약
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            {post.title}
          </h2>

          <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-400">
            <span>{post.date}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-[#00CCFF] font-bold">우리 동네 선거 공약</span>
          </div>

          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto italic border-l-4 border-cyan-200 pl-4 py-2">
            "{post.summary}"
          </p>

          {post.image && (
            <div className="mt-12 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto border-4 border-white aspect-[16/9] relative bg-slate-100">
              <SafeImage 
                src={post.image}
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}
        </header>

        {/* Post Content */}
        <article className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-[#00CCFF] hover:prose-a:text-[#00AACC] prose-img:rounded-3xl prose-img:shadow-lg">
            {/* 핵심 요약 카드 — 이탈 방지 */}
            <div className="mb-10 p-6 bg-cyan-50 rounded-2xl border border-cyan-100 not-prose">
              <p className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-3">📌 이 글의 핵심</p>
              <p className="text-slate-700 font-semibold leading-relaxed text-base mb-4">{post.summary}</p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-cyan-100">
                <span className="bg-white text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-200">🗳 사전투표: 5/29~30</span>
                <span className="bg-white text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-200">📅 본투표: 6/3(화)</span>
                <span className="bg-white text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-200">⬇ 아래에서 가구별 혜택 확인</span>
              </div>
            </div>

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt || post.title} className="rounded-3xl shadow-lg" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer Info */}
          <div className="mt-16 pt-10 border-t-2 border-slate-50">
             <div className="p-8 bg-cyan-50/50 rounded-[2rem] border border-cyan-100/50">
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                💡 **선거 공약 정보 안내**<br />
                본 내용은 각 후보자의 공식 선거 공약집 및 공공 보도 자료를 바탕으로 팁픽이 요약·정리한 내용입니다. 
                정확한 공약 전문과 실현 가능성은 중앙선거관리위원회 홈페이지에서 반드시 재확인하시기 바랍니다.
              </p>
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

        {/* 선거글 내부 순환 버튼 */}
        <div className="mt-8 text-center">
          <Link
            href="/election/"
            className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 font-bold px-6 py-3 rounded-full border border-cyan-200 hover:bg-cyan-100 transition-all text-sm"
          >
            🗳 다른 지역 선거 공약도 확인하기 →
          </Link>
        </div>

        <AdBanner />
      </main>

      <Footer />
    </div>
  );
}
