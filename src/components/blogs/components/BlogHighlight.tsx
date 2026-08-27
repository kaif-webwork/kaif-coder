import type { ReactNode } from 'react';
import '../Blog.css';

export function WhiteBoldHighlight({ children }: { children: ReactNode }) {
  return <span className="blog-highlight-white">{children}</span>;
}

export function NormalHighlight({ children }: { children: ReactNode }) {
  return <span className="blog-highlight-normal">{children}</span>;
}

export function CustomColorHighlight({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <span className="blog-highlight-custom" style={{ color }}>
      {children}
    </span>
  );
}
