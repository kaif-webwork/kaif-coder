import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

export function useSEO({
  title = 'Mohd Kaif | Full Stack Developer | Portfolio',
  description = 'Mohd Kaif (kaifcoder) is a Full Stack Developer based in Delhi, India. Creator of AdZero, building high-performance web & mobile applications with React, TypeScript, Node.js, and Python.',
  canonical = 'https://www.kaifcoder.in/',
}: SEOProps = {}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Helper to set/create meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [key, val] = selector.replace(/[[\]"]/g, '').split('=');
        if (key && val) element.setAttribute(key, val);
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    // 3. Update Standard Meta
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="title"]', 'content', title);

    // 4. Update OpenGraph
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);

    // 5. Update Twitter
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:url"]', 'content', canonical);

    // 6. Update Canonical Link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }, [title, description, canonical]);
}
