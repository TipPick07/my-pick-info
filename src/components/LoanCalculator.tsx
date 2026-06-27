"use client";

import { useMemo, useState } from "react";

/**
 * 대출 이자 계산기 — 원리금균등 / 원금균등 / 만기일시
 *
 * ▷ "use client" — useState/useMemo 인터랙티브 위젯. 라우트 page.tsx(서버)에서 import.
 * ▷ 상환 방식별 정확한 상환액 산식을 사용. 단, 실제 대출은 금융기관 조건에 따라 달라집니다.
 */

type RepaymentType = "원리금균등" | "원금균등" | "만기일시";

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

interface ScheduleRow {
  month: number; // 회차
  payment: number; // 납입금
  principal: number; // 원금
  interest: number; // 이자
  balance: number; // 잔액
}

interface LoanResult {
  type: RepaymentType;
  monthlyPayment: number; // 원리금균등 월 상환금 / 만기일시 월 이자
  firstPayment: number; // 원금균등 첫 달 상환액
  lastPayment: number; // 원금균등 마지막 달 상환액
  totalInterest: number; // 총 이자
  totalPayment: number; // 총 상환액
  schedule: ScheduleRow[]; // 첫 12개월 상환 스케줄
}

function calcLoan(
  principal: number,
  annualRatePct: number,
  months: number,
  type: RepaymentType
): LoanResult {
  const r = annualRatePct / 100 / 12; // 월 이자율
  const n = Math.max(Math.round(months), 0);

  const empty: LoanResult = {
    type,
    monthlyPayment: 0,
    firstPayment: 0,
    lastPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    schedule: [],
  };

  if (principal <= 0 || n <= 0) return empty;

  const schedule: ScheduleRow[] = [];
  const rows = Math.min(n, 12);

  if (type === "원리금균등") {
    // M = P·r·(1+r)^n / ((1+r)^n − 1)
    const monthly =
      r === 0
        ? principal / n
        : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - principal;

    let balance = principal;
    for (let m = 1; m <= rows; m++) {
      const interest = balance * r;
      const principalPart = monthly - interest;
      balance = Math.max(balance - principalPart, 0);
      schedule.push({
        month: m,
        payment: monthly,
        principal: principalPart,
        interest,
        balance,
      });
    }

    return {
      type,
      monthlyPayment: monthly,
      firstPayment: monthly,
      lastPayment: monthly,
      totalInterest,
      totalPayment,
      schedule,
    };
  }

  if (type === "원금균등") {
    // 매달 원금 = P/n, 이자 = 잔액×r → 상환액 점감
    const principalEach = principal / n;
    let balance = principal;
    let totalInterest = 0;

    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      totalInterest += interest;
      const payment = principalEach + interest;
      balance = Math.max(balance - principalEach, 0);
      if (m <= rows) {
        schedule.push({
          month: m,
          payment,
          principal: principalEach,
          interest,
          balance,
        });
      }
    }

    const firstPayment = principalEach + principal * r; // 첫 달(잔액 = 전액)
    const lastPayment = principalEach + principalEach * r; // 마지막 달(잔액 = 1회분)
    const totalPayment = principal + totalInterest;

    return {
      type,
      monthlyPayment: 0,
      firstPayment,
      lastPayment,
      totalInterest,
      totalPayment,
      schedule,
    };
  }

  // 만기일시: 매달 이자만(P×r), 만기에 원금 일시 상환
  const monthlyInterest = principal * r;
  const totalInterest = monthlyInterest * n;
  const totalPayment = principal + totalInterest;

  for (let m = 1; m <= rows; m++) {
    const isLast = m === n;
    schedule.push({
      month: m,
      payment: isLast ? monthlyInterest + principal : monthlyInterest,
      principal: isLast ? principal : 0,
      interest: monthlyInterest,
      balance: isLast ? 0 : principal,
    });
  }

  return {
    type,
    monthlyPayment: monthlyInterest,
    firstPayment: monthlyInterest,
    lastPayment: monthlyInterest + principal,
    totalInterest,
    totalPayment,
    schedule,
  };
}

const REPAYMENT_OPTIONS: ReadonlyArray<RepaymentType> = [
  "원리금균등",
  "원금균등",
  "만기일시",
];

export default function LoanCalculator() {
  const [amountManwon, setAmountManwon] = useState("10000"); // 대출 금액(만원) = 1억
  const [ratePct, setRatePct] = useState("4.5"); // 연 이자율 %
  const [years, setYears] = useState("30"); // 대출 기간(년)
  const [type, setType] = useState<RepaymentType>("원리금균등");
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo<LoanResult>(() => {
    const principal = parseNumber(amountManwon) * 10_000; // 만원 → 원
    const annualRatePct = parseNumber(ratePct);
    const months = parseNumber(years) * 12;
    return calcLoan(principal, annualRatePct, months, type);
  }, [amountManwon, ratePct, years, type]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-brand focus:outline-none";
  const labelClass = "text-sm font-bold text-slate-700";

  return (
    <section className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── 입력부 ── */}
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">대출 조건 입력</h2>

          <div className="space-y-2">
            <label htmlFor="loan-amount" className={labelClass}>
              대출 금액 (만원)
            </label>
            <input
              id="loan-amount"
              type="number"
              inputMode="numeric"
              min={0}
              value={amountManwon}
              onChange={(e) => setAmountManwon(e.target.value)}
              className={inputClass}
              placeholder="예: 10000"
            />
            <p className="text-xs text-slate-400">만원 단위 (예: 10000 = 1억원)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loan-rate" className={labelClass}>
                연 이자율 (%)
              </label>
              <input
                id="loan-rate"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={ratePct}
                onChange={(e) => setRatePct(e.target.value)}
                className={inputClass}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="loan-years" className={labelClass}>
                대출 기간 (년)
              </label>
              <input
                id="loan-years"
                type="number"
                inputMode="numeric"
                min={0}
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className={inputClass}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="loan-type" className={labelClass}>
              상환 방식
            </label>
            <select
              id="loan-type"
              value={type}
              onChange={(e) => setType(e.target.value as RepaymentType)}
              className={`${inputClass} bg-white`}
            >
              {REPAYMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            총 상환 기간{" "}
            <span className="font-black text-slate-900">
              {parseNumber(years) * 12}개월
            </span>{" "}
            ({parseNumber(years).toLocaleString("ko-KR")}년)
          </div>
        </div>

        {/* ── 결과부 ── */}
        <div className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">상환 요약</h2>

          {/* 월 상환금 강조 */}
          <div className="rounded-2xl bg-slate-900 px-6 py-6 text-center">
            {result.type === "원금균등" ? (
              <>
                <p className="text-sm font-bold text-slate-300">
                  월 상환금 (첫 달 → 마지막 달)
                </p>
                <p className="mt-1 text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
                  {won(result.firstPayment)}
                </p>
                <p className="mt-1 text-base font-bold text-slate-400 tabular-nums">
                  → {won(result.lastPayment)}
                </p>
              </>
            ) : result.type === "만기일시" ? (
              <>
                <p className="text-sm font-bold text-slate-300">
                  매달 이자 (만기 일시 상환)
                </p>
                <p className="mt-1 text-3xl md:text-4xl font-black text-emerald-400 tabular-nums">
                  {won(result.monthlyPayment)}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  만기에 원금 전액을 일시 상환합니다.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-300">월 상환금 (매달 동일)</p>
                <p className="mt-1 text-3xl md:text-4xl font-black text-emerald-400 tabular-nums">
                  {won(result.monthlyPayment)}
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">총 이자</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-dark tabular-nums">
                    {won(result.totalInterest)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-black text-slate-700">총 상환액</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">
                    {won(result.totalPayment)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-dark transition-colors"
          >
            {showSchedule ? "상환 스케줄 접기" : "첫 12개월 상환 스케줄 보기"}
          </button>
        </div>
      </div>

      {/* ── 상환 스케줄 표(접이식) ── */}
      {showSchedule && result.schedule.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[480px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-3 py-2.5 text-left font-bold">회차</th>
                <th className="px-3 py-2.5 text-right font-bold">납입금</th>
                <th className="px-3 py-2.5 text-right font-bold">원금</th>
                <th className="px-3 py-2.5 text-right font-bold">이자</th>
                <th className="px-3 py-2.5 text-right font-bold">잔액</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.month} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 font-bold text-slate-700">{row.month}회</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-900">
                    {won(row.payment)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {won(row.principal)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {won(row.interest)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {won(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
