"use client";

import { useMemo, useState } from "react";

/**
 * 4대보험 계산기 — 근로자 부담분(국민연금·건강·장기요양·고용).
 * 모든 요율은 고정 상수라 정확히 계산. 변동 시 아래 상수만 수정.
 */
const RATE_PENSION = 0.045; // 국민연금 4.5%(근로자)
const PENSION_FLOOR = 400_000; // 기준소득월액 하한(2025.7~2026.6)
const PENSION_CAP = 6_370_000; // 기준소득월액 상한(2025.7~2026.6)
const RATE_HEALTH = 0.03545; // 건강보험 3.545%(근로자)
const RATE_LONGTERM = 0.1295; // 장기요양 = 건강보험료 × 12.95%
const RATE_EMPLOYMENT = 0.009; // 고용보험 0.9%(근로자)

function parseManwon(v: string): number {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 ? n * 10_000 : 0;
}
function won(v: number): string {
  return `${Math.round(v).toLocaleString("ko-KR")}원`;
}

export default function InsuranceCalculator() {
  const [salaryManwon, setSalaryManwon] = useState("300"); // 월 급여(만원)

  const r = useMemo(() => {
    const salary = parseManwon(salaryManwon);
    const pensionBase =
      salary <= 0 ? 0 : Math.min(Math.max(salary, PENSION_FLOOR), PENSION_CAP);
    const pension = pensionBase * RATE_PENSION;
    const health = salary * RATE_HEALTH;
    const longterm = health * RATE_LONGTERM;
    const employment = salary * RATE_EMPLOYMENT;
    const total = pension + health + longterm + employment;
    return { salary, pension, health, longterm, employment, total, net: salary - total };
  }, [salaryManwon]);

  const rows: ReadonlyArray<{ label: string; value: number }> = [
    { label: "국민연금 (4.5%)", value: r.pension },
    { label: "건강보험 (3.545%)", value: r.health },
    { label: "장기요양 (건강료의 12.95%)", value: r.longterm },
    { label: "고용보험 (0.9%)", value: r.employment },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-brand focus:outline-none";
  const labelClass = "text-sm font-bold text-slate-700";

  return (
    <section className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 md:p-8">
      <p className="mb-6 inline-flex items-start gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-xs md:text-sm font-bold text-emerald-700">
        ✅ 2026년 기준 고정 요율로 계산한 근로자 부담분입니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">조건 입력</h2>
          <div className="space-y-2">
            <label htmlFor="ins-salary" className={labelClass}>월 급여 (만원)</label>
            <input id="ins-salary" type="number" inputMode="numeric" min={0}
              value={salaryManwon} onChange={(e) => setSalaryManwon(e.target.value)}
              className={inputClass} placeholder="예: 300" />
            <p className="text-xs text-slate-400">세전 월 급여(비과세 제외 보수월액)를 만원 단위로</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            국민연금은 기준소득월액 <span className="font-bold text-slate-800">상한 637만원</span>까지만 부과됩니다.
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">근로자 부담 내역</h2>
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-600">{row.label}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{won(row.value)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-black text-slate-700">합계 (근로자)</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">{won(r.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-slate-900 px-6 py-6 text-center">
            <p className="text-sm font-bold text-slate-300">월 4대보험 공제액 (근로자)</p>
            <p className="mt-1 text-3xl md:text-4xl font-black text-emerald-400 tabular-nums">{won(r.total)}</p>
            <p className="mt-3 text-sm text-slate-400">
              공제 후 약 <span className="font-bold text-white">{won(r.net)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
