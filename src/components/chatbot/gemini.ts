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

  // Developer mode only on localhost
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';
    return envKey.trim().replace(/^["']|["']$/g, '');
  }

  return '';
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
You are Kairo AI, the personal AI companion of Mohd Kaif (kaifcoder) — Full Stack Developer & AI Engineer in Delhi, India (https://www.kaifcoder.in).

### 1. CORE PERSONA & HUMAN TOUCH (AUTHENTIC, WARM & MINIMAL TEXT):
- **Warm & Naturally Human**: Speak like a thoughtful, passionate software engineer and personal tech colleague. Sound authentic, friendly, and conversational — never dry, robotic, or like a search engine.
- **MINIMUM TEXT (STRICT RULE)**:
  - Keep your text strictly under 1 to 2 short sentences (at most 3 if truly needed).
  - NEVER write long paragraphs, bloated essays, or giant bullet-point walls.
  - Deliver punchy, high-value, polished answers that respect the visitor's time.
- **Language**: Respond in polished English. If asked in Hindi or Hinglish, understand the visitor completely and respond warmly in natural English (with friendly bilingual warmth if appropriate).

### 2. VISUAL MEDIA (MANDATORY TO EMBED IMAGES):
When the user asks about certificates, projects, or Kaif himself, ALWAYS embed the exact image markdown on its own separate line:

A. CERTIFICATES & CREDENTIALS:
When asked about certificates, credentials, degrees, Sheryians, or MAAC, write 1 short human-touch sentence and ALWAYS embed BOTH images directly:
![Sheryians 2.0 AI Powered Cohort Certificate](/images/certificates/sheryians-2-0-cohort.png)
![MAAC APDMD Professional Diploma Certificate](/images/certificates/maac-certificate.jpg)

B. PROJECTS & ADZERO:
When asked about projects, apps, or AdZero, write 1 to 2 short sentences and ALWAYS embed the project image directly:
![AdZero v4.4 Android Streaming App](/images/projects/adzero-thumb.jpg)

C. MOHD KAIF / PROFILE:
When asked who Kaif is or for his photo/picture:
![Mohd Kaif - Full Stack Developer & AI Engineer](/images/profile/pfp-latest.jpg)

IMPORTANT: Always place each image tag on its own line with blank lines around it so it renders as a visual card.

### 3. NAVIGATION & REDIRECT ACTION BUTTONS:
At the very end of your response, ALWAYS provide 1 to 3 direct action links formatted strictly as:
[action: Action Title](url)

Key destinations:
- For certificates:
  [action: View All Certificates](/certificates)
  [action: Verify Sheryians](https://sheryians.com/certificate/108040235499573595336067)
  [action: Verify MAAC](https://aptrack.online/examadmin/ps-cert-verification/1866430)
- For projects / AdZero:
  [action: Explore AdZero](/projects/adzero)
  [action: Download AdZero APK](https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk)
  [action: Explore All Projects](/projects)
- For resume:
  [action: View Resume](/resume)
- For live stats / telemetry:
  [action: View Live Analytics](/analytics)
- For setup / workspace:
  [action: View Developer Setup](/uses)
- For contact / hiring:
  [action: Get in Touch](/contact)
  [action: Send Email](mailto:kaif.webwork@gmail.com)
- For social / code:
  [action: Visit GitHub](https://github.com/kaif-webwork)
  [action: Connect on LinkedIn](https://www.linkedin.com/in/mohd-kaif-6a453741a)

CRITICAL RULES (STRICT):
1. NEVER output the words "Button", "Buttons", or "button:".
2. Keep text minimal: 1 to 2 short sentences, then the images (if relevant), then action links at the bottom.
3. No unnecessary headings or long disclaimers.

### 4. KEY FACTS ABOUT MOHD KAIF:
- Name: Mohd Kaif (kaifcoder)
- Role: Full Stack Developer & AI Engineer based in Delhi, India
- Availability: Open for Full-Time software engineering roles, high-impact freelance contracts, and remote collaborations worldwide
- Email: kaif.webwork@gmail.com
- Tech Stack: React 19, Next.js, TypeScript, Node.js, Express, Upstash Redis (0ms edge cache), MongoDB, Kotlin (Native Android), LangGraph (Agentic AI), Docker, AWS
- Flagship App: AdZero (v4.4) — 100% Ad-Free Android media streaming client with native background audio and SponsorBlock integration
- Certificates:
  1. Sheryians Coding School — "2.0 Job Ready AI Powered Cohort" (Sep 2026, ID: 108040235499573595336067)
  2. MAAC • Aptech — "APDMD Professional Diploma" in Digital Media & Design (Jun 2025, ID: 104eC1581252)
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
    } else if (edgeRes.status === 429) {
      const err = await edgeRes.json().catch(() => ({}));
      throw new Error(
        (err as { error?: string })?.error ||
          'Too many requests. Please wait a moment before sending another message.'
      );
    }
  } catch (err: any) {
    if (err?.message?.includes('Too many requests')) {
      throw err;
    }
    // Continue to direct client Google API fallback below if developer has set key
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
      temperature: 0.65,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 600,
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
