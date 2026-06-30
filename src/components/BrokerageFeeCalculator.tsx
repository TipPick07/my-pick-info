"use client";

import { useState } from "react";

/**
 * 부동산 중개보수(복비) 계산기.
 * - 거래금액 구간별 법정 상한요율 × 거래금액, 한도액이 있으면 min(계산값, 한도).
 * - 월세 거래금액 = 보증금 + 월세 × 100. 단 그 값이 5천만원 미만이면 보증금 + 월세 × 70.
 * - 부가세(중개사 일반과세 시 10%)는 옵션으로 가산.
 * 출처: 공인중개사법 시행규칙 별표/지자체 조례 표준 상한요율(2021.10.19 개정, 2026 유지).
 */
type Mode = "sale" | "lease";
type Bracket = { upper: number; rate: number; cap: number | null };

const SALE: Bracket[] = [
  { upper: 50_000_000, rate: 0.006, cap: 250_000 },
  { upper: 200_000_000, rate: 0.005, cap: 800_000 },
  { upper: 900_000_000, rate: 0.004, cap: null },
  { upper: 1_200_000_000, rate: 0.005, cap: null },
  { upper: 1_500_000_000, rate: 0.006, cap: null },
  { upper: Infinity, rate: 0.007, cap: null },
];
const LEASE: Bracket[] = [
  { upper: 50_000_000, rate: 0.005, cap: 200_000 },
  { upper: 100_000_000, rate: 0.004, cap: 300_000 },
  { upper: 600_000_000, rate: 0.003, cap: null },
  { upper: 1_200_000_000, rate: 0.004, cap: null },
  { upper: 1_500_000_000, rate: 0.005, cap: null },
  { upper: Infinity, rate: 0.006, cap: null },
];

function pick(amount: number, table: Bracket[]): Bracket {
  for (const b of table) {
    if (amount < b.upper) return b;
  }
  return table[table.length - 1];
}

export default function BrokerageFeeCalculator() {
  const [mode, setMode] = useState<Mode>("sale");
  const [price, setPrice] = useState("500000000");
  const [deposit, setDeposit] = useState("300000000");
  const [rent, setRent] = useState("0");
  const [vat, setVat] = useState(false);

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const P = parseFloat(price) || 0;
  const D = parseFloat(deposit) || 0;
  const W = parseFloat(rent) || 0;

  let amount = 0;
  if (mode === "sale") {
    amount = P;
  } else if (W > 0) {
    const base = D + W * 100;
    amount = base < 50_000_000 ? D + W * 70 : base;
  } else {
    amount = D;
  }

  const table = mode === "sale" ? SALE : LEASE;
  const b = pick(amount, table);
  const rawFee = amount * b.rate;
  const capped = b.cap !== null && rawFee > b.cap;
  const fee = capped ? (b.cap as number) : rawFee;
  const total = vat ? fee * 1.1 : fee;
  const valid = amount > 0;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const tabCls = (on: boolean) =>
    `flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition-colors ${
      on ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("sale")} className={tabCls(mode === "sale")}>
            매매
          </button>
          <button type="button" onClick={() => setMode("lease")} className={tabCls(mode === "lease")}>
            전세·월세
          </button>
        </div>

        {mode === "sale" ? (
          <div>
            <label className={labelCls}>매매가 (원)</label>
            <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="예: 500000000" className={inputCls} />
          </div>
        ) : (
          <>
            <div>
              <label className={labelCls}>보증금 (원)</label>
              <input type="number" inputMode="numeric" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="예: 300000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>월세 (원/월 · 전세면 0)</label>
              <input type="number" inputMode="numeric" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="예: 600000" className={inputCls} />
              <p className="mt-1 text-xs text-slate-400">전세는 0을 두세요. 월세가 있으면 보증금 + 월세×100(5천만원 미만이면 ×70)으로 거래금액을 환산합니다.</p>
            </div>
          </>
        )}

        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30" />
          부가세 10% 포함 (중개사 일반과세 시)
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {valid ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">중개보수 상한{vat ? " (부가세 포함)" : ""}</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              {vat ? (
                <p className="mt-1 text-sm text-slate-400">중개보수 {won(fee)}원 + 부가세 {won(total - fee)}원</p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">적용 거래금액</span>
                <p className="font-black text-slate-800">{won(amount)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">적용 상한요율</span>
                <p className="font-black text-slate-800">{(b.rate * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">한도액</span>
                <p className="font-black text-slate-800">{b.cap !== null ? `${won(b.cap)}원` : "없음"}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              법정 상한 기준이며 협의로 낮출 수 있어요{capped ? " · 한도액이 적용된 금액입니다" : ""}. 월세는 보증금과 월세를 합친 환산 거래금액으로 계산합니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            {mode === "sale" ? "매매가를 입력하면" : "보증금·월세를 입력하면"} 중개보수 상한이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
