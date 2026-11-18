import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { StockData } from '../data/stocks';
import { Screen } from '../App';
import { searchBursaStocksOnDemand } from '../services/bursaService';

interface WatchlistPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  watchlist: StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (stockId: string) => void;
  setSelectedStock: (stock: StockData) => void;
}

const AVATAR_COLORS = [
  'jom-avatar-emerald',
  'jom-avatar-blue',
  'jom-avatar-amber',
  'jom-avatar-indigo',
  'jom-avatar-teal',
  'jom-avatar-rose'
] as const;

function getStockAvatarMeta(stock: { ticker: string; sector?: string }) {
  const t = (stock.ticker || 'KL').toUpperCase();
  const specificMap: Record<string, { initials: string; colorClass: string }> = {
    MAYBANK: { initials: 'MB', colorClass: 'jom-avatar-amber' },
    TENAGA: { initials: 'TN', colorClass: 'jom-avatar-blue' },
    CIMB: { initials: 'CB', colorClass: 'jom-avatar-rose' },
    PBBANK: { initials: 'PB', colorClass: 'jom-avatar-indigo' },
    GAMUDA: { initials: 'GM', colorClass: 'jom-avatar-emerald' },
    INARI: { initials: 'IN', colorClass: 'jom-avatar-teal' },
    PETGAS: { initials: 'PG', colorClass: 'jom-avatar-teal' },
    YTLPOWR: { initials: 'YP', colorClass: 'jom-avatar-blue' },
    SUNWAY: { initials: 'SW', colorClass: 'jom-avatar-amber' },
    MISC: { initials: 'MS', colorClass: 'jom-avatar-indigo' },
    TM: { initials: 'TM', colorClass: 'jom-avatar-blue' },
    IHH: { initials: 'IH', colorClass: 'jom-avatar-emerald' },
    CELCOMDIGI: { initials: 'CD', colorClass: 'jom-avatar-indigo' },
    PRESSBHD: { initials: 'PM', colorClass: 'jom-avatar-teal' },
    SDCG: { initials: 'SD', colorClass: 'jom-avatar-emerald' }
  };

  if (specificMap[t]) {
    return specificMap[t];
  }

  const initials = t.replace(/[^A-Z]/g, '').slice(0, 2) || 'KL';
  const sectorLower = (stock.sector || '').toLowerCase();
  if (sectorLower.includes('bank') || sectorLower.includes('financ')) {
    return { initials, colorClass: 'jom-avatar-amber' };
  }
  if (sectorLower.includes('util') || sectorLower.includes('energy') || sectorLower.includes('power')) {
    return { initials, colorClass: 'jom-avatar-blue' };
  }
  if (sectorLower.includes('construct') || sectorLower.includes('prop') || sectorLower.includes('plant')) {
    return { initials, colorClass: 'jom-avatar-emerald' };
  }
  if (sectorLower.includes('tech') || sectorLower.includes('semi')) {
    return { initials, colorClass: 'jom-avatar-teal' };
  }
  if (sectorLower.includes('health') || sectorLower.includes('consumer')) {
    return { initials, colorClass: 'jom-avatar-rose' };
  }

  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = t.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { initials, colorClass };
}

export function WatchlistPage({
  navigateTo,
  language,
  stocks,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
  setSelectedStock
}: WatchlistPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onDemandResults, setOnDemandResults] = useState<StockData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const texts = {
    ENG: {
      title: 'Watchlist',
      back: 'Back to Invest',
      searchPlaceholder: 'Search companies or ticker to add (e.g. Maybank, Tenaga)...',
      emptyTitle: 'Your watchlist is empty',
      emptyState: 'Use the search bar above to follow companies you want to keep an eye on.',
      remove: 'Remove',
      add: 'Follow',
      noStocksFound: 'No matching stocks found.'
    },
    BM: {
      title: 'Senarai Pantau',
      back: 'Kembali ke Pelaburan',
      searchPlaceholder: 'Cari syarikat atau simbol untuk ditambah (cth: Maybank, Tenaga)...',
      emptyTitle: 'Senarai pantau anda kosong',
      emptyState: 'Gunakan bar carian di atas untuk menyimpan syarikat yang ingin anda pantau.',
      remove: 'Buang',
      add: 'Ikuti',
      noStocksFound: 'Tiada saham tambahan ditemui.'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setOnDemandResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const discovered = await searchBursaStocksOnDemand(q, stocks);
        if (!cancelled) {
          setOnDemandResults(discovered);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, stocks]);

  const availableStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const localMatches = stocks.filter(
      s =>
        !watchlist.some(w => w.id === s.id || w.bursaCode === s.bursaCode) &&
        (s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q) ||
          s.bursaCode.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q))
    );

    const map = new Map<string, StockData>();
    localMatches.forEach(s => map.set(s.bursaCode, s));
    onDemandResults.forEach(s => {
      const alreadyWatched = watchlist.some(
        w => w.id === s.id || w.bursaCode === s.bursaCode
      );
      if (!alreadyWatched && !map.has(s.bursaCode)) {
        map.set(s.bursaCode, s);
      }
    });

    return Array.from(map.values());
  }, [searchQuery, stocks, watchlist, onDemandResults]);

  const handleRowClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 76;
    const height = 24;

    const points = data
      .map((value, index) => {
        const x = (index / Math.max(1, data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="inline-block overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? 'var(--signal-up)' : 'var(--signal-down)'}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="rh-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          {t.title}
        </h1>
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="jom-btn text-xs"
        >
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </button>
      </div>

      {/* Search & Add Box */}
      <div className="rh-card space-y-4">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--ink-muted)' }}
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="jom-input"
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2
              size={14}
              className="animate-spin absolute top-1/2 -translate-y-1/2"
              style={{ right: '0.75rem', color: 'var(--ink-muted)' }}
            />
          )}
        </div>

        {searchQuery.trim() && (
          <div>
            {availableStocks.length > 0 ? (
              <div className="rh-stock-list">
                {availableStocks.slice(0, 6).map(stock => {
                  const avatar = getStockAvatarMeta(stock);
                  return (
                    <div
                      key={stock.id}
                      className="rh-stock-row"
                      onClick={() => handleRowClick(stock)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{stock.name}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                            {stock.ticker} · {stock.sector}
                            {stock.isShariah ? ' · Shariah' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-tabular text-sm font-semibold">RM {stock.price}</span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            addToWatchlist(stock);
                            setSearchQuery('');
                          }}
                          className="jom-btn jom-btn-primary text-xs py-1 px-3"
                        >
                          <Plus size={13} />
                          <span>{t.add}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--ink-muted)' }}>
                {isSearching ? 'Searching...' : t.noStocksFound}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Saved Watchlist Rows */}
      {watchlist.length === 0 ? (
        <div className="rh-card p-8 text-center space-y-2">
          <div className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
            {t.emptyTitle}
          </div>
          <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
            {t.emptyState}
          </p>
        </div>
      ) : (
        <div className="rh-stock-list">
          {watchlist.map(stock => {
            const avatar = getStockAvatarMeta(stock);
            return (
              <div
                key={stock.id}
                className="rh-stock-row"
                onClick={() => handleRowClick(stock)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{stock.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                      {stock.ticker} · {stock.sector}
                      {stock.isShariah ? ' · Shariah' : ''}
                    </div>
                  </div>
                </div>

                <div>{renderSparkline(stock.sparkline, stock.isPositive)}</div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-tabular">
                    <div className="font-semibold text-sm">RM {stock.price}</div>
                    <div
                      className="text-xs font-medium"
                      style={{
                        color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                      }}
                    >
                      {stock.changePercent}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      removeFromWatchlist(stock.id);
                    }}
                    className="jom-btn text-xs py-1 px-2.5"
                    title={t.remove}
                  >
                    <Trash2 size={13} />
                    <span>{t.remove}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
