import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  schema?: Record<string, unknown>;
}

const DEFAULT_TITLE = 'Mohd Kaif (kaifcoder) | Full Stack Developer & AI Engineer';
const DEFAULT_DESC =
  'Official portfolio of Mohd Kaif (kaifcoder). Full Stack Developer & AI Engineer based in Delhi, India. Creator of AdZero, building high-performance web applications with React, TypeScript, Node.js, Python, Docker, and Generative AI.';
const DEFAULT_CANONICAL = 'https://www.kaifcoder.in/';
const DEFAULT_KEYWORDS =
  'Mohd Kaif, kaifcoder, kaif coder, kaif, kaifcodr, mohd kaif portfolio, kaif coder portfolio, mohd kaif developer, kaif developer, full stack developer delhi, full stack developer india, mohd kaif full stack developer, mohd kaif ai engineer, adzero, adzero creator, sheryians mohd kaif, react developer, node.js developer, python developer, kaifcoder.in, www.kaifcoder.in';
const DEFAULT_OG_IMAGE = 'https://www.kaifcoder.in/og/og-image.png';

export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical = DEFAULT_CANONICAL,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
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
    setMeta('meta[name="keywords"]', 'content', keywords);

    // 4. Update OpenGraph
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:image"]', 'content', ogImage);

    // 5. Update Twitter
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:url"]', 'content', canonical);
    setMeta('meta[name="twitter:image"]', 'content', ogImage);

    // 6. Update Canonical Link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // 7. Inject Route-Specific Schema if provided
    let schemaScript = document.getElementById('route-schema') as HTMLScriptElement | null;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'route-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Optional cleanup of route-specific schema
      const dynamicSchema = document.getElementById('route-schema');
      if (dynamicSchema) dynamicSchema.remove();
    };
  }, [title, description, canonical, keywords, ogImage, schema]);
}
