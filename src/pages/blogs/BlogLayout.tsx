import { Link } from 'react-router';
import { useSEO } from '../../hooks/useSEO';
import Footer from '../../components/footer/Footer';
import './BlogLayout.css';

import { blogPosts } from '../../data/blogs';

export default function BlogLayout() {
  useSEO({
    title: 'Engineering Blog & Articles | Mohd Kaif • kaifcoder.in',
    description:
      'Technical blog posts and software architecture tutorials written by Mohd Kaif (kaifcoder / kaif coder). Insights on modern web development and scaling apps.',
    canonical: 'https://www.kaifcoder.in/blogs',
  });

  return (
    <div className="blog-layout-wrapper">
      <div className="blog-layout-page">
        <h1 className="blog-layout-title">Blogs &amp; Writing</h1>
        <p className="blog-layout-subtitle">
          Thoughts on software engineering, architecture, developer tools, and building for the web.
        </p>

        <div className="blog-posts-list">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blogs/${post.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-desc">{post.desc}</p>
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
