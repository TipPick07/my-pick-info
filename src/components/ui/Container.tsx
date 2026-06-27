import type { ReactNode } from 'react';

type ContainerSize = 'narrow' | 'default' | 'wide';

const MAX_WIDTH: Record<ContainerSize, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
};

/**
 * 페이지 공통 가로 컨테이너 — 중앙 정렬 + 일관된 좌우 여백.
 * '상황별 혜택'의 깔끔한 톤(넉넉한 여백, 중앙 정렬)을 전 페이지 기준으로 통일.
 */
export function Container({
  children,
  size = 'default',
  className = '',
}: {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}) {
  return (
    <div className={`${MAX_WIDTH[size]} mx-auto w-full px-4 md:px-6 ${className}`}>
      {children}
    </div>
  );
}
