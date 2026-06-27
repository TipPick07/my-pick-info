"use client";

import { useMemo, useState } from "react";

/**
 * 연봉 실수령액 계산기 (참고용 근사치)
 *
 * ▷ "use client" — useState/useMemo 인터랙티브 위젯. 라우트 page.tsx(서버)에서 import.
 * ▷ 소득세는 근로소득 간이세액의 단순 근사치(연환산→근로소득공제→기본공제→종합소득세
 *    누진세율→근로소득세액공제 근사)로 계산하므로 실제 원천징수액과 다를 수 있습니다.
 * ▷ 요율 변동 시 아래 CONSTANTS 블록만 수정하면 됩니다.
 */

// ─────────────────────────────────────────────────────────────
// 2026년 기준(요율 변동 시 이 상수만 수정)
// ─────────────────────────────────────────────────────────────
const RATE_PENSION = 0.045; // 국민연금 4.5%(근로자 부담)
const PENSION_BASE_CAP = 6_370_000; // 국민연금 기준소득월액 상한(2025.7~2026.6) — 초과분 미부과
const PENSION_BASE_FLOOR = 400_000; // 국민연금 기준소득월액 하한(2025.7~2026.6)
const RATE_HEALTH = 0.03545; // 건강보험 3.545%(근로자 부담)
const RATE_LONGTERM = 0.1295; // 장기요양보험 = 건강보험료 × 12.95%
const RATE_EMPLOYMENT = 0.009; // 고용보험 0.9%(근로자 부담)
const RATE_LOCAL_INCOME = 0.1; // 지방소득세 = 소득세 × 10%

const BASIC_DEDUCTION_PER_PERSON = 1_500_000; // 인적공제(기본공제) 1인당 연 150만원

// 종합소득세 누진세율(2024년 과세표준 구간 기준)
// [상한(원), 세율] — 상한 초과 시 다음 구간 적용
const TAX_BRACKETS: ReadonlyArray<readonly [number, number]> = [
  [14_000_000, 0.06],
  [50_000_000, 0.15],
  [88_000_000, 0.24],
  [150_000_000, 0.35],
  [300_000_000, 0.38],
  [500_000_000, 0.4],
  [1_000_000_000, 0.42],
  [Infinity, 0.45],
];

// ─────────────────────────────────────────────────────────────
// 보조 계산 함수
// ─────────────────────────────────────────────────────────────

/** 근로소득공제(총급여 기준, 연액) — 2024 기준 구간식 근사 */
function earnedIncomeDeduction(totalAnnualSalary: number): number {
  const s = totalAnnualSalary;
  if (s <= 0) return 0;
  if (s <= 5_000_000) return s * 0.7;
  if (s <= 15_000_000) return 3_500_000 + (s - 5_000_000) * 0.4;
  if (s <= 45_000_000) return 7_500_000 + (s - 15_000_000) * 0.15;
  if (s <= 100_000_000) return 12_000_000 + (s - 45_000_000) * 0.05;
  return 14_750_000 + (s - 100_000_000) * 0.02;
}

/** 종합소득세 누진세율 적용 — 과세표준(연) → 산출세액(연) */
function progressiveIncomeTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of TAX_BRACKETS) {
    if (taxBase <= upper) {
      tax += (taxBase - lower) * rate;
      break;
    }
    tax += (upper - lower) * rate;
    lower = upper;
  }
  return tax;
}

/** 근로소득세액공제(산출세액 기준) 근사 — 한도 단순화 적용 */
function earnedIncomeTaxCredit(calculatedTax: number): number {
  if (calculatedTax <= 0) return 0;
  // 산출세액 130만원 이하 55%, 초과분 30%
  const base =
    calculatedTax <= 1_300_000
      ? calculatedTax * 0.55
      : 715_000 + (calculatedTax - 1_300_000) * 0.3;
  // 한도 단순화: 일반적으로 적용되는 66만~74만원 구간 중 보수적으로 660,000원 상한
  return Math.min(base, 660_000);
}

/** 숫자 입력 안전 파싱: 빈값/NaN/음수 → 0 */
function parseNumber(value: string): number {
  const n = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** 천단위 콤마 + "원" */
function won(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

interface SalaryResult {
  grossMonthly: number; // 월 급여(연봉/12)
  taxableMonthly: number; // 과세대상 월 급여(월급 - 비과세)
  pension: number;
  health: number;
  longterm: number;
  employment: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  netMonthly: number;
  netAnnual: number;
}

export default function SalaryCalculator() {
  // 입력 상태(controlled) — 문자열로 보관해 빈칸 허용
  const [annualManwon, setAnnualManwon] = useState("4000"); // 연봉(만원)
  const [nonTax, setNonTax] = useState("200000"); // 월 비과세액(원)
  const [dependents, setDependents] = useState("1"); // 부양가족 수(본인 포함)
  const [children, setChildren] = useState("0"); // 20세 이하 자녀 수

  const result = useMemo<SalaryResult>(() => {
    const annual = parseNumber(annualManwon) * 10_000; // 만원 → 원
    const nonTaxMonthly = parseNumber(nonTax);
    const familyCount = Math.max(parseNumber(dependents), 1); // 최소 본인 1명
    const childCount = parseNumber(children);

    const grossMonthly = annual / 12;
    const taxableMonthly = Math.max(grossMonthly - nonTaxMonthly, 0);

    // 4대보험 — 과세대상(비과세 제외) 월급 기준, 국민연금은 상한 적용
    const pensionBase = taxableMonthly <= 0 ? 0 : Math.min(Math.max(taxableMonthly, PENSION_BASE_FLOOR), PENSION_BASE_CAP);
    const pension = pensionBase * RATE_PENSION;
    const health = taxableMonthly * RATE_HEALTH;
    const longterm = health * RATE_LONGTERM;
    const employment = taxableMonthly * RATE_EMPLOYMENT;

    // 소득세(간이세액 근사)
    const annualTaxableSalary = taxableMonthly * 12; // 연 총급여(과세분)
    const eiDeduction = earnedIncomeDeduction(annualTaxableSalary);
    // 인적공제: 본인 포함 부양가족 + 20세 이하 자녀(추가 1인당 기본공제 반영)
    const personalDeduction =
      (familyCount + childCount) * BASIC_DEDUCTION_PER_PERSON;
    const taxBase = Math.max(
      annualTaxableSalary - eiDeduction - personalDeduction,
      0
    );
    const calculatedAnnualTax = progressiveIncomeTax(taxBase);
    const taxCredit = earnedIncomeTaxCredit(calculatedAnnualTax);
    const annualIncomeTax = Math.max(calculatedAnnualTax - taxCredit, 0);
    const incomeTax = annualIncomeTax / 12;
    const localIncomeTax = incomeTax * RATE_LOCAL_INCOME;

    const totalDeduction =
      pension + health + longterm + employment + incomeTax + localIncomeTax;
    const netMonthly = grossMonthly - totalDeduction;

    return {
      grossMonthly,
      taxableMonthly,
      pension,
      health,
      longterm,
      employment,
      incomeTax,
      localIncomeTax,
      totalDeduction,
      netMonthly,
      netAnnual: netMonthly * 12,
    };
  }, [annualManwon, nonTax, dependents, children]);

  const deductionRows: ReadonlyArray<{ label: string; value: number }> = [
    { label: "국민연금 (4.5%)", value: result.pension },
    { label: "건강보험 (3.545%)", value: result.health },
    { label: "장기요양보험", value: result.longterm },
    { label: "고용보험 (0.9%)", value: result.employment },
    { label: "소득세 (근사)", value: result.incomeTax },
    { label: "지방소득세", value: result.localIncomeTax },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-brand focus:outline-none";
  const labelClass = "text-sm font-bold text-slate-700";

  return (
    <section className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 md:p-8">
      {/* 근사치 안내 배지 */}
      <p className="mb-6 inline-flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs md:text-sm font-bold text-amber-700">
        ⚠️ 참고용 근사치이며 실제 원천징수액과 다를 수 있습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── 입력부 ── */}
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">조건 입력</h2>

          <div className="space-y-2">
            <label htmlFor="salary-annual" className={labelClass}>
              연봉 (만원)
            </label>
            <input
              id="salary-annual"
              type="number"
              inputMode="numeric"
              min={0}
              value={annualManwon}
              onChange={(e) => setAnnualManwon(e.target.value)}
              className={inputClass}
              placeholder="예: 4000"
            />
            <p className="text-xs text-slate-400">
              만원 단위로 입력 (예: 4000 = 4,000만원)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="salary-nontax" className={labelClass}>
              월 비과세액 (원)
            </label>
            <input
              id="salary-nontax"
              type="number"
              inputMode="numeric"
              min={0}
              value={nonTax}
              onChange={(e) => setNonTax(e.target.value)}
              className={inputClass}
              placeholder="예: 200000"
            />
            <p className="text-xs text-slate-400">식대 등 비과세 항목(기본 20만원)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="salary-dependents" className={labelClass}>
                부양가족 수
              </label>
              <input
                id="salary-dependents"
                type="number"
                inputMode="numeric"
                min={1}
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                className={inputClass}
                placeholder="1"
              />
              <p className="text-xs text-slate-400">본인 포함</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="salary-children" className={labelClass}>
                20세 이하 자녀
              </label>
              <input
                id="salary-children"
                type="number"
                inputMode="numeric"
                min={0}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
              <p className="text-xs text-slate-400">자녀 수</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            세전 월 급여{" "}
            <span className="font-black text-slate-900">
              {won(result.grossMonthly)}
            </span>{" "}
            기준으로 계산됩니다.
          </div>
        </div>

        {/* ── 결과부 ── */}
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">공제 내역</h2>

          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {deductionRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-600">{row.label}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                      {won(row.value)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-black text-slate-700">공제 합계</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">
                    {won(result.totalDeduction)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 월 실수령액 강조 */}
          <div className="rounded-2xl bg-slate-900 px-6 py-6 text-center">
            <p className="text-sm font-bold text-slate-300">월 예상 실수령액</p>
            <p className="mt-1 text-3xl md:text-4xl font-black text-emerald-400 tabular-nums">
              {won(result.netMonthly)}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              연 실수령액 약{" "}
              <span className="font-bold text-white">{won(result.netAnnual)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
