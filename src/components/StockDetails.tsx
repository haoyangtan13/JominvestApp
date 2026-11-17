import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TooltipProvider } from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Newspaper,
  DollarSign,
  Minus,
  Plus,
  Lightbulb,
  X,
  Trophy,
  Star,
  Wallet,
  Scale,
  Receipt,
  Info
} from 'lucide-react';
import { Input } from './ui/input';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import type { Screen, PortfolioItem } from '../App';
import { StockData, calculateBursaFees } from '../data/stocks';

interface StockDetailsProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stock: StockData | null;
  allStocks: StockData[];
  setSelectedStock: (stock: StockData | null) => void;
  portfolio: PortfolioItem[];
  cashBalance: number;
  watchlist: StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (stockId: string) => void;
  addToPortfolio: (stock: StockData, quantity: number) => boolean;
  sellFromPortfolio: (stock: StockData, quantity?: number) => boolean;
  addXP: (amount: number, reason: string) => void;
  hasLearnedTerm: string[];
  setHasLearnedTerm: (terms: string[]) => void;
}

export function StockDetails({
  navigateTo,
  language,
  stock,
  allStocks,
  setSelectedStock,
  portfolio,
  cashBalance,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
  addToPortfolio,
  sellFromPortfolio,
  addXP,
  hasLearnedTerm,
  setHasLearnedTerm
}: StockDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [lotMode, setLotMode] = useState<'lot' | 'micro'>('lot'); // 'lot' = ×100 shares, 'micro' = ×1 share
  const [learningTerm, setLearningTerm] = useState<string | null>(null);
  const [peerStockId, setPeerStockId] = useState<string>('');

  // Pick a default same-sector peer when stock changes
  useEffect(() => {
    if (!stock || !allStocks.length) return;
    const sameSector = allStocks.find(
      s => s.id !== stock.id && s.sector === stock.sector
    );
    const fallbackPeer = allStocks.find(s => s.id !== stock.id);
    const chosen = sameSector || fallbackPeer;
    if (chosen) {
      setPeerStockId(chosen.id);
    }
  }, [stock?.id, allStocks]);

  // Learning Definitions
  const definitions: Record<
    string,
    { ENG: { simple: string; detail: string }; BM: { simple: string; detail: string } }
  > = {
    'Price': {
      ENG: {
        simple: 'The current cost to buy one share.',
        detail: 'Stock prices change continuously during Bursa Malaysia trading hours based on supply and demand.'
      },
      BM: {
        simple: 'Kos semasa untuk membeli satu saham.',
        detail: 'Harga saham berubah berdasarkan permintaan dan penawaran di Bursa Malaysia.'
      }
    },
    'P/E Ratio': {
      ENG: {
        simple: 'Are you overpaying for profits?',
        detail: 'Price-to-Earnings Ratio shows how much investors pay per RM1 of company earnings. Lower P/E vs sector peers often signals better value.'
      },
      BM: {
        simple: 'Adakah anda bayar terlalu mahal?',
        detail: 'Nisbah Harga-kepada-Pendapatan menunjukkan berapa pelabur bayar untuk setiap RM1 keuntungan syarikat.'
      }
    },
    'Market Cap': {
      ENG: {
        simple: 'How big is the company?',
        detail: 'The total market value of all issued shares combined. Blue-chip large caps (>RM 10B) tend to be more stable.'
      },
      BM: {
        simple: 'Berapa besar syarikat ini?',
        detail: 'Jumlah nilai pasaran semua saham syarikat digabungkan. Syarikat modal besar biasanya lebih stabil.'
      }
    },
    'Dividend Yield': {
      ENG: {
        simple: 'Your annual cash bonus %.',
        detail: 'The percentage of the share price paid out as cash dividends to shareholders each year.'
      },
      BM: {
        simple: 'Peratusan bonus tunai tahunan anda.',
        detail: 'Peratusan harga saham yang dibayar sebagai dividen tunai kepada pemegang saham setiap tahun.'
      }
    },
    'Volume': {
      ENG: {
        simple: 'How actively traded is this stock?',
        detail: 'Total shares traded today. High volume means strong liquidity—making it easy to buy or sell quickly.'
      },
      BM: {
        simple: 'Berapa aktif saham ini didagangkan?',
        detail: 'Jumlah saham didagangkan hari ini. Volum tinggi bermakna kecairan tinggi dan mudah dijual beli.'
      }
    },
    'Shariah Status': {
      ENG: {
        simple: 'Screened by the Shariah Advisory Council (SAC) of SC Malaysia.',
        detail: 'Securities Commission Malaysia screens companies on business activity benchmarks (5% cap on conventional banking/gambling/alcohol/tobacco; 20% cap on hotel/resort/share trading) and financial ratio benchmarks (cash & conventional debt over total assets must each be <33%).'
      },
      BM: {
        simple: 'Disaring oleh Majlis Penasihat Syariah (MPS) Suruhanjaya Sekuriti Malaysia.',
        detail: 'Suruhanjaya Sekuriti Malaysia menyaring syarikat berdasarkan tanda aras aktiviti perniagaan (had 5% bagi perbankan konvensional/perjudian/arak/tembakau; had 20% bagi perhotelan) dan tanda aras nisbah kewangan (tunai & hutang konvensional ke atas jumlah aset mestilah masing-masing <33%).'
      }
    }
  };

  const texts = {
    ENG: {
      back: 'Back',
      stockDetails: 'Stock Details',
      priceChart: '30-Day Price Chart (MYR)',
      keyMetrics: 'Key Metrics (Tap to Learn +10 XP)',
      price: 'Price',
      peRatio: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      volume: 'Volume',
      shariahStatus: 'Shariah Status',
      shariahCompliant: '☪️ Shariah-Compliant',
      nonShariah: 'Conventional (Non-Shariah)',
      overview: 'Overview',
      financials: 'Financials',
      news: 'News',
      buy: 'Buy',
      sell: 'Sell',
      revenue: 'Revenue',
      netProfit: 'Net Profit',
      debtEquity: 'Debt/Equity',
      sector: 'Sector',
      units: 'Quantity',
      xpReward: '+10 XP',
      addWatchlist: 'Add to Watchlist',
      inWatchlist: 'In Watchlist',
      tradingSimulator: 'Bursa Malaysia Trading Simulator',
      availableCash: 'Available Virtual Cash',
      ownedUnits: 'Currently Owned Units',
      lotModeLabel: 'Standard Bursa Lot (×100 units)',
      microModeLabel: 'Student Micro-Unit (×1 unit)',
      lotNote: 'On Bursa Malaysia, 1 standard board lot equals 100 shares. Switch to Student Micro-Unit mode to practice with single shares!',
      feeBreakdown: 'Bursa Malaysia Fee Breakdown (Buy Estimate)',
      grossValue: 'Gross Share Value',
      brokerageFee: 'Brokerage Fee (0.10%, min RM1)',
      clearingFee: 'Clearing Fee (0.03%)',
      stampDuty: 'Stamp Duty (RM1 per RM1,000)',
      netTotal: 'Net Total (incl. Fees)',
      radarTitle: '5-Axis Fundamental Health Radar & Peer Comparison',
      compareWithPeer: 'Compare with Peer:'
    },
    BM: {
      back: 'Kembali',
      stockDetails: 'Butiran Saham',
      priceChart: 'Carta Harga 30 Hari (MYR)',
      keyMetrics: 'Metrik Utama (Ketik untuk Belajar +10 XP)',
      price: 'Harga',
      peRatio: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      volume: 'Volum',
      shariahStatus: 'Status Syariah',
      shariahCompliant: '☪️ Patuh Syariah',
      nonShariah: 'Konvensional (Bukan Syariah)',
      overview: 'Gambaran Keseluruhan',
      financials: 'Kewangan',
      news: 'Berita',
      buy: 'Beli',
      sell: 'Jual',
      revenue: 'Hasil',
      netProfit: 'Untung Bersih',
      debtEquity: 'Hutang/Ekuiti',
      sector: 'Sektor',
      units: 'Kuantiti',
      xpReward: '+10 XP',
      addWatchlist: 'Tambah Senarai Pantau',
      inWatchlist: 'Dalam Senarai Pantau',
      tradingSimulator: 'Simulator Dagangan Bursa Malaysia',
      availableCash: 'Tunai Maya Tersedia',
      ownedUnits: 'Unit Dimiliki Semasa',
      lotModeLabel: 'Lot Piawai Bursa (×100 unit)',
      microModeLabel: 'Unit Mikro Pelajar (×1 unit)',
      lotNote: 'Di Bursa Malaysia, 1 lot papan piawai bersamaan 100 saham. Tukar ke mod Unit Mikro Pelajar untuk berlatih dengan 1 unit!',
      feeBreakdown: 'Pecahan Yuran Bursa Malaysia (Anggaran Beli)',
      grossValue: 'Nilai Saham Kasar',
      brokerageFee: 'Yuran Broker (0.10%, min RM1)',
      clearingFee: 'Yuran penjelasan (0.03%)',
      stampDuty: 'Duti Setem (RM1 setiap RM1,000)',
      netTotal: 'Jumlah Bersih (termasuk Yuran)',
      radarTitle: 'Radar Kesihatan Asas 5-Paksi & Perbandingan Rakan Setara',
      compareWithPeer: 'Bandingkan dengan:'
    }
  };

  const t = texts[language];

  if (!stock) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const isInWatchlist = watchlist.some(w => w.id === stock.id);
  const ownedHolding = portfolio.find(item => item.stock.id === stock.id);
  const ownedUnits = ownedHolding ? ownedHolding.quantity : 0;

  const effectiveUnits = lotMode === 'lot' ? quantity * 100 : quantity;
  const priceNum = parseFloat(stock.price);
  const buyFees = calculateBursaFees(priceNum, effectiveUnits, 'BUY');
  const sellFees = calculateBursaFees(priceNum, Math.min(effectiveUnits, ownedUnits || effectiveUnits), 'SELL');

  const peerStock = useMemo(
    () => allStocks.find(s => s.id === peerStockId) || null,
    [allStocks, peerStockId]
  );

  const radarData = useMemo(() => {
    const scores = stock.radarScores || {
      value: 70,
      growth: 70,
      health: 75,
      dividend: 70,
      momentum: 70
    };
    const peerScores = peerStock?.radarScores;

    return [
      {
        axis: 'Value',
        [stock.ticker]: scores.value,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.value } : {})
      },
      {
        axis: 'Growth',
        [stock.ticker]: scores.growth,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.growth } : {})
      },
      {
        axis: 'Health',
        [stock.ticker]: scores.health,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.health } : {})
      },
      {
        axis: 'Dividend',
        [stock.ticker]: scores.dividend,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.dividend } : {})
      },
      {
        axis: 'Momentum',
        [stock.ticker]: scores.momentum,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.momentum } : {})
      }
    ];
  }, [stock, peerStock]);

  const handleQuantityChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleTermClick = (termKey: string) => {
    if (!hasLearnedTerm.includes(termKey)) {
      addXP(10, `Learned about ${termKey}`);
      setHasLearnedTerm([...hasLearnedTerm, termKey]);
    }
    setLearningTerm(learningTerm === termKey ? null : termKey);
  };

  const renderMetric = (label: string, value: string, termKey: string) => {
    const isExpanded = learningTerm === termKey;
    const def = definitions[termKey];
    const isLearned = hasLearnedTerm.includes(termKey);

    return (
      <div className="flex flex-col gap-2">
        <div
          className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden relative ${
            isExpanded
              ? 'bg-blue-50 border border-blue-200 shadow-sm'
              : 'bg-white hover:bg-gray-50 border border-gray-100'
          }`}
          onClick={() => handleTermClick(termKey)}
        >
          {!isLearned && (
            <div className="absolute right-0 top-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              {t.xpReward}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className={`font-medium ${isExpanded ? 'text-blue-700' : 'text-gray-700'}`}>
              {label}
            </span>
            <div className="bg-blue-100 text-blue-600 rounded-full p-1 opacity-70">
              <HelpCircle size={14} />
            </div>
          </div>
          <span className="text-base sm:text-lg font-semibold text-right">{value}</span>
        </div>

        {isExpanded && def && (
          <div className="bg-white border-l-4 border-blue-500 pl-4 py-3 pr-3 shadow-sm rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Lightbulb size={18} className="text-amber-500" />
                {language === 'ENG' ? 'Quick Learn' : 'Belajar Cepat'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={e => {
                  e.stopPropagation();
                  setLearningTerm(null);
                }}
              >
                <X size={14} />
              </Button>
            </div>
            <p className="text-gray-800 font-medium mb-2 leading-snug">{def[language].simple}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{def[language].detail}</p>

            {isLearned && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-full w-fit">
                <Trophy size={14} />
                {language === 'ENG' ? 'Knowledge Gained!' : 'Ilmu Diperolehi!'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
          <h1 className="text-xl font-bold">{t.stockDetails}</h1>
          <Button
            variant={isInWatchlist ? 'secondary' : 'outline'}
            size="sm"
            onClick={() =>
              isInWatchlist ? removeFromWatchlist(stock.id) : addToWatchlist(stock)
            }
            className="gap-1.5"
          >
            <Star
              size={15}
              className={isInWatchlist ? 'fill-yellow-400 text-yellow-500' : 'text-gray-500'}
            />
            <span className="hidden sm:inline">
              {isInWatchlist ? t.inWatchlist : t.addWatchlist}
            </span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stock Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {stock.ticker.slice(0, 4)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{stock.name}</CardTitle>
                  <p className="text-gray-500 text-sm mt-0.5">
                    <span className="font-semibold text-gray-800">{stock.ticker}</span> ·{' '}
                    <span className="font-mono">{stock.bursaCode}</span> · Bursa Malaysia
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs text-blue-700 bg-blue-50">
                      {stock.sector}
                    </Badge>
                    {stock.isShariah ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
                        {t.shariahCompliant}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 text-xs">
                        {t.nonShariah}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-3xl font-bold">RM {stock.price}</p>
                <p
                  className={`text-base font-semibold flex sm:justify-end items-center gap-1 ${
                    stock.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stock.change} ({stock.changePercent})
                  {stock.isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </p>
                {stock.lastUpdated && (
                  <p className="text-xs text-gray-400 mt-1">Updated: {stock.lastUpdated}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="financials">{t.financials}</TabsTrigger>
            <TabsTrigger value="news">{t.news}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* AI Insight Card */}
            <Card className="bg-blue-50 border-blue-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <div className="bg-blue-200 p-1.5 rounded-lg text-blue-700">
                    <TrendingUp size={18} />
                  </div>
                  {language === 'ENG' ? 'JomINVEST AI Insight' : 'Wawasan AI JomINVEST'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-900 font-bold mb-1">
                  {stock.isPositive
                    ? language === 'ENG'
                      ? 'Bullish Momentum Detected 🚀'
                      : 'Momentum Naik Dikesan 🚀'
                    : language === 'ENG'
                    ? 'Value Consolidation Zone 📉'
                    : 'Zon Konsolidasi Nilai 📉'}
                </p>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                  {language === 'ENG'
                    ? `${stock.name} (${stock.bursaCode}) trades at a P/E of ${stock.peRatio} with a ${stock.dividendYield} dividend yield in the ${stock.sector} sector.`
                    : `${stock.name} (${stock.bursaCode}) didagangkan pada P/E ${stock.peRatio} dengan hasil dividen ${stock.dividendYield} dalam sektor ${stock.sector}.`}
                </p>
              </CardContent>
            </Card>

            {/* Price Chart & Trading Simulator Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t.priceChart}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-white rounded-lg p-2 border border-gray-200">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={stock.history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={str => {
                          const date = new Date(str);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        minTickGap={30}
                      />
                      <YAxis domain={['auto', 'auto']} />
                      <RechartsTooltip
                        formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Price']}
                        labelFormatter={label => new Date(label).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#16a34a"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">{stock.description}</p>
                </div>

                {/* Buy/Sell Trading Simulator Zone */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <Receipt size={20} className="text-green-600" />
                      {t.tradingSimulator}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border">
                        <Wallet size={15} className="text-green-600" />
                        <span className="text-gray-500">{t.availableCash}:</span>
                        <span className="font-bold text-gray-900">RM {cashBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border">
                        <span className="text-gray-500">{t.ownedUnits}:</span>
                        <span className="font-bold text-blue-700">{ownedUnits} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode Toggle: Standard Bursa Lot (x100) vs Student Micro-Unit (x1) */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLotMode('lot')}
                        className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          lotMode === 'lot'
                            ? 'bg-green-600 text-white border-green-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {t.lotModeLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLotMode('micro')}
                        className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          lotMode === 'micro'
                            ? 'bg-green-600 text-white border-green-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {t.microModeLabel}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Info size={13} className="text-blue-500 shrink-0" />
                      {t.lotNote}
                    </p>
                  </div>

                  {/* Quantity & Action Row */}
                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 block">
                        {t.units} ({lotMode === 'lot' ? `${quantity} lot = ${effectiveUnits} units` : `${effectiveUnits} units`})
                      </label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={decrement}>
                          <Minus size={16} />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={e => handleQuantityChange(e.target.value)}
                          className="text-center font-bold text-lg bg-white"
                        />
                        <Button variant="outline" size="icon" onClick={increment}>
                          <Plus size={16} />
                        </Button>
                      </div>

                      {/* Buy & Sell Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="lg"
                          onClick={() => addToPortfolio(stock, effectiveUnits)}
                        >
                          {t.buy} {effectiveUnits} Units
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40"
                          size="lg"
                          disabled={ownedUnits <= 0}
                          onClick={() => sellFromPortfolio(stock, effectiveUnits)}
                        >
                          {t.sell} {Math.min(effectiveUnits, ownedUnits || effectiveUnits)} Units
                        </Button>
                      </div>
                    </div>

                    {/* Transparent Bursa Malaysia Fee Breakdown */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
                      <p className="font-bold text-gray-800 text-sm mb-2">{t.feeBreakdown}</p>
                      <div className="flex justify-between text-gray-600">
                        <span>{t.grossValue} ({effectiveUnits} × RM {stock.price})</span>
                        <span className="font-medium">RM {buyFees.grossAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{t.brokerageFee}</span>
                        <span>RM {buyFees.brokerageFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{t.clearingFee}</span>
                        <span>RM {buyFees.clearingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{t.stampDuty}</span>
                        <span>RM {buyFees.stampDuty.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t">
                        <span>{t.netTotal}</span>
                        <span className="text-green-700">RM {buyFees.netTotal.toFixed(2)}</span>
                      </div>
                      {ownedUnits > 0 && (
                        <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                          <span>Est. Net Proceeds if Selling:</span>
                          <span className="font-semibold">RM {sellFees.netTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Axis Fundamental Health Radar & Peer Comparison */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="text-green-600" size={20} />
                    {t.radarTitle}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="peer-select" className="text-gray-600 whitespace-nowrap">
                      {t.compareWithPeer}
                    </label>
                    <select
                      id="peer-select"
                      value={peerStockId}
                      onChange={e => setPeerStockId(e.target.value)}
                      className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm bg-white font-medium"
                    >
                      {allStocks
                        .filter(s => s.id !== stock.id)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.ticker} ({s.sector})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="w-full h-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="axis" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name={stock.ticker}
                          dataKey={stock.ticker}
                          stroke="#16a34a"
                          fill="#16a34a"
                          fillOpacity={0.35}
                        />
                        {peerStock && (
                          <Radar
                            name={peerStock.ticker}
                            dataKey={peerStock.ticker}
                            stroke="#2563eb"
                            fill="#2563eb"
                            fillOpacity={0.25}
                          />
                        )}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Side-by-Side Peer Comparison Table */}
                  {peerStock && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                      <div className="grid grid-cols-3 text-xs font-bold uppercase text-gray-500 pb-2 border-b">
                        <span>Metric</span>
                        <span className="text-green-700">{stock.ticker}</span>
                        <span
                          className="text-blue-700 cursor-pointer hover:underline"
                          onClick={() => setSelectedStock(peerStock)}
                        >
                          {peerStock.ticker} ↗
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold">RM {stock.price}</span>
                        <span className="font-semibold">RM {peerStock.price}</span>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-600">P/E Ratio</span>
                        <span className="font-semibold">{stock.peRatio}</span>
                        <span className="font-semibold">{peerStock.peRatio}</span>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-600">Dividend Yield</span>
                        <span className="font-semibold">{stock.dividendYield}</span>
                        <span className="font-semibold">{peerStock.dividendYield}</span>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-600">Market Cap</span>
                        <span className="font-semibold">RM {stock.marketCap}</span>
                        <span className="font-semibold">RM {peerStock.marketCap}</span>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <span className="text-gray-600">Shariah</span>
                        <span className="font-semibold">{stock.isShariah ? '☪️ Yes' : 'No'}</span>
                        <span className="font-semibold">{peerStock.isShariah ? '☪️ Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics with Inline Learning - XP ENABLED */}
            <Card>
              <CardHeader>
                <CardTitle>{t.keyMetrics}</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="space-y-4">
                    {renderMetric(t.peRatio, stock.peRatio, 'P/E Ratio')}
                    {renderMetric(t.dividend, stock.dividendYield, 'Dividend Yield')}
                    {renderMetric(t.marketCap, `RM ${stock.marketCap}`, 'Market Cap')}
                    {renderMetric(t.volume, stock.volume, 'Volume')}
                    {renderMetric(
                      t.shariahStatus,
                      stock.isShariah ? t.shariahCompliant : t.nonShariah,
                      'Shariah Status'
                    )}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="text-green-600" />
                  {t.financials}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{t.revenue}</span>
                  <span className="font-semibold text-lg">RM {stock.revenue}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{t.netProfit}</span>
                  <span className="font-semibold text-lg text-green-600">RM {stock.netProfit}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{t.debtEquity}</span>
                  <span className="font-semibold text-lg">{stock.debtEquity}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6 mt-6">
            <div className="space-y-4">
              {[
                {
                  title: `${stock.name} (${stock.bursaCode}) reports resilient quarterly operational performance on Bursa Malaysia`,
                  source: 'The Edge Malaysia · 2 hours ago'
                },
                {
                  title: `Analysts maintain positive outlook on ${stock.sector} sector amid domestic institutional inflows`,
                  source: 'Bursa Marketplace · 5 hours ago'
                },
                {
                  title: `Retail and EPF participation in ${stock.ticker} remains steady going into dividend season`,
                  source: 'StarBiz · 1 day ago'
                }
              ].map((item, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Newspaper className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.source}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
