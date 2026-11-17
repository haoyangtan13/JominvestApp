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

export function Dashboard({
  navigateTo,
  userProfile,
  userName,
  language,
  stocks,
  setSelectedStock,
  portfolio,
  cashBalance,
  watchlist
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [moverTab, setMoverTab] = useState<'gainers' | 'decliners'>('gainers');
  const [onDemandResults, setOnDemandResults] = useState<StockData[]>([]);
  const [isSearchingOnDemand, setIsSearchingOnDemand] = useState(false);

  const firstName = (userName || 'Analyst').trim().split(' ')[0];

  const texts = {
    ENG: {
      kicker: 'PORTFOLIO & MARKET OVERVIEW',
      greeting: `Good day, ${firstName}.`,
      mandateLabel: 'ACTIVE MANDATE',
      openLedger: 'Portfolio Ledger →',
      netLiquidity: 'Net Account Liquidity',
      investedEquity: 'Invested Equity',
      buyingPower: 'Available Buying Power',
      projDividend: 'Projected Annual Dividend',
      positionsCount: 'positions',
      unallocatedCash: 'Ready for board-lot execution',
      estYieldBasis: 'Based on trailing KLSE yields',
      convictionKicker: 'RESEARCH DESK · MANDATE SELECTION',
      convictionTitle: 'Analyst Conviction List',
      readThesis: 'Read Thesis →',
      screenerKicker: 'KLSE DIRECTORY & FUNDAMENTAL FILTER',
      screenerTitle: 'Bursa Malaysia Institutional Screener',
      searchPlaceholder: 'Filter by ticker, company name, or Bursa code (e.g. MAYBANK, 1155.KL, TENAGA)...',
      allSecurities: 'All Securities',
      shariahOnlyLabel: 'SAC Shariah Only',
      allSectors: 'All Sectors',
      colSecurity: 'Security / Code',
      colSector: 'Sector',
      colCompliance: 'Compliance',
      colTrend: '7D Trend',
      colPrice: 'Last Price (RM)',
      colChange: '24h Change',
      colPe: 'P/E',
      colYield: 'Div Yield',
      noResults: 'No Bursa Malaysia securities match the active screening criteria.',
      breadthKicker: 'SESSION TELEMETRY',
      breadthTitle: 'Market Breadth — Top Movers',
      topGainers: 'Top Gainers',
      topDecliners: 'Top Decliners',
      watchlistKicker: 'MONITORED SECURITIES',
      watchlistTitle: 'Watchlist Coverage',
      manageWatchlist: 'Manage Watchlist →'
    },
    BM: {
      kicker: 'GAMBARAN KESELURUHAN PORTFOLIO & PASARAN',
      greeting: `Selamat sejahtera, ${firstName}.`,
      mandateLabel: 'MANDAT AKTIF',
      openLedger: 'Lejar Portfolio →',
      netLiquidity: 'Kecairan Bersih Akaun',
      investedEquity: 'Ekuiti Dilaburkan',
      buyingPower: 'Kuasa Beli Tersedia',
      projDividend: 'Unjuran Dividen Tahunan',
      positionsCount: 'pegangan',
      unallocatedCash: 'Sedia untuk pelaksanaan lot papan',
      estYieldBasis: 'Berdasarkan hasil dividen semasa KLSE',
      convictionKicker: 'MEJA PENYELIDIKAN · PILIHAN MANDAT',
      convictionTitle: 'Senarai Konviksi Penganalisis',
      readThesis: 'Baca Tesis →',
      screenerKicker: 'DIREKTORI KLSE & SARINGAN ASAS',
      screenerTitle: 'Saringan Institusi Bursa Malaysia',
      searchPlaceholder: 'Cari simbol, nama syarikat, atau kod Bursa (cth: MAYBANK, 1155.KL, TENAGA)...',
      allSecurities: 'Semua Sekuriti',
      shariahOnlyLabel: 'Patuh Syariah MPS Sahaja',
      allSectors: 'Semua Sektor',
      colSecurity: 'Sekuriti / Kod',
      colSector: 'Sektor',
      colCompliance: 'Pematuhan',
      colTrend: 'Trend 7H',
      colPrice: 'Harga Terakhir (RM)',
      colChange: 'Perubahan 24j',
      colPe: 'P/E',
      colYield: 'Hasil Div',
      noResults: 'Tiada sekuriti Bursa Malaysia sepadan dengan kriteria saringan aktif.',
      breadthKicker: 'TELEMETRI SESI',
      breadthTitle: 'Keluasan Pasaran — Penggerak Utama',
      topGainers: 'Penaik Teratas',
      topDecliners: 'Penurun Teratas',
      watchlistKicker: 'SEKURITI DIPANTAU',
      watchlistTitle: 'Liputan Senarai Pantau',
      manageWatchlist: 'Urus Senarai Pantau →'
    }
  };

  const t = texts[language];

  // Live on-demand search for any .KL stock when user types a query
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

  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach(s => {
      if (s.sector) set.add(s.sector);
    });
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

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
      if (shariahOnly && !s.isShariah) return false;
      if (selectedSector !== 'ALL' && s.sector !== selectedSector) return false;
      return true;
    });
  }, [stocks, searchQuery, onDemandResults, shariahOnly, selectedSector]);

  // Top 3 Profile-Matched Picks
  const topPicks = useMemo(() => {
    const profileLower = (userProfile || '').toLowerCase();
    let targetTickers: string[];

    if (profileLower.includes('conservative') || profileLower.includes('protector')) {
      targetTickers = ['MAYBANK', 'PBBANK', 'TENAGA'];
    } else if (profileLower.includes('moderate') || profileLower.includes('builder')) {
      targetTickers = ['CIMB', 'MISC', 'TM'];
    } else {
      targetTickers = ['GAMUDA', 'YTLPOWR', 'SUNWAY'];
    }

    const matched = targetTickers
      .map(ticker => stocks.find(s => s.ticker === ticker))
      .filter((s): s is StockData => Boolean(s));

    return (matched.length >= 3 ? matched : stocks).slice(0, 3);
  }, [userProfile, stocks]);

  const topGainers = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
        .slice(0, 5),
    [stocks]
  );

  const topDecliners = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent))
        .slice(0, 5),
    [stocks]
  );

  const portfolioValue = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );

  const estAnnualDividend = portfolio.reduce((sum, item) => {
    const yieldPct = parseFloat(String(item.stock.dividendYield).replace('%', '')) || 0;
    const positionVal = parseFloat(item.stock.price) * item.quantity;
    return sum + (positionVal * yieldPct) / 100;
  }, 0);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const handleThesisClick = (stock: StockData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStock(stock);
    navigateTo('ai-recommendation');
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
            {t.greeting}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="jom-kicker">{t.mandateLabel}:</span>
          <span className="jom-tag">{userProfile || 'Jom-Explorer (Aggressive)'}</span>
          <button
            type="button"
            onClick={() => navigateTo('portfolio')}
            className="jom-btn text-xs"
          >
            {t.openLedger}
          </button>
        </div>
      </div>

      {/* 4-Cell Account Ledger Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.netLiquidity}</div>
          <div className="font-tabular text-2xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
            RM {(portfolioValue + cashBalance).toFixed(2)}
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            MYR · KLSE Practice Desk
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.investedEquity}</div>
          <div className="font-tabular text-2xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
            RM {portfolioValue.toFixed(2)}
          </div>
          <div className="text-xs font-tabular" style={{ color: 'var(--ink-muted)' }}>
            {portfolio.length} {t.positionsCount}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.buyingPower}</div>
          <div className="font-tabular text-2xl font-semibold" style={{ color: 'var(--signal-up)' }}>
            RM {cashBalance.toFixed(2)}
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {t.unallocatedCash}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.projDividend}</div>
          <div className="font-tabular text-2xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
            RM {estAnnualDividend.toFixed(2)}/yr
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {t.estYieldBasis}
          </div>
        </div>
      </div>

      {/* Analyst Conviction List (Top 3 Profile-Matched Picks) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="jom-kicker">{t.convictionKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.convictionTitle}</h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('ai-recommendation')}
            className="jom-btn text-xs"
          >
            <span>{t.readThesis}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {topPicks.map(stock => (
            <div
              key={stock.id}
              onClick={() => handleStockClick(stock)}
              className="jom-panel p-5 flex flex-col justify-between gap-5 cursor-pointer transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-tabular text-sm font-semibold">{stock.ticker}</span>
                      <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {stock.bursaCode}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5 line-clamp-1"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {stock.name}
                    </p>
                  </div>
                  {stock.isShariah ? (
                    <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                  ) : (
                    <span className="jom-tag">CONVENTIONAL</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="font-tabular text-2xl font-semibold">RM {stock.price}</div>
                    <span
                      className={`jom-tag mt-1 ${
                        stock.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                      }`}
                    >
                      {stock.changePercent}
                    </span>
                  </div>
                  <div>{renderSparkline(stock.sparkline, stock.isPositive)}</div>
                </div>
              </div>

              <div
                className="pt-3 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <span className="font-tabular" style={{ color: 'var(--ink-muted)' }}>
                  P/E {stock.peRatio} · Yield {stock.dividendYield}
                </span>
                <button
                  type="button"
                  onClick={e => handleThesisClick(stock, e)}
                  className="font-semibold flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--accent-brand)' }}
                >
                  <span>{t.readThesis}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bursa Malaysia Institutional Screener Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="jom-kicker">{t.screenerKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.screenerTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isSearchingOnDemand && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Querying KLSE feed...</span>
              </span>
            )}
            <span className="jom-tag font-tabular">{screenerStocks.length} SECURITIES</span>
          </div>
        </div>

        <div className="jom-panel overflow-hidden">
          {/* Top Filter Bar */}
          <div
            className="p-4 border-b flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="relative flex-1">
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

            <div className="flex flex-wrap items-center gap-3">
              {/* Segmented Shariah Toggle */}
              <div className="jom-segmented">
                <button
                  type="button"
                  onClick={() => setShariahOnly(false)}
                  className={!shariahOnly ? 'active' : ''}
                >
                  {t.allSecurities}
                </button>
                <button
                  type="button"
                  onClick={() => setShariahOnly(true)}
                  className={shariahOnly ? 'active' : ''}
                >
                  {t.shariahOnlyLabel}
                </button>
              </div>

              {/* Sector Select */}
              <select
                aria-label="Filter by sector"
                className="jom-input"
                style={{ width: 'auto', minWidth: '170px' }}
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector === 'ALL' ? t.allSectors : sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Institutional Screener Data Table */}
          <div className="jom-table-wrap">
            {screenerStocks.length > 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {screenerStocks.map(stock => (
                    <tr key={stock.id} onClick={() => handleStockClick(stock)}>
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
                        <div className="text-xs truncate max-w-xs" style={{ color: 'var(--ink-secondary)' }}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
                {t.noResults}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom 2-Column Market Breadth & Watchlist Preview */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Left: Top Gainers & Top Decliners */}
        <div className="jom-panel overflow-hidden flex flex-col justify-between">
          <div>
            <div
              className="p-5 border-b flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">{t.breadthKicker}</div>
                <h3 className="font-editorial text-2xl mt-0.5">{t.breadthTitle}</h3>
              </div>
              <div className="jom-segmented">
                <button
                  type="button"
                  onClick={() => setMoverTab('gainers')}
                  className={moverTab === 'gainers' ? 'active' : ''}
                >
                  {t.topGainers}
                </button>
                <button
                  type="button"
                  onClick={() => setMoverTab('decliners')}
                  className={moverTab === 'decliners' ? 'active' : ''}
                >
                  {t.topDecliners}
                </button>
              </div>
            </div>

            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>{t.colSecurity}</th>
                    <th>{t.colCompliance}</th>
                    <th style={{ textAlign: 'right' }}>{t.colPrice}</th>
                    <th style={{ textAlign: 'right' }}>{t.colChange}</th>
                  </tr>
                </thead>
                <tbody>
                  {(moverTab === 'gainers' ? topGainers : topDecliners).map(stock => (
                    <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                      <td>
                        <div className="font-semibold text-xs">{stock.ticker}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {stock.bursaCode}
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
                        <span
                          className={`jom-tag font-tabular ${
                            stock.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                          }`}
                        >
                          {stock.changePercent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Watchlist Coverage Preview */}
        <div className="jom-panel overflow-hidden flex flex-col justify-between">
          <div>
            <div
              className="p-5 border-b flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">{t.watchlistKicker}</div>
                <h3 className="font-editorial text-2xl mt-0.5">{t.watchlistTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('watchlist')}
                className="jom-btn text-xs"
              >
                <span>{t.manageWatchlist}</span>
              </button>
            </div>

            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>{t.colSecurity}</th>
                    <th>{t.colTrend}</th>
                    <th style={{ textAlign: 'right' }}>{t.colPrice}</th>
                    <th style={{ textAlign: 'right' }}>{t.colChange}</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.slice(0, 5).map(stock => (
                    <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                      <td>
                        <div className="font-semibold text-xs">{stock.ticker}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {stock.name}
                        </div>
                      </td>
                      <td>{renderSparkline(stock.sparkline, stock.isPositive)}</td>
                      <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                        RM {stock.price}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="p-4 border-t flex items-center justify-between text-xs"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <span style={{ color: 'var(--ink-muted)' }}>
              {watchlist.length} {language === 'ENG' ? 'securities in active coverage' : 'sekuriti dipantau'}
            </span>
            <button
              type="button"
              onClick={() => navigateTo('watchlist')}
              className="font-semibold flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--accent-brand)' }}
            >
              <span>{t.manageWatchlist}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
