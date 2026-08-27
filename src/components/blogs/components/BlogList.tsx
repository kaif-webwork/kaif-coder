import type { ReactNode } from 'react';
import '../Blog.css';

export function BlogOrderedList({ items }: { items: ReactNode[] }) {
  return (
    <ol className="blog-list ordered">
      {items.map((item, idx) => (
        <li key={idx} className="blog-list-item">
          {item}
        </li>
      ))}
    </ol>
  );
}

export function BlogUnorderedList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="blog-list unordered">
      {items.map((item, idx) => (
        <li key={idx} className="blog-list-item">
          {item}
        </li>
      ))}
    </ul>
  );
}
