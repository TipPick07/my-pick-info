"use client";

import { useState } from "react";

/**
 * 노인장기요양보험 본인부담금 계산기 (2026 기준).
 *
 * 재가급여: 급여비용 = min(이용액, 등급별 월 한도액). 한도 초과분은 전액 본인부담.
 *           본인부담 = 급여비용 × 부담률 + 초과분
 * 시설급여: 급여비용 = 등급별 1일 수가 × 입소일수. 본인부담 = 급여비용 × 부담률
 * 부담률   일반 재가 15% / 시설 20%, 40% 감경 → 9% / 12%, 60% 감경 → 6% / 8%,
 *          기초생활수급자(의료급여법 제3조제1항제1호) 0%
 * ⚠️ 식사재료비·상급침실료 차액·이미용비 등 비급여는 급여비용에 포함되지 않아 전액 본인부담이다.
 */
const GRADES = [
  { key: "1", label: "1등급", home: 2_512_900, fac: 93_070 },
  { key: "2", label: "2등급", home: 2_331_200, fac: 86_340 },
  { key: "3", label: "3등급", home: 1_528_200, fac: 81_540 },
  { key: "4", label: "4등급", home: 1_409_700, fac: 81_540 },
  { key: "5", label: "5등급", home: 1_208_900, fac: 81_540 },
  { key: "6", label: "인지지원등급", home: 676_320, fac: 0 },
];

const RELIEFS = [
  { key: "normal", label: "일반 (감경 없음)", home: 0.15, fac: 0.2 },
  { key: "r40", label: "40% 감경", home: 0.09, fac: 0.12 },
  { key: "r60", label: "60% 감경", home: 0.06, fac: 0.08 },
  { key: "basic", label: "기초생활수급자", home: 0, fac: 0 },
];

export default function LongtermCareCopayCalculator() {
  const [mode, setMode] = useState<"home" | "facility">("home");
  const [gradeKey, setGradeKey] = useState("3");
  const [reliefKey, setReliefKey] = useState("normal");
  const [usage, setUsage] = useState("100");
  const [days, setDays] = useState("30");
  const [nonBenefit, setNonBenefit] = useState("0");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const grade = GRADES.find((g) => g.key === gradeKey) ?? GRADES[2];
  const relief = RELIEFS.find((r) => r.key === reliefKey) ?? RELIEFS[0];

  const cognitiveInFacility = mode === "facility" && grade.key === "6";
  const rate = mode === "home" ? relief.home : relief.fac;
  const nb = Math.max(0, parseFloat(nonBenefit) || 0);

  let covered = 0; // 급여비용(공단+본인)
  let over = 0; // 한도 초과분(전액 본인부담)
  let limit = 0;

  if (mode === "home") {
    limit = grade.home;
    const pct = Math.max(0, parseFloat(usage) || 0);
    const used = (limit * pct) / 100;
    covered = Math.min(used, limit);
    over = Math.max(0, used - limit);
  } else {
    const d = Math.max(0, Math.min(31, parseFloat(days) || 0));
    covered = grade.fac * d;
  }

  const copayCovered = covered * rate; // 급여분 본인부담
  const nhis = covered - copayCovered; // 공단 부담
  const total = copayCovered + over + nb; // 내가 내는 돈 합계
  const valid = !cognitiveInFacility && covered + over > 0;

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
          <label className={labelCls}>어떻게 이용하나요</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("home")}
              className={chipCls(mode === "home")}
            >
              집에서 (재가급여)
            </button>
            <button
              type="button"
              onClick={() => setMode("facility")}
              className={chipCls(mode === "facility")}
            >
              요양원 (시설급여)
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            방문요양·방문목욕·주야간보호·단기보호는 재가급여, 노인요양시설 입소는 시설급여입니다.
          </p>
        </div>

        <div>
          <label className={labelCls}>장기요양 등급</label>
          <select
            value={gradeKey}
            onChange={(e) => setGradeKey(e.target.value)}
            className={inputCls}
          >
            {GRADES.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
                {mode === "home"
                  ? ` — 월 한도 ${won(g.home)}원`
                  : g.fac
                    ? ` — 1일 ${won(g.fac)}원`
                    : " — 시설급여 대상 아님"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>본인부담 감경 구분</label>
          <select
            value={reliefKey}
            onChange={(e) => setReliefKey(e.target.value)}
            className={inputCls}
          >
            {RELIEFS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label} — 부담률 {((mode === "home" ? r.home : r.fac) * 100).toFixed(0)}%
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            감경은 따로 신청하지 않아도 건강보험료 순위·재산 과세표준을 보고 자동 적용됩니다.
            내 구분은 국민건강보험공단(1577-1000)에서 확인할 수 있어요.
          </p>
        </div>

        {mode === "home" ? (
          <div>
            <label className={labelCls}>월 한도액 대비 이용 비율 (%)</label>
            <input
              type="number"
              inputMode="numeric"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder="예: 100"
              className={inputCls}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[50, 80, 100, 120].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setUsage(String(v))}
                  className={chipCls(String(v) === usage)}
                >
                  {v}%
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              100%를 넘겨 잡으면 한도 초과분이 어떻게 붙는지 볼 수 있습니다. 초과분은 감경 대상이라도
              전액 본인부담입니다.
            </p>
          </div>
        ) : (
          <div>
            <label className={labelCls}>한 달 입소 일수</label>
            <input
              type="number"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="예: 30"
              className={inputCls}
            />
          </div>
        )}

        <div>
          <label className={labelCls}>월 비급여 예상액 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={nonBenefit}
            onChange={(e) => setNonBenefit(e.target.value)}
            placeholder="예: 450000"
            className={inputCls}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 300_000, 450_000, 600_000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNonBenefit(String(v))}
                className={chipCls(nb === v)}
              >
                {v === 0 ? "없음" : `${won(v / 10_000)}만 원`}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            식사재료비·상급침실료 차액·이미용비는 급여비용에 들어가지 않아 전액 본인부담입니다.
            시설마다 달라 실제 계약서의 금액을 넣어야 정확합니다.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {cognitiveInFacility ? (
          <p className="text-center text-sm font-bold text-amber-600">
            인지지원등급은 시설급여(요양원 입소) 대상이 아닙니다. 주야간보호 등 재가급여로 바꿔
            계산해 보세요.
          </p>
        ) : valid ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">한 달에 실제로 내는 돈</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {grade.label} · {mode === "home" ? "재가급여" : "시설급여"} · {relief.label}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">공단이 내는 돈</span>
                <p className="font-black text-slate-800">{won(nhis)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">급여분 본인부담</span>
                <p className="font-black text-slate-800">{won(copayCovered)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">
                  {over > 0 ? "한도 초과분 + 비급여" : "비급여(전액 본인부담)"}
                </span>
                <p className="font-black text-brand-dark">{won(over + nb)}원</p>
              </div>
            </div>
            {over > 0 && (
              <p className="text-xs font-bold text-amber-600">
                월 한도 {won(limit)}원을 {won(over)}원 넘겼습니다. 초과분은 감경 대상이라도 전액
                본인부담이라, 실질 부담률이 {((total - nb) / (covered + over) * 100).toFixed(1)}%로
                올라갑니다.
              </p>
            )}
            {nb > 0 && (
              <p className="text-xs font-bold text-slate-500">
                비급여가 총부담의 {((nb / total) * 100).toFixed(0)}%를 차지합니다. &ldquo;{
                  (rate * 100).toFixed(0)
                }%만 부담&rdquo;이라는 말은 급여 항목에 한정된 이야기예요.
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              2026년 기준 — 등급별 월 한도액과 시설 1일 수가는 보건복지부 고시값입니다. 실제
              청구액은 이용한 급여 종류·시간·가산(야간·휴일 등)에 따라 달라지므로, 계약 전 이용
              기관과 국민건강보험공단(1577-1000)에서 확인하세요.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            이용 형태와 등급을 고르면 한 달 부담액이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
