import type { ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary';

const VARIANT: Record<ButtonVariant, string> = {
  // 진한 슬레이트 솔리드 — 미니멀 톤의 주 CTA
  primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md',
  // 얇은 보더 아웃라인 — 보조 CTA
  secondary: 'bg-white text-slate-700 border-2 border-slate-200 hover:border-brand hover:text-brand-dark',
};

/** 공통 버튼(링크형) — primary/secondary 두 변형. CSS hover만 사용. */
export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-2xl px-8 py-3.5 transition-all duration-300 ${VARIANT[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
