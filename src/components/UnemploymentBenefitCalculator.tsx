"use client";

import { useState } from "react";

/**
 * 실업급여(구직급여) 계산기 — 2026년 기준(고용노동부). 참고용.
 * 1일 구직급여 = 이직 전 3개월 평균임금 × 60%, 상한 68,100원·하한 66,048원(2026.1.1 이후 이직).
 * 1일 평균임금은 월 평균임금 × 3 ÷ 91(3개월 일수 근사)로 계산.
 * 소정급여일수 = 이직일 당시 나이(50세 기준)·고용보험 가입기간별 120~270일.
 * 총 예상액 = 1일 구직급여 × 소정급여일수 (unemployment-benefit-guide와 동일 값).
 */
const UPPER = 68100; // 1일 상한 (임금일액 상한 113,500 × 60%)
const LOWER = 66048; // 1일 하한 (최저임금 10,320 × 80% × 8h)

const PERIODS = ["1년 미만", "1년 ~ 3년 미만", "3년 ~ 5년 미만", "5년 ~ 10년 미만", "10년 이상"];
const DAYS: Record<Age, number[]> = {
  under: [120, 150, 180, 210, 240],
  over: [120, 180, 210, 240, 270],
};

type Age = "under" | "over";

export default function UnemploymentBenefitCalculator() {
  const [wage, setWage] = useState(""); // 월 평균임금(만원)
  const [age, setAge] = useState<Age>("under");
  const [period, setPeriod] = useState("2"); // 가입기간 index

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const monthly = (parseFloat(wage) || 0) * 10000;
  const idx = parseInt(period, 10);

  let result: { daily: number; capped: "upper" | "lower" | null; days: number; total: number } | null =
    null;
  if (monthly > 0) {
    const raw = Math.floor(((monthly * 3) / 91) * 0.6);
    const daily = Math.min(Math.max(raw, LOWER), UPPER);
    const capped = raw > UPPER ? "upper" : raw < LOWER ? "lower" : null;
    const days = DAYS[age][idx];
    result = { daily, capped, days, total: daily * days };
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const tabCls = (active: boolean) =>
    "flex-1 rounded-xl px-4 py-3 text-sm font-black transition-colors " +
    (active ? "bg-brand text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => setAge("under")} className={tabCls(age === "under")}>
            50세 미만
          </button>
          <button type="button" onClick={() => setAge("over")} className={tabCls(age === "over")}>
            50세 이상·장애인
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>이직 전 월 평균임금 (만원, 세전)</label>
            <input
              type="number"
              inputMode="numeric"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="예: 300 (최근 3개월 평균)"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>고용보험 가입기간</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls}>
              {PERIODS.map((p, i) => (
                <option key={p} value={i}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          비자발적 이직(권고사직·계약만료 등) + 이직 전 18개월 중 피보험단위기간 180일 이상이
          기본 요건입니다. 나이는 이직일(퇴사일) 당시 만 나이 기준입니다.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">총 예상 수령액 (세전)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.total)}원</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                1일 {won(result.daily)}원 × {result.days}일
                {result.capped === "upper" ? " (상한 적용)" : result.capped === "lower" ? " (하한 적용)" : ""}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">1일 구직급여</span>
                <p className="font-black text-slate-800">{won(result.daily)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">소정급여일수</span>
                <p className="font-black text-slate-800">{result.days}일</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월 환산(30일)</span>
                <p className="font-black text-slate-800">{won(result.daily * 30)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              2026년(이직일 1.1 이후) 상한 68,100원·하한 66,048원을 적용한 참고용 금액입니다. 1일
              평균임금은 월급 × 3 ÷ 91로 근사했으며, 실제 금액은 3개월 임금 총액·일수 기준으로
              고용센터에서 산정합니다. 실업 신고 후 7일의 대기기간에는 지급되지 않습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월 평균임금과 가입기간을 입력하면 예상 실업급여가 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
