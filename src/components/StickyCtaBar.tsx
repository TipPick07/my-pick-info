"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "tippick-cta-bar-dismissed";
const DISMISS_DAYS = 7;
const SHOW_AFTER_PX = 600;

export default function StickyCtaBar() {
  const [visible, setVisible] = useState(false);
  // SSR/판단 전에는 숨김(true)로 시작 → 하이드레이션 불일치 방지
  const [dismissed, setDismissed] = useState(true);

  // 1) 마운트 시 dismiss 만료 여부 판단 (클라이언트 전용)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (!isNaN(ts) && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
          return; // 아직 7일 안 지남 → 계속 숨김
        }
      }
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  // 2) 스크롤 600px 이상이면 노출
  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  // 3) body 클래스 토글 → 본문 하단 여백 확보(globals.css)
  useEffect(() => {
    const show = visible && !dismissed;
    document.body.classList.toggle("cta-bar-visible", show);
    return () => document.body.classList.remove("cta-bar-visible");
  }, [visible, dismissed]);

  const handleClose = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* localStorage 사용 불가 시 세션 한정으로만 숨김 */
    }
    setVisible(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="육아·가족 혜택·가이드 보기"
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3 sm:gap-3">
          <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
            <span className="sm:hidden">🔔 내 혜택 찾기</span>
            <span className="hidden sm:inline">🔔 우리 집 육아·가족 혜택 + 가이드 보기</span>
          </p>
          <a
            href="/guides/"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#FEE500] px-4 py-2.5 text-sm font-black text-[#3C1E1E] transition-transform hover:scale-[1.03] active:scale-95"
          >
            혜택·가이드 보기 →
          </a>
          <button
            type="button"
            onClick={handleClose}
            aria-label="배너 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <span aria-hidden="true" className="text-xl leading-none">&times;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
