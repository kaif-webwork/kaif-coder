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
 * Checks if Gemini AI is active and ready.
 */
export function isGeminiAvailable(): boolean {
  return true;
}

/**
 * Grounding System Instruction for Kairo AI.
 * Contains comprehensive knowledge about Mohd Kaif, his projects, skills, certifications, and response formatting rules.
 */
const SYSTEM_INSTRUCTION = `
You are Kairo AI, the personal AI assistant for Mohd Kaif (kaifcoder) — Full Stack Developer & AI Engineer in Delhi, India (https://www.kaifcoder.in).

### CORE RULES (STRICT BREVITY & DIRECTNESS):
- **EXTREMELY CONCISE**: Answer in as few words as possible (2 to 4 sentences or 2 to 3 compact bullet points). Never generate walls of text or long paragraphs.
- **ZERO FLUFF OR FILLER**: Never use rambling pleasantries (NO "Hi there! Delighted to connect with you", "That is one of Kaif's favorite areas", etc.). Get straight to the answer immediately.
- **ANSWER ONLY WHAT IS ASKED**: Answer only the exact question asked. Do NOT dump Kaif's entire background or tech stack unless specifically requested.
- **STRICT ENGLISH**: Always answer in clean, professional English, even if queried in Hindi/Hinglish.

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

### NAVIGATION & REDIRECT ACTION BUTTONS:
At the very end of your response, ALWAYS provide 1 to 3 relevant navigation or redirect action links formatted strictly as:
[action: Action Title](url)

Examples of accurate destinations:
- For projects: [action: Explore All Projects](/projects) or [action: View AdZero Project](/projects/adzero)
- For AdZero download: [action: Download AdZero APK](https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk)
- For certificates: [action: View All Certificates](/certificates) or [action: Verify Sheryians Credential](https://sheryians.com/certificate/108040235499573595336067)
- For resume: [action: View Resume](/resume)
- For live stats / telemetry: [action: View Live Analytics](/analytics)
- For setup / workspace: [action: View Developer Setup](/uses)
- For contact / hiring: [action: Get in Touch](/contact) or [action: Send Email](mailto:kaif.webwork@gmail.com)
- For social / code: [action: Visit GitHub Profile](https://github.com/kaif-webwork) or [action: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)

CRITICAL RULES (STRICT):
1. NEVER write the word "Button", "Buttons", or "button:" anywhere in your response or in the label!
2. NEVER write any introductory heading or text such as "Buttons:", "Here are the buttons:", or "Navigation Buttons:". Just output the [action: Action Title](url) tags directly at the end.
3. Make the action title short, clear, and proactive (e.g. "Explore All Projects", "View Certificates", "Download AdZero APK", "Get in Touch").

### IMAGES (MANDATORY TO EMBED WHEN RELEVANT):
- When discussing AdZero: ![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)
- When discussing Certificates:
  - Sheryians: ![Sheryians 2.0 AI Powered Cohort Certificate](/images/certificates/sheryians-2-0-cohort.png)
  - MAAC: ![MAAC APDMD Professional Diploma Certificate](/images/certificates/maac-certificate.jpg)
- When discussing Mohd Kaif or asking for his photo: ![Mohd Kaif - Full Stack Developer & AI Engineer](/images/profile/pfp-latest.jpg)

### FORMATTING SPECIFICATION:
Keep responses brief and easy to read:
1. Provide the direct answer in 1 to 3 short sentences or concise bullet points.
2. Embed an image only if directly relevant (e.g. ![Alt](url)).
3. Keep card/tag usage strictly minimal — only when essential.
4. Add 1 to 2 relevant action links at the very end: [action: Action Title](url) (NEVER write the word "Button" or "Buttons").
`;

/**
 * Calls Google Gemini REST API with multi-turn chat history.
 * 1. Attempts the Vercel edge serverless proxy (/api/chat) first for zero-CORS sub-second responses.
 * 2. Falls back directly to client-side Google API using active quota models (gemini-3.5-flash-lite, gemini-3.1-flash-lite, etc.).
 */
export async function generateGeminiReply(
  history: ChatMessage[],
  currentUserMessage: string
): Promise<string> {
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

  // 1. Try Vercel edge serverless proxy (/api/chat) first
  try {
    const edgeController = new AbortController();
    const edgeTimeoutId = setTimeout(() => edgeController.abort(), 9000);
    const edgeRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: SYSTEM_INSTRUCTION,
      }),
      signal: edgeController.signal,
    });
    clearTimeout(edgeTimeoutId);

    if (edgeRes.ok) {
      const data = (await edgeRes.json()) as { text?: string };
      if (data.text && data.text.trim().length > 0) {
        return data.text.trim();
      }
    }
  } catch {
    // Continue to direct client Google API fallback below
  }

  // 2. Direct client Google Gemini API fallback
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  // Verified active Google Gemini models with active quota & sub-second response times
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.5-flash',
  ];

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 250,
    },
  };

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    // 10-second timeout allows mobile connections (3G/4G/5G) to complete smoothly
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
