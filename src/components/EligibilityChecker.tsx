"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

interface EligibilityCheckerProps {
  quiz?: string[];
}

export default function EligibilityChecker({ quiz }: EligibilityCheckerProps) {
  // 질문 데이터가 없으면 위젯을 노출하지 않음
  if (!quiz || quiz.length === 0) return null;

  const [step, setStep] = useState(0); // 0-indexed: quiz[step]
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnswer = (answer: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (answer) {
        // '예'를 눌렀을 때
        if (step === quiz.length - 1) {
          // 마지막 질문이면 성공
          setResult("pass");
        } else {
          // 다음 질문으로 이동
          setStep(step + 1);
        }
      } else {
        // 하나라도 '아니오'면 즉시 실패
        setResult("fail");
      }
      setIsAnimating(false);
    }, 300);
  };

  const reset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(0);
      setResult(null);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <section className="bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 p-8 md:p-10 mb-12 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider">
            💡 1분 자격 진단
          </div>
          <h3 className="text-2xl font-black text-indigo-900">나도 받을 수 있을까?</h3>
        </div>
        {(step > 0 || result !== null) && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            다시 하기
          </button>
        )}
      </div>

      <div className={`transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        {result === null ? (
          <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-8 shadow-sm">
            <p className="text-xl font-bold text-slate-800 leading-relaxed md:text-2xl">
              {quiz[step]}
            </p>
          </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl p-6 text-xl font-black text-indigo-900 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                예
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="bg-white border-2 border-slate-100 hover:border-slate-400 rounded-2xl p-6 text-xl font-black text-slate-400 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                아니오
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {result === "pass" ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span className="text-2xl font-black">진단 완료!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-emerald-900 leading-relaxed">
                    🎉 신청 가능 확률 <span className="text-3xl font-black text-emerald-600">99%</span>!
                  </p>
                  <p className="text-emerald-700 font-medium">지금 바로 하단에서 신청 방법과 서류를 확인해보세요.</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <XCircle className="w-8 h-8" />
                  <span className="text-2xl font-black">진단 결과</span>
                </div>
                <div className="space-y-4">
                  <p className="text-lg font-bold text-slate-800 leading-relaxed">
                    아쉽지만 이번 조건에는 맞지 않을 수 있어요.
                  </p>
                  <p className="text-slate-500 font-medium">
                    해당 지원금의 상세 자격 요건을 다시 한번 확인해 보시거나, <br className="hidden md:block" />
                    <span className="text-indigo-600 font-bold">팁픽</span>이 추천하는 다른 혜택들을 찾아보세요!
                  </p>
                  <button 
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-indigo-600 font-black hover:underline"
                  >
                    다른 조건으로 다시 해보기 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
