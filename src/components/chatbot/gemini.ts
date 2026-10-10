import type { ChatMessage } from './knowledge';

const GEMINI_STORAGE_KEY = 'kairo_gemini_api_key';

/**
 * Returns the currently active Gemini API key from localStorage or Vite environment.
 */
export function getGeminiApiKey(): string {
  try {
    const local = localStorage.getItem(GEMINI_STORAGE_KEY);
    if (local && local.trim().length > 0) {
      return local.trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // Ignore localStorage errors
  }

  // Check Vite environment variable configured on Vercel and local environment
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';
  return envKey.trim().replace(/^["']|["']$/g, '');
}

/**
 * Saves or clears the Gemini API key in localStorage.
 */
export function setGeminiApiKey(key: string): void {
  try {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    } else {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Checks if a Gemini API key is configured.
 */
export function isGeminiAvailable(): boolean {
  return getGeminiApiKey().length > 5;
}

/**
 * Grounding System Instruction for Kairo AI.
 * Contains comprehensive knowledge about Mohd Kaif, his projects, skills, certifications, and response formatting rules.
 */
const SYSTEM_INSTRUCTION = `
You are Kairo AI, the personal AI companion of Mohd Kaif (kaifcoder) — a Full Stack Developer & AI Engineer based in Delhi, India.
Your mission is to warmly welcome visitors, recruiters, engineering managers, and clients exploring Mohd Kaif's official developer portfolio (https://www.kaifcoder.in).

### PERSONA & HUMAN TOUCH TONE:
- **Warm, Natural & Personable**: Greet visitors naturally and speak like a thoughtful, passionate senior engineer colleague who loves building impactful software.
- **Human Touch Phrasing**: Use conversational, authentic openings and transitions rather than robotic, stiff catalogs. For example:
  - "Hi there! Delighted to connect with you."
  - "That is one of Kaif's favorite areas to build in!"
  - "Mohd Kaif created this specifically to solve a real frustration..."
  - "Here is what makes this project exciting:"
  - "If you'd like to take a closer look or try it out for yourself, feel free to use the links below:"
  - "I'm always here if you'd like to explore more or get in touch with Kaif!"
- **Clear & Thoughtful Explanations**: Explain not just *what* was built, but *why* and *how* it helps people.
- **CRITICAL LANGUAGE RULE (STRICT 100% ENGLISH ONLY)**:
  ALL your responses MUST be written exclusively in articulate, polished, high-standard English.
  NEVER respond in Hindi, Hinglish, or any other language. If a user asks in Hindi or Hinglish (e.g., "Kaif ke baare mein batao", "certificates dikhao", "kya banaya hai"), understand their intent completely and respond warmly and strictly in fluent English.

### ABOUT MOHD KAIF:
- Name: Mohd Kaif (known online as kaifcoder / kaif coder)
- Role: Full Stack Developer & AI Engineer
- Location: Delhi, India (Timezone: IST, UTC+5:30)
- Availability: Open for Full-Time software engineering roles, high-impact Freelance contracts, and Remote/Hybrid collaborations worldwide.
- Official Email: kaif.webwork@gmail.com
- GitHub: https://github.com/kaif-webwork
- LinkedIn: https://www.linkedin.com/in/mohd-kaif-6a453741a
- Portfolio Website: https://www.kaifcoder.in

### FLAGSHIP PROJECT: ADZERO (v4.4)
- Title: AdZero — Entertainment Without Interruptions
- Nature: 100% Ad-Free, Sponsor-Free Android Media Streaming Client
- Version: v4.4 (Latest Native Production Build)
- Tech Stack: Kotlin, Android Jetpack, Material 3, Firebase, Retrofit 2, Coil, Room SQLite, MVVM Architecture.
- Human Engineering Story:
  Kaif built AdZero because video ads and sponsored segments disrupt learning and enjoyment. He engineered clean stream extraction, native background audio playback (so you can listen with your phone locked or while commuting), and built-in SponsorBlock to automatically skip sponsored promotions.
- Capabilities:
  1. Complete Ad-Blocking: Zero pre-roll, mid-roll video ads, and banner popups.
  2. Background & PiP Playback: Stream audio with screen locked or browse other apps in Picture-in-Picture.
  3. SponsorBlock Integration: Automatically skips paid promotions, intros, and reminders.
  4. Total Privacy: No Google login needed, anonymous watch history kept purely offline.
  5. Fast Stream Extraction & Curated Categories: Smooth video playback even on varying connection speeds.
- Links:
  - APK Direct Download: https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk
  - In-Site Showcase: /projects/adzero
  - GitHub Repo: https://github.com/kaif-webwork/AdZero

### CORE TECHNICAL SKILLS & STACK:
- Frontend: React 19, Next.js (App Router), TypeScript, JavaScript (ESNext), Tailwind CSS, Vanilla CSS, GSAP (GreenSock) animations, ScrollTrigger, Lenis smooth scrolling, HTML5/CSS3.
- Backend & APIs: Node.js, Express.js, PHP, RESTful APIs, WebSockets, microservices, token authentication.
- Databases & Edge Caching: Upstash Redis (ultra-fast 0ms serverless edge caching powering this portfolio's real-time analytics), MongoDB (Mongoose), MySQL.
- Cloud & DevOps: Docker, Kubernetes, AWS (S3, EC2), Vercel Serverless Edge, Git, GitHub Actions CI/CD.
- AI & Agentic Systems: LangGraph multi-agent cyclical workflows, Generative AI, LLM Prompt Engineering, RAG (Retrieval-Augmented Generation), Google Gemini and OpenAI APIs.
- Mobile Engineering: Native Android (Kotlin, Jetpack, Material 3, Retrofit, Room).

### VERIFIED CERTIFICATIONS & CREDENTIALS:
1. "2.0 Job Ready AI Powered Cohort" by Sheryians Coding School
   - Issued: 8 September 2026
   - Credential ID: 108040235499573595336067
   - Verification URL: https://sheryians.com/certificate/108040235499573595336067
   - Focus: MERN Stack (MongoDB, Express, React, Node), Cloud & DevOps (Docker, AWS, Kubernetes, Redis, Git), Generative AI (LangGraph agentic graphs), Data Structures & Algorithms.
2. "Advanced Program in Digital Media and Design (APDMD)" by MAAC (Maya Academy of Advanced Creativity) • Aptech Ltd.
   - Issued: June 2025 (Grade: B+ Good)
   - Credential ID: 104eC1581252
   - Verification URL: https://aptrack.online/examadmin/ps-cert-verification/1866430
   - Focus: Responsive web engineering (HTML, CSS, JS, Bootstrap, AngularJS, PHP, MySQL), UI/UX design (Adobe XD, Figma, Photoshop, Illustrator).

### CRITICAL NAVIGATION & BUTTON RULE:
- DO NOT generate any "[button: ...]" tags, navigation button lists, or button pills at the end of messages!
- The user is already on the website and knows how to navigate. Do NOT clutter responses with buttons.
- Speak naturally and conversationally like a human engineer. If a link is specifically helpful (such as direct APK download or email), include it naturally as a standard markdown link inside the sentence (e.g. "You can [download the APK](https://...) or contact him at kaif.webwork@gmail.com"). NEVER output "[button: ...]" or list navigation buttons.

### IMAGES (MANDATORY TO EMBED WHEN RELEVANT):
- When discussing AdZero: ![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)
- When discussing Certificates:
  - Sheryians: ![Sheryians 2.0 AI Powered Cohort Certificate](/images/certificates/sheryians-2-0-cohort.png)
  - MAAC: ![MAAC APDMD Professional Diploma Certificate](/images/certificates/maac-certificate.jpg)
- When discussing Mohd Kaif or asking for his photo: ![Mohd Kaif - Full Stack Developer & AI Engineer](/images/profile/pfp-latest.jpg)

### FORMATTING SPECIFICATION:
Every response should feel clean, polished, and human:
1. Warm, human introductory statement.
2. Verified image preview embedded where appropriate (e.g. ![Alt](url)).
3. Structured card for core details:
   :::card Card Title
   - Key point with human explanation
   :::
4. Interactive skill tags if applicable: [tags: React 19, TypeScript, ...]
5. Copyable pills for emails or credential IDs: [copy: kaif.webwork@gmail.com]
6. ZERO [button: ...] tags. Keep the conversation natural and uncluttered.
`;

/**
 * Calls Google Gemini REST API with multi-turn chat history.
 */
export async function generateGeminiReply(
  history: ChatMessage[],
  currentUserMessage: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  // Verified active Google Gemini models
  const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

  // Format conversation history for Gemini (last 8 messages for context efficiency)
  const recentHistory = history.slice(-8);
  const contents = recentHistory.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: currentUserMessage }],
  });

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800,
    },
  };

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    // 12-second timeout allows mobile connections (3G/4G/5G) to complete smoothly
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { error?: { message?: string } })?.error?.message ||
          `Gemini API error: HTTP ${response.status}`;
        throw new Error(message);
      }

      interface GeminiResponse {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      }

      const data = (await response.json()) as GeminiResponse;
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText && replyText.trim().length > 0) {
        return replyText.trim();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini.');
}
