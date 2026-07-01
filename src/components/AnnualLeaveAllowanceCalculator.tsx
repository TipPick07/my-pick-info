"use client";

import { useState } from "react";

/**
 * 연차수당 계산기 — 통상임금 기반. 참고용.
 * 연차수당 = 1일 통상임금 × 미사용 연차일수
 * 통상시급 = 월 통상임금 / 월 소정근로시간(주40시간 = 209h)
 * 1일 통상임금 = 통상시급 × 1일 소정근로시간(기본 8h)
 */
export default function AnnualLeaveAllowanceCalculator() {
  const [pay, setPay] = useState(""); // 월 통상임금(만원)
  const [days, setDays] = useState(""); // 미사용 연차 일수
  const [monHours, setMonHours] = useState(""); // 월 소정근로시간(기본 209)
  const [dayHours, setDayHours] = useState(""); // 1일 소정근로시간(기본 8)

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const monthly = (parseFloat(pay) || 0) * 10000;
  const d = parseFloat(days) || 0;
  const mh = parseFloat(monHours) || 209;
  const dh = parseFloat(dayHours) || 8;

  let result: { hourly: number; daily: number; allowance: number } | null = null;
  let error = "";
  if (pay && days) {
    if (monthly <= 0 || d <= 0) {
      error = "월 통상임금과 미사용 연차 일수를 정확히 입력하세요.";
    } else if (mh <= 0 || dh <= 0) {
      error = "소정근로시간은 0보다 커야 합니다.";
    } else {
      const hourly = Math.round(monthly / mh);
      const daily = Math.round(hourly * dh);
      const allowance = daily * d;
      result = { hourly, daily, allowance };
    }
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>월 통상임금 (만원)</label>
          <input
            type="number" inputMode="numeric" value={pay}
            onChange={(e) => setPay(e.target.value)}
            placeholder="예: 300 (기본급 + 고정수당, 월 300만원)" className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>미사용 연차 일수 (일)</label>
          <input
            type="number" inputMode="numeric" value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="예: 5" className={inputCls}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>월 소정근로시간 (선택)</label>
            <input type="number" inputMode="numeric" value={monHours} onChange={(e) => setMonHours(e.target.value)} placeholder="기본 209 (주 40시간)" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>1일 소정근로시간 (선택)</label>
            <input type="number" inputMode="numeric" value={dayHours} onChange={(e) => setDayHours(e.target.value)} placeholder="기본 8" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {error ? (
          <p className="text-center text-rose-600 font-bold">{error}</p>
        ) : result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">예상 연차수당 (세전)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.allowance)}원</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">통상시급</span>
                <p className="font-black text-slate-800">{won(result.hourly)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">1일 통상임금</span>
                <p className="font-black text-slate-800">{won(result.daily)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              연차수당 = 1일 통상임금 × 미사용 연차일수. 통상시급 = 월 통상임금 ÷ 월 소정근로시간(주 40시간 = 209시간). 세전 기준입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월 통상임금과 미사용 연차 일수를 입력하면 연차수당이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
