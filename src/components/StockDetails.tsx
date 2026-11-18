import { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
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

const MONOGRAM_MAP: Record<string, string> = {
  MAYBANK: 'MB',
  TENAGA: 'TN',
  CIMB: 'CB',
  PBBANK: 'PB',
  GAMUDA: 'GM',
  INARI: 'IN',
  TM: 'TM',
  YTLPOWR: 'YT',
  SUNWAY: 'SW',
  MISC: 'MS',
  PETGAS: 'PG',
  IHH: 'IH',
  CELCOMDIGI: 'CD',
  MAXIS: 'MX',
  PRESSMET: 'PM',
  SDCG: 'SD',
  DIALOG: 'DL',
  SIME: 'SM',
  GENM: 'GN',
  GENTING: 'GT'
};

function getCompanyMonogram(ticker: string): string {
  const clean = (ticker || '').toUpperCase().trim();
  if (MONOGRAM_MAP[clean]) return MONOGRAM_MAP[clean];
  return clean.slice(0, 2) || 'JM';
}

function getAvatarColorClass(sector: string, ticker: string): string {
  const s = (sector || '').toLowerCase();
  const t = (ticker || '').toUpperCase();
  if (t === 'MAYBANK' || s.includes('construction') || s.includes('energy')) {
    return 'jom-avatar-amber';
  }
  if (s.includes('financial') || s.includes('bank')) {
    return 'jom-avatar-blue';
  }
  if (s.includes('utilities') || s.includes('plantation') || s.includes('healthcare')) {
    return 'jom-avatar-emerald';
  }
  if (s.includes('tech') || s.includes('telecommunications') || s.includes('telco')) {
    return 'jom-avatar-indigo';
  }
  if (s.includes('consumer') || s.includes('retail')) {
    return 'jom-avatar-rose';
  }
  return 'jom-avatar-teal';
}

function getPlainEnglishStory(
  stock: StockData,
  language: 'ENG' | 'BM'
): { howTheyMakeMoney: string; dividendVsEpf: string } {
  const divNum = parseFloat((stock.dividendYield || '0').replace('%', '')) || 0;
  const epfBenchmark = 5.5;
  const diffFromEpf = (divNum - epfBenchmark).toFixed(2);
  const beatsEpf = divNum >= epfBenchmark;

  const businessStoriesEN: Record<string, string> = {
    MAYBANK:
      'Maybank makes money by taking deposits from millions of Malaysians and businesses, lending that money out for home mortgages, car loans, and corporate expansion, and earning fees on wealth management, Maybank Islamic, and regional transactions across ASEAN.',
    TENAGA:
      'Tenaga Nasional (TNB) keeps the lights on across Peninsular Malaysia. They earn steady, regulated cash flow every month from households, factories, and hyperscale data centers paying their electricity bills.',
    CIMB:
      'CIMB Group earns money from consumer banking, Touch ’n Go Digital partnerships, corporate investment banking, and cross-border accounts across Malaysia, Indonesia, Singapore, and Thailand.',
    PBBANK:
      'Public Bank focuses on cautious, everyday Malaysian borrowers — residential home loans, passenger car hire-purchase, and small-business financing — maintaining one of the lowest loan default rates in Asia.',
    GAMUDA:
      'Gamuda builds major infrastructure — MRT lines, highways, water treatment plants, and data center campuses in Malaysia, Australia, and Taiwan — alongside developing master-planned residential townships.',
    INARI:
      'Inari Amertron is Malaysia’s largest semiconductor outsourced assembly and test (OSAT) player in Penang. Whenever global smartphone and AI server makers ship radio-frequency and optical chips, Inari gets paid to package and test them.'
  };

  const businessStoriesBM: Record<string, string> = {
    MAYBANK:
      'Maybank menjana pendapatan melalui simpanan jutaan rakyat dan peniaga Malaysia, menyalurkan pembiayaan perumahan, kenderaan, dan perniagaan, serta mengutip yuran perbankan Islam dan transaksi serantau di seluruh ASEAN.',
    TENAGA:
      'Tenaga Nasional (TNB) membekalkan elektrik ke seluruh Semenanjung Malaysia. Mereka memperoleh aliran tunai berulang setiap bulan apabila isi rumah, kilang, dan pusat data membayar bil elektrik.',
    CIMB:
      'CIMB menjana pendapatan daripada perbankan pengguna, ekosistem digital, perbankan pelaburan korporat, dan rangkaian serantau di Malaysia, Indonesia, Singapura, dan Thailand.',
    PBBANK:
      'Public Bank memberi tumpuan kepada pinjaman perumahan, pembiayaan kereta, dan PKS tempatan dengan rekod kualiti pinjaman yang sangat berdisiplin.',
    GAMUDA:
      'Gamuda membina projek infrastruktur utama seperti laluan MRT, lebuh raya, dan pusat data, selain membangunkan perbandaran kediaman di Malaysia dan luar negara.',
    INARI:
      'Inari Amertron memasang dan menguji cip semikonduktor frekuensi radio serta optik di Pulau Pinang untuk pengeluar telefon pintar dan pelayan AI global.'
  };

  const howTheyMakeMoney =
    language === 'ENG'
      ? businessStoriesEN[stock.ticker] ||
        `${stock.name} operates in Malaysia's ${stock.sector} sector. ${stock.description} They generate RM ${stock.revenue} in annual revenue and keep RM ${stock.netProfit} in net profit after expenses.`
      : businessStoriesBM[stock.ticker] ||
        `${stock.name} beroperasi dalam sektor ${stock.sector} di Malaysia. ${stock.description} Mereka menjana jualan tahunan RM ${stock.revenue} dengan keuntungan bersih RM ${stock.netProfit}.`;

  const dividendVsEpf =
    language === 'ENG'
      ? divNum > 0
        ? beatsEpf
          ? `${stock.name} pays a ${stock.dividendYield} annual cash dividend yield, which is +${diffFromEpf}% higher than the EPF (5.5%) historical benchmark. Unlike EPF savings, share prices move daily on Bursa Malaysia.`
          : `${stock.name} pays a ${stock.dividendYield} annual cash dividend yield compared to the EPF (5.5%) benchmark. Investors hold this stock for a combination of long-term capital growth and regular dividend payouts.`
        : `${stock.name} currently pays a ${stock.dividendYield} dividend yield compared to the EPF (5.5%) benchmark. The company reinvests most of its earnings back into expanding operations.`
      : divNum > 0
      ? beatsEpf
        ? `${stock.name} membayar hasil dividen tunai tahunan ${stock.dividendYield}, iaitu +${diffFromEpf}% lebih tinggi berbanding penanda aras KWSP (5.5%). Tidak seperti simpanan KWSP, harga saham berubah setiap hari di Bursa Malaysia.`
        : `${stock.name} membayar hasil dividen tunai tahunan ${stock.dividendYield} berbanding penanda aras KWSP (5.5%). Pelabur lazimnya memegang saham ini untuk gabungan pertumbuhan modal dan agihan tunai.`
      : `${stock.name} mempunyai hasil dividen ${stock.dividendYield} berbanding penanda aras KWSP (5.5%). Syarikat melaburkan semula sebahagian besar keuntungan untuk mengembangkan operasi.`;

  return { howTheyMakeMoney, dividendVsEpf };
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
  const [lotMode, setLotMode] = useState<'lot' | 'micro'>('lot');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [learningTerm, setLearningTerm] = useState<string | null>(null);
  const [peerStockId, setPeerStockId] = useState<string>('');

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

  const definitions: Record<
    string,
    {
      ENG: { simple: string; detail: string; example: string };
      BM: { simple: string; detail: string; example: string };
    }
  > = {
    'P/E Ratio': {
      ENG: {
        simple: 'How many years of current profits it takes to pay back the share price.',
        detail:
          'Price-to-Earnings (P/E) compares a company’s share price to the profit it earns per share. A lower P/E can mean the stock is reasonably priced, while a higher P/E means investors expect faster future growth.',
        example:
          'Example: Buying a neighbourhood Mamak stall for RM 120,000 that earns RM 10,000 net profit a year equals a 12x P/E ratio.'
      },
      BM: {
        simple: 'Berapa tahun keuntungan semasa diperlukan untuk menyamai harga belian saham.',
        detail:
          'Nisbah Harga-kepada-Pendapatan (P/E) membandingkan harga saham dengan keuntungan bersih sesaham.',
        example:
          'Contoh: Membeli kedai makan pada harga RM 120,000 yang menjana untung bersih RM 10,000 setahun bersamaan P/E 12x.'
      }
    },
    'Dividend Yield': {
      ENG: {
        simple: 'Your yearly cash payout expressed as a percentage of the share price.',
        detail:
          'Profitable Malaysian companies regularly share part of their cash profits with shareholders. You can compare this directly against EPF (5.5%) or bank fixed deposit rates.',
        example:
          'Example: If a Bursa stock costs RM 10.00 and pays RM 0.60 in annual cash dividends, its Dividend Yield is 6.0%.'
      },
      BM: {
        simple: 'Pulangan tunai tahunan yang dibayar kepada pemegang saham dalam bentuk peratusan.',
        detail:
          'Syarikat kukuh di Malaysia lazimnya berkongsi sebahagian keuntungan tunai dengan pelabur setiap tahun.',
        example:
          'Contoh: Jika harga saham ialah RM 10.00 dan ia membayar dividen tunai RM 0.60 setahun, Hasil Dividen ialah 6.0%.'
      }
    },
    'Market Cap': {
      ENG: {
        simple: 'The total market value of 100% of the company’s shares on Bursa Malaysia.',
        detail:
          'Calculated by multiplying the current Share Price by Total Issued Shares. Larger blue-chip companies on the FBM KLCI tend to have more stable earnings.',
        example:
          'Example: A company with 10 billion shares trading at RM 10.00 each has a RM 100B Market Cap.'
      },
      BM: {
        simple: 'Nilai keseluruhan syarikat jika anda membeli 100% sahamnya di Bursa Malaysia.',
        detail:
          'Dikira dengan mendarabkan Harga Saham Semasa dengan Jumlah Saham Terbitan.',
        example:
          'Contoh: Syarikat dengan 10 bilion saham pada harga RM 10.00 sesaham mempunyai Modal Pasaran RM 100B.'
      }
    },
    'FY Revenue / Profit': {
      ENG: {
        simple: 'Total annual customer sales vs. the net profit left after paying all costs.',
        detail:
          'Revenue is the top-line money coming in from customers; Net Profit is the bottom-line earnings left after salaries, materials, taxes, and interest.',
        example:
          'Example: If a company collects RM 10B in sales and spends RM 8B running the business, RM 2B remains as net profit.'
      },
      BM: {
        simple: 'Jumlah jualan tahunan berbanding untung bersih selepas ditolak semua kos.',
        detail:
          'Hasil (Revenue) ialah jumlah jualan keseluruhan; Untung Bersih ialah baki keuntungan selepas kos operasi dan cukai.',
        example:
          'Contoh: Jika syarikat mengutip jualan RM 10B dan membelanjakan RM 8B untuk kos, RM 2B kekal sebagai untung bersih.'
      }
    }
  };

  const peerStock = useMemo(
    () => allStocks.find(s => s.id === peerStockId) || null,
    [allStocks, peerStockId]
  );

  const healthDimensions = useMemo(() => {
    if (!stock) return [];
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
        key: 'value',
        axis: 'Valuation',
        label: language === 'ENG' ? 'Valuation' : 'Penilaian',
        score: scores.value,
        peerScore: peerScores?.value ?? null
      },
      {
        key: 'growth',
        axis: 'Growth',
        label: language === 'ENG' ? 'Growth' : 'Pertumbuhan',
        score: scores.growth,
        peerScore: peerScores?.growth ?? null
      },
      {
        key: 'health',
        axis: 'Financial Health',
        label: language === 'ENG' ? 'Financial Health' : 'Kesihatan Kewangan',
        score: scores.health,
        peerScore: peerScores?.health ?? null
      },
      {
        key: 'dividend',
        axis: 'Dividends',
        label: language === 'ENG' ? 'Dividends' : 'Dividen',
        score: scores.dividend,
        peerScore: peerScores?.dividend ?? null
      },
      {
        key: 'momentum',
        axis: 'Momentum',
        label: language === 'ENG' ? 'Momentum' : 'Momentum',
        score: scores.momentum,
        peerScore: peerScores?.momentum ?? null
      }
    ];
  }, [stock, peerStock, language]);

  const radarData = useMemo(() => {
    if (!stock) return [];
    return healthDimensions.map(dim => ({
      axis: dim.axis,
      [stock.ticker]: dim.score,
      ...(peerStock && dim.peerScore !== null ? { [peerStock.ticker]: dim.peerScore } : {})
    }));
  }, [stock, peerStock, healthDimensions]);

  const filteredChartHistory = useMemo(() => {
    if (!stock?.history?.length) return [];
    const len = stock.history.length;
    if (timeframe === '1D') return stock.history.slice(Math.max(0, len - 5));
    if (timeframe === '1W') return stock.history.slice(Math.max(0, len - 7));
    if (timeframe === '1M') return stock.history;
    if (timeframe === '3M') return stock.history;
    return stock.history;
  }, [stock, timeframe]);

  if (!stock) {
    return <div className="rh-page">Loading company overview...</div>;
  }

  const isInWatchlist = watchlist.some(w => w.id === stock.id);
  const ownedHolding = portfolio.find(item => item.stock.id === stock.id);
  const ownedUnits = ownedHolding ? ownedHolding.quantity : 0;

  const effectiveUnits = lotMode === 'lot' ? quantity * 100 : quantity;
  const priceNum = parseFloat(stock.price);
  const buyFees = calculateBursaFees(priceNum, effectiveUnits, 'BUY');
  const sellUnits = Math.min(effectiveUnits, ownedUnits || effectiveUnits);
  const sellFees = calculateBursaFees(priceNum, sellUnits, 'SELL');
  const fees = tradeSide === 'BUY' ? buyFees : sellFees;

  const monogram = getCompanyMonogram(stock.ticker);
  const avatarColor = getAvatarColorClass(stock.sector, stock.ticker);
  const plainStory = getPlainEnglishStory(stock, language);

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
      addXP(10, `Learned ${termKey}`);
      setHasLearnedTerm([...hasLearnedTerm, termKey]);
    }
    setLearningTerm(learningTerm === termKey ? null : termKey);
  };

  const keyStats = [
    {
      key: 'P/E Ratio',
      label: language === 'ENG' ? 'P/E Ratio' : 'Nisbah P/E',
      value: `${stock.peRatio}x`
    },
    {
      key: 'Dividend Yield',
      label: language === 'ENG' ? 'Dividend Yield' : 'Hasil Dividen',
      value: stock.dividendYield
    },
    {
      key: 'Market Cap',
      label: language === 'ENG' ? 'Market Cap' : 'Modal Pasaran',
      value: `RM ${stock.marketCap}`
    },
    {
      key: 'FY Revenue / Profit',
      label: language === 'ENG' ? 'FY Revenue / Profit' : 'Jualan / Untung',
      value: `RM ${stock.revenue} / RM ${stock.netProfit}`
    }
  ];

  const handleOrderSubmit = () => {
    if (tradeSide === 'BUY') {
      addToPortfolio(stock, effectiveUnits);
    } else if (ownedUnits > 0) {
      sellFromPortfolio(stock, sellUnits);
    }
  };

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Column (.rh-main) */}
        <div className="rh-main space-y-8">
          {/* Simple Back Button */}
          <div>
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="text-sm font-medium cursor-pointer"
              style={{ color: 'var(--ink-secondary)', background: 'none', border: 'none', padding: 0 }}
            >
              {language === 'ENG' ? '← Back to Stocks' : '← Kembali ke Saham'}
            </button>
          </div>

          {/* Unboxed Stock Header & Interactive Chart */}
          <div>
            <div className="flex items-center gap-3.5">
              <div className={`jom-avatar jom-avatar-lg ${avatarColor}`}>
                {monogram}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>
                  {stock.name}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                  {stock.ticker} · {stock.bursaCode} · {stock.sector}
                  {stock.isShariah ? ' · Shariah Compliant' : ''}
                </p>
              </div>
            </div>

            <div className="rh-hero-num mt-3">RM {stock.price}</div>
            <div
              className="text-sm font-medium mt-1"
              style={{ color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
            >
              {stock.change} ({stock.changePercent}) · {timeframe}
            </div>

            <div className="w-full mt-4" style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartHistory}>
                  <defs>
                    <linearGradient id="rhStockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    tickFormatter={str => {
                      const date = new Date(str);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    minTickGap={28}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    width={48}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, stock.ticker]}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rhStockGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rh-timeframe-bar">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
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

          {/* About {stock.name} */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
              {language === 'ENG' ? `About ${stock.name}` : ` Mengenai ${stock.name}`}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {plainStory.howTheyMakeMoney}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {plainStory.dividendVsEpf}
            </p>
          </div>

          {/* Key Stats (.rh-stat-grid) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
                {language === 'ENG' ? 'Key Stats' : 'Statistik Utama'}
              </h2>
              <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                {language === 'ENG'
                  ? 'Click any metric to learn (+10 XP)'
                  : 'Klik mana-mana statistik untuk belajar (+10 XP)'}
              </span>
            </div>

            <div className="rh-stat-grid">
              {keyStats.map(stat => {
                const isSelected = learningTerm === stat.key;
                const isLearned = hasLearnedTerm.includes(stat.key);
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => handleTermClick(stat.key)}
                    className="rh-card text-left cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--accent-brand)' : 'var(--border-hairline)'
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {stat.label}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isLearned ? 'var(--accent-brand)' : 'var(--ink-muted)' }}
                      >
                        {isLearned ? '✓' : '+10 XP'}
                      </span>
                    </div>
                    <div
                      className="font-tabular text-base font-bold mt-1.5"
                      style={{ color: 'var(--ink-primary)' }}
                    >
                      {stat.value}
                    </div>
                  </button>
                );
              })}
            </div>

            {learningTerm && definitions[learningTerm] && (
              <div className="rh-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                    {learningTerm}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLearningTerm(null)}
                    className="text-xs cursor-pointer"
                    style={{ color: 'var(--ink-muted)', background: 'none', border: 'none' }}
                  >
                    {language === 'ENG' ? 'Close' : 'Tutup'}
                  </button>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                  {definitions[learningTerm][language].simple}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                  {definitions[learningTerm][language].detail}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {definitions[learningTerm][language].example}
                </p>
              </div>
            )}
          </div>

          {/* Company Health vs. Peer (.rh-card) */}
          <div className="rh-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
                {language === 'ENG' ? 'Company Health vs. Peer' : 'Kesihatan Syarikat vs. Setara'}
              </h2>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Select peer stock"
                  value={peerStockId}
                  onChange={e => setPeerStockId(e.target.value)}
                  className="jom-input text-xs font-tabular"
                  style={{ width: 'auto', minWidth: '170px' }}
                >
                  {allStocks
                    .filter(s => s.id !== stock.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.ticker} · {s.name}
                      </option>
                    ))}
                </select>
                {peerStock && (
                  <button
                    type="button"
                    onClick={() => setSelectedStock(peerStock)}
                    className="jom-btn text-xs"
                  >
                    {peerStock.ticker}
                  </button>
                )}
              </div>
            </div>

            <div className="rh-grid-2 items-center">
              <div className="space-y-3">
                {healthDimensions.map(dim => (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                        {dim.label}
                      </span>
                      <span className="font-tabular" style={{ color: 'var(--ink-secondary)' }}>
                        <strong style={{ color: 'var(--accent-brand)' }}>
                          {stock.ticker} {dim.score}
                        </strong>
                        {peerStock && dim.peerScore !== null
                          ? ` · ${peerStock.ticker} ${dim.peerScore}`
                          : ''}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border-hairline)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${dim.score}%`,
                          backgroundColor: 'var(--accent-brand)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full" style={{ height: '230px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-hairline)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fill: 'var(--ink-secondary)' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name={stock.ticker}
                      dataKey={stock.ticker}
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.25}
                    />
                    {peerStock && (
                      <Radar
                        name={peerStock.ticker}
                        dataKey={peerStock.ticker}
                        stroke="#64748B"
                        fill="#64748B"
                        fillOpacity={0.15}
                      />
                    )}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Rail (.rh-rail) */}
        <aside className="rh-rail space-y-4">
          <div className="rh-card space-y-4">
            {/* Top Tabs: Buy {stock.ticker} | Sell {stock.ticker} */}
            <div
              className="grid grid-cols-2 border-b pb-3 gap-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <button
                type="button"
                onClick={() => setTradeSide('BUY')}
                className={`rh-tf-btn text-center ${tradeSide === 'BUY' ? 'active' : ''}`}
              >
                {language === 'ENG' ? `Buy ${stock.ticker}` : `Beli ${stock.ticker}`}
              </button>
              <button
                type="button"
                onClick={() => setTradeSide('SELL')}
                className={`rh-tf-btn text-center ${tradeSide === 'SELL' ? 'active' : ''}`}
              >
                {language === 'ENG' ? `Sell ${stock.ticker}` : `Jual ${stock.ticker}`}
              </button>
            </div>

            {/* Order Type Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Order Type' : 'Jenis Pesanan'}
                </span>
                <span className="font-tabular" style={{ color: 'var(--ink-muted)' }}>
                  {effectiveUnits} {language === 'ENG' ? 'shares' : 'saham'}
                </span>
              </div>
              <div className="jom-segmented w-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLotMode('lot')}
                  className={lotMode === 'lot' ? 'active' : ''}
                >
                  {language === 'ENG' ? '100 Shares (Lot)' : '100 Saham (Lot)'}
                </button>
                <button
                  type="button"
                  onClick={() => setLotMode('micro')}
                  className={lotMode === 'micro' ? 'active' : ''}
                >
                  {language === 'ENG' ? '1 Share' : '1 Saham'}
                </button>
              </div>
            </div>

            {/* Quantity Row */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Quantity' : 'Kuantiti'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={decrement}
                  className="jom-btn px-2.5 py-1.5"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className="jom-input font-tabular text-center font-semibold"
                  style={{ width: '68px', padding: '0.35rem 0.5rem' }}
                />
                <button
                  type="button"
                  onClick={increment}
                  className="jom-btn px-2.5 py-1.5"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Market Price Row */}
            <div
              className="flex items-center justify-between text-xs pt-2 border-t"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <span style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Market Price' : 'Harga Pasaran'}
              </span>
              <span className="font-tabular font-semibold" style={{ color: 'var(--ink-primary)' }}>
                RM {stock.price}
              </span>
            </div>

            {/* Collapsible Estimated Fees */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowFeeBreakdown(prev => !prev)}
                className="w-full flex items-center justify-between text-xs cursor-pointer"
                style={{ color: 'var(--ink-secondary)', background: 'none', border: 'none', padding: 0 }}
              >
                <span className="flex items-center gap-1">
                  <span>
                    {language === 'ENG'
                      ? `Estimated Fees (RM ${fees.totalFees.toFixed(2)})`
                      : `Anggaran Yuran (RM ${fees.totalFees.toFixed(2)})`}
                  </span>
                  {showFeeBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
                <span className="font-tabular">RM {fees.totalFees.toFixed(2)}</span>
              </button>

              {showFeeBreakdown && (
                <div
                  className="p-3 rounded-lg space-y-1.5 text-xs font-tabular"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>Brokerage</span>
                    <span>RM {fees.brokerageFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>Clearing Fee</span>
                    <span>RM {fees.clearingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>Stamp Duty</span>
                    <span>RM {fees.stampDuty.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Total */}
            <div
              className="flex items-baseline justify-between pt-3 border-t font-tabular"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                {language === 'ENG' ? 'Estimated Total' : 'Anggaran Jumlah'}
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
                RM {fees.netTotal.toFixed(2)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={tradeSide === 'SELL' && ownedUnits <= 0}
              onClick={handleOrderSubmit}
              className="jom-btn jom-btn-primary w-full"
            >
              {tradeSide === 'BUY'
                ? language === 'ENG'
                  ? `Buy ${effectiveUnits} ${stock.ticker}`
                  : `Beli ${effectiveUnits} ${stock.ticker}`
                : language === 'ENG'
                ? `Sell ${ownedUnits > 0 ? sellUnits : 0} ${stock.ticker}`
                : `Jual ${ownedUnits > 0 ? sellUnits : 0} ${stock.ticker}`}
            </button>

            {/* Footer Line: Buying Power & Owned Shares */}
            <div
              className="pt-2 border-t text-center space-y-1 text-xs font-tabular"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-muted)' }}
            >
              <div>RM {cashBalance.toFixed(2)} buying power available</div>
              {ownedUnits > 0 && (
                <div style={{ color: 'var(--ink-secondary)' }}>
                  {ownedUnits} shares owned
                </div>
              )}
            </div>
          </div>

          {/* Watchlist Button Below Order Card */}
          <button
            type="button"
            onClick={() =>
              isInWatchlist ? removeFromWatchlist(stock.id) : addToWatchlist(stock)
            }
            className="jom-btn w-full"
          >
            <Bookmark size={14} />
            <span>
              {isInWatchlist
                ? language === 'ENG'
                  ? 'In Watchlist'
                  : 'Dalam Senarai Pantau'
                : language === 'ENG'
                ? 'Add to Watchlist'
                : 'Tambah ke Senarai Pantau'}
            </span>
          </button>
        </aside>
      </div>
    </div>
  );
}
