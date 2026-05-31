import EligibilityChecker from "@/components/EligibilityChecker";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "1분 맞춤 혜택 찾기 | 수도권 팁픽",
  description: "몇 가지 질문에 답하고 나에게 딱 맞는 숨은 지원금을 찾아보세요.",
};

export default function EligibilityPage() {
  const genericQuiz = [
    "만 19세 이상 39세 이하의 청년에 해당하시나요?",
    "수도권(서울, 인천, 경기)에 거주하고 계신가요?",
    "현재 구직 활동 중이거나 무주택 세대주이신가요?"
  ];

  return (
    <main className="min-h-[80vh] bg-slate-50 py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          메인으로 돌아가기
        </Link>
        
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            나에게 딱 맞는 혜택 찾기 🔍
          </h1>
          <p className="text-lg text-slate-500 font-medium break-keep">
            몇 가지 간단한 질문에 답하고, 내가 놓치고 있던 숨은 지원금과 혜택을 1분 만에 확인해보세요.
          </p>
        </div>

        <EligibilityChecker quiz={genericQuiz} />
      </div>
    </main>
  );
}
