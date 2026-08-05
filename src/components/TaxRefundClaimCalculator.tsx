"use client";

import { useState } from "react";

/**
 * 경정청구 환급액 계산기 (2026 기준).
 *
 * 놓친 세액공제를 뒤늦게 청구할 때 돌려받는 금액을 항목별로 계산한다.
 * 환급액 = 세액공제액 × 1.1 (지방소득세 10%가 함께 줄어들기 때문)
 *
 * 월세   총급여 5,500만 이하 17% / 7,000만 이하 15% / 초과 대상 아님. 대상 한도 연 1,000만.
 * 의료비 (지출 − 총급여 3%) × 15%. '그 밖의 부양가족' 분은 700만 한도,
 *        본인·65세 이상·장애인·난임 등은 한도 없음(체크박스로 전환).
 * 교육비 15%. 본인 전액 / 대학생 900만 / 취학전·초중고 300만 한도.
 *
 * ⚠️ 결정세액이 0이면 아무리 공제가 커도 환급은 없다(낸 세금 한도 내에서만 돌려받음).
 */
const RENT_CAP = 10_000_000;
const MED_CAP = 7_000_000;

const EDU_KINDS = [
  { key: "self", label: "본인 (한도 없음)", cap: 0 },
  { key: "univ", label: "대학생 자녀 (900만)", cap: 9_000_000 },
  { key: "school", label: "취학전·초중고 (300만)", cap: 3_000_000 },
];

export default function TaxRefundClaimCalculator() {
  const [salary, setSalary] = useState("50000000");
  const [rentMonth, setRentMonth] = useState("500000");
  const [medical, setMedical] = useState("0");
  const [medNoCap, setMedNoCap] = useState(false);
  const [eduKind, setEduKind] = useState("univ");
  const [edu, setEdu] = useState("0");
  const [years, setYears] = useState("5");

  const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
  const sal = Math.max(0, parseFloat(salary) || 0);
  const rentY = Math.max(0, parseFloat(rentMonth) || 0) * 12;
  const med = Math.max(0, parseFloat(medical) || 0);
  const eduSpend = Math.max(0, parseFloat(edu) || 0);
  const yrs = Math.max(1, Math.min(5, parseFloat(years) || 0));

  // 월세
  const rentRate = sal > 70_000_000 ? 0 : sal <= 55_000_000 ? 0.17 : 0.15;
  const rentBase = Math.min(rentY, RENT_CAP);
  const rentCredit = rentBase * rentRate;
  const rentOverCap = Math.max(0, rentY - RENT_CAP);

  // 의료비
  const threshold = sal * 0.03;
  let medExcess = Math.max(0, med - threshold);
  const medOverCap = !medNoCap && medExcess > MED_CAP ? medExcess - MED_CAP : 0;
  if (!medNoCap) medExcess = Math.min(medExcess, MED_CAP);
  const medCredit = medExcess * 0.15;

  // 교육비
  const kind = EDU_KINDS.find((k) => k.key === eduKind) ?? EDU_KINDS[1];
  const eduBase = kind.cap === 0 ? eduSpend : Math.min(eduSpend, kind.cap);
  const eduCredit = eduBase * 0.15;

  const creditSum = rentCredit + medCredit + eduCredit;
  const perYear = creditSum * 1.1; // 지방소득세 10% 포함
  const total = perYear * yrs;
  const valid = creditSum > 0;

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";
  const chipCls = (on: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-black transition-colors ${
      on ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  const rows = [
    { name: "월세 세액공제", credit: rentCredit, note: rentRate === 0 ? "총급여 7,000만 원 초과 — 대상 아님" : `공제율 ${(rentRate * 100).toFixed(0)}%` },
    { name: "의료비 세액공제", credit: medCredit, note: `문턱 ${won(threshold)}원 초과분에만 15%` },
    { name: "교육비 세액공제", credit: eduCredit, note: kind.label },
  ].filter((r) => r.credit > 0 || r.name === "월세 세액공제");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-5">
        <div>
          <label className={labelCls}>그 해 총급여 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="예: 50000000"
            className={inputCls}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[35_000_000, 50_000_000, 65_000_000, 80_000_000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSalary(String(v))}
                className={chipCls(sal === v)}
              >
                {won(v / 10_000)}만 원
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            연도마다 총급여가 다르면 그 해 기준으로 각각 계산해야 정확합니다. 여기서는 한 해를
            기준으로 잡고 연수를 곱합니다.
          </p>
        </div>

        <div>
          <label className={labelCls}>놓친 월세 (월, 원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={rentMonth}
            onChange={(e) => setRentMonth(e.target.value)}
            placeholder="예: 500000"
            className={inputCls}
          />
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            무주택 세대주이고 총급여 7,000만 원 이하일 때 대상입니다. 공제 대상 한도는 연 1,000만
            원이라 월 84만 원쯤부터 그 위쪽은 계산에서 빠집니다.
          </p>
        </div>

        <div>
          <label className={labelCls}>놓친 의료비 (연간, 원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={medical}
            onChange={(e) => setMedical(e.target.value)}
            placeholder="예: 3000000"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setMedNoCap(!medNoCap)}
            className={`mt-2 ${chipCls(medNoCap)}`}
          >
            본인·65세 이상·장애인·난임 (한도 없음)
          </button>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            총급여의 3%를 넘는 금액에만 15%가 붙습니다. 그 밖의 부양가족 분은 700만 원 한도이고,
            위 버튼을 켜면 한도 없이 계산합니다.
          </p>
        </div>

        <div>
          <label className={labelCls}>놓친 교육비 (연간, 원)</label>
          <select
            value={eduKind}
            onChange={(e) => setEduKind(e.target.value)}
            className={`${inputCls} mb-2`}
          >
            {EDU_KINDS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={edu}
            onChange={(e) => setEdu(e.target.value)}
            placeholder="예: 5000000"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>몇 개 연도를 청구하나</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setYears(String(v))}
                className={chipCls(yrs === v)}
              >
                {v}개 연도
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            경정청구는 법정신고기한(5월 31일)부터 5년이라, 2026년 8월 현재 청구할 수 있는 것은
            2021~2025년 귀속 5개 연도입니다.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-6 md:p-8">
        {valid ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">
                {yrs}개 연도를 청구하면 돌려받을 것으로 예상되는 금액
              </p>
              <p className="mt-1 text-4xl font-black text-brand-dark">{won(total)}원</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                한 해당 {won(perYear)}원 (지방소득세 포함)
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.name}>
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.name}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">
                        {won(r.credit * 1.1)}원
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rentOverCap > 0 && (
              <p className="text-xs font-bold text-amber-600">
                월세 연 {won(rentY)}원 중 {won(rentOverCap)}원은 공제 대상 한도(1,000만 원)를
                넘어 계산에서 빠졌습니다.
              </p>
            )}
            {medOverCap > 0 && (
              <p className="text-xs font-bold text-amber-600">
                의료비 문턱을 넘은 금액 중 {won(medOverCap)}원은 700만 원 한도를 넘어 빠졌습니다.
                본인·65세 이상·장애인·난임 지출이라면 위 버튼을 켜고 다시 계산해 보세요.
              </p>
            )}
            {med > 0 && med <= threshold && (
              <p className="text-xs font-bold text-amber-600">
                의료비 {won(med)}원은 총급여의 3%({won(threshold)}원)를 넘지 못해 공제액이 0원입니다.
                가족 의료비를 한 사람에게 모으면 문턱을 한 번만 넘으면 됩니다.
              </p>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              2026년 기준 — 환급액은 세액공제액에 지방소득세 10%를 더한 값입니다. 다만{" "}
              <strong className="text-slate-500">실제로 낸 세금(결정세액) 한도 안에서만</strong>{" "}
              돌려받으므로, 이미 결정세액이 0원이라면 환급도 없습니다. 연도마다 총급여와 공제
              내역이 다르면 결과가 달라지니, 정확한 금액은 홈택스에서 연도별로 확인하세요.
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-400 font-medium">
            총급여와 놓친 공제 항목을 넣으면 환급 예상액이 계산됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
