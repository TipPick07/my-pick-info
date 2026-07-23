"use client";

import { useState } from "react";

/**
 * 육아기 근로시간 단축 급여 계산기 (2026 기준).
 *
 * 고용보험 지급식:
 *   ① 매주 최초 10시간 단축분 = 월 통상임금(상한 250만·하한 50만) × 10 / 단축 전 소정근로시간
 *   ② 나머지 단축분        = 월 통상임금의 80%(상한 160만·하한 50만) × (단축시간 − 10) / 단축 전 소정근로시간
 * 회사 급여는 단축 후 근로시간에 비례한다고 가정(통상임금 × 잔여시간 / 원래시간).
 * 제도 요건: 단축 후 주 15~35시간(주 40시간 근무자는 최소 5시간~최대 25시간 단축).
 */
const CAP_FIRST = 2_500_000; // 최초 10시간분 상한(2026, 220만→250만)
const CAP_REST = 1_600_000; // 나머지 단축분 상한(2026, 150만→160만)
const FLOOR = 500_000; // 하한

export default function ReducedWorkHoursPayCalculator() {
  const [wage, setWage] = useState("3500000");
  const [baseHours, setBaseHours] = useState("40");
  const [cutHours, setCutHours] = useState("10");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const w = parseFloat(wage) || 0;
  const bh = parseFloat(baseHours) || 0;
  const cut = parseFloat(cutHours) || 0;
  const left = bh - cut;

  // ① 최초 10시간분 (단축이 10시간 미만이면 그 시간만큼만)
  const firstHours = Math.min(cut, 10);
  const base1 = Math.max(Math.min(w, CAP_FIRST), FLOOR);
  const pay1 = bh > 0 ? (base1 * firstHours) / bh : 0;

  // ② 나머지 단축분
  const restHours = Math.max(cut - 10, 0);
  const base2 = Math.max(Math.min(w * 0.8, CAP_REST), FLOOR);
  const pay2 = bh > 0 && restHours > 0 ? (base2 * restHours) / bh : 0;

  const salary = bh > 0 ? (w * left) / bh : 0;
  const total = salary + pay1 + pay2;
  const ratio = w > 0 ? (total / w) * 100 : 0;

  const valid = w > 0 && bh > 0 && cut > 0 && left > 0;
  const outOfRange = valid && (left < 15 || left > 35);

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const chipCls = (on: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-black transition-colors ${
      on ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>월 통상임금 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            placeholder="예: 3500000"
            className={inputCls}
          />
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            기본급 + 고정수당 기준입니다. 성과급·초과근무수당처럼 매달 달라지는 항목은 통상임금에
            들어가지 않는 것이 원칙이에요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>단축 전 주 소정근로시간</label>
            <input
              type="number"
              inputMode="numeric"
              value={baseHours}
              onChange={(e) => setBaseHours(e.target.value)}
              placeholder="예: 40"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>주당 줄이는 시간</label>
            <input
              type="number"
              inputMode="numeric"
              value={cutHours}
              onChange={(e) => setCutHours(e.target.value)}
              placeholder="예: 10"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[5, 10, 15, 20].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setCutHours(String(h))}
              className={chipCls(cut === h)}
            >
              주 {h}시간 {h === 20 ? "(반일)" : `(하루 ${h / 5}h)`}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {valid ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">단축 기간 월 실수령 합계</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                원래 통상임금의 {ratio.toFixed(1)}% · 주 {left}시간 근무
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">회사 급여</span>
                <p className="font-black text-slate-800">{won(salary)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">① 최초 {firstHours}시간분</span>
                <p className="font-black text-brand-dark">{won(pay1)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">② 나머지 {restHours}시간분</span>
                <p className="font-black text-brand-dark">{won(pay2)}원</p>
              </div>
            </div>
            {outOfRange && (
              <p className="text-xs font-bold text-amber-600">
                단축 후 근로시간이 주 {left}시간입니다. 육아기 근로시간 단축은 단축 후 주 15시간 이상
                35시간 이하일 때만 쓸 수 있어요.
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              2026년 기준 — ① 매주 최초 10시간 단축분은 통상임금 100%(상한 250만 원), ② 나머지
              단축분은 통상임금 80%(상한 160만 원)로 계산하며 각각 하한 50만 원이 적용됩니다. 회사
              급여는 단축 시간에 정확히 비례한다고 가정한 값이라 실제 급여 규정과 다를 수 있고, 월
              중간에 시작하면 일할 계산됩니다. 4대보험·세금 공제 전 금액이에요.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            통상임금과 근로시간을 입력하면 단축 기간의 월 실수령액이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
