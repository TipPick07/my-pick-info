"use client";

import { useState } from "react";

const MIN_WAGE = 10320; // 2026년 최저시급

/**
 * 시급·주휴수당 계산기.
 * 주휴시간 = 주 소정근로 15시간 이상일 때 min(8, 주소정/40 × 8)
 * 주급 = (주 소정근로 + 주휴시간) × 시급 / 월 환산 = 주급 × 4.345
 */
export default function HourlyWageCalculator() {
  const [wage, setWage] = useState("10320");
  const [hours, setHours] = useState("40"); // 주 소정근로시간

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const w = parseFloat(wage) || 0;
  const h = parseFloat(hours) || 0;

  const holidayHours = h >= 15 ? Math.min(8, (h / 40) * 8) : 0; // 주휴시간
  const holidayPay = holidayHours * w; // 주휴수당
  const weeklyPay = (h + holidayHours) * w; // 주급(주휴 포함)
  const monthlyPay = weeklyPay * 4.345; // 월 환산
  const belowMin = w > 0 && w < MIN_WAGE;
  const show = w > 0 && h > 0;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>시급 (원)</label>
            <input
              type="number" inputMode="numeric" value={wage}
              onChange={(e) => setWage(e.target.value)} placeholder="예: 10320" className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-400">2026년 최저시급 10,320원</p>
          </div>
          <div>
            <label className={labelCls}>주 근무시간 (소정근로)</label>
            <input
              type="number" inputMode="numeric" value={hours}
              onChange={(e) => setHours(e.target.value)} placeholder="예: 40" className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-400">주 15시간 이상이면 주휴수당 발생</p>
          </div>
        </div>
        {belowMin && (
          <p className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-bold text-rose-600">
            ⚠️ 입력한 시급이 2026년 최저시급(10,320원)보다 낮습니다.
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {show ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">주급 (주휴수당 포함)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(weeklyPay)}원</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">주휴시간</span>
                <p className="font-black text-slate-800">{holidayHours.toFixed(1)}시간</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">주휴수당</span>
                <p className="font-black text-slate-800">{won(holidayPay)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월 환산(약)</span>
                <p className="font-black text-slate-800">{won(monthlyPay)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              주휴수당 = 주휴시간 × 시급 / 월 환산은 주급 × 4.345주 기준의 근사치입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            시급과 주 근무시간을 입력하면 주휴수당과 주급·월급이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
