"use client";

import { useState } from "react";

/**
 * 대지급금 계산기 — 체불 임금등 대지급금(도산 / 간이). 참고용.
 *
 * 근거(공식):
 * - 「임금채권보장법」제7조·제7조의2, 「체불 임금등 대지급금 상한액 고시」
 *   (법제처 찾기쉬운 생활법령정보 「임금채권 보장제도」 2026-08-20 확인)
 * - 도산대지급금 연령별 상한(퇴직 당시 연령, 임금·휴업수당 1개월분 / 퇴직급여등 1년분)
 *   30세 미만 220만 · 30~40세 310만 · 40~50세 350만 · 50~60세 330만 · 60세 이상 230만
 * - 간이대지급금(퇴직자) 상한: 임금등 700만 · 퇴직급여등 700만 · 총 1,000만
 * - 2026-08-20 시행 개정: 도산대지급금 임금 지급범위 최종 3개월분 → 최종 6개월분,
 *   총 상한 2,100만 → 3,150만 (고용노동부 2026-08-19 보도자료)
 */

const AGE_CAPS = [
  { key: "u30", label: "30세 미만", cap: 2_200_000 },
  { key: "a30", label: "30~40세", cap: 3_100_000 },
  { key: "a40", label: "40~50세", cap: 3_500_000 },
  { key: "a50", label: "50~60세", cap: 3_300_000 },
  { key: "a60", label: "60세 이상", cap: 2_300_000 },
] as const;

const WAGE_MONTHS_NEW = 6;
const WAGE_MONTHS_OLD = 3;
const SEV_YEARS = 3;

const GANUI_WAGE_CAP = 7_000_000;
const GANUI_SEV_CAP = 7_000_000;
const GANUI_TOTAL_CAP = 10_000_000;
const GANUI_WAGE_MONTHS = 3;

export default function WageGuaranteeCalculator() {
  const [type, setType] = useState<"dosan" | "ganui">("dosan");
  const [ageKey, setAgeKey] = useState<string>("a30");
  const [monthly, setMonthly] = useState(""); // 월 체불임금(만원)
  const [months, setMonths] = useState(""); // 체불 개월 수
  const [severance, setSeverance] = useState(""); // 미지급 퇴직급여(만원)

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const cap = AGE_CAPS.find((a) => a.key === ageKey)?.cap ?? 3_100_000;
  const pay = (parseFloat(monthly) || 0) * 10000;
  const m = parseFloat(months) || 0;
  const sev = (parseFloat(severance) || 0) * 10000;

  let result:
    | { wage: number; sev: number; total: number; countedMonths: number; oldTotal: number | null }
    | null = null;
  let error = "";

  if (monthly && months) {
    if (pay <= 0 || m <= 0) {
      error = "월 체불임금과 체불 개월 수를 정확히 입력하세요.";
    } else if (m > 60) {
      error = "체불 개월 수는 60개월 이하로 입력하세요.";
    } else if (type === "dosan") {
      const counted = Math.min(m, WAGE_MONTHS_NEW);
      const wage = counted * Math.min(pay, cap);
      const sevPay = Math.min(sev, cap * SEV_YEARS);
      const oldWage = Math.min(m, WAGE_MONTHS_OLD) * Math.min(pay, cap);
      result = {
        wage,
        sev: sevPay,
        total: wage + sevPay,
        countedMonths: counted,
        oldTotal: oldWage + sevPay,
      };
    } else {
      const counted = Math.min(m, GANUI_WAGE_MONTHS);
      const wage = Math.min(counted * pay, GANUI_WAGE_CAP);
      const sevPay = Math.min(sev, GANUI_SEV_CAP);
      const total = Math.min(wage + sevPay, GANUI_TOTAL_CAP);
      result = { wage, sev: sevPay, total, countedMonths: counted, oldTotal: null };
    }
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const tabCls = (on: boolean) =>
    `flex-1 rounded-xl px-4 py-3 text-sm font-black transition ${
      on ? "bg-brand text-white shadow-sm" : "bg-slate-100 text-slate-500"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>어떤 대지급금인가요?</label>
          <div className="flex gap-2">
            <button type="button" className={tabCls(type === "dosan")} onClick={() => setType("dosan")}>
              도산대지급금
            </button>
            <button type="button" className={tabCls(type === "ganui")} onClick={() => setType("ganui")}>
              간이대지급금
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            회사가 파산·회생에 들어갔거나 노동청에서 도산등사실인정을 받았다면 도산대지급금,
            판결·체불 임금등·사업주 확인서로 체불이 확정된 경우라면 간이대지급금입니다.
          </p>
        </div>

        {type === "dosan" && (
          <div>
            <label className={labelCls}>퇴직 당시 연령</label>
            <select value={ageKey} onChange={(e) => setAgeKey(e.target.value)} className={inputCls}>
              {AGE_CAPS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label} (월 상한 {(a.cap / 10000).toLocaleString("ko-KR")}만원)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>월 체불임금 (만원)</label>
            <input
              type="number" inputMode="numeric" value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              placeholder="예: 300" className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>체불 개월 수 (개월)</label>
            <input
              type="number" inputMode="numeric" value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="예: 5" className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>미지급 퇴직급여 (만원, 선택)</label>
          <input
            type="number" inputMode="numeric" value={severance}
            onChange={(e) => setSeverance(e.target.value)}
            placeholder="예: 900 (최종 3년분 중 못 받은 금액)" className={inputCls}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {error ? (
          <p className="text-center text-rose-600 font-bold">{error}</p>
        ) : result ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">예상 대지급금 상한 (세전)</p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(result.total)}원</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">임금분 ({result.countedMonths}개월 인정)</span>
                <p className="font-black text-slate-800">{won(result.wage)}원</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                <span className="text-slate-500">퇴직급여분</span>
                <p className="font-black text-slate-800">{won(result.sev)}원</p>
              </div>
            </div>
            {result.oldTotal !== null && (
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 text-sm">
                <span className="text-slate-500">2026년 8월 19일까지 기준(최종 3개월분)이었다면</span>
                <p className="font-black text-slate-800">
                  {won(result.oldTotal)}원{" "}
                  <span className="text-brand-dark">
                    (+{won(result.total - result.oldTotal)}원)
                  </span>
                </p>
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              {type === "dosan"
                ? "도산대지급금 = 최종 6개월분 임금(연령별 월 상한 적용) + 최종 3년분 퇴직급여(연령별 연 상한 적용). 2026년 8월 20일 시행 기준입니다."
                : "간이대지급금 = 최종 3개월분 임금(상한 700만원) + 최종 3년분 퇴직급여(상한 700만원), 두 항목 합계 1,000만원이 총 상한입니다."}{" "}
              실제 지급액은 확정된 체불액을 넘지 않습니다.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            월 체불임금과 체불 개월 수를 입력하면 받을 수 있는 대지급금 상한이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
