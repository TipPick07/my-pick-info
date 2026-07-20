"use client";

import { useState } from "react";

/**
 * 청년내일저축계좌 만기 수령액 계산기.
 * - 정부지원금(근로소득장려금)은 본인 저축과 무관하게 월 정액 매칭:
 *   2026 신규(중위 50% 이하) = 월 30만 원 / 기존 가입(50~100%) = 월 10만 원.
 *   본인 저축은 월 10만~50만 원(정부 매칭 조건: 월 10만 이상 저축).
 * - 이자는 은행 적금 상품(본인 적립금 기준, 단리)으로 근사하며 비과세.
 *   적금 단리: 이자 = 월납입 × 이율 × (개월(개월+1)/2) / 12
 */
export default function YouthSavingsAccountCalculator() {
  const [matchType, setMatchType] = useState<"new" | "old">("new");
  const [monthly, setMonthly] = useState("100000");
  const [months, setMonths] = useState("36");
  const [rate, setRate] = useState("5");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const man = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR");

  const M = parseFloat(monthly) || 0;
  const m = parseFloat(months) || 0;
  const rr = (parseFloat(rate) || 0) / 100;
  const match = matchType === "new" ? 300000 : 100000;

  const ownTotal = M * m;
  const govTotal = match * m;
  const interest = (M * rr * (m * (m + 1) / 2)) / 12; // 적금 단리(비과세)
  const total = ownTotal + govTotal + interest;
  const multiple = ownTotal > 0 ? total / ownTotal : 0;

  const show = m > 0 && M > 0;
  const tooLow = M > 0 && M < 100000;

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
        <div>
          <label className={labelCls}>가입 유형 (정부 매칭액)</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMatchType("new")} className={tabCls(matchType === "new")}>
              2026 신규 · 월 30만
            </button>
            <button type="button" onClick={() => setMatchType("old")} className={tabCls(matchType === "old")}>
              기존 50~100% · 월 10만
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            2026년 신규 모집은 <strong className="text-slate-500">기준 중위소득 50% 이하</strong> 청년만 가입할 수 있어
            정부 매칭이 월 30만 원입니다. 월 10만 매칭(720만)은 2022~2025년 50~100% 구간 가입자에게 적용됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>월 본인 저축액 (원)</label>
            <input type="number" inputMode="numeric" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="예: 100000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>납입 개월 (만기 36)</label>
            <input type="number" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="예: 36" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>연 이자율 (%)</label>
            <input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="예: 5" className={inputCls} />
          </div>
        </div>
        {tooLow && (
          <p className="text-xs font-bold text-rose-500">
            정부 매칭은 월 10만 원 이상 저축할 때 적용됩니다. 본인 저축액은 월 10만~50만 원 사이로 넣어 주세요.
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {show ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">3년 만기 예상 수령액</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                내가 낸 돈({man(ownTotal)}만)의 <span className="text-brand-dark">{multiple.toFixed(1)}배</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">본인 저축 원금</span>
                <p className="font-black text-slate-800">{won(ownTotal)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">정부지원금</span>
                <p className="font-black text-brand-dark">{won(govTotal)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">적금 이자(비과세)</span>
                <p className="font-black text-slate-800">{won(interest)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              정부지원금은 본인 저축액과 관계없이 월 정액(신규 30만·기존 10만)으로, 저축한 달만큼만 적립됩니다.
              이자는 은행 적금 상품(본인 적립금·단리) 기준의 참고값이며 비과세입니다. 중도 해지하면 정부지원금은
              받지 못하고 본인 원금과 이자만 돌려받습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">저축액·개월·이율을 입력하면 만기 예상 수령액이 계산됩니다.</p>
        )}
      </div>
    </div>
  );
}
