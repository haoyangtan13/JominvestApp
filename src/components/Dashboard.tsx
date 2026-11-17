import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Lightbulb,
  BookOpen,
  User,
  Sparkles,
  Plus,
  RefreshCw,
  Wallet,
  Trophy,
  Filter,
  Loader2
} from 'lucide-react';
import { ChatbotModal } from './ChatbotModal';
import type { Screen, PortfolioItem } from '../App';
import { StockData } from '../data/stocks';
import { isBursaMarketOpen, searchBursaStocksOnDemand } from '../services/bursaService';

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
  watchlist,
  userXP,
  userLevel,
  onRefreshMarket,
  isRefreshingMarket
}: DashboardProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [onDemandResults, setOnDemandResults] = useState<StockData[]>([]);
  const [isSearchingOnDemand, setIsSearchingOnDemand] = useState(false);

  const firstName = (userName || 'Investor').trim().split(' ')[0];
  const marketOpen = isBursaMarketOpen();

  const texts = {
    ENG: {
      welcome: `Welcome back, ${firstName}!`,
      profile: 'Your Investor Profile',
      portfolio: 'My Simulated Portfolio',
      totalEquity: 'Total Account Equity',
      holdingsValue: 'Holdings Value',
      availableCash: 'Available Virtual Cash',
      topPicks: 'Top AI Picks for You',
      viewAIAnalysis: 'View AI Analysis',
      searchPlaceholder: 'Search Bursa Malaysia stocks or ticker (e.g. MAYBANK, 1155.KL, GENTING)...',
      viewDetails: 'View Details',
      education: 'Educational Hub',
      exploreMore: 'Explore',
      marketToday: 'Bursa Market Today',
      topGainers: 'Top Gainers',
      topLosers: 'Top Losers',
      myWatchlist: 'My Watchlist',
      addToWatchlist: 'Manage Watchlist',
      searchResults: 'Search Results',
      noResults: 'No Bursa Malaysia stocks found matching your filters.',
      portfolioCount: 'Stocks Held',
      allBursaStocks: 'All Bursa Malaysia Stocks',
      allStocksFilter: 'All Stocks',
      shariahFilter: '☪️ Shariah-Compliant Only',
      allSectors: 'All Sectors',
      syncPrices: 'Sync Prices',
      syncing: 'Syncing...',
      marketOpenBadge: 'Market Open',
      marketClosedBadge: 'Market Closed',
      bursaDelayed: 'Bursa Malaysia (KLSE) · 15m Delayed',
      shariahBadge: '☪️ Shariah'
    },
    BM: {
      welcome: `Selamat kembali, ${firstName}!`,
      profile: 'Profil Pelabur Anda',
      portfolio: 'Portfolio Simulasi Saya',
      totalEquity: 'Jumlah Ekuiti Akaun',
      holdingsValue: 'Nilai Pegangan',
      availableCash: 'Tunai Maya Tersedia',
      topPicks: 'Pilihan Teratas AI Untuk Anda',
      viewAIAnalysis: 'Analisis AI',
      searchPlaceholder: 'Cari saham Bursa Malaysia atau kod (cth: MAYBANK, 1155.KL)...',
      viewDetails: 'Lihat Butiran',
      education: 'Hab Pendidikan',
      exploreMore: 'Terokai',
      marketToday: 'Bursa Hari Ini',
      topGainers: 'Penaik Teratas',
      topLosers: 'Penurun Teratas',
      myWatchlist: 'Senarai Pantau Saya',
      addToWatchlist: 'Urus Senarai Pantau',
      searchResults: 'Keputusan Carian',
      noResults: 'Tiada saham Bursa Malaysia ditemui.',
      portfolioCount: 'Pegangan Saham',
      allBursaStocks: 'Semua Saham Bursa Malaysia',
      allStocksFilter: 'Semua Saham',
      shariahFilter: '☪️ Patuh Syariah Sahaja',
      allSectors: 'Semua Sektor',
      syncPrices: 'Kemas Kini Harga',
      syncing: 'Mengemas kini...',
      marketOpenBadge: 'Pasaran Dibuka',
      marketClosedBadge: 'Pasaran Ditutup',
      bursaDelayed: 'Bursa Malaysia (KLSE) · Lewat 15m',
      shariahBadge: '☪️ Syariah'
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

  // Unique sectors for filter pills
  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach(s => {
      if (s.sector) set.add(s.sector);
    });
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

  // Combine local matches + on-demand discovered stocks, then apply Shariah & Sector filters
  const applyFilters = (list: StockData[]) => {
    return list.filter(s => {
      if (shariahOnly && !s.isShariah) return false;
      if (selectedSector !== 'ALL' && s.sector !== selectedSector) return false;
      return true;
    });
  };

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lower = searchQuery.trim().toLowerCase();
    const local = stocks.filter(
      s =>
        s.name.toLowerCase().includes(lower) ||
        s.ticker.toLowerCase().includes(lower) ||
        s.bursaCode.toLowerCase().includes(lower) ||
        s.sector.toLowerCase().includes(lower)
    );
    const mergedMap = new Map<string, StockData>();
    local.forEach(s => mergedMap.set(s.bursaCode, s));
    onDemandResults.forEach(s => {
      if (!mergedMap.has(s.bursaCode)) {
        mergedMap.set(s.bursaCode, s);
      }
    });
    return applyFilters(Array.from(mergedMap.values()));
  }, [searchQuery, stocks, onDemandResults, shariahOnly, selectedSector]);

  const filteredDirectoryStocks = useMemo(() => {
    return applyFilters(stocks);
  }, [stocks, shariahOnly, selectedSector]);

  // Dynamically tailor Top AI Picks based on userProfile
  const topPicks = useMemo(() => {
    const profileLower = (userProfile || '').toLowerCase();
    let targetTickers: string[];

    if (profileLower.includes('conservative') || profileLower.includes('protector')) {
      targetTickers = ['MAYBANK', 'PBBANK', 'TENAGA', 'RHBBANK'];
    } else if (profileLower.includes('moderate') || profileLower.includes('builder')) {
      targetTickers = ['CIMB', 'MISC', 'HLBANK', 'TM'];
    } else {
      // Aggressive / Jom-Explorer
      targetTickers = ['GAMUDA', 'YTLPOWR', 'PMETAL', 'SUNWAY', 'INARI'];
    }

    const matched = targetTickers
      .map(ticker => stocks.find(s => s.ticker === ticker))
      .filter((s): s is StockData => Boolean(s));

    return matched.length > 0 ? matched : stocks.slice(0, 4);
  }, [userProfile, stocks]);

  const topGainers = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
        .slice(0, 5),
    [stocks]
  );

  const topLosers = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent))
        .slice(0, 5),
    [stocks]
  );

  // Calculate Portfolio & Equity
  const portfolioValue = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );
  const totalEquity = portfolioValue + cashBalance;

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  const handleAIAnalysisClick = (stock: StockData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStock(stock);
    navigateTo('ai-recommendation');
  };

  const renderSparkline = (data: number[]) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-green-600"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight">JomINVEST</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Level & XP Badge */}
            <button
              onClick={() => navigateTo('profile')}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              <Trophy size={14} className="text-amber-500" />
              <span>Lv.{userLevel} · {userXP} XP</span>
            </button>

            <Button variant="ghost" size="icon" onClick={() => navigateTo('profile')}>
              <User />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome & Bursa Market Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{t.welcome}</h2>
                <p className="text-gray-600 text-sm">
                  {t.profile}:{' '}
                  <span className="text-green-600 font-semibold">
                    {userProfile || 'Jom-Explorer (Aggressive)'}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      marketOpen ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{t.bursaDelayed}</span>
                  <span className="text-gray-300">|</span>
                  <span className={marketOpen ? 'text-green-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {marketOpen ? t.marketOpenBadge : t.marketClosedBadge}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshMarket}
                  disabled={isRefreshingMarket}
                  className="h-8 text-xs gap-1.5"
                >
                  <RefreshCw size={13} className={isRefreshingMarket ? 'animate-spin' : ''} />
                  {isRefreshingMarket ? t.syncing : t.syncPrices}
                </Button>
              </div>
            </div>

            {/* Portfolio Summary Card */}
            <Card
              className="bg-gradient-to-br from-green-600 to-emerald-700 text-white cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateTo('portfolio')}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base font-medium opacity-90">
                    {t.portfolio}
                  </CardTitle>
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                    {portfolio.length} {t.portfolioCount}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-green-100 uppercase tracking-wider">{t.totalEquity}</p>
                    <div className="text-3xl sm:text-4xl font-bold mt-0.5">
                      RM {totalEquity.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20 text-sm">
                    <div>
                      <p className="text-green-100 text-xs">{t.holdingsValue}</p>
                      <p className="font-semibold text-base">RM {portfolioValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-green-100 text-xs flex items-center gap-1">
                        <Wallet size={12} />
                        {t.availableCash}
                      </p>
                      <p className="font-semibold text-base">RM {cashBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar + Shariah & Sector Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Bar: Shariah Toggle + Sector Pills */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mr-1">
                    <Filter size={13} />
                    <span>Filter:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShariahOnly(false)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !shariahOnly
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {t.allStocksFilter}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShariahOnly(true)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      shariahOnly
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {t.shariahFilter}
                  </button>
                </div>

                {/* Sector Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {sectors.map(sector => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => setSelectedSector(sector)}
                      className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                        selectedSector === sector
                          ? 'bg-green-600 text-white font-medium'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sector === 'ALL' ? t.allSectors : sector}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Results or Dashboard Content */}
            {searchQuery.trim() ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{t.searchResults}</h3>
                  {isSearchingOnDemand && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Loader2 size={14} className="animate-spin" />
                      Searching Bursa Malaysia (.KL)...
                    </span>
                  )}
                </div>
                {searchMatches.length > 0 ? (
                  <div className="grid gap-3">
                    {searchMatches.map(stock => (
                      <Card
                        key={stock.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleStockClick(stock)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold">{stock.name}</h4>
                              {stock.isShariah && (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-2 py-0">
                                  {t.shariahBadge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {stock.ticker} · <span className="font-mono">{stock.bursaCode}</span> · {stock.sector}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">RM {stock.price}</p>
                            <p
                              className={`text-sm font-medium ${
                                stock.isPositive ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {stock.changePercent}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-6 text-center bg-white rounded-lg border">
                    {isSearchingOnDemand ? 'Searching Bursa Malaysia (.KL) directory...' : t.noResults}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Top AI Picks Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-green-600" size={24} />
                      <h3 className="text-xl font-bold">{t.topPicks}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-200 hover:bg-green-50 gap-1.5"
                      onClick={() => handleAIAnalysisClick(topPicks[0])}
                    >
                      <Sparkles size={14} />
                      {t.viewAIAnalysis}
                    </Button>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                    {topPicks.map(stock => (
                      <Card
                        key={stock.id}
                        className="min-w-[280px] snap-start cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleStockClick(stock)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-base font-bold line-clamp-1">
                                {stock.name}
                              </CardTitle>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-xs text-gray-500 font-medium">
                                  {stock.ticker} ({stock.bursaCode})
                                </span>
                                {stock.isShariah && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                                    {t.shariahBadge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Lightbulb className="text-yellow-500 shrink-0" size={18} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-end justify-between mt-2">
                            <div>
                              <div className="text-2xl font-bold">RM {stock.price}</div>
                              <div
                                className={`text-sm font-medium ${
                                  stock.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {stock.changePercent}
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs px-2.5"
                                onClick={e => handleAIAnalysisClick(stock, e)}
                              >
                                <Sparkles size={12} className="mr-1 text-green-600" />
                                AI
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs px-2.5">
                                {t.viewDetails}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* All Bursa Stocks Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-green-600" size={24} />
                      <h3 className="text-xl font-bold">{t.allBursaStocks}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {filteredDirectoryStocks.length}
                      </Badge>
                    </div>
                  </div>

                  {filteredDirectoryStocks.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredDirectoryStocks.map(stock => (
                        <Card
                          key={stock.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleStockClick(stock)}
                        >
                          <CardContent className="p-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700 text-xs shrink-0">
                                {stock.ticker.slice(0, 4)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-sm truncate">{stock.name}</h4>
                                  {stock.isShariah && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                      {t.shariahBadge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {stock.ticker} · <span className="font-mono">{stock.bursaCode}</span> · {stock.sector}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm">RM {stock.price}</p>
                              <div
                                className={`flex items-center justify-end gap-1 text-xs font-medium ${
                                  stock.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stock.changePercent}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm py-8 text-center bg-white rounded-lg border">
                      {t.noResults}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Market Movers & Watchlist */}
          <div className="space-y-8">
            {/* Educational Hub - Prominent Placement */}
            <Card
              className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateTo('educational-hub')}
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t.education}</h3>
                      <p className="text-sm text-gray-600">
                        {language === 'ENG' ? 'Master investing basics' : 'Kuasai asas pelaburan'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">{t.exploreMore}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Movers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  {t.marketToday}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gainers">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gainers">{t.topGainers}</TabsTrigger>
                    <TabsTrigger value="losers">{t.topLosers}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="gainers" className="space-y-3 mt-4">
                    {topGainers.map(stock => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStockClick(stock)}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{stock.name}</p>
                            {stock.isShariah && (
                              <span className="text-[10px] text-emerald-700">☪️</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {stock.ticker} · {stock.bursaCode}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <TrendingUp size={16} />
                          <span className="text-sm">{stock.changePercent}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="losers" className="space-y-3 mt-4">
                    {topLosers.map(stock => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStockClick(stock)}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{stock.name}</p>
                            {stock.isShariah && (
                              <span className="text-[10px] text-emerald-700">☪️</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {stock.ticker} · {stock.bursaCode}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-red-600 font-medium">
                          <TrendingDown size={16} />
                          <span className="text-sm">{stock.changePercent}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* My Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>{t.myWatchlist}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchlist.slice(0, 4).map(stock => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedStock(stock);
                      navigateTo('stock-details');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {stock.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stock.name}</p>
                        <p className="text-xs text-gray-500">
                          {stock.ticker} · {stock.bursaCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderSparkline(stock.sparkline)}
                      <p className="text-sm font-semibold">RM {stock.price}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigateTo('watchlist')}>
                  <Plus size={16} className="mr-2" />
                  {t.addToWatchlist}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Chatbot */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-20"
      >
        <Sparkles size={24} />
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal
        {...({
          isOpen: isChatbotOpen,
          onClose: () => setIsChatbotOpen(false),
          language,
          stocks,
          portfolio,
          cashBalance,
          userProfile,
          userName
        } as any)}
      />
    </div>
  );
}
