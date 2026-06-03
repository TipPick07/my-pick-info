export default function KakaoChannelBanner() {
  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-7 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
        {/* 카피 */}
        <div className="flex-1 space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            📢 매일 아침, 수도권 축제·지원금을 카톡으로 받아보세요
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            서울·경기·인천 나들이부터 놓치면 손해인 지원금까지 — 찾지 말고 무료로 받아보세요.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            매일 2건 · 무료
          </span>
        </div>

        {/* 버튼: 데스크톱 가로 / 모바일 세로 스택 */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:shrink-0">
          <a
            href="https://open.kakao.com/o/gdb5gJsi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#FEE500] px-6 py-3 text-sm font-black text-[#3C1E1E] shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          >
            💬 카톡방 무료 입장
          </a>
          <a
            href="https://instagram.com/tippick_kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
            style={{ background: "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)" }}
          >
            📷 인스타 팔로우
          </a>
        </div>
      </div>
    </div>
  );
}
