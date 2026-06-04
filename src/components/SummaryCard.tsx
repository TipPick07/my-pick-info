interface SummaryRow {
  label: string;
  value: string;
}

interface SummaryCardProps {
  category: 'festival' | 'benefit' | 'blog';
  rows: SummaryRow[];
  badges?: string[];
  className?: string;
}

const CATEGORY_CONFIG = {
  festival: {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    textColor: 'text-orange-600',
    dotColor: 'bg-orange-400',
    badgeBg: 'bg-white text-orange-700 border-orange-200',
    icon: '🎪',
    title: '축제 핵심 정보',
  },
  benefit: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    textColor: 'text-emerald-600',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-white text-emerald-700 border-emerald-200',
    icon: '💰',
    title: '지원금 핵심 요약',
  },
  blog: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    textColor: 'text-indigo-500',
    dotColor: 'bg-indigo-400',
    badgeBg: 'bg-white text-indigo-700 border-indigo-200',
    icon: '💡',
    title: '이 글의 핵심',
  },
} as const;

export default function SummaryCard({ category, rows, badges, className = '' }: SummaryCardProps) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div className={`${cfg.bg} rounded-[2rem] border ${cfg.border} p-8 md:p-10 ${className}`}>
      <p className={`text-xs font-black ${cfg.textColor} uppercase tracking-widest mb-5`}>
        {cfg.icon} {cfg.title}
      </p>
      <div className="grid gap-6">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-4">
            <div className={`mt-[0.45rem] w-2 h-2 rounded-full ${cfg.dotColor} shrink-0`} />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-slate-400">{row.label}</p>
              <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-line break-words">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
      {badges && badges.length > 0 && (
        <div className={`flex flex-wrap gap-2 pt-5 mt-5 border-t ${cfg.border}`}>
          {badges.map((badge, i) => (
            <span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.badgeBg}`}>
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
