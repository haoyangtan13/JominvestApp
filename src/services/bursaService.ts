import { StockData, stocks, generateHistory } from '../data/stocks';

const CACHE_KEY = 'jominvest_bursa_cache_v1';
const MARKET_HOURS_TTL_MS = 30 * 60 * 1000; // 30 minutes during Bursa trading hours
const OFF_HOURS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours outside trading hours

interface CachedStockEntry {
    stock: StockData;
    timestamp: number;
}

interface CacheStore {
    lastBatchSync: number;
    entries: Record<string, CachedStockEntry>;
}

/**
 * Checks if Bursa Malaysia (KLSE) is currently in active trading hours:
 * Monday - Friday, 09:00 - 12:30 and 14:30 - 17:00 MYT (UTC+8)
 */
export function isBursaMarketOpen(now: Date = new Date()): boolean {
    // Convert to MYT (UTC+8)
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const mytDate = new Date(utcMs + (8 * 3600000));

    const day = mytDate.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false;

    const minutesOfDay = mytDate.getHours() * 60 + mytDate.getMinutes();
    const morningOpen = 9 * 60;       // 09:00
    const morningClose = 12 * 60 + 30; // 12:30
    const afternoonOpen = 14 * 60 + 30; // 14:30
    const afternoonClose = 17 * 60;    // 17:00

    return (
        (minutesOfDay >= morningOpen && minutesOfDay <= morningClose) ||
        (minutesOfDay >= afternoonOpen && minutesOfDay <= afternoonClose)
    );
}

function getCacheStore(): CacheStore {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch {
        // Ignore storage errors
    }
    return { lastBatchSync: 0, entries: {} };
}

function saveCacheStore(store: CacheStore) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(store));
    } catch {
        // Ignore storage quota errors
    }
}

export function getEffectiveTTL(): number {
    return isBursaMarketOpen() ? MARKET_HOURS_TTL_MS : OFF_HOURS_TTL_MS;
}

/**
 * Loads all stocks, merging any fresh cached data over the baseline directory.
 */
export function getInitialStocks(): StockData[] {
    const store = getCacheStore();
    const baseStocks = stocks.map(s => {
        const cached = store.entries[s.bursaCode] || store.entries[s.ticker];
        return cached ? { ...s, ...cached.stock } : s;
    });

    // Also include any dynamically discovered Bursa stocks from user search
    const knownCodes = new Set(baseStocks.map(s => s.bursaCode));
    Object.values(store.entries).forEach(entry => {
        if (entry.stock && !knownCodes.has(entry.stock.bursaCode)) {
            baseStocks.push(entry.stock);
            knownCodes.add(entry.stock.bursaCode);
        }
    });

    return baseStocks;
}

/**
 * Fetches 1-month daily chart & quote for a single Bursa Malaysia (.KL) stock from Yahoo Finance
 * via the local Vite proxy (with 30-min cache & graceful offline fallback).
 */
export async function fetchBursaStockQuote(stock: StockData, forceRefresh: boolean = false): Promise<StockData> {
    const store = getCacheStore();
    const ttl = getEffectiveTTL();
    const cached = store.entries[stock.bursaCode];

    if (!forceRefresh && cached && (Date.now() - cached.timestamp < ttl)) {
        return { ...stock, ...cached.stock };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(
            `/api/yahoo/v8/finance/chart/${encodeURIComponent(stock.bursaCode)}?range=1mo&interval=1d`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) throw new Error('No chart result');

        const meta = result.meta;
        const timestamps: number[] = result.timestamp || [];
        const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];

        const history: { date: string; price: number }[] = [];
        for (let i = 0; i < timestamps.length; i++) {
            const closePrice = closes[i];
            if (closePrice !== null && closePrice !== undefined && !isNaN(closePrice)) {
                const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
                history.push({
                    date: dateStr,
                    price: parseFloat(closePrice.toFixed(2))
                });
            }
        }

        const regularPrice = meta.regularMarketPrice ?? (history.length > 0 ? history[history.length - 1].price : parseFloat(stock.price));
        const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? (history.length > 1 ? history[history.length - 2].price : regularPrice);
        const diff = regularPrice - prevClose;
        const diffPct = prevClose > 0 ? (diff / prevClose) * 100 : 0;
        const isPos = diff >= 0;

        const updatedStock: StockData = {
            ...stock,
            price: regularPrice.toFixed(2),
            change: `${isPos ? '+' : ''}${diff.toFixed(2)}`,
            changePercent: `${isPos ? '+' : ''}${diffPct.toFixed(2)}%`,
            isPositive: isPos,
            history: history.length >= 5 ? history : stock.history,
            sparkline: history.length >= 7 ? history.slice(-7).map(h => h.price) : stock.sparkline,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        store.entries[stock.bursaCode] = {
            stock: updatedStock,
            timestamp: Date.now()
        };
        saveCacheStore(store);

        return updatedStock;
    } catch {
        // Fallback: keep existing or cached data and mark last checked time
        const fallbackStock: StockData = {
            ...stock,
            lastUpdated: cached?.stock?.lastUpdated || 'Delayed 15m'
        };
        return fallbackStock;
    }
}

/**
 * Searches for any Bursa Malaysia (.KL) ticker on demand when a user types a query
 * not already in the local directory.
 */
export async function searchBursaStocksOnDemand(query: string, existingStocks: StockData[]): Promise<StockData[]> {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) return [];

    // First match local directory
    const lower = cleanQuery.toLowerCase();
    const localMatches = existingStocks.filter(
        s =>
            s.name.toLowerCase().includes(lower) ||
            s.ticker.toLowerCase().includes(lower) ||
            s.bursaCode.toLowerCase().includes(lower) ||
            s.sector.toLowerCase().includes(lower)
    );

    if (localMatches.length > 0) {
        return localMatches;
    }

    // Try Yahoo Finance search filtered to Kuala Lumpur (.KL)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(
            `/api/yahoo/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&quotesCount=6&newsCount=0`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return [];
        const data = await res.json();
        const klQuotes = (data?.quotes || []).filter(
            (q: any) => typeof q.symbol === 'string' && q.symbol.endsWith('.KL')
        );

        const discovered: StockData[] = [];
        for (const q of klQuotes.slice(0, 3)) {
            const symbol: string = q.symbol;
            const ticker = (q.shortname || symbol.replace('.KL', '')).split(' ')[0].toUpperCase();
            const dummyBase: StockData = {
                id: `kl-${symbol}`,
                name: q.longname || q.shortname || ticker,
                ticker,
                bursaCode: symbol,
                price: '1.50',
                change: '+0.01',
                changePercent: '+0.67%',
                isPositive: true,
                isShariah: true,
                description: `${q.longname || ticker} is a public listed company traded on Bursa Malaysia (${symbol}).`,
                sector: q.sector || 'Bursa Malaysia Listed',
                peRatio: '15.00',
                dividendYield: '3.20%',
                marketCap: '2.5B',
                volume: '1.2M',
                revenue: '1.1B',
                netProfit: '0.15B',
                debtEquity: '0.35',
                sparkline: [1.45, 1.46, 1.47, 1.48, 1.49, 1.49, 1.50],
                history: generateHistory('1.50', 30, symbol),
                radarScores: { value: 70, growth: 70, health: 75, dividend: 68, momentum: 72 }
            };
            const hydrated = await fetchBursaStockQuote(dummyBase);
            discovered.push(hydrated);
        }

        return discovered;
    } catch {
        return [];
    }
}
