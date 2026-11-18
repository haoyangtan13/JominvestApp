import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
      title: 'Watchlist',
      searchPlaceholder: 'Search ticker or company to add...',
      emptyState: 'Your watchlist is empty. Search above to follow Malaysian stocks.',
      remove: 'Remove',
      add: 'Follow',
      noStocksFound: 'No matching stocks found.'
    },
    BM: {
      title: 'Senarai Pantau',
      searchPlaceholder: 'Cari simbol atau syarikat untuk ditambah...',
      emptyState: 'Senarai pantau anda kosong. Cari di atas untuk memantau saham.',
      remove: 'Buang',
      add: 'Ikuti',
      noStocksFound: 'Tiada saham sepadan ditemui.'
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
    const width = 68;
    const height = 22;

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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="rh-page space-y-8">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">
          {t.title} ({watchlist.length})
        </h1>

        <div className="relative w-full sm:max-w-md" style={{ maxWidth: '300px' }}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--ink-muted)' }}
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="jom-input"
            style={{ paddingLeft: '2.1rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.8125rem' }}
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
      </div>

      {/* Search Results Dropdown List */}
      {searchQuery.trim() && (
        <div className="space-y-2">
          <div className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
            Search results
          </div>
          {availableStocks.length > 0 ? (
            <div className="jom-table-wrap">
              <table className="jom-table">
                <tbody>
                  {availableStocks.slice(0, 6).map(stock => (
                    <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                      <td>
                        <div className="font-medium text-sm">{stock.ticker}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {stock.name} · {stock.sector}
                        </div>
                      </td>
                      <td className="text-right font-tabular text-sm font-medium">
                        RM {stock.price}
                      </td>
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            addToWatchlist(stock);
                            setSearchQuery('');
                          }}
                          className="jom-btn text-xs py-1 px-2.5"
                        >
                          {t.add}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs py-2" style={{ color: 'var(--ink-muted)' }}>
              {isSearching ? 'Searching...' : t.noStocksFound}
            </p>
          )}
        </div>
      )}

      {/* Watchlist Table */}
      {watchlist.length === 0 ? (
        <p className="text-sm py-8 border-t" style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}>
          {t.emptyState}
        </p>
      ) : (
        <div className="jom-table-wrap">
          <table className="jom-table">
            <thead>
              <tr>
                <th>Company</th>
                <th className="hidden sm:table-cell">Sector</th>
                <th className="text-right hidden md:table-cell">P/E</th>
                <th className="text-right hidden md:table-cell">Div Yield</th>
                <th className="text-right hidden sm:table-cell">7D</th>
                <th className="text-right">Price</th>
                <th className="text-right">Today</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(stock => (
                <tr key={stock.id} onClick={() => handleRowClick(stock)}>
                  <td>
                    <div className="font-medium text-sm">{stock.ticker}</div>
                    <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {stock.name}
                      {stock.isShariah ? ' · Shariah' : ''}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-xs" style={{ color: 'var(--ink-secondary)' }}>
                    {stock.sector}
                  </td>
                  <td className="text-right font-tabular text-xs hidden md:table-cell" style={{ color: 'var(--ink-secondary)' }}>
                    {stock.peRatio}x
                  </td>
                  <td className="text-right font-tabular text-xs hidden md:table-cell" style={{ color: 'var(--ink-secondary)' }}>
                    {stock.dividendYield}
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    {renderSparkline(stock.sparkline, stock.isPositive)}
                  </td>
                  <td className="text-right font-tabular text-sm font-medium">
                    RM {stock.price}
                  </td>
                  <td
                    className="text-right font-tabular text-xs font-medium"
                    style={{
                      color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                    }}
                  >
                    {stock.changePercent}
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => removeFromWatchlist(stock.id)}
                      className="rh-link-btn"
                    >
                      {t.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
