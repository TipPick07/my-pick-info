'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';

// 표 셀의 순수 텍스트 길이를 추출 — 짧은 값은 가운데, 긴 문장은 왼쪽 정렬 판단용
function cellTextLength(node: ReactNode): number {
  if (node == null || typeof node === 'boolean') return 0;
  if (typeof node === 'string' || typeof node === 'number') return String(node).length;
  if (Array.isArray(node)) return node.reduce((sum: number, n) => sum + cellTextLength(n), 0);
  if (typeof node === 'object' && 'props' in node) {
    return cellTextLength((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return 0;
}

// 이 길이를 넘으면 긴 문장으로 보고 왼쪽 정렬(가독성), 이하면 가운데 정렬(시인성)
const LONG_CELL_THRESHOLD = 40;

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-lg text-slate-700 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="text-slate-700 mb-2">{children}</li>
  ),
  table: ({ children }) => (
    <table className="w-full border-collapse mb-6">{children}</table>
  ),
  th: ({ children }) => (
    <th className="bg-slate-100 font-black text-sm p-3 text-center align-middle border border-slate-200">{children}</th>
  ),
  td: ({ children }) => {
    // 짧은 값 → 가운데 정렬(시인성), 긴 문장 → 왼쪽 정렬(가독성), 전체 세로 가운데
    const align = cellTextLength(children) > LONG_CELL_THRESHOLD ? 'text-left' : 'text-center';
    return (
      <td className={`p-3 border border-slate-200 text-sm align-middle ${align}`}>{children}</td>
    );
  },
  strong: ({ children }) => (
    <strong className="font-black text-slate-900">{children}</strong>
  ),
};

export default function MdContent({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
