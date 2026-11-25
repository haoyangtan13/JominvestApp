import { describe, it, expect, beforeEach } from 'vitest';
import { GET as healthGet, OPTIONS as healthOptions } from '../../../api/health';
import { POST as aiPost, OPTIONS as aiOptions } from '../../../api/ai';
import { resetRateLimiterForTests } from '../../../worker/src/index';

describe('Vercel /api/* route adapters', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('returns 200 and { ok: true, aiConfigured } from GET /api/health', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      const unsetRes = await healthGet(new Request('https://jominvestapp1.vercel.app/api/health', { method: 'GET' }));
      expect(unsetRes.status).toBe(200);
      expect(await unsetRes.json()).toEqual({ ok: true, aiConfigured: false });

      process.env.GEMINI_API_KEY = 'test-secret-placeholder';
      const setRes = await healthGet(new Request('https://jominvestapp1.vercel.app/api/health', { method: 'GET' }));
      expect(setRes.status).toBe(200);
      expect(await setRes.json()).toEqual({ ok: true, aiConfigured: true });
    } finally {
      if (originalKey === undefined) {
        delete process.env.GEMINI_API_KEY;
      } else {
        process.env.GEMINI_API_KEY = originalKey;
      }
    }
  });

  it('returns 204 for OPTIONS preflight requests on /api/health and /api/ai', async () => {
    const healthRes = await healthOptions(
      new Request('https://jominvestapp1.vercel.app/api/health', { method: 'OPTIONS' })
    );
    expect(healthRes.status).toBe(204);

    const aiRes = await aiOptions(
      new Request('https://jominvestapp1.vercel.app/api/ai', { method: 'OPTIONS' })
    );
    expect(aiRes.status).toBe(204);
  });

  it('returns 503 when GEMINI_API_KEY is unset and 400 on invalid AI mode when configured', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      const unconfiguredRes = await aiPost(
        new Request('https://jominvestapp1.vercel.app/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'chat', message: 'Hello' }),
        })
      );
      expect(unconfiguredRes.status).toBe(503);
      expect(await unconfiguredRes.json()).toEqual({ error: 'AI service is not configured' });

      process.env.GEMINI_API_KEY = 'test-secret-placeholder';
      const invalidModeRes = await aiPost(
        new Request('https://jominvestapp1.vercel.app/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'bogus' }),
        })
      );
      expect(invalidModeRes.status).toBe(400);
      expect(await invalidModeRes.json()).toEqual({ error: 'Invalid AI mode' });
    } finally {
      if (originalKey === undefined) {
        delete process.env.GEMINI_API_KEY;
      } else {
        process.env.GEMINI_API_KEY = originalKey;
      }
    }
  });
});
