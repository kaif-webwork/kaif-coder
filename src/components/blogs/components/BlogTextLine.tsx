import type { ReactNode } from 'react';
import '../Blog.css';

export function BlogTextLine({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="blog-text-line">
      {icon && <span className="blog-text-line-icon">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
