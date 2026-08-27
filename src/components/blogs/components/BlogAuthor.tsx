import type { ReactNode } from 'react';
import { userImages } from '../../../data/images';
import '../Blog.css';

export function BlogAuthor({
  name = 'Mohd Kaif',
  avatar = userImages.profile.avatar,
  children,
}: {
  name?: string;
  avatar?: string;
  children: ReactNode;
}) {
  return (
    <div className="blog-author-card">
      <img src={avatar} alt={name} className="blog-author-avatar" />
      <div className="blog-author-info">
        <div className="blog-author-name">{name}</div>
        <div className="blog-author-reply">{children}</div>
      </div>
    </div>
  );
}
