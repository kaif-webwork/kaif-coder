export const config = {
  runtime: 'edge',
};

declare const process: { env: Record<string, string | undefined> };

const GEMINI_API_KEY =
  (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

const candidateModels = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.5-flash',
];

interface ChatPart {
  text: string;
}

interface ChatContent {
  role: 'user' | 'model';
  parts: ChatPart[];
}

interface RequestPayload {
  contents?: unknown;
  systemInstruction?: unknown;
}

// In-memory sliding rate limiter per Edge worker instance
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  // Periodic cleanup of expired entries
  if (rateLimitStore.size > 1000) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (now > val.resetAt) rateLimitStore.delete(key);
    }
  }

  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin or non-browser request
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.kaifcoder.in') ||
      host === 'kaifcoder.in' ||
      host.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Access denied: unauthorized origin' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'https://www.kaifcoder.in';
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Rate Limiting per IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment before sending another message.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateCheck.retryAfter || 60),
          ...corsHeaders,
        },
      }
    );
  }

  // Fast check: Gemini API key presence
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Guard against massive payloads (> 32KB)
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > 32768) {
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  let body: RequestPayload;
  try {
    body = (await req.json()) as RequestPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Deep input validation on contents structure
  if (!Array.isArray(body.contents) || body.contents.length === 0 || body.contents.length > 20) {
    return new Response(JSON.stringify({ error: 'Invalid conversation payload length' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const sanitizedContents: ChatContent[] = [];
  let totalChars = 0;

  for (const item of body.contents as any[]) {
    if (!item || typeof item !== 'object') continue;
    const role = item.role === 'model' ? 'model' : 'user';
    if (!Array.isArray(item.parts) || item.parts.length === 0) continue;

    const sanitizedParts: ChatPart[] = [];
    for (const part of item.parts) {
      if (typeof part?.text === 'string') {
        const cleanedText = part.text.replace(/\0/g, '').slice(0, 2500);
        totalChars += cleanedText.length;
        sanitizedParts.push({ text: cleanedText });
      }
    }

    if (sanitizedParts.length > 0) {
      sanitizedContents.push({ role, parts: sanitizedParts });
    }
  }

  if (sanitizedContents.length === 0 || totalChars > 16000) {
    return new Response(JSON.stringify({ error: 'Conversation content exceeded limits' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const systemInstruction =
    typeof body.systemInstruction === 'string'
      ? body.systemInstruction.replace(/\0/g, '').slice(0, 4000)
      : undefined;

  const geminiPayload = {
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: sanitizedContents,
    generationConfig: {
      temperature: 0.65,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 380,
    },
  };

  let lastError = 'AI service temporarily unavailable';

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = (errJson as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
        lastError = msg;
        continue;
      }

      interface GeminiCandidateResponse {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      }

      const data = (await res.json()) as GeminiCandidateResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return new Response(
          JSON.stringify({ text: text.trim(), model }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, max-age=0',
              ...corsHeaders,
            },
          }
        );
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return new Response(
    JSON.stringify({ error: lastError }),
    {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
        ...corsHeaders,
      },
    }
  );
}
