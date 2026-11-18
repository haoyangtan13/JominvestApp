import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Loader2,
  ArrowUpRight,
  Download,
  Check,
  X,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { toast } from 'sonner';
import type { Screen, StockData } from '../App';
import {
  extractTextFromDocument,
  analyzeFilingWithAI,
  type RingkasAnalysisResult
} from '../services/aiService';
import {
  fetchBursaNews,
  computeMarketBreadth,
  type BursaNewsItem,
  type MarketBreadthSummary
} from '../services/bursaService';

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  setSelectedStock: (stock: StockData) => void;
  addXP: (amount: number, reason: string) => void;
}

interface QuizQuestion {
  qEng: string;
  qBm: string;
  optionsEng: string[];
  optionsBm: string[];
  correctIndex: number;
}

interface EducationalItem {
  id: string;
  code: string;
  type: 'article' | 'tutorial';
  titleEng: string;
  titleBm: string;
  descEng: string;
  descBm: string;
  meta: string;
  badge: string;
  contentEng: string[];
  contentBm: string[];
  takeawaysEng: string[];
  takeawaysBm: string[];
  quiz: QuizQuestion[];
}

function getStockMonogram(ticker: string, sector?: string): { initials: string; avatarClass: string } {
  const map: Record<string, { initials: string; avatarClass: string }> = {
    MAYBANK: { initials: 'MB', avatarClass: 'jom-avatar jom-avatar-amber' },
    PBBANK: { initials: 'PB', avatarClass: 'jom-avatar jom-avatar-blue' },
    CIMB: { initials: 'CB', avatarClass: 'jom-avatar jom-avatar-rose' },
    RHBBANK: { initials: 'RH', avatarClass: 'jom-avatar jom-avatar-blue' },
    TENAGA: { initials: 'TN', avatarClass: 'jom-avatar jom-avatar-emerald' },
    YTLPOWR: { initials: 'YP', avatarClass: 'jom-avatar jom-avatar-indigo' },
    PETGAS: { initials: 'PG', avatarClass: 'jom-avatar jom-avatar-teal' },
    GAMUDA: { initials: 'GM', avatarClass: 'jom-avatar jom-avatar-emerald' },
    INARI: { initials: 'IN', avatarClass: 'jom-avatar jom-avatar-indigo' },
    MYEG: { initials: 'MY', avatarClass: 'jom-avatar jom-avatar-blue' },
    IHH: { initials: 'IH', avatarClass: 'jom-avatar jom-avatar-teal' },
    PMETAL: { initials: 'PM', avatarClass: 'jom-avatar jom-avatar-blue' },
    SDG: { initials: 'SD', avatarClass: 'jom-avatar jom-avatar-emerald' },
    MISC: { initials: 'MS', avatarClass: 'jom-avatar jom-avatar-indigo' },
    MRDIY: { initials: 'DY', avatarClass: 'jom-avatar jom-avatar-amber' },
    NESTLE: { initials: 'NS', avatarClass: 'jom-avatar jom-avatar-rose' },
    QL: { initials: 'QL', avatarClass: 'jom-avatar jom-avatar-emerald' },
    TM: { initials: 'TM', avatarClass: 'jom-avatar jom-avatar-amber' },
    AXIATA: { initials: 'AX', avatarClass: 'jom-avatar jom-avatar-indigo' },
    PAVREIT: { initials: 'PV', avatarClass: 'jom-avatar jom-avatar-teal' },
    SUNREIT: { initials: 'SR', avatarClass: 'jom-avatar jom-avatar-amber' }
  };

  if (map[ticker]) return map[ticker];

  const clean = ticker.replace(/[^A-Za-z]/g, '').toUpperCase();
  const initials = clean.slice(0, 2) || 'JM';
  const sectorLower = (sector || '').toLowerCase();
  if (sectorLower.includes('financial') || sectorLower.includes('bank')) {
    return { initials, avatarClass: 'jom-avatar jom-avatar-blue' };
  }
  if (sectorLower.includes('tech')) {
    return { initials, avatarClass: 'jom-avatar jom-avatar-indigo' };
  }
  if (sectorLower.includes('consumer') || sectorLower.includes('reit')) {
    return { initials, avatarClass: 'jom-avatar jom-avatar-amber' };
  }
  if (sectorLower.includes('health')) {
    return { initials, avatarClass: 'jom-avatar jom-avatar-teal' };
  }
  return { initials, avatarClass: 'jom-avatar jom-avatar-emerald' };
}

const learningItems: EducationalItem[] = [
  {
    id: 'art-dividend',
    code: 'Lesson 1',
    type: 'article',
    titleEng: 'How Dividends Work on Bursa Malaysia',
    titleBm: 'Cara Dividen Berfungsi di Bursa Malaysia',
    descEng:
      'Learn how profitable Malaysian companies share cash payouts with everyday investors—and why they are 100% tax-free.',
    descBm:
      'Ketahui bagaimana syarikat Malaysia berkongsi keuntungan tunai dengan pelabur—dan mengapa ia dikecualikan cukai sepenuhnya.',
    meta: '5 min read',
    badge: 'Passive Income',
    contentEng: [
      'A dividend is a slice of a company’s profit paid directly to you in cash just for owning its shares. On Bursa Malaysia, established companies like banks and utilities usually pay dividends twice a year or every quarter.',
      'For example, if Maybank (MAYBANK) trades at RM 10.54 with a 6.15% dividend yield, owning 1,000 shares (10 lots worth RM 10,540) pays you roughly RM 648 per year in tax-free cash.',
      'To receive an upcoming dividend, you simply need to buy the stock at least 1 trading day before its Ex-Dividend Date (Ex-Date).'
    ],
    contentBm: [
      'Dividen ialah agihan tunai daripada keuntungan syarikat kepada pemegang sahamnya. Di Bursa Malaysia, syarikat kukuh lazimnya membayar dividen dua kali setahun atau setiap suku tahun.',
      'Sebagai contoh, jika Maybank (MAYBANK) didagangkan pada RM 10.54 dengan kadar hasil dividen 6.15%, memegang 1,000 unit (10 lot bernilai RM 10,540) menjana kira-kira RM 648 setahun dalam bentuk dividen tunai.',
      'Perhatikan Tarikh Ex-Dividen (Ex-Date): anda mesti membeli saham sekurang-kurangnya 1 hari dagangan sebelum Ex-Date untuk layak menerima bayaran dividen tersebut.'
    ],
    takeawaysEng: [
      'Dividend Yield (%) = (Yearly Cash Dividend Per Share ÷ Current Share Price) × 100',
      'Malaysia uses a Single-Tier Dividend System: cash dividends you receive are 100% tax-exempt',
      'Look for steady companies with healthy cash flow rather than chasing unusually high yields'
    ],
    takeawaysBm: [
      'Kadar Hasil Dividen (%) = (Dividen Tahunan Sesaham ÷ Harga Saham Semasa) × 100',
      'Malaysia menggunakan Sistem Dividen Satu Peringkat: dividen dikecualikan cukai untuk pelabur runcit',
      'Hasil dividen yang mampan (>4.5%) memerlukan aliran tunai syarikat yang kukuh'
    ],
    quiz: [
      {
        qEng: 'When do you need to buy a Bursa Malaysia stock to qualify for its upcoming cash dividend?',
        qBm: 'Bilakah anda mesti membeli saham Bursa Malaysia untuk layak mendapat dividen yang diumumkan?',
        optionsEng: ['Before the Ex-Dividend Date', 'On the Payment Date', 'After the Entitlement Date'],
        optionsBm: ['Sebelum Tarikh Ex-Dividen', 'Pada Tarikh Pembayaran', 'Selepas Tarikh Kelayakan'],
        correctIndex: 0
      },
      {
        qEng: 'If a stock priced at RM 10.00 pays RM 0.50 in yearly dividends per share, what is its dividend yield?',
        qBm: 'Jika saham berharga RM 10.00 membayar dividen tahunan RM 0.50 sesaham, apakah kadar hasil dividennya?',
        optionsEng: ['2.0%', '5.0%', '10.0%'],
        optionsBm: ['2.0%', '5.0%', '10.0%'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'art-bursa',
    code: 'Lesson 2',
    type: 'article',
    titleEng: 'Bursa Basics: Board Lots, Trading Hours & Shariah Screening',
    titleBm: 'Asas Bursa: Lot Papan, Waktu Dagangan & Saringan Syariah',
    descEng:
      'A friendly guide to 100-share lots, trading fees, and how the Securities Commission screens halal stocks.',
    descBm:
      'Panduan mudah tentang lot 100 unit, yuran dagangan, dan cara Suruhanjaya Sekuriti menyaring saham patuh Syariah.',
    meta: '5 min read',
    badge: 'Bursa Basics',
    contentEng: [
      'Bursa Malaysia is open Monday to Friday across two sessions: Morning (9:00 AM – 12:30 PM) and Afternoon (2:30 PM – 5:00 PM).',
      'On Bursa Malaysia, stocks are normally bought in standard "Board Lots" of 100 shares. So if Tenaga Nasional (TENAGA) is RM 14.12 per share, 1 standard lot (100 shares) costs RM 1,412 plus a few Ringgit in fees.',
      'Twice a year (May and November), the Securities Commission (SC) Malaysia Shariah Advisory Council reviews every listed company’s business activities and debt levels to certify which stocks are Shariah-compliant.'
    ],
    contentBm: [
      'Bursa Malaysia beroperasi Isnin hingga Jumaat dalam dua sesi: Sesi Pagi (9:00 PG – 12:30 PTG) dan Sesi Petang (2:30 PTG – 5:00 PTG).',
      'Saham di Bursa Malaysia didagangkan dalam Lot Papan standard sebanyak 100 unit. Jika Tenaga Nasional (TENAGA) berharga RM 14.12 seunit, 1 lot (100 unit) berharga RM 1,412 sebelum yuran.',
      'Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC) Malaysia menyaring saham dua kali setahun (Mei & November) berdasarkan aktiviti perniagaan dan nisbah kewangan.'
    ],
    takeawaysEng: [
      '1 Standard Bursa Lot = 100 shares',
      'Every trade includes 3 small charges: Brokerage Fee, Stamp Duty (RM 1 per RM 1,000), and Clearing Fee (0.03%)',
      'Over 75% of companies listed on Bursa Malaysia are certified Shariah-compliant'
    ],
    takeawaysBm: [
      '1 Lot Standard Bursa = 100 unit saham',
      'Setiap dagangan melibatkan 3 kos kecil: Yuran Broker, Duti Setem (RM 1 setiap RM 1,000), dan Yuran Penjelasan (0.03%)',
      'Lebih 75% syarikat tersenarai di Bursa Malaysia adalah patuh Syariah'
    ],
    quiz: [
      {
        qEng: 'How many shares are in 1 standard Board Lot on Bursa Malaysia?',
        qBm: 'Berapa unit dalam 1 Lot Papan standard di Bursa Malaysia?',
        optionsEng: ['10 shares', '100 shares', '1,000 shares'],
        optionsBm: ['10 unit', '100 unit', '1,000 unit'],
        correctIndex: 1
      },
      {
        qEng: 'Who publishes the official Shariah-compliant stock list in Malaysia?',
        qBm: 'Badan manakah yang menerbitkan senarai rasmi saham patuh Syariah di Malaysia?',
        optionsEng: ['Securities Commission (SC) Shariah Advisory Council', 'EPF Investment Panel', 'Companies Commission (SSM)'],
        optionsBm: ['Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC)', 'Panel Pelaburan KWSP', 'SSM Malaysia'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'art-risk',
    code: 'Lesson 3',
    type: 'article',
    titleEng: 'Building a Balanced Portfolio & Ringgit Cost Averaging',
    titleBm: 'Membina Portfolio Seimbang & Pemurataan Kos Ringgit',
    descEng:
      'How to mix steady dividend payers with growth stocks and invest consistently every month without stressing over market timing.',
    descBm:
      'Cara menggabungkan saham dividen stabil dengan saham pertumbuhan dan melabur secara konsisten setiap bulan.',
    meta: '5 min read',
    badge: 'Portfolio Strategy',
    contentEng: [
      'Malaysian Fixed Deposits (~3.0% p.a.) and EPF/KWSP (~5.5% p.a.) are great for safety, while Bursa stocks aim for 8%–12% yearly growth over the long run in exchange for day-to-day price ups and downs.',
      'Combining steady dividend payers (like MAYBANK, PBBANK, TENAGA, and IHH) with faster-growing companies (like GAMUDA, INARI, and YTLPOWR) helps keep your portfolio resilient.',
      'By practicing Ringgit Cost Averaging (investing a fixed RM amount every month), you automatically buy more shares when prices dip and fewer when prices are high.'
    ],
    contentBm: [
      'Deposit Tetap (~3.0% setahun) dan KWSP (~5.5% setahun) menawarkan kestabilan modal, manakala saham mampu memberi 8%–12% setahun dalam jangka panjang.',
      'Menggabungkan Saham Dividen Stabil (seperti MAYBANK, PBBANK, TENAGA, IHH) dengan Saham Pertumbuhan (seperti GAMUDA, INARI, YTLPOWR) membantu mengimbangi pasaran.',
      'Amalkan Pemurataan Kos Ringgit (DCA - melabur jumlah RM tetap setiap bulan) untuk mengurangkan risiko masa pasaran.'
    ],
    takeawaysEng: [
      'Spread your money across at least 3–4 different Bursa industries (Banking, Utilities, Tech, Healthcare)',
      'Keep 15%–25% in practice cash so you are ready when great companies go on sale',
      'Match your stock picks with your personal comfort level (Conservative, Balanced, or Explorer)'
    ],
    takeawaysBm: [
      'Pelbagaikan modal merentasi sekurang-kurangnya 3–4 sektor Bursa berbeza',
      'Simpan 15%–25% dalam tunai untuk mengambil peluang semasa pasaran menurun',
      'Padankan pilihan saham dengan gaya pelaburan anda'
    ],
    quiz: [
      {
        qEng: 'Why is it helpful to own stocks across 3 or more different industries?',
        qBm: 'Apakah manfaat utama mempelbagaikan pelaburan merentasi pelbagai sektor?',
        optionsEng: [
          'It guarantees your stocks will go up every single day',
          'A slowdown in one industry will not drag down your entire portfolio',
          'It removes all Bursa trading fees'
        ],
        optionsBm: [
          'Ia menjamin keuntungan setiap hari dagangan',
          'Kelembapan dalam satu industri tidak akan menjejaskan keseluruhan portfolio',
          'Ia menghapuskan yuran dagangan Bursa'
        ],
        correctIndex: 1
      },
      {
        qEng: 'What is Ringgit Cost Averaging (DCA)?',
        qBm: 'Apakah maksud Pemurataan Kos Ringgit (DCA)?',
        optionsEng: [
          'Investing a fixed Ringgit amount regularly regardless of short-term price swings',
          'Putting 100% of your cash into one stock all at once',
          'Only buying stocks when they hit all-time highs'
        ],
        optionsBm: [
          'Melabur jumlah RM tetap secara berkala tanpa mengira naik turun harga jangka pendek',
          'Meletakkan 100% modal ke dalam satu saham serentak',
          'Hanya membeli saham apabila harga berada pada paras tertinggi'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-chart',
    code: 'Lesson 4',
    type: 'tutorial',
    titleEng: 'How to Read P/E Ratios & Compare Stock Health Scores',
    titleBm: 'Cara Membaca Nisbah P/E & Membandingkan Skor Kesihatan Saham',
    descEng:
      'A step-by-step walkthrough on checking whether a stock is reasonably priced compared to its industry peers.',
    descBm:
      'Panduan langkah demi langkah untuk menyemak sama ada harga saham berpatutan berbanding rakan seindustri.',
    meta: '5 min read',
    badge: 'Stock Valuation',
    contentEng: [
      'When you open a company on the Stock Overview page, start by looking at its recent price trend alongside how much profit the business actually earns.',
      'The P/E Ratio (Price-to-Earnings) tells you how much you are paying for RM 1 of the company’s yearly profit. On Bursa Malaysia, banks often trade around 10x–13x P/E, utilities around 14x–18x, and fast-growing tech or healthcare stocks around 22x–35x.',
      'Use the 5-Factor Health Check (Value, Growth, Financial Health, Dividend, and Momentum) to compare two companies side-by-side before placing a practice trade.'
    ],
    contentBm: [
      'Apabila menyemak syarikat di halaman Gambaran Saham, mulakan dengan melihat trend harga dan membandingkan harga semasa dengan keuntungan sebenar syarikat.',
      'Nisbah P/E (Harga-kepada-Pendapatan) menunjukkan berapa banyak anda membayar untuk setiap RM 1 keuntungan syarikat. Di Bursa Malaysia, bank lazimnya pada P/E 10x–13x, manakala saham teknologi pada 22x–35x.',
      'Gunakan Semakan Kesihatan 5-Faktor untuk membandingkan dua syarikat secara bersebelahan sebelum membuat dagangan latihan.'
    ],
    takeawaysEng: [
      'A lower P/E than industry peers can signal a bargain—just check that debt levels are healthy',
      'Compare banks with banks and tech stocks with tech stocks for a fair apples-to-apples check',
      'Use the Annual Report Reader to confirm revenue and profit are growing'
    ],
    takeawaysBm: [
      'Nisbah P/E rendah berbanding rakan sektor boleh menandakan harga saham berpatutan',
      'Bandingkan syarikat dalam industri yang sama untuk penilaian yang adil',
      'Sentiasa semak pertumbuhan hasil dan untung bersih dalam JomRingkas'
    ],
    quiz: [
      {
        qEng: 'What does a P/E Ratio of 12x mean in plain English?',
        qBm: 'Apakah maksud Nisbah P/E sebanyak 12x?',
        optionsEng: [
          'The stock pays a 12% yearly dividend',
          'Investors are paying RM 12 for every RM 1 of annual profit the company earns',
          'The stock price will multiply 12 times in a year'
        ],
        optionsBm: [
          'Saham membayar hasil dividen 12%',
          'Pelabur membayar RM 12 untuk setiap RM 1 keuntungan tahunan syarikat',
          'Harga saham dijangka meningkat 12 kali ganda dalam setahun'
        ],
        correctIndex: 1
      },
      {
        qEng: 'Why should you compare a stock’s P/E ratio against companies in the same sector?',
        qBm: 'Mengapa nisbah P/E perlu dibandingkan dengan syarikat dalam sektor yang sama?',
        optionsEng: [
          'Different industries grow at different speeds and have different normal P/E ranges',
          'Every company on Bursa Malaysia has the exact same P/E ratio',
          'P/E ratios only work for plantation stocks'
        ],
        optionsBm: [
          'Sektor berbeza mempunyai kadar pertumbuhan dan julat penilaian normal yang berbeza',
          'Semua syarikat di Bursa mempunyai nisbah P/E yang sama',
          'Nisbah P/E hanya terpakai untuk syarikat perladangan'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-risk-mgmt',
    code: 'Lesson 5',
    type: 'tutorial',
    titleEng: 'Smart Position Sizing & Avoiding Debt Traps',
    titleBm: 'Saiz Pegangan Bijak & Mengelak Perangkap Hutang',
    descEng:
      'Learn how to protect your portfolio by checking company debt levels and keeping any single sector under 60%.',
    descBm:
      'Pelajari cara melindungi portfolio anda dengan menyemak tahap hutang syarikat dan mengelakkan tumpuan berlebihan.',
    meta: '5 min read',
    badge: 'Risk Management',
    contentEng: [
      'Great investors focus on protecting their downside first. A helpful beginner habit is keeping any single company under 25% of your portfolio and any single industry under 60%.',
      'Before buying, glance at the Debt-to-Equity ratio on the Stock Overview page. Non-bank companies with lower debt (<0.6x) have a much easier time weathering interest rate changes.',
      'Visit your Portfolio Balance Check anytime to see your sector breakdown and trim oversized positions.'
    ],
    contentBm: [
      'Pelabur bijak mengutamakan perlindungan modal. Tabiat yang baik ialah menghadkan pendedahan kepada 25% bagi satu syarikat dan maksimum 60% bagi satu sektor.',
      'Sebelum membeli, semak nisbah Hutang-ke-Ekuiti (D/E). Syarikat bukan kewangan dengan hutang rendah (<0.6x) mempunyai kedudukan kewangan lebih kukuh.',
      'Gunakan Semakan Imbangan Portfolio anda untuk memantau pecahan sektor pada bila-bila masa.'
    ],
    takeawaysEng: [
      'Keep any single Bursa industry under 60% of your total invested stocks',
      'Check Debt-to-Equity ratios so you avoid companies overloaded with borrowings',
      'Selling half of a big winner lets you lock in profits while staying invested'
    ],
    takeawaysBm: [
      'Elakkan menumpukan >60% portfolio anda dalam satu sektor sahaja',
      'Semak nisbah Hutang/Ekuiti untuk mengelakkan syarikat yang terlalu banyak hutang',
      'Jual separuh pegangan yang untung untuk mengunci keuntungan sambil kekal melabur'
    ],
    quiz: [
      {
        qEng: 'Which metric helps you see how much debt a company carries compared to its own equity?',
        qBm: 'Nisbah manakah yang mengukur tahap hutang syarikat berbanding ekuiti pemegang saham?',
        optionsEng: ['Dividend Yield', 'Debt-to-Equity Ratio', 'Daily Trading Volume'],
        optionsBm: ['Kadar Hasil Dividen', 'Nisbah Hutang-ke-Ekuiti (D/E)', 'Volum Dagangan Harian'],
        correctIndex: 1
      },
      {
        qEng: 'When should you consider diversifying into another industry?',
        qBm: 'Bilakah anda patut mempelbagaikan pelaburan ke dalam industri lain?',
        optionsEng: [
          'When more than 60% of your stock investments are in a single sector',
          'When you own stocks across 4 different sectors',
          'When you keep 20% in practice cash'
        ],
        optionsBm: [
          'Apabila melebihi 60% saham anda tertumpu dalam satu sektor tunggal',
          'Apabila memegang saham merentasi 4 sektor berbeza',
          'Apabila mengekalkan 20% rizab tunai'
        ],
        correctIndex: 0
      }
    ]
  }
];

type LearnTab = 'reader' | 'news' | 'calculator' | 'lessons';

export function EducationalHub({
  navigateTo,
  language,
  stocks,
  setSelectedStock,
  addXP
}: EducationalHubProps) {
  const [activeTab, setActiveTab] = useState<LearnTab>('reader');

  // Wealth & Benchmark Model State
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [riskLevel, setRiskLevel] = useState(6);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  // JomRingkas Filing Compiler State
  const [selectedStockId, setSelectedStockId] = useState<string>(() => stocks[0]?.id || '1');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [loadingText, setLoadingText] = useState('Summarizing Annual Report...');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedText, setUploadedText] = useState<string>('');
  const [customPasteOpen, setCustomPasteOpen] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<RingkasAnalysisResult | null>(null);

  // JomSentimen Live News & Market Breadth State
  const [newsItems, setNewsItems] = useState<BursaNewsItem[]>([]);
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);

  // Curriculum & Briefing Modal State
  const [activeLearningItem, setActiveLearningItem] = useState<EducationalItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  const loadBursaNewsWire = useCallback(
    async (isManualRefresh: boolean = false) => {
      setIsRefreshingNews(true);
      try {
        if (isManualRefresh) {
          try {
            localStorage.removeItem('jominvest_bursa_news_v1');
          } catch {
            // Ignore storage errors
          }
        }
        const items = await fetchBursaNews(stocks);
        setNewsItems(items);
        if (isManualRefresh) {
          toast.success(
            language === 'ENG'
              ? 'Latest Bursa Malaysia news and market mood updated!'
              : 'Berita terkini Bursa Malaysia dan mood pasaran dikemas kini!'
          );
        }
      } finally {
        setIsRefreshingNews(false);
      }
    },
    [stocks, language]
  );

  useEffect(() => {
    loadBursaNewsWire(false);
  }, [loadBursaNewsWire]);

  useEffect(() => {
    if (isScanning) {
      const steps =
        language === 'ENG'
          ? [
              'Reading Bursa Annual Report...',
              'Highlighting Revenue & Profit Trends...',
              'Checking Dividends & Shariah Status...',
              'Building Your 30-Second Summary...'
            ]
          : [
              'Membaca Laporan Tahunan Bursa...',
              'Menyemak Trend Hasil & Keuntungan...',
              'Mengesahkan Status Dividen & Syariah...',
              'Menyediakan Ringkasan 30 Saat Anda...'
            ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(steps[i % steps.length]);
        i++;
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isScanning, language]);

  const currentStock = useMemo(() => {
    return stocks.find(s => s.id === selectedStockId) || stocks[0];
  }, [stocks, selectedStockId]);

  const dynamicReport = useMemo<RingkasAnalysisResult | null>(() => {
    if (!currentStock) return null;
    const pe = parseFloat(currentStock.peRatio) || 15;
    const divYield = parseFloat(currentStock.dividendYield.replace('%', '')) || 0;
    const radar = currentStock.radarScores;
    const avgScore = Math.round(
      (radar.value + radar.growth + radar.health + radar.dividend + radar.momentum) / 5
    );
    const confidenceScore = Math.min(96, Math.max(68, avgScore + 10));

    const growthText =
      language === 'ENG'
        ? `${currentStock.name} (${currentStock.ticker}) generated ${currentStock.revenue} in yearly revenue and ${currentStock.netProfit} in net profit in the ${currentStock.sector} sector. ${currentStock.description} Its Growth Score is ${radar.growth}/100 and Momentum is ${radar.momentum}/100.`
        : `${currentStock.name} (${currentStock.ticker}) menjana hasil tahunan ${currentStock.revenue} dan untung bersih ${currentStock.netProfit} dalam sektor ${currentStock.sector}. Skor Pertumbuhan ialah ${radar.growth}/100 dan Momentum ialah ${radar.momentum}/100.`;

    const valuationLabel =
      pe < 14
        ? language === 'ENG'
          ? 'more affordable than the average Bursa stock'
          : 'lebih berpatutan berbanding purata saham Bursa'
        : pe <= 24
        ? language === 'ENG'
          ? 'in line with typical industry peers'
          : 'selaras dengan purata rakan seindustri'
        : language === 'ENG'
        ? 'priced at a premium because investors expect faster growth'
        : 'didagangkan pada harga premium kerana jangkaan pertumbuhan tinggi';

    const riskText =
      language === 'ENG'
        ? `At RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} trades at a P/E ratio of ${currentStock.peRatio}x (${valuationLabel}) with a Debt-to-Equity ratio of ${currentStock.debtEquity}. Financial Health scores ${radar.health}/100—keep an eye on industry competition and interest rate changes.`
        : `Pada harga RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} mempunyai nisbah P/E ${currentStock.peRatio}x (${valuationLabel}) dan nisbah Hutang-ke-Ekuiti ${currentStock.debtEquity}. Skor Kesihatan Kewangan ialah ${radar.health}/100.`;

    const shariahStatus = currentStock.isShariah
      ? language === 'ENG'
        ? 'Shariah-Compliant (Verified by SC Malaysia)'
        : 'Patuh Syariah (Disahkan SC Malaysia)'
      : language === 'ENG'
      ? 'Conventional (Non-Shariah)'
      : 'Konvensional (Bukan Syariah)';

    const dividendText =
      language === 'ENG'
        ? `Pays a ${currentStock.dividendYield} yearly dividend yield (${
            divYield >= 4.5
              ? 'a generous passive cash payer for income-focused investors'
              : divYield >= 2.5
              ? 'a balanced mix of cash payouts and reinvesting for growth'
              : 'reinvests most profits back into expanding the business'
          }). Status: ${shariahStatus}. Company Size (Market Cap): ${currentStock.marketCap}.`
        : `Membayar hasil dividen tahunan ${currentStock.dividendYield} (${
            divYield >= 4.5
              ? 'pembayar tunai pasif yang menarik untuk pelabur pendapatan'
              : 'gabungan seimbang antara bayaran dividen dan pelaburan semula'
          }). Status: ${shariahStatus}. Saiz Pasaran: ${currentStock.marketCap}.`;

    return {
      title: `${currentStock.name} (${currentStock.ticker})`,
      bursaCode: currentStock.bursaCode,
      isShariah: currentStock.isShariah,
      growth: growthText,
      risk: riskText,
      dividend: dividendText,
      score: confidenceScore,
      sourceLabel: uploadedFileName
        ? `Uploaded: ${uploadedFileName}`
        : 'Annual Report Summary',
      extractedExcerpt: uploadedText.trim() ? uploadedText.trim().slice(0, 260) : undefined,
      provider: 'QUANT_ENGINE'
    };
  }, [currentStock, language, uploadedFileName, uploadedText]);

  const activeReport = aiReport || dynamicReport;

  // 10-Year Compounding & Malaysian Benchmark Model
  const wealthData = useMemo(() => {
    const data = [];
    let currentWealth = 0;
    let epfWealth = 0;
    let fdWealth = 0;
    let totalInvested = 0;
    const years = 10;
    const inflationOffset = inflationAdjusted ? 0.03 : 0;

    const strategyReturn = Math.max(0.01, 0.04 + riskLevel * 0.008 - inflationOffset);
    const epfReturn = Math.max(0.005, 0.055 - inflationOffset);
    const fdReturn = Math.max(0.0, 0.03 - inflationOffset);

    for (let year = 0; year <= years; year++) {
      data.push({
        year: `Year ${year}`,
        wealth: Math.round(currentWealth),
        epfAsb: Math.round(epfWealth),
        fixedDeposit: Math.round(fdWealth),
        invested: Math.round(totalInvested)
      });
      const yearlyContribution = monthlyInvest * 12;
      currentWealth = (currentWealth + yearlyContribution) * (1 + strategyReturn);
      epfWealth = (epfWealth + yearlyContribution) * (1 + epfReturn);
      fdWealth = (fdWealth + yearlyContribution) * (1 + fdReturn);
      totalInvested += yearlyContribution;
    }
    return data;
  }, [monthlyInvest, riskLevel, inflationAdjusted]);

  const finalPoint = wealthData[wealthData.length - 1];
  const finalWealth = finalPoint.wealth;
  const finalEpf = finalPoint.epfAsb;
  const finalFd = finalPoint.fixedDeposit;
  const finalInvested = finalPoint.invested;

  const runFilingAnalysis = async (
    targetStock: StockData | undefined,
    fileNameArg?: string | null,
    textArg?: string
  ) => {
    const stockToUse = targetStock || currentStock;
    if (!stockToUse) return;
    setIsScanning(true);
    setScanComplete(false);
    try {
      const effectiveName =
        fileNameArg !== undefined
          ? fileNameArg || undefined
          : uploadedFileName || (uploadedText.trim() ? 'Pasted_Bursa_Filing.txt' : undefined);
      const effectiveText =
        textArg !== undefined ? textArg : uploadedText.trim() || undefined;

      const result = await analyzeFilingWithAI({
        stock: stockToUse,
        uploadedFileName: effectiveName,
        uploadedText: effectiveText,
        language
      });
      setAiReport(result);
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const handleAnalyze = () => {
    runFilingAnalysis(currentStock);
  };

  const handleFileUpload = async (file: File) => {
    const matched = stocks.find(
      s =>
        file.name.toUpperCase().includes(s.ticker) ||
        file.name.toUpperCase().includes(s.name.split(' ')[0].toUpperCase())
    );
    const targetStock = matched || currentStock;
    if (matched) {
      setSelectedStockId(matched.id);
    }

    setUploadedFileName(file.name);
    toast.success(
      language === 'ENG'
        ? `Loaded ${file.name} — building your summary...`
        : `Dimuatkan ${file.name} — membina ringkasan anda...`
    );

    const extracted = await extractTextFromDocument(file);
    setUploadedText(extracted);
    await runFilingAnalysis(targetStock, file.name, extracted);
  };

  const handleClearCustomDocument = () => {
    setUploadedFileName(null);
    setUploadedText('');
    setAiReport(null);
    toast.info(
      language === 'ENG'
        ? 'Cleared uploaded document.'
        : 'Dokumen yang dimuat naik telah dipadamkan.'
    );
  };

  const handleExportSummary = () => {
    if (!currentStock || !activeReport) return;
    const textReport = [
      `JOMRINGKAS — ANNUAL REPORT SUMMARY`,
      `Company: ${currentStock.name} (${currentStock.ticker} / ${currentStock.bursaCode})`,
      `Current Price: RM ${currentStock.price} (${currentStock.changePercent}) | Sector: ${currentStock.sector}`,
      `Health Score: ${activeReport.score} / 100`,
      ...(uploadedText.trim() || activeReport.extractedExcerpt
        ? [
            ``,
            `Document Excerpt (${uploadedFileName || 'Custom Filing'})`,
            activeReport.extractedExcerpt || uploadedText.trim().slice(0, 260)
          ]
        : []),
      ``,
      `1. What's Going Well`,
      activeReport.growth,
      ``,
      `2. Risks to Watch`,
      activeReport.risk,
      ``,
      `3. Dividends & Shariah`,
      activeReport.dividend
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textReport).catch(() => {});
    }

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentStock.ticker}_JomRingkas_Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addXP(15, `Saved ${currentStock.ticker} Summary`);
  };

  const openLearningModal = (item: EducationalItem) => {
    setActiveLearningItem(item);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (!activeLearningItem) return;
    setQuizSubmitted(true);
    const allCorrect = activeLearningItem.quiz.every(
      (q, idx) => quizAnswers[idx] === q.correctIndex
    );
    if (allCorrect) {
      if (!completedQuizzes.includes(activeLearningItem.id)) {
        setCompletedQuizzes(prev => [...prev, activeLearningItem.id]);
        addXP(
          25,
          `Completed Lesson: ${
            language === 'ENG' ? activeLearningItem.titleEng : activeLearningItem.titleBm
          }`
        );
      } else {
        toast.success(
          language === 'ENG'
            ? 'Great job! You have already earned the +25 XP for this lesson.'
            : 'Syabas! Anda telah pun menerima +25 XP untuk pelajaran ini.'
        );
      }
    } else {
      toast.error(
        language === 'ENG'
          ? 'Almost there! Check the highlighted answers and try again.'
          : 'Hampir berjaya! Semak jawapan yang ditandakan dan cuba lagi.'
      );
    }
  };

  const marketBreadth: MarketBreadthSummary = useMemo(
    () => computeMarketBreadth(stocks, newsItems),
    [stocks, newsItems]
  );

  const getFriendlySentimentLabel = (impact: BursaNewsItem['impact']) => {
    if (impact === 'CONSTRUCTIVE') return language === 'ENG' ? 'Bullish' : 'Positif';
    if (impact === 'CAUTIOUS') return language === 'ENG' ? 'Cautious' : 'Berhati-hati';
    return language === 'ENG' ? 'Neutral' : 'Neutral';
  };

  const getFriendlyRegimeLabel = (regime: MarketBreadthSummary['regime']) => {
    if (regime === 'CONSTRUCTIVE') return language === 'ENG' ? 'Bullish Mood' : 'Mood Positif';
    if (regime === 'FEAR') return language === 'ENG' ? 'Cautious Mood' : 'Mood Berhati-hati';
    return language === 'ENG' ? 'Steady / Neutral' : 'Stabil / Neutral';
  };

  const excerptToDisplay =
    activeReport?.extractedExcerpt || (uploadedText.trim() ? uploadedText.trim().slice(0, 260) : '');


  return (
    <div className="rh-page space-y-8">
      {/* Header + Underline Tabs */}
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">
          {language === 'ENG' ? 'Learn & Research' : 'Belajar & Penyelidikan'}
        </h1>

        <div className="rh-tabs">
          <button
            type="button"
            className={`rh-tab ${activeTab === 'reader' ? 'active' : ''}`}
            onClick={() => setActiveTab('reader')}
          >
            {language === 'ENG' ? 'Annual Report Reader' : 'Laporan Tahunan'}
          </button>
          <button
            type="button"
            className={`rh-tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            {language === 'ENG' ? 'Market News' : 'Berita Pasaran'}
          </button>
          <button
            type="button"
            className={`rh-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            {language === 'ENG' ? 'Wealth Calculator' : 'Kalkulator Kekayaan'}
          </button>
          <button
            type="button"
            className={`rh-tab ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            {language === 'ENG' ? 'Lessons' : 'Pelajaran'}
          </button>
        </div>
      </div>

      {/* TAB 1: ANNUAL REPORT READER */}
      {activeTab === 'reader' && (
        <div className="rh-split">
          {/* Main Left: Clean 3-Section Report Summary */}
          <div className="rh-main">
            {isScanning ? (
              <div className="py-16 text-center space-y-2">
                <Loader2
                  size={20}
                  className="animate-spin mx-auto"
                  style={{ color: 'var(--ink-muted)' }}
                />
                <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>{loadingText}</div>
              </div>
            ) : (
              scanComplete &&
              activeReport &&
              currentStock && (
                <div className="space-y-8">
                  <div
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <div>
                      <h2 className="text-lg font-semibold">{activeReport.title}</h2>
                      <div className="text-xs font-tabular mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                        {currentStock.bursaCode} · RM {currentStock.price} ({currentStock.changePercent}) ·{' '}
                        {currentStock.sector}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="rh-link-btn"
                        onClick={() => {
                          setSelectedStock(currentStock);
                          navigateTo('stock-details');
                        }}
                      >
                        {language === 'ENG' ? 'View stock →' : 'Lihat saham →'}
                      </button>
                      <button
                        type="button"
                        className="jom-btn text-xs py-1 px-2.5"
                        onClick={handleExportSummary}
                      >
                        <Download size={12} />
                        <span>{language === 'ENG' ? 'Export (.txt)' : 'Simpan (.txt)'}</span>
                      </button>
                    </div>
                  </div>

                  {excerptToDisplay && (
                    <div
                      className="p-3.5 rounded text-xs space-y-1"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span>
                          {uploadedFileName || (language === 'ENG' ? 'Document excerpt' : 'Petikan dokumen')}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearCustomDocument}
                          className="rh-link-btn"
                        >
                          {language === 'ENG' ? 'Clear' : 'Padam'}
                        </button>
                      </div>
                      <p className="leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                        "{excerptToDisplay}"
                      </p>
                    </div>
                  )}

                  {/* 3 Clean Summary Sections */}
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold">
                        {language === 'ENG' ? '1. Business & Earnings' : '1. Perniagaan & Pendapatan'}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                        {activeReport.growth}
                      </p>
                    </div>

                    <div
                      className="pt-5 border-t space-y-1.5"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <h3 className="text-sm font-semibold">
                        {language === 'ENG' ? '2. Valuation & Key Risks' : '2. Penilaian & Risiko Utama'}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                        {activeReport.risk}
                      </p>
                    </div>

                    <div
                      className="pt-5 border-t space-y-1.5"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <h3 className="text-sm font-semibold">
                        {language === 'ENG' ? '3. Dividends & Shariah Status' : '3. Dividen & Status Syariah'}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                        {activeReport.dividend}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Rail: Company Selector & File Upload */}
          <aside className="rh-rail space-y-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Select Company or Filing' : 'Pilih Syarikat atau Dokumen'}
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs block" style={{ color: 'var(--ink-muted)' }}>
                  {language === 'ENG' ? 'Company' : 'Syarikat'}
                </label>
                <select
                  className="jom-input font-tabular w-full text-xs"
                  value={selectedStockId}
                  onChange={e => {
                    setSelectedStockId(e.target.value);
                    setAiReport(null);
                    setScanComplete(true);
                  }}
                >
                  {stocks.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.ticker} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs block" style={{ color: 'var(--ink-muted)' }}>
                  {language === 'ENG' ? 'Annual report PDF / text' : 'Fail PDF / teks laporan'}
                </label>
                <label className="jom-btn w-full justify-between cursor-pointer text-xs">
                  <span className="truncate flex items-center gap-1.5">
                    <FileText size={13} />
                    <span className="truncate">
                      {uploadedFileName ||
                        (language === 'ENG' ? 'Upload PDF or TXT' : 'Muat naik PDF / TXT')}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.csv"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleFileUpload(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setCustomPasteOpen(prev => !prev)}
                  className="rh-link-btn"
                >
                  {customPasteOpen
                    ? language === 'ENG'
                      ? 'Hide text input'
                      : 'Tutup ruangan teks'
                    : language === 'ENG'
                    ? 'Or paste filing text'
                    : 'Atau tampal teks laporan'}
                </button>

                {customPasteOpen && (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={uploadedText}
                      onChange={e => {
                        setUploadedText(e.target.value);
                        if (!uploadedFileName && e.target.value.trim()) {
                          setUploadedFileName('Pasted_Filing.txt');
                        }
                      }}
                      placeholder={
                        language === 'ENG'
                          ? 'Paste quarterly or annual report excerpt...'
                          : 'Tampal petikan laporan suku tahunan atau tahunan...'
                      }
                      className="jom-input w-full text-xs"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isScanning}
                className="jom-btn jom-btn-primary w-full text-xs py-2"
              >
                {isScanning ? loadingText : language === 'ENG' ? 'Summarize' : 'Ringkaskan'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: MARKET NEWS */}
      {activeTab === 'news' && (
        <div className="rh-split">
          <div className="rh-main space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {language === 'ENG' ? 'Headlines' : 'Berita Terkini'}
              </h2>
              <button
                type="button"
                onClick={() => loadBursaNewsWire(true)}
                disabled={isRefreshingNews}
                className="rh-link-btn flex items-center gap-1"
              >
                <RefreshCw size={12} className={isRefreshingNews ? 'animate-spin' : ''} />
                <span>{language === 'ENG' ? 'Refresh' : 'Segar semula'}</span>
              </button>
            </div>

            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>Headline</th>
                    <th>Ticker</th>
                    <th className="text-right">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {newsItems.map(news => {
                    const matchedStock = stocks.find(s => s.ticker === news.ticker);
                    return (
                      <tr
                        key={news.id}
                        onClick={() => {
                          if (matchedStock) {
                            setSelectedStock(matchedStock);
                            navigateTo('stock-details');
                          }
                        }}
                      >
                        <td>
                          <div className="text-sm font-medium">{news.headline}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                            {news.timeAgo} · {getFriendlySentimentLabel(news.impact)}
                          </div>
                        </td>
                        <td className="font-tabular text-xs font-medium">{news.ticker}</td>
                        <td className="text-right text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {news.url ? (
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="hover:underline inline-flex items-center gap-1"
                            >
                              <span>{news.source}</span>
                              <ArrowUpRight size={11} />
                            </a>
                          ) : (
                            news.source
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Rail: Market Breadth */}
          <aside className="rh-rail space-y-4">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG' ? 'Market Breadth' : ' keluasan Pasaran'}
            </h3>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Sentiment</span>
                <span className="font-medium">{getFriendlyRegimeLabel(marketBreadth.regime)}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Advancers</span>
                <span className="font-tabular font-medium" style={{ color: 'var(--signal-up)' }}>
                  {marketBreadth.advancers}
                </span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Decliners</span>
                <span className="font-tabular font-medium" style={{ color: 'var(--signal-down)' }}>
                  {marketBreadth.decliners}
                </span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Net Flow</span>
                <span className="font-tabular font-medium">{marketBreadth.netFlowLabel}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>BNM OPR</span>
                <span className="font-tabular font-medium">{marketBreadth.oprRate}</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 3: WEALTH CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="rh-split">
          <div className="rh-main space-y-6">
            <div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                {language === 'ENG'
                  ? `10-Year Projection (Total contributed: RM ${finalInvested.toLocaleString()})`
                  : `Unjuran 10 Tahun (Jumlah caruman: RM ${finalInvested.toLocaleString()})`}
              </div>
              <div className="rh-hero-num mt-1">RM {finalWealth.toLocaleString()}</div>
              <div className="text-xs font-tabular font-medium mt-1" style={{ color: 'var(--signal-up)' }}>
                +RM {(finalWealth - finalInvested).toLocaleString()}{' '}
                {language === 'ENG' ? 'compounded return' : 'pulangan kompaun'}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wealthData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-hairline)"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `RM${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value: number) => `RM ${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    name="Stock Portfolio"
                    dataKey="wealth"
                    stroke="var(--signal-up)"
                    strokeWidth={2}
                    fillOpacity={0}
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    name="EPF / KWSP (5.5%)"
                    dataKey="epfAsb"
                    stroke="var(--ink-secondary)"
                    strokeWidth={1.5}
                    fillOpacity={0}
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    name="Fixed Deposit (3.0%)"
                    dataKey="fixedDeposit"
                    stroke="var(--ink-muted)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>Benchmark</th>
                    <th className="text-right">Annual Rate</th>
                    <th className="text-right">10-Year Value</th>
                  </tr>
                </thead>
                <tbody className="font-tabular text-xs">
                  <tr>
                    <td className="font-medium">Selected Stock Strategy</td>
                    <td className="text-right">
                      {(4 + riskLevel * 0.8 - (inflationAdjusted ? 3 : 0)).toFixed(1)}%
                    </td>
                    <td className="text-right font-semibold" style={{ color: 'var(--signal-up)' }}>
                      RM {finalWealth.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--ink-secondary)' }}>EPF / KWSP Historical Average</td>
                    <td className="text-right">{inflationAdjusted ? '2.5%' : '5.5%'}</td>
                    <td className="text-right font-medium">RM {finalEpf.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--ink-secondary)' }}>Bank Fixed Deposit</td>
                    <td className="text-right">{inflationAdjusted ? '0.0%' : '3.0%'}</td>
                    <td className="text-right font-medium">RM {finalFd.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rh-rail space-y-5">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG' ? 'Assumptions' : 'Andaian'}
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Monthly contribution' : 'Simpanan bulanan'}
                </span>
                <span className="font-tabular font-medium">
                  RM {monthlyInvest.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={monthlyInvest}
                onChange={e => setMonthlyInvest(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-[#059669]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Target return' : 'Sasaran pulangan'}
                </span>
                <span className="font-tabular font-medium">
                  {(4 + riskLevel * 0.8).toFixed(1)}% / yr
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={riskLevel}
                onChange={e => setRiskLevel(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-[#059669]"
              />
            </div>

            <div
              className="flex items-center justify-between pt-3 border-t text-xs"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <span style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Adjust for 3% inflation' : 'Laraskan inflasi 3%'}
              </span>
              <button
                type="button"
                onClick={() => setInflationAdjusted(!inflationAdjusted)}
                className="jom-btn py-1 px-2.5 text-xs font-tabular"
              >
                {inflationAdjusted ? 'On' : 'Off'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 4: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="jom-table-wrap">
          <table className="jom-table">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Topic</th>
                <th className="hidden sm:table-cell">Reading Time</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {learningItems.map(item => {
                const isDone = completedQuizzes.includes(item.id);
                return (
                  <tr key={item.id} onClick={() => openLearningModal(item)}>
                    <td>
                      <div className="font-medium text-sm">
                        {language === 'ENG' ? item.titleEng : item.titleBm}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                        {language === 'ENG' ? item.descEng : item.descBm}
                      </div>
                    </td>
                    <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                      {item.badge}
                    </td>
                    <td className="text-xs font-tabular hidden sm:table-cell" style={{ color: 'var(--ink-muted)' }}>
                      {item.meta}
                    </td>
                    <td className="text-right text-xs font-medium">
                      {isDone ? (
                        <span style={{ color: 'var(--signal-up)' }}>Completed</span>
                      ) : (
                        <span>Read →</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LESSON MODAL */}
      {activeLearningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="rh-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl space-y-6">
            <div
              className="flex items-start justify-between gap-4 pb-4 border-b"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {activeLearningItem.code} · {activeLearningItem.meta}
                </div>
                <h2 className="text-lg font-semibold mt-0.5">
                  {language === 'ENG'
                    ? activeLearningItem.titleEng
                    : activeLearningItem.titleBm}
                </h2>
              </div>

              <button
                type="button"
                className="jom-btn-ghost"
                onClick={() => setActiveLearningItem(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
              {(language === 'ENG'
                ? activeLearningItem.contentEng
                : activeLearningItem.contentBm
              ).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div
              className="p-3.5 rounded space-y-1.5"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <div className="text-xs font-semibold">
                {language === 'ENG' ? 'Key Takeaways' : 'Intipati Utama'}
              </div>
              <ul
                className="list-disc list-inside text-xs space-y-1"
                style={{ color: 'var(--ink-secondary)' }}
              >
                {(language === 'ENG'
                  ? activeLearningItem.takeawaysEng
                  : activeLearningItem.takeawaysBm
                ).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div
              className="pt-4 border-t space-y-4"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <h4 className="text-sm font-semibold">
                {language === 'ENG' ? 'Quick Check' : 'Kuiz Ringkas'}
              </h4>

              {activeLearningItem.quiz.map((q, qIdx) => {
                const options = language === 'ENG' ? q.optionsEng : q.optionsBm;
                return (
                  <div key={qIdx} className="space-y-2">
                    <p className="text-xs font-medium">
                      {qIdx + 1}. {language === 'ENG' ? q.qEng : q.qBm}
                    </p>
                    <div className="space-y-1.5">
                      {options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;

                        let borderColor = 'var(--border-hairline)';
                        let bgColor = 'var(--bg-surface)';

                        if (isSelected) {
                          borderColor = 'var(--ink-primary)';
                          bgColor = 'var(--bg-subtle)';
                        }
                        if (quizSubmitted) {
                          if (isCorrect) {
                            borderColor = 'var(--signal-up)';
                            bgColor = 'var(--signal-up-bg)';
                          } else if (isSelected && !isCorrect) {
                            borderColor = 'var(--signal-down)';
                            bgColor = 'var(--signal-down-bg)';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                            }}
                            className="w-full text-left text-xs p-2.5 rounded border transition-colors flex items-center justify-between"
                            style={{ borderColor, backgroundColor: bgColor }}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && (
                              <Check size={13} style={{ color: 'var(--signal-up)' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div
                className="flex justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <button
                  type="button"
                  className="jom-btn text-xs"
                  onClick={() => setActiveLearningItem(null)}
                >
                  {language === 'ENG' ? 'Close' : 'Tutup'}
                </button>
                <button
                  type="button"
                  className="jom-btn jom-btn-primary text-xs"
                  disabled={
                    Object.keys(quizAnswers).length < activeLearningItem.quiz.length
                  }
                  onClick={handleQuizSubmit}
                >
                  {language === 'ENG' ? 'Check Answers' : 'Semak Jawapan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
