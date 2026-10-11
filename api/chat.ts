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

interface RequestPayload {
  contents?: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: string;
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
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin && isOriginAllowed(origin) ? origin : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  let body: RequestPayload;
  try {
    body = (await req.json()) as RequestPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const { contents, systemInstruction } = body;
  if (!contents || !Array.isArray(contents) || contents.length === 0 || contents.length > 20) {
    return new Response(JSON.stringify({ error: 'Invalid conversation payload length' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Sanitize message content length to prevent memory abuse
  for (const item of contents) {
    if (item.parts?.[0]?.text && item.parts[0].text.length > 3000) {
      item.parts[0].text = item.parts[0].text.slice(0, 3000);
    }
  }

  const geminiPayload = {
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents,
    generationConfig: {
      temperature: 0.65,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 380,
    },
  };

  let lastError = 'No models available';

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
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-store',
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
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
