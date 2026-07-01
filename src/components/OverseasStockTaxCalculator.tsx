"use client";

import { useState } from "react";

/**
 * 해외주식 양도소득세 계산기 — 참고용.
 * 과세표준 = max(0, 연간 실현손익 − 2,500,000)
 * 총 세금 = 과세표준 × 22% (양도소득세 20% + 지방소득세 2%)
 */
export default function OverseasStockTaxCalculator() {
  const [profit, setProfit] = useState(""); // 올해 실현이익 합계(만원)
  const [loss, setLoss] = useState(""); // 올해 실현손실 합계(만원, 선택)

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const DEDUCTION = 2500000;

  const p = (parseFloat(profit) || 0) * 10000;
  const l = (parseFloat(loss) || 0) * 10000;

  let result:
    | { net: number; base: number; tax: number; local: number; total: number; after: number }
    | null = null;

  if (profit !== "" || loss !== "") {
    const net = p - l; // 순 양도차익
    const base = Math.max(0, net - DEDUCTION); // 과세표준
    const tax = base * 0.2; // 양도소득세 20%
    const local = base * 0.02; // 지방소득세 2%
    const total = tax + local; // 총 세금(22%)
    const after = net - total; // 세후 손익
    result = { net, base, tax, local, total, after };
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>올해 실현이익 합계 (만원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
            placeholder="예: 1000 (1,000만원 이익)"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>올해 실현손실 합계 (만원, 선택)</label>
          <input
            type="number"
            inputMode="numeric"
            value={loss}
            onChange={(e) => setLoss(e.target.value)}
            placeholder="손실 본 종목이 있으면 입력 (없으면 비움)"
            className={inputCls}
          />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          한 해(1/1~12/31) 동안 판 해외주식·해외상장 ETF의 이익과 손실을 각각 합산해 입력하세요. 원화 환산 기준입니다.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">예상 양도소득세 (지방세 포함)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.total)}원</p>
              {result.base === 0 && (
                <p className="mt-2 text-sm font-bold text-emerald-600">
                  순이익이 250만원 기본공제 이하 — 낼 세금이 없습니다.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">순 양도차익</span>
                <p className="font-black text-slate-800">{won(result.net)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">과세표준 (−250만)</span>
                <p className="font-black text-slate-800">{won(result.base)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">양도소득세 (20%)</span>
                <p className="font-black text-slate-800">{won(result.tax)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">지방소득세 (2%)</span>
                <p className="font-black text-slate-800">{won(result.local)}원</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">세금 낸 뒤 남는 손익</span>
              <p className="font-black text-slate-800">{won(result.after)}원</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              과세표준 = 순 양도차익 − 250만원, 세금 = 과세표준 × 22%(양도세 20% + 지방세 2%). 다음 해 5월 홈택스 신고 기준 참고용입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            올해 실현이익(과 손실)을 입력하면 예상 양도소득세가 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
