import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
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
  'Consumer Products',
  'High Dividend'
] as const;

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
      investing: 'Investing',
      buyingPowerLabel: 'Buying power',
      buyingPowerTitle: 'Buying Power',
      stocksHeading: 'Stocks',
      searchPlaceholder: 'Search companies or ticker...',
      noResults: 'No stocks match your current filter.',
      holdingsHeading: 'Holdings',
      sharesUnit: 'shares',
      emptyHoldings: 'No stocks owned yet — click any stock to place a practice trade.',
      watchlistHeading: 'Watchlist',
      editWatchlist: 'Edit',
      noteHeading: "Today's Market Note",
      noteBody:
        'Tenaga Nasional and Gamuda are leading grid and data-centre infrastructure activity, while Maybank remains steady with Bank Negara holding OPR at 3.00%.',
      noteLinkFiling: 'Read 30-sec filing summary →',
      noteLinkIdeas: 'See starter ideas →'
    },
    BM: {
      investing: 'Pelaburan',
      buyingPowerLabel: 'Kuasa beli',
      buyingPowerTitle: 'Kuasa Beli',
      stocksHeading: 'Saham',
      searchPlaceholder: 'Cari nama syarikat atau simbol...',
      noResults: 'Tiada saham sepadan dengan tapisan semasa anda.',
      holdingsHeading: 'Pegangan',
      sharesUnit: 'unit',
      emptyHoldings: 'Tiada saham dimiliki — klik mana-mana saham untuk cuba beli.',
      watchlistHeading: 'Senarai Pantau',
      editWatchlist: 'Ubah',
      noteHeading: 'Nota Pasaran Hari Ini',
      noteBody:
        'Tenaga Nasional dan Gamuda mendahului aktiviti infrastruktur grid dan pusat data, manakala Maybank kekal stabil dengan OPR pada 3.00%.',
      noteLinkFiling: 'Baca ringkasan laporan 30-saat →',
      noteLinkIdeas: 'Lihat idea permulaan →'
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
    const height = 210;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const strokeColor = positive ? 'var(--signal-up)' : 'var(--signal-down)';

    const coords = series.map((val, idx) => {
      const x = (idx / Math.max(1, series.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 32) - 16;
      return { x, y };
    });

    const linePoints = coords.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
    const areaPath = `M 0,${height} L ${coords
      .map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
      .join(' L ')} L ${width},${height} Z`;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '210px' }}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="rhPortfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rhPortfolioFill)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.25"
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
    const width = 76;
    const height = 24;

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
          strokeWidth="1.75"
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
        <div className="rh-main space-y-8">
          {/* Unboxed Portfolio Header & Interactive Chart */}
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
              {t.investing}
            </div>
            <div className="rh-hero-num mt-1">
              RM {totalBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-sm font-medium">
              <span
                className="font-tabular"
                style={{ color: isGainPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
              >
                {isGainPositive ? '+' : ''}RM {totalGainRM.toFixed(2)} ({timeframe})
              </span>
              <span style={{ color: 'var(--ink-muted)' }}>·</span>
              <span style={{ color: 'var(--ink-secondary)' }}>
                {t.buyingPowerLabel}: RM{' '}
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

          {/* Buying Power Row */}
          <div
            onClick={() => navigateTo('portfolio')}
            className="flex items-center justify-between py-3 border-b cursor-pointer transition-colors"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span className="text-sm font-semibold">{t.buyingPowerTitle}</span>
            <div className="flex items-center gap-2 font-tabular text-sm font-semibold">
              <span>RM {cashBalance.toFixed(2)}</span>
              <ArrowRight size={14} style={{ color: 'var(--ink-muted)' }} />
            </div>
          </div>

          {/* Stocks Explorer Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{t.stocksHeading}</h2>
                {isSearchingOnDemand && (
                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--ink-muted)' }} />
                )}
              </div>

              <div className="relative sm:max-w-md w-full">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--ink-muted)' }}
                />
                <input
                  type="text"
                  className="jom-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Chips */}
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

            {/* Clean Stock Rows */}
            <div className="rh-stock-list">
              {screenerStocks.length > 0 ? (
                screenerStocks.map(stock => {
                  const avatar = getStockAvatarMeta(stock);
                  const history1W =
                    (stock.history as unknown as Record<string, number[]>)?.['1W'] ?? stock.sparkline;
                  return (
                    <div
                      key={stock.id}
                      className="rh-stock-row"
                      onClick={() => handleStockClick(stock)}
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

                      <div>{renderSparkline(history1W, stock.isPositive)}</div>

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
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                  {t.noResults}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Rail */}
        <aside className="rh-rail space-y-5">
          {/* Card 1: Holdings & Watchlist */}
          <div className="rh-card space-y-4">
            {/* Section A: Holdings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">{t.holdingsHeading}</h3>
              </div>

              {portfolio.length > 0 ? (
                <div className="space-y-2">
                  {portfolio.map(item => {
                    const avatar = getStockAvatarMeta(item.stock);
                    const positionVal = parseFloat(item.stock.price) * item.quantity;
                    return (
                      <div
                        key={item.stock.id}
                        onClick={() => handleStockClick(item.stock)}
                        className="flex items-center justify-between gap-2 py-1.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate">{item.stock.ticker}</div>
                            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                              {item.quantity} {t.sharesUnit}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-tabular text-xs font-semibold">
                          RM {positionVal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {t.emptyHoldings}
                </p>
              )}
            </div>

            <div className="rh-divider" />

            {/* Section B: Watchlist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">{t.watchlistHeading}</h3>
                <button
                  type="button"
                  onClick={() => navigateTo('watchlist')}
                  className="text-xs font-semibold cursor-pointer"
                  style={{ color: 'var(--accent-brand)' }}
                >
                  {t.editWatchlist}
                </button>
              </div>

              <div className="space-y-2">
                {watchlist.slice(0, 6).map(stock => {
                  const avatar = getStockAvatarMeta(stock);
                  return (
                    <div
                      key={stock.id}
                      onClick={() => handleStockClick(stock)}
                      className="flex items-center justify-between gap-2 py-1.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                        <div className="font-semibold text-xs truncate">{stock.ticker}</div>
                      </div>

                      <div>{renderSparkline(stock.sparkline, stock.isPositive)}</div>

                      <div className="text-right font-tabular">
                        <div className="text-xs font-semibold">RM {stock.price}</div>
                        <div
                          className="text-[11px] font-medium"
                          style={{
                            color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                          }}
                        >
                          {stock.changePercent}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Today's Market Note */}
          <div className="rh-card space-y-3">
            <h3 className="text-sm font-bold">{t.noteHeading}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.noteBody}
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigateTo('educational-hub')}
                className="text-left text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--accent-brand)' }}
              >
                {t.noteLinkFiling}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('ai-recommendation')}
                className="text-left text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--accent-brand)' }}
              >
                {t.noteLinkIdeas}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
