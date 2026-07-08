"use client";

import { useState } from "react";

/**
 * 주택용 전기요금 계산기 — 2026년 기준(한국전력 주택용 요금표). 참고용.
 * 누진 구간: 기타계절 200/400kWh, 하계(7~8월) 300/450kWh.
 * 슈퍼유저: 하계(7~8월)·동계(12~2월) 1,000kWh 초과분에 최고 단가 적용.
 * 전기요금계 = 기본요금 + 전력량요금 + 기후환경요금(9원/kWh) + 연료비조정액(+5원/kWh)
 * 청구액 = 전기요금계 + 부가세(10%, 반올림) + 전력산업기반기금(2.7%, 10원 미만 절사), 10원 미만 절사.
 */
const RATES = {
  low: { base: [910, 1600, 7300], energy: [120.0, 214.6, 307.3], superRate: 736.2 },
  high: { base: [730, 1260, 6060], energy: [105.0, 174.0, 242.3], superRate: 601.3 },
} as const;

const CLIMATE_PER_KWH = 9; // 기후환경요금
const FUEL_PER_KWH = 5; // 연료비조정액(2026년 현재 +5원, 분기별 변동)
const FUND_RATE = 0.027; // 전력산업기반기금(2025.7~ 2.7%)

type Contract = keyof typeof RATES;
type Season = "summer" | "winter" | "other";

function calc(usage: number, season: Season, contract: Contract) {
  const { base, energy, superRate } = RATES[contract];
  const [t1, t2] = season === "summer" ? [300, 450] : [200, 400];
  const superOn = season !== "other" && usage > 1000;

  const tier = usage <= t1 ? 0 : usage <= t2 ? 1 : 2;
  const inTier1 = Math.min(usage, t1);
  const inTier2 = Math.max(0, Math.min(usage, t2) - t1);
  const inTier3 = Math.max(0, Math.min(usage, superOn ? 1000 : usage) - t2);
  const inSuper = superOn ? usage - 1000 : 0;

  const baseFee = base[tier];
  const energyFee = Math.floor(
    inTier1 * energy[0] + inTier2 * energy[1] + inTier3 * energy[2] + inSuper * superRate
  );
  const climate = Math.floor(usage * CLIMATE_PER_KWH);
  const fuel = Math.floor(usage * FUEL_PER_KWH);
  const subtotal = baseFee + energyFee + climate + fuel;
  const vat = Math.round(subtotal * 0.1);
  const fund = Math.floor((subtotal * FUND_RATE) / 10) * 10;
  const total = Math.floor((subtotal + vat + fund) / 10) * 10;
  return { tier, superOn, baseFee, energyFee, climate, fuel, subtotal, vat, fund, total };
}

export default function ElectricityBillCalculator() {
  const [usage, setUsage] = useState("");
  const [season, setSeason] = useState<Season>("summer");
  const [contract, setContract] = useState<Contract>("low");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const kwh = parseFloat(usage) || 0;
  const result = kwh > 0 ? calc(kwh, season, contract) : null;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const tabCls = (active: boolean) =>
    "flex-1 rounded-xl px-4 py-3 text-sm font-black transition-colors " +
    (active ? "bg-brand text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => setContract("low")} className={tabCls(contract === "low")}>
            저압 (단독·빌라 등 대부분)
          </button>
          <button type="button" onClick={() => setContract("high")} className={tabCls(contract === "high")}>
            고압 (일부 아파트)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>월 사용량 (kWh)</label>
            <input
              type="number"
              inputMode="numeric"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder="예: 350 (고지서·한전ON에서 확인)"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>사용 시기</label>
            <select value={season} onChange={(e) => setSeason(e.target.value as Season)} className={inputCls}>
              <option value="summer">하계 (7~8월)</option>
              <option value="winter">동계 (12~2월)</option>
              <option value="other">기타 계절 (3~6·9~11월)</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          하계(7~8월)에는 누진 구간이 300/450kWh로 넓어지고, 나머지 계절은 200/400kWh입니다. 하계·동계에
          1,000kWh를 넘는 사용량에는 슈퍼유저 최고 단가가 적용됩니다.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">예상 청구액 (부가세·기금 포함)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.total)}원</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                적용 구간: {result.tier + 1}단계{result.superOn ? " + 슈퍼유저(1,000kWh 초과)" : ""}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">요금 구성</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">기본요금 ({result.tier + 1}단계)</span>
                  <span className="font-bold text-slate-800">{won(result.baseFee)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">전력량요금 (누진 적용)</span>
                  <span className="font-bold text-slate-800">{won(result.energyFee)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">기후환경요금 + 연료비조정액</span>
                  <span className="font-bold text-slate-800">{won(result.climate + result.fuel)}원</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-slate-500">전기요금 계</span>
                  <span className="font-bold text-slate-800">{won(result.subtotal)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">부가가치세 (10%)</span>
                  <span className="font-bold text-slate-800">{won(result.vat)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">전력산업기반기금 (2.7%)</span>
                  <span className="font-bold text-slate-800">{won(result.fund)}원</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              2026년 주택용 요금표 기준 참고용입니다. 연료비조정액(현재 +5원/kWh)은 분기별로 바뀔 수 있고,
              복지할인·에너지바우처·TV수신료는 반영하지 않았습니다. 검침일에 따라 하계 요금 적용 기간이
              달라질 수 있습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월 사용량(kWh)을 입력하면 누진제를 반영한 예상 전기요금이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
