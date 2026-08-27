export interface ProjectData {
  banner: string;
  name: string;
  desc: string;
  tech: string[];
  github?: string;
  live?: string;
  preview?: string;
  demoWarning?: boolean;
  isUnderDevelopment?: boolean;
  isPrivate?: boolean;
  badgeLeft?: string;
  badgeRight?: string;
  statusIcon?: string;
  icon?: string;
}

export const featuredProjects: ProjectData[] = [
  {
    banner: '/images/projects/adzero-thumb.jpg',
    name: 'AdZero',
    icon: '/images/projects/adzero-icon.svg',
    badgeLeft: 'v4.4 • Android App',
    desc: 'Entertainment Without Interruptions. An Ad-Free streaming experience with video streaming, smart categories, powerful search, personalized experience, and secure architecture.',
    tech: ['Kotlin', 'Android', 'Firebase', 'Retrofit', 'Coil', 'Material 3'],
    github: 'https://github.com/kaif-webwork/AdZero',
    preview: '/projects/adzero',
  },
];

export const additionalProjects: ProjectData[] = [];

export const allProjects: ProjectData[] = [
  ...featuredProjects,
  ...additionalProjects,
];
