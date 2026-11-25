export const INITIAL_CASH_SEN = 1_000_000; // RM 10,000.00 in integer sen
export const STORAGE_KEY = 'jominvest_state_v1';

export interface HoldingPosition {
  stockId: string;
  quantity: number;
  avgPriceSen: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  stockId: string;
  ticker: string;
  name: string;
  quantity: number;
  unitPriceSen: number;
  totalSen: number;
  realizedPnlSen?: number;
  timestampIso: string;
}

export interface PersistedSimulatorState {
  cashSen: number;
  holdings: HoldingPosition[];
  watchlistIds: string[];
  transactions: TransactionRecord[];
  userXP: number;
  userLevel: number;
  userProfile: string;
  hasLearnedTerm: string[];
  completedLessons: string[];
  language: 'ENG' | 'BM';
}

export function priceToSen(priceStr: string | number): number {
  const num = typeof priceStr === 'number' ? priceStr : parseFloat(priceStr);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export function senToDecimal(sen: number): number {
  return Math.round(sen) / 100;
}

export function formatRMFromSen(sen: number): string {
  const rounded = Math.round(sen);
  const sign = rounded < 0 ? '-' : '';
  const absVal = Math.abs(rounded) / 100;
  return (
    sign +
    absVal.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function nowMytIso(): string {
  // Explicit Asia/Kuala_Lumpur (+08:00) timestamp
  const now = new Date();
  const mytMs = now.getTime() + 8 * 60 * 60 * 1000;
  const myt = new Date(mytMs);
  return myt.toISOString().replace('Z', '+08:00');
}

function makeTxId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type BuyResult =
  | {
      ok: true;
      cashSen: number;
      holdings: HoldingPosition[];
      transactions: TransactionRecord[];
      costSen: number;
    }
  | {
      ok: false;
      error: 'INVALID_QUANTITY' | 'INSUFFICIENT_CASH';
      requiredSen: number;
    };

export function executeBuy(params: {
  cashSen: number;
  holdings: HoldingPosition[];
  transactions: TransactionRecord[];
  stockId: string;
  ticker: string;
  name: string;
  unitPriceSen: number;
  quantity: number;
  timestampIso?: string;
}): BuyResult {
  const qty = Math.floor(params.quantity);
  if (!Number.isFinite(qty) || qty < 1 || params.unitPriceSen <= 0) {
    return { ok: false, error: 'INVALID_QUANTITY', requiredSen: 0 };
  }

  const costSen = params.unitPriceSen * qty;
  if (costSen > params.cashSen) {
    return { ok: false, error: 'INSUFFICIENT_CASH', requiredSen: costSen };
  }

  const nextHoldings = [...params.holdings];
  const idx = nextHoldings.findIndex((h) => h.stockId === params.stockId);

  if (idx > -1) {
    const existing = nextHoldings[idx];
    const newQty = existing.quantity + qty;
    const totalCostSen = existing.quantity * existing.avgPriceSen + costSen;
    nextHoldings[idx] = {
      stockId: existing.stockId,
      quantity: newQty,
      avgPriceSen: Math.round(totalCostSen / newQty),
    };
  } else {
    nextHoldings.push({
      stockId: params.stockId,
      quantity: qty,
      avgPriceSen: params.unitPriceSen,
    });
  }

  const tx: TransactionRecord = {
    id: makeTxId('buy'),
    type: 'BUY',
    stockId: params.stockId,
    ticker: params.ticker,
    name: params.name,
    quantity: qty,
    unitPriceSen: params.unitPriceSen,
    totalSen: costSen,
    timestampIso: params.timestampIso || nowMytIso(),
  };

  return {
    ok: true,
    cashSen: params.cashSen - costSen,
    holdings: nextHoldings,
    transactions: [tx, ...params.transactions].slice(0, 100),
    costSen,
  };
}

export type SellResult =
  | {
      ok: true;
      cashSen: number;
      holdings: HoldingPosition[];
      transactions: TransactionRecord[];
      proceedsSen: number;
      realizedPnlSen: number;
    }
  | {
      ok: false;
      error: 'INVALID_QUANTITY' | 'INSUFFICIENT_SHARES';
    };

export function executeSell(params: {
  cashSen: number;
  holdings: HoldingPosition[];
  transactions: TransactionRecord[];
  stockId: string;
  ticker: string;
  name: string;
  unitPriceSen: number;
  quantity: number;
  timestampIso?: string;
}): SellResult {
  const qty = Math.floor(params.quantity);
  if (!Number.isFinite(qty) || qty < 1 || params.unitPriceSen <= 0) {
    return { ok: false, error: 'INVALID_QUANTITY' };
  }

  const idx = params.holdings.findIndex((h) => h.stockId === params.stockId);
  if (idx === -1 || params.holdings[idx].quantity < qty) {
    return { ok: false, error: 'INSUFFICIENT_SHARES' };
  }

  const existing = params.holdings[idx];
  const proceedsSen = params.unitPriceSen * qty;
  const realizedPnlSen = (params.unitPriceSen - existing.avgPriceSen) * qty;
  const remainingQty = existing.quantity - qty;

  const nextHoldings =
    remainingQty > 0
      ? params.holdings.map((h, i) => (i === idx ? { ...h, quantity: remainingQty } : h))
      : params.holdings.filter((_, i) => i !== idx);

  const tx: TransactionRecord = {
    id: makeTxId('sell'),
    type: 'SELL',
    stockId: params.stockId,
    ticker: params.ticker,
    name: params.name,
    quantity: qty,
    unitPriceSen: params.unitPriceSen,
    totalSen: proceedsSen,
    realizedPnlSen,
    timestampIso: params.timestampIso || nowMytIso(),
  };

  return {
    ok: true,
    cashSen: params.cashSen + proceedsSen,
    holdings: nextHoldings,
    transactions: [tx, ...params.transactions].slice(0, 100),
    proceedsSen,
    realizedPnlSen,
  };
}

export function simulateDividendPayout(params: {
  cashSen: number;
  holdings: HoldingPosition[];
  transactions: TransactionRecord[];
  stockLookup: Record<string, { ticker: string; name?: string; priceSen: number; dividendYield: string }>;
  timestampIso?: string;
}): {
  payoutSen: number;
  cashSen: number;
  transactions: TransactionRecord[];
} {
  let totalPayoutSen = 0;
  const newTxs: TransactionRecord[] = [];
  const ts = params.timestampIso || nowMytIso();

  for (const h of params.holdings) {
    const info = params.stockLookup[h.stockId];
    if (!info) continue;
    const yieldPct = parseFloat(String(info.dividendYield).replace('%', ''));
    if (!Number.isFinite(yieldPct) || yieldPct <= 0) continue;

    const positionValueSen = info.priceSen * h.quantity;
    const payoutSen = Math.round(positionValueSen * (yieldPct / 100));
    if (payoutSen > 0) {
      totalPayoutSen += payoutSen;
      newTxs.push({
        id: makeTxId('div'),
        type: 'DIVIDEND',
        stockId: h.stockId,
        ticker: info.ticker,
        name: info.name || info.ticker,
        quantity: h.quantity,
        unitPriceSen: info.priceSen,
        totalSen: payoutSen,
        realizedPnlSen: payoutSen,
        timestampIso: ts,
      });
    }
  }

  return {
    payoutSen: totalPayoutSen,
    cashSen: params.cashSen + totalPayoutSen,
    transactions: [...newTxs, ...params.transactions].slice(0, 100),
  };
}

export function createDefaultState(defaultWatchlistIds: string[]): PersistedSimulatorState {
  return {
    cashSen: INITIAL_CASH_SEN,
    holdings: [],
    watchlistIds: defaultWatchlistIds,
    transactions: [],
    userXP: 0,
    userLevel: 1,
    userProfile: '',
    hasLearnedTerm: [],
    completedLessons: [],
    language: 'ENG',
  };
}

export function loadPersistedState(defaultWatchlistIds: string[]): PersistedSimulatorState {
  const fallback = createDefaultState(defaultWatchlistIds);
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedSimulatorState>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;

    const cashSen =
      typeof parsed.cashSen === 'number' && Number.isSafeInteger(parsed.cashSen) && parsed.cashSen >= 0
        ? parsed.cashSen
        : fallback.cashSen;
    const userXP =
      typeof parsed.userXP === 'number' && Number.isFinite(parsed.userXP) && parsed.userXP >= 0
        ? Math.floor(parsed.userXP)
        : 0;
    const userLevel =
      typeof parsed.userLevel === 'number' && Number.isFinite(parsed.userLevel) && parsed.userLevel >= 1
        ? Math.floor(parsed.userLevel)
        : 1;

    const holdings: HoldingPosition[] = Array.isArray(parsed.holdings)
      ? parsed.holdings.filter(
          (h): h is HoldingPosition =>
            Boolean(h) &&
            typeof h === 'object' &&
            typeof h.stockId === 'string' &&
            h.stockId.length > 0 &&
            typeof h.quantity === 'number' &&
            Number.isFinite(h.quantity) &&
            h.quantity > 0 &&
            typeof h.avgPriceSen === 'number' &&
            Number.isFinite(h.avgPriceSen) &&
            h.avgPriceSen >= 0
        )
      : fallback.holdings;

    const watchlistIds = Array.isArray(parsed.watchlistIds)
      ? parsed.watchlistIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : fallback.watchlistIds;

    const transactions: TransactionRecord[] = Array.isArray(parsed.transactions)
      ? parsed.transactions
          .filter(
            (tx): tx is TransactionRecord =>
              Boolean(tx) &&
              typeof tx === 'object' &&
              typeof tx.id === 'string' &&
              (tx.type === 'BUY' || tx.type === 'SELL' || tx.type === 'DIVIDEND') &&
              typeof tx.stockId === 'string' &&
              typeof tx.ticker === 'string' &&
              typeof tx.name === 'string' &&
              typeof tx.quantity === 'number' &&
              Number.isFinite(tx.quantity) &&
              typeof tx.unitPriceSen === 'number' &&
              Number.isFinite(tx.unitPriceSen) &&
              typeof tx.totalSen === 'number' &&
              Number.isFinite(tx.totalSen) &&
              typeof tx.timestampIso === 'string'
          )
          .slice(0, 100)
      : fallback.transactions;

    const hasLearnedTerm = Array.isArray(parsed.hasLearnedTerm)
      ? parsed.hasLearnedTerm.filter((t): t is string => typeof t === 'string' && t.length > 0)
      : [];
    const completedLessons = Array.isArray(parsed.completedLessons)
      ? parsed.completedLessons.filter((l): l is string => typeof l === 'string' && l.length > 0)
      : [];

    return {
      cashSen,
      holdings,
      watchlistIds,
      transactions,
      userXP,
      userLevel,
      userProfile: typeof parsed.userProfile === 'string' ? parsed.userProfile.slice(0, 80) : '',
      hasLearnedTerm,
      completedLessons,
      language: parsed.language === 'BM' ? 'BM' : 'ENG',
    };
  } catch {
    return fallback;
  }
}

export function savePersistedState(state: PersistedSimulatorState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
