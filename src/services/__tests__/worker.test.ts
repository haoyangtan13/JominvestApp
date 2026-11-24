import { describe, it, expect, vi } from 'vitest';
import { handleWorkerRequest } from '../../../worker/src/index';

describe('Cloudflare Worker API routes', () => {
  it('returns health status and secret configuration boolean without leaking keys', async () => {
    const req = new Request('https://api.example.com/api/health', { method: 'GET' });
    const res = await handleWorkerRequest(req, { GEMINI_API_KEY: 'test-secret-placeholder' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true, aiConfigured: true });
    expect(JSON.stringify(json)).not.toContain('test-secret-placeholder');
  });

  it('returns 503 cleanly on /api/ai when GEMINI_API_KEY is unset so frontend falls back locally', async () => {
    const req = new Request('https://api.example.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'chat', message: 'Hello' }),
    });
    const res = await handleWorkerRequest(req, {});
    expect(res.status).toBe(503);
  });

  it('calls Gemini Flash and strips any emojis from AI chat responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: 'MAYBANK pays strong dividends!' }] } },
          ],
        }),
        { status: 200 }
      )
    );

    const req = new Request('https://api.example.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'chat', message: 'Tell me about Maybank', language: 'ENG' }),
    });

    const res = await handleWorkerRequest(req, { GEMINI_API_KEY: 'placeholder' }, mockFetch as unknown as typeof fetch);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { reply: string };
    expect(json.reply).toBe('MAYBANK pays strong dividends!');
  });
});
