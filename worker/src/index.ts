export interface Env {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const KLSE_CODES = [
  '1155.KL', '1295.KL', '5347.KL', '1023.KL', '5183.KL',
  '5225.KL', '6947.KL', '8869.KL', '5819.KL', '5285.KL',
  '6012.KL', '3816.KL', '4707.KL', '1066.KL', '1961.KL',
  '7113.KL', '5398.KL', '4715.KL', '6742.KL', '5211.KL',
];

function corsHeaders(allowedOrigin = '*'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function toMytDate(epochSec: number): string {
  const d = new Date((epochSec + 8 * 3600) * 1000);
  return d.toISOString().slice(0, 10);
}

function formatVolume(vol: number): string {
  if (!Number.isFinite(vol) || vol <= 0) return '1.5M';
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return String(vol);
}

function stripEmojis(input: string): string {
  return input.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

async function fetchOneYahooQuote(klseCode: string, fetchImpl: typeof fetch) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${klseCode}?range=1mo&interval=1d`;
  const res = await fetchImpl(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Yahoo ${klseCode} HTTP ${res.status}`);
  const data = (await res.json()) as {
    chart?: {
      result?: Array<{
        meta?: { regularMarketPrice?: number; chartPreviousClose?: number; regularMarketVolume?: number };
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: Array<number | null>; volume?: Array<number | null> }> };
      }>;
    };
  };

  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`Empty result for ${klseCode}`);

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const volumes = result.indicators?.quote?.[0]?.volume || [];

  const history: { date: string; price: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const c = closes[i];
    if (typeof c === 'number' && Number.isFinite(c)) {
      history.push({ date: toMytDate(timestamps[i]), price: Number(c.toFixed(2)) });
    }
  }

  const latest = result.meta?.regularMarketPrice ?? history[history.length - 1]?.price ?? 1;
  const prevClose =
    history.length >= 2 ? history[history.length - 2].price : result.meta?.chartPreviousClose ?? latest;
  const diff = latest - prevClose;
  const pct = prevClose > 0 ? (diff / prevClose) * 100 : 0;
  const isPositive = diff >= 0;
  const validVols = volumes.filter((v): v is number => typeof v === 'number' && v > 0);
  const lastVol = validVols[validVols.length - 1] || result.meta?.regularMarketVolume || 1_500_000;

  return {
    klseCode,
    price: Number(latest).toFixed(2),
    change: `${isPositive ? '+' : ''}${diff.toFixed(2)}`,
    changePercent: `${isPositive ? '+' : ''}${pct.toFixed(2)}%`,
    isPositive,
    volume: formatVolume(lastVol),
    sparkline: history.slice(-7).map((h) => h.price),
    history,
  };
}

export async function handleWorkerRequest(
  request: Request,
  env: Env,
  fetchImpl: typeof fetch = fetch
): Promise<Response> {
  const cors = corsHeaders(env.ALLOWED_ORIGIN);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const url = new URL(request.url);

  if (url.pathname === '/api/health' && request.method === 'GET') {
    return jsonResponse(
      { ok: true, aiConfigured: Boolean(env.GEMINI_API_KEY) },
      200,
      cors
    );
  }

  if (url.pathname === '/api/stocks' && request.method === 'GET') {
    const cacheStorage = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    const cacheKey = new Request(url.origin + '/api/stocks', { method: 'GET' });

    if (cacheStorage) {
      const cached = await cacheStorage.match(cacheKey);
      if (cached) {
        const headers = new Headers(cached.headers);
        Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
        return new Response(cached.body, { status: cached.status, headers });
      }
    }

    const settled = await Promise.allSettled(
      KLSE_CODES.map((code) => fetchOneYahooQuote(code, fetchImpl))
    );
    const quotes = settled
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchOneYahooQuote>>> => r.status === 'fulfilled')
      .map((r) => r.value);

    const payload = {
      updatedAt: toMytDate(Math.floor(Date.now() / 1000)),
      count: quotes.length,
      quotes,
    };

    const response = jsonResponse(payload, 200, {
      ...cors,
      'Cache-Control': 'public, max-age=900',
    });

    if (cacheStorage && quotes.length > 0) {
      await cacheStorage.put(cacheKey, response.clone());
    }

    return response;
  }

  if (url.pathname === '/api/ai' && request.method === 'POST') {
    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'GEMINI_API_KEY not configured' }, 503, cors);
    }

    let body: {
      mode?: 'chat' | 'report';
      message?: string;
      language?: 'ENG' | 'BM';
      cashRM?: string;
      portfolioSummary?: string;
      userProfile?: string;
      stock?: Record<string, unknown>;
    };

    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400, cors);
    }

    const langName = body.language === 'BM' ? 'Bahasa Melayu' : 'English';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

    if (body.mode === 'report' && body.stock) {
      const prompt = `You are JomRingkas, a concise Malaysian student stock analyst. Respond in ${langName} with STRICT JSON ONLY (keys: "title", "growth", "risk", "dividend", "score"). Use zero emojis. Base analysis strictly on this Bursa Malaysia stock JSON: ${JSON.stringify(body.stock).slice(0, 1800)}`;

      const aiRes = await fetchImpl(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      });

      if (!aiRes.ok) {
        return jsonResponse({ error: 'Upstream AI error' }, 502, cors);
      }
      const aiData = (await aiRes.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      try {
        const parsed = JSON.parse(rawText) as Record<string, unknown>;
        return jsonResponse(
          {
            title: stripEmojis(String(parsed.title || '')),
            growth: stripEmojis(String(parsed.growth || '')),
            risk: stripEmojis(String(parsed.risk || '')),
            dividend: stripEmojis(String(parsed.dividend || '')),
            score: Number(parsed.score) || 80,
          },
          200,
          cors
        );
      } catch {
        return jsonResponse({ error: 'Malformed AI JSON' }, 502, cors);
      }
    }

    // Default: chat mode
    const userMsg = String(body.message || '').slice(0, 600);
    const chatPrompt = `You are JomAI Coach, an educational Bursa Malaysia stock coach for university students. Reply in ${langName} in 2-4 crisp sentences. Strictly NO emojis. Never give guaranteed financial promises. Student context: Virtual Cash RM ${body.cashRM || '10,000.00'}, Holdings: ${body.portfolioSummary || 'none'}, Persona: ${body.userProfile || 'Jom-Explorer'}. Question: ${userMsg}`;

    const aiRes = await fetchImpl(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: chatPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 280 },
      }),
    });

    if (!aiRes.ok) {
      return jsonResponse({ error: 'Upstream AI error' }, 502, cors);
    }

    const aiData = (await aiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = stripEmojis(aiData.candidates?.[0]?.content?.parts?.[0]?.text || '');
    return jsonResponse({ reply }, 200, cors);
  }

  return jsonResponse({ error: 'Not found' }, 404, cors);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleWorkerRequest(request, env);
  },
};
