"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

export default function EligibilityChecker({ region = "전국", target = "" }: { region?: string, target?: string }) {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // 지역 텍스트 처리 (조사 포함)
  const displayRegion = region === "경기" ? "경기도" 
                      : region === "서울" ? "서울특별시" 
                      : region === "인천" ? "인천광역시" 
                      : region === "전국" ? "전국" 
                      : `${region} 지역`;

  const handleNext = (answer: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (step === 1) {
        if (answer) {
          setStep(2);
        } else {
          setStep(3);
          setResult("fail");
        }
      } else if (step === 2) {
        if (answer) {
          setStep(3);
          setResult("pass");
        } else {
          setStep(3);
          setResult("fail");
        }
      }
      setIsAnimating(false);
    }, 300);
  };

  const reset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(1);
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
        {step > 1 && (
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
        {step === 1 && (
          <div className="space-y-8">
            {region === "전국" ? (
              <p className="text-xl font-bold text-slate-800 leading-relaxed md:text-2xl">
                질문 1. 귀하는 <br className="hidden md:block" />
                <span className="text-indigo-600 font-black">[{target}]</span> <br className="hidden md:block" />
                조건에 해당하시나요?
              </p>
            ) : (
              <p className="text-xl font-bold text-slate-800 leading-relaxed md:text-2xl">
                질문 1. <span className="text-indigo-600 font-black">{displayRegion}</span>에 <br className="hidden md:block" />
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">주민등록</span>이 되어 있으신가요?
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleNext(true)}
                className="bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl p-6 text-xl font-black text-indigo-900 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                예
              </button>
              <button
                onClick={() => handleNext(false)}
                className="bg-white border-2 border-slate-100 hover:border-slate-400 rounded-2xl p-6 text-xl font-black text-slate-400 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                아니오
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <p className="text-xl font-bold text-slate-800 leading-relaxed md:text-2xl">
              질문 2. 공고문에 명시된 <br className="hidden md:block" />
              <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">연령대(또는 소득기준)</span>에 해당하시나요?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleNext(true)}
                className="bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl p-6 text-xl font-black text-indigo-900 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                예
              </button>
              <button
                onClick={() => handleNext(false)}
                className="bg-white border-2 border-slate-100 hover:border-slate-400 rounded-2xl p-6 text-xl font-black text-slate-400 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                아니오
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {result === "pass" ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span className="text-2xl font-black">진단 완료!</span>
                </div>
                <p className="text-lg font-bold text-emerald-900 leading-relaxed">
                  🎉 신청 가능 확률 <span className="text-3xl font-black text-emerald-600">99%</span>! <br />
                  지금 바로 하단의 버튼을 눌러 신청하세요.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <XCircle className="w-8 h-8" />
                  <span className="text-2xl font-black">진단 완료</span>
                </div>
                <p className="text-lg font-bold text-slate-600 leading-relaxed">
                  아쉽지만 이번 조건에는 맞지 않을 수 있어요. <br />
                  <span className="text-indigo-600">팁픽</span>이 찾아둔 다른 지원금을 확인해 보세요!
                </p>
                <div className="pt-2">
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
