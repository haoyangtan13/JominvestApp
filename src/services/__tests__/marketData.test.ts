import { describe, it, expect, vi } from 'vitest';
import { getApiBaseUrl, mergeLiveQuotes, fetchBursaQuotes } from '../marketData';
import { stocks } from '../../data/stocks';

describe('marketData service', () => {
  it('merges partial live quote updates cleanly onto baseline Bursa stocks', () => {
    const merged = mergeLiveQuotes(stocks, [
      {
        klseCode: '1155.KL',
        price: '10.50',
        change: '+0.38',
        changePercent: '+3.75%',
        isPositive: true,
        volume: '9.1M',
        sparkline: [10.1, 10.2, 10.3, 10.4, 10.5],
        history: [
          { date: '2026-11-23', price: 10.12 },
          { date: '2026-11-24', price: 10.5 },
        ],
      },
    ]);

    const maybank = merged.find((s) => s.ticker === 'MAYBANK')!;
    expect(maybank.price).toBe('10.50');
    expect(maybank.changePercent).toBe('+3.75%');
    expect(maybank.history).toHaveLength(2);
    // Untouched stock remains intact
    const tenaga = merged.find((s) => s.ticker === 'TENAGA')!;
    expect(tenaga.klseCode).toBe('5347.KL');
    expect(tenaga.shariahCompliant).toBe(true);
  });

  it('falls back gracefully to cached snapshot when API base URL is unset or unreachable', async () => {
    const res = await fetchBursaQuotes('', vi.fn().mockRejectedValue(new Error('offline')));
    expect(res.source).toBe('cached');
    expect(res.stocks).toHaveLength(20);
  });

  it('defaults getApiBaseUrl to window.location.origin on non-localhost domains and empty string on localhost', () => {
    const originalWindow = globalThis.window;
    try {
      vi.stubEnv('VITE_API_BASE_URL', '');
      (globalThis as unknown as { window: { location: { origin: string } } }).window = {
        location: { origin: 'https://jominvestapp1.vercel.app' },
      };
      expect(getApiBaseUrl()).toBe('https://jominvestapp1.vercel.app');

      (globalThis as unknown as { window: { location: { origin: string } } }).window = {
        location: { origin: 'http://localhost:3000' },
      };
      expect(getApiBaseUrl()).toBe('');

      vi.stubEnv('VITE_API_BASE_URL', 'https://custom-worker.example.com/');
      expect(getApiBaseUrl()).toBe('https://custom-worker.example.com');
    } finally {
      vi.unstubAllEnvs();
      if (originalWindow === undefined) {
        delete (globalThis as unknown as { window?: unknown }).window;
      } else {
        (globalThis as unknown as { window: typeof originalWindow }).window = originalWindow;
      }
    }
  });
});
