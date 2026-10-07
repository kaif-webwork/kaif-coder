export interface QuickPrompt {
  id: string;
  title: string;
  desc: string;
  label: string;
  prompt: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'adzero',
    title: 'AdZero App',
    desc: 'v4.4 Android app',
    label: 'AdZero App',
    prompt: 'Tell me about the AdZero app and how it works',
  },
  {
    id: 'skills',
    title: 'Tech Stack',
    desc: 'React, Node & AI',
    label: 'Tech Stack',
    prompt: 'What technologies and skills does Mohd Kaif specialize in?',
  },
  {
    id: 'experience',
    title: 'Experience',
    desc: 'Projects & Work',
    label: 'Experience',
    prompt: 'What is Mohd Kaif\'s engineering work experience?',
  },
  {
    id: 'certificates',
    title: 'Credentials',
    desc: 'Sheryians & MAAC',
    label: 'Certificates',
    prompt: 'Show me verified certifications and credentials',
  },
  {
    id: 'resume',
    title: 'View Resume',
    desc: 'Verified PDF & Bio',
    label: 'View Resume',
    prompt: 'Where can I view or download Mohd Kaif\'s resume?',
  },
  {
    id: 'contact',
    title: 'Hire / Contact',
    desc: 'Work with Kaif',
    label: 'Contact Kaif',
    prompt: 'How can I hire or contact Mohd Kaif?',
  },
];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface KnowledgeEntry {
  id: string;
  patterns: RegExp[];
  response: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // 1. Direct Email Request
  {
    id: 'direct_email',
    patterns: [
      /\b(email|e-mail|mail|gmail|email id|mail id)\b/i,
      /\b(email do|mail do|email address|kaif ki mail|inbox)\b/i,
    ],
    response: `### Mohd Kaif's Official Email

:::card Direct Mail Access
You can reach Mohd Kaif directly for engineering contracts, full-time roles, or inquiries:
- **Email**: [copy: kaif.webwork@gmail.com]
- **Response Time**: Usually within 12–24 hours
:::

[button: Send Email Directly](mailto:kaif.webwork@gmail.com)
[button: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)`,
  },

  // 2. Direct GitHub Request
  {
    id: 'direct_github',
    patterns: [
      /\b(github|git repo|repositories|repos|open source code|codebase)\b/i,
    ],
    response: `### GitHub & Open Source

:::card GitHub Profile
Explore Mohd Kaif's production repositories, experimental developer tools, and architectures:
- **GitHub**: [github.com/kaif-webwork](https://github.com/kaif-webwork) [copy: kaif-webwork]
- **Flagship Project**: [AdZero on GitHub](https://github.com/kaif-webwork/AdZero)
:::

[button: Open GitHub Profile](https://github.com/kaif-webwork)
[button: AdZero GitHub Repository](https://github.com/kaif-webwork/AdZero)`,
  },

  // 3. Direct LinkedIn Request
  {
    id: 'direct_linkedin',
    patterns: [
      /\b(linkedin|connect on linkedin|linkedin profile|linkedin link)\b/i,
    ],
    response: `### Professional Network

:::card LinkedIn
Connect with Mohd Kaif on LinkedIn for professional collaborations and network updates:
- **LinkedIn**: [linkedin.com/in/mohd-kaif-6a453741a](https://www.linkedin.com/in/mohd-kaif-6a453741a)
:::

[button: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)
[button: View Full Resume](/resume)`,
  },

  // 4. Geographic Location
  {
    id: 'location',
    patterns: [
      /\b(location|delhi|india|where (are you|is kaif)|kahan (rehta|rehte|se ho)|city|address|country|based)\b/i,
    ],
    response: `### Location & Geographic Base

:::card Location Details
Mohd Kaif is based in **Delhi, India**.
- **Timezone**: Indian Standard Time (IST, UTC+5:30)
- **Work Availability**: Open for Remote Worldwide, Hybrid, or On-Site in Delhi NCR
:::

[button: Contact Mohd Kaif](mailto:kaif.webwork@gmail.com)
[button: View Full Resume](/resume)`,
  },

  // 5. Hiring & Freelance Availability
  {
    id: 'hire_freelance',
    patterns: [
      /\b(hire|freelance|available|contract|work together|collab|collaboration|baat karni|reach out|pricing|rate|charges|cost|kaise (hire|contact)|project banana|hire karna)\b/i,
    ],
    response: `### Availability & Hiring Mohd Kaif

:::card Work Availability
Mohd Kaif is actively **available** for:
- **Full Stack Web Engineering** (React 19, Next.js, Node.js, TypeScript)
- **Autonomous AI Agent Systems** (LangGraph, Multi-Agent orchestration)
- **High-impact Contract & Freelance Projects**
:::

:::card Direct Communication
- **Email**: [copy: kaif.webwork@gmail.com]
- **LinkedIn**: [linkedin.com/in/mohd-kaif-6a453741a](https://www.linkedin.com/in/mohd-kaif-6a453741a)
- **GitHub**: [github.com/kaif-webwork](https://github.com/kaif-webwork)
:::

[button: Send Email to Kaif](mailto:kaif.webwork@gmail.com)
[button: Message on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)`,
  },

  // 6. Capabilities & Services
  {
    id: 'services',
    patterns: [
      /\b(service|services|what can you build|kya bana sakte|kya services|capabilities|offerings|what do you build)\b/i,
    ],
    response: `### Engineering Capabilities & Services

:::card What Mohd Kaif Can Build
- **Full Stack Web Applications**: High-speed React 19, TypeScript, Next.js apps with edge caching and dark minimalist aesthetics
- **Agentic AI Systems**: Multi-agent orchestration, LangGraph pipelines, and custom prompt/tool integration
- **Backend & Cloud Architecture**: Node.js/Express APIs, Redis distributed caching, WebSockets, and Dockerized microservices
- **Mobile Development**: Native Android applications in Kotlin with clean Material 3 UI
:::

[button: Explore Projects](/projects)
[button: Get in Touch with Kaif](mailto:kaif.webwork@gmail.com)`,
  },

  // 7. Flagship Project: AdZero
  {
    id: 'adzero',
    patterns: [
      /\b(adzero|ad zero|adblock|streaming app|android app|ad-free|app kaisa hai|tell me about adzero)\b/i,
    ],
    response: `### AdZero (v4.4 Android App)
Mohd Kaif's flagship media utility built for **Entertainment Without Interruptions**.

:::card Core Architecture
[tags: Kotlin, Android SDK, Material 3 UI, Retrofit REST, Firebase Cloud]
- Completely blocks video ads, banners, and analytics trackers
- Custom media playback pipeline with high-definition audio & Dolby Atmos
- Smart category indexation and instant universal search
:::

[button: Open AdZero Showcase](/projects/adzero)
[button: View on GitHub](https://github.com/kaif-webwork/AdZero)`,
  },

  // 8. Bio & Introduction
  {
    id: 'bio',
    patterns: [
      /\b(who is|kaif (kon|kaun) hai|about|bio|background|introduce|kaifcoder|tell me about|kya karta hai|kaif ke bare|intro|who are you)\b/i,
    ],
    response: `### Mohd Kaif (@kaif_coder)
**Full Stack Developer & AI Engineer** based in Delhi, India.

:::card Core Profile
[tags: Author of AdZero, Full Stack Web, LangGraph AI, Delhi, India]
- Author & creator of **AdZero** (v4.4 native Android ad-free private streaming app)
- Specializes in React 19, TypeScript, Next.js, Node.js, and Agentic AI workflows
- Verified credentials from Sheryians Coding School & MAAC
:::

[button: Explore Projects](/projects)
[button: View Full Resume](/resume)`,
  },

  // 9. Tech Stack & Skills
  {
    id: 'skills',
    patterns: [
      /\b(tech stack|skills|technologies|languages|frameworks|tools|what do you know|stack|skills kya hai|kaunse tools|react|node|ai stack|technologies aate)\b/i,
    ],
    response: `### Technical Stack & Competencies
Mohd Kaif works across modern web, cloud, and agentic AI architectures:

:::card Frontend & UI Architecture
[tags: React 19, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux Toolkit, Canvas API, Lenis Scroll, ECharts]
:::

:::card Backend & Distributed Systems
[tags: Node.js, Express.js, REST APIs, Microservices, WebSockets, JWT Auth, PHP, Redis Cache]
:::

:::card Generative AI & Agents
[tags: LangGraph, Multi-Agent Architectures, OpenAI API, Claude API, Prompt Engineering]
:::

:::card Databases & Cloud DevOps
[tags: MongoDB, PostgreSQL, MySQL, Docker, Kubernetes, AWS, Vercel, Git]
:::

:::card Mobile Engineering
[tags: Kotlin, Android SDK, Material 3 UI, Retrofit, Firebase]
:::

[button: Explore Uses & Setup](/uses)
[button: View Certificates](/certificates)`,
  },

  // 10. Engineering Experience
  {
    id: 'experience',
    patterns: [
      /\b(experience|career|history|job|company|companies|kahan kaam kiya|kitna experience|work history|engineering experience)\b/i,
    ],
    response: `### Engineering Work Experience

:::card Full Stack Engineer — Freelance & Open Source
**Oct 2025 – Present** • Web & Cloud Engineering
[tags: React 19, TypeScript, Node.js, Redis, LangGraph, Microservices]
- Architecting high-performance web applications and developer tools
- Deploying distributed Redis caches and edge cloud functions
- Active contributions to open-source developer utilities
:::

:::card Full Stack Software Engineer — AdZero
**May 2025 – Sep 2025** • Android & Streaming Pipelines
[tags: Kotlin, Android SDK, Material 3, Retrofit, Firebase]
- Built v4.4 native Android app for uninterrupted media streaming
- Implemented real-time category indexing and custom Dolby Atmos audio
:::

[button: Open Full Resume](/resume)
[button: Send Email to Kaif](mailto:kaif.webwork@gmail.com)`,
  },

  // 11. Certifications & Credentials
  {
    id: 'certifications',
    patterns: [
      /\b(certificate|certificates|certification|credential|credentials|sheryians|maac|cohort|degrees|certificates dikhao|id kya hai|padhai|education)\b/i,
    ],
    response: `### Verified Educational Credentials

:::card 2.0 Job Ready AI Powered Cohort
**Sheryians Coding School** • Sep 2026 • **ID**: [copy: 108040235499573595336067]
[tags: MERN Stack, Docker, AWS, Kubernetes, Redis, LangGraph, GenAI]
[button: Verify on Sheryians](https://sheryians.com/certificate/108040235499573595336067)
:::

:::card Advanced Program in Digital Media & Design
**MAAC (Aptech Ltd)** • June 2025 • Grade: B+ • **ID**: [copy: 104eC1581252]
[tags: Web Architecture, PHP, MySQL, UI/UX Architecture]
[button: Verify on MAAC](https://aptrack.online/examadmin/ps-cert-verification/1866430)
:::

[button: View All Certificates](/certificates)`,
  },

  // 12. Resume & CV
  {
    id: 'resume',
    patterns: [
      /\b(resume|cv|curriculum vitae|download resume|resume dikhao|resume kahan|view resume)\b/i,
    ],
    response: `### Resume & Qualifications
Mohd Kaif's verified curriculum vitae is available directly on this portfolio.

:::card Resume Overview
[tags: Full Stack Engineering, AdZero Architecture, Sheryians & MAAC Verified]
- Complete breakdown of frontend, backend, AI, and mobile engineering skills
- Detailed production architecture for AdZero and personal projects
- Direct verification links for credentials and timeline
:::

[button: Open Full Resume Page](/resume)
[button: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)`,
  },

  // 13. Featured Projects
  {
    id: 'projects',
    patterns: [
      /\b(project|projects|portfolio|what else|work sample|projects dikhao|kya banaya|showcase)\b/i,
    ],
    response: `### Featured Projects

:::card AdZero (v4.4)
100% ad-free private video streaming application for Android built with Kotlin.
[button: AdZero Showcase](/projects/adzero)
:::

:::card Live Portfolio Analytics
Privacy-first telemetry dashboard with 0ms edge caching.
[button: Live Analytics](/analytics)
:::

:::card Multi-Agent AI Workflows
Autonomous agentic architectures built with LangGraph and Python.
:::

[button: View All Projects](/projects)`,
  },

  // 14. Kivo AI / Mascot Assistant
  {
    id: 'kivo_mascot',
    patterns: [
      /\b(tum (kaun|kon) ho|who are you|what can you do|tum kya kar sakte|kivo|mascot|robot|bot)\b/i,
    ],
    response: `### Meet Kivo AI
I am **Kivo AI**, Mohd Kaif's official digital portfolio assistant and interactive companion.

:::card What I Can Do:
- Answer any question about Mohd Kaif's background, skills, and projects
- Provide verified credential IDs with 1-click copy
- Track your cursor in real-time across the screen
- Rotate to a brand new digital robot companion every day at midnight!
:::

Feel free to ask me anything or choose a topic below!`,
  },

  // 15. Setup & Hardware
  {
    id: 'setup',
    patterns: [
      /\b(setup|hardware|uses|gear|laptop|keyboard|mouse|monitor|macbook|vscode)\b/i,
    ],
    response: `### Kaif's Developer Setup & Gear

:::card Hardware
[tags: MacBook Pro, Kreo Obsidian 27" QHD, EvoFox Mini Keyboard, Transparent Wireless Mouse]
:::

:::card Daily Software
[tags: VS Code, Notion, Figma, Shots.so, OBS Studio]
:::

[button: Explore Full Uses Setup](/uses)`,
  },

  // 16. Technical Blogs
  {
    id: 'blogs',
    patterns: [
      /\b(blog|blogs|article|articles|writing|read|post|how to plan)\b/i,
    ],
    response: `### Technical Writing & Blogs

:::card How to Plan a Software Project from Scratch
A practical, step-by-step guide on taking an idea from concept to finished production software.
[button: Read Article](/blogs/how-to-plan-a-project)
:::

[button: View All Blogs](/blogs)`,
  },

  // 17. Live Site Analytics
  {
    id: 'analytics',
    patterns: [
      /\b(analytics|visitors|traffic|views|stats|telemetry)\b/i,
    ],
    response: `### Live Site Analytics
Mohd Kaif's portfolio features an open real-time telemetry dashboard.

:::card Live Telemetry Metrics
[tags: Page Views, Visitor Countries, Device Types, 0ms Edge Caching]
:::

[button: View Live Site Analytics](/analytics)`,
  },

  // 18. Greetings & Casual Conversation
  {
    id: 'greetings',
    patterns: [
      /\b(hi|hello|hey|namaste|kaise ho|kya haal|good morning|good evening|sup|yo|suno|bhai|helo)\b/i,
    ],
    response: `Hello! Welcome to Mohd Kaif's portfolio.

I'm **Kivo AI**, his interactive digital assistant.

:::card How I Can Help:
- Explore Kaif's flagship Android app (**AdZero**)
- Discover his **Tech Stack** and engineering competencies
- Review verified certifications (**Sheryians & MAAC**)
- View and download his verified **Resume**
- Connect or hire Kaif directly via **Email**
:::

Feel free to ask any question or tap a prompt below!`,
  },

  // 19. Gratitude & Compliments
  {
    id: 'gratitude',
    patterns: [
      /\b(thank|thanks|shukriya|awesome|cool|great|nice|perfect|good|badhiya|shabash)\b/i,
    ],
    response: `You're very welcome! Feel free to ask if there's anything else you'd like to explore about Mohd Kaif's work.

Have a productive day!`,
  },
];

export async function getChatResponse(userQuery: string): Promise<string> {
  // Simulate natural AI thinking delay (220ms - 380ms)
  await new Promise((resolve) => setTimeout(resolve, 220 + Math.random() * 160));

  const trimmed = userQuery.trim();
  if (!trimmed) {
    return 'Please ask me a question about Mohd Kaif, his projects, or skills.';
  }

  // 1. Direct Pattern Match
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(trimmed)) {
        return entry.response;
      }
    }
  }

  // 2. Token / Keyword Matching Fallback
  const lowerQuery = trimmed.toLowerCase();
  if (lowerQuery.includes('email') || lowerQuery.includes('mail')) {
    const emailEntry = KNOWLEDGE_BASE.find((e) => e.id === 'direct_email');
    if (emailEntry) return emailEntry.response;
  }
  if (lowerQuery.includes('cert') || lowerQuery.includes('credential')) {
    const certEntry = KNOWLEDGE_BASE.find((e) => e.id === 'certifications');
    if (certEntry) return certEntry.response;
  }
  if (lowerQuery.includes('project') || lowerQuery.includes('app')) {
    const projEntry = KNOWLEDGE_BASE.find((e) => e.id === 'projects');
    if (projEntry) return projEntry.response;
  }
  if (lowerQuery.includes('skill') || lowerQuery.includes('tech') || lowerQuery.includes('code')) {
    const skillEntry = KNOWLEDGE_BASE.find((e) => e.id === 'skills');
    if (skillEntry) return skillEntry.response;
  }

  // 3. Contextual Fallback with Suggestions
  return `### Kivo AI Assistant
I can answer anything regarding **Mohd Kaif's** engineering work, projects, and skills.

:::card Suggested Inquiries
- **AdZero**: Flagship Android streaming app
- **Tech Stack**: React 19, TypeScript, Node.js, LangGraph
- **Experience**: Engineering work history
- **Certificates**: Sheryians & MAAC verified credentials
- **Contact**: Direct email [copy: kaif.webwork@gmail.com]
:::

[button: AdZero Showcase](/projects/adzero)
[button: View Resume](/resume)
[button: View Certificates](/certificates)`;
}
