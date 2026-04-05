"use client";

export default function CoupangBanner() {
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;

  if (!partnerId || partnerId === "나중에_입력") {
    return null;
  }

  return (
    <div className="w-full py-8 text-center flex justify-center">
      {/* Coupang Partners Dynamic Banner Example */}
      <div className="max-w-xl w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Coupang Partners</p>
          <p className="text-sm font-bold text-slate-700">추천 상품을 확인해보세요!</p>
        </div>
        <a 
          href={`https://link.coupang.com/a/custom?id=${partnerId}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-rose-500 text-white px-6 py-2 rounded-full text-sm font-black hover:bg-rose-600 transition-all active:scale-95"
        >
          쇼핑하기 →
        </a>
      </div>
      <p className="hidden">"이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."</p>
    </div>
  );
}
