"use client";

import { useState } from "react";

const RATE = 12790; // 2026 시간제 기본형 시간당 단가(원)

/**
 * 아이돌봄서비스 본인부담금 계산기 (시간제 기본형).
 * 정부지원율(2026): 만 2세 이하 가 85%·나 60%·다 30%·라 15%·마 0%
 *                  만 3세 이상 가 80%·나 50%·다 25%·라 10%·마 0%
 * 본인부담 = 단가 × (1 - 지원율) × 이용시간. 연 정부지원 한도(일반 960시간) 초과분은 전액 본인부담.
 */
const SUPPORT: Record<string, { le2: number; ge3: number; label: string }> = {
  ga: { le2: 0.85, ge3: 0.8, label: "가형 · 중위 75% 이하" },
  na: { le2: 0.6, ge3: 0.5, label: "나형 · 75~120%" },
  da: { le2: 0.3, ge3: 0.25, label: "다형 · 120~150%" },
  ra: { le2: 0.15, ge3: 0.1, label: "라형 · 150~250%" },
  ma: { le2: 0, ge3: 0, label: "마형 · 250% 초과" },
};

export default function ChildcareServiceCalculator() {
  const [type, setType] = useState("na");
  const [age, setAge] = useState<"le2" | "ge3">("le2");
  const [hours, setHours] = useState("60");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const h = parseFloat(hours) || 0;
  const rate = SUPPORT[type][age];
  const hourSelf = RATE * (1 - rate);
  const monthSelf = hourSelf * h;
  const monthGov = RATE * rate * h;
  const overCap = h > 80;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const tabCls = (on: boolean) =>
    `flex-1 rounded-xl px-3 py-2.5 text-sm font-black transition-colors ${
      on ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>소득 유형 (가구 기준 중위소득)</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {Object.entries(SUPPORT).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            내 가구가 중위소득 몇 %인지 모른다면{" "}
            <a href="/tools/median-income/" className="font-bold text-brand-dark underline">기준 중위소득 계산기</a>
            에서 먼저 확인하세요. 2026년부터 지원 대상이 중위 250% 이하까지 넓어졌습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>아이 나이</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAge("le2")} className={tabCls(age === "le2")}>
                만 2세 이하
              </button>
              <button type="button" onClick={() => setAge("ge3")} className={tabCls(age === "ge3")}>
                만 3세 이상
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>월 이용 시간</label>
            <input type="number" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="예: 60" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {h > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">월 본인부담금 (시간제 기본형)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(monthSelf)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                시간당 {won(hourSelf)}원 × {h}시간
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">시간당 단가(2026)</span>
                <p className="font-black text-slate-800">{won(RATE)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">정부 지원율</span>
                <p className="font-black text-brand-dark">{Math.round(rate * 100)}%</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">월 정부지원액</span>
                <p className="font-black text-slate-800">{won(monthGov)}원</p>
              </div>
            </div>
            {overCap && (
              <p className="text-xs font-bold text-amber-600">
                월 80시간을 넘으면 연간 정부지원 한도(일반 960시간)를 초과할 수 있습니다. 한도 초과분은
                전액 본인부담입니다.
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              시간제 기본형(시간당 12,790원) 기준이며 종합형·질병감염아동 등은 단가가 다릅니다.
              야간(22~06시)·일요일·공휴일은 기본요금의 50%가 가산됩니다. 한부모·장애부모 등 일부
              가구는 지원율이 더 높을 수 있으니 아이돌봄 홈페이지에서 확인하세요. 원 단위는 실제
              고지 금액과 다를 수 있습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">소득 유형·나이·이용 시간을 고르면 월 본인부담금이 계산됩니다.</p>
        )}
      </div>
    </div>
  );
}
