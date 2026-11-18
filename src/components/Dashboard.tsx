import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { Screen, PortfolioItem } from '../App';
import { StockData } from '../data/stocks';
import { searchBursaStocksOnDemand } from '../services/bursaService';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  userName: string;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  setSelectedStock: (stock: StockData) => void;
  portfolio: PortfolioItem[];
  cashBalance: number;
  watchlist: StockData[];
  userXP: number;
  userLevel: number;
  onRefreshMarket: () => void;
  isRefreshingMarket: boolean;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

const FILTER_CHIPS = [
  'All',
  'Shariah',
  'Financial Services',
  'Utilities',
  'Technology',
  'Construction',
  'High Dividend'
] as const;

export function Dashboard({
  navigateTo,
  language,
  stocks,
  setSelectedStock,
  portfolio,
  cashBalance,
  watchlist
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string>('All');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [onDemandResults, setOnDemandResults] = useState<StockData[]>([]);
  const [isSearchingOnDemand, setIsSearchingOnDemand] = useState(false);

  const texts = {
    ENG: {
      buyingPower: 'Buying power',
      stocksHeading: 'Malaysian Stocks',
      searchPlaceholder: 'Search ticker or company...',
      noResults: 'No stocks match your search.',
      positionsHeading: 'Positions',
      sharesUnit: 'shares',
      emptyHoldings: 'No open positions yet. Select a stock to place a practice order.',
      watchlistHeading: 'Watchlist',
      editWatchlist: 'Manage',
      colCompany: 'Company',
      colSector: 'Sector',
      colYield: 'Div Yield',
      colTrend: '7D',
      colPrice: 'Price',
      colChange: 'Today'
    },
    BM: {
      buyingPower: 'Kuasa beli',
      stocksHeading: 'Saham Malaysia',
      searchPlaceholder: 'Cari simbol atau syarikat...',
      noResults: 'Tiada saham sepadan dengan carian anda.',
      positionsHeading: 'Pegangan',
      sharesUnit: 'unit',
      emptyHoldings: 'Tiada pegangan dibuka. Pilih saham untuk cuba melabur.',
      watchlistHeading: 'Senarai Pantau',
      editWatchlist: 'Urus',
      colCompany: 'Syarikat',
      colSector: 'Sektor',
      colYield: 'Dividen',
      colTrend: '7H',
      colPrice: 'Harga',
      colChange: 'Hari Ini'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setOnDemandResults([]);
      setIsSearchingOnDemand(false);
      return;
    }

    let cancelled = false;
    setIsSearchingOnDemand(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchBursaStocksOnDemand(q, stocks);
        if (!cancelled) {
          setOnDemandResults(res);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingOnDemand(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, stocks]);

  const screenerStocks = useMemo(() => {
    let baseList = stocks;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      const localMatches = stocks.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q) ||
          s.bursaCode.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
      const mergedMap = new Map<string, StockData>();
      localMatches.forEach(s => mergedMap.set(s.bursaCode, s));
      onDemandResults.forEach(s => {
        if (!mergedMap.has(s.bursaCode)) {
          mergedMap.set(s.bursaCode, s);
        }
      });
      baseList = Array.from(mergedMap.values());
    }

    return baseList.filter(s => {
      if (activeChip === 'All') return true;
      if (activeChip === 'Shariah') return s.isShariah;
      if (activeChip === 'High Dividend') {
        const yieldVal = parseFloat(String(s.dividendYield).replace('%', '')) || 0;
        return yieldVal >= 4.0;
      }
      return s.sector.toLowerCase().includes(activeChip.toLowerCase());
    });
  }, [stocks, searchQuery, onDemandResults, activeChip]);

  const portfolioValue = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );

  const totalCostBasis = portfolio.reduce(
    (acc, item) => acc + item.averagePrice * item.quantity,
    0
  );
  const totalBalance = portfolioValue + cashBalance;
  const totalGainRM = portfolioValue - totalCostBasis;
  const isGainPositive = totalGainRM >= 0;

  const chartSeries = useMemo(() => {
    const base = totalBalance || 10000;
    const offsetsByTf: Record<Timeframe, number[]> = {
      '1D': [-18, -14, -9, -12, -4, 2, 6, 4, 11, 15, 12, 18],
      '1W': [-45, -32, -28, -15, -22, -8, 5, 14, 9, 24, 31, 38],
      '1M': [-120, -95, -110, -70, -45, -60, -25, 10, -5, 35, 62, 85],
      '3M': [-260, -210, -180, -220, -140, -95, -60, -15, 30, 75, 110, 145],
      '1Y': [-640, -520, -480, -390, -420, -290, -180, -90, 20, 140, 260, 380]
    };
    const deltas = offsetsByTf[timeframe];
    return deltas.map((d, idx) =>
      idx === deltas.length - 1 ? base : Number((base + d - deltas[deltas.length - 1]).toFixed(2))
    );
  }, [totalBalance, timeframe]);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const renderPortfolioChart = (series: number[], positive: boolean) => {
    const width = 720;
    const height = 190;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const strokeColor = positive ? 'var(--signal-up)' : 'var(--signal-down)';

    const coords = series.map((val, idx) => {
      const x = (idx / Math.max(1, series.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 28) - 14;
      return { x, y };
    });

    const linePoints = coords.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '190px' }}
        className="overflow-visible"
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderSparkline = (
    data: number[] | { date: string; price: number }[] | undefined,
    isPositive: boolean
  ) => {
    if (!data || data.length === 0) return null;
    const values = data.map(item => (typeof item === 'number' ? item : item.price));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const width = 68;
    const height = 22;

    const points = values
      .map((value, index) => {
        const x = (index / Math.max(1, values.length - 1)) * width;
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
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Main Column */}
        <div className="rh-main space-y-10">
          {/* Unboxed Portfolio Value & Chart */}
          <div>
            <div className="rh-hero-num">
              RM {totalBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span
                className="font-tabular font-medium"
                style={{ color: isGainPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
              >
                {isGainPositive ? '+' : ''}RM {totalGainRM.toFixed(2)} ({timeframe})
              </span>
              <span style={{ color: 'var(--ink-muted)' }}>·</span>
              <span className="font-tabular" style={{ color: 'var(--ink-secondary)' }}>
                {t.buyingPower} RM{' '}
                {cashBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-4">{renderPortfolioChart(chartSeries, isGainPositive)}</div>

            <div className="rh-timeframe-bar">
              {(['1D', '1W', '1M', '3M', '1Y'] as Timeframe[]).map(tf => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rh-tf-btn ${timeframe === tf ? 'active' : ''}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Market Directory Table */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{t.stocksHeading}</h2>
                {isSearchingOnDemand && (
                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--ink-muted)' }} />
                )}
              </div>

              <div className="relative sm:max-w-md w-full" style={{ maxWidth: '260px' }}>
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--ink-muted)' }}
                />
                <input
                  type="text"
                  className="jom-input"
                  style={{ paddingLeft: '2.1rem', paddingTop: '0.42rem', paddingBottom: '0.42rem', fontSize: '0.8125rem' }}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Underline Filter Tabs */}
            <div className="rh-chip-row">
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveChip(chip)}
                  className={`rh-chip ${activeChip === chip ? 'active' : ''}`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Clean Unboxed Table */}
            <div className="jom-table-wrap">
              {screenerStocks.length > 0 ? (
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>{t.colCompany}</th>
                      <th className="hidden sm:table-cell">{t.colSector}</th>
                      <th className="text-right hidden md:table-cell">{t.colYield}</th>
                      <th className="text-right hidden sm:table-cell">{t.colTrend}</th>
                      <th className="text-right">{t.colPrice}</th>
                      <th className="text-right">{t.colChange}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screenerStocks.map(stock => (
                      <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                        <td>
                          <div className="font-medium text-sm">{stock.ticker}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--ink-muted)', maxWidth: '240px' }}>
                            {stock.name}
                            {stock.isShariah ? ' · Shariah' : ''}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {stock.sector}
                        </td>
                        <td className="text-right font-tabular text-xs hidden md:table-cell" style={{ color: 'var(--ink-secondary)' }}>
                          {stock.dividendYield}
                        </td>
                        <td className="text-right hidden sm:table-cell">
                          {renderSparkline(stock.sparkline, stock.isPositive)}
                        </td>
                        <td className="text-right font-tabular font-medium text-sm">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-sm" style={{ color: 'var(--ink-muted)' }}>
                  {t.noResults}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Unboxed Rail */}
        <aside className="rh-rail space-y-8">
          {/* Positions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                {t.positionsHeading}
              </h3>
              {portfolio.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigateTo('portfolio')}
                  className="rh-link-btn"
                >
                  Portfolio
                </button>
              )}
            </div>

            {portfolio.length > 0 ? (
              <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                {portfolio.map(item => {
                  const positionVal = parseFloat(item.stock.price) * item.quantity;
                  return (
                    <div
                      key={item.stock.id}
                      onClick={() => handleStockClick(item.stock)}
                      className="flex items-center justify-between py-2.5 border-b cursor-pointer"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <div>
                        <div className="font-medium text-sm">{item.stock.ticker}</div>
                        <div className="text-xs font-tabular" style={{ color: 'var(--ink-muted)' }}>
                          {item.quantity} {t.sharesUnit}
                        </div>
                      </div>
                      <div className="text-right font-tabular">
                        <div className="text-sm font-medium">RM {positionVal.toFixed(2)}</div>
                        <div
                          className="text-xs"
                          style={{
                            color: item.stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                          }}
                        >
                          {item.stock.changePercent}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--ink-muted)' }}>
                {t.emptyHoldings}
              </p>
            )}
          </div>

          {/* Watchlist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                {t.watchlistHeading}
              </h3>
              <button
                type="button"
                onClick={() => navigateTo('watchlist')}
                className="rh-link-btn"
              >
                {t.editWatchlist}
              </button>
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              {watchlist.slice(0, 7).map(stock => (
                <div
                  key={stock.id}
                  onClick={() => handleStockClick(stock)}
                  className="flex items-center justify-between py-2.5 border-b cursor-pointer"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="font-medium text-sm">{stock.ticker}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--ink-muted)', maxWidth: '140px' }}>
                      {stock.sector}
                    </div>
                  </div>

                  <div className="text-right font-tabular">
                    <div className="text-sm font-medium">RM {stock.price}</div>
                    <div
                      className="text-xs"
                      style={{
                        color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                      }}
                    >
                      {stock.changePercent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
