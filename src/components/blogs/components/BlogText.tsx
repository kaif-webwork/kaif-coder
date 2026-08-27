import type { ReactNode } from 'react';
import '../Blog.css';

export function BlogTitle({ children }: { children: ReactNode }) {
  return <h1 className="blog-title">{children}</h1>;
}

export function BlogHeader({ children }: { children: ReactNode }) {
  return <h2 className="blog-header">{children}</h2>;
}

export function BlogDesc({ children }: { children: ReactNode }) {
  return <p className="blog-desc">{children}</p>;
}

export function BlogParagraph({ children }: { children: ReactNode }) {
  return <p className="blog-paragraph">{children}</p>;
}
