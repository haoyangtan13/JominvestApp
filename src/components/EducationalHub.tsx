import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Clock,
  Loader2,
  ArrowUpRight,
  Download,
  Check,
  X,
  RefreshCw,
  FileText
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
    code: 'Video 1',
    type: 'tutorial',
    titleEng: 'How to Read P/E Ratios & Compare Stock Health Scores',
    titleBm: 'Cara Membaca Nisbah P/E & Membandingkan Skor Kesihatan Saham',
    descEng:
      'A step-by-step walkthrough on checking whether a stock is reasonably priced compared to its industry peers.',
    descBm:
      'Panduan langkah demi langkah untuk menyemak sama ada harga saham berpatutan berbanding rakan seindustri.',
    meta: '8 min video guide',
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
      'Use the 30-Second Annual Report Cheat Sheet to confirm revenue and profit are growing'
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
    code: 'Video 2',
    type: 'tutorial',
    titleEng: 'Smart Position Sizing & Avoiding Debt Traps',
    titleBm: 'Saiz Pegangan Bijak & Mengelak Perangkap Hutang',
    descEng:
      'Learn how to protect your portfolio by checking company debt levels and keeping any single sector under 60%.',
    descBm:
      'Pelajari cara melindungi portfolio anda dengan menyemak tahap hutang syarikat dan mengelakkan tumpuan berlebihan.',
    meta: '10 min video guide',
    badge: 'Risk Coaching',
    contentEng: [
      'Great investors focus on protecting their downside first. A helpful beginner habit is keeping any single company under 25% of your portfolio and any single industry under 60%.',
      'Before buying, glance at the Debt-to-Equity ratio on the Stock Overview page. Non-bank companies with lower debt (<0.6x) have a much easier time weathering interest rate changes.',
      'Visit your Diversification Coach on the Portfolio page anytime to see your sector breakdown and sell half of oversized winners to lock in gains.'
    ],
    contentBm: [
      'Pelabur bijak mengutamakan perlindungan modal. Tabiat yang baik ialah menghadkan pendedahan kepada 25% bagi satu syarikat dan maksimum 60% bagi satu sektor.',
      'Sebelum membeli, semak nisbah Hutang-ke-Ekuiti (D/E). Syarikat bukan kewangan dengan hutang rendah (<0.6x) mempunyai kedudukan kewangan lebih kukuh.',
      'Gunakan Jurulatih Kepelbagaian di halaman Portfolio anda untuk memantau pecahan sektor pada bila-bila masa.'
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
        qEng: 'When does the Diversification Coach flag a heavy sector concentration?',
        qBm: 'Bilakah Jurulatih Kepelbagaian memberi peringatan tumpuan sektor?',
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

export function EducationalHub({
  navigateTo,
  language,
  stocks,
  setSelectedStock,
  addXP
}: EducationalHubProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'curriculum' | 'briefings'>('tools');

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
              'Building Your 30-Second Cheat Sheet...'
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

  const texts = {
    ENG: {
      kicker: 'Learn & Research Hub',
      title: 'Bite-Sized Research Tools & 5-Minute Lessons',
      subtitle:
        'Turn long Bursa annual reports into a 30-second cheat sheet, check today’s market mood, compare stocks vs. EPF, and earn XP with quick lessons.',
      tabTools: 'AI Research Tools',
      tabCurriculum: '5-Minute Lessons',
      tabBriefings: 'Video Guides',
      openModule: 'Start Lesson & Quiz (+25 XP)',
      openBriefing: 'Watch Guide & Quiz (+25 XP)',
      reviewModule: 'Completed · Review Notes'
    },
    BM: {
      kicker: 'Hab Belajar & Penyelidikan',
      title: 'Alat Penyelidikan AI & Pelajaran 5 Minit',
      subtitle:
        'Tukarkan laporan tahunan Bursa kepada ringkasan 30 saat, semak mood pasaran hari ini, bandingkan saham vs KWSP, dan kumpul XP.',
      tabTools: 'Alat Penyelidikan AI',
      tabCurriculum: 'Pelajaran 5 Minit',
      tabBriefings: 'Panduan Video',
      openModule: 'Mula Pelajaran & Kuiz (+25 XP)',
      openBriefing: 'Tonton Panduan & Kuiz (+25 XP)',
      reviewModule: 'Selesai · Ulang Kaji'
    }
  };

  const t = texts[language];

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

  const getProviderLabel = (provider?: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM' | 'QUANT_ENGINE') => {
    if (provider === 'API_KEY_LLM') return 'Live AI Summary';
    if (provider === 'LIVE_CLOUD_LLM') return 'JomAI Cloud';
    return 'JomRingkas AI';
  };

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
        ? `Loaded ${file.name} — building your 30-second cheat sheet...`
        : `Dimuatkan ${file.name} — membina ringkasan 30 saat anda...`
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
      `JOMRINGKAS — 30-SECOND ANNUAL REPORT CHEAT SHEET`,
      `Company: ${currentStock.name} (${currentStock.ticker} / ${currentStock.bursaCode})`,
      `Current Price: RM ${currentStock.price} (${currentStock.changePercent}) | Sector: ${currentStock.sector}`,
      `Summary Engine: ${getProviderLabel(activeReport.provider)} | Health Score: ${activeReport.score} / 100`,
      ...(uploadedText.trim() || activeReport.extractedExcerpt
        ? [
            ``,
            `Document Excerpt (${uploadedFileName || 'Custom Filing'})`,
            activeReport.extractedExcerpt || uploadedText.trim().slice(0, 260)
          ]
        : []),
      ``,
      `1. What's Going Well (Growth)`,
      activeReport.growth,
      ``,
      `2. What to Watch Out For (Risks)`,
      activeReport.risk,
      ``,
      `3. Dividends & Shariah Status`,
      activeReport.dividend
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textReport).catch(() => {});
    }

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentStock.ticker}_JomRingkas_Cheat_Sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addXP(15, `Saved ${currentStock.ticker} Cheat Sheet`);
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

  const articleItems = learningItems.filter(i => i.type === 'article');
  const tutorialItems = learningItems.filter(i => i.type === 'tutorial');

  const marketBreadth: MarketBreadthSummary = useMemo(
    () => computeMarketBreadth(stocks, newsItems),
    [stocks, newsItems]
  );

  const getFriendlySentimentLabel = (impact: BursaNewsItem['impact']) => {
    if (impact === 'CONSTRUCTIVE') return language === 'ENG' ? 'Bullish' : 'Positif';
    if (impact === 'CAUTIOUS') return language === 'ENG' ? 'Cautious' : 'Berhati-hati';
    return language === 'ENG' ? 'Neutral' : 'Neutral';
  };

  const getImpactTagClass = (impact: BursaNewsItem['impact']) => {
    if (impact === 'CONSTRUCTIVE') return 'jom-tag jom-tag-up';
    if (impact === 'CAUTIOUS') return 'jom-tag jom-tag-down';
    return 'jom-tag';
  };

  const getFriendlyRegimeLabel = (regime: MarketBreadthSummary['regime']) => {
    if (regime === 'CONSTRUCTIVE') return language === 'ENG' ? 'Bullish Mood' : 'Mood Positif';
    if (regime === 'FEAR') return language === 'ENG' ? 'Cautious Mood' : 'Mood Berhati-hati';
    return language === 'ENG' ? 'Steady / Neutral' : 'Stabil / Neutral';
  };

  const getRegimeTagClass = (regime: MarketBreadthSummary['regime']) => {
    if (regime === 'CONSTRUCTIVE') return 'jom-tag jom-tag-up';
    if (regime === 'FEAR') return 'jom-tag jom-tag-down';
    return 'jom-tag jom-tag-warn';
  };

  const excerptToDisplay =
    activeReport?.extractedExcerpt || (uploadedText.trim() ? uploadedText.trim().slice(0, 260) : '');

  const currentMonogram = currentStock
    ? getStockMonogram(currentStock.ticker, currentStock.sector)
    : { initials: 'JM', avatarClass: 'jom-avatar jom-avatar-emerald' };

  return (
    <div className="jom-container space-y-8">
      {/* Friendly Consumer Header */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="space-y-1.5">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-4xl">{t.title}</h1>
          <p className="text-sm max-w-2xl" style={{ color: 'var(--ink-secondary)' }}>
            {t.subtitle}
          </p>
        </div>

        <div className="jom-segmented shrink-0">
          <button
            type="button"
            className={activeTab === 'tools' ? 'active' : ''}
            onClick={() => setActiveTab('tools')}
          >
            {t.tabTools}
          </button>
          <button
            type="button"
            className={activeTab === 'curriculum' ? 'active' : ''}
            onClick={() => setActiveTab('curriculum')}
          >
            {t.tabCurriculum} ({articleItems.length})
          </button>
          <button
            type="button"
            className={activeTab === 'briefings' ? 'active' : ''}
            onClick={() => setActiveTab('briefings')}
          >
            {t.tabBriefings} ({tutorialItems.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI RESEARCH TOOLS */}
      {activeTab === 'tools' && (
        <div className="space-y-8">
          {/* 1. JomRingkas — 30-Second Annual Report Cheat Sheet */}
          <section className="jom-panel overflow-hidden">
            <div className="grid md:grid-cols-12">
              {/* Left 4 cols: Company Picker & Friendly File Dropzone */}
              <div
                className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between space-y-6"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: 'var(--bg-elevated)'
                }}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="jom-kicker">JomRingkas AI Summarizer</span>
                      <span className="jom-tag jom-tag-shariah font-tabular">
                        {stocks.length} Bursa Companies
                      </span>
                    </div>
                    <h2 className="font-editorial text-2xl">
                      {language === 'ENG'
                        ? '30-Second Annual Report Cheat Sheet'
                        : 'Ringkasan Laporan Tahunan 30 Saat'}
                    </h2>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                      {language === 'ENG'
                        ? 'Skip the 200-page PDF! Pick any Bursa company or upload a report to get 3 plain-English takeaways.'
                        : 'Tidak perlu baca ratusan muka surat! Pilih syarikat Bursa atau muat naik PDF untuk 3 intipati mudah.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="jom-kicker block">
                      {language === 'ENG' ? 'Choose a Bursa Company' : 'Pilih Syarikat Bursa'}
                    </label>
                    <select
                      className="jom-input font-tabular w-full"
                      value={selectedStockId}
                      onChange={e => {
                        setSelectedStockId(e.target.value);
                        setAiReport(null);
                        setScanComplete(true);
                      }}
                    >
                      {stocks.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.ticker} ({s.bursaCode}) — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Friendly File Dropzone & Paste Announcement */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="jom-kicker block">
                        {language === 'ENG'
                          ? 'Upload a Bursa Annual Report PDF or paste an announcement'
                          : 'Muat naik PDF Laporan Tahunan atau tampal pengumuman'}
                      </label>
                    </div>
                    <label className="jom-btn w-full justify-between cursor-pointer text-xs">
                      <span className="truncate flex items-center gap-1.5">
                        <FileText size={14} />
                        <span className="truncate">
                          {uploadedFileName ||
                            (language === 'ENG'
                              ? 'Choose PDF / TXT file from your device'
                              : 'Pilih fail PDF / TXT dari peranti anda')}
                        </span>
                      </span>
                      <span className="jom-tag">Browse</span>
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

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCustomPasteOpen(prev => !prev)}
                        className="jom-kicker underline cursor-pointer"
                      >
                        {customPasteOpen
                          ? language === 'ENG'
                            ? 'Hide text box'
                            : 'Tutup ruangan teks'
                          : language === 'ENG'
                          ? 'Or paste announcement text instead'
                          : 'Atau tampal teks pengumuman'}
                      </button>
                    </div>

                    {customPasteOpen && (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          rows={3}
                          value={uploadedText}
                          onChange={e => {
                            setUploadedText(e.target.value);
                            if (!uploadedFileName && e.target.value.trim()) {
                              setUploadedFileName('Pasted_Bursa_Filing.txt');
                            }
                          }}
                          placeholder={
                            language === 'ENG'
                              ? 'Paste a quarterly announcement, earnings release, or annual report paragraph here...'
                              : 'Tampal pengumuman suku tahunan atau petikan laporan tahunan di sini...'
                          }
                          className="jom-input w-full text-xs"
                        />
                        {(uploadedFileName || uploadedText) && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleClearCustomDocument}
                              className="jom-btn py-1 px-2.5 text-xs"
                            >
                              {language === 'ENG' ? 'Clear Document' : 'Padam Dokumen'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {currentStock && (
                    <div className="jom-panel p-4 space-y-2.5 text-xs">
                      <div
                        className="jom-kicker pb-1 border-b"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        {language === 'ENG' ? 'Quick Snapshot' : 'Ringkasan Pantas'}
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>
                          {language === 'ENG' ? 'Share Price (24h)' : 'Harga Saham (24j)'}
                        </span>
                        <span className="font-semibold">
                          RM {currentStock.price} ({currentStock.changePercent})
                        </span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>
                          {language === 'ENG' ? 'P/E · Dividend Yield' : 'P/E · Hasil Dividen'}
                        </span>
                        <span className="font-semibold">
                          {currentStock.peRatio}x · {currentStock.dividendYield}
                        </span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>
                          {language === 'ENG' ? 'Debt-to-Equity' : 'Hutang-ke-Ekuiti'}
                        </span>
                        <span className="font-semibold">{currentStock.debtEquity}</span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>
                          {language === 'ENG' ? 'Yearly Revenue / Profit' : 'Hasil / Untung Tahunan'}
                        </span>
                        <span className="font-semibold">
                          {currentStock.revenue} / {currentStock.netProfit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isScanning}
                  className="jom-btn jom-btn-primary w-full"
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <span>
                      {language === 'ENG'
                        ? 'Generate 30-Second Cheat Sheet'
                        : 'Jana Ringkasan 30 Saat'}
                    </span>
                  )}
                </button>
              </div>

              {/* Right 8 cols: 3 Scannable Takeaway Cards */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between">
                {isScanning ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto"
                      style={{ color: 'var(--accent-brand)' }}
                    />
                    <div className="text-sm font-semibold">{loadingText}</div>
                  </div>
                ) : (
                  scanComplete &&
                  activeReport &&
                  currentStock && (
                    <div className="space-y-6">
                      {/* Cheat Sheet Header */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`${currentMonogram.avatarClass} jom-avatar-lg`}>
                            {currentMonogram.initials}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="jom-tag">
                                {activeReport.sourceLabel || 'Annual Report Summary'}
                              </span>
                              <span className="jom-tag font-tabular">{currentStock.bursaCode}</span>
                              {currentStock.isShariah ? (
                                <span className="jom-tag jom-tag-shariah">Shariah-Compliant</span>
                              ) : (
                                <span className="jom-tag">Conventional</span>
                              )}
                              <span className="jom-tag font-tabular">
                                {getProviderLabel(activeReport.provider)}
                              </span>
                            </div>
                            <h3 className="font-editorial text-2xl">{activeReport.title}</h3>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <div className="jom-kicker">
                            {language === 'ENG' ? 'Overall Health Score' : 'Skor Kesihatan Syarikat'}
                          </div>
                          <div
                            className="font-tabular text-2xl font-semibold mt-0.5"
                            style={{ color: 'var(--signal-up)' }}
                          >
                            {activeReport.score} / 100
                          </div>
                        </div>
                      </div>

                      {/* Extracted Document Excerpt Box */}
                      {excerptToDisplay && (
                        <div
                          className="jom-panel-subtle p-4 space-y-1.5"
                          style={{ borderLeft: '3px solid var(--accent-brand)' }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="jom-kicker">
                              {language === 'ENG' ? 'Excerpt from Uploaded Filing' : 'Petikan Dokumen'}
                              {uploadedFileName ? ` · ${uploadedFileName}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={handleClearCustomDocument}
                              className="jom-kicker underline cursor-pointer"
                            >
                              {language === 'ENG' ? 'Clear' : 'Padam'}
                            </button>
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            "{excerptToDisplay}"
                          </p>
                        </div>
                      )}

                      {/* 3 Clean, Scannable Takeaway Cards */}
                      <div className="space-y-4">
                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="jom-kicker" style={{ color: 'var(--signal-up)' }}>
                              {language === 'ENG'
                                ? "What's Going Well (Growth)"
                                : 'Apa Yang Positif (Pertumbuhan)'}
                            </span>
                            <span className="jom-tag jom-tag-up">Growth Drivers</span>
                          </div>
                          <p
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: 'var(--ink-primary)' }}
                          >
                            {activeReport.growth}
                          </p>
                        </div>

                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="jom-kicker" style={{ color: 'var(--signal-warn)' }}>
                              {language === 'ENG'
                                ? 'What to Watch Out For (Risks)'
                                : 'Perkara Perlu Diperhatikan (Risiko)'}
                            </span>
                            <span className="jom-tag jom-tag-warn">Key Risks & Valuation</span>
                          </div>
                          <p
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: 'var(--ink-primary)' }}
                          >
                            {activeReport.risk}
                          </p>
                        </div>

                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="jom-kicker" style={{ color: 'var(--accent-brand)' }}>
                              {language === 'ENG'
                                ? 'Dividends & Shariah Status'
                                : 'Dividen & Status Syariah'}
                            </span>
                            <span className="jom-tag jom-tag-shariah">Payout & Compliance</span>
                          </div>
                          <p
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: 'var(--ink-primary)' }}
                          >
                            {activeReport.dividend}
                          </p>
                        </div>
                      </div>

                      {/* Cheat Sheet Actions */}
                      <div
                        className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        <a
                          href={`https://www.bursamalaysia.com/market_information/announcements/company_announcement?company=${currentStock.bursaCode.replace('.KL', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="jom-btn"
                        >
                          <span>
                            {language === 'ENG'
                              ? 'Official Bursa Announcements'
                              : 'Pengumuman Rasmi Bursa'}
                          </span>
                          <ArrowUpRight size={14} />
                        </a>
                        <button
                          type="button"
                          className="jom-btn"
                          onClick={() => {
                            setSelectedStock(currentStock);
                            navigateTo('stock-details');
                          }}
                        >
                          <span>
                            {language === 'ENG' ? 'View Stock Overview' : 'Lihat Gambaran Saham'}
                          </span>
                          <ArrowUpRight size={14} />
                        </button>
                        <button
                          type="button"
                          className="jom-btn jom-btn-primary"
                          onClick={handleExportSummary}
                        >
                          <Download size={14} />
                          <span>
                            {language === 'ENG'
                              ? 'Save Cheat Sheet (+15 XP)'
                              : 'Simpan Ringkasan (+15 XP)'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* 2. JomSentimen — Visual Bursa Market Mood & Clean News Story Cards */}
          <section className="jom-panel overflow-hidden">
            <div className="grid md:grid-cols-12">
              {/* Left 5 cols: Visual Bursa Market Mood Card */}
              <div
                className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between space-y-6"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="jom-kicker">JomSentimen Market Pulse</span>
                    <span className={getRegimeTagClass(marketBreadth.regime)}>
                      {getFriendlyRegimeLabel(marketBreadth.regime)}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl">
                    {language === 'ENG' ? 'Bursa Market Mood' : 'Mood Pasaran Bursa'}
                  </h2>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                    {language === 'ENG'
                      ? 'See at a glance whether Malaysian investors are feeling optimistic (Bullish), steady, or cautious today.'
                      : 'Lihat sepintas lalu sama ada pelabur Malaysia berasa optimis (Bullish), stabil, atau berhati-hati hari ini.'}
                  </p>
                </div>

                {/* Clean SVG Market Mood Gauge */}
                <div className="flex flex-col items-center py-2">
                  <div className="relative w-60 h-28">
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                      <path
                        d="M 20 95 A 80 80 0 0 1 180 95"
                        fill="none"
                        stroke="var(--border-hairline)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 95 A 80 80 0 0 1 65 30"
                        fill="none"
                        stroke="var(--signal-down)"
                        strokeWidth="12"
                      />
                      <path
                        d="M 67 29 A 80 80 0 0 1 133 29"
                        fill="none"
                        stroke="var(--signal-warn)"
                        strokeWidth="12"
                      />
                      <path
                        d="M 135 30 A 80 80 0 0 1 180 95"
                        fill="none"
                        stroke="var(--signal-up)"
                        strokeWidth="12"
                      />
                      <g
                        style={{
                          transform: `rotate(${(marketBreadth.score / 100) * 180 - 90}deg)`,
                          transformOrigin: '100px 95px',
                          transition: 'transform 0.45s ease'
                        }}
                      >
                        <line
                          x1="100"
                          y1="95"
                          x2="100"
                          y2="24"
                          stroke="var(--ink-primary)"
                          strokeWidth="2.5"
                        />
                        <circle cx="100" cy="95" r="4.5" fill="var(--ink-primary)" />
                      </g>
                    </svg>
                  </div>

                  <div className="flex justify-between w-60 text-xs font-semibold mt-1">
                    <span style={{ color: 'var(--signal-down)' }}>
                      {language === 'ENG' ? 'Cautious' : 'Berhati-hati'}
                    </span>
                    <span style={{ color: 'var(--signal-warn)' }}>Neutral</span>
                    <span style={{ color: 'var(--signal-up)' }}>
                      {language === 'ENG' ? 'Bullish' : 'Positif'}
                    </span>
                  </div>

                  <div className="text-center mt-4">
                    <div className="jom-kicker">
                      {language === 'ENG' ? 'Today’s Mood Score' : 'Skor Mood Hari Ini'}
                    </div>
                    <div className="font-tabular text-2xl font-semibold mt-0.5">
                      {marketBreadth.score} / 100 · {getFriendlyRegimeLabel(marketBreadth.regime)}
                    </div>
                  </div>
                </div>

                {/* Friendly Market Pulse Strip */}
                <div
                  className="grid grid-cols-3 gap-2 pt-2 border-t"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div className="jom-panel-subtle p-2.5">
                    <div className="jom-kicker">
                      {language === 'ENG' ? 'Up / Down' : 'Naik / Turun'}
                    </div>
                    <div className="font-tabular text-xs font-semibold mt-1">
                      {marketBreadth.advancers} / {marketBreadth.decliners}
                    </div>
                  </div>
                  <div className="jom-panel-subtle p-2.5">
                    <div className="jom-kicker">
                      {language === 'ENG' ? 'Fund Flow' : 'Aliran Dana'}
                    </div>
                    <div
                      className="font-tabular text-xs font-semibold mt-1"
                      style={{
                        color: marketBreadth.netFlowLabel.startsWith('-')
                          ? 'var(--signal-down)'
                          : 'var(--signal-up)'
                      }}
                    >
                      {marketBreadth.netFlowLabel}
                    </div>
                  </div>
                  <div className="jom-panel-subtle p-2.5">
                    <div className="jom-kicker">BNM OPR</div>
                    <div className="font-tabular text-xs font-semibold mt-1">
                      {marketBreadth.oprRate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 cols: Clean News Story Cards */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div
                  className="pb-4 border-b flex items-center justify-between gap-2"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="jom-kicker">
                      {language === 'ENG' ? 'Malaysian Market Stories' : 'Berita Pasaran Malaysia'}
                    </div>
                    <h3 className="font-editorial text-xl">
                      {language === 'ENG'
                        ? 'What’s Moving Bursa Stocks Today'
                        : 'Apa Yang Menggerakkan Saham Bursa Hari Ini'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadBursaNewsWire(true)}
                    disabled={isRefreshingNews}
                    className="jom-btn py-1.5 px-3 text-xs"
                  >
                    <RefreshCw size={12} className={isRefreshingNews ? 'animate-spin' : ''} />
                    <span>{language === 'ENG' ? 'Refresh Stories' : 'Segar Semula'}</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  {newsItems.map(news => {
                    const matchedStock = stocks.find(s => s.ticker === news.ticker);
                    const monogram = getStockMonogram(news.ticker, matchedStock?.sector);
                    return (
                      <div
                        key={news.id}
                        onClick={() => {
                          if (matchedStock) {
                            setSelectedStock(matchedStock);
                            navigateTo('stock-details');
                          }
                        }}
                        className="jom-panel-subtle p-4 cursor-pointer transition-all hover:border-[var(--border-strong)] flex items-start justify-between gap-3.5"
                        style={{ border: '1px solid var(--border-hairline)' }}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={monogram.avatarClass}>{monogram.initials}</div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs">{news.source}</span>
                              <span
                                className="font-tabular text-xs"
                                style={{ color: 'var(--ink-muted)' }}
                              >
                                · {news.timeAgo} · {news.ticker}
                              </span>
                            </div>
                            <p
                              className="text-xs sm:text-sm leading-relaxed"
                              style={{ color: 'var(--ink-primary)' }}
                            >
                              {news.headline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={getImpactTagClass(news.impact)}>
                            {getFriendlySentimentLabel(news.impact)}
                          </span>
                          {news.url && (
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="jom-btn py-1 px-2 text-xs"
                              title={
                                language === 'ENG'
                                  ? 'Read full article'
                                  : 'Baca artikel penuh'
                              }
                            >
                              <ArrowUpRight size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Stocks vs. EPF (KWSP) & FD Wealth Calculator */}
          <section className="jom-panel p-6 space-y-6">
            <div
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">
                  {language === 'ENG'
                    ? '10-Year Compounding Simulator'
                    : 'Simulator Kompaun 10 Tahun'}
                </div>
                <h2 className="font-editorial text-2xl mt-0.5">
                  {language === 'ENG'
                    ? 'Stocks vs. EPF (KWSP) & FD Wealth Calculator'
                    : 'Kalkulator Kekayaan: Saham vs. KWSP & Deposit Tetap (FD)'}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG'
                    ? 'See how investing a fixed Ringgit amount every month compares against EPF/ASB (5.5% p.a.) and Fixed Deposits (3.0% p.a.) over 10 years.'
                    : 'Lihat bagaimana melabur jumlah RM tetap setiap bulan berbanding KWSP/ASB (5.5% setahun) dan Deposit Tetap (3.0% setahun) selama 10 tahun.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="jom-tag jom-tag-shariah font-tabular">
                  Est. {(4 + riskLevel * 0.8 - (inflationAdjusted ? 3 : 0)).toFixed(1)}% / yr
                </span>
                {inflationAdjusted && (
                  <span className="jom-tag jom-tag-warn">Inflation-Adjusted (-3%)</span>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-center">
              {/* Left 8 cols: Recharts AreaChart */}
              <div className="lg:col-span-8 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wealthData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="jomEquityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                      width={58}
                    />
                    <Tooltip
                      formatter={(value: number) => `RM ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      name="Bursa Stock Strategy"
                      dataKey="wealth"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#jomEquityGrad)"
                    />
                    <Area
                      type="monotone"
                      name="EPF (KWSP) / ASB (5.5%)"
                      dataKey="epfAsb"
                      stroke="#475569"
                      strokeWidth={2}
                      fillOpacity={0}
                    />
                    <Area
                      type="monotone"
                      name="Fixed Deposit (3.0%)"
                      dataKey="fixedDeposit"
                      stroke="#D97706"
                      strokeWidth={1.75}
                      strokeDasharray="4 4"
                      fillOpacity={0}
                    />
                    <Area
                      type="monotone"
                      name="Total Cash Saved"
                      dataKey="invested"
                      stroke="#94A3B8"
                      strokeWidth={1.25}
                      strokeDasharray="2 2"
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Right 4 cols: Friendly Sliders */}
              <div className="lg:col-span-4 jom-panel-subtle p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="jom-kicker">
                      {language === 'ENG' ? 'Monthly Savings' : 'Simpanan Bulanan'}
                    </span>
                    <span className="font-tabular text-sm font-semibold">
                      RM {monthlyInvest.toLocaleString()} / mo
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
                  <div
                    className="flex justify-between font-tabular text-xs"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    <span>RM 100</span>
                    <span>Total put in: RM {finalInvested.toLocaleString()}</span>
                    <span>RM 5,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="jom-kicker">
                      {language === 'ENG' ? 'Investor Style & Return' : 'Gaya Pelabur & Pulangan'}
                    </span>
                    <span className="jom-tag font-tabular">
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
                  <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--ink-secondary)' }}>
                    {riskLevel <= 3
                      ? 'Conservative Style: Focuses on steady utilities & REIT dividends (4.8%–6.4% yearly).'
                      : riskLevel <= 7
                      ? 'Balanced Style: Mixes Malaysian banks with steady growth leaders (7.2%–9.6% yearly).'
                      : 'Explorer Style: Focuses on faster-growing tech, infrastructure & data center stocks (10.4%–12.0% yearly).'}
                  </p>
                </div>

                <div
                  className="flex items-center justify-between pt-4 border-t"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="text-xs font-semibold">
                      {language === 'ENG' ? 'Adjust for Inflation' : 'Laraskan Untuk Inflasi'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {language === 'ENG'
                        ? 'Show real buying power (-3% inflation/yr)'
                        : 'Tunjukkan kuasa beli sebenar (-3% setahun)'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInflationAdjusted(!inflationAdjusted)}
                    className={`jom-btn py-1 px-3 text-xs font-tabular ${
                      inflationAdjusted ? 'jom-btn-primary' : ''
                    }`}
                  >
                    {inflationAdjusted
                      ? language === 'ENG'
                        ? 'On (-3%)'
                        : 'Aktif (-3%)'
                      : language === 'ENG'
                      ? 'Off'
                      : 'Matikan'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3-Card Comparison Strip Below */}
            <div className="jom-ledger-strip">
              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">
                    {language === 'ENG' ? 'Bursa Stock Strategy' : 'Strategi Saham Bursa'}
                  </span>
                  <span className="jom-tag jom-tag-up font-tabular">
                    +RM {(finalWealth - finalInvested).toLocaleString()} profit
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalWealth.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  from RM {finalInvested.toLocaleString()} total savings
                </div>
              </div>

              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">EPF (KWSP) / ASB (5.5% / yr)</span>
                  <span className="jom-tag font-tabular">
                    +RM {(finalEpf - finalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalEpf.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Stocks difference: {finalWealth >= finalEpf ? '+' : ''}RM{' '}
                  {(finalWealth - finalEpf).toLocaleString()}
                </div>
              </div>

              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">Fixed Deposit (3.0% / yr)</span>
                  <span className="jom-tag font-tabular">
                    +RM {(finalFd - finalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalFd.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Stocks difference: +RM {(finalWealth - finalFd).toLocaleString()}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: 5-MINUTE LESSONS */}
      {activeTab === 'curriculum' && (
        <div className="grid md:grid-cols-3 gap-6">
          {articleItems.map(article => {
            const isDone = completedQuizzes.includes(article.id);
            return (
              <div
                key={article.id}
                onClick={() => openLearningModal(article)}
                className="jom-panel p-6 flex flex-col justify-between cursor-pointer transition-colors hover:border-[var(--border-strong)] space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="jom-tag font-tabular">{article.code}</span>
                      <span className="jom-tag jom-tag-shariah">{article.badge}</span>
                    </div>
                    {isDone ? (
                      <span className="jom-tag jom-tag-up">Completed</span>
                    ) : (
                      <span
                        className="font-tabular text-xs flex items-center gap-1"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        <Clock size={12} />
                        {article.meta}
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-2xl">
                    {language === 'ENG' ? article.titleEng : article.titleBm}
                  </h3>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                    {language === 'ENG' ? article.descEng : article.descBm}
                  </p>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                  <button
                    type="button"
                    className={`jom-btn w-full ${isDone ? '' : 'jom-btn-primary'}`}
                    onClick={e => {
                      e.stopPropagation();
                      openLearningModal(article);
                    }}
                  >
                    {isDone ? (
                      <>
                        <Check size={14} />
                        <span>{t.reviewModule}</span>
                      </>
                    ) : (
                      <span>{t.openModule}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: VIDEO GUIDES */}
      {activeTab === 'briefings' && (
        <div className="grid md:grid-cols-2 gap-6">
          {tutorialItems.map((tutorial, index) => {
            const isDone = completedQuizzes.includes(tutorial.id);
            return (
              <div
                key={tutorial.id}
                onClick={() => openLearningModal(tutorial)}
                className="jom-panel overflow-hidden flex flex-col justify-between cursor-pointer transition-colors hover:border-[var(--border-strong)]"
              >
                <div>
                  <div
                    className="relative aspect-video bg-black/10 overflow-hidden border-b"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <ImageWithFallback
                      src={
                        index % 2 === 0
                          ? 'https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                          : 'https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                      }
                      alt="Video guide thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-hairline)',
                          color: 'var(--accent-brand)'
                        }}
                      >
                        <Play size={18} className="ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="jom-tag font-tabular">{tutorial.code}</span>
                        <span className="jom-tag jom-tag-shariah">{tutorial.badge}</span>
                      </div>
                      {isDone ? (
                        <span className="jom-tag jom-tag-up">Completed</span>
                      ) : (
                        <span
                          className="font-tabular text-xs"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {tutorial.meta}
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-2xl">
                      {language === 'ENG' ? tutorial.titleEng : tutorial.titleBm}
                    </h3>

                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                      {language === 'ENG' ? tutorial.descEng : tutorial.descBm}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    type="button"
                    className={`jom-btn w-full ${isDone ? '' : 'jom-btn-primary'}`}
                    onClick={e => {
                      e.stopPropagation();
                      openLearningModal(tutorial);
                    }}
                  >
                    <Play size={13} />
                    <span>{isDone ? t.reviewModule : t.openBriefing}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LESSON & QUIZ MODAL */}
      {activeLearningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="jom-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div
              className="sticky top-0 z-10 p-6 border-b flex items-start justify-between gap-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="jom-tag font-tabular">{activeLearningItem.code}</span>
                  <span className="jom-tag jom-tag-shariah">{activeLearningItem.badge}</span>
                  <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {activeLearningItem.meta}
                  </span>
                </div>
                <h2 className="font-editorial text-2xl">
                  {language === 'ENG'
                    ? activeLearningItem.titleEng
                    : activeLearningItem.titleBm}
                </h2>
              </div>

              <button
                type="button"
                className="jom-btn py-1.5 px-2.5"
                onClick={() => setActiveLearningItem(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lesson Content */}
              <div
                className="space-y-3 text-sm leading-relaxed"
                style={{ color: 'var(--ink-primary)' }}
              >
                {(language === 'ENG'
                  ? activeLearningItem.contentEng
                  : activeLearningItem.contentBm
                ).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Takeaways */}
              <div className="jom-panel-subtle p-4 space-y-2">
                <div className="jom-kicker">
                  {language === 'ENG' ? 'Key Takeaways to Remember' : 'Intipati Penting'}
                </div>
                <ul
                  className="list-disc list-inside text-xs space-y-1.5"
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

              {/* Quick 2-Question Check-In */}
              <div className="jom-panel p-5 space-y-4">
                <div
                  className="flex items-center justify-between pb-3 border-b"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="jom-kicker">
                      {language === 'ENG' ? 'Quick Knowledge Check' : 'Kuiz Ringkas'}
                    </div>
                    <h4 className="font-editorial text-xl">
                      {language === 'ENG'
                        ? 'Answer 2 Questions to Earn +25 XP'
                        : 'Jawab 2 Soalan Untuk Kumpul +25 XP'}
                    </h4>
                  </div>
                  <span className="jom-tag jom-tag-shariah font-tabular">+25 XP</span>
                </div>

                {activeLearningItem.quiz.map((q, qIdx) => {
                  const options = language === 'ENG' ? q.optionsEng : q.optionsBm;
                  return (
                    <div key={qIdx} className="space-y-2">
                      <p className="text-xs font-semibold">
                        {qIdx + 1}. {language === 'ENG' ? q.qEng : q.qBm}
                      </p>
                      <div className="space-y-1.5">
                        {options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let borderColor = 'var(--border-hairline)';
                          let bgColor = 'var(--bg-surface)';

                          if (isSelected) {
                            borderColor = 'var(--accent-brand)';
                            bgColor = 'var(--accent-brand-subtle)';
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
                              className="w-full text-left text-xs p-3 rounded-xl border transition-colors flex items-center justify-between"
                              style={{ borderColor, backgroundColor: bgColor }}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <span className="jom-tag jom-tag-up">Correct</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div
                  className="flex justify-end gap-2.5 pt-3 border-t"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <button
                    type="button"
                    className="jom-btn"
                    onClick={() => setActiveLearningItem(null)}
                  >
                    {language === 'ENG' ? 'Close' : 'Tutup'}
                  </button>
                  <button
                    type="button"
                    className="jom-btn jom-btn-primary"
                    disabled={
                      Object.keys(quizAnswers).length < activeLearningItem.quiz.length
                    }
                    onClick={handleQuizSubmit}
                  >
                    {language === 'ENG'
                      ? 'Check Answers & Claim +25 XP'
                      : 'Semak Jawapan & Tuntut +25 XP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
