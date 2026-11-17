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
      kicker: 'ACTIVE COVERAGE & PRICE MONITORING',
      title: 'Institutional Watchlist',
      back: '← Market Screener',
      addStockKicker: 'ADD BURSA MALAYSIA SECURITY TO COVERAGE',
      searchPlaceholder: 'Search ticker, company name, or .KL code to track (e.g. MAYBANK, 1155.KL, TENAGA)...',
      emptyState: 'Your watchlist coverage is currently empty. Use the search bar above to add Bursa Malaysia securities.',
      remove: 'Remove',
      add: 'Track Security',
      noStocksFound: 'No additional Bursa Malaysia securities found matching your query.',
      colSecurity: 'Security / Code',
      colSector: 'Sector',
      colCompliance: 'Compliance',
      colTrend: '7D Trend',
      colPrice: 'Last Price (RM)',
      colChange: '24h Change',
      colPe: 'P/E',
      colYield: 'Div Yield',
      colAction: 'Action'
    },
    BM: {
      kicker: 'LIPUTAN AKTIF & PEMANTAUAN HARGA',
      title: 'Senarai Pantau Institusi',
      back: '← Saringan Pasaran',
      addStockKicker: 'TAMBAH SEKURITI BURSA MALAYSIA KE LIPUTAN',
      searchPlaceholder: 'Cari simbol, nama syarikat, atau kod .KL untuk dipantau (cth: MAYBANK, 1155.KL)...',
      emptyState: 'Senarai pantau anda masih kosong. Gunakan carian di atas untuk menambah sekuriti Bursa Malaysia.',
      remove: 'Buang',
      add: 'Pantau',
      noStocksFound: 'Tiada sekuriti tambahan ditemui.',
      colSecurity: 'Sekuriti / Kod',
      colSector: 'Sektor',
      colCompliance: 'Pematuhan',
      colTrend: 'Trend 7H',
      colPrice: 'Harga Terakhir (RM)',
      colChange: 'Perubahan 24j',
      colPe: 'P/E',
      colYield: 'Hasil Div',
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
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-4xl" style={{ color: 'var(--ink-primary)' }}>
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="jom-tag font-tabular">
            {watchlist.length} {language === 'ENG' ? 'TRACKED' : 'DIPANTAU'}
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

      {/* Search & Add Security Panel */}
      <div className="jom-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="jom-kicker">{t.addStockKicker}</span>
          {isSearching && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <Loader2 size={13} className="animate-spin" />
              <span>Querying Bursa Malaysia (.KL)...</span>
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
                      {availableStocks.slice(0, 6).map(stock => (
                        <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                          <td>
                            <div className="font-semibold text-xs">
                              {stock.ticker}{' '}
                              <span className="font-tabular font-normal" style={{ color: 'var(--ink-muted)' }}>
                                · {stock.bursaCode}
                              </span>
                            </div>
                            <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                              {stock.name}
                            </div>
                          </td>
                          <td>
                            {stock.isShariah ? (
                              <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                            ) : (
                              <span className="jom-tag">CONVENTIONAL</span>
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
                      ))}
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

      {/* Watchlist Table */}
      <div className="jom-panel overflow-hidden">
        {watchlist.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="jom-kicker">NO ACTIVE COVERAGE</div>
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
                {watchlist.map(stock => (
                  <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                    <td>
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
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                        {stock.sector}
                      </span>
                    </td>
                    <td>
                      {stock.isShariah ? (
                        <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                      ) : (
                        <span className="jom-tag">CONVENTIONAL</span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
