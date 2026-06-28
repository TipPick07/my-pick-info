"use client";

import { useState } from "react";

/**
 * 퇴직금 계산기 — 평균임금 기반(고용노동부 약식과 동일 로직). 참고용.
 * 퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
 * 1일 평균임금 = (퇴직 전 3개월 임금 + 상여·연차수당 안분) / 3개월 일수
 */
export default function RetirementPayCalculator() {
  const [join, setJoin] = useState("");
  const [leave, setLeave] = useState("");
  const [months3, setMonths3] = useState(""); // 최근 3개월 급여 합계(만원)
  const [bonus, setBonus] = useState(""); // 연간 상여금(만원, 선택)
  const [annualLeave, setAnnualLeave] = useState(""); // 연차수당(만원, 선택)

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const j = join ? new Date(join) : null;
  const l = leave ? new Date(leave) : null;
  const p3 = (parseFloat(months3) || 0) * 10000;

  let result: { days: number; avg: number; pay: number } | null = null;
  let error = "";
  if (j && l && months3) {
    if (l <= j) {
      error = "퇴사일은 입사일보다 뒤여야 합니다.";
    } else {
      const days = Math.floor((l.getTime() - j.getTime()) / 86400000); // 재직일수
      const start3 = new Date(l);
      start3.setMonth(start3.getMonth() - 3);
      const period = Math.round((l.getTime() - start3.getTime()) / 86400000); // 직전 3개월 일수
      const extra =
        ((parseFloat(bonus) || 0) + (parseFloat(annualLeave) || 0)) * 10000 * (3 / 12);
      const avg = (p3 + extra) / period; // 1일 평균임금
      const pay = avg * 30 * (days / 365);
      result = { days, avg, pay };
    }
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>입사일</label>
            <input type="date" value={join} onChange={(e) => setJoin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>퇴사일 (마지막 근무 다음 날)</label>
            <input type="date" value={leave} onChange={(e) => setLeave(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>최근 3개월 급여 합계 (만원)</label>
          <input
            type="number" inputMode="numeric" value={months3}
            onChange={(e) => setMonths3(e.target.value)}
            placeholder="예: 1200 (월 400만원 × 3개월)" className={inputCls}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>연간 상여금 (만원, 선택)</label>
            <input type="number" inputMode="numeric" value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="없으면 비움" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>연차수당 (만원, 선택)</label>
            <input type="number" inputMode="numeric" value={annualLeave} onChange={(e) => setAnnualLeave(e.target.value)} placeholder="없으면 비움" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {error ? (
          <p className="text-center text-rose-600 font-bold">{error}</p>
        ) : result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">예상 퇴직금 (세전)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.pay)}원</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">재직일수</span>
                <p className="font-black text-slate-800">{result.days.toLocaleString("ko-KR")}일</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">1일 평균임금</span>
                <p className="font-black text-slate-800">{won(result.avg)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              퇴직금 = 1일 평균임금 × 30일 × (재직일수 ÷ 365). 세전 기준이며 퇴직소득세는 별도입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            입사일·퇴사일과 최근 3개월 급여를 입력하면 예상 퇴직금이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
