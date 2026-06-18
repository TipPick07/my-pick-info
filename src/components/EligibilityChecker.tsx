"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BenefitQuestion {
  id: string;
  title: string;
  question: string;
}

interface EligibilityCheckerProps {
  quiz?: string[];
  benefitPool?: BenefitQuestion[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 단일 혜택용 모드 (benefit/[id] 페이지에서 사용) ────────────────────────────
function SingleBenefitChecker({ quiz }: { quiz: string[] }) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnswer = (answer: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (answer) {
        if (step === quiz.length - 1) {
          setResult("pass");
        } else {
          setStep(step + 1);
        }
      } else {
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

// ── 매처 모드 (eligibility 페이지에서 사용) ──────────────────────────────────
function BenefitMatcher({ benefitPool }: { benefitPool: BenefitQuestion[] }) {
  const [shuffled, setShuffled] = useState<BenefitQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [matched, setMatched] = useState<BenefitQuestion | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setShuffled(shuffleArray(benefitPool));
  }, [benefitPool]);

  const current = shuffled[step];

  const handleAnswer = (answer: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (answer) {
        setMatched(current);
      } else {
        if (step + 1 >= shuffled.length) {
          setExhausted(true);
        } else {
          setStep(step + 1);
        }
      }
      setIsAnimating(false);
    }, 300);
  };

  const reset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShuffled(shuffleArray(benefitPool));
      setStep(0);
      setMatched(null);
      setExhausted(false);
      setIsAnimating(false);
    }, 300);
  };

  if (shuffled.length === 0) return null;

  const progressPct = Math.round(((step + 1) / shuffled.length) * 100);

  return (
    <section className="bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 p-8 md:p-10 mb-12 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider">
            💡 1분 맞춤 혜택 찾기
          </div>
          <h3 className="text-2xl font-black text-indigo-900">나에게 맞는 혜택 찾기</h3>
        </div>
        {(step > 0 || matched !== null || exhausted) && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            처음부터
          </button>
        )}
      </div>

      {/* 진행 표시 */}
      {matched === null && !exhausted && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
            <span>진행 중</span>
            <span>{step + 1} / {shuffled.length}</span>
          </div>
          <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        {matched !== null ? (
          // 매칭 성공
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 space-y-5">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
              <span className="text-2xl font-black">혜택을 찾았어요!</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">추천 혜택</p>
              <p className="text-xl font-black text-emerald-900 leading-snug">{matched.title}</p>
              <p className="text-emerald-700 font-medium">자격 조건과 신청 방법을 바로 확인해보세요.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/benefit/${matched.id}/`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
              >
                상세 보기 <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-700 font-black px-6 py-3.5 rounded-2xl transition-colors"
              >
                다른 혜택도 찾기
              </button>
            </div>
          </div>
        ) : exhausted ? (
          // 풀 소진
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
              <XCircle className="w-8 h-8" />
              <span className="text-2xl font-black">진단 완료</span>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-bold text-slate-800 leading-relaxed">
                현재 질문 기준으로 딱 맞는 혜택을 찾지 못했어요.
              </p>
              <p className="text-slate-500 font-medium">
                지역·나이·상황이 바뀌면 해당하는 혜택도 달라집니다. <br className="hidden md:block" />
                전체 혜택 목록을 직접 둘러보는 것도 추천해요.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> 다시 찾기
              </button>
              <Link
                href="/benefits/"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-indigo-100 hover:border-indigo-400 text-indigo-700 font-black px-6 py-3.5 rounded-2xl transition-colors"
              >
                전체 혜택 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          // 질문 카드
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-8 shadow-sm">
              <p className="text-xl font-bold text-slate-800 leading-relaxed md:text-2xl">
                {current?.question}
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
        )}
      </div>
    </section>
  );
}

// ── 진입점 ───────────────────────────────────────────────────────────────────
export default function EligibilityChecker({ quiz, benefitPool }: EligibilityCheckerProps) {
  if (benefitPool && benefitPool.length > 0) {
    return <BenefitMatcher benefitPool={benefitPool} />;
  }
  if (quiz && quiz.length > 0) {
    return <SingleBenefitChecker quiz={quiz} />;
  }
  return null;
}
