export interface BlogPostMeta {
  slug: string;
  title: string;
  desc: string;
  date: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: 'how-to-plan-a-project',
    title: 'How to Plan a Software Project from Scratch',
    desc: 'A practical, step-by-step guide on taking an idea from raw concept to finished production software with proper architecture and clean execution.',
    date: 'Jan 15, 2026',
    readTime: '6 min read',
    tags: ['Architecture', 'Planning', 'FullStack'],
  },
];
