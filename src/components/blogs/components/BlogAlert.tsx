import type { ReactNode } from 'react';
import { HiCheckCircle, HiExclamationTriangle, HiXCircle } from 'react-icons/hi2';
import '../Blog.css';

interface AlertProps {
  title?: string;
  children: ReactNode;
}

export function BlogTip({ title = 'Tip', children }: AlertProps) {
  return (
    <div className="blog-alert tip">
      <div className="blog-alert-title">
        <HiCheckCircle /> {title}
      </div>
      <div className="blog-alert-content">{children}</div>
    </div>
  );
}

export function BlogWarn({ title = 'Warning', children }: AlertProps) {
  return (
    <div className="blog-alert warn">
      <div className="blog-alert-title">
        <HiExclamationTriangle /> {title}
      </div>
      <div className="blog-alert-content">{children}</div>
    </div>
  );
}

export function BlogDontDo({ title = "Don't Do This", children }: AlertProps) {
  return (
    <div className="blog-alert dont">
      <div className="blog-alert-title">
        <HiXCircle /> {title}
      </div>
      <div className="blog-alert-content">{children}</div>
    </div>
  );
}
