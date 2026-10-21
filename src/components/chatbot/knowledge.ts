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
    keywords: ['adzero', 'ad-zero', 'android app', 'streaming app', 'video player', 'apk', 'project', 'projects'],
    patterns: [
      /\b(adzero|ad-zero)\b/i,
      /\b(app (kya hai|batao|kaisa hai|features|detail))\b/i,
      /\b(tell me about adzero|what is adzero|show me projects|what projects)\b/i,
    ],
    weight: 12,
    response: `Mohd Kaif engineered **AdZero (v4.4)** — a native Android streaming app with 100% ad-blocking, background playback, and built-in SponsorBlock.

![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

[action: Explore AdZero](/projects/adzero)
[action: Download AdZero APK](https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk)
[action: Explore All Projects](/projects)`,
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
    response: `You can download the verified production build of **AdZero v4.4** directly from GitHub Releases. It's lightweight (~25 MB), safe, and requires Android 8.0+.

![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

[action: Download AdZero APK](https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk)
[action: Explore AdZero](/projects/adzero)
[action: GitHub Releases](https://github.com/kaif-webwork/AdZero/releases)`,
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
    response: `AdZero is built in Kotlin with Android Jetpack and reactive MVVM, featuring Retrofit 2 interceptors for stream extraction and Room SQLite for offline playlists.

![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

[action: Explore AdZero](/projects/adzero)
[action: AdZero GitHub](https://github.com/kaif-webwork/AdZero)
[action: Explore All Projects](/projects)`,
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
    response: `Mohd Kaif specializes in modern frontend engineering with **React 19, Next.js, and TypeScript**, crafting fluid interfaces with Tailwind CSS, GSAP motion, and Lenis smooth scrolling.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: View Resume](/resume)`,
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
    response: `For backend systems, Kaif builds high-availability microservices and RESTful APIs with **Node.js, Express, and PHP**, powered by **Upstash Redis** for sub-millisecond edge caching.

[action: View Live Analytics](/analytics)
[action: Explore All Projects](/projects)
[action: View Resume](/resume)`,
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
    response: `Kaif specializes in practical AI engineering — creating cyclical multi-agent graphs with **LangGraph**, integrating Google Gemini & OpenAI LLMs, and building RAG pipelines with tool calling.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: Get in Touch](/contact)`,
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
    response: `Kaif focuses on automated CI/CD and containerized deployments using **Docker, Kubernetes, AWS, and Vercel Serverless Edge**, with Git automation for rapid, reliable shipping.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: View Resume](/resume)`,
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
    response: `Mohd Kaif's core engineering stack spans **React 19, Next.js, TypeScript, Node.js, Upstash Redis, Kotlin (Android), and LangGraph Agentic AI**.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: View Resume](/resume)`,
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
    response: `Here are Mohd Kaif's verified professional credentials in Full Stack MERN & Agentic AI from Sheryians and Digital Media & Design from MAAC:

![Sheryians 2.0 AI Powered Cohort Certificate](/images/certificates/sheryians-2-0-cohort.png)

![MAAC APDMD Professional Diploma Certificate](/images/certificates/maac-certificate.jpg)

[action: View All Certificates](/certificates)
[action: Verify Sheryians](https://sheryians.com/certificate/108040235499573595336067)
[action: Verify MAAC](https://aptrack.online/examadmin/ps-cert-verification/1866430)`,
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
    response: `You can reach Mohd Kaif directly at **kaif.webwork@gmail.com**. He typically responds within 12 to 24 hours.

[action: Send Email](mailto:kaif.webwork@gmail.com)
[action: Get in Touch](/contact)
[action: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)`,
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
    response: `Connect with Mohd Kaif on [GitHub](https://github.com/kaif-webwork) to explore his code and on [LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a) for professional updates.

[action: GitHub Profile](https://github.com/kaif-webwork)
[action: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)
[action: AdZero Repository](https://github.com/kaif-webwork/AdZero)`,
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
    response: `Mohd Kaif is available for full-time engineering roles, high-impact freelance contracts, and remote collaborations worldwide.

[action: Send Email](mailto:kaif.webwork@gmail.com)
[action: Get in Touch](/contact)
[action: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)`,
  },

  // 13. Location & Working Hours
  {
    id: 'location',
    keywords: ['location', 'delhi', 'india', 'where is kaif', 'kahan rehta', 'city', 'timezone', 'remote', 'address'],
    patterns: [
      /\b(location|delhi|india|where (is|are)|kahan (rehta|rehte|se ho)|city|timezone|address|country)\b/i,
    ],
    weight: 10,
    response: `Mohd Kaif is based in **Delhi, India (IST, UTC+5:30)** and collaborates smoothly with worldwide teams across all timezones.

[action: Get in Touch](/contact)
[action: Send Email](mailto:kaif.webwork@gmail.com)
[action: Explore All Projects](/projects)`,
  },

  // 14. Resume Status & Access
  {
    id: 'resume_status',
    keywords: ['resume', 'cv', 'curriculum vitae', 'bio', 'resume download', 'pdf', 'resume chahiye', 'resume do'],
    patterns: [
      /\b(resume|cv|curriculum vitae|resume download|resume pdf|resume do|resume chahiye)\b/i,
    ],
    weight: 13,
    response: `You can view Mohd Kaif's resume online or request the latest verified PDF directly by email.

[action: View Resume](/resume)
[action: Request PDF Resume](mailto:kaif.webwork@gmail.com)
[action: View Certificates](/certificates)`,
  },

  // 15. Real-Time Telemetry & Analytics
  {
    id: 'telemetry_analytics',
    keywords: ['analytics', 'visitors', 'traffic', 'views', 'stats', 'telemetry', 'redis cache', 'live visitors'],
    patterns: [
      /\b(analytics|visitors|traffic|views|stats|telemetry)\b/i,
    ],
    weight: 10,
    response: `This portfolio features a real-time visitor telemetry dashboard powered by Upstash Global Redis and Vercel Edge with zero tracking cookies.

[action: View Live Analytics](/analytics)
[action: Explore All Projects](/projects)`,
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
    response: `Kaif's development setup features VS Code with minimal dark themes, PowerShell/Zsh with custom Git shortcuts, and Figma for UI design.

[action: View Developer Setup](/uses)
[action: Explore All Projects](/projects)`,
  },

  // 17. Blogs & Technical Articles
  {
    id: 'blogs_articles',
    keywords: ['blogs', 'articles', 'writeups', 'posts', 'how to plan a project', 'blog'],
    patterns: [
      /\b(blog|blogs|articles|writing|posts)\b/i,
    ],
    weight: 9,
    response: `Mohd Kaif writes practical architectural guides for developers, including his featured guide on planning software projects.

[action: Read Planning Guide](/blogs/how-to-plan-a-project)
[action: View All Blogs](/blogs)`,
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
    response: `I'm **Kairo AI**, Mohd Kaif's personal companion! Tap my avatar to see my moods, or ask me anything about Kaif's work and credentials.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: Get in Touch](/contact)`,
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
    response: `Meet **Mohd Kaif (kaifcoder)** — Full Stack Developer & AI Engineer based in Delhi, India, crafting high-performance web apps, native Android systems, and agentic AI workflows.

![Mohd Kaif - Full Stack Developer & AI Engineer](/images/profile/pfp-latest.jpg)

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: Get in Touch](/contact)`,
  },

  // 19. Greetings & Polite Salutations
  {
    id: 'greetings_all',
    keywords: ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'kya haal', 'sup', 'yo', 'bhai', 'bro', 'suno', 'helo', 'good morning', 'good evening'],
    patterns: [
      /^(hi|hello|hey|namaste|sup|yo|helo|hola)(\s|!|\?|$)/i,
      /\b(kaise ho|kya haal|sab badhiya|kya chal raha|sab theek)\b/i,
      /\b(good (morning|afternoon|evening|day))\b/i,
    ],
    weight: 8,
    response: `Hey there! Welcome to Mohd Kaif's developer portfolio. How can I help you explore his work today?

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: Get in Touch](/contact)`,
  },

  // 20. Gratitude, Compliments & Appreciation
  {
    id: 'gratitude_compliments',
    keywords: ['thank', 'thanks', 'shukriya', 'dhanyawad', 'awesome', 'cool', 'great', 'nice', 'perfect', 'badhiya', 'shabash', 'superb'],
    patterns: [
      /\b(thank|thanks|shukriya|dhanyawad|awesome|cool|great|nice|perfect|good|badhiya|shabash|superb)\b/i,
    ],
    weight: 8,
    response: `You're very welcome! Let me know if you'd like to check out any code samples, projects, or connect with Kaif directly.

[action: Explore All Projects](/projects)
[action: View Certificates](/certificates)
[action: Get in Touch](/contact)`,
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

  // Concise Contextual Fallback with Human Touch
  return `Hi there! I'm **Kairo AI**. You can ask me anything about Mohd Kaif's projects, technical stack, or verified credentials.

[action: View Certificates](/certificates)
[action: Explore All Projects](/projects)
[action: Get in Touch](/contact)`;
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
