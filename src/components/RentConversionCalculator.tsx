"use client";

import { useState } from "react";

/**
 * 전월세 전환 계산기.
 * 전세 → 월세: 월세 = (전세보증금 − 월세보증금) × 전환율 / 12
 * 월세 → 전세: 환산 전세보증금 = 월세 × 12 / 전환율 + 월세보증금
 * 법정 전환율 상한 = min(기준금리 + 2%, 기준금리 × 2). 기준금리 2.5% → 4.5%(2026).
 */
export default function RentConversionCalculator() {
  const [mode, setMode] = useState<"j2w" | "w2j">("j2w");
  const [jeonse, setJeonse] = useState("300000000");
  const [wolseDeposit, setWolseDeposit] = useState("50000000");
  const [wolse, setWolse] = useState("900000");
  const [rate, setRate] = useState("4.5");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const rr = (parseFloat(rate) || 0) / 100;
  const J = parseFloat(jeonse) || 0;
  const D = parseFloat(wolseDeposit) || 0;
  const W = parseFloat(wolse) || 0;

  const converted = Math.max(J - D, 0); // 월세로 전환되는 보증금
  const monthly = rr > 0 ? (converted * rr) / 12 : 0;
  const jeonseEq = rr > 0 ? (W * 12) / rr + D : 0;

  const showJ2W = mode === "j2w" && rr > 0 && J > 0 && J >= D;
  const showW2J = mode === "w2j" && rr > 0 && W > 0;

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
          <button type="button" onClick={() => setMode("j2w")} className={tabCls(mode === "j2w")}>
            전세 → 월세
          </button>
          <button type="button" onClick={() => setMode("w2j")} className={tabCls(mode === "w2j")}>
            월세 → 전세
          </button>
        </div>

        {mode === "j2w" ? (
          <>
            <div>
              <label className={labelCls}>전세보증금 (원)</label>
              <input type="number" inputMode="numeric" value={jeonse} onChange={(e) => setJeonse(e.target.value)} placeholder="예: 300000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>전환 후 남길 보증금 (원)</label>
              <input type="number" inputMode="numeric" value={wolseDeposit} onChange={(e) => setWolseDeposit(e.target.value)} placeholder="예: 50000000" className={inputCls} />
              <p className="mt-1 text-xs text-slate-400">보증금을 거의 두지 않고 전부 월세로 돌리려면 0을 입력하세요.</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelCls}>월세 (원/월)</label>
              <input type="number" inputMode="numeric" value={wolse} onChange={(e) => setWolse(e.target.value)} placeholder="예: 900000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>월세보증금 (원)</label>
              <input type="number" inputMode="numeric" value={wolseDeposit} onChange={(e) => setWolseDeposit(e.target.value)} placeholder="예: 50000000" className={inputCls} />
            </div>
          </>
        )}

        <div>
          <label className={labelCls}>전환율 (연 %)</label>
          <input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="예: 4.5" className={inputCls} />
          <p className="mt-1 text-xs text-slate-400">2026년 법정 상한 4.5%(기준금리 2.5% + 2%). 실제 계약은 협의에 따라 달라질 수 있어요.</p>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {mode === "j2w" ? (
          showJ2W ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500">환산 월세</p>
                <p className="mt-1 text-4xl font-black text-brand-dark">
                  {won(monthly)}원<span className="text-lg">/월</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                  <span className="text-slate-500">월세 전환 보증금</span>
                  <p className="font-black text-slate-800">{won(converted)}원</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                  <span className="text-slate-500">남기는 보증금</span>
                  <p className="font-black text-slate-800">{won(D)}원</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                  <span className="text-slate-500">적용 전환율</span>
                  <p className="font-black text-slate-800">{rate || 0}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                전세보증금에서 남길 보증금을 뺀 금액을 전환율로 월세화한 결과입니다. 법정 상한(2026년 4.5%)을 넘는 월세는 초과분이 무효일 수 있습니다.
              </p>
            </div>
          ) : (
            <p className="text-center text-slate-400 font-medium">
              전세보증금·남길 보증금·전환율을 입력하면 월세가 계산됩니다. (남길 보증금은 전세보증금보다 작아야 해요.)
            </p>
          )
        ) : showW2J ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">환산 전세보증금</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(jeonseEq)}원</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월세</span>
                <p className="font-black text-slate-800">{won(W)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월세보증금</span>
                <p className="font-black text-slate-800">{won(D)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">적용 전환율</span>
                <p className="font-black text-slate-800">{rate || 0}%</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              월세를 전환율로 보증금화한 뒤 월세보증금을 더한, 같은 가치의 전세보증금입니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월세·월세보증금·전환율을 입력하면 전세보증금으로 환산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
