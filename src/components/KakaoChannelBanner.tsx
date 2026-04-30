export default function KakaoChannelBanner() {
  return (
    <div className="my-8 rounded-2xl bg-[#FEE500] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💬</span>
        <div>
          <p className="font-bold text-slate-800 text-base">수도권 팁픽 실시간 카톡 알림방</p>
          <p className="text-sm text-slate-600">주말 나들이 축제부터 놓치면 손해인 알짜 지원금까지 한 번에 받아보세요!</p>
        </div>
      </div>
      <a
        href="https://open.kakao.com/o/gdb5gJsi"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
      >
        알림방 무료 입장하기
      </a>
    </div>
  );
}
