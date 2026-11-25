import { stocks as baselineStocks, SNAPSHOT_DATE_MYT, type StockData } from '../data/stocks';

export interface LiveQuotePatch {
  klseCode: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  volume?: string;
  sparkline?: number[];
  history?: { date: string; price: number }[];
}

export interface MarketFeedResult {
  source: 'live' | 'cached';
  updatedAt: string;
  stocks: StockData[];
}

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env as Record<string, string | undefined>).VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location?.origin &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin)
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return '';
}

export function mergeLiveQuotes(base: StockData[], patches: LiveQuotePatch[]): StockData[] {
  const map = new Map(patches.map((p) => [p.klseCode.toUpperCase(), p]));
  return base.map((stock) => {
    const patch = map.get(stock.klseCode.toUpperCase());
    if (!patch) return stock;
    return {
      ...stock,
      price: patch.price || stock.price,
      change: patch.change || stock.change,
      changePercent: patch.changePercent || stock.changePercent,
      isPositive: typeof patch.isPositive === 'boolean' ? patch.isPositive : stock.isPositive,
      volume: patch.volume || stock.volume,
      sparkline: patch.sparkline && patch.sparkline.length >= 2 ? patch.sparkline : stock.sparkline,
      history: patch.history && patch.history.length >= 2 ? patch.history : stock.history,
    };
  });
}

export async function fetchBursaQuotes(
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch
): Promise<MarketFeedResult> {
  if (!apiBase) {
    return {
      source: 'cached',
      updatedAt: SNAPSHOT_DATE_MYT,
      stocks: baselineStocks,
    };
  }

  try {
    const res = await fetchImpl(`${apiBase}/api/stocks`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { quotes?: LiveQuotePatch[]; updatedAt?: string };
    if (!Array.isArray(data.quotes) || data.quotes.length === 0) {
      throw new Error('Empty quotes');
    }
    return {
      source: 'live',
      updatedAt: data.updatedAt || SNAPSHOT_DATE_MYT,
      stocks: mergeLiveQuotes(baselineStocks, data.quotes),
    };
  } catch {
    return {
      source: 'cached',
      updatedAt: SNAPSHOT_DATE_MYT,
      stocks: baselineStocks,
    };
  }
}
