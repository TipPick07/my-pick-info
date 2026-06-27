"use client";

import { useMemo, useState } from "react";

/**
 * 종합소득세 계산기 — 산출세액은 누진세율로 '정확히' 계산(근사 아님).
 * 세액공제는 케이스별이라 미반영(과세표준→산출세액→지방소득세까지).
 * 요율/구간 변동 시 아래 TAX_BRACKETS만 수정.
 */
// 2026년 기준 종합소득세 과세표준 누진세율 [구간 상한(원), 세율]
const TAX_BRACKETS: ReadonlyArray<readonly [number, number]> = [
  [14_000_000, 0.06],
  [50_000_000, 0.15],
  [88_000_000, 0.24],
  [150_000_000, 0.35],
  [300_000_000, 0.38],
  [500_000_000, 0.40],
  [1_000_000_000, 0.42],
  [Infinity, 0.45],
];
const RATE_LOCAL = 0.1; // 지방소득세 = 산출세액 × 10%

/** 과세표준(원) → 산출세액(원). 구간 누적 방식(누진공제와 수학적으로 동일). */
function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of TAX_BRACKETS) {
    if (base <= upper) {
      tax += (base - lower) * rate;
      break;
    }
    tax += (upper - lower) * rate;
    lower = upper;
  }
  return tax;
}
function parseManwon(v: string): number {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 ? n * 10_000 : 0;
}
function won(v: number): string {
  return `${Math.round(v).toLocaleString("ko-KR")}원`;
}

export default function IncomeTaxCalculator() {
  const [incomeManwon, setIncomeManwon] = useState("5000"); // 종합소득금액(만원)
  const [deductionManwon, setDeductionManwon] = useState("150"); // 소득공제 합계(만원)

  const r = useMemo(() => {
    const income = parseManwon(incomeManwon);
    const deduction = parseManwon(deductionManwon);
    const base = Math.max(income - deduction, 0);
    const tax = progressiveTax(base);
    const local = tax * RATE_LOCAL;
    const total = tax + local;
    const effRate = income > 0 ? (total / income) * 100 : 0;
    return { base, tax, local, total, effRate };
  }, [incomeManwon, deductionManwon]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-brand focus:outline-none";
  const labelClass = "text-sm font-bold text-slate-700";

  return (
    <section className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 md:p-8">
      <p className="mb-6 inline-flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs md:text-sm font-bold text-amber-700">
        ⚠️ 산출세액은 정확히 계산하나, 세액공제·감면은 미반영한 참고용입니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">조건 입력</h2>

          <div className="space-y-2">
            <label htmlFor="it-income" className={labelClass}>종합소득금액 (만원)</label>
            <input id="it-income" type="number" inputMode="numeric" min={0}
              value={incomeManwon} onChange={(e) => setIncomeManwon(e.target.value)}
              className={inputClass} placeholder="예: 5000" />
            <p className="text-xs text-slate-400">근로·사업·기타 등 합산 소득금액(만원)</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="it-deduction" className={labelClass}>소득공제 합계 (만원)</label>
            <input id="it-deduction" type="number" inputMode="numeric" min={0}
              value={deductionManwon} onChange={(e) => setDeductionManwon(e.target.value)}
              className={inputClass} placeholder="예: 150" />
            <p className="text-xs text-slate-400">인적공제 등(기본: 본인 150만원)</p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            과세표준{" "}
            <span className="font-black text-slate-900">{won(r.base)}</span> 기준으로 계산됩니다.
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">세액 결과</h2>
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">과세표준</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{won(r.base)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">산출세액(소득세)</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{won(r.tax)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">지방소득세 (10%)</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{won(r.local)}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-black text-slate-700">총 납부세액</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">{won(r.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-slate-900 px-6 py-6 text-center">
            <p className="text-sm font-bold text-slate-300">총 납부세액 (지방세 포함)</p>
            <p className="mt-1 text-3xl md:text-4xl font-black text-emerald-400 tabular-nums">{won(r.total)}</p>
            <p className="mt-3 text-sm text-slate-400">
              실효세율 약 <span className="font-bold text-white">{r.effRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
