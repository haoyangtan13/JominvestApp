import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Lightbulb,
  BookOpen,
  Sparkles,
  Plus,
  ArrowUpRight,
  Compass,
  Award,
  ShieldCheck,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import type { Screen, PortfolioItem } from '../App';
import type { StockData } from '../data/stocks';
import { StockBadge, MiniSparkline } from './StockVisuals';
import { formatRMFromSen, priceToSen } from '../lib/simulator';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  setSelectedStock: (stock: StockData) => void;
  portfolio: PortfolioItem[];
  cashSen: number;
  userXP: number;
  userLevel: number;
  watchlist: StockData[];
  stocks: StockData[];
  learnedCount: number;
  completedLessonsCount: number;
  onSyncQuotes?: () => void;
  isSyncing?: boolean;
}

export function Dashboard({
  navigateTo,
  userProfile,
  language,
  setSelectedStock,
  portfolio,
  cashSen,
  userXP,
  userLevel,
  watchlist,
  stocks,
  learnedCount,
  completedLessonsCount,
  onSyncQuotes,
  isSyncing = false,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');
  const [shariahOnly, setShariahOnly] = useState(false);

  const texts = {
    ENG: {
      welcome: 'Welcome back, Tan!',
      profile: 'Investor Persona:',
      totalEquity: 'Total Account Equity (Cash + Stocks)',
      topPicks: 'Top AI Picks for You',
      allStocks: 'Bursa Malaysia Directory',
      searchPlaceholder: 'Search Bursa Malaysia stocks by name, ticker, or 4-digit code...',
      viewDetails: 'Trade / View',
      viewPortfolio: 'Open Portfolio',
      aiAdvisor: 'AI Advisor',
      education: 'Learn & AI Lab',
      educationDesc: 'Scan all 20 reports & take XP quizzes',
      exploreMore: 'Open Hub',
      marketToday: 'Bursa Market Today',
      topGainers: 'Top Gainers',
      topLosers: 'Top Losers',
      myWatchlist: 'My Watchlist',
      addToWatchlist: 'Manage Watchlist',
      searchResults: 'Search Results',
      noResults: 'No matching stocks found.',
      portfolioCount: 'Positions',
      cashChip: 'Cash',
      investedChip: 'Holdings',
      shariahAll: 'All Counters',
      shariahFilter: 'Shariah Only',
      shariahTag: 'Shariah',
      questsTitle: 'Student Quests',
      quest1: 'Execute your first simulated trade',
      quest2: 'Tap 2 financial terms in Stock Details',
      quest3: 'Pass 1 lesson quiz in Learn Hub',
      syncBtn: 'Sync KLSE',
    },
    BM: {
      welcome: 'Selamat kembali, Tan!',
      profile: 'Persona Pelabur:',
      totalEquity: 'Jumlah Ekuiti Akaun (Tunai + Saham)',
      topPicks: 'Pilihan Teratas AI Untuk Anda',
      allStocks: 'Direktori Bursa Malaysia',
      searchPlaceholder: 'Cari saham Bursa Malaysia mengikut nama atau kod...',
      viewDetails: 'Dagang / Lihat',
      viewPortfolio: 'Buka Portfolio',
      aiAdvisor: 'Penasihat AI',
      education: 'Makmal Ilmu & AI',
      educationDesc: 'Imbas 20 laporan & jawab kuiz XP',
      exploreMore: 'Buka Hab',
      marketToday: 'Bursa Hari Ini',
      topGainers: 'Penaik Teratas',
      topLosers: 'Penurun Teratas',
      myWatchlist: 'Senarai Pantau Saya',
      addToWatchlist: 'Urus Senarai Pantau',
      searchResults: 'Keputusan Carian',
      noResults: 'Tiada saham ditemui.',
      portfolioCount: 'Pegangan',
      cashChip: 'Tunai',
      investedChip: 'Saham',
      shariahAll: 'Semua Saham',
      shariahFilter: 'Patuh Syariah',
      shariahTag: 'Syariah',
      questsTitle: 'Misi Pelajar',
      quest1: 'Buat dagangan simulasi pertama',
      quest2: 'Ketik 2 istilah dalam Butiran Saham',
      quest3: 'Lulus 1 kuiz dalam Hab Ilmu',
      syncBtn: 'Segar KLSE',
    },
  };

  const t = texts[language];

  const basePool = shariahOnly ? stocks.filter((s) => s.shariahCompliant) : stocks;

  const filteredStocks = searchQuery
    ? basePool.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.klseCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const topPicks = basePool
    .filter((s) => ['TENAGA', 'MAYBANK', 'PBBANK', 'CIMB', 'GAMUDA', 'IHH'].includes(s.ticker))
    .slice(0, 4);
  const topGainers = [...stocks].sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent)).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent)).slice(0, 5);

  const holdingsSen = portfolio.reduce(
    (acc, item) => acc + priceToSen(item.stock.price) * item.quantity,
    0
  );
  const costBasisSen = portfolio.reduce(
    (acc, item) => acc + priceToSen(item.averagePrice) * item.quantity,
    0
  );
  const totalEquitySen = cashSen + holdingsSen;
  const pnlSen = holdingsSen - costBasisSen;

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const quests = [
    { label: t.quest1, done: portfolio.length > 0 || cashSen !== 1_000_000 },
    { label: t.quest2, done: learnedCount >= 2 },
    { label: t.quest3, done: completedLessonsCount >= 1 },
  ];

  return (
    <div className="jomi-stack-lg">
      {/* Greeting + Persona + Sync Strip */}
      <div className="jomi-between">
        <div className="jomi-stack-xs">
          <h2 className="jomi-display jomi-title-xl">{t.welcome}</h2>
          <div className="jomi-cluster jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
            <span>{t.profile}</span>
            <span className="jomi-pill-gain">
              <Compass size={12} />
              {userProfile || 'Jom-Explorer (Aggressive)'}
            </span>
          </div>
        </div>

        <div className="jomi-cluster">
          <div className="jomi-tabs-bar">
            <button
              type="button"
              onClick={() => setShariahOnly(false)}
              className={`jomi-tab-btn ${!shariahOnly ? 'jomi-tab-btn-active' : ''}`}
            >
              {t.shariahAll}
            </button>
            <button
              type="button"
              onClick={() => setShariahOnly(true)}
              className={`jomi-tab-btn ${shariahOnly ? 'jomi-tab-btn-active' : ''}`}
            >
              <ShieldCheck size={14} color="#047857" />
              <span>{t.shariahFilter}</span>
            </button>
          </div>

          {onSyncQuotes && (
            <button
              type="button"
              onClick={onSyncQuotes}
              disabled={isSyncing}
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
            >
              <RefreshCw size={14} />
              <span>{t.syncBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Bento Grid */}
      <div className="jomi-bento-main">
        {/* Left Column */}
        <div className="jomi-stack-lg">
          {/* Account Equity Hero Banner */}
          <div
            className="jomi-hero jomi-stack-md"
            onClick={() => navigateTo('portfolio')}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('portfolio');
              }
            }}
          >
            <div className="jomi-between" style={{ alignItems: 'flex-start' }}>
              <div className="jomi-stack-xs">
                <p className="jomi-hero-label">{t.totalEquity}</p>
                <div className="jomi-display jomi-nums" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 }}>
                  RM {formatRMFromSen(totalEquitySen)}
                </div>
              </div>

              <div className="jomi-cluster">
                <button
                  type="button"
                  className="jomi-btn jomi-btn-gold"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('portfolio');
                  }}
                >
                  <span>{t.viewPortfolio}</span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('ai-recommendation');
                  }}
                >
                  <Sparkles size={15} color="#0d9488" />
                  <span>{t.aiAdvisor}</span>
                </button>
              </div>
            </div>

            {/* Bottom Stat Chips inside Hero */}
            <div className="jomi-cluster" style={{ gap: '0.6rem', paddingTop: '0.25rem' }}>
              <div
                className="jomi-nums"
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(15, 41, 38, 0.28)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                }}
              >
                {t.cashChip}: RM {formatRMFromSen(cashSen)}
              </div>
              <div
                className="jomi-nums"
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(15, 41, 38, 0.28)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                }}
              >
                {t.investedChip}: RM {formatRMFromSen(holdingsSen)} ({portfolio.length})
              </div>
              <div
                className="jomi-nums"
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(15, 41, 38, 0.28)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Award size={13} color="#fcd34d" />
                <span>Lv.{userLevel} ({userXP} XP)</span>
              </div>
              {portfolio.length > 0 && (
                <div
                  className="jomi-nums"
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '0.75rem',
                    backgroundColor: pnlSen >= 0 ? 'rgba(236, 253, 245, 0.22)' : 'rgba(254, 242, 242, 0.22)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                  }}
                >
                  {pnlSen >= 0 ? '+' : ''}RM {formatRMFromSen(pnlSen)} P&amp;L
                </div>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="jomi-search-wrap">
            <Search className="jomi-search-icon" size={19} aria-hidden="true" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="jomi-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t.searchPlaceholder}
            />
          </div>

          {/* Search Results OR Top AI Picks + Bursa Directory */}
          {searchQuery ? (
            <div className="jomi-stack-md">
              <h3 className="jomi-display jomi-title-lg">{t.searchResults}</h3>
              {filteredStocks.length > 0 ? (
                <div className="jomi-grid-2">
                  {filteredStocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="jomi-card jomi-card-interactive jomi-card-pad jomi-between"
                      style={{ flexWrap: 'nowrap', gap: '0.75rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                        <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                        <div style={{ minWidth: 0 }}>
                          <h4 className="jomi-title-md">{stock.name}</h4>
                          <div className="jomi-cluster" style={{ gap: '0.35rem', marginTop: '2px' }}>
                            <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{stock.ticker}</span>
                            {stock.shariahCompliant && <span className="jomi-pill-shariah">{t.shariahTag}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }} className="jomi-stack-xs">
                        <p className="jomi-nums" style={{ fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>RM {stock.price}</p>
                        <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                          {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {stock.changePercent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="jomi-card jomi-card-pad jomi-muted" style={{ textAlign: 'center', fontWeight: 700 }}>
                  {t.noResults}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Top AI Picks — Uniform 2-Row Cards */}
              <section className="jomi-stack-md">
                <div className="jomi-cluster">
                  <div
                    style={{
                      width: '2.1rem',
                      height: '2.1rem',
                      borderRadius: '0.7rem',
                      backgroundColor: 'var(--jomi-gold-soft)',
                      border: '2px solid var(--jomi-gold-border)',
                      boxShadow: '0 2px 0 0 var(--jomi-gold-border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lightbulb size={17} color="#b45309" />
                  </div>
                  <h3 className="jomi-display jomi-title-lg">{t.topPicks}</h3>
                </div>

                <div className="jomi-grid-2">
                  {topPicks.map((stock) => (
                    <div
                      key={stock.id}
                      className="jomi-card jomi-card-interactive jomi-card-pad"
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.15rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: '0.75rem' }}>
                        <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0, alignItems: 'flex-start' }}>
                          <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <div className="jomi-display" style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>
                              {stock.ticker}
                            </div>
                            <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600, marginTop: '2px', lineHeight: 1.3 }}>
                              {stock.name}
                            </p>
                            <div className="jomi-cluster" style={{ gap: '0.35rem', marginTop: '0.4rem' }}>
                              <span className="jomi-pill-sector">{stock.sector}</span>
                              {stock.shariahCompliant && <span className="jomi-pill-shariah">{t.shariahTag}</span>}
                            </div>
                          </div>
                        </div>

                        <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                          {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {stock.changePercent}
                        </span>
                      </div>

                      <div className="jomi-stack-sm" style={{ paddingTop: '0.65rem', borderTop: '1.5px solid var(--jomi-canvas)' }}>
                        <div className="jomi-between" style={{ flexWrap: 'nowrap' }}>
                          <span className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            RM {stock.price}
                          </span>
                          <MiniSparkline
                            data={stock.sparkline}
                            isPositive={stock.isPositive}
                            width={88}
                            height={30}
                            idSuffix={`pick-${stock.id}`}
                          />
                        </div>
                        <button
                          type="button"
                          className="jomi-btn jomi-btn-primary jomi-btn-sm jomi-btn-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStockClick(stock);
                          }}
                        >
                          {t.viewDetails}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bursa Directory */}
              <section className="jomi-stack-md">
                <div className="jomi-cluster">
                  <div
                    style={{
                      width: '2.1rem',
                      height: '2.1rem',
                      borderRadius: '0.7rem',
                      backgroundColor: 'var(--jomi-emerald-soft)',
                      border: '2px solid var(--jomi-emerald-border)',
                      boxShadow: '0 2px 0 0 var(--jomi-emerald-border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={17} color="#047857" />
                  </div>
                  <h3 className="jomi-display jomi-title-lg">
                    {t.allStocks} ({basePool.length})
                  </h3>
                </div>

                <div className="jomi-grid-2">
                  {basePool.map((stock) => (
                    <div
                      key={stock.id}
                      className="jomi-card jomi-card-interactive"
                      style={{ padding: '0.95rem 1.1rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-between" style={{ flexWrap: 'nowrap', gap: '0.75rem' }}>
                        <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                          <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.25 }}>
                              {stock.name}
                            </h4>
                            <div className="jomi-cluster" style={{ gap: '0.35rem', marginTop: '3px' }}>
                              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                                {stock.ticker} · {stock.klseCode.replace('.KL', '')}
                              </span>
                              {stock.shariahCompliant && <span className="jomi-pill-shariah">{t.shariahTag}</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }} className="jomi-stack-xs">
                          <p className="jomi-nums" style={{ fontSize: '0.92rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            RM {stock.price}
                          </p>
                          <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                            {stock.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {stock.changePercent}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="jomi-stack-lg">
          {/* Student Quests Tracker */}
          <div className="jomi-card jomi-card-pad jomi-stack-sm">
            <div className="jomi-between">
              <h3 className="jomi-display jomi-title-md">{t.questsTitle}</h3>
              <span className="jomi-pill-neutral jomi-nums">
                {quests.filter((q) => q.done).length} / {quests.length}
              </span>
            </div>
            <div className="jomi-stack-xs">
              {quests.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '0.75rem',
                    backgroundColor: q.done ? 'var(--jomi-emerald-soft)' : 'var(--jomi-canvas)',
                    border: `1.5px solid ${q.done ? 'var(--jomi-emerald-border)' : 'var(--jomi-border)'}`,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {q.done ? <CheckCircle2 size={16} color="#047857" /> : <Circle size={16} color="#94a3b8" />}
                  <span style={{ textDecoration: q.done ? 'line-through' : 'none', opacity: q.done ? 0.8 : 1 }}>
                    {q.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Hub Quick Card */}
          <div
            className="jomi-card-gold jomi-card-interactive"
            onClick={() => navigateTo('educational-hub')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('educational-hub');
              }
            }}
          >
            <div className="jomi-between">
              <div className="jomi-cluster" style={{ flexWrap: 'nowrap' }}>
                <div
                  style={{
                    width: '2.85rem',
                    height: '2.85rem',
                    borderRadius: '0.875rem',
                    backgroundColor: 'var(--jomi-gold)',
                    color: 'var(--jomi-ink)',
                    boxShadow: '0 3px 0 0 var(--jomi-gold-dark)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={21} />
                </div>
                <div>
                  <h3 className="jomi-display jomi-title-md">{t.education}</h3>
                  <p className="jomi-text-xs" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 700 }}>
                    {t.educationDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="jomi-btn jomi-btn-gold jomi-btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('educational-hub');
                }}
              >
                {t.exploreMore}
              </button>
            </div>
          </div>

          {/* Market Movers Card */}
          <div className="jomi-card jomi-card-pad jomi-stack-md">
            <div className="jomi-between">
              <h3 className="jomi-display jomi-title-md jomi-cluster" style={{ gap: '0.5rem' }}>
                <TrendingUp size={18} color="#0d9488" />
                <span>{t.marketToday}</span>
              </h3>
            </div>

            <div className="jomi-tabs-bar" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                onClick={() => setMoversTab('gainers')}
                className={`jomi-tab-btn ${moversTab === 'gainers' ? 'jomi-tab-btn-active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                {t.topGainers}
              </button>
              <button
                type="button"
                onClick={() => setMoversTab('losers')}
                className={`jomi-tab-btn ${moversTab === 'losers' ? 'jomi-tab-btn-active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                {t.topLosers}
              </button>
            </div>

            <div className="jomi-stack-xs">
              {(moversTab === 'gainers' ? topGainers : topLosers).map((stock) => (
                <div
                  key={stock.id}
                  className="jomi-row"
                  style={{ flexWrap: 'nowrap' }}
                  onClick={() => handleStockClick(stock)}
                >
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <p className="jomi-display" style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>
                        {stock.ticker}
                      </p>
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600, lineHeight: 1.25 }}>
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                    {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stock.changePercent}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlist Preview Card */}
          <div className="jomi-card jomi-card-pad jomi-stack-md">
            <h3 className="jomi-display jomi-title-md">{t.myWatchlist}</h3>

            <div className="jomi-stack-xs">
              {watchlist.slice(0, 4).map((stock) => (
                <div
                  key={stock.id}
                  className="jomi-row"
                  style={{ flexWrap: 'nowrap' }}
                  onClick={() => handleStockClick(stock)}
                >
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <p className="jomi-display" style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>
                        {stock.ticker}
                      </p>
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600, lineHeight: 1.25 }}>
                        {stock.sector}
                      </p>
                    </div>
                  </div>
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', flexShrink: 0, gap: '0.6rem' }}>
                    <MiniSparkline
                      data={stock.sparkline}
                      isPositive={stock.isPositive}
                      width={56}
                      height={22}
                      idSuffix={`wl-${stock.id}`}
                    />
                    <div style={{ textAlign: 'right' }}>
                      <p className="jomi-nums" style={{ fontSize: '0.86rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        RM {stock.price}
                      </p>
                      <p
                        className="jomi-nums"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: stock.isPositive ? '#047857' : '#b91c1c',
                        }}
                      >
                        {stock.changePercent}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-full"
              onClick={() => navigateTo('watchlist')}
            >
              <Plus size={16} />
              <span>{t.addToWatchlist}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
