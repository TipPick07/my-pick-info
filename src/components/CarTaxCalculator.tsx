"use client";

import { useState } from "react";

/**
 * 자동차세 계산기 — 비영업용 승용차 기준.
 * 자동차세(본세) = 배기량 × cc당 세액(1000이하 80 / 1600이하 140 / 1600초과 200원)
 * 차령 경감: 3년차부터 매년 5%, 12년차 이상 50% 고정
 * 연세액 = 본세 × (1 - 경감률) + 지방교육세(자동차세의 30%)
 */
function ccRate(cc: number) {
  return cc <= 1000 ? 80 : cc <= 1600 ? 140 : 200;
}
function reduceRate(age: number) {
  if (age < 3) return 0;
  if (age >= 12) return 0.5;
  return (age - 2) * 0.05;
}

export default function CarTaxCalculator() {
  const [cc, setCc] = useState("2000");
  const [age, setAge] = useState("0");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const c = parseFloat(cc) || 0;
  const a = parseFloat(age) || 0;

  const base = c * ccRate(c);
  const r = reduceRate(a);
  const carTax = base * (1 - r);
  const eduTax = carTax * 0.3;
  const total = carTax + eduTax;
  const show = c > 0;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>배기량 (cc)</label>
            <input
              type="number" inputMode="numeric" value={cc}
              onChange={(e) => setCc(e.target.value)} placeholder="예: 2000" className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-400">cc당 1000↓ 80원 · 1600↓ 140원 · 1600↑ 200원</p>
          </div>
          <div>
            <label className={labelCls}>차령 (등록 후 경과 연수)</label>
            <input
              type="number" inputMode="numeric" value={age}
              onChange={(e) => setAge(e.target.value)} placeholder="예: 0 (신차)" className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-400">3년차부터 매년 5%, 12년↑ 50% 경감</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {show ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">연간 자동차세 (지방교육세 포함)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              {r > 0 && (
                <p className="mt-1 text-xs font-bold text-emerald-600">차령 경감 {Math.round(r * 100)}% 적용</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">자동차세(본세)</span>
                <p className="font-black text-slate-800">{won(carTax)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">지방교육세(30%)</span>
                <p className="font-black text-slate-800">{won(eduTax)}원</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              비영업용 승용차 기준. 1월에 1년치를 미리 내는 연납을 신청하면 일부 할인이
              적용됩니다(할인율은 매년 변동).
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">배기량과 차령을 입력하면 연간 자동차세가 계산됩니다.</p>
        )}
      </div>
    </div>
  );
}
