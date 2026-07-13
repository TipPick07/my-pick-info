import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData, getRelatedPosts } from "@/lib/posts";
import { isPostCategoryLive, CATEGORIES } from "@/config/categories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import AdBanner from "@/components/AdBanner";
import AffiliateBanner from "@/components/AffiliateBanner";
import EligibilityChecker from "@/components/EligibilityChecker";
import SummaryCard from "@/components/SummaryCard";
import { FileText, Clock, Lightbulb } from "lucide-react";

function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_LABEL: Record<string, string> = {
  festival: '축제', festivals: '축제', benefit: '지원금', benefits: '지원금',
  election: '선거', info: '정보', '경제': '경제', money: '경제', '핫이슈': '핫이슈', '꿀팁': '꿀팁',
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);

  const description = post?.description || post?.summary || '';
  const ogImage = post?.ogImage || 'https://tip-pick.com/images/og-default.png';

  return {
    ...(post && !isPostCategoryLive(post.category) ? { robots: { index: false, follow: false } } : {}),
    title: `${post?.title} | 팁픽(Tip-Pick)`,
    description,
    alternates: { canonical: `https://tip-pick.com/blog/${slug}/` },
    openGraph: {
      title: post?.title,
      description,
      url: `https://tip-pick.com/blog/${slug}/`,
      siteName: '팁픽',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post?.date,
      authors: [post?.author || '팁픽(Tip-Pick)'],
      tags: post?.tags,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post?.title, description, images: [ogImage] },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = getPostData(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category, post.tags);

  // 카테고리 성격: 크롤 데이터(지원금·축제)='공식형' / 그 외(경제·정보·꿀팁)='에디터형'
  const isFestival = post.category === 'festival' || post.category === 'festivals';
  const isOfficial = post.category === 'benefit' || post.category === 'benefits' || isFestival;
  const owningCat = CATEGORIES.find((c) => c.postCategories.includes(post.category));
  const catLabel = CATEGORY_LABEL[post.category] ?? post.category;

  const cardCategory: 'festival' | 'benefit' | 'blog' =
    post.category === 'benefit' ? 'benefit' : isFestival ? 'festival' : 'blog';
  const cardBadges = post.officialDeadline
    ? [`📅 마감: ${post.officialDeadline}`, '⬇ 아래에서 자세히']
    : ['⬇ 아래에서 자세히'];

  // 다음 단계 CTA (카테고리별)
  const ctaPrimary = isFestival
    ? { href: '/festivals/', label: '🎪 전국 나들이 전체 보기' }
    : isOfficial
    ? { href: '/benefits/', label: '💰 전체 지원금 한눈에 보기' }
    : { href: owningCat?.href ?? '/money/', label: `${owningCat?.emoji ?? '💰'} ${owningCat?.label ?? '돈이 되는 경제'} 더 보기` };
  const ctaSecondary = { href: '/tools/', label: '🧮 실생활 계산기 써보기' };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "datePublished": post.date,
            "dateModified": post.date,
            "description": post.summary,
            "author": { "@type": "Organization", "name": "팁픽(Tip-Pick)", "url": "https://tip-pick.com/about/" },
            "publisher": { "@type": "Organization", "name": "팁픽(Tip-Pick)", "url": "https://tip-pick.com" },
            "mainEntityOfPage": `https://tip-pick.com/blog/${post.slug}/`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://tip-pick.com" },
              { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://tip-pick.com/blog/" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://tip-pick.com/blog/${post.slug}/` },
            ],
          }),
        }}
      />
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
        {/* 목록으로 */}
        <div className="mb-8">
          <Link href="/blog/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors group">
            <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">←</span>
            목록으로
          </Link>
        </div>

        {/* 헤더 */}
        <header className="space-y-5 mb-10">
          <span className="inline-block bg-indigo-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full">
            {catLabel}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-[1.25]">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
            <span>{post.date}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <Link href="/about/" className="text-indigo-600 font-bold hover:underline underline-offset-4">팁픽 에디터</Link>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-emerald-500 font-bold">✓</span> 정부·공공기관 공식 자료를 직접 확인해 작성하고, 수치에는 기준 시점과 출처를 함께 밝힙니다.{' '}
            <Link href="/about/" className="font-bold underline underline-offset-2 hover:text-indigo-600">검증 원칙 보기</Link>
          </p>
          <p className="text-base text-slate-500 leading-relaxed border-l-4 border-indigo-100 pl-4 py-1">
            {post.summary}
          </p>
        </header>

        {/* 본문 */}
        <article>
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-table:text-sm prose-img:rounded-xl prose-img:border prose-img:border-slate-100">
            <SummaryCard
              category={cardCategory}
              rows={[{ label: '이 글 한 줄 요약', value: post.summary }]}
              badges={cardBadges}
              className="mb-8 not-prose"
            />
            <ReactMarkdown
              remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
              components={{
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt || post.title} className="rounded-xl border border-slate-100" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* 자격 진단기 — 퀴즈 있을 때만(지원금) */}
          {post.officialEligibilityQuiz && post.officialEligibilityQuiz.length > 0 && (
            <div className="mt-10">
              <EligibilityChecker quiz={post.officialEligibilityQuiz} />
            </div>
          )}

          {/* 하단 정보 */}
          <div className="mt-12 pt-8 border-t border-slate-100 space-y-5">
            {/* 에디터 한마디 / CTA — 모든 글 공통 */}
            {post.officialCurationNote && (
              <div className="p-4 bg-indigo-50/60 border-l-4 border-indigo-500 rounded-r-xl">
                <p className="text-indigo-900 text-sm font-bold leading-relaxed">⭐ {post.officialCurationNote}</p>
              </div>
            )}

            {/* 에디터형 팁(있으면) */}
            {!isOfficial && post.officialTip && (
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-emerald-900/80 text-sm font-medium leading-relaxed">{post.officialTip}</p>
              </div>
            )}

            {isOfficial ? (
              <>
                <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    💡 <strong className="text-slate-700">팁픽 큐레이션 안내</strong> · 공식 자료를 팁픽이 직접 정리한 콘텐츠입니다. 정확한 내용은 아래 공식 정보를 확인하세요.
                  </p>
                  <div className="bg-white rounded-xl p-5 border border-slate-100 space-y-3">
                    <div className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                      <span className="text-slate-400 font-bold">지원 대상</span>
                      <span className="text-slate-700 font-medium">{post.officialTarget || '공식 공고 확인'}</span>
                    </div>
                    <div className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                      <span className="text-slate-400 font-bold">신청 마감</span>
                      <span className="text-slate-700 font-medium">{post.officialDeadline || '상시'}</span>
                    </div>
                    {post.officialDetails && (
                      <div className="grid grid-cols-[72px_1fr] gap-3 text-sm pt-3 border-t border-slate-50">
                        <span className="text-slate-400 font-bold">상세 내용</span>
                        <p className="text-slate-600 leading-relaxed text-[13px]">{post.officialDetails}</p>
                      </div>
                    )}
                  </div>
                  {(post.officialRequirements.length > 0 || post.officialHowToApply.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {post.officialRequirements.length > 0 && (
                        <div className="bg-white rounded-xl p-5 border border-slate-100">
                          <h4 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" />필요 서류</h4>
                          <ul className="space-y-2">
                            {post.officialRequirements.map((req, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2"><span className="text-indigo-400">•</span><span>{req}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {post.officialHowToApply.length > 0 && (
                        <div className="bg-white rounded-xl p-5 border border-slate-100">
                          <h4 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" />신청 방법</h4>
                          <ul className="space-y-2">
                            {post.officialHowToApply.map((step, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2"><span className="text-indigo-400">{idx + 1}.</span><span>{step}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {post.officialTip && (
                    <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-emerald-900/80 text-sm font-bold leading-relaxed">{post.officialTip}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    {isValidUrl(post.link) ? (
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-black hover:underline underline-offset-4">공식 사이트 원문 →</a>
                    ) : (
                      <span className="text-slate-300 text-xs font-bold italic">출처 준비 중</span>
                    )}
                    <span className="text-xs font-bold text-slate-400">최종 업데이트 {post.date}</span>
                  </div>
                </div>
                {isValidUrl(post.link) && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black py-4 px-6 rounded-2xl transition-all text-base">
                    📋 공식 사이트에서 바로 신청하기 →
                  </a>
                )}
              </>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-500 leading-relaxed">ℹ️ 일반적인 정보 제공을 위한 글입니다. 수치·조건은 바뀔 수 있으니 정확한 내용은 공식 기관에서 확인하세요.</p>
                <span className="text-xs font-bold text-slate-400 shrink-0">최종 업데이트 {post.date}</span>
              </div>
            )}

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
              ))}
            </div>
          </div>
        </article>

        {/* 연관글 */}
        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">📚 함께 읽으면 좋은 글</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}/`} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">{CATEGORY_LABEL[related.category ?? ''] ?? related.category}</span>
                  <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{related.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 다음 단계 CTA — 카테고리별 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={ctaPrimary.href} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl transition-all active:scale-[0.98]">
            {ctaPrimary.label}
          </Link>
          <Link href={ctaSecondary.href} className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black py-4 px-6 rounded-2xl transition-all active:scale-[0.98]">
            {ctaSecondary.label}
          </Link>
        </div>

        <AffiliateBanner textContext={post.content} />
        <AdBanner />
      </main>

      <Footer />
    </div>
  );
}
