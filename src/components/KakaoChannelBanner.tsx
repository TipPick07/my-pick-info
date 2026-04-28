export default function KakaoChannelBanner() {
  return (
    <div className="my-8 rounded-2xl bg-[#FEE500] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💬</span>
        <div>
          <p className="font-bold text-slate-800 text-base">수도권 팁픽 카카오톡 채널</p>
          <p className="text-sm text-slate-600">매일 아침 핫한 지원금·축제 정보를 카톡으로 받아보세요!</p>
        </div>
      </div>
      <a
        href="https://pf.kakao.com/_nxjSjX"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
      >
        채널 추가하기
      </a>
    </div>
  );
}
