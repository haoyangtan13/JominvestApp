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
} from 'lucide-react';
import type { Screen, PortfolioItem } from '../App';
import { StockData, stocks } from '../data/stocks';
import { StockBadge, MiniSparkline } from './StockVisuals';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  setSelectedStock: (stock: StockData) => void;
  portfolio: PortfolioItem[];
  userXP: number;
  userLevel: number;
  watchlist: StockData[];
}

export function Dashboard({
  navigateTo,
  userProfile,
  language,
  setSelectedStock,
  portfolio,
  userXP,
  userLevel,
  watchlist,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');

  const texts = {
    ENG: {
      welcome: 'Welcome back, Tan!',
      profile: 'Investor Persona:',
      portfolio: 'My Simulated Portfolio',
      topPicks: 'Top AI Picks for You',
      allStocks: 'All Bursa Malaysia Stocks',
      searchPlaceholder: 'Search Bursa Malaysia stocks by name or ticker...',
      viewDetails: 'Trade / View',
      viewPortfolio: 'Open Portfolio',
      aiAdvisor: 'AI Advisor',
      education: 'Educational Hub',
      educationDesc: 'Scan annual reports & earn XP',
      exploreMore: 'Open Hub',
      marketToday: 'Bursa Market Today',
      topGainers: 'Top Gainers',
      topLosers: 'Top Losers',
      myWatchlist: 'My Watchlist',
      addToWatchlist: 'Manage Watchlist',
      searchResults: 'Search Results',
      noResults: 'No matching stocks found.',
      portfolioCount: 'Positions',
      watchingCount: 'Watching',
      xpStat: 'Investor Rank',
    },
    BM: {
      welcome: 'Selamat kembali, Tan!',
      profile: 'Persona Pelabur:',
      portfolio: 'Portfolio Simulasi Saya',
      topPicks: 'Pilihan Teratas AI Untuk Anda',
      allStocks: 'Semua Saham Bursa Malaysia',
      searchPlaceholder: 'Cari saham Bursa Malaysia mengikut nama atau kod...',
      viewDetails: 'Dagang / Lihat',
      viewPortfolio: 'Buka Portfolio',
      aiAdvisor: 'Penasihat AI',
      education: 'Hab Pendidikan',
      educationDesc: 'Imbas laporan tahunan & kumpul XP',
      exploreMore: 'Buka Hab',
      marketToday: 'Bursa Hari Ini',
      topGainers: 'Penaik Teratas',
      topLosers: 'Penurun Teratas',
      myWatchlist: 'Senarai Pantau Saya',
      addToWatchlist: 'Urus Senarai Pantau',
      searchResults: 'Keputusan Carian',
      noResults: 'Tiada saham ditemui.',
      portfolioCount: 'Pegangan',
      watchingCount: 'Dipantau',
      xpStat: 'Tahap Pelabur',
    },
  };

  const t = texts[language];

  const filteredStocks = searchQuery
    ? stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const topPicks = stocks.filter((s) => ['TENAGA', 'MAYBANK', 'PBBANK', 'CIMB'].includes(s.ticker));
  const topGainers = [...stocks].sort((a, b) => parseFloat(b.change) - parseFloat(a.change)).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => parseFloat(a.change) - parseFloat(b.change)).slice(0, 5);

  const portfolioValueNum = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );
  const portfolioCostNum = portfolio.reduce(
    (acc, item) => acc + item.averagePrice * item.quantity,
    0
  );
  const pnlDiff = portfolioValueNum - portfolioCostNum;
  const portfolioValue = portfolioValueNum.toFixed(2);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  return (
    <div className="jomi-stack-lg">
      {/* Greeting + Persona Strip */}
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
      </div>

      {/* Main 2-Column Bento Grid */}
      <div className="jomi-bento-main">
        {/* Left Column */}
        <div className="jomi-stack-lg">
          {/* Portfolio Hero Banner with Textured Grid + Multi-Stat Strip */}
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
                <p className="jomi-hero-label">{t.portfolio}</p>
                <div className="jomi-display jomi-nums" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 }}>
                  RM {portfolioValue}
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
            <div className="jomi-cluster" style={{ gap: '0.65rem', paddingTop: '0.25rem' }}>
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
                {portfolio.length} {t.portfolioCount}
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
                {watchlist.length} {t.watchingCount}
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
                    backgroundColor: pnlDiff >= 0 ? 'rgba(236, 253, 245, 0.22)' : 'rgba(254, 242, 242, 0.22)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                  }}
                >
                  {pnlDiff >= 0 ? '+' : ''}RM {pnlDiff.toFixed(2)} P&amp;L
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
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-cluster" style={{ flexWrap: 'nowrap' }}>
                        <StockBadge ticker={stock.ticker} sector={stock.sector} />
                        <div>
                          <h4 className="jomi-title-md">{stock.name}</h4>
                          <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{stock.ticker}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
                        <p className="jomi-nums" style={{ fontWeight: 800, fontSize: '0.95rem' }}>RM {stock.price}</p>
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
              {/* Top AI Picks — Uniform 2x2 Grid with Sector Badges & Gradient Sparklines */}
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
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.1rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                        <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                          <StockBadge ticker={stock.ticker} sector={stock.sector} />
                          <div style={{ minWidth: 0 }}>
                            <div className="jomi-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                              {stock.ticker}
                            </div>
                            <p
                              className="jomi-text-xs jomi-muted"
                              style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {stock.name}
                            </p>
                            <div style={{ marginTop: '0.35rem' }}>
                              <span className="jomi-pill-sector">{stock.sector}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                          {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {stock.changePercent}
                        </span>
                      </div>

                      <div className="jomi-between" style={{ alignItems: 'flex-end', paddingTop: '0.25rem', borderTop: '1.5px solid var(--jomi-canvas)' }}>
                        <div className="jomi-cluster" style={{ gap: '0.75rem' }}>
                          <span className="jomi-display jomi-nums" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                            RM {stock.price}
                          </span>
                          <MiniSparkline
                            data={stock.sparkline}
                            isPositive={stock.isPositive}
                            idSuffix={`pick-${stock.id}`}
                          />
                        </div>
                        <button
                          type="button"
                          className="jomi-btn jomi-btn-primary jomi-btn-sm"
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

              {/* All Bursa Malaysia Stocks */}
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
                  <h3 className="jomi-display jomi-title-lg">{t.allStocks}</h3>
                </div>

                <div className="jomi-grid-2">
                  {stocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="jomi-card jomi-card-interactive"
                      style={{ padding: '0.95rem 1.1rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-between" style={{ flexWrap: 'nowrap' }}>
                        <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                          <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <h4
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {stock.name}
                            </h4>
                            <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                              {stock.ticker}
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }} className="jomi-stack-xs">
                          <p className="jomi-nums" style={{ fontSize: '0.92rem', fontWeight: 800 }}>
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
            <div className="jomi-between" style={{ flexWrap: 'nowrap' }}>
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
                  onClick={() => handleStockClick(stock)}
                >
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stock.name}
                      </p>
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                        {stock.ticker}
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
                  onClick={() => handleStockClick(stock)}
                >
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <StockBadge ticker={stock.ticker} sector={stock.sector} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stock.name}
                      </p>
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                        {stock.ticker}
                      </p>
                    </div>
                  </div>
                  <div className="jomi-cluster" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
                    <MiniSparkline
                      data={stock.sparkline}
                      isPositive={stock.isPositive}
                      width={64}
                      height={24}
                      idSuffix={`wl-${stock.id}`}
                    />
                    <span className="jomi-nums" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                      RM {stock.price}
                    </span>
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
