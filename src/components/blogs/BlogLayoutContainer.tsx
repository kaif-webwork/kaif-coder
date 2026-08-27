import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { HiArrowLeft } from 'react-icons/hi2';
import Footer from '../footer/Footer';
import './Blog.css';

interface BlogLayoutContainerProps {
  children: ReactNode;
}

export default function BlogLayoutContainer({ children }: BlogLayoutContainerProps) {
  return (
    <div className="blog-layout-wrapper">
      <div className="blog-container">
        <div style={{ marginBottom: '24px' }}>
          <Link to="/blogs" className="blog-link" style={{ textDecoration: 'none' }}>
            <HiArrowLeft /> Back to Blogs
          </Link>
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
