import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  TrendingUp
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
): { howTheyMakeMoney: string; dividendVsEpf: string; shariahNote: string } {
  const divNum = parseFloat((stock.dividendYield || '0').replace('%', '')) || 0;
  const epfBenchmark = 5.5;
  const diffFromEpf = (divNum - epfBenchmark).toFixed(2);
  const beatsEpf = divNum >= epfBenchmark;

  const businessStoriesEN: Record<string, string> = {
    MAYBANK:
      'Maybank makes money the way a giant community bank does: by taking deposits from millions of Malaysians and businesses, lending that money out for home mortgages, car loans, and corporate expansion, and earning fees on wealth management, Islamic banking (Maybank Islamic), and regional transactions across ASEAN.',
    TENAGA:
      'Tenaga Nasional (TNB) keeps the lights on across Peninsular Malaysia. They earn steady, regulated cash flow every month from households, factories, and new hyperscale data centers paying their electricity bills, making their revenue much more predictable than typical companies.',
    CIMB:
      'CIMB Group earns money from consumer banking, Touch ’n Go Digital ecosystem partnerships, corporate investment banking, and cross-border accounts across Malaysia, Indonesia, Singapore, and Thailand.',
    PBBANK:
      'Public Bank focuses on cautious, everyday Malaysian borrowers — residential home loans, passenger car hire-purchase, and small-business financing — keeping one of the lowest loan default rates in Asia.',
    GAMUDA:
      'Gamuda builds mega infrastructure — MRT lines, highways, water treatment plants, and data center campuses in Malaysia, Australia, and Taiwan — plus develops master-planned townships where families buy homes.',
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
        `${stock.name} operates in Malaysia's ${stock.sector} sector. ${stock.description} They generate RM ${stock.revenue} in annual sales and keep RM ${stock.netProfit} as net profit after expenses.`
      : businessStoriesBM[stock.ticker] ||
        `${stock.name} beroperasi dalam sektor ${stock.sector} di Malaysia. ${stock.description} Mereka menjana jualan tahunan RM ${stock.revenue} dengan keuntungan bersih RM ${stock.netProfit}.`;

  const dividendVsEpf =
    language === 'ENG'
      ? divNum > 0
        ? beatsEpf
          ? `Pays a ${stock.dividendYield} annual cash dividend — that is +${diffFromEpf}% higher than the historical EPF (KWSP) ~5.50% dividend benchmark, though share prices can move up and down.`
          : `Pays a ${stock.dividendYield} annual cash dividend (compared to EPF's ~5.50% benchmark). Investors usually hold this for a mix of share price growth and regular cash payouts.`
        : `Currently reinvests most profits back into growing the business rather than paying a cash dividend (compared to EPF's ~5.50% annual dividend).`
      : divNum > 0
      ? beatsEpf
        ? `Membayar dividen tunai tahunan ${stock.dividendYield} — iaitu +${diffFromEpf}% lebih tinggi berbanding penanda aras KWSP (~5.50%), walaupun harga saham boleh turun naik.`
        : `Membayar dividen tunai tahunan ${stock.dividendYield} (berbanding penanda aras KWSP ~5.50%). Sesuai untuk gabungan potensi kenaikan harga dan dividen.`
      : `Menumpukan keuntungan semula untuk mengembangkan perniagaan berbanding agihan dividen tunai (penanda aras KWSP ~5.50%).`;

  const shariahNote =
    language === 'ENG'
      ? stock.isShariah
        ? 'Approved as Shariah-compliant by the Securities Commission Malaysia (SAC) — its core business activities and debt levels meet strict Islamic finance guidelines.'
        : 'Classified as a Conventional stock on Bursa Malaysia (often because it operates in conventional banking/finance or exceeds the 33% conventional debt threshold).'
      : stock.isShariah
      ? 'Diiktiraf Patuh Syariah oleh Majlis Penasihat Syariah (MPS) Suruhanjaya Sekuriti Malaysia — aktiviti perniagaan dan nisbah kewangannya mematuhi garis panduan Syariah.'
      : 'Dikategorikan sebagai saham Konvensional di Bursa Malaysia (lazimnya kerana perbankan konvensional atau nisbah hutang konvensional melebihi 33%).';

  return { howTheyMakeMoney, dividendVsEpf, shariahNote };
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
          'Price-to-Earnings (P/E) compares a company’s share price to the profit it earns per share. A lower P/E can mean the stock is a bargain (or growing slowly), while a higher P/E means investors expect strong future growth.',
        example:
          'Malaysian Example: Imagine buying a neighbourhood Mamak stall for RM 120,000 that earns RM 10,000 net profit a year. Your P/E ratio is 12x — it takes 12 years of steady teh tarik profits to earn back your purchase price.'
      },
      BM: {
        simple: 'Berapa tahun keuntungan semasa diperlukan untuk menyamai harga belian saham.',
        detail:
          'Nisbah Harga-kepada-Pendapatan (P/E) membandingkan harga saham dengan keuntungan bersih sesaham. P/E rendah mungkin bermaksud saham murah, manakala P/E tinggi menandakan pelabur menjangkakan pertumbuhan pesat.',
        example:
          'Contoh Malaysia: Bayangkan membeli kedai makan pada harga RM 120,000 yang menjana untung bersih RM 10,000 setahun. Nisbah P/E ialah 12x — mengambil masa 12 tahun untuk balik modal.'
      }
    },
    'Dividend Yield': {
      ENG: {
        simple: 'Your yearly cash "thank you" payout as a percentage of the share price.',
        detail:
          'Profitable Malaysian companies (like banks, utilities, and REITs) regularly share part of their cash profits with shareholders. You can compare this directly against EPF (KWSP) or ASB returns.',
        example:
          'Malaysian Example: If a Bursa stock costs RM 10.00 and pays RM 0.60 in cash dividends per year, its Dividend Yield is 6.0% — beating a typical 3.0% bank Fixed Deposit.'
      },
      BM: {
        simple: 'Pulangan tunai tahunan yang dibayar kepada pemegang saham dalam bentuk peratusan.',
        detail:
          'Syarikat kukuh di Malaysia lazimnya berkongsi sebahagian keuntungan tunai dengan pelabur setiap setengah tahun atau suku tahun. Anda boleh membandingkannya dengan kadar KWSP atau ASB.',
        example:
          'Contoh Malaysia: Jika harga saham ialah RM 10.00 dan ia membayar dividen tunai RM 0.60 setahun, Hasil Dividen ialah 6.0% — melebihi Simpanan Tetap (FD) bank ~3.0%.'
      }
    },
    'Market Cap': {
      ENG: {
        simple: 'The total price tag if you bought 100% of the company on Bursa Malaysia.',
        detail:
          'Short for Market Capitalisation (Share Price × Total Shares). The 30 largest companies on Bursa Malaysia make up the flagship FBM KLCI index and tend to be more stable than tiny companies.',
        example:
          'Malaysian Example: A company with 10 billion shares trading at RM 10.00 each has a RM 100 Billion Market Cap — making it a giant Malaysian blue-chip.'
      },
      BM: {
        simple: 'Nilai keseluruhan syarikat jika anda membeli 100% sahamnya di Bursa Malaysia.',
        detail:
          'Dikira dengan mendarabkan Harga Saham Semasa × Jumlah Saham Terbitan. 30 syarikat terbesar membentuk indeks utama FBM KLCI yang lebih stabil.',
        example:
          'Contoh Malaysia: Syarikat dengan 10 bilion saham pada harga RM 10.00 sesaham mempunyai Modal Pasaran RM 100 Bilion (saham cip biru utama).'
      }
    },
    'Volume': {
      ENG: {
        simple: 'How many shares changed hands today on Bursa Malaysia.',
        detail:
          'High trading volume means lots of buyers and sellers are active right now, making it easy to buy or sell your shares quickly near the displayed price.',
        example:
          'Malaysian Example: Like a busy night market in Pasar Malam Taman Connaught — when there are plenty of buyers and sellers, transactions happen smoothly in seconds.'
      },
      BM: {
        simple: 'Jumlah bilangan saham yang bertukar tangan hari ini di Bursa Malaysia.',
        detail:
          'Volum dagangan tinggi bermaksud ramai pembeli dan penjual sedang aktif, memudahkan anda membeli atau menjual saham pada bila-bila masa.',
        example:
          'Contoh Malaysia: Seperti pasar malam yang meriah — apabila ramai pembeli dan penjual, urus niaga berlaku dengan cepat dan mudah.'
      }
    },
    'Shariah Status': {
      ENG: {
        simple: 'Checked twice a year by Securities Commission Malaysia for Islamic investing.',
        detail:
          'The Shariah Advisory Council (SAC) screens companies every May and November. To pass, a company must earn less than 5% from non-halal activities (conventional banking, gambling, alcohol, tobacco) and keep conventional debt & cash below 33% of total assets.',
        example:
          'Malaysian Example: Tenaga Nasional and Telekom Malaysia are Shariah-compliant, whereas conventional banks like Maybank (group level) are classified as Conventional.'
      },
      BM: {
        simple: 'Disemak dua kali setahun oleh Suruhanjaya Sekuriti Malaysia untuk pelaburan Islam.',
        detail:
          'Majlis Penasihat Syariah (MPS) menyaring syarikat setiap Mei dan November. Syarikat perlu memastikan hasil aktiviti tidak patuh di bawah 5% dan nisbah hutang konvensional di bawah 33% daripada jumlah aset.',
        example:
          'Contoh Malaysia: Tenaga Nasional dan Telekom Malaysia adalah Patuh Syariah, manakala bank konvensional dikategorikan sebagai Konvensional.'
      }
    }
  };

  const texts = {
    ENG: {
      backToScreener: 'Back to Explore',
      addWatchlist: 'Save to Watchlist',
      inWatchlist: 'Saved in Watchlist',
      viewThesis: 'See Personalised Picks',
      currentPriceLabel: 'Current Share Price',
      chartSub: 'Price history on Bursa Malaysia',
      chartTitle: 'Share Price Performance',
      plainEnglishBadge: 'Beginner Story Card',
      plainEnglishTitle: 'In Plain English: How They Make Money',
      businessModelLabel: 'What the business actually does',
      dividendCompareLabel: 'How the dividend compares to EPF (5.5%)',
      shariahLabel: 'Shariah & regulatory check',
      radarSub: '5 key areas scored out of 100',
      radarTitle: 'Company Health Check & Peer Comparison',
      compareWithPeer: 'Compare side-by-side with:',
      colMetric: 'Key Number',
      peRatio: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Company Size (Market Cap)',
      revenue: 'Annual Revenue',
      netProfit: 'Annual Net Profit',
      debtEquity: 'Debt-to-Equity',
      volume: 'Trading Volume',
      shariahStatus: 'Shariah Status',
      glossarySub: 'Tap any card below to unlock a plain-English analogy and earn +10 XP',
      glossaryTitle: 'Tap to Learn: Key Numbers Explained (+10 XP)',
      ticketTitle: 'Practice Trade',
      ticketSub: 'Risk-free virtual order on Bursa Malaysia',
      buyTab: 'Buy Shares',
      sellTab: 'Sell Shares',
      boardLot: 'Standard Lot (100 shares)',
      microUnit: 'Starter Unit (1 share)',
      quantityLabel: 'How many units?',
      totalSharesLabel: 'Total shares',
      availableCash: 'Practice Buying Power',
      currentPosition: 'Shares You Own',
      estimatedTotal: 'Estimated Total',
      estimatedProceeds: 'Estimated Cash Proceeds',
      includingFees: 'Includes RM',
      inBursaFees: 'in Bursa fees',
      toggleFeeShow: 'View Bursa Malaysia fee breakdown',
      toggleFeeHide: 'Hide Bursa Malaysia fee breakdown',
      grossPrincipal: 'Share Value',
      brokerageFee: 'Brokerage Fee (0.10%, min RM1)',
      clearingFee: 'Bursa Clearing Fee (0.03%)',
      stampDuty: 'Government Stamp Duty',
      executeBuy: 'Practice Buy',
      executeSell: 'Practice Sell',
      lotFootnote:
        'On Bursa Malaysia, 1 Standard Lot equals 100 shares. Switch to Starter Unit (1 share) if you want to practice with smaller ringgit amounts.',
      newsSub: 'Recent company updates & context',
      newsTitle: 'What Investors Are Watching'
    },
    BM: {
      backToScreener: 'Kembali ke Teroka',
      addWatchlist: 'Simpan ke Senarai Pantau',
      inWatchlist: 'Disimpan dalam Senarai Pantau',
      viewThesis: 'Lihat Pilihan Peribadi',
      currentPriceLabel: 'Harga Saham Semasa',
      chartSub: 'Sejarah harga di Bursa Malaysia',
      chartTitle: 'Prestasi Harga Saham',
      plainEnglishBadge: 'Panduan Mudah Faham',
      plainEnglishTitle: 'Bahasa Mudah: Cara Syarikat Ini Menjana Wang',
      businessModelLabel: 'Apa yang dilakukan oleh syarikat ini',
      dividendCompareLabel: 'Perbandingan dividen dengan KWSP (5.5%)',
      shariahLabel: 'Semakan status Syariah',
      radarSub: '5 faktor utama dinilai daripada 100',
      radarTitle: 'Semakan Kesihatan Syarikat & Perbandingan Rakan Setara',
      compareWithPeer: 'Bandingkan dengan:',
      colMetric: 'Nombor Utama',
      peRatio: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Saiz Syarikat (Modal Pasaran)',
      revenue: 'Jualan Tahunan',
      netProfit: 'Untung Bersih Tahunan',
      debtEquity: 'Hutang/Ekuiti',
      volume: 'Volum Dagangan',
      shariahStatus: 'Status Syariah',
      glossarySub: 'Tekan mana-mana kad di bawah untuk contoh mudah Malaysia dan ganjaran +10 XP',
      glossaryTitle: 'Tekan untuk Belajar: Nombor Utama Dijelaskan (+10 XP)',
      ticketTitle: 'Latihan Dagangan',
      ticketSub: 'Pesanan simulasi bebas risiko di Bursa Malaysia',
      buyTab: 'Beli Saham',
      sellTab: 'Jual Saham',
      boardLot: 'Lot Standard (100 saham)',
      microUnit: 'Unit Permulaan (1 saham)',
      quantityLabel: 'Berapa unit?',
      totalSharesLabel: 'Jumlah saham',
      availableCash: 'Kuasa Beli Latihan',
      currentPosition: 'Saham Dimiliki',
      estimatedTotal: 'Anggaran Jumlah Bayaran',
      estimatedProceeds: 'Anggaran Hasil Jualan',
      includingFees: 'Termasuk RM',
      inBursaFees: 'yuran Bursa',
      toggleFeeShow: 'Lihat pecahan yuran Bursa Malaysia',
      toggleFeeHide: 'Sembunyikan pecahan yuran Bursa Malaysia',
      grossPrincipal: 'Nilai Saham',
      brokerageFee: 'Yuran Brokeraj (0.10%, min RM1)',
      clearingFee: 'Yuran Penjelasan Bursa (0.03%)',
      stampDuty: 'Duti Setem Kerajaan',
      executeBuy: 'Latihan Beli',
      executeSell: 'Latihan Jual',
      lotFootnote:
        'Di Bursa Malaysia, 1 Lot Standard bersamaan 100 saham. Tukar kepada Unit Permulaan (1 saham) untuk berlatih dengan modal kecil.',
      newsSub: 'Perkembangan terkini syarikat & konteks pasaran',
      newsTitle: 'Apa Yang Dipantau Oleh Pelabur'
    }
  };

  const t = texts[language];

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
        label: language === 'ENG' ? 'Valuation (Fairness of Price)' : 'Penilaian (Kewajaran Harga)',
        score: scores.value,
        peerScore: peerScores?.value ?? null
      },
      {
        key: 'growth',
        axis: 'Growth',
        label: language === 'ENG' ? 'Growth (Sales & Profit Trend)' : 'Pertumbuhan (Trend Jualan & Untung)',
        score: scores.growth,
        peerScore: peerScores?.growth ?? null
      },
      {
        key: 'health',
        axis: 'Financial Health',
        label: language === 'ENG' ? 'Financial Health (Low Debt & Cash)' : 'Kesihatan Kewangan (Tunai & Hutang)',
        score: scores.health,
        peerScore: peerScores?.health ?? null
      },
      {
        key: 'dividend',
        axis: 'Dividend Income',
        label: language === 'ENG' ? 'Dividend Income (Cash Payouts)' : 'Pendapatan Dividen (Agihan Tunai)',
        score: scores.dividend,
        peerScore: peerScores?.dividend ?? null
      },
      {
        key: 'momentum',
        axis: 'Price Momentum',
        label: language === 'ENG' ? 'Price Momentum (Recent Demand)' : 'Momentum Harga (Permintaan Semasa)',
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
    return <div className="jom-container">Loading company overview...</div>;
  }

  const isInWatchlist = watchlist.some(w => w.id === stock.id);
  const ownedHolding = portfolio.find(item => item.stock.id === stock.id);
  const ownedUnits = ownedHolding ? ownedHolding.quantity : 0;

  const effectiveUnits = lotMode === 'lot' ? quantity * 100 : quantity;
  const priceNum = parseFloat(stock.price);
  const buyFees = calculateBursaFees(priceNum, effectiveUnits, 'BUY');
  const sellUnits = Math.min(effectiveUnits, ownedUnits || effectiveUnits);
  const sellFees = calculateBursaFees(priceNum, sellUnits, 'SELL');
  const activeFees = tradeSide === 'BUY' ? buyFees : sellFees;

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

  const glossaryItems = [
    { key: 'P/E Ratio', label: t.peRatio, value: `${stock.peRatio}x` },
    { key: 'Dividend Yield', label: t.dividend, value: stock.dividendYield },
    { key: 'Market Cap', label: t.marketCap, value: `RM ${stock.marketCap}` },
    { key: 'Volume', label: t.volume, value: stock.volume },
    {
      key: 'Shariah Status',
      label: t.shariahStatus,
      value: stock.isShariah ? 'Shariah-Compliant' : 'Conventional'
    }
  ];

  return (
    <div className="jom-container space-y-8">
      {/* Public.com-inspired Company Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="jom-btn text-xs"
          >
            <ArrowLeft size={14} />
            <span>{t.backToScreener}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('ai-recommendation')}
              className="jom-btn text-xs"
            >
              <Sparkles size={14} />
              <span>{t.viewThesis}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                isInWatchlist ? removeFromWatchlist(stock.id) : addToWatchlist(stock)
              }
              className={`jom-btn text-xs ${isInWatchlist ? 'jom-btn-inverse' : ''}`}
            >
              <Bookmark size={14} />
              <span>{isInWatchlist ? t.inWatchlist : t.addWatchlist}</span>
            </button>
          </div>
        </div>

        <div className="jom-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`jom-avatar jom-avatar-lg ${avatarColor}`}>
              {monogram}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-tabular text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                  {stock.ticker} · {stock.bursaCode}
                </span>
                <span className="jom-tag">{stock.sector}</span>
                {stock.isShariah ? (
                  <span className="jom-tag jom-tag-shariah">
                    <ShieldCheck size={12} />
                    <span>Shariah-Compliant</span>
                  </span>
                ) : (
                  <span className="jom-tag">Conventional</span>
                )}
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl" style={{ color: 'var(--ink-primary)' }}>
                {stock.name}
              </h1>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                {stock.description}
              </p>
            </div>
          </div>

          <div className="md:text-right shrink-0 space-y-1.5">
            <div className="jom-kicker">{t.currentPriceLabel}</div>
            <div className="font-tabular text-3xl sm:text-4xl font-bold" style={{ color: 'var(--ink-primary)' }}>
              RM {stock.price}
            </div>
            <div className="flex md:justify-end items-center gap-2">
              <span
                className={`jom-tag font-tabular ${
                  stock.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                }`}
              >
                {stock.change} ({stock.changePercent})
              </span>
              {stock.lastUpdated && (
                <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {stock.lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Price Chart Card with Timeframe Pills */}
          <div className="jom-panel p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="jom-kicker">{t.chartSub}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.chartTitle}</h2>
              </div>
              <div className="jom-segmented">
                {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={timeframe === tf ? 'active' : ''}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartHistory}>
                  <defs>
                    <linearGradient id="publicPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
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
                    width={52}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, stock.ticker]}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#059669"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#publicPriceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Warm "In Plain English: How They Make Money" Story Card */}
          <div className="jom-hero-verdict p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="jom-kicker">{t.plainEnglishBadge}</div>
                <h2 className="font-editorial text-2xl" style={{ color: 'var(--ink-primary)' }}>
                  {t.plainEnglishTitle}
                </h2>
              </div>
              <span className="jom-tag jom-tag-shariah">
                <BookOpen size={12} />
                <span>2-min read</span>
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="jom-panel p-4 space-y-1.5">
                <div className="jom-kicker">{t.businessModelLabel}</div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                  {plainStory.howTheyMakeMoney}
                </p>
              </div>

              <div className="jom-panel p-4 space-y-1.5">
                <div className="jom-kicker">{t.dividendCompareLabel}</div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                  {plainStory.dividendVsEpf}
                </p>
              </div>

              <div className="jom-panel p-4 space-y-1.5">
                <div className="jom-kicker">{t.shariahLabel}</div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                  {plainStory.shariahNote}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Axis Fundamental Health Section: Radar Chart + 5 Horizontal Progress Bars + Peer Comparison */}
          <div className="jom-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="jom-kicker">{t.radarSub}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.radarTitle}</h2>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="peer-select" className="jom-kicker whitespace-nowrap">
                  {t.compareWithPeer}
                </label>
                <select
                  id="peer-select"
                  value={peerStockId}
                  onChange={e => setPeerStockId(e.target.value)}
                  className="jom-input text-xs font-tabular"
                  style={{ width: 'auto', minWidth: '180px' }}
                >
                  {allStocks
                    .filter(s => s.id !== stock.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.ticker} ({s.name})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Radar Chart + 5 Beginner-Friendly Horizontal Progress Bars */}
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 w-full" style={{ height: '260px' }}>
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
                      fillOpacity={0.26}
                    />
                    {peerStock && (
                      <Radar
                        name={peerStock.ticker}
                        dataKey={peerStock.ticker}
                        stroke="#64748B"
                        fill="#64748B"
                        fillOpacity={0.16}
                      />
                    )}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="md:col-span-7 space-y-3.5">
                {healthDimensions.map(dim => (
                  <div key={dim.key} className="jom-panel-subtle p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                        {dim.label}
                      </span>
                      <div className="flex items-center gap-2 font-tabular">
                        <span className="font-bold" style={{ color: 'var(--accent-brand)' }}>
                          {stock.ticker}: {dim.score}/100
                        </span>
                        {peerStock && dim.peerScore !== null && (
                          <span style={{ color: 'var(--ink-muted)' }}>
                            vs {peerStock.ticker}: {dim.peerScore}/100
                          </span>
                        )}
                      </div>
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
            </div>

            {/* Side-by-Side Peer Comparison Table */}
            {peerStock && (
              <div className="jom-panel-subtle overflow-hidden">
                <div className="jom-table-wrap">
                  <table className="jom-table">
                    <thead>
                      <tr>
                        <th>{t.colMetric}</th>
                        <th style={{ textAlign: 'right' }}>{stock.ticker}</th>
                        <th style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedStock(peerStock)}
                            className="inline-flex items-center gap-1 underline cursor-pointer"
                            style={{ color: 'var(--ink-primary)' }}
                          >
                            <span>{peerStock.ticker}</span>
                            <ArrowUpRight size={12} />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.peRatio}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          {stock.peRatio}x
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          {peerStock.peRatio}x
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.dividend}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          {stock.dividendYield}
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          {peerStock.dividendYield}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.marketCap}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          RM {stock.marketCap}
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          RM {peerStock.marketCap}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.revenue}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          RM {stock.revenue}
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          RM {peerStock.revenue}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.netProfit}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          RM {stock.netProfit}
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          RM {peerStock.netProfit}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.debtEquity}
                        </td>
                        <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                          {stock.debtEquity}
                        </td>
                        <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                          {peerStock.debtEquity}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {t.shariahStatus}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {stock.isShariah ? (
                            <span className="jom-tag jom-tag-shariah">Shariah-Compliant</span>
                          ) : (
                            <span className="jom-tag">Conventional</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {peerStock.isShariah ? (
                            <span className="jom-tag jom-tag-shariah">Shariah-Compliant</span>
                          ) : (
                            <span className="jom-tag">Conventional</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Tap to Learn: Key Numbers Explained (+10 XP) */}
          <div className="jom-panel overflow-hidden">
            <div
              className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">{t.glossarySub}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.glossaryTitle}</h2>
              </div>
              <span className="jom-tag jom-tag-shariah font-tabular">
                <CheckCircle2 size={13} />
                <span>{hasLearnedTerm.length} / 5 Learned</span>
              </span>
            </div>

            <div>
              {glossaryItems.map((item, idx) => {
                const isExpanded = learningTerm === item.key;
                const isLearned = hasLearnedTerm.includes(item.key);
                const def = definitions[item.key];

                return (
                  <div
                    key={item.key}
                    className={idx !== glossaryItems.length - 1 ? 'border-b' : ''}
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleTermClick(item.key)}
                      className="w-full p-4 px-6 flex items-center justify-between text-left cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isExpanded ? 'var(--bg-subtle)' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>
                          {item.label}
                        </span>
                        {isLearned ? (
                          <span className="jom-tag jom-tag-shariah">Learned ✓</span>
                        ) : (
                          <span className="jom-tag">+10 XP</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-tabular text-sm font-semibold">
                          {item.value}
                        </span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {isExpanded && def && (
                      <div
                        className="px-6 pb-5 pt-3 space-y-2.5 border-t"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          backgroundColor: 'var(--bg-elevated)'
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                          {def[language].simple}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                          {def[language].detail}
                        </p>
                        <div className="jom-panel-subtle p-3 text-xs leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                          {def[language].example}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* What Investors Are Watching */}
          <div className="jom-panel p-6 space-y-4">
            <div>
              <div className="jom-kicker">{t.newsSub}</div>
              <h3 className="font-editorial text-2xl mt-0.5">{t.newsTitle}</h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  headline: `${stock.name} (${stock.bursaCode}) posts steady quarterly results on Bursa Malaysia as domestic demand holds firm`,
                  source: 'The Edge Malaysia · Company Update'
                },
                {
                  headline: `Malaysian retirement and dividend funds continue tracking ${stock.sector} leaders ahead of upcoming payout announcements`,
                  source: 'Bursa Marketplace · Sector Watch'
                }
              ].map((note, index) => (
                <div key={index} className="jom-panel-subtle p-4 space-y-1">
                  <div className="jom-kicker">{note.source}</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                    {note.headline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns — Sticky "Practice Trade" Card */}
        <div className="lg:col-span-4">
          <div className="jom-panel p-6 sticky top-20 space-y-5">
            <div
              className="pb-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <h2 className="font-editorial text-xl" style={{ color: 'var(--ink-primary)' }}>
                  {t.ticketTitle}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                  {t.ticketSub}
                </p>
              </div>
              <span className="jom-tag font-tabular">{stock.ticker}</span>
            </div>

            {/* Buy / Sell Mode Selector */}
            <div className="jom-segmented w-full grid grid-cols-2">
              <button
                type="button"
                onClick={() => setTradeSide('BUY')}
                className={tradeSide === 'BUY' ? 'active' : ''}
              >
                {t.buyTab}
              </button>
              <button
                type="button"
                onClick={() => setTradeSide('SELL')}
                className={tradeSide === 'SELL' ? 'active' : ''}
              >
                {t.sellTab}
              </button>
            </div>

            {/* Standard Lot (100 shares) vs Starter Unit (1 share) */}
            <div className="space-y-2">
              <div className="jom-segmented w-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLotMode('lot')}
                  className={lotMode === 'lot' ? 'active' : ''}
                >
                  {t.boardLot}
                </button>
                <button
                  type="button"
                  onClick={() => setLotMode('micro')}
                  className={lotMode === 'micro' ? 'active' : ''}
                >
                  {t.microUnit}
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {t.lotFootnote}
              </p>
            </div>

            {/* Share Count Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="jom-kicker">{t.quantityLabel}</span>
                <span className="font-tabular text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                  {t.totalSharesLabel}: {effectiveUnits} shares
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decrement}
                  className="jom-btn px-3 py-2"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className="jom-input font-tabular text-center font-semibold"
                />
                <button
                  type="button"
                  onClick={increment}
                  className="jom-btn px-3 py-2"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Buying Power & Owned Shares Summary */}
            <div className="jom-panel-subtle p-3.5 space-y-2 font-tabular text-xs">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.availableCash}</span>
                <span className="font-semibold" style={{ color: 'var(--signal-up)' }}>
                  RM {cashBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.currentPosition}</span>
                <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                  {ownedUnits} shares ({Math.floor(ownedUnits / 100)} lots)
                </span>
              </div>
            </div>

            {/* Estimated Total + Collapsible Bursa Fee Breakdown */}
            <div
              className="space-y-3 pt-3 border-t font-tabular"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {tradeSide === 'BUY' ? t.estimatedTotal : t.estimatedProceeds}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {t.includingFees} {activeFees.totalFees.toFixed(2)} {t.inBursaFees}
                  </div>
                </div>
                <div className="text-xl font-bold" style={{ color: 'var(--ink-primary)' }}>
                  RM {activeFees.netTotal.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFeeBreakdown(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-medium py-1.5 cursor-pointer"
                style={{ color: 'var(--accent-brand)' }}
              >
                <span>{showFeeBreakdown ? t.toggleFeeHide : t.toggleFeeShow}</span>
                {showFeeBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showFeeBreakdown && (
                <div className="jom-panel-subtle p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>
                      {t.grossPrincipal} ({effectiveUnits} × RM {stock.price})
                    </span>
                    <span>RM {activeFees.grossAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>{t.brokerageFee}</span>
                    <span>RM {activeFees.brokerageFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>{t.clearingFee}</span>
                    <span>RM {activeFees.clearingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--ink-secondary)' }}>{t.stampDuty}</span>
                    <span>RM {activeFees.stampDuty.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Practice Trade Execution Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => addToPortfolio(stock, effectiveUnits)}
                className="jom-btn jom-btn-primary w-full py-2.5"
              >
                <TrendingUp size={15} />
                <span>
                  {t.executeBuy} ({effectiveUnits} shares)
                </span>
              </button>

              <button
                type="button"
                disabled={ownedUnits <= 0}
                onClick={() => sellFromPortfolio(stock, effectiveUnits)}
                className="jom-btn jom-btn-danger w-full py-2.5"
              >
                <span>
                  {t.executeSell} ({ownedUnits > 0 ? sellUnits : 0} shares)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
