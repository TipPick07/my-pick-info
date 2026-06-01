import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData, getRelatedPosts } from "@/lib/posts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import AdBanner from "@/components/AdBanner";
import AffiliateBanner from "@/components/AffiliateBanner";
import EligibilityChecker from "@/components/EligibilityChecker";
import SafeImage from "@/components/SafeImage";
import SummaryCard from "@/components/SummaryCard";
import { FileText, Clock, Lightbulb } from "lucide-react";

function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);

  const description = post?.description || post?.summary || '';
  const ogImage = post?.ogImage || 'https://tip-pick.com/images/og-default.png';

  return {
    title: `${post?.title} | 팁픽(Tip-Pick)`,
    description,
    alternates: {
      canonical: `https://tip-pick.com/blog/${slug}`,
    },
    openGraph: {
      title: post?.title,
      description,
      url: `https://tip-pick.com/blog/${slug}`,
      siteName: '수도권 팁픽',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post?.date,
      authors: [post?.author || '팁픽(Tip-Pick)'],
      tags: post?.tags,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post?.title,
      description,
      images: [ogImage],
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

  const relatedPosts = getRelatedPosts(post.slug, post.category, post.tags);

  const cardCategory: 'festival' | 'benefit' | 'blog' =
    post.category === 'benefit' ? 'benefit'
    : post.category === 'festival' ? 'festival'
    : 'blog';
  const cardBadges = post.officialDeadline
    ? [`📅 마감: ${post.officialDeadline}`, '⬇ 아래에서 신청 방법 확인']
    : ['⬇ 아래에서 자세한 내용 확인'];

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
            href="/blog/"
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
            <span className="text-indigo-600 font-bold">TIP PICK</span>
          </div>

          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto italic border-l-4 border-indigo-200 pl-4 py-2">
            "{post.summary}"
          </p>

          {post.image && (
            <div className="mt-12 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto border-4 border-white aspect-[16/9] relative bg-slate-100">
              <SafeImage 
                src={post.image || '/images/blogs/korea-welfare-benefit-322.png'}
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}
        </header>

        {/* Post Content */}
        <article className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-img:rounded-3xl prose-img:shadow-lg">
            {/* 핵심 요약 카드 */}
            <SummaryCard
              category={cardCategory}
              rows={[{ label: '핵심 요약', value: post.summary }]}
              badges={cardBadges}
              className="mb-10 not-prose"
            />

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
          
          {/* 1분 자격 진단기 (블로그 통합) */}
          {post.officialEligibilityQuiz && post.officialEligibilityQuiz.length > 0 && (
            <div className="mt-12 px-2">
              <EligibilityChecker quiz={post.officialEligibilityQuiz} />
              {/* 크롤러용 정적 안내 텍스트 */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 not-prose">
                <p className="text-xs font-bold text-slate-600 mb-1">✅ 자격 확인 안내</p>
                <p className="text-xs text-slate-500 leading-relaxed">위 항목에 해당하시면 신청 자격이 있습니다. 지원 대상·소득 기준·거주지 조건을 확인한 뒤 아래 신청 방법을 참고해 진행하세요.</p>
              </div>
            </div>
          )}

          {/* AI Disclosure & Source Link */}
          <div className="mt-16 pt-10 border-t-2 border-slate-50 space-y-8">
            <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
              {post.officialCurationNote && (
                <div className="mb-5 p-4 bg-white border-l-4 border-indigo-500 rounded-xl shadow-sm">
                  <p className="text-indigo-900 text-sm font-black leading-relaxed">⭐ {post.officialCurationNote}</p>
                </div>
              )}
              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">
                💡 <strong>팁픽 큐레이션 안내</strong><br />
                이 글은 공공데이터를 팁픽(Tip-Pick)만의 시각으로 직접 재구성한 고유 콘텐츠입니다.
                정확한 내용은 아래 <strong>공공서비스 공식 정보</strong>를 통해 다시 한번 확인해주시기 바랍니다.
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

              {/* 추가 정보 (구비서류, 신청방법) */}
              {(post.officialRequirements.length > 0 || post.officialHowToApply.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {post.officialRequirements.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <h4 className="text-slate-900 font-black text-sm mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        필요 서류
                      </h4>
                      <ul className="space-y-2">
                        {post.officialRequirements.map((req, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {post.officialHowToApply.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <h4 className="text-slate-900 font-black text-sm mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        신청 방법
                      </h4>
                      <ul className="space-y-2">
                        {post.officialHowToApply.map((step, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-indigo-400">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 팁픽 가이드 팁 */}
              {post.officialTip && (
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 mt-8 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-emerald-900/80 text-sm font-bold leading-relaxed">
                    {post.officialTip}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Original Source</p>
                {isValidUrl(post.link) ? (
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

          {/* CTA 버튼 — 공식 신청 링크 */}
          {isValidUrl(post.link) && (
            <div className="mt-8">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black py-5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200/50 text-base tracking-tight"
              >
                📋 공식 사이트에서 바로 신청하기 →
              </a>
            </div>
          )}

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* 연관글 추천 카드 */}
        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">📚 함께 읽으면 좋은 글</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}/`}
                  className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">
                    {related.category === 'benefit' ? '지원금' : related.category === 'festival' ? '축제' : related.category === 'election' ? '선거' : related.category}
                  </span>
                  <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {related.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{related.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 다음 단계 CTA — 모든 글 공통. 섹션·허브로 연결해 이탈 방지 및 탐색 유도 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(post.category === 'festival' || post.category === 'festivals') ? (
            <Link href="/festivals/" className="group flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 px-6 rounded-2xl transition-all active:scale-[0.98]">
              🎪 이번 주 나들이·축제 전체 보기
            </Link>
          ) : (
            <Link href="/benefits/" className="group flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white font-black py-5 px-6 rounded-2xl transition-all active:scale-[0.98]">
              💰 전체 지원금 한눈에 보기
            </Link>
          )}
          <Link href="/situations/" className="group flex items-center justify-center gap-2 bg-[#00CCFF]/10 hover:bg-[#00CCFF]/20 text-[#00AACC] font-black py-5 px-6 rounded-2xl transition-all active:scale-[0.98]">
            🎯 내 상황별 맞춤 혜택 찾기
          </Link>
        </div>

        {/* 제휴 마케팅 자동화 키워드 배너 */}
        <AffiliateBanner textContext={post.content} />

        {/* Monetization Banners */}
        <AdBanner />
      </main>

      <Footer />
    </div>
  );
}
