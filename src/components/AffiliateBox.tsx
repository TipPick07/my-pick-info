import { COUPANG_DISCLOSURE, getAffiliateSlot } from "@/config/affiliate";

/**
 * 제휴 링크 박스 — 쿠팡 파트너스
 * ───────────────────────────────────────────────────────────────────────────
 * ▷ 링크가 하나도 설정되지 않은 슬롯은 null을 반환해 아무것도 그리지 않는다(fail-closed).
 *   → 페이지에 미리 심어 둬도 링크 확보 전까지 화면·HTML에 흔적이 남지 않는다.
 * ▷ 대가성 표기(COUPANG_DISCLOSURE)를 항상 함께 렌더한다 — 분리하지 말 것.
 * ▷ 외부 링크는 rel="nofollow sponsored noopener noreferrer" 고정.
 *   sponsored는 유료 링크에 대한 구글 표기 규칙이고, 빼면 링크스팸으로 읽힐 수 있다.
 * ▷ 제목은 <p>로 쓴다 — h2로 올리면 광고가 본문 heading 구조에 섞인다.
 */
export default function AffiliateBox({ slot }: { slot: string }) {
  const data = getAffiliateSlot(slot);
  if (!data) return null;

  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
        광고 · 쿠팡 파트너스
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{data.heading}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{data.intro}</p>
      <ul className="mt-4 space-y-2">
        {data.products.map((p) => (
          <li key={p.label}>
            <a
              href={p.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm transition hover:border-amber-400"
            >
              <span className="text-sm font-semibold text-slate-800">
                {p.label}
                {p.note ? (
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    {p.note}
                  </span>
                ) : null}
              </span>
              <span aria-hidden className="shrink-0 font-bold text-amber-600">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        {COUPANG_DISCLOSURE}
      </p>
    </aside>
  );
}
