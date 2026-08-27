import type { ReactNode } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import '../Blog.css';

export function BlogLink({
  href,
  children,
  external = true,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="blog-link"
    >
      {children}
      {external && <HiExternalLink />}
    </a>
  );
}

export function BlogButton({
  href,
  onClick,
  children,
  icon,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className="blog-button" target="_blank" rel="noopener noreferrer">
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="blog-button">
      {icon}
      {children}
    </button>
  );
}

export function BlogButtonsContainer({
  children,
  direction = 'row',
}: {
  children: ReactNode;
  direction?: 'row' | 'column';
}) {
  return (
    <div className={`blog-buttons-container ${direction}`}>{children}</div>
  );
}
