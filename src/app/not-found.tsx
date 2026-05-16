import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-7xl font-black text-[#00CCFF] mb-4">404</p>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          찾을 수 없는 페이지입니다
        </h1>

        <p className="text-slate-500 text-sm mb-10 leading-relaxed">
          요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.
        </p>

        <Link
          href="/"
          className="inline-block mb-8 px-8 py-3 rounded-full text-white font-bold text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #00CCFF, #33FF99)" }}
        >
          팁픽 홈으로 돌아가기
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/festivals/"
            className="font-semibold text-slate-500 hover:text-[#00CCFF] transition-colors"
          >
            이번 주말 어디 가? →
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/blog/"
            className="font-semibold text-slate-500 hover:text-[#00CCFF] transition-colors"
          >
            팁픽 인사이트 →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
