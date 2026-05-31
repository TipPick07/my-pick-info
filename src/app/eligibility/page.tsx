import EligibilityPage from "@/components/EligibilityPage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "1분 맞춤 혜택 찾기 | 수도권 팁픽",
  description: "몇 가지 질문에 답하고 나에게 딱 맞는 숨은 지원금을 찾아보세요.",
};

export default function EligibilityRoute() {
  const dataPath = path.join(process.cwd(), "public/data/pick-info.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const benefits = raw.benefits as Array<{
    id: string;
    region: string;
    title: string;
    target: string;
    deadline: string;
    details: string;
    isEmergency: boolean;
    eligibilityQuiz?: string[];
  }>;

  const benefitPool = benefits
    .filter((b) => b.eligibilityQuiz && b.eligibilityQuiz.length > 0)
    .map((b) => ({
      id: b.id,
      title: b.title,
      question: b.eligibilityQuiz![0],
    }));

  return (
    <main className="min-h-[80vh] bg-slate-50 py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          메인으로 돌아가기
        </Link>

        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            나에게 딱 맞는 혜택 찾기 🔍
          </h1>
          <p className="text-lg text-slate-500 font-medium break-keep">
            퀴즈로 탐색하거나, 키워드로 바로 검색해보세요.
          </p>
        </div>

        <EligibilityPage benefits={benefits} benefitPool={benefitPool} />
      </div>
    </main>
  );
}
