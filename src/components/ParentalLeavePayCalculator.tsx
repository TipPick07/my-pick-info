"use client";

import { useState } from "react";

/**
 * 육아휴직급여 계산기 — 2025년 개편 기준(고용노동부). 참고용.
 * 일반: 1~3개월 통상임금 100%(상한 250만) / 4~6개월 100%(상한 200만) / 7~12개월 80%(상한 160만), 하한 70만.
 * 6+6 부모육아휴직제: 부모 각각 첫 6개월 통상임금 100%, 월 상한 250·250·300·350·400·450만, 7개월~ 80%(160만).
 * 사후지급금 폐지 → 급여 전액을 휴직 기간 중 매월 지급.
 */
const LOWER = 700000; // 하한 70만원

type Mode = "normal" | "sixplussix";

function monthlyPay(month: number, ordinary: number, mode: Mode): number {
  let rate: number;
  let cap: number;
  if (mode === "sixplussix" && month <= 6) {
    const caps = [2500000, 2500000, 3000000, 3500000, 4000000, 4500000];
    rate = 1;
    cap = caps[month - 1];
  } else if (month <= 3) {
    rate = 1;
    cap = 2500000;
  } else if (month <= 6) {
    rate = 1;
    cap = 2000000;
  } else {
    rate = 0.8;
    cap = 1600000;
  }
  const base = Math.min(ordinary * rate, cap);
  // 하한 70만원 보장(단, 통상임금이 그보다 낮으면 통상임금까지만)
  return Math.min(ordinary, Math.max(base, LOWER));
}

export default function ParentalLeavePayCalculator() {
  const [wage, setWage] = useState(""); // 월 통상임금(만원)
  const [months, setMonths] = useState("12");
  const [mode, setMode] = useState<Mode>("normal");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const ordinary = (parseFloat(wage) || 0) * 10000;
  const m = parseInt(months, 10) || 0;

  let result: { total: number; avg: number; rows: { label: string; amount: number }[] } | null = null;
  if (ordinary > 0 && m >= 1 && m <= 12) {
    let total = 0;
    const rows: { label: string; amount: number }[] = [];
    for (let i = 1; i <= m; i++) {
      const pay = monthlyPay(i, ordinary, mode);
      total += pay;
      rows.push({ label: i + "개월차", amount: pay });
    }
    result = { total, avg: total / m, rows };
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  const tabCls = (active: boolean) =>
    "flex-1 rounded-xl px-4 py-3 text-sm font-black transition-colors " +
    (active
      ? "bg-brand text-white shadow-sm"
      : "bg-slate-100 text-slate-500 hover:bg-slate-200");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("normal")} className={tabCls(mode === "normal")}>
            일반 육아휴직
          </button>
          <button type="button" onClick={() => setMode("sixplussix")} className={tabCls(mode === "sixplussix")}>
            6+6 부모육아휴직제
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>월 통상임금 (만원)</label>
            <input
              type="number"
              inputMode="numeric"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="예: 300 (세전 월 통상임금)"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>육아휴직 사용 개월수</label>
            <select value={months} onChange={(e) => setMonths(e.target.value)} className={inputCls}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}개월
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {mode === "sixplussix"
            ? "6+6 부모육아휴직제는 생후 18개월 이내 자녀에 대해 부모가 모두 휴직할 때, 첫 6개월간 부모 각자에게 통상임금 100%(월 상한 250·250·300·350·400·450만 원)를 지급합니다. 아래 결과는 한 사람 기준입니다."
            : "일반 육아휴직급여는 1~3개월 통상임금 100%(상한 250만), 4~6개월 100%(상한 200만), 7개월 이후 80%(상한 160만)로 지급됩니다."}
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">
                예상 육아휴직급여 총액 {mode === "sixplussix" ? "(1인 기준)" : ""}
              </p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.total)}원</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">사용 개월수</span>
                <p className="font-black text-slate-800">{m}개월</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월평균 급여</span>
                <p className="font-black text-slate-800">{won(result.avg)}원</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">월별 지급액</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
                {result.rows.map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="font-bold text-slate-800">{won(r.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              통상임금 100%(또는 80%) 중 월 상한·하한(70만 원)을 적용한 세전 금액입니다. 실제 지급액은
              통상임금 산정과 근무일수에 따라 달라질 수 있습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월 통상임금과 사용 개월수를 입력하면 예상 육아휴직급여가 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
