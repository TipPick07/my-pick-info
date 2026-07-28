"use client";

import { useState } from "react";

/**
 * 본인부담상한제 환급 계산기 (2026 기준).
 *
 * 계산식: 환급액 = max(0, 연간 급여 본인부담금 − 소득분위별 상한액)
 * 상한액은 국민건강보험공단 2026년도 본인부담상한액 고시값(요양병원 120일 초과 입원은 별도 표).
 * ⚠️ 비급여·선별급여·전액본인부담·상급병실료 차액·임플란트·추나요법 등은 계산 대상에서 제외된다.
 */
const TIERS = [
  { key: "1", label: "1분위", cap: 900_000, cap120: 1_430_000 },
  { key: "2", label: "2~3분위", cap: 1_120_000, cap120: 1_810_000 },
  { key: "4", label: "4~5분위", cap: 1_730_000, cap120: 2_450_000 },
  { key: "6", label: "6~7분위", cap: 3_260_000, cap120: 4_040_000 },
  { key: "8", label: "8분위", cap: 4_460_000, cap120: 5_800_000 },
  { key: "9", label: "9분위", cap: 5_360_000, cap120: 6_980_000 },
  { key: "10", label: "10분위", cap: 8_430_000, cap120: 10_960_000 },
];

export default function MedicalCostCapCalculator() {
  const [tierKey, setTierKey] = useState("4");
  const [paid, setPaid] = useState("5000000");
  const [longStay, setLongStay] = useState(false);

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const tier = TIERS.find((t) => t.key === tierKey) ?? TIERS[2];
  const cap = longStay ? tier.cap120 : tier.cap;
  const p = parseFloat(paid) || 0;

  const refund = Math.max(0, p - cap);
  const remain = Math.max(0, cap - p);
  const valid = p > 0;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const chipCls = (on: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-black transition-colors ${
      on ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>내 소득분위 (건강보험료 기준)</label>
          <select
            value={tierKey}
            onChange={(e) => setTierKey(e.target.value)}
            className={inputCls}
          >
            {TIERS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label} — 상한 {won(t.cap)}원
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            1분위가 소득이 가장 낮은 구간입니다. 정확한 분위는 국민건강보험공단(nhis.or.kr)
            개인민원 → 보험료 조회에서 확인할 수 있어요.
          </p>
        </div>

        <div>
          <label className={labelCls}>1년간 낸 급여 본인부담금 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            placeholder="예: 5000000"
            className={inputCls}
          />
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            영수증의 <strong className="text-slate-500">급여 본인부담금</strong> 칸만 1년치(1월 1일~12월
            31일 진료분) 더한 금액입니다. 비급여·상급병실료·선별급여는 빼고 넣으세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[3_000_000, 5_000_000, 10_000_000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setPaid(String(v))}
              className={chipCls(p === v)}
            >
              {won(v / 10_000)}만 원
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLongStay(!longStay)}
            className={chipCls(longStay)}
          >
            요양병원 120일 초과 입원
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {valid ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">돌려받을 것으로 예상되는 금액</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(refund)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {tier.label}
                {longStay ? " · 요양병원 120일 초과" : ""} 상한 {won(cap)}원
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">내가 낸 본인부담금</span>
                <p className="font-black text-slate-800">{won(p)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">내 상한액</span>
                <p className="font-black text-slate-800">{won(cap)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">
                  {refund > 0 ? "최종 부담(상한까지)" : "상한까지 남은 금액"}
                </span>
                <p className="font-black text-brand-dark">
                  {refund > 0 ? won(cap) : won(remain)}원
                </p>
              </div>
            </div>
            {refund === 0 && (
              <p className="text-xs font-bold text-amber-600">
                아직 상한액에 이르지 않아 환급 대상이 아닙니다. 올해 안에 본인부담금이{" "}
                {won(remain)}원 더 쌓이면 그때부터 초과분이 환급 대상이 돼요.
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              2026년 기준 — 상한액은 국민건강보험공단 고시값이며, 계산에 들어가는 것은 건강보험이
              적용된 급여 항목의 본인부담금뿐입니다. 비급여·선별급여·전액본인부담·상급병실료
              차액·임플란트·추나요법 등은 아무리 많이 내도 계산에서 빠집니다. 소득분위는 다음 해
              보험료 확정 후 정해지므로 실제 환급액은 공단 결정과 다를 수 있어요.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            소득분위와 1년치 급여 본인부담금을 넣으면 환급 예상액이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
