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
  programType?: string;
  specialization?: string;
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
    programType: 'Full-Stack & AI',
    location: 'Live AI Cohort',
    skills: [
      'MongoDB',
      'Express.js',
      'React.js',
      'Node.js',
      'JavaScript',
      'Mongoose',
      'Tailwind CSS',
      'Docker',
      'AWS',
      'Kubernetes',
      'Redis',
      'LangGraph',
      'GenAI',
      'Git',
      'GitHub',
      'DSA',
      'Aptitude',
    ],
    moduleCategories: [
      {
        title: 'MERN Stack',
        skills: [
          'MongoDB',
          'Express.js',
          'React.js',
          'Node.js',
          'JavaScript',
          'Mongoose',
          'Tailwind CSS',
        ],
      },
      {
        title: 'DevOps & Cloud',
        skills: [
          'Docker',
          'AWS',
          'Kubernetes',
          'Redis',
          'Git',
          'GitHub',
        ],
      },
      {
        title: 'Generative AI',
        skills: [
          'LangGraph',
          'GenAI',
        ],
      },
      {
        title: 'Data Structures & Algorithms',
        skills: [
          'DSA',
          'Algorithms',
          'Aptitude',
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
      'HTML5',
      'CSS3',
      'JavaScript',
      'Bootstrap',
      'AngularJS',
      'PHP',
      'MySQL',
      'WordPress',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
      'CorelDRAW',
      'InDesign',
      'Premiere Pro',
      'Audition',
      'Animate',
      'Dreamweaver',
      'Toon Boom Harmony',
    ],
    moduleCategories: [
      {
        title: 'Web & CMS',
        skills: [
          'HTML5',
          'CSS3',
          'JavaScript',
          'Bootstrap',
          'AngularJS',
          'PHP',
          'MySQL',
          'WordPress',
          'Dreamweaver',
        ],
      },
      {
        title: 'UI/UX & Graphic Design',
        skills: [
          'Adobe XD',
          'Photoshop',
          'Illustrator',
          'CorelDRAW',
          'InDesign',
        ],
      },
      {
        title: 'Animation & Audio / Video',
        skills: [
          'Premiere Pro',
          'Audition',
          'Animate',
          'Toon Boom Harmony',
        ],
      },
    ],
    description:
      'Comprehensive professional diploma in digital media, UI/UX architecture, responsive web engineering (HTML, CSS, JavaScript, Bootstrap, Angular JS), server-side database web systems (PHP & MySQL), WordPress CMS, and multimedia design suites.',
    status: 'Verified',
    accentColor: '#38bdf8',
  },
];
