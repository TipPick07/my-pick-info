import type { ReactNode } from 'react';

type PillColor = 'brand' | 'emerald' | 'indigo' | 'rose' | 'slate';

const COLOR: Record<PillColor, string> = {
  brand: 'bg-cyan-50 text-brand-dark',
  emerald: 'bg-emerald-50 text-emerald-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

/** 작은 라벨/배지 칩 — 건수·태그·상태 표시에 공통 사용. */
export function Pill({
  children,
  color = 'slate',
  className = '',
}: {
  children: ReactNode;
  color?: PillColor;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${COLOR[color]} ${className}`}>
      {children}
    </span>
  );
}
