import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowRight, Loader2, Sparkles, FileText, Compass } from 'lucide-react';
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

function getFriendlyPickHighlight(stock: StockData, language: 'ENG' | 'BM'): string {
  const yieldNum = parseFloat(String(stock.dividendYield).replace('%', '')) || 0;
  const scores = stock.radarScores;
  const avgScore = scores
    ? Math.round((scores.value + scores.growth + scores.health + scores.dividend + scores.momentum) / 5)
    : 75;

  if (language === 'BM') {
    if (yieldNum >= 4.5) {
      return `Hasil dividen tinggi (${stock.dividendYield}) · ${stock.isShariah ? 'Patuh Syariah' : 'Komponen FBM KLCI'}`;
    }
    if (stock.isShariah && avgScore >= 75) {
      return `Patuh Syariah · Skor 5-faktor kukuh (${avgScore}/100) dalam sektor ${stock.sector}`;
    }
    return `Skor 5-faktor kukuh (${avgScore}/100) · Peneraju sektor ${stock.sector} di Bursa Malaysia`;
  }

  if (yieldNum >= 4.5) {
    return `High dividend yield (${stock.dividendYield}) · ${stock.isShariah ? 'Shariah Compliant' : 'Steady FBM KLCI leader'}`;
  }
  if (stock.isShariah) {
    return `Shariah Compliant · Strong 5-factor score (${avgScore}/100) in ${stock.sector}`;
  }
  return `Strong 5-factor score (${avgScore}/100) · Leading ${stock.sector} pick on Bursa`;
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

  const explorerSectionRef = useRef<HTMLElement | null>(null);

  const firstName = (userName || 'Investor').trim().split(' ')[0];

  const texts = {
    ENG: {
      kicker: 'Home & Daily Market Brief',
      greeting: `Welcome back, ${firstName}`,
      styleLabel: 'Investing Style',
      openLedger: 'View My Portfolio →',
      totalPracticeBalance: 'Total Practice Balance',
      investedEquity: 'Invested in Stocks',
      buyingPower: 'Cash to Invest',
      projDividend: 'Est. Annual Dividends',
      positionsCount: 'holdings',
      unallocatedCash: 'Ready to practice buying shares',
      estYieldBasis: 'Passive income from your holdings',
      briefBadge: "Today's Market Brief",
      briefHeadline:
        'Your portfolio is steady today — Tenaga Nasional and Gamuda are leading Bursa infrastructure activity, while Bank Negara holds OPR steady at 3.00%.',
      briefSub:
        'Practice buying 100-share standard lots or 1-share starter units without risking a single sen of real money.',
      btnExploreStocks: 'Explore Stocks',
      btnAnnualReport: '30-Sec Annual Report',
      btnAskJomAI: 'Ask JomAI',
      convictionKicker: 'Matched to Your Investing Style',
      convictionTitle: 'Popular on Bursa Today — Guided Picks',
      readThesis: 'See Why It Matches →',
      screenerKicker: 'Discover Malaysian Companies',
      screenerTitle: 'Bursa Malaysia Stock Explorer',
      searchPlaceholder: 'Search by company name, ticker, or Bursa code (e.g. Maybank, 1155.KL, Tenaga)...',
      allSecurities: 'All Stocks',
      shariahOnlyLabel: 'Shariah Compliant Only',
      allSectors: 'All Sectors',
      colSecurity: 'Company',
      colSector: 'Sector',
      colCompliance: 'Shariah Status',
      colTrend: '7D Trend',
      colPrice: 'Price (RM)',
      colChange: 'Today',
      colPe: 'P/E Ratio',
      colYield: 'Dividend Yield',
      noResults: 'No Bursa Malaysia stocks match your current filters. Try clearing your search or sector filter.',
      breadthKicker: "What's Moving Today",
      breadthTitle: 'Bursa Market Movers',
      topGainers: 'Top Gainers',
      topDecliners: 'Top Dippers',
      watchlistKicker: 'Stocks You Follow',
      watchlistTitle: 'Saved Stocks Watchlist',
      manageWatchlist: 'Open Watchlist →'
    },
    BM: {
      kicker: 'Utama & Ringkasan Pasaran Harian',
      greeting: `Selamat kembali, ${firstName}`,
      styleLabel: 'Gaya Pelaburan',
      openLedger: 'Lihat Portfolio Saya →',
      totalPracticeBalance: 'Jumlah Baki Latihan',
      investedEquity: 'Dilaburkan dalam Saham',
      buyingPower: 'Tunai untuk Melabur',
      projDividend: 'Anggaran Dividen Tahunan',
      positionsCount: 'pegangan',
      unallocatedCash: 'Sedia untuk latihan membeli saham',
      estYieldBasis: 'Pendapatan pasif daripada pegangan anda',
      briefBadge: 'Ringkasan Pasaran Hari Ini',
      briefHeadline:
        'Portfolio anda stabil hari ini — Tenaga Nasional dan Gamuda mendahului aktiviti infrastruktur Bursa, manakala Bank Negara mengekalkan OPR pada 3.00%.',
      briefSub:
        'Berlatih membeli lot standard 100 unit atau unit permulaan 1 saham tanpa sebarang risiko wang sebenar.',
      btnExploreStocks: 'Teroka Saham',
      btnAnnualReport: 'Laporan Tahunan 30-Saat',
      btnAskJomAI: 'Tanya JomAI',
      convictionKicker: 'Disesuaikan dengan Gaya Pelaburan Anda',
      convictionTitle: 'Popular di Bursa Hari Ini — Pilihan Panduan',
      readThesis: 'Lihat Sebab Padanan →',
      screenerKicker: 'Terokai Syarikat Malaysia',
      screenerTitle: 'Peneroka Saham Bursa Malaysia',
      searchPlaceholder: 'Cari nama syarikat, simbol, atau kod Bursa (cth: Maybank, 1155.KL, Tenaga)...',
      allSecurities: 'Semua Saham',
      shariahOnlyLabel: 'Patuh Syariah Sahaja',
      allSectors: 'Semua Sektor',
      colSecurity: 'Syarikat',
      colSector: 'Sektor',
      colCompliance: 'Status Syariah',
      colTrend: 'Trend 7H',
      colPrice: 'Harga (RM)',
      colChange: 'Hari Ini',
      colPe: 'Nisbah P/E',
      colYield: 'Hasil Dividen',
      noResults: 'Tiada saham Bursa Malaysia sepadan dengan tapisan semasa anda.',
      breadthKicker: 'Pergerakan Hari Ini',
      breadthTitle: 'Penggerak Pasaran Bursa',
      topGainers: 'Penaik Utama',
      topDecliners: 'Penurun Utama',
      watchlistKicker: 'Saham Pilihan Anda',
      watchlistTitle: 'Senarai Pantau Saham Disimpan',
      manageWatchlist: 'Buka Senarai Pantau →'
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

  const totalCostBasis = portfolio.reduce(
    (acc, item) => acc + item.averagePrice * item.quantity,
    0
  );
  const totalBalance = portfolioValue + cashBalance;
  const totalGainRM = portfolioValue - totalCostBasis;
  const isGainPositive = totalGainRM >= 0;

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

  const scrollToExplorer = () => {
    if (explorerSectionRef.current) {
      explorerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-3xl sm:text-4xl" style={{ color: 'var(--ink-primary)' }}>
            {t.greeting}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="jom-kicker">{t.styleLabel}:</span>
          <span className="jom-tag jom-tag-shariah">{userProfile || 'Jom-Explorer (Aggressive)'}</span>
          <button
            type="button"
            onClick={() => navigateTo('portfolio')}
            className="jom-btn text-xs"
          >
            {t.openLedger}
          </button>
        </div>
      </div>

      {/* Origin-style Portfolio & Daily Market Brief Hero */}
      <div className="grid lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Total Practice Balance & Breakdown */}
        <div className="jom-panel p-6 lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.totalPracticeBalance}</span>
              <span className={`jom-tag font-tabular ${isGainPositive ? 'jom-tag-up' : 'jom-tag-down'}`}>
                {portfolio.length === 0
                  ? language === 'ENG'
                    ? 'RM 10,000 Starter Cash'
                    : 'Tunai Permulaan RM 10,000'
                  : `${isGainPositive ? '+' : ''}RM ${totalGainRM.toFixed(2)}`}
              </span>
            </div>
            <div className="font-tabular text-3xl sm:text-4xl font-bold" style={{ color: 'var(--ink-primary)' }}>
              RM {totalBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {language === 'ENG'
                ? 'Risk-free practice portfolio · Bursa Malaysia (MYR)'
                : 'Portfolio latihan bebas risiko · Bursa Malaysia (MYR)'}
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div>
              <div className="jom-kicker">{t.buyingPower}</div>
              <div className="font-tabular text-sm font-semibold mt-1" style={{ color: 'var(--signal-up)' }}>
                RM {cashBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {t.unallocatedCash}
              </div>
            </div>
            <div>
              <div className="jom-kicker">{t.investedEquity}</div>
              <div className="font-tabular text-sm font-semibold mt-1" style={{ color: 'var(--ink-primary)' }}>
                RM {portfolioValue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] mt-0.5 font-tabular" style={{ color: 'var(--ink-muted)' }}>
                {portfolio.length} {t.positionsCount}
              </div>
            </div>
            <div>
              <div className="jom-kicker">{t.projDividend}</div>
              <div className="font-tabular text-sm font-semibold mt-1" style={{ color: 'var(--ink-primary)' }}>
                RM {estAnnualDividend.toFixed(2)}/yr
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {t.estYieldBasis}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Origin-Style Daily Market Brief Verdict & Quick Actions */}
        <div className="jom-hero-verdict p-6 lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="jom-tag jom-tag-shariah">
                <Sparkles size={12} />
                <span>{t.briefBadge}</span>
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
                Bursa Malaysia · FBM KLCI
              </span>
            </div>
            <h2
              className="font-editorial text-xl sm:text-2xl leading-snug"
              style={{ color: 'var(--ink-primary)' }}
            >
              {t.briefHeadline}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.briefSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={scrollToExplorer}
              className="jom-btn jom-btn-primary text-xs"
            >
              <Compass size={14} />
              <span>{t.btnExploreStocks}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('educational-hub')}
              className="jom-btn text-xs"
            >
              <FileText size={14} />
              <span>{t.btnAnnualReport}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('ai-recommendation')}
              className="jom-btn text-xs"
            >
              <Sparkles size={14} />
              <span>{t.btnAskJomAI}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Popular on Bursa Today — Guided Picks */}
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
          {topPicks.map(stock => {
            const avatar = getStockAvatarMeta(stock);
            const friendlyReason = getFriendlyPickHighlight(stock, language);

            return (
              <div
                key={stock.id}
                onClick={() => handleStockClick(stock)}
                className="jom-panel p-5 flex flex-col justify-between gap-4 cursor-pointer transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-tabular text-sm font-bold">{stock.ticker}</span>
                          <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                            {stock.bursaCode}
                          </span>
                        </div>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    {stock.isShariah ? (
                      <span className="jom-tag jom-tag-shariah shrink-0">Shariah</span>
                    ) : (
                      <span className="jom-tag shrink-0">Conventional</span>
                    )}
                  </div>

                  {/* Friendly 1-line explanation */}
                  <div className="jom-panel-subtle p-2.5 text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                    {friendlyReason}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-tabular text-2xl font-bold">RM {stock.price}</div>
                      <span
                        className={`jom-tag mt-1 font-tabular ${
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
            );
          })}
        </div>
      </section>

      {/* Bursa Malaysia Stock Explorer */}
      <section ref={explorerSectionRef} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="jom-kicker">{t.screenerKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.screenerTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isSearchingOnDemand && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Searching Bursa Malaysia...</span>
              </span>
            )}
            <span className="jom-tag font-tabular">
              {screenerStocks.length} {language === 'ENG' ? 'Stocks' : 'Saham'}
            </span>
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

          {/* Consumer Stock Explorer Table with Monogram Avatars */}
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
                  {screenerStocks.map(stock => {
                    const avatar = getStockAvatarMeta(stock);
                    return (
                      <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                            <div className="min-w-0">
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
                      </tr>
                    );
                  })}
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

      {/* Bottom 2-Column Market Movers & Saved Watchlist Preview */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Left: Top Gainers & Top Dippers */}
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
                  {(moverTab === 'gainers' ? topGainers : topDecliners).map(stock => {
                    const avatar = getStockAvatarMeta(stock);
                    return (
                      <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                            <div>
                              <div className="font-semibold text-xs">{stock.ticker}</div>
                              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                {stock.bursaCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {stock.isShariah ? (
                            <span className="jom-tag jom-tag-shariah">Shariah</span>
                          ) : (
                            <span className="jom-tag">Conventional</span>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Saved Watchlist Preview */}
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
                  {watchlist.slice(0, 5).map(stock => {
                    const avatar = getStockAvatarMeta(stock);
                    return (
                      <tr key={stock.id} onClick={() => handleStockClick(stock)}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`jom-avatar ${avatar.colorClass}`}>{avatar.initials}</div>
                            <div>
                              <div className="font-semibold text-xs">{stock.ticker}</div>
                              <div className="text-xs truncate max-w-[180px]" style={{ color: 'var(--ink-muted)' }}>
                                {stock.name}
                              </div>
                            </div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="p-4 border-t flex items-center justify-between text-xs"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <span style={{ color: 'var(--ink-muted)' }}>
              {watchlist.length} {language === 'ENG' ? 'stocks saved in your watchlist' : 'saham disimpan dalam senarai pantau'}
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

