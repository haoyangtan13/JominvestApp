import { describe, it, expect, vi } from 'vitest';
import { mergeLiveQuotes, fetchBursaQuotes } from '../marketData';
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
});
