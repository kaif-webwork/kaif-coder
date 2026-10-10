import { isGeminiAvailable, generateGeminiReply } from './gemini';

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
    prompt: "What is Mohd Kaif's engineering work experience?",
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
    prompt: "Where can I view or download Mohd Kaif's resume?",
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

interface KnowledgeModule {
  id: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  response: string;
}

// ---------------------------------------------------------------------------
// Comprehensive Intelligent Portfolio Knowledge Base
// ---------------------------------------------------------------------------
const KNOWLEDGE_BASE: KnowledgeModule[] = [
  // 1. AdZero App - Comprehensive Overview
  {
    id: 'adzero_overview',
    keywords: ['adzero', 'ad-zero', 'android app', 'streaming app', 'video player', 'apk'],
    patterns: [
      /\b(adzero|ad-zero)\b/i,
      /\b(app (kya hai|batao|kaisa hai|features|detail))\b/i,
      /\b(tell me about adzero|what is adzero)\b/i,
    ],
    weight: 12,
    response: `### AdZero — Entertainment Without Interruptions

![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

It's wonderful to tell you about **AdZero (v4.4)**! Mohd Kaif created this project to solve a genuine, everyday problem: how frustrating it is when intrusive ads and sponsored interruptions ruin your video streaming and learning experience.

:::card Thoughtful Android Engineering
- **100% Ad-Free Experience**: Natively blocks all pre-roll, mid-roll video ads, and banner popups with zero interruptions.
- **Background & PiP Playback**: Listen to lectures, podcasts, or music with your phone screen turned off or while multitasking in Picture-in-Picture.
- **SponsorBlock Integration**: Intelligently skips sponsored segments, subscriber reminders, and non-music intros.
- **Privacy First**: No Google account required. Your viewing history stays safely stored on your device.
:::

[tags: Kotlin, Android Jetpack, Material 3, Firebase, Retrofit 2, Coil, Room SQLite]`,
  },

  // 2. AdZero Download & Installation
  {
    id: 'adzero_download',
    keywords: ['download', 'apk', 'install', 'get adzero', 'adzero download', 'download link', 'download kaise'],
    patterns: [
      /\b(download|apk|install|link do|download link|kaise download)\b/i,
      /\b(adzero (download|chahiye|kaha milega|install))\b/i,
    ],
    weight: 14,
    response: `### Download AdZero v4.4 Android APK

![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

You can grab the official, verified production build directly from [GitHub Releases](https://github.com/kaif-webwork/AdZero/releases). It's completely free and safe to install:

:::card Release Specs & Installation
- **Current Version**: v4.4 (Latest Native Production Build)
- **Architecture**: Universal Android (ARM64 / ARMv7)
- **Requirements**: Compatible with Android 8.0 (Oreo) and above
- **Package Size**: Lightweight ~25 MB
- **Direct Link**: [Download APK (v4.4)](https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk)
:::`,
  },

  // 3. AdZero Technology & Architecture
  {
    id: 'adzero_tech',
    keywords: ['architecture', 'kotlin', 'retrofit', 'coil', 'how adzero works', 'adzero stack', 'tech adzero'],
    patterns: [
      /\b(adzero (architecture|tech|stack|code|kaise bana|built with))\b/i,
      /\b(how does adzero work|how adzero was built)\b/i,
    ],
    weight: 11,
    response: `### Under the Hood: AdZero Technical Architecture

AdZero is built from the ground up following modern Android Clean Architecture and reactive MVVM principles:

:::card Engineering Architecture
- **Language**: Kotlin with Coroutines & StateFlow for buttery-smooth asynchronous reactive UI streams.
- **Design System**: Material Design 3 with dynamic theme adaptation and dark mode perfection.
- **Networking**: Retrofit 2 + OkHttp with custom stream extraction interceptors.
- **Media Pipeline**: Native media player integration with background media session playback.
- **Local Database**: Room SQLite database for instant offline watch history and saved playlists.
:::

[tags: Kotlin, Coroutines, StateFlow, MVVM, Room SQLite, Retrofit 2, Material 3]`,
  },

  // 4. Skills: Frontend Engineering
  {
    id: 'skills_frontend',
    keywords: ['frontend', 'react', 'nextjs', 'next.js', 'typescript', 'javascript', 'tailwind', 'gsap', 'ui'],
    patterns: [
      /\b(frontend|react|next\.?js|tailwind|css|typescript|javascript|gsap|lenis)\b/i,
      /\b(front-end|ui development|styling)\b/i,
    ],
    weight: 10,
    response: `### Frontend Engineering & User Experience

Mohd Kaif has a deep passion for crafting fluid, accessible, and visually stunning web applications that respond naturally to user interaction:

:::card Frontend Core Capabilities
- **Modern Frameworks**: React 19, Next.js (App Router), TypeScript, JavaScript (ESNext).
- **Aesthetic Styling**: Tailwind CSS, Vanilla CSS Modules, micro-interactions, responsive typography.
- **Animation & Motion**: GSAP (GreenSock), ScrollTrigger, Lenis smooth scrolling.
- **Performance & Tooling**: Vite, Oxlint, PostCSS, component optimization.
:::

[tags: React 19, Next.js, TypeScript, Tailwind CSS, GSAP, Lenis, Vite]`,
  },

  // 5. Skills: Backend, APIs & Caching
  {
    id: 'skills_backend',
    keywords: ['backend', 'node', 'nodejs', 'express', 'redis', 'upstash', 'api', 'server', 'database', 'mongo', 'mongodb'],
    patterns: [
      /\b(backend|node(\.js)?|express(\.js)?|redis|upstash|mongodb|mongoose|rest api|server)\b/i,
      /\b(back-end|api development|database skills)\b/i,
    ],
    weight: 10,
    response: `### Backend Systems & Edge Architecture

When it comes to backends, Kaif focuses on high availability, lightning-fast response times, and bulletproof security:

:::card Server & Database Stack
- **Runtimes & Frameworks**: Node.js, Express.js, PHP, Vercel Serverless Edge Functions.
- **Edge Caching**: Upstash Redis (powering this portfolio's real-time 0ms visitor telemetry!).
- **Databases**: MongoDB (Mongoose ODM), MySQL, PostgreSQL.
- **API Design**: RESTful architectures, WebSockets, JWT token authentication, rate limiting.
:::

[tags: Node.js, Express, Upstash Redis, MongoDB, MySQL, Edge Functions, REST APIs]`,
  },

  // 6. Skills: AI, GenAI & Agentic Systems
  {
    id: 'skills_ai',
    keywords: ['ai', 'genai', 'langgraph', 'llm', 'generative ai', 'prompt', 'agents', 'agentic', 'gemini', 'gpt'],
    patterns: [
      /\b(ai|genai|generative ai|langgraph|llm|agents|agentic|prompt engineering|rag)\b/i,
      /\b(ai engineering|machine learning|artificial intelligence)\b/i,
    ],
    weight: 11,
    response: `### Generative AI & Agentic Architectures

Kaif specializes in practical, production-ready AI engineering — turning large language models into reliable, autonomous problem solvers:

:::card AI Specialization
- **Agent Frameworks**: LangGraph for stateful multi-agent graphs and cyclical workflows.
- **LLM Integrations**: Google Gemini REST APIs (flash-speed models), OpenAI GPT architectures.
- **RAG & Tool Calling**: Retrieval-Augmented Generation, vector similarity search, dynamic tool execution.
- **Portfolio Companion**: Kairo AI (the companion you are chatting with right now!).
:::

[tags: LangGraph, Google Gemini, GenAI, RAG, Tool Calling, Agentic Workflows]`,
  },

  // 7. Skills: DevOps, Cloud & Tooling
  {
    id: 'skills_devops',
    keywords: ['devops', 'docker', 'kubernetes', 'aws', 'git', 'github', 'ci/cd', 'deployment', 'cloud'],
    patterns: [
      /\b(devops|docker|kubernetes|aws|cloud|ci\/?cd|git|github actions)\b/i,
      /\b(deployment|infrastructure|containerization)\b/i,
    ],
    weight: 9,
    response: `### DevOps, Cloud & Deployment

Reliability and automation are central to Kaif's software philosophy:

:::card Deployment & CI/CD Pipeline
- **Containerization**: Docker multi-stage production builds and clean container topologies.
- **Orchestration**: Kubernetes cluster deployment and service coordination.
- **Cloud Infrastructure**: AWS (S3, EC2), Vercel Serverless Edge, Upstash Global Redis.
- **Continuous Integration**: Git workflows, automated testing, GitHub Actions CI/CD pipelines.
:::

[tags: Docker, Kubernetes, AWS, Vercel, Git, GitHub Actions, Linux]`,
  },

  // 8. Overall Tech Stack Summary
  {
    id: 'skills_all',
    keywords: ['skills', 'tech stack', 'technologies', 'skills kya hai', 'stack', 'languages', 'tools', 'kya kya aata hai'],
    patterns: [
      /\b(skills|tech stack|technologies|what do you know|kya kya aata hai|kaunse tools|skills batao)\b/i,
      /\b(programming languages|tech capabilities)\b/i,
    ],
    weight: 10,
    response: `### Mohd Kaif's Engineering Capabilities & Stack

Mohd Kaif is a Full Stack Developer & AI Engineer who loves building clean, resilient, and high-performance digital products from idea to production:

:::card Core Engineering Specializations
- **Frontend**: React 19, Next.js (App Router), TypeScript, Tailwind CSS, GSAP animations, Lenis smooth scrolling.
- **Backend & APIs**: Node.js, Express.js, PHP, RESTful APIs, WebSockets, Vercel Serverless Edge.
- **Databases & Caching**: Upstash Redis (0ms edge cache), MongoDB (Mongoose), MySQL.
- **AI & Agentic Systems**: LangGraph cyclical multi-agent workflows, Google Gemini & OpenAI LLMs, RAG.
- **Mobile Engineering**: Native Android development in Kotlin, Jetpack, Material 3, and Retrofit.
- **Cloud & DevOps**: Docker, Kubernetes, AWS, Git, GitHub Actions CI/CD.
:::

[tags: React 19, Next.js, TypeScript, Node.js, Upstash Redis, LangGraph, Kotlin, Docker]`,
  },

  // 9. Verified Certifications: Sheryians & MAAC
  {
    id: 'certifications',
    keywords: ['certificate', 'certificates', 'certification', 'sheryians', 'maac', 'credential', 'degree', 'diploma'],
    patterns: [
      /\b(certificat(e|es|ion)|credential(s)?|sheryians|maac|degree|qualification)\b/i,
      /\b(certified|verified credential)\b/i,
    ],
    weight: 12,
    response: `### Verified Credentials & Professional Certifications

Mohd Kaif believes in continuous learning and verifiable excellence. Here are his verified credentials:

![Sheryians 2.0 AI Powered Cohort Certificate](/images/certificates/sheryians-2-0-cohort.png)

:::card 1. 2.0 Job Ready AI Powered Cohort — Sheryians Coding School
- **Issued**: 8 September 2026
- **Credential ID**: [copy: 108040235499573595336067]
- **Core Focus**: MERN Stack mastery, Cloud & DevOps (Docker, AWS, Kubernetes, Redis, Git), Generative AI (LangGraph multi-agent workflows), and advanced Data Structures & Algorithms.
- **Status**: Officially Verified
:::

![MAAC APDMD Professional Diploma Certificate](/images/certificates/maac-certificate.jpg)

:::card 2. Advanced Program in Digital Media & Design — MAAC • Aptech Ltd.
- **Issued**: June 2025 (Grade: B+ Good)
- **Credential ID**: [copy: 104eC1581252]
- **Core Focus**: Full web design & development (HTML, CSS, JS, Bootstrap, AngularJS, PHP, MySQL), UI/UX design (Adobe XD, Figma, Photoshop, Illustrator).
- **Status**: Officially Verified
:::`,
  },

  // 10. Direct Email & Contact Information
  {
    id: 'contact_email',
    keywords: ['email', 'mail', 'gmail', 'contact', 'email id', 'mail do', 'email batao', 'how to contact', 'reach out'],
    patterns: [
      /\b(email|e-mail|mail|gmail|email id|mail id)\b/i,
      /\b(contact|reach out|connect|baat karni|kaise contact|contact kaise)\b/i,
    ],
    weight: 13,
    response: `### Get in Touch with Mohd Kaif

Mohd Kaif is always excited to connect, whether you're inquiring about full-time software engineering roles, high-impact freelance projects, or technical consulting:

:::card Direct Communication Channels
- **Email**: [copy: kaif.webwork@gmail.com]
- **Typical Response Time**: Within 12–24 hours
- **Location**: Delhi, India (Timezone: IST, UTC+5:30)
- **Collaboration Mode**: Open for Remote Worldwide, Hybrid, or On-Site
:::`,
  },

  // 11. Social Profiles: GitHub & LinkedIn
  {
    id: 'contact_socials',
    keywords: ['github', 'linkedin', 'git', 'profile', 'social', 'links', 'handle', 'repo', 'repositories'],
    patterns: [
      /\b(github|linkedin|git repo|repositories|repos|open source code)\b/i,
      /\b(social links|social media|profile link)\b/i,
    ],
    weight: 11,
    response: `### Online Profiles & Repositories

Explore Mohd Kaif's open-source projects, commits, and professional updates:

:::card Verified Online Presence
- **GitHub**: [github.com/kaif-webwork](https://github.com/kaif-webwork) [copy: kaif-webwork]
- **LinkedIn**: [linkedin.com/in/mohd-kaif-6a453741a](https://www.linkedin.com/in/mohd-kaif-6a453741a)
- **Flagship Repo**: [AdZero Android Media Client](https://github.com/kaif-webwork/AdZero)
:::`,
  },

  // 12. Hiring, Freelance & Contract Inquiries
  {
    id: 'hire_freelance',
    keywords: ['hire', 'freelance', 'contract', 'rate', 'pricing', 'charges', 'cost', 'work together', 'project banana'],
    patterns: [
      /\b(hire|freelance|available|contract|work together|collab|collaboration|pricing|rate|charges|cost)\b/i,
      /\b(project banana|hire karna|hire kaise kare|kaif ko hire)\b/i,
    ],
    weight: 12,
    response: `### Collaboration & Hiring Opportunities

Mohd Kaif brings strong end-to-end engineering rigor and thoughtful design execution to every project:

:::card Engagement Modes
- **Full-Time Roles**: Frontend, Backend, or Full Stack (React / Node.js / AI workflows)
- **High-Impact Contracts**: Modern web applications, API microservices, native Android clients, and AI integrations
- **Technical Advisory**: Performance optimizations, edge Redis caching, architecture reviews
:::

:::card How to Start
Send over a brief description of what you're building, along with your timeline and goals:
- **Email**: [copy: kaif.webwork@gmail.com]
:::`,
  },

  // 13. Location & Working Hours
  {
    id: 'location',
    keywords: ['location', 'delhi', 'india', 'where is kaif', 'kahan rehta', 'city', 'timezone', 'remote', 'address'],
    patterns: [
      /\b(location|delhi|india|where (is|are)|kahan (rehta|rehte|se ho)|city|timezone|address|country)\b/i,
    ],
    weight: 10,
    response: `### Location & Geographic Base

Mohd Kaif is based in **Delhi, India**, working with teams and clients worldwide:

:::card Location & Timezone Details
- **Base City**: Delhi, India
- **Timezone**: Indian Standard Time (IST, UTC+5:30)
- **Flexibility**: Highly experienced in asynchronous remote communication with North American, European, and Asian teams
- **Languages**: Fluent in English & Hindi
- **Email**: [copy: kaif.webwork@gmail.com]
:::`,
  },

  // 14. Resume Status & Access
  {
    id: 'resume_status',
    keywords: ['resume', 'cv', 'curriculum vitae', 'bio', 'resume download', 'pdf', 'resume chahiye', 'resume do'],
    patterns: [
      /\b(resume|cv|curriculum vitae|resume download|resume pdf|resume do|resume chahiye)\b/i,
    ],
    weight: 13,
    response: `### Mohd Kaif's Professional Resume

Mohd Kaif's resume is currently undergoing an active update to include his latest full-stack system architectures and production metrics:

:::card Resume Access
- **Direct PDF Request**: Feel free to drop a quick email to [copy: kaif.webwork@gmail.com] to receive the most up-to-date PDF copy immediately.
- **Interactive In-Site Viewer**: A dedicated inline viewer is also being prepared for the resume section.
:::`,
  },

  // 15. Real-Time Telemetry & Analytics
  {
    id: 'telemetry_analytics',
    keywords: ['analytics', 'visitors', 'traffic', 'views', 'stats', 'telemetry', 'redis cache', 'live visitors'],
    patterns: [
      /\b(analytics|visitors|traffic|views|stats|telemetry)\b/i,
    ],
    weight: 10,
    response: `### Live Real-Time Portfolio Telemetry

Here is something exciting that Kaif built right into this portfolio! He believes in complete transparency, so he engineered a live telemetry dashboard powered by Upstash Global Redis:

:::card Live Analytics Architecture
- **Real-Time Traffic**: Tracks global page views and unique visitor sessions with zero tracking cookies.
- **Edge Performance**: Powered by Vercel Serverless Edge Functions with sub-millisecond edge Redis reads.
- **Visual Intelligence**: Interactive charts displaying geographic distribution, device types, and browser statistics.
:::

[tags: Upstash Redis, Edge Functions, Real-time Telemetry, ECharts]`,
  },

  // 16. Uses, Setup & Tools
  {
    id: 'uses_setup',
    keywords: ['uses', 'setup', 'gear', 'hardware', 'laptop', 'editor', 'vscode', 'tools', 'environment'],
    patterns: [
      /\b(uses|setup|gear|hardware|laptop|monitor|vscode|tools|dev setup)\b/i,
      /\b(what gear do you use|development environment)\b/i,
    ],
    weight: 9,
    response: `### Developer Workspace & Gear

Curious about what Kaif uses to build day in and day out? He believes an intentional, distraction-free environment makes all the difference in writing clean, reliable code:

:::card Daily Development Environment
- **Code Editor**: VS Code with curated minimal dark themes, custom keybindings, and font ligatures.
- **Terminal & Shell**: PowerShell / Zsh with custom Git productivity shortcuts.
- **Design Tools**: Figma and Adobe Creative Cloud for prototyping and visual design.
- **Browsers**: Brave & Chrome Developer Edition with DevTools profiling.
:::`,
  },

  // 17. Blogs & Technical Articles
  {
    id: 'blogs_articles',
    keywords: ['blogs', 'articles', 'writeups', 'posts', 'how to plan a project', 'blog'],
    patterns: [
      /\b(blog|blogs|articles|writing|posts)\b/i,
    ],
    weight: 9,
    response: `### Technical Articles & Engineering Insights

Mohd Kaif loves distilling hard-won engineering lessons into actionable, friendly write-ups for fellow developers:

:::card Featured Engineering Guide
**How to Plan a Software Project**
A practical, step-by-step architectural guide on breaking down complex software requirements, picking the right tech stack, avoiding scope creep, and architecting for high scale.
:::`,
  },

  // 18. About Kairo AI (Companion Identity)
  {
    id: 'about_kairo',
    keywords: ['kairo', 'who are you', 'kairo ai', 'mascot', 'robot', 'companion', 'tum kaun ho', 'aap kaun ho'],
    patterns: [
      /\b(kairo|who are you|tum kaun ho|aap kaun ho|what are you|mascot|robot)\b/i,
      /\b(tell me about yourself|your name)\b/i,
    ],
    weight: 12,
    response: `### Hi there! I'm Kairo AI!

I am **Kairo AI** — Mohd Kaif's personal AI companion. My purpose is to make exploring this portfolio effortless, insightful, and delightful!

:::card What Makes Me Tick
- **Expressive Robot Avatar**: Click or tap my square robot face anytime to watch me cycle through 9 animated emotional states!
- **Dual AI Engine**: Powered by Google Gemini generative AI (flash-lite models) backed by an instant offline semantic knowledge graph.
- **My Mission**: Help you learn about Kaif's skills, explore AdZero, review certificates, and connect directly!
:::`,
  },

  // 18b. About Mohd Kaif (Biography & Profile)
  {
    id: 'about_kaif',
    keywords: ['kaif', 'who is kaif', 'mohd kaif', 'about kaif', 'kaif kaun hai', 'developer kaun hai', 'kaif coder', 'kaifcoder', 'photo', 'picture', 'pfp'],
    patterns: [
      /\b(who is (mohd )?kaif|about (mohd )?kaif|kaif kaun hai|tell me about kaif)\b/i,
      /\b(photo|picture|dp|profile pic|kaif ki photo)\b/i,
    ],
    weight: 14,
    response: `### Meet Mohd Kaif — Full Stack Developer & AI Engineer

![Mohd Kaif - Full Stack Developer & AI Engineer](/images/profile/pfp-latest.jpg)

It's wonderful to introduce you to **Mohd Kaif** (known online as **kaifcoder**)! He is a Full Stack Developer & AI Engineer based in **Delhi, India**, who thrives on turning ambitious ideas into polished, high-performance production systems.

:::card What Defines Kaif's Work
- **Product Craftsmanship**: Building software that users genuinely enjoy using, with smooth animations and zero bloat.
- **Flagship Project**: AdZero (v4.4 Android streaming app with 100% ad-blocking and native background playback).
- **Modern Tech Core**: React 19, Next.js, Node.js, Upstash Redis, LangGraph, and native Kotlin.
- **Open for Opportunities**: Currently considering full-time software engineering roles and high-impact freelance collaborations worldwide.
:::

[tags: Full Stack, React 19, TypeScript, Node.js, LangGraph, Kotlin, Upstash Redis]`,
  },

  // 19. Greetings & Polite Salutations (English & Hinglish)
  {
    id: 'greetings_all',
    keywords: ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'kya haal', 'sup', 'yo', 'bhai', 'bro', 'suno', 'helo', 'good morning', 'good evening'],
    patterns: [
      /^(hi|hello|hey|namaste|sup|yo|helo|hola)(\s|!|\?|$)/i,
      /\b(kaise ho|kya haal|sab badhiya|kya chal raha|sab theek)\b/i,
      /\b(good (morning|afternoon|evening|day))\b/i,
    ],
    weight: 8,
    response: `Hello and welcome! It's wonderful to have you visiting Mohd Kaif's developer portfolio.

I'm **Kairo AI — Your Personal AI Companion**.

:::card What Would You Like to Explore Today?
- **AdZero (v4.4)**: Kaif's 100% ad-free Android streaming client
- **Tech Stack**: React 19, Node.js, Upstash Redis, LangGraph, Kotlin
- **Certifications**: Verified Sheryians AI Cohort & MAAC diplomas
- **Live Analytics**: Real-time visitor metrics powered by Upstash Redis
- **Hire or Connect**: Direct email [copy: kaif.webwork@gmail.com]
:::

Feel free to ask me any question about Kaif's projects, experience, or skills!`,
  },

  // 20. Gratitude, Compliments & Appreciation
  {
    id: 'gratitude_compliments',
    keywords: ['thank', 'thanks', 'shukriya', 'dhanyawad', 'awesome', 'cool', 'great', 'nice', 'perfect', 'badhiya', 'shabash', 'superb'],
    patterns: [
      /\b(thank|thanks|shukriya|dhanyawad|awesome|cool|great|nice|perfect|good|badhiya|shabash|superb)\b/i,
    ],
    weight: 8,
    response: `You're very welcome! It's an absolute pleasure helping you explore Kaif's work.

If there's anything else you'd like to dive into — whether it's software architecture, code samples, or connecting with Kaif directly — I'm right here!`,
  },
];

// ---------------------------------------------------------------------------
// Advanced Semantic Token Matcher & Hinglish Normalizer
// ---------------------------------------------------------------------------

function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Scoring Engine that evaluates user queries across all knowledge modules.
 */
function scoreKnowledgeEntry(query: string, normalized: string, entry: KnowledgeModule): number {
  let score = 0;

  // 1. Direct Regex Pattern Match (highest priority)
  for (const pattern of entry.patterns) {
    if (pattern.test(query)) {
      score += 25 * entry.weight;
      break;
    }
  }

  // 2. Keyword exact & partial matching
  const tokens = normalized.split(' ').filter((t) => t.length > 2);
  for (const kw of entry.keywords) {
    const kwNorm = kw.toLowerCase();
    if (normalized.includes(kwNorm)) {
      score += 15 * entry.weight;
    } else {
      // Check individual token overlap
      for (const token of tokens) {
        if (kwNorm.includes(token) || token.includes(kwNorm)) {
          score += 5;
        }
      }
    }
  }

  return score;
}

/**
 * Generates response using built-in semantic portfolio engine.
 */
function getBuiltinResponse(userQuery: string): string {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return 'Please ask me a question about Mohd Kaif, his projects, or skills.';
  }

  const normalized = normalizeQuery(trimmed);

  let bestEntry: KnowledgeModule | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    const score = scoreKnowledgeEntry(trimmed, normalized, entry);
    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // If score meets confidence threshold, return the targeted answer
  if (bestEntry && highestScore >= 20) {
    return bestEntry.response;
  }

  // Secondary Fallback for common quick terms
  if (normalized.includes('email') || normalized.includes('mail')) {
    const e = KNOWLEDGE_BASE.find((k) => k.id === 'contact_email');
    if (e) return e.response;
  }
  if (normalized.includes('cert') || normalized.includes('sheryians')) {
    const c = KNOWLEDGE_BASE.find((k) => k.id === 'certifications');
    if (c) return c.response;
  }
  if (normalized.includes('project') || normalized.includes('adzero')) {
    const p = KNOWLEDGE_BASE.find((k) => k.id === 'adzero_overview');
    if (p) return p.response;
  }
  if (normalized.includes('skill') || normalized.includes('stack')) {
    const s = KNOWLEDGE_BASE.find((k) => k.id === 'skills_all');
    if (s) return s.response;
  }

  // Comprehensive Contextual Fallback with Human Touch
  return `### Kairo AI — Your Personal AI Companion

I'm here to help you learn all about **Mohd Kaif** (kaifcoder) — his engineering stack, production projects, and verified credentials!

:::card Popular Topics You Can Ask Me:
- **AdZero**: Flagship Android streaming app with 100% ad-blocking
- **Tech Stack**: React 19, TypeScript, Node.js, Upstash Redis, LangGraph, Kotlin
- **Certifications**: Sheryians AI Cohort & MAAC verified credentials
- **Resume & Bio**: Experience and background details
- **Get in Touch**: Direct email [copy: kaif.webwork@gmail.com]
:::`;
}

// ---------------------------------------------------------------------------
// Main Orchestrator: Hybrid AI (Gemini Generative + Built-in Semantic Engine)
// ---------------------------------------------------------------------------

/**
 * Generates an intelligent chat response.
 * 1. If Gemini API key is configured, invokes Google Gemini with portfolio system instructions.
 * 2. If Gemini is not configured, or if the API call encounters any quota/network error,
 *    seamlessly falls back to the upgraded built-in semantic NLP engine.
 */
export async function getChatResponse(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<string> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return 'Please ask me a question about Mohd Kaif, his projects, or skills.';
  }

  // 1. Check if Gemini AI is active
  if (isGeminiAvailable()) {
    try {
      const geminiReply = await generateGeminiReply(history, trimmed);
      return geminiReply;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in AI engine:', err);
      // Gracefully continue to built-in engine below
    }
  }

  // 2. Built-in Semantic NLP Engine (Fast, 0ms, resilient)
  await new Promise((resolve) => setTimeout(resolve, 80));
  return getBuiltinResponse(trimmed);
}
