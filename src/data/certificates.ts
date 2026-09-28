export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuerBadge: string;
  category: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  grade?: string;
  location?: string;
  instructor?: string;
  skills: string[];
  badgeLeft?: string;
  badgeRight?: string;
  moduleCategories?: { title: string; skills: string[] }[];
  description: string;
  status: 'Verified';
  accentColor: string;
}

export const certificatesList: Certificate[] = [
  {
    id: 'sheryians-ai-cohort',
    title: '2.0 Job Ready AI Powered Cohort',
    issuer: 'Sheryians Coding School',
    issuerBadge: 'SHERYIANS®',
    category: 'Full Stack & AI',
    issueDate: '8 September 2026',
    credentialId: '108040235499573595336067',
    credentialUrl: 'https://sheryians.com/certificate/108040235499573595336067',
    image: '/images/certificates/sheryians-2-0-cohort.png',
    instructor: 'Harsh Sharma',
    location: 'Live AI Cohort',
    skills: [
      'MongoDB',
      'Express.js',
      'React.js',
      'Node.js',
      'Docker',
      'AWS',
      'Kubernetes',
      'Redis',
      'LangGraph',
      'Generative AI (GenAI)',
      'Git & GitHub',
      'Data Structures & Algorithms (DSA)',
      'RESTful APIs',
      'JWT Authentication',
      'Tailwind CSS',
    ],
    moduleCategories: [
      {
        title: 'MERN Stack & Web Engineering',
        skills: [
          'MongoDB (NoSQL)',
          'Express.js',
          'React.js',
          'Node.js',
          'JavaScript (ES6+)',
          'RESTful APIs & Endpoints',
          'Mongoose ODM',
          'JWT & User Authentication',
          'Tailwind CSS',
        ],
      },
      {
        title: 'DevOps, Cloud & Infrastructure',
        skills: [
          'Docker (Containerization)',
          'AWS (Cloud Services)',
          'Kubernetes (K8s Orchestration)',
          'Redis (In-Memory Caching & Queues)',
          'Git & GitHub (CI/CD Workflows)',
        ],
      },
      {
        title: 'Generative AI & Agentic Workflows',
        skills: [
          'Generative AI (GenAI)',
          'LangGraph (Multi-Agent Architectures)',
          'AI-Powered System Development',
          'Full-Stack Production Deployment',
        ],
      },
      {
        title: 'Data Structures & Algorithms (DSA)',
        skills: [
          'Data Structures & Algorithms',
          'Algorithmic Problem-Solving',
          'Time & Space Complexity Analysis',
          'Aptitude & Analytical Reasoning',
        ],
      },
    ],
    description:
      'Awarded for successfully completing the 2.0 Job Ready AI Powered Cohort, demonstrating verified proficiency in full-stack MERN development (MongoDB, Express.js, React.js, Node.js), DevOps & Cloud (Docker, AWS, Kubernetes, Redis, Git & GitHub), Generative AI & LangGraph agentic systems, and Data Structures & Algorithms.',
    status: 'Verified',
    accentColor: '#ff5722',
  },
  {
    id: 'maac-apdmd',
    title: 'Advanced Program in Digital Media and Design',
    issuer: 'MAAC (Maya Academy of Advanced Creativity) • Aptech Ltd.',
    issuerBadge: 'MAAC',
    category: 'Web & Digital Media',
    issueDate: 'June 2025',
    grade: 'B+ (Good)',
    location: 'DELHI-PITAMPURA',
    credentialId: '104eC1581252',
    credentialUrl: 'https://aptrack.online/examadmin/ps-cert-verification/1866430',
    image: '/images/certificates/maac-certificate.jpg',
    skills: [
      'HTML',
      'Cascading Style Sheets (CSS)',
      'JavaScript',
      'Bootstrap',
      'Angular JS',
      'PHP & MySQL',
      'WordPress',
      'Adobe XD',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'CorelDRAW',
      'Adobe InDesign',
      'Adobe Premiere',
      'Adobe Audition',
      'Adobe Animate',
      'ActionScript',
      'Dreamweaver',
      'Toon Boom-Harmony',
    ],
    moduleCategories: [
      {
        title: 'Web Engineering & CMS',
        skills: [
          'HTML',
          'Cascading Style Sheets (CSS)',
          'JavaScript',
          'Bootstrap',
          'Angular JS',
          'PHP & MySQL',
          'WordPress',
          'Dreamweaver',
        ],
      },
      {
        title: 'UI/UX & Graphic Design',
        skills: [
          'Adobe XD',
          'Adobe Photoshop',
          'Adobe Illustrator',
          'CorelDRAW',
          'Adobe InDesign',
        ],
      },
      {
        title: 'Animation & Audio / Video',
        skills: [
          'Adobe Premiere',
          'Adobe Audition',
          'Adobe Animate',
          'ActionScript',
          'Toon Boom-Harmony',
        ],
      },
    ],
    description:
      'Comprehensive professional diploma in digital media, UI/UX architecture, responsive web engineering (HTML, CSS, JavaScript, Bootstrap, Angular JS), server-side database web systems (PHP & MySQL), WordPress CMS, and multimedia design suites.',
    status: 'Verified',
    accentColor: '#38bdf8',
  },
];
