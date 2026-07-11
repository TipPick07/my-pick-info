"use client";

import { useState } from "react";

/**
 * K-패스 환급 계산기 — 기본 환급률 기준 참고용.
 * 환급액 = 월 대중교통 지출 × 유형별 환급률 (월 15회 이상 이용 시)
 * 일반 20% · 청년 30% · 2자녀 30% · 3자녀 이상 50% · 저소득 53.3%
 */
const TYPES = [
  { key: "일반", rate: 0.2, label: "일반 (만 19세 이상)" },
  { key: "청년", rate: 0.3, label: "청년 (만 19~34세)" },
  { key: "2자녀", rate: 0.3, label: "다자녀 — 2자녀 가구" },
  { key: "3자녀 이상", rate: 0.5, label: "다자녀 — 3자녀 이상 가구" },
  { key: "저소득", rate: 0.533, label: "저소득층 (수급자·차상위)" },
] as const;

export default function KPassRefundCalculator() {
  const [spend, setSpend] = useState(""); // 월 대중교통 지출(원)
  const [rides, setRides] = useState(""); // 월 이용 횟수
  const [typeIdx, setTypeIdx] = useState(0);

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const s = parseFloat(spend) || 0;
  const r = rides === "" ? null : parseInt(rides, 10) || 0;
  const t = TYPES[typeIdx];

  let result: { monthly: number; yearly: number; net: number } | null = null;
  let notEnough = false;
  if (s > 0) {
    if (r !== null && r < 15) {
      notEnough = true;
    } else {
      const monthly = s * t.rate;
      result = { monthly, yearly: monthly * 12, net: s - monthly };
    }
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>이용자 유형</label>
          <select
            value={typeIdx}
            onChange={(e) => setTypeIdx(Number(e.target.value))}
            className={inputCls}
          >
            {TYPES.map((tp, i) => (
              <option key={tp.key} value={i}>
                {tp.label} — {Math.round(tp.rate * 1000) / 10}%
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>월 대중교통 지출 (원)</label>
            <input
              type="number"
              inputMode="numeric"
              value={spend}
              onChange={(e) => setSpend(e.target.value)}
              placeholder="예: 70000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>월 이용 횟수 (선택)</label>
            <input
              type="number"
              inputMode="numeric"
              value={rides}
              onChange={(e) => setRides(e.target.value)}
              placeholder="15회 이상이면 환급"
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          기본 환급률 기준 참고용입니다. 월 15회 이상 이용해야 환급되며(가입 첫 달 제외), 정부의 한시 인상 이벤트는 반영하지 않은 보수적 계산입니다.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {notEnough ? (
          <p className="text-center font-bold text-rose-600">
            월 15회 미만은 환급 대상이 아닙니다 (가입 첫 달 제외).
          </p>
        ) : result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">
                예상 월 환급액 ({t.key} {Math.round(t.rate * 1000) / 10}%)
              </p>
              <p className="mt-1 text-4xl font-black text-brand-dark">
                {won(result.monthly)}원
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">연간 환급액</span>
                <p className="font-black text-slate-800">{won(result.yearly)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">환급 후 실질 교통비</span>
                <p className="font-black text-slate-800">{won(result.net)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              환급액 = 월 지출 × 환급률. 환급금은 다음 달 카드사 캐시백·계좌입금 등으로 지급됩니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            유형과 월 교통비를 입력하면 예상 환급액이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
