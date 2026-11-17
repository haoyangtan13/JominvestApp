import { useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, Sparkles, ShoppingBag, BarChart3 } from 'lucide-react';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';

interface AIRecommendationProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  selectedStock: StockData | null;
  setSelectedStock: (stock: StockData | null) => void;
  addToPortfolio: (stock: StockData, quantity: number) => boolean;
}

export function AIRecommendation({
  navigateTo,
  userProfile,
  language,
  stocks,
  selectedStock,
  setSelectedStock,
  addToPortfolio
}: AIRecommendationProps) {
  // Determine top 3 AI Picks tailored to the user's risk profile
  const profilePicks = useMemo(() => {
    const profileLower = (userProfile || '').toLowerCase();
    let targetTickers: string[];

    if (profileLower.includes('conservative') || profileLower.includes('protector')) {
      targetTickers = ['MAYBANK', 'PBBANK', 'TENAGA'];
    } else if (profileLower.includes('moderate') || profileLower.includes('builder')) {
      targetTickers = ['CIMB', 'MISC', 'TM'];
    } else {
      // Explorer / Aggressive
      targetTickers = ['GAMUDA', 'YTLPOWR', 'SUNWAY'];
    }

    const found = targetTickers
      .map(t => stocks.find(s => s.ticker === t))
      .filter((s): s is StockData => Boolean(s));

    return found.length > 0 ? found : stocks.slice(0, 3);
  }, [userProfile, stocks]);

  const activeStock = selectedStock || profilePicks[0] || stocks[0];

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      topPicksForProfile: 'Tailored AI Picks for Your Profile:',
      currentPrice: 'Current Price',
      change24h: '24h Change',
      aiAnalysis: 'JomINVEST AI Analysis',
      whyRecommend: `Why JomINVEST AI Highlights ${activeStock?.ticker || 'This Stock'}:`,
      reason1: 'Fundamental & Financial Strength',
      reason1desc: `${activeStock?.name} commands a ${activeStock?.marketCap} market cap in the ${activeStock?.sector} sector with RM ${activeStock?.revenue} revenue and RM ${activeStock?.netProfit} net profit.`,
      reason2: 'Valuation & Income Profile',
      reason2desc: `Trading at a P/E ratio of ${activeStock?.peRatio} with an annual dividend yield of ${activeStock?.dividendYield} (${
        activeStock?.isShariah ? '☪️ Shariah-Compliant' : 'Conventional'
      }).`,
      reason3: 'Fits Your Investor DNA',
      reason3desc: `Selected for your ${
        userProfile || 'Jom-Explorer (Aggressive)'
      } strategy with a Momentum score of ${activeStock?.radarScores?.momentum ?? 75}/100 and Financial Health score of ${
        activeStock?.radarScores?.health ?? 80
      }/100.`,
      add1Lot: 'Add 100 Units (1 Lot) to Portfolio',
      add10Units: 'Add 10 Units (Micro) to Portfolio',
      viewDetails: 'View Full Stock Details',
      keyMetrics: 'Key Metrics & 5-Axis Radar Scores',
      pe: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      shariah: 'Shariah Status',
      shariahYes: '☪️ Shariah-Compliant',
      shariahNo: 'Non-Shariah'
    },
    BM: {
      back: 'Kembali ke Dashboard',
      topPicksForProfile: 'Pilihan AI Disesuaikan Untuk Profil Anda:',
      currentPrice: 'Harga Semasa',
      change24h: 'Perubahan 24j',
      aiAnalysis: 'Analisis AI JomINVEST',
      whyRecommend: `Mengapa AI JomINVEST Menyerlahkan ${activeStock?.ticker || 'Saham Ini'}:`,
      reason1: 'Kekuatan Asas & Kewangan',
      reason1desc: `${activeStock?.name} mempunyai modal pasaran RM ${activeStock?.marketCap} dalam sektor ${activeStock?.sector} dengan hasil RM ${activeStock?.revenue} dan untung bersih RM ${activeStock?.netProfit}.`,
      reason2: 'Profil Penilaian & Dividen',
      reason2desc: `Didagangkan pada nisbah P/E ${activeStock?.peRatio} dengan hasil dividen tahunan ${activeStock?.dividendYield} (${
        activeStock?.isShariah ? '☪️ Patuh Syariah' : 'Konvensional'
      }).`,
      reason3: 'Sesuai Dengan Profil Pelabur Anda',
      reason3desc: `Dipilih untuk strategi ${
        userProfile || 'Jom-Explorer (Agresif)'
      } anda dengan skor Momentum ${activeStock?.radarScores?.momentum ?? 75}/100 dan Kesihatan Kewangan ${
        activeStock?.radarScores?.health ?? 80
      }/100.`,
      add1Lot: 'Tambah 100 Unit (1 Lot) ke Portfolio',
      add10Units: 'Tambah 10 Unit (Mikro) ke Portfolio',
      viewDetails: 'Lihat Butiran Saham Penuh',
      keyMetrics: 'Metrik Utama & Skor Radar 5-Paksi',
      pe: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      shariah: 'Status Syariah',
      shariahYes: '☪️ Patuh Syariah',
      shariahNo: 'Bukan Syariah'
    }
  };

  const t = texts[language];

  if (!activeStock) {
    return <div className="p-8 text-center">Loading AI Recommendations...</div>;
  }

  const radarList = [
    { label: 'Value', score: activeStock.radarScores?.value ?? 75 },
    { label: 'Growth', score: activeStock.radarScores?.growth ?? 75 },
    { label: 'Health', score: activeStock.radarScores?.health ?? 80 },
    { label: 'Dividend', score: activeStock.radarScores?.dividend ?? 70 },
    { label: 'Momentum', score: activeStock.radarScores?.momentum ?? 75 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            {userProfile}
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Top 3 Profile AI Picks Switcher */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t.topPicksForProfile}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profilePicks.map((pick, idx) => {
              const isSelected = pick.id === activeStock.id;
              return (
                <button
                  key={pick.id}
                  type="button"
                  onClick={() => setSelectedStock(pick)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold opacity-75">#{idx + 1}</span>
                      <span className="font-bold text-sm">{pick.ticker}</span>
                      {pick.isShariah && <span className="text-xs">☪️</span>}
                    </div>
                    <p
                      className={`text-xs truncate max-w-[140px] ${
                        isSelected ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {pick.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">RM {pick.price}</p>
                    <p
                      className={`text-xs ${
                        isSelected
                          ? 'text-green-100'
                          : pick.isPositive
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {pick.changePercent}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stock Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {activeStock.ticker.slice(0, 4)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{activeStock.name}</CardTitle>
                  <p className="text-gray-500 text-sm">
                    {activeStock.ticker} · <span className="font-mono">{activeStock.bursaCode}</span> ·{' '}
                    {activeStock.sector}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {activeStock.isShariah ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
                        {t.shariahYes}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-600">
                        {t.shariahNo}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Sparkles size={14} className="mr-1" />
                AI Pick
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t.currentPrice}</p>
                <p className="text-3xl font-bold">RM {activeStock.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.change24h}</p>
                <p
                  className={`text-2xl font-bold flex items-center gap-2 ${
                    activeStock.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {activeStock.changePercent}
                  {activeStock.isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="text-green-600" size={24} />
              <CardTitle className="text-green-900">{t.aiAnalysis}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-green-950">{t.whyRecommend}</h3>

            <div className="space-y-3">
              <div className="flex gap-3 bg-white p-4 rounded-lg shadow-2xs">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">{t.reason1}</h4>
                  <p className="text-sm text-gray-600">{t.reason1desc}</p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-lg shadow-2xs">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">{t.reason2}</h4>
                  <p className="text-sm text-gray-600">{t.reason2desc}</p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-lg shadow-2xs">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">{t.reason3}</h4>
                  <p className="text-sm text-gray-600">{t.reason3desc}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics & 5-Axis Fundamental Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-green-600" />
              {t.keyMetrics}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t.pe}</p>
                <p className="text-xl font-bold">{activeStock.peRatio}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t.dividend}</p>
                <p className="text-xl font-bold text-green-700">{activeStock.dividendYield}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t.marketCap}</p>
                <p className="text-xl font-bold">RM {activeStock.marketCap}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t.shariah}</p>
                <p className="text-sm font-bold mt-1">
                  {activeStock.isShariah ? t.shariahYes : t.shariahNo}
                </p>
              </div>
            </div>

            {/* 5-Axis Radar Score Bars */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {radarList.map(item => (
                <div key={item.label} className="bg-gray-50 p-3 rounded-lg text-center border">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-bold text-green-700">{item.score}</p>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-green-600 h-full rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
            onClick={() => addToPortfolio(activeStock, 100)}
          >
            <ShoppingBag size={18} className="mr-2" />
            {t.add1Lot}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
            size="lg"
            onClick={() => addToPortfolio(activeStock, 10)}
          >
            {t.add10Units}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => {
              setSelectedStock(activeStock);
              navigateTo('stock-details');
            }}
          >
            {t.viewDetails}
          </Button>
        </div>
      </main>
    </div>
  );
}
