"use client";

import { useState } from "react";

const TAX = 0.154; // 이자소득세 15.4%(소득세 14% + 지방세 1.4%)

/**
 * 예금·적금 이자 계산기 (세후).
 * 예금 단리: 이자 = 원금 × 이율 × (개월/12)
 * 예금 월복리: 만기 = 원금 × (1 + 이율/12)^개월
 * 적금 단리: 이자 = 월납입 × 이율 × (개월(개월+1)/2) / 12
 * 세후 = 이자 × (1 - 0.154)
 */
export default function SavingsInterestCalculator() {
  const [type, setType] = useState<"deposit" | "installment">("deposit");
  const [principal, setPrincipal] = useState("10000000");
  const [monthly, setMonthly] = useState("500000");
  const [rate, setRate] = useState("3");
  const [months, setMonths] = useState("12");
  const [compound, setCompound] = useState(false);

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const rr = (parseFloat(rate) || 0) / 100;
  const m = parseFloat(months) || 0;

  let principalTotal = 0;
  let interest = 0;
  if (type === "deposit") {
    const P = parseFloat(principal) || 0;
    principalTotal = P;
    interest = compound ? P * Math.pow(1 + rr / 12, m) - P : P * rr * (m / 12);
  } else {
    const M = parseFloat(monthly) || 0;
    principalTotal = M * m;
    interest = (M * rr * (m * (m + 1) / 2)) / 12;
  }
  const tax = interest * TAX;
  const net = interest - tax;
  const total = principalTotal + net;
  const show =
    m > 0 && (type === "deposit" ? (parseFloat(principal) || 0) > 0 : (parseFloat(monthly) || 0) > 0);

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
          <button type="button" onClick={() => setType("deposit")} className={tabCls(type === "deposit")}>
            예금 (목돈 예치)
          </button>
          <button type="button" onClick={() => setType("installment")} className={tabCls(type === "installment")}>
            적금 (매월 납입)
          </button>
        </div>

        {type === "deposit" ? (
          <div>
            <label className={labelCls}>예치 원금 (원)</label>
            <input type="number" inputMode="numeric" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="예: 10000000" className={inputCls} />
            <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={compound} onChange={(e) => setCompound(e.target.checked)} className="w-4 h-4 accent-brand" />
              월복리로 계산 (체크 해제 시 단리)
            </label>
          </div>
        ) : (
          <div>
            <label className={labelCls}>매월 납입액 (원)</label>
            <input type="number" inputMode="numeric" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="예: 500000" className={inputCls} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>연이율 (%)</label>
            <input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="예: 3" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>기간 (개월)</label>
            <input type="number" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="예: 12" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {show ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">만기 수령액 (세후)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">원금</span>
                <p className="font-black text-slate-800">{won(principalTotal)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">세전 이자</span>
                <p className="font-black text-slate-800">{won(interest)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">세후 이자</span>
                <p className="font-black text-slate-800">{won(net)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              이자소득세 15.4%(소득세 14% + 지방소득세 1.4%) 차감 후 금액입니다. 적금은 일반
              정기적금(단리) 기준입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">금액·이율·기간을 입력하면 세후 만기 수령액이 계산됩니다.</p>
        )}
      </div>
    </div>
  );
}
