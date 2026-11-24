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
} from 'lucide-react';
import type { Screen, PortfolioItem } from '../App';
import { StockData, stocks } from '../data/stocks';

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
      portfolioCount: 'Stocks Held',
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
      portfolioCount: 'Pegangan Saham',
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

  const portfolioValue = portfolio
    .reduce((acc, item) => acc + parseFloat(item.stock.price) * item.quantity, 0)
    .toFixed(2);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const renderSparkline = (data: number[], isPositive: boolean = true) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 68;
    const height = 26;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} style={{ flexShrink: 0 }} aria-hidden="true">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
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
              {userProfile || 'Jom-Explorer (Aggressive)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Bento Grid */}
      <div className="jomi-bento-main">
        {/* Left Column */}
        <div className="jomi-stack-lg">
          {/* Portfolio Hero Banner */}
          <div
            className="jomi-hero"
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
                <div className="jomi-display jomi-nums" style={{ fontSize: '2.35rem', fontWeight: 700, lineHeight: 1.15 }}>
                  RM {portfolioValue}
                </div>
                <span
                  className="jomi-nums"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: 'fit-content',
                    marginTop: '0.25rem',
                  }}
                >
                  {portfolio.length} {t.portfolioCount}
                </span>
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
                        <div className="jomi-ticker-badge">{stock.ticker.slice(0, 3)}</div>
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
              {/* Top AI Picks — Uniform 2x2 Grid */}
              <section className="jomi-stack-md">
                <div className="jomi-cluster">
                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.65rem',
                      backgroundColor: 'var(--jomi-gold-soft)',
                      border: '1.5px solid var(--jomi-gold-border)',
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
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <div className="jomi-stack-xs">
                        <div className="jomi-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <div>
                            <div className="jomi-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                              {stock.ticker}
                            </div>
                            <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>
                              {stock.name}
                            </p>
                          </div>
                          <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                            {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {stock.changePercent}
                          </span>
                        </div>
                        <span className="jomi-pill-sector">{stock.sector}</span>
                      </div>

                      <div className="jomi-between" style={{ alignItems: 'flex-end' }}>
                        <div className="jomi-cluster" style={{ gap: '0.75rem' }}>
                          <span className="jomi-display jomi-nums" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                            RM {stock.price}
                          </span>
                          {renderSparkline(stock.sparkline, stock.isPositive)}
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
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.65rem',
                      backgroundColor: 'var(--jomi-emerald-soft)',
                      border: '1.5px solid var(--jomi-emerald-border)',
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
                          <div className="jomi-ticker-badge">{stock.ticker.slice(0, 3)}</div>
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
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stock.name}
                    </p>
                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                      {stock.ticker}
                    </p>
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
                    <div className="jomi-ticker-badge" style={{ width: '2.35rem', height: '2.35rem', fontSize: '0.7rem' }}>
                      {stock.ticker.slice(0, 3)}
                    </div>
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
                    {renderSparkline(stock.sparkline, stock.isPositive)}
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
