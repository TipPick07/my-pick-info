import Link from 'next/link';

/**
 * 섹션 제목 — 왼쪽 컬러 바 + 제목 + (선택) "전체 보기" 링크.
 * 모든 섹션 헤더를 동일 규격으로 통일해 시각 위계를 일관되게 유지.
 */
export function SectionHeading({
  title,
  accentColor = '#00CCFF',
  moreHref,
  moreLabel = '전체 보기 →',
}: {
  title: string;
  accentColor?: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <h3
        className="text-xl font-black text-slate-900 pl-4"
        style={{ borderLeft: `6px solid ${accentColor}` }}
      >
        {title}
      </h3>
      {moreHref && (
        <Link
          href={moreHref}
          className="text-sm font-bold text-brand-dark hover:text-brand transition-colors"
        >
          {moreLabel}
        </Link>
      )}
    </div>
  );
}
