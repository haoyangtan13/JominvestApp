import { useState } from 'react';
import { Trash2, Plus, Search, TrendingUp, TrendingDown, Bookmark } from 'lucide-react';
import { StockData, stocks } from '../data/stocks';
import type { Screen } from '../App';

interface WatchlistPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  watchlist: StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (stockId: string) => void;
  setSelectedStock?: (stock: StockData) => void;
}

export function WatchlistPage({
  navigateTo,
  language,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
  setSelectedStock,
}: WatchlistPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const texts = {
    ENG: {
      title: 'My Watchlist',
      subtitle: 'Track your favorite Bursa Malaysia counters in one place',
      addStock: 'Quick Add to Watchlist',
      searchPlaceholder: 'Search Bursa ticker or company name to add...',
      emptyState: 'Your watchlist is empty. Search above to start tracking stocks!',
      noMatch: 'No matching unwatched stocks found.',
      addBtn: 'Add',
      remove: 'Remove',
    },
    BM: {
      title: 'Senarai Pantau Saya',
      subtitle: 'Pantau kaunter Bursa Malaysia kegemaran anda di satu tempat',
      addStock: 'Tambah Pantas ke Senarai Pantau',
      searchPlaceholder: 'Cari kod atau nama syarikat Bursa untuk ditambah...',
      emptyState: 'Senarai pantau anda kosong. Cari di atas untuk mula memantau saham!',
      noMatch: 'Tiada saham ditemui.',
      addBtn: 'Tambah',
      remove: 'Buang',
    },
  };

  const t = texts[language];

  const availableStocks = stocks.filter(
    (s) =>
      !watchlist.some((w) => w.id === s.id) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 84;
    const height = 28;
    const points = data
      .map((val, idx) => `${(idx / (data.length - 1)) * width},${height - ((val - min) / range) * (height - 4) - 2}`)
      .join(' ');

    return (
      <svg width={width} height={height} style={{ flexShrink: 0 }} aria-hidden="true">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="jomi-stack-lg">
      {/* Header */}
      <div className="jomi-stack-xs">
        <h2 className="jomi-display jomi-title-xl">{t.title}</h2>
        <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.subtitle}</p>
      </div>

      {/* Search & Quick Add Card */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <label htmlFor="watchlist-search" className="jomi-label" style={{ marginBottom: 0 }}>
          {t.addStock}
        </label>
        <div className="jomi-search-wrap">
          <Search className="jomi-search-icon" size={19} aria-hidden="true" />
          <input
            id="watchlist-search"
            type="text"
            placeholder={t.searchPlaceholder}
            className="jomi-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery && (
          <div className="jomi-stack-xs">
            {availableStocks.length > 0 ? (
              availableStocks.slice(0, 4).map((stock) => (
                <div key={stock.id} className="jomi-row" style={{ cursor: 'default' }}>
                  <div className="jomi-cluster">
                    <div className="jomi-ticker-badge">{stock.ticker.slice(0, 3)}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stock.name}</p>
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                        {stock.ticker} · RM {stock.price}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="jomi-btn jomi-btn-primary jomi-btn-sm"
                    onClick={() => {
                      addToWatchlist(stock);
                      setSearchQuery('');
                    }}
                  >
                    <Plus size={15} />
                    <span>{t.addBtn}</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="jomi-text-sm jomi-muted" style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 600 }}>
                {t.noMatch}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Watched Stocks Grid */}
      {watchlist.length === 0 ? (
        <div className="jomi-card jomi-card-pad jomi-stack-sm" style={{ textAlign: 'center', padding: '3rem 1.5rem', alignItems: 'center' }}>
          <div className="jomi-ticker-badge jomi-ticker-badge-lg">
            <Bookmark size={24} />
          </div>
          <p className="jomi-title-md">{t.emptyState}</p>
        </div>
      ) : (
        <div className="jomi-grid-2">
          {watchlist.map((stock) => (
            <div
              key={stock.id}
              className="jomi-card jomi-card-interactive jomi-card-pad jomi-between"
              onClick={() => {
                if (setSelectedStock) {
                  setSelectedStock(stock);
                  navigateTo('stock-details');
                }
              }}
            >
              <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                <div className="jomi-ticker-badge">{stock.ticker.slice(0, 3)}</div>
                <div style={{ minWidth: 0 }} className="jomi-stack-xs">
                  <div className="jomi-cluster">
                    <span className="jomi-display" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {stock.ticker}
                    </span>
                    <span className="jomi-pill-sector">{stock.sector}</span>
                  </div>
                  <p
                    className="jomi-text-xs jomi-muted"
                    style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {stock.name}
                  </p>
                </div>
              </div>

              <div className="jomi-cluster" style={{ flexWrap: 'nowrap', gap: '0.85rem' }}>
                {renderSparkline(stock.sparkline, stock.isPositive)}
                <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
                  <p className="jomi-display jomi-nums" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    RM {stock.price}
                  </p>
                  <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                    {stock.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {stock.changePercent}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={t.remove}
                  title={t.remove}
                  className="jomi-btn jomi-btn-outline jomi-btn-icon"
                  style={{ color: 'var(--jomi-coral-dark)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(stock.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
