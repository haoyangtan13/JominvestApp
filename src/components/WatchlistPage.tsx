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
      kicker: 'Stocks You Follow',
      title: 'Saved Stocks Watchlist',
      back: 'Back to Home & Markets',
      addStockKicker: 'Find & Save a Bursa Malaysia Stock',
      searchPlaceholder: 'Search by company name, ticker, or .KL code to save (e.g. Maybank, 1155.KL, Tenaga)...',
      emptyTitle: 'Your watchlist is empty',
      emptyState: 'Use the search bar above to save Bursa Malaysia companies you want to keep an eye on.',
      remove: 'Remove',
      add: 'Save Stock',
      noStocksFound: 'No matching Bursa Malaysia stocks found.',
      colSecurity: 'Company',
      colSector: 'Sector',
      colCompliance: 'Shariah Status',
      colTrend: '7D Trend',
      colPrice: 'Price (RM)',
      colChange: 'Today',
      colPe: 'P/E Ratio',
      colYield: 'Dividend Yield',
      colAction: 'Action'
    },
    BM: {
      kicker: 'Saham Pilihan Anda',
      title: 'Senarai Pantau Saham Disimpan',
      back: 'Kembali ke Utama & Pasaran',
      addStockKicker: 'Cari & Simpan Saham Bursa Malaysia',
      searchPlaceholder: 'Cari nama syarikat, simbol, atau kod .KL untuk disimpan (cth: Maybank, 1155.KL)...',
      emptyTitle: 'Senarai pantau anda masih kosong',
      emptyState: 'Gunakan bar carian di atas untuk menyimpan syarikat Bursa Malaysia yang ingin anda pantau.',
      remove: 'Buang',
      add: 'Simpan Saham',
      noStocksFound: 'Tiada saham tambahan ditemui.',
      colSecurity: 'Syarikat',
      colSector: 'Sektor',
      colCompliance: 'Status Syariah',
      colTrend: 'Trend 7H',
      colPrice: 'Harga (RM)',
      colChange: 'Hari Ini',
      colPe: 'Nisbah P/E',
      colYield: 'Hasil Dividen',
      colAction: 'Tindakan'
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
    <div className="jom-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-3xl sm:text-4xl" style={{ color: 'var(--ink-primary)' }}>
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="jom-tag jom-tag-shariah font-tabular">
            {watchlist.length} {language === 'ENG' ? 'Saved' : 'Disimpan'}
          </span>
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="jom-btn text-xs"
          >
            <ArrowLeft size={14} />
            <span>{t.back}</span>
          </button>
        </div>
      </div>

      {/* Search & Save Stock Panel */}
      <div className="jom-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="jom-kicker">{t.addStockKicker}</span>
          {isSearching && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <Loader2 size={13} className="animate-spin" />
              <span>Searching Bursa Malaysia...</span>
            </span>
          )}
        </div>

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
        </div>

        {searchQuery.trim() && (
          <div className="pt-2">
            {availableStocks.length > 0 ? (
              <div className="jom-panel-subtle overflow-hidden">
                <div className="jom-table-wrap">
                  <table className="jom-table">
                    <tbody>
                      {availableStocks.slice(0, 6).map(stock => {
                        const avatar = getStockAvatarMeta(stock);
                        return (
                          <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                                <div>
                                  <div className="font-semibold text-xs">
                                    {stock.ticker}{' '}
                                    <span className="font-tabular font-normal" style={{ color: 'var(--ink-muted)' }}>
                                      · {stock.bursaCode}
                                    </span>
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                                    {stock.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {stock.isShariah ? (
                                <span className="jom-tag jom-tag-shariah">Shariah Compliant</span>
                              ) : (
                                <span className="jom-tag">Conventional</span>
                              )}
                            </td>
                            <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                              RM {stock.price}
                            </td>
                            <td style={{ textAlign: 'right' }}>
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs py-3" style={{ color: 'var(--ink-muted)' }}>
                {isSearching ? 'Searching Bursa Malaysia (.KL)...' : t.noStocksFound}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Saved Stocks Watchlist Table */}
      <div className="jom-panel overflow-hidden">
        {watchlist.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="font-editorial text-xl" style={{ color: 'var(--ink-primary)' }}>{t.emptyTitle}</div>
            <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
              {t.emptyState}
            </p>
          </div>
        ) : (
          <div className="jom-table-wrap">
            <table className="jom-table">
              <thead>
                <tr>
                  <th>{t.colSecurity}</th>
                  <th>{t.colSector}</th>
                  <th>{t.colCompliance}</th>
                  <th>{t.colTrend}</th>
                  <th style={{ textAlign: 'right' }}>{t.colPrice}</th>
                  <th style={{ textAlign: 'right' }}>{t.colChange}</th>
                  <th style={{ textAlign: 'right' }}>{t.colPe}</th>
                  <th style={{ textAlign: 'right' }}>{t.colYield}</th>
                  <th style={{ textAlign: 'right' }}>{t.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map(stock => {
                  const avatar = getStockAvatarMeta(stock);
                  return (
                    <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                              {stock.ticker}{' '}
                              <span
                                className="font-tabular text-xs font-normal"
                                style={{ color: 'var(--ink-muted)' }}
                              >
                                · {stock.bursaCode}
                              </span>
                            </div>
                            <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {stock.sector}
                        </span>
                      </td>
                      <td>
                        {stock.isShariah ? (
                          <span className="jom-tag jom-tag-shariah">Shariah Compliant</span>
                        ) : (
                          <span className="jom-tag">Conventional</span>
                        )}
                      </td>
                      <td>{renderSparkline(stock.sparkline, stock.isPositive)}</td>
                      <td className="font-tabular font-semibold" style={{ textAlign: 'right' }}>
                        {stock.price}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className={`jom-tag font-tabular ${
                            stock.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                          }`}
                        >
                          {stock.changePercent}
                        </span>
                      </td>
                      <td
                        className="font-tabular text-xs"
                        style={{ textAlign: 'right', color: 'var(--ink-secondary)' }}
                      >
                        {stock.peRatio}
                      </td>
                      <td
                        className="font-tabular text-xs font-medium"
                        style={{ textAlign: 'right', color: 'var(--ink-primary)' }}
                      >
                        {stock.dividendYield}
                      </td>
                      <td style={{ textAlign: 'right' }}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

