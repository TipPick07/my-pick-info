"use client";

import { useState } from "react";

/**
 * 2026 기준 중위소득 계산기 — 가구원수 → 급여별 선정기준(소득인정액 상한).
 * 기준 중위소득(2026, 보건복지부 고시)에 급여별 비율을 곱해 계산.
 *   생계 32% · 의료 40% · 주거 48% · 교육 50%
 */
const BASE: Record<number, number> = {
  1: 2564238,
  2: 4199292,
  3: 5359036,
  4: 6494738,
  5: 7556719,
  6: 8555952,
};

export default function MedianIncomeCalculator() {
  const [size, setSize] = useState(1);

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const base = BASE[size];

  const rows = [
    { key: "생계급여", rate: 0.32, note: "이하면 생계급여 대상", accent: true },
    { key: "의료급여", rate: 0.4, note: "이하면 의료급여 대상" },
    { key: "주거급여", rate: 0.48, note: "이하면 주거급여 대상", accent: true },
    { key: "교육급여", rate: 0.5, note: "이하면 교육급여 대상" },
  ];

  const selectCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>가구원수</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className={selectCls}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}인 가구
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          소득인정액(소득 + 재산 환산액)이 아래 급여별 기준 이하이면 해당 급여 대상입니다. 7인 이상 가구는 주민센터·복지로에서 확인하세요.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8 space-y-4">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-500">{size}인 가구 기준 중위소득 (2026, 100%)</p>
          <p className="mt-1 text-4xl font-black text-brand-dark">{won(base)}원</p>
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.key}
              className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-3"
            >
              <div>
                <span
                  className={`text-sm font-bold ${
                    r.accent ? "text-brand-dark" : "text-slate-700"
                  }`}
                >
                  {r.key}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {Math.round(r.rate * 100)}% · {r.note}
                </span>
              </div>
              <span className="text-base font-black text-slate-800">
                {won(base * r.rate)}원
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          각 금액은 급여별 소득인정액 상한(월)입니다. 생계급여는 이 기준액에서 소득인정액을 뺀 부족분을 지원합니다. 2026년 기준 중위소득 고시 기준 참고용.
        </p>
      </div>
    </div>
  );
}
