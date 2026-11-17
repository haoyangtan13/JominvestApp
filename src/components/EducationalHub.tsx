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

const learningItems: EducationalItem[] = [
  {
    id: 'art-dividend',
    code: 'MOD-01',
    type: 'article',
    titleEng: 'Single-Tier Dividends & Entitlement Mechanics on Bursa',
    titleBm: 'Dividen Satu Peringkat & Mekanisme Kelayakan di Bursa',
    descEng:
      'How Malaysian blue-chip issuers distribute tax-exempt cash dividends and how Ex-Date settlement rules operate.',
    descBm:
      'Bagaimana syarikat cip biru Malaysia mengagihkan dividen tunai dikecualikan cukai dan peraturan penyelesaian Ex-Date.',
    meta: '05 MIN READ',
    badge: 'FUNDAMENTALS',
    contentEng: [
      'A dividend is a cash distribution paid by a profitable listed issuer to its shareholders. On Bursa Malaysia, institutional staples and financial institutions typically declare dividends semi-annually or quarterly.',
      'For example, if Malayan Banking Berhad (MAYBANK) trades at RM 10.54 with a 6.15% indicated yield, holding 1,000 shares (10 standard board lots valued at RM 10,540) generates approximately RM 648 annually in tax-exempt single-tier cash dividends.',
      'Entitlement is governed strictly by the Ex-Dividend Date (Ex-Date): an investor must execute a buy order at least one trading day prior to the Ex-Date to be recorded on the Central Depository System (CDS) register for the payout.'
    ],
    contentBm: [
      'Dividen ialah agihan tunai daripada keuntungan syarikat kepada pemegang sahamnya. Di Bursa Malaysia, syarikat cip biru lazimnya membayar dividen dua kali setahun atau setiap suku tahun.',
      'Sebagai contoh, jika Maybank (MAYBANK) didagangkan pada RM 10.54 dengan kadar hasil dividen 6.15%, memegang 1,000 unit (10 lot bernilai RM 10,540) menjana kira-kira RM 648 setahun dalam bentuk dividen tunai.',
      'Perhatikan Tarikh Ex-Dividen (Ex-Date): anda mesti membeli saham sekurang-kurangnya 1 hari dagangan sebelum Ex-Date untuk layak menerima bayaran dividen tersebut.'
    ],
    takeawaysEng: [
      'Dividend Yield (%) = (Annual Dividend Per Share / Current Market Price) x 100',
      'Malaysia operates a Single-Tier Dividend System: cash dividends are tax-exempt in the hands of retail investors',
      'Sustainable yields (>4.5%) require healthy free cash flow and disciplined payout ratios'
    ],
    takeawaysBm: [
      'Kadar Hasil Dividen (%) = (Dividen Tahunan Sesaham / Harga Saham Semasa) x 100',
      'Malaysia menggunakan Sistem Dividen Satu Peringkat: dividen dikecualikan cukai untuk pelabur runcit',
      'Hasil dividen tinggi (>4.5%) memerlukan aliran tunai bebas yang kukuh'
    ],
    quiz: [
      {
        qEng: 'When must you purchase a Bursa Malaysia security to qualify for its declared cash dividend?',
        qBm: 'Bilakah anda mesti membeli saham Bursa Malaysia untuk layak mendapat dividen yang diumumkan?',
        optionsEng: ['Before the Ex-Dividend Date', 'On the Payment Date', 'After the Entitlement Date'],
        optionsBm: ['Sebelum Tarikh Ex-Dividen', 'Pada Tarikh Pembayaran', 'Selepas Tarikh Kelayakan'],
        correctIndex: 0
      },
      {
        qEng: 'If a security priced at RM 10.00 distributes RM 0.50 annual dividend per share, what is its dividend yield?',
        qBm: 'Jika saham berharga RM 10.00 membayar dividen tahunan RM 0.50 sesaham, apakah kadar hasil dividennya?',
        optionsEng: ['2.0%', '5.0%', '10.0%'],
        optionsBm: ['2.0%', '5.0%', '10.0%'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'art-bursa',
    code: 'MOD-02',
    type: 'article',
    titleEng: 'Bursa Market Structure, Board Lots & SAC Shariah Screening',
    titleBm: 'Struktur Pasaran Bursa, Lot Papan & Saringan Syariah MPS',
    descEng:
      'Institutional guide to trading sessions, 100-unit board lots, regulated clearing fees, and SC Shariah Advisory Council ratios.',
    descBm:
      'Panduan lengkap tentang waktu dagangan, lot papan 100 unit, yuran penjelasan, dan nisbah saringan Syariah SC.',
    meta: '08 MIN READ',
    badge: 'MARKET STRUCTURE',
    contentEng: [
      'Bursa Malaysia operates Monday through Friday across two continuous trading sessions: the Morning Session (09:00 – 12:30 MYT) and the Afternoon Session (14:30 – 17:00 MYT).',
      'Equities on Bursa Malaysia trade in standard Board Lots of 100 shares. If Tenaga Nasional (TENAGA) trades at RM 14.12 per share, 1 standard lot (100 shares) requires RM 1,412 in principal before regulated brokerage, stamp duty, and clearing fees.',
      'The Securities Commission (SC) Malaysia Shariah Advisory Council (SAC) reviews listed securities semi-annually (May and November) using quantitative business activity thresholds (5% / 20%) and financial ratio screens (<33% conventional debt and conventional cash over total assets).'
    ],
    contentBm: [
      'Bursa Malaysia beroperasi Isnin hingga Jumaat dalam dua sesi: Sesi Pagi (09:00 – 12:30) dan Sesi Petang (14:30 – 17:00).',
      'Saham di Bursa Malaysia didagangkan dalam Lot Papan standard sebanyak 100 unit. Jika Tenaga Nasional (TENAGA) berharga RM 14.12 seunit, 1 lot (100 unit) berharga RM 1,412 sebelum yuran broker, duti setem, dan yuran penjelasan.',
      'Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC) Malaysia menyaring saham dua kali setahun (Mei & November) berdasarkan penanda aras aktiviti perniagaan dan nisbah kewangan (<33% hutang konvensional).'
    ],
    takeawaysEng: [
      '1 Standard Bursa Board Lot = 100 shares',
      'Every contract note includes 3 regulated charges: Brokerage Fee, Stamp Duty (RM 1 per RM 1,000), and Clearing Fee (0.03%)',
      'Over 75% of Bursa Malaysia listed securities are certified SAC Shariah-compliant'
    ],
    takeawaysBm: [
      '1 Lot Standard Bursa = 100 unit saham',
      'Setiap nota kontrak melibatkan 3 kos: Yuran Broker, Duti Setem (RM 1 setiap RM 1,000), dan Yuran Penjelasan (0.03%)',
      'Lebih 75% sekuriti tersenarai di Bursa Malaysia adalah patuh Syariah MPS'
    ],
    quiz: [
      {
        qEng: 'How many shares constitute 1 standard Board Lot on Bursa Malaysia?',
        qBm: 'Berapa unit dalam 1 Lot Papan standard di Bursa Malaysia?',
        optionsEng: ['10 shares', '100 shares', '1,000 shares'],
        optionsBm: ['10 unit', '100 unit', '1,000 unit'],
        correctIndex: 1
      },
      {
        qEng: 'Which regulatory authority publishes the official Shariah-compliant security list in Malaysia?',
        qBm: 'Badan manakah yang menerbitkan senarai rasmi sekuriti patuh Syariah di Malaysia?',
        optionsEng: ['Securities Commission (SC) Shariah Advisory Council', 'EPF Investment Panel', 'Companies Commission (SSM)'],
        optionsBm: ['Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC)', 'Panel Pelaburan KWSP', 'SSM Malaysia'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'art-risk',
    code: 'MOD-03',
    type: 'article',
    titleEng: 'Portfolio Construction & Multi-Sector Risk Allocation',
    titleBm: 'Pembinaan Portfolio & Peruntukan Risiko Pelbagai Sektor',
    descEng:
      'Balancing capital appreciation catalysts and defensive dividend buffers across Malaysian macroeconomic cycles.',
    descBm:
      'Seimbangkan pemangkin pertumbuhan modal dan penampan dividen defensif merentasi kitaran ekonomi Malaysia.',
    meta: '06 MIN READ',
    badge: 'PORTFOLIO STRATEGY',
    contentEng: [
      'Institutional portfolio construction balances expected return against drawdown volatility. Malaysian Fixed Deposits (3.0% p.a.) and EPF/ASB (5.5% p.a.) provide capital preservation, whereas equities target 8.0%–12.0% annualized returns alongside mark-to-market fluctuations.',
      'Pairing defensive yield anchors (such as MAYBANK, PBBANK, TENAGA, and IHH) with secular growth and infrastructure compounders (such as GAMUDA, INARI, and YTLPOWR) dampens single-sector cyclicality.',
      'Ringgit Cost Averaging (systematic monthly capital deployment) mitigates timing risk by acquiring larger share quantities during market pullbacks and fewer at valuation peaks.'
    ],
    contentBm: [
      'Pembinaan portfolio institusi mengimbangi potensi pulangan dan risiko turun naik. Deposit Tetap (3.0% setahun) dan ASB/KWSP (5.5% setahun) menawarkan kestabilan modal, manakala ekuiti mampu memberi 8.0%–12.0% setahun dalam jangka panjang.',
      'Menggabungkan Saham Dividen Defensif (seperti MAYBANK, PBBANK, TENAGA, IHH) dengan Saham Pertumbuhan (seperti GAMUDA, INARI, YTLPOWR) membantu mengimbangi kitaran pasaran.',
      'Amalkan Pemurataan Kos Ringgit (DCA - melabur jumlah RM tetap setiap bulan) untuk mengurangkan risiko masa pasaran.'
    ],
    takeawaysEng: [
      'Allocate across at least 3–4 uncorrelated Bursa sectors (Financials, Utilities, Technology, Healthcare, Consumer)',
      'Maintain a 15%–25% buying power reserve to deploy during liquidity dislocations',
      'Align portfolio beta with your Risk Mandate (Conservative, Balanced, or Aggressive)'
    ],
    takeawaysBm: [
      'Pelbagaikan modal merentasi sekurang-kurangnya 3–4 sektor Bursa berbeza',
      'Simpan 15%–25% dalam rizab kuasa beli untuk mengambil peluang semasa pasaran menurun',
      'Padankan pilihan saham dengan Mandat Risiko anda'
    ],
    quiz: [
      {
        qEng: 'What is the primary institutional benefit of diversifying across multiple uncorrelated sectors?',
        qBm: 'Apakah manfaat utama mempelbagaikan pelaburan merentasi pelbagai sektor?',
        optionsEng: [
          'It guarantees positive returns every trading session',
          'An industry-specific downturn will not impair the entire portfolio',
          'It exempts the account from Bursa clearing fees'
        ],
        optionsBm: [
          'Ia menjamin keuntungan setiap hari dagangan',
          'Kelembapan dalam satu industri tidak akan menjejaskan keseluruhan portfolio',
          'Ia menghapuskan yuran penjelasan Bursa'
        ],
        correctIndex: 1
      },
      {
        qEng: 'What defines Ringgit Cost Averaging (DCA)?',
        qBm: 'Apakah maksud Pemurataan Kos Ringgit (DCA)?',
        optionsEng: [
          'Deploying a fixed Ringgit amount at regular intervals regardless of short-term price swings',
          'Allocating 100% of liquidity into a single security at market open',
          'Only purchasing securities when they reach 52-week highs'
        ],
        optionsBm: [
          'Melabur jumlah RM tetap secara berkala tanpa mengira naik turun harga jangka pendek',
          'Meletakkan 100% modal ke dalam satu saham serentak',
          'Hanya membeli saham apabila harga berada pada paras tertinggi 52 minggu'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-chart',
    code: 'BRF-01',
    type: 'tutorial',
    titleEng: 'Equity Valuation Multiples & Price Structure Analysis',
    titleBm: 'Gandaan Penilaian Ekuiti & Analisis Struktur Harga',
    descEng:
      'Evaluating Price-to-Earnings (P/E) multiples across Bursa sectors alongside 5-axis fundamental scores.',
    descBm:
      'Menilai gandaan Harga-kepada-Pendapatan (P/E) merentasi sektor Bursa bersama skor asas 5-paksi.',
    meta: '12 MIN BRIEFING',
    badge: 'VALUATION',
    contentEng: [
      'When evaluating a security in the Equity Terminal, begin by reviewing the 30-day price trajectory alongside underlying earnings power and sector multiples.',
      'The Price-to-Earnings (P/E) multiple quantifies how much the market pays per RM 1.00 of net earnings. On Bursa Malaysia, commercial banks typically trade between 10x–13x P/E, regulated utilities at 14x–18x, and semiconductor or healthcare leaders at 22x–35x.',
      'Cross-reference valuation multiples against the 5-Axis Fundamental Factor model (Value, Growth, Balance Sheet Health, Dividend, and Momentum) before sizing an order.'
    ],
    contentBm: [
      'Apabila menyemak sekuriti dalam Terminal Ekuiti, mulakan dengan melihat trend harga 30 hari dan membandingkan harga semasa dengan pendapatan asas syarikat.',
      'Nisbah Harga-kepada-Pendapatan (P/E) menunjukkan berapa banyak pelabur membayar untuk setiap RM 1.00 keuntungan syarikat. Di Bursa Malaysia, bank lazimnya didagangkan pada P/E 10x–13x, manakala saham teknologi/penjagaan kesihatan pada 22x–35x.',
      'Gabungkan penilaian P/E dengan model Faktor Asas 5-Paksi (Nilai, Pertumbuhan, Kesihatan, Dividen, Momentum) sebelum membuat pesanan.'
    ],
    takeawaysEng: [
      'A discounted P/E relative to sector peers may indicate value—confirm that Debt/Equity remains disciplined',
      'Volume expansion validates institutional accumulation during price breakouts',
      'Always corroborate price action with audited revenue and net profit figures in JomRingkas'
    ],
    takeawaysBm: [
      'Nisbah P/E rendah berbanding rakan sektor boleh menandakan saham terkurang nilai',
      'Pengembangan volum mengesahkan pengumpulan institusi',
      'Sentiasa semak hasil dan keuntungan bersih dalam JomRingkas'
    ],
    quiz: [
      {
        qEng: 'What does a Price-to-Earnings (P/E) multiple of 12x indicate?',
        qBm: 'Apakah maksud Nisbah P/E sebanyak 12x?',
        optionsEng: [
          'The security distributes a 12% annual dividend yield',
          'Investors are paying RM 12 for every RM 1 of annual per-share earnings',
          'The share price is projected to appreciate 12x in one year'
        ],
        optionsBm: [
          'Saham membayar hasil dividen 12%',
          'Pelabur membayar RM 12 untuk setiap RM 1 keuntungan tahunan sesaham',
          'Harga saham dijangka meningkat 12 kali ganda dalam setahun'
        ],
        correctIndex: 1
      },
      {
        qEng: 'Why should P/E multiples primarily be benchmarked against peers within the same sector?',
        qBm: 'Mengapa nisbah P/E perlu dibandingkan dengan syarikat dalam sektor yang sama?',
        optionsEng: [
          'Different industries exhibit distinct capital intensity, growth rates, and valuation norms',
          'All Bursa Malaysia companies share an identical statutory P/E ratio',
          'P/E multiples only apply to plantation companies'
        ],
        optionsBm: [
          'Sektor berbeza mempunyai intensiti modal, kadar pertumbuhan, dan norma penilaian berbeza',
          'Semua syarikat di Bursa mempunyai nisbah P/E yang sama',
          'Nisbah P/E hanya terpakai untuk syarikat perladangan'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-risk-mgmt',
    code: 'BRF-02',
    type: 'tutorial',
    titleEng: 'Position Sizing, Balance Sheet Gearing & Concentration Limits',
    titleBm: 'Saiz Posisi, Gearing Kunci Kira-kira & Had Tumpuan',
    descEng:
      'Protecting portfolio equity using single-issuer limits, Debt-to-Equity screening, and partial profit trimming.',
    descBm:
      'Melindungi ekuiti portfolio menggunakan had posisi tunggal, saringan Hutang-ke-Ekuiti, dan pengambilan untung separa.',
    meta: '15 MIN BRIEFING',
    badge: 'RISK MANAGEMENT',
    contentEng: [
      'Institutional risk management prioritizes capital preservation. A core discipline is enforcing a 20%–25% single-security cap and a 60% maximum single-sector ceiling so no individual earnings miss impairs total net liquidity.',
      'Before initiating a position, inspect the Debt-to-Equity (D/E) ratio in the Equity Terminal. Non-financial issuers with low gearing (<0.6x D/E) maintain stronger interest coverage across Overnight Policy Rate (OPR) cycles.',
      'Use the Portfolio Risk & Concentration Audit in your Portfolio Ledger to monitor sector weights and trim oversized winners by 50% when rebalancing.'
    ],
    contentBm: [
      'Pengurusan risiko institusi mengutamakan pemeliharaan modal. Peraturan utama ialah menghadkan pendedahan kepada 20%–25% bagi satu syarikat tunggal dan maksimum 60% bagi satu sektor.',
      'Sebelum membeli, semak nisbah Hutang-ke-Ekuiti (D/E) di Terminal Ekuiti. Syarikat bukan kewangan dengan D/E rendah (<0.6x) mempunyai kunci kira-kira yang lebih kukuh.',
      'Gunakan Audit Risiko & Tumpuan Portfolio di halaman Lejar Portfolio anda untuk memantau wajaran sektor pada bila-bila masa.'
    ],
    takeawaysEng: [
      'Never exceed 60% portfolio concentration within a single Bursa sector',
      'Screen Debt-to-Equity (D/E) ratios to avoid over-leveraged balance sheets',
      'Trimming 50% of an appreciated position locks in realized gains while retaining upside participation'
    ],
    takeawaysBm: [
      'Elakkan menumpukan >60% portfolio anda dalam satu sektor sahaja',
      'Semak nisbah Hutang/Ekuiti untuk mengelakkan syarikat yang terlalu banyak hutang',
      'Kurangkan 50% pegangan yang untung untuk mengunci keuntungan sambil mengekalkan pendedahan'
    ],
    quiz: [
      {
        qEng: 'Which ratio measures balance sheet leverage by comparing total debt to shareholder equity?',
        qBm: 'Nisbah manakah yang mengukur leveraj kunci kira-kira dengan membandingkan jumlah hutang dengan ekuiti?',
        optionsEng: ['Indicated Dividend Yield', 'Debt-to-Equity (D/E) Ratio', 'Daily Trading Volume'],
        optionsBm: ['Kadar Hasil Dividen', 'Nisbah Hutang-ke-Ekuiti (D/E)', 'Volum Dagangan Harian'],
        correctIndex: 1
      },
      {
        qEng: 'What threshold triggers a Sector Concentration warning in the Portfolio Risk Audit?',
        qBm: 'Apakah ambang yang mencetuskan amaran Tumpuan Sektor dalam Audit Risiko Portfolio?',
        optionsEng: [
          'Greater than 60% of equity allocated to a single sector',
          'Holding securities across 4 different sectors',
          'Maintaining a 20% cash reserve'
        ],
        optionsBm: [
          'Melebihi 60% ekuiti tertumpu dalam satu sektor tunggal',
          'Memegang saham merentasi 4 sektor berbeza',
          'Mengekalkan 20% rizab tunai'
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
  const [loadingText, setLoadingText] = useState('Parsing Bursa Filing...');
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
              ? 'Bursa Malaysia news wire & market breadth synchronized.'
              : 'Suapan berita Bursa Malaysia & keluasan pasaran dikemas kini.'
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
              'Parsing Audited Bursa Filing...',
              'Extracting FY Revenue & Net Profit...',
              'Verifying SAC Shariah & Payout Ratios...',
              'Compiling Institutional Equity Brief...'
            ]
          : [
              'Membaca Pemfailan Teraudit Bursa...',
              'Mengekstrak Hasil & Untung Bersih...',
              'Mengesahkan Nisbah Syariah MPS & Dividen...',
              'Menyusun Nota Ringkas Ekuiti...'
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
      kicker: 'RESEARCH DESK & BURSA ACADEMY',
      title: 'Institutional Filing Analysis, Compilers & Curriculum',
      subtitle:
        'Automated Bursa Malaysia annual report extraction, market breadth telemetry, Malaysian benchmark compounding models, and accredited learning modules.',
      tabTools: 'Research Tools',
      tabCurriculum: 'Curriculum Modules',
      tabBriefings: 'Video Briefings',
      openModule: 'Read Module & Verify (+25 XP)',
      openBriefing: 'Open Briefing & Verify (+25 XP)',
      reviewModule: 'Verified · Review Notes'
    },
    BM: {
      kicker: 'MEJA PENYELIDIKAN & AKADEMI BURSA',
      title: 'Analisis Pemfailan Institusi, Pengkompil & Kurikulum',
      subtitle:
        'Pengekstrakan laporan tahunan Bursa Malaysia automatik, telemetri keluasan pasaran, model kompaun penanda aras Malaysia, dan modul pembelajaran.',
      tabTools: 'Alat Penyelidikan',
      tabCurriculum: 'Modul Kurikulum',
      tabBriefings: 'Taklimat Video',
      openModule: 'Baca Modul & Sahkan (+25 XP)',
      openBriefing: 'Buka Taklimat & Sahkan (+25 XP)',
      reviewModule: 'Disahkan · Ulang Kaji'
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
        ? `${currentStock.name} (${currentStock.ticker} · ${currentStock.bursaCode}) reported audited FY revenue of ${currentStock.revenue} and net profit of ${currentStock.netProfit} within the ${currentStock.sector} sector. ${currentStock.description} Factor scores stand at ${radar.growth}/100 for Growth and ${radar.momentum}/100 for Momentum. (Ref: Audited Financial Statements, Sec. 02)`
        : `${currentStock.name} (${currentStock.ticker} · ${currentStock.bursaCode}) mencatatkan hasil tahunan teraudit ${currentStock.revenue} dan untung bersih ${currentStock.netProfit} dalam sektor ${currentStock.sector}. Skor faktor Pertumbuhan dan Momentum berada pada ${radar.growth}/100 dan ${radar.momentum}/100. (Ruj: Penyata Kewangan Teraudit, Seksyen 02)`;

    const valuationLabel =
      pe < 14
        ? language === 'ENG'
          ? 'at a valuation discount relative to broader FBM KLCI averages'
          : 'pada diskaun penilaian berbanding purata FBM KLCI'
        : pe <= 24
        ? language === 'ENG'
          ? 'in line with historical sector valuation multiples'
          : 'selaras dengan gandaan penilaian sejarah sektor'
        : language === 'ENG'
        ? 'at a growth expansion premium multiple'
        : 'pada gandaan premium pengembangan pertumbuhan';

    const riskText =
      language === 'ENG'
        ? `At a spot price of RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} trades at an earnings multiple of ${currentStock.peRatio}x (${valuationLabel}) with a Debt-to-Equity gearing ratio of ${currentStock.debtEquity}. Balance sheet health scores ${radar.health}/100; monitor sector margin sensitivity and BNM OPR / FX transmission. (Ref: Risk Management & Gearing Note, pg. 48)`
        : `Pada harga semasa RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} didagangkan pada gandaan P/E ${currentStock.peRatio}x (${valuationLabel}) dengan nisbah Hutang-ke-Ekuiti ${currentStock.debtEquity}. Skor kesihatan kunci kira-kira ialah ${radar.health}/100. (Ruj: Nota Pengurusan Risiko, ms. 48)`;

    const shariahStatus = currentStock.isShariah
      ? language === 'ENG'
        ? 'SAC Shariah-Compliant (SC Malaysia Verified)'
        : 'Patuh Syariah MPS (Disahkan SC Malaysia)'
      : language === 'ENG'
      ? 'Conventional (Non-Shariah)'
      : 'Konvensional (Bukan Syariah)';

    const dividendText =
      language === 'ENG'
        ? `Distributes an indicated dividend yield of ${currentStock.dividendYield} (${
            divYield >= 4.5
              ? 'high-yield institutional cash generator for income mandates'
              : divYield >= 2.5
              ? 'balanced capital distribution alongside retained earnings reinvestment'
              : 'capital-retention profile prioritizing reinvestment into core growth'
          }). Regulatory Classification: ${shariahStatus}. Market Capitalization: ${currentStock.marketCap}. (Ref: Capital Allocation & Dividends, pg. 84)`
        : `Menawarkan kadar hasil dividen ${currentStock.dividendYield} (${
            divYield >= 4.5
              ? 'aliran tunai dividen tinggi untuk mandat pendapatan'
              : 'agihan modal seimbang bersama pelaburan semula ekuiti'
          }). Klasifikasi: ${shariahStatus}. Modal Pasaran: ${currentStock.marketCap}. (Ruj: Peruntukan Modal & Dividen, ms. 84)`;

    return {
      title: `${currentStock.name} (${currentStock.ticker})`,
      bursaCode: currentStock.bursaCode,
      isShariah: currentStock.isShariah,
      growth: growthText,
      risk: riskText,
      dividend: dividendText,
      score: confidenceScore,
      sourceLabel: uploadedFileName
        ? `UPLOADED FILING · ${uploadedFileName.toUpperCase()}`
        : 'VERIFIED PDF FILING',
      extractedExcerpt: uploadedText.trim() ? uploadedText.trim().slice(0, 260) : undefined,
      provider: 'QUANT_ENGINE'
    };
  }, [currentStock, language, uploadedFileName, uploadedText]);

  const activeReport = aiReport || dynamicReport;

  const getProviderLabel = (provider?: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM' | 'QUANT_ENGINE') => {
    if (provider === 'API_KEY_LLM') return 'LIVE LLM';
    if (provider === 'LIVE_CLOUD_LLM') return 'CLOUD AI';
    return 'QUANT ENGINE';
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
        year: `Y${year}`,
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
        ? `Loaded filing: ${file.name} — extracting document text & ratios...`
        : `Pemfailan dimuatkan: ${file.name} — mengekstrak teks & nisbah utama...`
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
        ? 'Cleared custom filing document.'
        : 'Dokumen pemfailan tersuai dipadamkan.'
    );
  };

  const handleExportSummary = () => {
    if (!currentStock || !activeReport) return;
    const textReport = [
      `JOMRINGKAS INSTITUTIONAL EQUITY BRIEF`,
      `Security: ${currentStock.name} (${currentStock.ticker} / ${currentStock.bursaCode})`,
      `Spot Price: RM ${currentStock.price} (${currentStock.changePercent}) | Sector: ${currentStock.sector}`,
      `Synthesis Engine: ${getProviderLabel(activeReport.provider)} | Fundamental Score: ${activeReport.score} / 100`,
      ...(uploadedText.trim() || activeReport.extractedExcerpt
        ? [
            ``,
            `EXTRACTED DOCUMENT EXCERPT (${uploadedFileName || 'Custom Filing'})`,
            (activeReport.extractedExcerpt || uploadedText.trim().slice(0, 260))
          ]
        : []),
      ``,
      `01 / GROWTH & REVENUE CATALYST`,
      activeReport.growth,
      ``,
      `02 / VALUATION & BALANCE SHEET RISK`,
      activeReport.risk,
      ``,
      `03 / DIVIDEND & SAC SHARIAH STANDING`,
      activeReport.dividend
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textReport).catch(() => {});
    }

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentStock.ticker}_JomRingkas_Equity_Brief.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addXP(15, `Exported ${currentStock.ticker} Equity Brief`);
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
          `Verified Module: ${
            language === 'ENG' ? activeLearningItem.titleEng : activeLearningItem.titleBm
          }`
        );
      } else {
        toast.success(
          language === 'ENG'
            ? 'Verification complete. XP for this module has already been credited.'
            : 'Pengesahan selesai. XP untuk modul ini telah pun dikreditkan.'
        );
      }
    } else {
      toast.error(
        language === 'ENG'
          ? 'Verification incomplete. Review the highlighted answers and resubmit.'
          : 'Beberapa jawapan kurang tepat. Semak semula dan cuba lagi.'
      );
    }
  };

  const articleItems = learningItems.filter(i => i.type === 'article');
  const tutorialItems = learningItems.filter(i => i.type === 'tutorial');

  const marketBreadth: MarketBreadthSummary = useMemo(
    () => computeMarketBreadth(stocks, newsItems),
    [stocks, newsItems]
  );

  const getImpactTagClass = (impact: BursaNewsItem['impact']) => {
    if (impact === 'CONSTRUCTIVE') return 'jom-tag jom-tag-up';
    if (impact === 'CAUTIOUS') return 'jom-tag jom-tag-down';
    return 'jom-tag';
  };

  const getRegimeTagClass = (regime: MarketBreadthSummary['regime']) => {
    if (regime === 'CONSTRUCTIVE') return 'jom-tag jom-tag-up';
    if (regime === 'FEAR') return 'jom-tag jom-tag-down';
    return 'jom-tag jom-tag-warn';
  };

  const excerptToDisplay =
    activeReport?.extractedExcerpt || (uploadedText.trim() ? uploadedText.trim().slice(0, 260) : '');

  return (
    <div className="jom-container space-y-8">
      {/* Editorial Header */}
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

      {/* TAB 1: RESEARCH TOOLS */}
      {activeTab === 'tools' && (
        <div className="space-y-8">
          {/* 1. JomRingkas — Annual Filing & Equity Brief */}
          <section className="jom-panel overflow-hidden">
            <div className="grid md:grid-cols-12">
              {/* Left 4 cols: Filing Selector & Key Ratios */}
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
                      <span className="jom-kicker">JOMRINGKAS · FILING COMPILER</span>
                      <span className="jom-tag font-tabular">{stocks.length} ISSUERS</span>
                    </div>
                    <h2 className="font-editorial text-2xl">
                      {language === 'ENG'
                        ? 'Annual Filing & Equity Brief'
                        : 'Pemfailan Tahunan & Nota Ekuiti'}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
                      {language === 'ENG'
                        ? 'Synthesize audited revenue drivers, balance sheet gearing, and SAC Shariah standing for any Bursa-listed security.'
                        : 'Sintesis pemacu hasil teraudit, gearing kunci kira-kira, dan status Syariah MPS bagi sekuriti tersenarai Bursa.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="jom-kicker block">
                      {language === 'ENG' ? 'SELECT BURSA ISSUER' : 'PILIH PENERBIT BURSA'}
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

                  {/* Custom PDF / Annual Report Upload & Paste Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="jom-kicker block">
                        {language === 'ENG'
                          ? 'OR UPLOAD PDF / FILING DOCUMENT'
                          : 'ATAU MUAT NAIK PDF / PEMFAILAN'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomPasteOpen(prev => !prev)}
                        className="jom-kicker underline cursor-pointer"
                      >
                        {customPasteOpen
                          ? language === 'ENG'
                            ? 'HIDE PASTE'
                            : 'TUTUP TEKS'
                          : language === 'ENG'
                          ? 'PASTE FILING TEXT'
                          : 'TAMPAL TEKS'}
                      </button>
                    </div>
                    <label className="jom-btn w-full justify-between cursor-pointer text-xs font-tabular">
                      <span className="truncate flex items-center gap-1.5">
                        <FileText size={13} />
                        <span className="truncate">
                          {uploadedFileName ||
                            (language === 'ENG'
                              ? 'Upload Annual Report (.PDF / .TXT / .CSV)'
                              : 'Muat Naik Laporan (.PDF / .TXT / .CSV)')}
                        </span>
                      </span>
                      <span className="jom-tag">BROWSE</span>
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
                              ? 'Paste raw Bursa quarterly announcement, audited financial statement notes, or management commentary...'
                              : 'Tampal teks pengumuman suku tahunan Bursa, nota penyata kewangan, atau ulasan pengurusan...'
                          }
                          className="jom-input w-full text-xs font-tabular"
                        />
                        {(uploadedFileName || uploadedText) && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleClearCustomDocument}
                              className="jom-btn py-1 px-2.5 text-[11px]"
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
                      <div className="jom-kicker pb-1 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                        KEY FILING TELEMETRY
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>Spot Price / 24h</span>
                        <span className="font-semibold">
                          RM {currentStock.price} ({currentStock.changePercent})
                        </span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>P/E · Indicated Yield</span>
                        <span className="font-semibold">
                          {currentStock.peRatio}x · {currentStock.dividendYield}
                        </span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>Debt / Equity</span>
                        <span className="font-semibold">{currentStock.debtEquity}</span>
                      </div>
                      <div className="flex justify-between font-tabular">
                        <span style={{ color: 'var(--ink-secondary)' }}>FY Rev / Net Profit</span>
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
                      {language === 'ENG' ? 'Analyze PDF / Filing Document' : 'Analisis Dokumen PDF / Pemfailan'}
                    </span>
                  )}
                </button>
              </div>

              {/* Right 8 cols: Structured Institutional Research Memo */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between">
                {isScanning ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 size={24} className="animate-spin mx-auto" style={{ color: 'var(--ink-muted)' }} />
                    <div className="font-tabular text-xs font-semibold">{loadingText}</div>
                  </div>
                ) : (
                  scanComplete &&
                  activeReport &&
                  currentStock && (
                    <div className="space-y-6">
                      {/* Memo Header */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="jom-tag">{activeReport.sourceLabel || 'VERIFIED PDF FILING'}</span>
                            <span className="jom-tag font-tabular">{currentStock.bursaCode}</span>
                            {currentStock.isShariah ? (
                              <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                            ) : (
                              <span className="jom-tag">CONVENTIONAL</span>
                            )}
                            <span className="jom-tag font-tabular">
                              {getProviderLabel(activeReport.provider)}
                            </span>
                          </div>
                          <h3 className="font-editorial text-2xl">{activeReport.title}</h3>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <div className="jom-kicker">CONFIDENCE / FUNDAMENTAL SCORE</div>
                          <div
                            className="font-tabular text-2xl font-semibold mt-0.5"
                            style={{ color: 'var(--signal-up)' }}
                          >
                            {activeReport.score} / 100
                          </div>
                        </div>
                      </div>

                      {/* Extracted Document Excerpt Box (when uploadedText or aiReport.extractedExcerpt is present) */}
                      {excerptToDisplay && (
                        <div
                          className="jom-panel-subtle p-4 space-y-1.5"
                          style={{ borderLeft: '3px solid var(--accent-brand)' }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="jom-kicker">
                              EXTRACTED DOCUMENT EXCERPT
                              {uploadedFileName ? ` · ${uploadedFileName.toUpperCase()}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={handleClearCustomDocument}
                              className="jom-kicker underline cursor-pointer"
                            >
                              {language === 'ENG' ? 'CLEAR' : 'PADAM'}
                            </button>
                          </div>
                          <p
                            className="font-tabular text-xs leading-relaxed"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            "{excerptToDisplay}"
                          </p>
                        </div>
                      )}

                      {/* 3 Numbered Memo Sections */}
                      <div className="space-y-4">
                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="jom-kicker">
                            {language === 'ENG'
                              ? '01 / GROWTH & REVENUE CATALYST'
                              : '01 / PEMANGKIN PERTUMBUHAN & HASIL'}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                            {activeReport.growth}
                          </p>
                        </div>

                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="jom-kicker">
                            {language === 'ENG'
                              ? '02 / VALUATION & BALANCE SHEET RISK'
                              : '02 / PENILAIAN & RISIKO KUNCI KIRA-KIRA'}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                            {activeReport.risk}
                          </p>
                        </div>

                        <div className="jom-panel-subtle p-4 space-y-1.5">
                          <div className="jom-kicker">
                            {language === 'ENG'
                              ? '03 / DIVIDEND & SAC SHARIAH STANDING'
                              : '03 / DIVIDEN & KEDUDUKAN SYARIAH MPS'}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                            {activeReport.dividend}
                          </p>
                        </div>
                      </div>

                      {/* Memo Actions */}
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
                            {language === 'ENG' ? 'Open Bursa PDF Filings' : 'Buka Pemfailan PDF Bursa'}
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
                            {language === 'ENG'
                              ? 'Open in Equity Terminal'
                              : 'Buka di Terminal Ekuiti'}
                          </span>
                          <ArrowUpRight size={14} />
                        </button>
                        <button
                          type="button"
                          className="jom-btn jom-btn-inverse"
                          onClick={handleExportSummary}
                        >
                          <Download size={14} />
                          <span>
                            {language === 'ENG'
                              ? 'Export Brief (+15 XP)'
                              : 'Eksport Nota (+15 XP)'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* 2. JomSentimen — Bursa Market Breadth & News Wire */}
          <section className="jom-panel overflow-hidden">
            <div className="grid md:grid-cols-12">
              {/* Left 5 cols: Market Breadth Arc & Telemetry */}
              <div
                className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between space-y-6"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="jom-kicker">JOMSENTIMEN · MARKET BREADTH</span>
                    <span className={getRegimeTagClass(marketBreadth.regime)}>
                      {marketBreadth.regime}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl">
                    {language === 'ENG'
                      ? 'Bursa Market Breadth & Regime'
                      : 'Keluasan Pasaran & Rejim Bursa'}
                  </h2>
                </div>

                {/* Clean Architectural SVG Market Breadth Arc */}
                <div className="flex flex-col items-center py-2">
                  <div className="relative w-60 h-28">
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                      <path
                        d="M 20 95 A 80 80 0 0 1 180 95"
                        fill="none"
                        stroke="var(--border-hairline)"
                        strokeWidth="12"
                        strokeLinecap="butt"
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

                  <div className="flex justify-between w-60 font-tabular text-[10px] uppercase tracking-wider mt-1">
                    <span style={{ color: 'var(--signal-down)' }}>FEAR</span>
                    <span style={{ color: 'var(--signal-warn)' }}>NEUTRAL</span>
                    <span style={{ color: 'var(--signal-up)' }}>CONSTRUCTIVE</span>
                  </div>

                  <div className="text-center mt-4">
                    <div className="jom-kicker">COMPOSITE BREADTH INDEX</div>
                    <div className="font-tabular text-2xl font-semibold mt-0.5">
                      {marketBreadth.score} / 100 · {marketBreadth.regime}
                    </div>
                  </div>
                </div>

                {/* Breadth Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                  <div className="jom-panel-subtle p-2.5">
                    <div className="jom-kicker">ADV / DEC</div>
                    <div className="font-tabular text-xs font-semibold mt-1">
                      {marketBreadth.advancers} / {marketBreadth.decliners}
                    </div>
                  </div>
                  <div className="jom-panel-subtle p-2.5">
                    <div className="jom-kicker">INST. FLOW</div>
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
                    <div className="jom-kicker">OPR BENCH</div>
                    <div className="font-tabular text-xs font-semibold mt-1">
                      {marketBreadth.oprRate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 cols: Institutional News Wire Table */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div
                  className="p-5 border-b flex items-center justify-between gap-2"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="jom-kicker">BURSA RESEARCH WIRE</div>
                    <h3 className="font-editorial text-xl">
                      {language === 'ENG'
                        ? 'Macro & Corporate Catalyst Dispatches'
                        : 'Berita Pemangkin Korporat & Makro'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadBursaNewsWire(true)}
                      disabled={isRefreshingNews}
                      className="jom-btn py-1 px-2.5 text-xs"
                    >
                      <RefreshCw size={12} className={isRefreshingNews ? 'animate-spin' : ''} />
                      <span>{language === 'ENG' ? 'Refresh Wire' : 'Segar Semula'}</span>
                    </button>
                    <span className="jom-tag font-tabular">KLSE WIRE</span>
                  </div>
                </div>

                <div className="jom-table-wrap flex-1">
                  <table className="jom-table">
                    <thead>
                      <tr>
                        <th>{language === 'ENG' ? 'Source' : 'Sumber'}</th>
                        <th>{language === 'ENG' ? 'Headline' : 'Tajuk Utama'}</th>
                        <th className="text-right">{language === 'ENG' ? 'Impact Tag' : 'Impak'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsItems.map(news => (
                        <tr
                          key={news.id}
                          onClick={() => {
                            const found = stocks.find(s => s.ticker === news.ticker);
                            if (found) {
                              setSelectedStock(found);
                              navigateTo('stock-details');
                            }
                          }}
                        >
                          <td className="whitespace-nowrap">
                            <div className="font-semibold text-xs">{news.source}</div>
                            <div className="font-tabular text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                              {news.timeAgo} · {news.ticker}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                                {news.headline}
                              </p>
                              {news.url && (
                                <a
                                  href={news.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="jom-btn py-0.5 px-1.5 text-[11px] font-tabular shrink-0"
                                  title={
                                    language === 'ENG'
                                      ? 'Open source article in new tab'
                                      : 'Buka artikel sumber di tab baharu'
                                  }
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <span className={getImpactTagClass(news.impact)}>{news.impact}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 10-Year Compounding & Malaysian Benchmark Model */}
          <section className="jom-panel p-6 space-y-6">
            <div
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">LONG-HORIZON CAPITAL MODEL</div>
                <h2 className="font-editorial text-2xl mt-0.5">
                  {language === 'ENG'
                    ? '10-Year Compounding & Malaysian Benchmark Model'
                    : 'Model Kompaun 10 Tahun & Penanda Aras Malaysia'}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG'
                    ? 'Compare systematic monthly Ringgit allocations against EPF (KWSP) / ASB (5.5% p.a.) and Malaysian Fixed Deposits (3.0% p.a.).'
                    : 'Bandingkan pelaburan bulanan sistematik dengan KWSP / ASB (5.5% setahun) dan Deposit Tetap Malaysia (3.0% setahun).'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="jom-tag font-tabular">
                  EST. CAGR {(4 + riskLevel * 0.8 - (inflationAdjusted ? 3 : 0)).toFixed(1)}% P.A.
                </span>
                {inflationAdjusted && <span className="jom-tag jom-tag-warn">REAL (-3.0% CPI)</span>}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-center">
              {/* Left 8 cols: Recharts AreaChart */}
              <div className="lg:col-span-8 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wealthData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="jomEquityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A5C36" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#0A5C36" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={v => `RM${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
                      axisLine={false}
                      tickLine={false}
                      width={58}
                    />
                    <Tooltip
                      formatter={(value: number) => `RM ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      name="Equity Mandate"
                      dataKey="wealth"
                      stroke="#0A5C36"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#jomEquityGrad)"
                    />
                    <Area
                      type="monotone"
                      name="EPF (KWSP) / ASB (5.5%)"
                      dataKey="epfAsb"
                      stroke="#52585E"
                      strokeWidth={2}
                      fillOpacity={0}
                    />
                    <Area
                      type="monotone"
                      name="Fixed Deposit (3.0%)"
                      dataKey="fixedDeposit"
                      stroke="#9A6B16"
                      strokeWidth={1.75}
                      strokeDasharray="4 4"
                      fillOpacity={0}
                    />
                    <Area
                      type="monotone"
                      name="Principal Contributed"
                      dataKey="invested"
                      stroke="#848B92"
                      strokeWidth={1.25}
                      strokeDasharray="2 2"
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Right 4 cols: Model Parameters */}
              <div className="lg:col-span-4 jom-panel-subtle p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="jom-kicker">MONTHLY CONTRIBUTION</span>
                    <span className="font-tabular text-sm font-semibold">RM {monthlyInvest.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={monthlyInvest}
                    onChange={e => setMonthlyInvest(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[#0A5C36]"
                  />
                  <div className="flex justify-between font-tabular text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                    <span>RM 100/mo</span>
                    <span>Principal: RM {finalInvested.toLocaleString()}</span>
                    <span>RM 5,000/mo</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="jom-kicker">RISK MANDATE TIER</span>
                    <span className="jom-tag font-tabular">
                      TIER {riskLevel}/10 · {(4 + riskLevel * 0.8).toFixed(1)}% P.A.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={riskLevel}
                    onChange={e => setRiskLevel(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[#0A5C36]"
                  />
                  <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--ink-secondary)' }}>
                    {riskLevel <= 3
                      ? 'Conservative Mandate: Utility & REIT income focus (4.8%–6.4% p.a. nominal).'
                      : riskLevel <= 7
                      ? 'Balanced Mandate: Blue-chip banking yield paired with secular growth (7.2%–9.6% p.a. nominal).'
                      : 'Aggressive Mandate: High-conviction infrastructure, semiconductor & data center compounders (10.4%–12.0% p.a. nominal).'}
                  </p>
                </div>

                <div
                  className="flex items-center justify-between pt-4 border-t"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="text-xs font-semibold">
                      {language === 'ENG' ? 'CPI Inflation Adjustment' : 'Pelarasan Inflasi IHP'}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                      {language === 'ENG' ? 'Discount by 3.0% p.a. real purchasing power' : 'Diskaun kuasa beli sebenar 3.0% setahun'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInflationAdjusted(!inflationAdjusted)}
                    className={`jom-btn py-1 px-3 text-xs font-tabular ${
                      inflationAdjusted ? 'jom-btn-inverse' : ''
                    }`}
                  >
                    {inflationAdjusted ? 'ENABLED' : 'NOMINAL'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3-Column Benchmark Ledger Strip Below */}
            <div className="jom-ledger-strip">
              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">PROJECTED EQUITY MANDATE</span>
                  <span className="jom-tag jom-tag-up font-tabular">
                    +RM {(finalWealth - finalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalWealth.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  vs RM {finalInvested.toLocaleString()} contributed capital
                </div>
              </div>

              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">EPF (KWSP) / ASB (5.5% P.A.)</span>
                  <span className="jom-tag font-tabular">
                    +RM {(finalEpf - finalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalEpf.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Equity spread: {finalWealth >= finalEpf ? '+' : ''}RM{' '}
                  {(finalWealth - finalEpf).toLocaleString()}
                </div>
              </div>

              <div className="jom-ledger-cell space-y-1">
                <div className="flex items-center justify-between">
                  <span className="jom-kicker">FIXED DEPOSIT (3.0% P.A.)</span>
                  <span className="jom-tag font-tabular">
                    +RM {(finalFd - finalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="font-tabular text-2xl font-semibold">
                  RM {finalFd.toLocaleString()}
                </div>
                <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Equity spread: +RM {(finalWealth - finalFd).toLocaleString()}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: CURRICULUM MODULES */}
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
                      <span className="jom-tag">{article.badge}</span>
                    </div>
                    {isDone ? (
                      <span className="jom-tag jom-tag-up">VERIFIED</span>
                    ) : (
                      <span className="font-tabular text-xs flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
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

      {/* TAB 3: VIDEO BRIEFINGS */}
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
                  <div className="relative aspect-video bg-black/10 overflow-hidden border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                    <ImageWithFallback
                      src={
                        index % 2 === 0
                          ? 'https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                          : 'https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                      }
                      alt="Briefing visual"
                      className="w-full h-full object-cover grayscale contrast-110"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-hairline)',
                          color: 'var(--ink-primary)'
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
                        <span className="jom-tag">{tutorial.badge}</span>
                      </div>
                      {isDone ? (
                        <span className="jom-tag jom-tag-up">VERIFIED</span>
                      ) : (
                        <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
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

      {/* CURRICULUM / BRIEFING VERIFICATION MODAL */}
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
                  <span className="jom-tag">{activeLearningItem.badge}</span>
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
              {/* Reading Notes */}
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--ink-primary)' }}>
                {(language === 'ENG'
                  ? activeLearningItem.contentEng
                  : activeLearningItem.contentBm
                ).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Institutional Takeaways */}
              <div className="jom-panel-subtle p-4 space-y-2">
                <div className="jom-kicker">
                  {language === 'ENG'
                    ? 'KEY BURSA MALAYSIA TAKEAWAYS'
                    : 'INTIPATI UTAMA PASARAN BURSA MALAYSIA'}
                </div>
                <ul className="list-disc list-inside text-xs space-y-1.5" style={{ color: 'var(--ink-secondary)' }}>
                  {(language === 'ENG'
                    ? activeLearningItem.takeawaysEng
                    : activeLearningItem.takeawaysBm
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* 2-Question Verification Check */}
              <div className="jom-panel p-5 space-y-4">
                <div
                  className="flex items-center justify-between pb-3 border-b"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div>
                    <div className="jom-kicker">COMPREHENSION VERIFICATION</div>
                    <h4 className="font-editorial text-xl">
                      {language === 'ENG'
                        ? '2-Question Analyst Verification Check'
                        : 'Semakan Pengesahan Penganalisis 2-Soalan'}
                    </h4>
                  </div>
                  <span className="jom-tag jom-tag-shariah font-tabular">+25 XP</span>
                </div>

                {activeLearningItem.quiz.map((q, qIdx) => {
                  const options = language === 'ENG' ? q.optionsEng : q.optionsBm;
                  return (
                    <div key={qIdx} className="space-y-2">
                      <p className="text-xs font-semibold">
                        0{qIdx + 1}. {language === 'ENG' ? q.qEng : q.qBm}
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
                              className="w-full text-left text-xs p-3 rounded-md border transition-colors flex items-center justify-between"
                              style={{ borderColor, backgroundColor: bgColor }}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <span className="jom-tag jom-tag-up">CORRECT</span>
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
                      ? 'Verify Answers & Claim +25 XP'
                      : 'Sahkan Jawapan & Tuntut +25 XP'}
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
