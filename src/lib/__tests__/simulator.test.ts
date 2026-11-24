import { describe, it, expect } from 'vitest';
import {
  INITIAL_CASH_SEN,
  priceToSen,
  formatRMFromSen,
  executeBuy,
  executeSell,
  simulateDividendPayout,
  type HoldingPosition,
} from '../simulator';

describe('simulator engine (integer sen accounting)', () => {
  it('converts RM string prices to integer sen and formats back accurately', () => {
    expect(priceToSen('10.12')).toBe(1012);
    expect(priceToSen('9.26')).toBe(926);
    expect(priceToSen('0.92')).toBe(92);
    expect(formatRMFromSen(1_000_000)).toBe('10,000.00');
    expect(formatRMFromSen(92600)).toBe('926.00');
    expect(formatRMFromSen(-1450)).toBe('-14.50');
  });

  it('executes a buy, deducts cash in sen, and records a BUY transaction', () => {
    const res = executeBuy({
      cashSen: INITIAL_CASH_SEN,
      holdings: [],
      transactions: [],
      stockId: '1',
      ticker: 'MAYBANK',
      name: 'Malayan Banking Berhad',
      unitPriceSen: 1000, // RM 10.00
      quantity: 50,
      timestampIso: '2026-11-24T09:00:00+08:00',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.cashSen).toBe(950_000); // RM 9,500.00
    expect(res.holdings).toHaveLength(1);
    expect(res.holdings[0]).toEqual({
      stockId: '1',
      quantity: 50,
      avgPriceSen: 1000,
    });
    expect(res.transactions[0].type).toBe('BUY');
    expect(res.transactions[0].totalSen).toBe(50_000);
  });

  it('computes weighted average cost in sen on repeat buy', () => {
    const initial: HoldingPosition[] = [{ stockId: '1', quantity: 100, avgPriceSen: 900 }];
    const res = executeBuy({
      cashSen: 500_000,
      holdings: initial,
      transactions: [],
      stockId: '1',
      ticker: 'MAYBANK',
      name: 'Malayan Banking Berhad',
      unitPriceSen: 1100,
      quantity: 100,
      timestampIso: '2026-11-24T10:00:00+08:00',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.holdings[0].quantity).toBe(200);
    expect(res.holdings[0].avgPriceSen).toBe(1000); // (90000 + 110000) / 200
  });

  it('blocks buys that exceed available virtual cash', () => {
    const res = executeBuy({
      cashSen: 50_000, // RM 500
      holdings: [],
      transactions: [],
      stockId: '3',
      ticker: 'TENAGA',
      name: 'Tenaga Nasional Berhad',
      unitPriceSen: 1400, // RM 14.00
      quantity: 100, // RM 1,400 needed
      timestampIso: '2026-11-24T10:00:00+08:00',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('INSUFFICIENT_CASH');
    }
  });

  it('supports partial sell, credits cash, keeps remaining units, and computes realized P&L', () => {
    const initial: HoldingPosition[] = [{ stockId: '1', quantity: 100, avgPriceSen: 900 }];
    const res = executeSell({
      cashSen: 100_000,
      holdings: initial,
      transactions: [],
      stockId: '1',
      ticker: 'MAYBANK',
      name: 'Malayan Banking Berhad',
      unitPriceSen: 1050, // +150 sen/unit profit
      quantity: 40,
      timestampIso: '2026-11-24T11:00:00+08:00',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.cashSen).toBe(142_000); // 100_000 + 40 * 1050
    expect(res.holdings).toHaveLength(1);
    expect(res.holdings[0].quantity).toBe(60);
    expect(res.holdings[0].avgPriceSen).toBe(900);
    expect(res.realizedPnlSen).toBe(6_000); // +RM 60.00
    expect(res.transactions[0].realizedPnlSen).toBe(6_000);
  });

  it('removes position completely when selling all held units', () => {
    const initial: HoldingPosition[] = [{ stockId: '1', quantity: 25, avgPriceSen: 900 }];
    const res = executeSell({
      cashSen: 0,
      holdings: initial,
      transactions: [],
      stockId: '1',
      ticker: 'MAYBANK',
      name: 'Malayan Banking Berhad',
      unitPriceSen: 850,
      quantity: 25,
      timestampIso: '2026-11-24T11:30:00+08:00',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.holdings).toHaveLength(0);
    expect(res.realizedPnlSen).toBe(-1_250);
  });

  it('simulates annual dividend payout across eligible holdings', () => {
    const holdings: HoldingPosition[] = [
      { stockId: '1', quantity: 100, avgPriceSen: 1000 }, // RM 1,000 @ 6% = RM 60.00 (6000 sen)
      { stockId: '16', quantity: 500, avgPriceSen: 90 }, // N/A dividend = 0 sen
    ];
    const stockLookup = {
      '1': { ticker: 'MAYBANK', priceSen: 1000, dividendYield: '6.00%' },
      '16': { ticker: 'TOPGLOV', priceSen: 90, dividendYield: 'N/A' },
    };

    const res = simulateDividendPayout({
      cashSen: 200_000,
      holdings,
      transactions: [],
      stockLookup,
      timestampIso: '2026-11-24T12:00:00+08:00',
    });

    expect(res.payoutSen).toBe(6_000);
    expect(res.cashSen).toBe(206_000);
    expect(res.transactions[0].type).toBe('DIVIDEND');
  });
});
