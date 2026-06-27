import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideCard from "@/components/GuideCard";
import PostRow from "@/components/PostRow";
import { getSortedPostsData } from "@/lib/posts";
import { getCategory, visibleCategories } from "@/config/categories";
import { GUIDES } from "@/lib/guides";

/** money / benefits / hot / tips 등 글 목록형 카테고리 페이지 공용 틀. */
export default function CategoryLanding({
  categoryKey,
  intro,
  featuredGuideSlugs = [],
}: {
  categoryKey: string;
  intro?: string;
  featuredGuideSlugs?: string[];
}) {
  const cat = getCategory(categoryKey);
  if (!cat) return null;

  const posts = getSortedPostsData().filter((p) => cat.postCategories.includes(p.category));
  const featured = GUIDES.filter((g) => featuredGuideSlugs.includes(g.slug));
  const others = visibleCategories().filter((c) => c.key !== cat.key);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 md:py-14 space-y-12">
        <header className="space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black"
            style={{ color: cat.accent, backgroundColor: `${cat.accent}14` }}
          >
            <span className="text-base">{cat.emoji}</span> {cat.label}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{cat.label}</h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            {intro || cat.short}
          </p>
        </header>

        {featured.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-black text-slate-900">📘 깊이 있는 가이드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.map((g) => (
                <GuideCard key={g.slug} {...g} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5">
          <h2 className="text-xl font-black text-slate-900">전체 글</h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-5 bg-slate-50 rounded-[1.75rem] border-2 border-dashed border-slate-200">
              <div className="text-5xl">✍️</div>
              <p className="text-slate-500 font-bold">이 카테고리의 글을 정성껏 준비하고 있어요.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {others.map((c) => (
                  <Link
                    key={c.key}
                    href={c.href}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:border-brand hover:text-brand-dark transition-colors"
                  >
                    {c.emoji} {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
