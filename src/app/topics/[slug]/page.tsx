import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TOPICS, getTopic } from "@/lib/topics";
import { GUIDES } from "@/lib/guides";
import { getSortedPostsData } from "@/lib/posts";

const SITE = "https://tip-pick.com";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) return {};
  return {
    title: `${t.title} | 팁픽(Tip-Pick)`,
    description: t.description,
    alternates: { canonical: `/topics/${t.slug}/` },
    openGraph: {
      title: `${t.title} | 팁픽(Tip-Pick)`,
      description: t.description,
      url: `${SITE}/topics/${t.slug}/`,
      images: [`${SITE}/og-image-v2.png`],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const all = getSortedPostsData();
  const posts = topic.posts
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const guides = (topic.guides ?? [])
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      <Header />
      <main className="max-w-4xl mx-auto w-full px-4 py-12 space-y-10">
        <nav className="text-sm text-slate-400">
          <Link href="/" className="hover:text-brand-dark">홈</Link>
          <span className="mx-2">/</span>
          <Link href="/topics/" className="hover:text-brand-dark">주제별 모아보기</Link>
        </nav>

        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.2]">
            {topic.title}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">{topic.intro}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-black">글 {posts.length}편</h2>
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}/`}
                  className="block rounded-xl border border-slate-200 p-4 hover:border-cyan-300 hover:shadow-sm transition"
                >
                  <span className="block font-bold text-slate-900">{p.title}</span>
                  <span className="mt-1 block text-sm text-slate-500 leading-relaxed">
                    {p.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {guides.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-black">함께 보는 가이드</h2>
            <ul className="space-y-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}/`}
                    className="block rounded-xl border border-slate-200 p-4 hover:border-cyan-300 hover:shadow-sm transition"
                  >
                    <span className="block font-bold text-slate-900">
                      {g.emoji} {g.title}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500 leading-relaxed">
                      {g.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(topic.tools?.length ?? 0) > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-black">직접 계산해 보기</h2>
            <div className="flex flex-wrap gap-2">
              {topic.tools!.map((t) => (
                <Link
                  key={t}
                  href={`/tools/${t}/`}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-brand-dark hover:bg-cyan-100 transition"
                >
                  계산기 열기 →
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pt-4">
          <Link href="/topics/" className="text-sm font-bold text-brand-dark hover:underline">
            ← 다른 주제 보기
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
