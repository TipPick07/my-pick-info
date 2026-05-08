'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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
    <th className="bg-slate-100 font-black text-sm p-3 text-left border border-slate-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="p-3 border border-slate-200 text-sm">{children}</td>
  ),
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
