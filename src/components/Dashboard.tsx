import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, TrendingDown, Search, Lightbulb, BookOpen, User, Sparkles, Plus, Star, ArrowUpRight } from 'lucide-react';
import { ChatbotModal } from './ChatbotModal';
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

export function Dashboard({ navigateTo, userProfile, language, setSelectedStock, portfolio, userXP, userLevel, watchlist }: DashboardProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const texts = {
    ENG: {
      welcome: 'Welcome back, Tan!',
      profile: 'Your Investor Profile',
      portfolio: 'My Simulated Portfolio',
      topPicks: 'Top AI Picks for You',
      allStocks: 'All Bursa Stocks',
      searchPlaceholder: 'Search Bursa Malaysia stocks...',
      viewDetails: 'View Details',
      viewPortfolio: 'Open Portfolio',
      aiAdvisor: 'AI Advisor',
      education: 'Educational Hub',
      educationDesc: 'Master investing basics & earn XP',
      exploreMore: 'Explore',
      marketToday: 'Bursa Market Today',
      topGainers: 'Top Gainers',
      topLosers: 'Top Losers',
      myWatchlist: 'My Watchlist',
      addToWatchlist: 'Manage Watchlist',
      searchResults: 'Search Results',
      noResults: 'No stocks found.',
      portfolioValue: 'Total Value',
      portfolioCount: 'Stocks Held',
      level: 'Level',
      aiCoach: 'AI Coach',
    },
    BM: {
      welcome: 'Selamat kembali, Tan!',
      profile: 'Profil Pelabur Anda',
      portfolio: 'Portfolio Simulasi Saya',
      topPicks: 'Pilihan Teratas AI Untuk Anda',
      allStocks: 'Semua Saham Bursa',
      searchPlaceholder: 'Cari saham Bursa Malaysia...',
      viewDetails: 'Lihat Butiran',
      viewPortfolio: 'Buka Portfolio',
      aiAdvisor: 'Penasihat AI',
      education: 'Hab Pendidikan',
      educationDesc: 'Kuasai asas pelaburan & kumpul XP',
      exploreMore: 'Terokai',
      marketToday: 'Bursa Hari Ini',
      topGainers: 'Penaik Teratas',
      topLosers: 'Penurun Teratas',
      myWatchlist: 'Senarai Pantau Saya',
      addToWatchlist: 'Urus Senarai Pantau',
      searchResults: 'Keputusan Carian',
      noResults: 'Tiada saham ditemui.',
      portfolioValue: 'Jumlah Nilai',
      portfolioCount: 'Pegangan Saham',
      level: 'Tahap',
      aiCoach: 'Jurulatih AI',
    }
  };

  const t = texts[language];

  // Derived Data
  const filteredStocks = searchQuery
    ? stocks.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const topPicks = stocks.filter(s => ['TENAGA', 'MAYBANK', 'PBBANK', 'CIMB'].includes(s.ticker));
  const topGainers = [...stocks].sort((a, b) => parseFloat(b.change) - parseFloat(a.change)).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => parseFloat(a.change) - parseFloat(b.change)).slice(0, 5);

  // Calculate Portfolio
  const portfolioValue = portfolio.reduce((acc, item) => acc + (parseFloat(item.stock.price) * item.quantity), 0).toFixed(2);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const renderSparkline = (data: number[], isPositive: boolean = true) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 76;
    const height = 28;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block shrink-0" aria-hidden="true">
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
    <div className="jomi-page pb-20">
      {/* Header */}
      <header className="jomi-header sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="jomi-brand-mark" aria-hidden="true">
              <TrendingUp size={22} strokeWidth={2.6} />
            </div>
            <h1 className="text-2xl jomi-display" style={{ fontWeight: 700, color: 'var(--jomi-ink)' }}>
              JomINVEST
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('educational-hub')}
              className="jomi-pill-xp jomi-nums"
              title={t.education}
            >
              <Star size={14} fill="#f59e0b" color="#b45309" aria-hidden="true" />
              <span>{t.level} {userLevel}</span>
              <span aria-hidden="true">·</span>
              <span>{userXP} XP</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('profile')}
              aria-label="Profile"
              className="jomi-btn jomi-btn-outline"
              style={{ width: '2.5rem', height: '2.5rem', padding: 0 }}
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl jomi-display mb-1" style={{ fontWeight: 700 }}>
                  {t.welcome}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--jomi-muted-ink)' }}>
                  <span>{t.profile}:</span>
                  <span className="jomi-pill-gain">
                    {userProfile || 'Jom-Explorer (Aggressive)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Hero Card */}
            <div
              className="jomi-hero p-6 cursor-pointer"
              onClick={() => navigateTo('portfolio')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateTo('portfolio');
                }
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="jomi-hero-label">
                    {t.portfolio}
                  </p>
                  <div className="text-4xl jomi-display jomi-nums mt-2" style={{ fontWeight: 700 }}>
                    RM {portfolioValue}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.16)', fontWeight: 700 }}>
                    <span className="jomi-nums">{portfolio.length} {t.portfolioCount}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="jomi-btn jomi-btn-gold text-sm px-4 py-2"
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
                    className="jomi-btn jomi-btn-outline text-sm px-4 py-2"
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

            {/* Search Bar */}
            <div className="relative">
              <Search
                className="jomi-search-icon"
                size={19}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="jomi-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t.searchPlaceholder}
              />
            </div>

            {/* Search Results or Dashboard Content */}
            {searchQuery ? (
              <div>
                <h3 className="text-xl jomi-display mb-4" style={{ fontWeight: 700 }}>{t.searchResults}</h3>
                {filteredStocks.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredStocks.map((stock) => (
                      <Card
                        key={stock.id}
                        className="jomi-card-interactive"
                        onClick={() => handleStockClick(stock)}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="jomi-ticker-badge">
                              {stock.ticker.slice(0, 3)}
                            </div>
                            <div>
                              <h4 className="text-sm" style={{ fontWeight: 700 }}>{stock.name}</h4>
                              <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.ticker}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm jomi-nums" style={{ fontWeight: 800 }}>RM {stock.price}</p>
                            <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                              {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {stock.changePercent}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--jomi-muted-ink)' }}>{t.noResults}</p>
                )}
              </div>
            ) : (
              <>
                {/* Top AI Picks Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--jomi-gold-soft)', border: '1.5px solid var(--jomi-gold-border)' }}>
                      <Lightbulb color="#b45309" size={18} />
                    </div>
                    <h3 className="text-xl jomi-display" style={{ fontWeight: 700 }}>{t.topPicks}</h3>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                    {topPicks.map((stock) => (
                      <Card
                        key={stock.id}
                        className="min-w-[280px] snap-start jomi-card-interactive"
                        onClick={() => handleStockClick(stock)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="jomi-display text-base block mb-1" style={{ fontWeight: 700 }}>{stock.ticker}</span>
                              <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.name}</p>
                            </div>
                            <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                              {stock.changePercent}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="jomi-pill-sector">{stock.sector}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <div className="text-2xl jomi-display jomi-nums" style={{ fontWeight: 700 }}>
                                RM {stock.price}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="jomi-btn jomi-btn-primary text-xs px-3 py-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStockClick(stock);
                              }}
                            >
                              {t.viewDetails}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* All Bursa Stocks Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--jomi-emerald-soft)', border: '1.5px solid var(--jomi-emerald-border)' }}>
                      <TrendingUp color="#047857" size={18} />
                    </div>
                    <h3 className="text-xl jomi-display" style={{ fontWeight: 700 }}>{t.allStocks}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {stocks.map((stock) => (
                      <Card
                        key={stock.id}
                        className="jomi-card-interactive"
                        onClick={() => handleStockClick(stock)}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="jomi-ticker-badge">
                              {stock.ticker.slice(0, 3)}
                            </div>
                            <div>
                              <h4 className="text-sm" style={{ fontWeight: 700 }}>{stock.name}</h4>
                              <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.ticker}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-sm jomi-nums" style={{ fontWeight: 800 }}>RM {stock.price}</p>
                            <div className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                              {stock.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {stock.changePercent}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Educational Hub, Market Movers & Watchlist */}
          <div className="space-y-8">
            {/* Educational Hub - Tactile Gold Card */}
            <div
              className="jomi-edu-card p-6"
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="jomi-edu-icon" aria-hidden="true">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg jomi-display" style={{ fontWeight: 700 }}>{t.education}</h3>
                    <p className="text-xs" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 600 }}>
                      {t.educationDesc}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-gold text-xs px-3 py-2 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('educational-hub');
                  }}
                >
                  {t.exploreMore}
                </button>
              </div>
            </div>

            {/* Market Movers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 jomi-display text-lg">
                  <TrendingUp color="#0d9488" size={20} />
                  {t.marketToday}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gainers">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gainers">{t.topGainers}</TabsTrigger>
                    <TabsTrigger value="losers">{t.topLosers}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="gainers" className="space-y-2 mt-4">
                    {topGainers.map((stock) => (
                      <div
                        key={stock.id}
                        className="jomi-row"
                        onClick={() => handleStockClick(stock)}
                      >
                        <div>
                          <p className="text-sm" style={{ fontWeight: 700 }}>{stock.name}</p>
                          <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.ticker}</p>
                        </div>
                        <span className="jomi-pill-gain jomi-nums">
                          <TrendingUp size={13} />
                          {stock.changePercent}
                        </span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="losers" className="space-y-2 mt-4">
                    {topLosers.map((stock) => (
                      <div
                        key={stock.id}
                        className="jomi-row"
                        onClick={() => handleStockClick(stock)}
                      >
                        <div>
                          <p className="text-sm" style={{ fontWeight: 700 }}>{stock.name}</p>
                          <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.ticker}</p>
                        </div>
                        <span className="jomi-pill-loss jomi-nums">
                          <TrendingDown size={13} />
                          {stock.changePercent}
                        </span>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* My Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle className="jomi-display text-lg">{t.myWatchlist}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlist.slice(0, 3).map((stock) => (
                  <div
                    key={stock.id}
                    className="jomi-row"
                    onClick={() => {
                      setSelectedStock(stock);
                      navigateTo('stock-details');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="jomi-ticker-badge">
                        {stock.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 700 }}>{stock.name}</p>
                        <p className="text-xs" style={{ color: 'var(--jomi-muted-ink)' }}>{stock.ticker}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderSparkline(stock.sparkline, stock.isPositive)}
                      <p className="text-sm jomi-nums" style={{ fontWeight: 800 }}>RM {stock.price}</p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline w-full py-2 text-sm"
                  onClick={() => navigateTo('watchlist')}
                >
                  <Plus size={16} />
                  <span>{t.addToWatchlist}</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Action Button for AI Coach */}
      <button
        type="button"
        onClick={() => setIsChatbotOpen(true)}
        className="jomi-fab"
        aria-label={t.aiCoach}
      >
        <Sparkles size={20} />
        <span>{t.aiCoach}</span>
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        language={language}
      />
    </div>
  );
}
