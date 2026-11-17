import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  ArrowLeft,
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Sparkles,
  FileText,
  Zap,
  BarChart,
  Activity,
  Gauge,
  Loader2,
  ExternalLink,
  Download,
  Bot,
  Newspaper,
  MessageSquare,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import type { Screen, StockData } from '../App';

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
    type: 'article',
    titleEng: 'What is a Dividend & How Does It Work on Bursa?',
    titleBm: 'Apakah Dividen & Bagaimana Ia Berfungsi di Bursa?',
    descEng: 'Learn how Malaysian companies like Maybank & Tenaga share profits with shareholders',
    descBm: 'Pelajari bagaimana syarikat Malaysia seperti Maybank & Tenaga berkongsi keuntungan',
    meta: '5 min',
    badge: 'Basics',
    contentEng: [
      'A dividend is a cash distribution paid by a profitable company to its shareholders. On Bursa Malaysia, blue-chip companies typically declare dividends semi-annually or quarterly.',
      'For example, if Malayan Banking Berhad (MAYBANK) trades at RM 10.54 with a ~6.15% dividend yield, holding 1,000 units (10 board lots worth RM 10,540) generates approximately RM 648 per year in tax-exempt single-tier cash dividends!',
      'Always watch out for the Ex-Dividend Date (Ex-Date): you must buy the stock at least 1 trading day BEFORE the Ex-Date to qualify for the upcoming payout.'
    ],
    contentBm: [
      'Dividen ialah agihan tunai daripada keuntungan syarikat kepada pemegang sahamnya. Di Bursa Malaysia, syarikat cip biru lazimnya membayar dividen dua kali setahun atau setiap suku tahun.',
      'Sebagai contoh, jika Maybank (MAYBANK) didagangkan pada RM 10.54 dengan kadar hasil dividen ~6.15%, memegang 1,000 unit (10 lot bernilai RM 10,540) menjana kira-kira RM 648 setahun dalam bentuk dividen tunai!',
      'Perhatikan Tarikh Ex-Dividen (Ex-Date): anda mesti membeli saham sekurang-kurangnya 1 hari dagangan SEBELUM Ex-Date untuk layak menerima bayaran dividen tersebut.'
    ],
    takeawaysEng: [
      'Dividend Yield (%) = (Annual Dividend Per Share ÷ Current Share Price) × 100',
      'Malaysia uses a Single-Tier Dividend System: dividends are tax-exempt in the hands of retail investors',
      'High dividend yield (>4.5%) is ideal for passive income, provided company earnings and cashflow remain stable'
    ],
    takeawaysBm: [
      'Kadar Hasil Dividen (%) = (Dividen Tahunan Sesaham ÷ Harga Saham Semasa) × 100',
      'Malaysia menggunakan Sistem Dividen Satu Peringkat: dividen dikecualikan cukai untuk pelabur runcit',
      'Hasil dividen tinggi (>4.5%) sesuai untuk pendapatan pasif selagi aliran tunai syarikat kukuh'
    ],
    quiz: [
      {
        qEng: 'When must you buy a Bursa Malaysia stock to qualify for its declared dividend?',
        qBm: 'Bilakah anda mesti membeli saham Bursa Malaysia untuk layak mendapat dividen yang diumumkan?',
        optionsEng: ['Before the Ex-Dividend Date', 'On the Payment Date', 'After the Entitlement Date'],
        optionsBm: ['Sebelum Tarikh Ex-Dividen', 'Pada Tarikh Pembayaran', 'Selepas Tarikh Kelayakan'],
        correctIndex: 0
      },
      {
        qEng: 'If a stock priced at RM 10.00 pays RM 0.50 annual dividend per share, what is its dividend yield?',
        qBm: 'Jika saham berharga RM 10.00 membayar dividen tahunan RM 0.50 sesaham, apakah kadar hasil dividennya?',
        optionsEng: ['2.0%', '5.0%', '10.0%'],
        optionsBm: ['2.0%', '5.0%', '10.0%'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'art-bursa',
    type: 'article',
    titleEng: 'Understanding Bursa Malaysia & Shariah Investing',
    titleBm: 'Memahami Bursa Malaysia & Pelaburan Syariah',
    descEng: 'A complete guide to board lots, trading hours, CDS accounts, and SC Shariah screening',
    descBm: 'Panduan lengkap tentang lot papan, waktu dagangan, akaun CDS, dan saringan Syariah SC',
    meta: '8 min',
    badge: 'Market',
    contentEng: [
      'Bursa Malaysia operates Monday to Friday in two sessions: Morning Session (9:00 AM – 12:30 PM) and Afternoon Session (2:30 PM – 5:00 PM).',
      'Stocks on Bursa Malaysia are traded in standard Board Lots of 100 units. If Tenaga Nasional (TENAGA) is RM 14.12 per unit, 1 standard lot (100 units) costs RM 1,412 before minor brokerage, stamp duty, and clearing fees.',
      'The Securities Commission (SC) Malaysia Shariah Advisory Council screens stocks twice a year (May & November) based on business activity benchmarks (5% / 20%) and financial ratio benchmarks (<33% conventional debt & cash).'
    ],
    contentBm: [
      'Bursa Malaysia beroperasi Isnin hingga Jumaat dalam dua sesi: Sesi Pagi (9:00 PG – 12:30 PTG) dan Sesi Petang (2:30 PTG – 5:00 PTG).',
      'Saham di Bursa Malaysia didagangkan dalam Lot Papan standard sebanyak 100 unit. Jika Tenaga Nasional (TENAGA) berharga RM 14.12 seunit, 1 lot (100 unit) berharga RM 1,412 sebelum yuran broker, duti setem, dan yuran penjelasan.',
      'Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC) Malaysia menyaring saham dua kali setahun (Mei & November) berdasarkan penanda aras aktiviti perniagaan dan nisbah kewangan (<33% hutang konvensional).'
    ],
    takeawaysEng: [
      '1 Standard Bursa Board Lot = 100 shares/units',
      'Each trade incurs 3 regulated costs: Brokerage Fee, Stamp Duty (RM 1 per RM 1,000), and Clearing Fee (0.03%)',
      'Over 75% of Bursa Malaysia listed securities are Shariah-compliant (marked with ☪️ in JomInvest)'
    ],
    takeawaysBm: [
      '1 Lot Standard Bursa = 100 unit saham',
      'Setiap dagangan melibatkan 3 kos: Yuran Broker, Duti Setem (RM 1 setiap RM 1,000), dan Yuran Penjelasan (0.03%)',
      'Lebih 75% sekuriti tersenarai di Bursa Malaysia adalah patuh Syariah (ditanda ☪️ dalam JomInvest)'
    ],
    quiz: [
      {
        qEng: 'How many units are in 1 standard Board Lot on Bursa Malaysia?',
        qBm: 'Berapa unit dalam 1 Lot Papan standard di Bursa Malaysia?',
        optionsEng: ['10 units', '100 units', '1,000 units'],
        optionsBm: ['10 unit', '100 unit', '1,000 unit'],
        correctIndex: 1
      },
      {
        qEng: 'Which body regulates and publishes the official Shariah-compliant stock list in Malaysia?',
        qBm: 'Badan manakah yang mengawal selia dan menerbitkan senarai rasmi saham patuh Syariah di Malaysia?',
        optionsEng: ['Securities Commission (SC) Shariah Advisory Council', 'EPF Board', 'SSM Malaysia'],
        optionsBm: ['Majlis Penasihat Syariah Suruhanjaya Sekuriti (SC)', 'Lembaga KWSP', 'SSM Malaysia'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'art-risk',
    type: 'article',
    titleEng: 'Risk vs. Return: Building a Resilient Portfolio',
    titleBm: 'Risiko vs. Pulangan: Membina Portfolio Tahan Lasak',
    descEng: 'Balance growth catalysts and defensive dividend buffers in your investment strategy',
    descBm: 'Seimbangkan pemangkin pertumbuhan dan penampan dividen defensif dalam strategi anda',
    meta: '6 min',
    badge: 'Strategy',
    contentEng: [
      'Every investment carries a trade-off between potential return and volatility risk. Fixed Deposits (FD) and ASB/EPF offer high capital stability (3%–5.5% p.a.), while equities can deliver 8%–12%+ annually over the long run with short-term price fluctuations.',
      'Combining Defensive Dividend Leaders (like MAYBANK, PUBLIC, TENAGA, IHH) with Growth & Infrastructure Leaders (like GAMUDA, INARI, YTLPOWR) helps smooth out market cycles.',
      'Use Ringgit Cost Averaging (investing a fixed RM amount monthly) so you automatically buy more shares when prices dip and fewer when prices peak.'
    ],
    contentBm: [
      'Setiap pelaburan mempunyai pertukaran antara potensi pulangan dan risiko turun naik. Deposit Tetap (FD) dan ASB/KWSP menawarkan kestabilan modal (3%–5.5% setahun), manakala saham mampu memberi 8%–12%+ setahun dalam jangka panjang.',
      'Menggabungkan Saham Dividen Defensif (seperti MAYBANK, PUBLIC, TENAGA, IHH) dengan Saham Pertumbuhan (seperti GAMUDA, INARI, YTLPOWR) membantu mengimbangi kitaran pasaran.',
      'Amalkan Pemurataan Kos Ringgit (DCA - melabur jumlah RM tetap setiap bulan) untuk mengurangkan risiko masa pasaran.'
    ],
    takeawaysEng: [
      'Spread your capital across at least 3–4 different Bursa sectors (Banking, Utilities, Tech, Healthcare, Consumer)',
      'Keep 10%–20% in cash reserves to capitalize on market corrections',
      'Match your stock picks with your Risk Profile (Guardian, Pathfinder, or Explorer)'
    ],
    takeawaysBm: [
      'Pelbagaikan modal merentasi sekurang-kurangnya 3–4 sektor Bursa berbeza',
      'Simpan 10%–20% dalam rizab tunai untuk mengambil peluang semasa pasaran menurun',
      'Padankan pilihan saham dengan Profil Risiko anda'
    ],
    quiz: [
      {
        qEng: 'What is the main benefit of diversifying across multiple sectors (e.g. Banking, Tech, Healthcare)?',
        qBm: 'Apakah manfaat utama mempelbagaikan pelaburan merentasi pelbagai sektor?',
        optionsEng: [
          'It guarantees 0% loss every day',
          'A downturn in one industry will not wipe out your entire portfolio',
          'It eliminates Bursa brokerage fees'
        ],
        optionsBm: [
          'Ia menjamin 0% kerugian setiap hari',
          'Kelembapan dalam satu industri tidak akan menjejaskan keseluruhan portfolio anda',
          'Ia menghapuskan yuran broker Bursa'
        ],
        correctIndex: 1
      },
      {
        qEng: 'What does Ringgit Cost Averaging (DCA) mean?',
        qBm: 'Apakah maksud Pemurataan Kos Ringgit (DCA)?',
        optionsEng: [
          'Investing a fixed RM amount at regular intervals regardless of market highs or lows',
          'Putting 100% of your savings into one penny stock at once',
          'Only buying stocks when prices hit an all-time high'
        ],
        optionsBm: [
          'Melabur jumlah RM tetap secara berkala tanpa mengira naik turun pasaran jangka pendek',
          'Meletakkan 100% simpanan ke dalam satu saham serentak',
          'Hanya membeli saham apabila harga berada pada paras tertinggi'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-chart',
    type: 'tutorial',
    titleEng: 'How to Read Stock Charts & P/E Valuation',
    titleBm: 'Cara Membaca Carta Saham & Penilaian P/E',
    descEng: 'Master price trends, support/resistance, and the Price-to-Earnings (P/E) multiple',
    descBm: 'Kuasai trend harga, sokongan/rintangan, dan gandaan Harga-kepada-Pendapatan (P/E)',
    meta: '12 min',
    badge: 'Beginner',
    contentEng: [
      'When inspecting a stock in JomInvest Stock Details, start by checking the 30-day price trend and comparing the current price against the company’s underlying earnings.',
      'The Price-to-Earnings (P/E) Ratio tells you how much investors are paying for RM 1 of company profit. On Bursa Malaysia, banks typically trade at P/E 10x–13x, utilities at 14x–18x, and high-growth semiconductor/healthcare stocks at 22x–35x.',
      'Combine price trend momentum with the 5-Axis Fundamental Radar (Value, Growth, Health, Dividend, Momentum) before placing a trade.'
    ],
    contentBm: [
      'Apabila menyemak saham dalam Maklumat Saham JomInvest, mulakan dengan melihat trend harga 30 hari dan membandingkan harga semasa dengan pendapatan asas syarikat.',
      'Nisbah Harga-kepada-Pendapatan (P/E) menunjukkan berapa banyak pelabur membayar untuk setiap RM 1 keuntungan syarikat. Di Bursa Malaysia, bank lazimnya didagangkan pada P/E 10x–13x, manakala saham teknologi/penjagaan kesihatan pada 22x–35x.',
      'Gabungkan momentum trend harga dengan Radar Asas 5-Paksi (Nilai, Pertumbuhan, Kesihatan, Dividen, Momentum) sebelum membuat dagangan.'
    ],
    takeawaysEng: [
      'A low P/E relative to sector peers can signal an undervalued gem—check that Debt/Equity is also healthy',
      'Volume confirms price trends: rising price with strong volume indicates institutional accumulation',
      'Never rely on chart lines alone—verify revenue and net profit in JomRingkas'
    ],
    takeawaysBm: [
      'Nisbah P/E rendah berbanding rakan sektor boleh menandakan saham terkurang nilai',
      'Volum mengesahkan trend harga: kenaikan harga dengan volum tinggi menunjukkan pengumpulan institusi',
      'Jangan bergantung pada carta semata-mata—semak hasil dan keuntungan bersih dalam JomRingkas'
    ],
    quiz: [
      {
        qEng: 'What does a P/E Ratio of 12x mean?',
        qBm: 'Apakah maksud Nisbah P/E sebanyak 12x?',
        optionsEng: [
          'The stock pays a 12% dividend yield',
          'Investors are paying RM 12 for every RM 1 of annual company earnings',
          'The stock price will multiply 12 times tomorrow'
        ],
        optionsBm: [
          'Saham membayar hasil dividen 12%',
          'Pelabur membayar RM 12 untuk setiap RM 1 keuntungan tahunan syarikat',
          'Harga saham akan meningkat 12 kali ganda esok'
        ],
        correctIndex: 1
      },
      {
        qEng: 'Why should you compare a stock’s P/E ratio against companies in the SAME sector?',
        qBm: 'Mengapa anda perlu membandingkan nisbah P/E saham dengan syarikat dalam sektor yang SAMA?',
        optionsEng: [
          'Different sectors (e.g. Banks vs Tech) naturally have different growth rates and valuation norms',
          'All companies on Bursa have the exact same P/E ratio',
          'P/E ratio only applies to plantation stocks'
        ],
        optionsBm: [
          'Sektor berbeza (cth. Bank vs Teknologi) mempunyai kadar pertumbuhan dan norma penilaian yang berbeza',
          'Semua syarikat di Bursa mempunyai nisbah P/E yang sama',
          'Nisbah P/E hanya terpakai untuk saham perladangan'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'tut-risk-mgmt',
    type: 'tutorial',
    titleEng: 'Position Sizing & Smart Risk Management',
    titleBm: 'Saiz Posisi & Pengurusan Risiko Pintar',
    descEng: 'Protect your virtual & real capital with position limits and debt-to-equity checks',
    descBm: 'Lindungi modal maya & sebenar anda dengan had posisi dan semakan hutang-ke-ekuiti',
    meta: '15 min',
    badge: 'Beginner',
    contentEng: [
      'Professional investors protect their downside first. The golden rule for beginner investors is the 20% Single-Stock Rule & 40% Single-Sector Rule: avoid putting more than 20%–25% of your total portfolio into a single company.',
      'Before buying, inspect the Debt-to-Equity (D/E) ratio on the Stock Details page. Companies with low D/E (<0.6x for non-financials) have strong balance sheets that can weather high interest rate environments.',
      'In JomInvest, use the AI Portfolio Doctor on your Portfolio Page to audit your sector concentration and Shariah/Risk alignment anytime.'
    ],
    contentBm: [
      'Pelabur profesional melindungi risiko kerugian terlebih dahulu. Peraturan emas untuk pelabur baharu ialah mengelakkan meletakkan lebih daripada 20%–25% daripada keseluruhan portfolio ke dalam satu syarikat tunggal.',
      'Sebelum membeli, semak nisbah Hutang-ke-Ekuiti (D/E) di halaman Maklumat Saham. Syarikat dengan D/E rendah mempunyai kunci kira-kira kukuh.',
      'Dalam JomInvest, gunakan Klinik Portfolio AI di halaman Portfolio anda untuk menyemak tumpuan sektor dan penjajaran risiko pada bila-bila masa.'
    ],
    takeawaysEng: [
      'Avoid concentrating >60% of your portfolio in a single sector',
      'Check Debt/Equity ratio to avoid over-leveraged companies',
      'Partial profit-taking (e.g. selling 50% of a winning position) locks in gains while keeping upside exposure'
    ],
    takeawaysBm: [
      'Elakkan menumpukan >60% portfolio anda dalam satu sektor sahaja',
      'Semak nisbah Hutang/Ekuiti untuk mengelakkan syarikat yang terlalu banyak hutang',
      'Ambil untung separa (cth. jual 50% pegangan) untuk mengunci keuntungan sambil mengekalkan potensi kenaikan'
    ],
    quiz: [
      {
        qEng: 'Which metric measures a company’s financial leverage by comparing total debt to shareholder equity?',
        qBm: 'Metrik manakah yang mengukur leveraj kewangan syarikat dengan membandingkan jumlah hutang dengan ekuiti?',
        optionsEng: ['Dividend Yield', 'Debt-to-Equity (D/E) Ratio', 'Trading Volume'],
        optionsBm: ['Kadar Hasil Dividen', 'Nisbah Hutang-ke-Ekuiti (D/E)', 'Volum Dagangan'],
        correctIndex: 1
      },
      {
        qEng: 'What does the AI Portfolio Doctor warn you about if 80% of your money is in one sector?',
        qBm: 'Apakah yang diberi amaran oleh Klinik Portfolio AI jika 80% wang anda berada dalam satu sektor?',
        optionsEng: [
          'Sector Concentration Risk (>60% in a single sector)',
          'Too much diversification',
          'Excessive dividend income'
        ],
        optionsBm: [
          'Risiko Tumpuan Sektor (>60% dalam satu sektor)',
          'Terlalu banyak kepelbagaian',
          'Pendapatan dividen berlebihan'
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
  // Wealth Projector State
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [riskLevel, setRiskLevel] = useState(6);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  // JomRingkas State — supports any stock in `stocks`
  const [selectedStockId, setSelectedStockId] = useState<string>(() => stocks[0]?.id || '1');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [loadingText, setLoadingText] = useState('Analyzing...');

  // Modal State for Interactive Articles & Tutorials + Quick Quiz
  const [activeLearningItem, setActiveLearningItem] = useState<EducationalItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    if (isScanning) {
      const steps =
        language === 'ENG'
          ? [
              'Reading Bursa Filing PDF...',
              'Extracting Revenue & Profit...',
              'Evaluating Shariah & Dividend Ratios...',
              'Synthesizing Executive Summary...'
            ]
          : [
              'Membaca Laporan Tahunan Bursa...',
              'Mengekstrak Hasil & Untung Bersih...',
              'Menilai Nisbah Syariah & Dividen...',
              'Menjana Ringkasan Eksekutif...'
            ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(steps[i % steps.length]);
        i++;
      }, 450);
      return () => clearInterval(interval);
    }
  }, [isScanning, language]);

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Educational Hub',
      subtitle: 'Learn to invest with confidence using AI tools, Bursa guides & interactive quizzes',
      articles: 'Articles',
      tutorials: 'Video Tutorials',
      aiTools: 'AI Tools',
      readMore: 'Read & Take Quiz (+25 XP)',
      watchNow: 'Watch & Take Quiz (+25 XP)'
    },
    BM: {
      back: 'Kembali ke Papan Pemuka',
      title: 'Hab Pendidikan',
      subtitle: 'Belajar melabur dengan yakin menggunakan alat AI, panduan Bursa & kuiz interaktif',
      articles: 'Artikel',
      tutorials: 'Tutorial Video',
      aiTools: 'Alat AI',
      readMore: 'Baca & Jawab Kuiz (+25 XP)',
      watchNow: 'Tonton & Jawab Kuiz (+25 XP)'
    }
  };

  const t = texts[language];

  const currentStock = useMemo(() => {
    return stocks.find(s => s.id === selectedStockId) || stocks[0];
  }, [stocks, selectedStockId]);

  // Dynamic JomRingkas Executive Summary generator for ALL 26+ Bursa stocks
  const dynamicReport = useMemo(() => {
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
        ? `${currentStock.name} (${currentStock.ticker}) recorded FY revenue of ${currentStock.revenue} and net profit of ${currentStock.netProfit} in the ${currentStock.sector} sector. ${currentStock.description} Growth & Momentum radar scores stand at ${radar.growth}/100 and ${radar.momentum}/100. (Annual Report Sec. 2)`
        : `${currentStock.name} (${currentStock.ticker}) mencatatkan hasil tahunan ${currentStock.revenue} dan untung bersih ${currentStock.netProfit} dalam sektor ${currentStock.sector}. Skor radar Pertumbuhan & Momentum berada pada ${radar.growth}/100 dan ${radar.momentum}/100. (Laporan Tahunan Seksyen 2)`;

    const valuationLabel =
      pe < 14
        ? language === 'ENG'
          ? 'attractively valued below market average'
          : 'dinilai menarik di bawah purata pasaran'
        : pe <= 24
        ? language === 'ENG'
          ? 'fairly valued in line with sector peers'
          : 'dinilai berpatutan selaras dengan rakan sektor'
        : language === 'ENG'
        ? 'trading at a growth premium multiple'
        : 'didagangkan pada gandaan premium pertumbuhan';

    const riskText =
      language === 'ENG'
        ? `At RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} trades at a P/E of ${currentStock.peRatio}x (${valuationLabel}) with a Debt/Equity ratio of ${currentStock.debtEquity}. Balance sheet health score is ${radar.health}/100; monitor sector margin sensitivity and macro OPR/FX shifts. (Risk Statement pg. 48)`
        : `Pada harga RM ${currentStock.price} (${currentStock.changePercent}), ${currentStock.ticker} didagangkan pada P/E ${currentStock.peRatio}x (${valuationLabel}) dengan nisbah Hutang/Ekuiti ${currentStock.debtEquity}. Skor kesihatan kunci kira-kira ialah ${radar.health}/100. (Penyata Risiko ms. 48)`;

    const shariahBadge = currentStock.isShariah
      ? language === 'ENG'
        ? '☪️ SC Malaysia Shariah-Compliant'
        : '☪️ Patuh Syariah SC Malaysia'
      : language === 'ENG'
      ? 'Conventional (Non-Shariah)'
      : 'Konvensional (Bukan Syariah)';

    const dividendText =
      language === 'ENG'
        ? `Offers a ${currentStock.dividendYield} indicated dividend yield (${
            divYield >= 4.5
              ? 'Strong cash cow for passive income seekers'
              : divYield >= 2.5
              ? 'Balanced payout while retaining capital for expansion'
              : 'Reinvests majority of cashflow into capital growth'
          }). Status: ${shariahBadge}. Market Cap: ${currentStock.marketCap}. (Shareholder Returns pg. 84)`
        : `Menawarkan kadar hasil dividen ${currentStock.dividendYield} (${
            divYield >= 4.5
              ? 'Aliran dividen kukuh untuk pendapatan pasif'
              : 'Agihan seimbang sambil mengekalkan modal pengembangan'
          }). Status: ${shariahBadge}. Modal Pasaran: ${currentStock.marketCap}. (Pulangan Pemegang Saham ms. 84)`;

    return {
      title: `${currentStock.name} (${currentStock.ticker}) Annual Report Summary`,
      growth: growthText,
      risk: riskText,
      dividend: dividendText,
      score: confidenceScore
    };
  }, [currentStock, language]);

  // Wealth Calculation with Malaysian Benchmarks (EPF/ASB ~5.5% p.a. & Fixed Deposit ~3.0% p.a.)
  const wealthData = useMemo(() => {
    const data = [];
    let currentWealth = 0;
    let epfWealth = 0;
    let fdWealth = 0;
    let totalInvested = 0;
    const years = 10;
    const inflationOffset = inflationAdjusted ? 0.03 : 0;

    const strategyReturn = Math.max(0.01, 0.04 + riskLevel * 0.008 - inflationOffset);
    const epfReturn = Math.max(0.005, 0.055 - inflationOffset); // EPF / ASB ~5.5% p.a.
    const fdReturn = Math.max(0.0, 0.03 - inflationOffset); // Fixed Deposit ~3.0% p.a.

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

  const handleAnalyze = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1400);
  };

  const handleExportSummary = () => {
    if (!currentStock || !dynamicReport) return;
    const textReport = [
      `=== JomRingkas AI Executive Summary ===`,
      `Company: ${currentStock.name} (${currentStock.ticker} / ${currentStock.bursaCode})`,
      `Price: RM ${currentStock.price} (${currentStock.changePercent}) | Sector: ${currentStock.sector}`,
      `Fundamental Confidence Score: ${dynamicReport.score}%`,
      ``,
      `1. GROWTH DRIVER:`,
      dynamicReport.growth,
      ``,
      `2. KEY RISK & VALUATION:`,
      dynamicReport.risk,
      ``,
      `3. DIVIDEND & SHARIAH VERDICT:`,
      dynamicReport.dividend
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

    addXP(15, `Exported ${currentStock.ticker} JomRingkas Summary`);
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
          `Completed Quiz: ${
            language === 'ENG' ? activeLearningItem.titleEng : activeLearningItem.titleBm
          }`
        );
      } else {
        toast.success(
          language === 'ENG'
            ? 'All answers correct! You already claimed XP for this module.'
            : 'Semua jawapan betul! Anda telah menuntut XP untuk modul ini.'
        );
      }
    } else {
      toast.error(
        language === 'ENG'
          ? 'Some answers were incorrect. Review the highlights and try again!'
          : 'Beberapa jawapan kurang tepat. Semak semula dan cuba lagi!'
      );
    }
  };

  const articleItems = learningItems.filter(i => i.type === 'article');
  const tutorialItems = learningItems.filter(i => i.type === 'tutorial');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigateTo('dashboard')}
            className="hover:bg-gray-100/50"
          >
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-200 mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ai-tools" className="space-y-8">
          <div className="flex justify-center md:justify-start">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-white border shadow-sm p-1 h-auto rounded-xl">
              <TabsTrigger
                value="ai-tools"
                className="rounded-lg py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 font-medium transition-all"
              >
                <Sparkles size={16} className="mr-2 text-purple-600" /> {t.aiTools}
              </TabsTrigger>
              <TabsTrigger
                value="articles"
                className="rounded-lg py-2 data-[state=active]:bg-gray-100"
              >
                {t.articles}
              </TabsTrigger>
              <TabsTrigger
                value="tutorials"
                className="rounded-lg py-2 data-[state=active]:bg-gray-100"
              >
                {t.tutorials}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* === DETAILED AI TOOLS TAB === */}
          <TabsContent value="ai-tools" className="space-y-12">
            {/* 1. Dynamic JomRingkas */}
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 transition duration-1000"></div>

              <Card className="relative border-none shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

                <CardContent className="p-0">
                  <div className="grid md:grid-cols-12 min-h-[500px]">
                    {/* Left Panel: Control */}
                    <div className="md:col-span-5 bg-gray-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                      <div className="mb-6">
                        <Badge className="mb-2 bg-purple-100 text-purple-700 hover:bg-purple-100">
                          {stocks.length} Bursa Counters Ready
                        </Badge>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 mb-2 flex items-center gap-2">
                          <FileText className="text-purple-600" /> JomRingkas
                        </h2>
                        <p className="text-sm text-gray-500">
                          {language === 'ENG'
                            ? 'AI-Powered Bursa Malaysia Annual Report & Fundamental Analyzer'
                            : 'Penganalisis Laporan Tahunan & Asas Bursa Malaysia Berkuasa AI'}
                        </p>
                      </div>

                      <div className="space-y-5">
                        <div className="bg-white p-4 rounded-xl border shadow-sm hover:border-purple-300 transition-colors">
                          <Label className="text-xs text-gray-400 font-bold tracking-wider mb-2 block uppercase">
                            {language === 'ENG'
                              ? 'Select Bursa Listed Company'
                              : 'Pilih Syarikat Tersenarai Bursa'}
                          </Label>
                          <Select
                            value={selectedStockId}
                            onValueChange={val => {
                              setSelectedStockId(val);
                              setScanComplete(true);
                            }}
                          >
                            <SelectTrigger className="border-none shadow-none p-0 h-auto font-medium text-base focus:ring-0 w-full">
                              <SelectValue placeholder="Select Stock" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {stocks.map(stock => (
                                <SelectItem key={stock.id} value={stock.id}>
                                  {stock.ticker} — {stock.name} ({stock.sector})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {currentStock && (
                          <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Price / 24h:</span>
                              <span className="font-bold text-gray-900">
                                RM {currentStock.price} ({currentStock.changePercent})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">P/E & Div Yield:</span>
                              <span className="font-semibold text-gray-800">
                                {currentStock.peRatio}x • {currentStock.dividendYield}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Revenue / Net Profit:</span>
                              <span className="font-semibold text-gray-800">
                                {currentStock.revenue} / {currentStock.netProfit}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full h-12 text-base font-bold !bg-purple-600 hover:!bg-purple-700 !text-white shadow-md transition-colors"
                          onClick={handleAnalyze}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" /> {loadingText}
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2" />{' '}
                              {language === 'ENG'
                                ? 'Re-Scan Annual Report'
                                : 'Imbas Semula Laporan Tahunan'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Right Panel: Visualization */}
                    <div className="md:col-span-7 p-8 bg-white relative">
                      {!scanComplete && !isScanning && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 text-gray-400">
                          <div className="p-6 bg-gray-50 rounded-full">
                            <Bot size={48} className="text-gray-300" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium text-gray-600">
                              No Report Analyzed
                            </h3>
                            <p className="text-sm max-w-xs mx-auto mt-2">
                              Pick a stock from the menu to extract insights automatically.
                            </p>
                          </div>
                        </div>
                      )}

                      {isScanning && (
                        <div className="h-full flex flex-col items-center justify-center py-12">
                          <div className="relative w-32 h-40 border-2 border-gray-100 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden mb-6">
                            <div className="space-y-2 p-4 w-full opacity-30">
                              <div className="h-2 bg-purple-300 rounded w-3/4"></div>
                              <div className="h-2 bg-purple-200 rounded w-full"></div>
                              <div className="h-2 bg-purple-300 rounded w-5/6"></div>
                              <div className="h-2 bg-purple-200 rounded w-full"></div>
                            </div>
                          </div>
                          <p className="font-mono text-purple-600 animate-pulse text-sm font-bold">
                            {loadingText}
                          </p>
                        </div>
                      )}

                      {scanComplete && dynamicReport && currentStock && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-4 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Badge
                                  variant="secondary"
                                  className="bg-green-50 text-green-700"
                                >
                                  AI Verified
                                </Badge>
                                {currentStock.isShariah && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-50 text-emerald-700"
                                  >
                                    ☪️ Shariah
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {dynamicReport.title}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Fundamental Score
                              </p>
                              <p className="text-2xl font-black text-green-600">
                                {dynamicReport.score}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {[
                              {
                                icon: TrendingUp,
                                color: 'text-green-600',
                                bg: 'bg-green-50/70',
                                border: 'border-green-100',
                                title:
                                  language === 'ENG'
                                    ? 'Growth Driver & Revenue'
                                    : 'Pemacu Pertumbuhan & Hasil',
                                text: dynamicReport.growth
                              },
                              {
                                icon: Activity,
                                color: 'text-amber-600',
                                bg: 'bg-amber-50/70',
                                border: 'border-amber-100',
                                title:
                                  language === 'ENG'
                                    ? 'Key Risk & Valuation'
                                    : 'Risiko Utama & Penilaian',
                                text: dynamicReport.risk
                              },
                              {
                                icon: Zap,
                                color: 'text-blue-600',
                                bg: 'bg-blue-50/70',
                                border: 'border-blue-100',
                                title:
                                  language === 'ENG'
                                    ? 'Dividend & Shariah Verdict'
                                    : 'Keputusan Dividen & Syariah',
                                text: dynamicReport.dividend
                              }
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-4 ${item.bg} border ${item.border} rounded-xl transition-all`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-1.5 bg-white rounded-lg shadow-xs h-fit ${item.color}`}
                                  >
                                    <item.icon size={18} />
                                  </div>
                                  <div>
                                    <h4
                                      className={`font-bold ${item.color} text-xs mb-1 uppercase tracking-wide`}
                                    >
                                      {item.title}
                                    </h4>
                                    <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
                                      {item.text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-3 justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                              onClick={() => {
                                setSelectedStock(currentStock);
                                navigateTo('stock-details');
                              }}
                            >
                              <ExternalLink size={14} className="mr-1.5" />
                              {language === 'ENG'
                                ? `View ${currentStock.ticker} Stock Details`
                                : `Lihat Maklumat Saham ${currentStock.ticker}`}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={handleExportSummary}
                            >
                              <Download size={14} className="mr-1.5" />
                              {language === 'ENG'
                                ? 'Copy / Export Summary (+15 XP)'
                                : 'Salin / Eksport Ringkasan (+15 XP)'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 2. JomSentimen */}
            <section className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg bg-gradient-to-b from-white to-gray-50 overflow-hidden relative min-h-[300px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <Gauge size={18} />
                    </span>
                    JomSentimen
                  </CardTitle>
                  <CardDescription>Bursa Malaysia Market Emotion Radar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                  <div className="relative w-64 h-32 mb-8 mx-auto">
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 100 A 80 80 0 0 1 65 35"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray="100 1000"
                      />
                      <path
                        d="M 65 35 A 80 80 0 0 1 135 35"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="20"
                        strokeDasharray="100 1000"
                      />
                      <path
                        d="M 135 35 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="20"
                        strokeDasharray="100 1000"
                      />
                      <g
                        className="transition-all duration-1000 ease-out"
                        style={{
                          transform: `rotate(${(78 / 100) * 180 - 90}deg)`,
                          transformOrigin: '100px 100px'
                        }}
                      >
                        <path d="M 100 100 L 100 20" stroke="#1e293b" strokeWidth="4" />
                        <circle
                          cx="100"
                          cy="100"
                          r="6"
                          fill="#1e293b"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </g>
                    </svg>
                  </div>

                  <div className="flex justify-between w-64 text-[10px] font-bold uppercase tracking-widest text-gray-400 -mt-6 mb-4 px-2">
                    <span className="text-red-500">Fear</span>
                    <span className="text-yellow-500">Neutral</span>
                    <span className="text-green-600">Greed</span>
                  </div>

                  <div className="text-center space-y-1 mt-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs mb-2 shadow-xs border border-green-200">
                      FBM KLCI Sentiment: Bullish
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                      GREED (78/100)
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white h-full relative overflow-hidden flex flex-col">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="flex justify-between items-center text-base">
                    <span>Live Bursa News Sentiment</span>
                    <span className="flex items-center gap-1.5 text-[0.65rem] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>{' '}
                      LIVE
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="divide-y divide-gray-100">
                    {[
                      {
                        source: 'The Edge Malaysia',
                        time: '10m ago',
                        text: 'Johor data center & AI infrastructure boom lifts GAMUDA, YTLPOWR and TENAGA orderbooks.',
                        sentiment: 'Positive',
                        color: 'text-green-700',
                        bg: 'bg-green-100',
                        border: 'border-green-200',
                        icon: Newspaper,
                        ticker: 'GAMUDA'
                      },
                      {
                        source: 'Bursa Filing',
                        time: '32m ago',
                        text: 'Palm oil futures consolidate near RM 3,850/MT; plantation counters trade sideways.',
                        sentiment: 'Neutral',
                        color: 'text-yellow-700',
                        bg: 'bg-yellow-100',
                        border: 'border-yellow-200',
                        icon: MessageSquare,
                        ticker: 'SIMEPLT'
                      },
                      {
                        source: 'StarBiz',
                        time: '1h ago',
                        text: 'Bank Negara holds OPR steady at 3.00%, supporting MAYBANK & CIMB net interest margins.',
                        sentiment: 'Positive',
                        color: 'text-green-700',
                        bg: 'bg-green-100',
                        border: 'border-green-200',
                        icon: Newspaper,
                        ticker: 'MAYBANK'
                      }
                    ].map((news, i) => (
                      <div
                        key={i}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer block"
                        onClick={() => {
                          const found = stocks.find(s => s.ticker === news.ticker);
                          if (found) {
                            setSelectedStock(found);
                            navigateTo('stock-details');
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <news.icon size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-700">
                              {news.source}
                            </span>
                            <span className="text-[10px] text-gray-400">• {news.time}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${news.bg} ${news.color} ${news.border} text-[10px] uppercase font-bold`}
                          >
                            {news.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-snug">
                          "{news.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. AI Wealth Projector with Malaysian Benchmarks (EPF / ASB / FD) */}
            <section className="relative">
              <Card className="border-none shadow-xl bg-white relative z-10 overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

                <CardHeader className="md:flex md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl mb-1">
                      <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <BarChart size={20} />
                      </span>
                      AI Wealth Projector (vs EPF/ASB & Fixed Deposit)
                    </CardTitle>
                    <CardDescription>
                      {language === 'ENG'
                        ? 'Compare your 10-year Bursa strategy against Malaysian benchmarks: EPF/ASB (~5.5% p.a.) & FD (~3.0% p.a.)'
                        : 'Bandingkan strategi 10 tahun anda dengan penanda aras Malaysia: KWSP/ASB (~5.5% setahun) & FD (~3.0% setahun)'}
                    </CardDescription>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                      Your Projected Total
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                      RM {finalWealth.toLocaleString()}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-12 min-h-[440px]">
                    {/* Chart + Benchmark Comparison Cards */}
                    <div className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between">
                      <div className="h-[320px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={wealthData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f3f4f6"
                            />
                            <XAxis
                              dataKey="year"
                              tick={{ fontSize: 11, fill: '#9ca3af' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tickFormatter={value => `RM${(value / 1000).toFixed(0)}k`}
                              tick={{ fontSize: 11, fill: '#9ca3af' }}
                              axisLine={false}
                              tickLine={false}
                              width={55}
                            />
                            <Tooltip
                              formatter={(value: number) => `RM ${value.toLocaleString()}`}
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                padding: '12px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                            <Area
                              type="monotone"
                              name="Your Strategy"
                              dataKey="wealth"
                              stroke="#2563EB"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorWealth)"
                            />
                            <Area
                              type="monotone"
                              name="EPF / ASB (~5.5%)"
                              dataKey="epfAsb"
                              stroke="#16A34A"
                              strokeWidth={2}
                              fillOpacity={0}
                            />
                            <Area
                              type="monotone"
                              name="Fixed Deposit (~3.0%)"
                              dataKey="fixedDeposit"
                              stroke="#D97706"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              fillOpacity={0}
                            />
                            <Area
                              type="monotone"
                              name="Cash Invested"
                              dataKey="invested"
                              stroke="#94A3B8"
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              fillOpacity={0}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Summary Comparison Card */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <div>
                          <p className="text-[11px] font-bold text-blue-600 uppercase">
                            Your Strategy
                          </p>
                          <p className="text-lg font-black text-blue-700">
                            RM {finalWealth.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            +RM {(finalWealth - finalInvested).toLocaleString()} gain
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-green-600 uppercase">
                            EPF / ASB (5.5%)
                          </p>
                          <p className="text-lg font-black text-green-700">
                            RM {finalEpf.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            +RM {(finalEpf - finalInvested).toLocaleString()} gain
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-amber-600 uppercase">
                            Fixed Deposit (3%)
                          </p>
                          <p className="text-lg font-black text-amber-700">
                            RM {finalFd.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            +RM {(finalFd - finalInvested).toLocaleString()} gain
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase">
                            Cash Invested
                          </p>
                          <p className="text-lg font-black text-gray-700">
                            RM {finalInvested.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            RM {monthlyInvest}/mo × 10 yrs
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-4 p-6 md:p-8 bg-gray-50/50 space-y-8 flex flex-col justify-center">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <Label className="text-sm font-bold text-gray-700">
                            Monthly Investment
                          </Label>
                          <span className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded text-xs">
                            RM {monthlyInvest}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="5000"
                          step="100"
                          value={monthlyInvest}
                          onChange={e => setMonthlyInvest(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <Label className="text-sm font-bold text-gray-700">
                            Risk Profile Return
                          </Label>
                          <span
                            className={`font-bold px-2 py-1 rounded text-xs ${
                              riskLevel > 7
                                ? 'text-red-700 bg-red-100'
                                : riskLevel > 4
                                ? 'text-yellow-700 bg-yellow-100'
                                : 'text-green-700 bg-green-100'
                            }`}
                          >
                            {riskLevel}/10 (~{(4 + riskLevel * 0.8).toFixed(1)}% p.a.)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={riskLevel}
                          onChange={e => setRiskLevel(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="mt-3 p-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 leading-relaxed shadow-xs">
                          {riskLevel <= 3
                            ? '🛡️ Conservative: Blue-Chip REITs & Utilities (Est. 4.8-6.4% p.a)'
                            : riskLevel <= 7
                            ? '⚖️ Balanced: Dividend Banks + Growth Leaders (Est. 7.2-9.6% p.a)'
                            : '🚀 Aggressive: Tech, Data Center & Construction (Est. 10.4-12.0% p.a)'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div>
                          <Label
                            className="font-bold text-sm cursor-pointer"
                            onClick={() => setInflationAdjusted(!inflationAdjusted)}
                          >
                            Inflation Adjusted
                          </Label>
                          <p className="text-[10px] text-gray-400">
                            Real purchasing power (-3% p.a.)
                          </p>
                        </div>
                        <Switch
                          checked={inflationAdjusted}
                          onCheckedChange={setInflationAdjusted}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* === INTERACTIVE ARTICLES TAB === */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {articleItems.map(article => {
                const isDone = completedQuizzes.includes(article.id);
                return (
                  <Card
                    key={article.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
                    onClick={() => openLearningModal(article)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{article.badge}</Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={14} />
                          {article.meta}
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {language === 'ENG' ? article.titleEng : article.titleBm}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {language === 'ENG' ? article.descEng : article.descBm}
                      </p>
                      <Button
                        variant={isDone ? 'secondary' : 'outline'}
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation();
                          openLearningModal(article);
                        }}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="mr-2 text-green-600" size={16} />
                            {language === 'ENG' ? 'Completed (Review)' : 'Selesai (Ulang Kaji)'}
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2" size={16} />
                            {t.readMore}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* === INTERACTIVE TUTORIALS TAB === */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {tutorialItems.map((tutorial, index) => {
                const isDone = completedQuizzes.includes(tutorial.id);
                return (
                  <Card
                    key={tutorial.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => openLearningModal(tutorial)}
                  >
                    <div className="relative aspect-video bg-gray-200">
                      <ImageWithFallback
                        src={
                          index % 2 === 0
                            ? 'https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                            : 'https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                        }
                        alt="Tutorial thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Play className="text-green-600 ml-1" size={28} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{tutorial.badge}</Badge>
                        <span className="text-xs text-gray-500">{tutorial.meta}</span>
                      </div>
                      <CardTitle className="text-xl">
                        {language === 'ENG' ? tutorial.titleEng : tutorial.titleBm}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">
                        {language === 'ENG' ? tutorial.descEng : tutorial.descBm}
                      </p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={e => {
                          e.stopPropagation();
                          openLearningModal(tutorial);
                        }}
                      >
                        <Play className="mr-2" size={16} />
                        {isDone
                          ? language === 'ENG'
                            ? 'Completed (Review Module)'
                            : 'Selesai (Ulang Kaji)'
                          : t.watchNow}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Interactive Learning & Quick Quiz Modal */}
      {activeLearningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <CardHeader className="sticky top-0 bg-white z-10 border-b flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{activeLearningItem.badge}</Badge>
                  <span className="text-xs text-gray-500">{activeLearningItem.meta}</span>
                </div>
                <CardTitle className="text-xl">
                  {language === 'ENG'
                    ? activeLearningItem.titleEng
                    : activeLearningItem.titleBm}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveLearningItem(null)}
              >
                <X size={20} />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Lesson Paragraphs */}
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                {(language === 'ENG'
                  ? activeLearningItem.contentEng
                  : activeLearningItem.contentBm
                ).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Takeaways Box */}
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-2">
                <h4 className="font-bold text-sm text-green-900">
                  {language === 'ENG'
                    ? '📌 Key Malaysian Market Takeaways'
                    : '📌 Intipati Utama Pasaran Malaysia'}
                </h4>
                <ul className="list-disc list-inside text-xs sm:text-sm text-green-800 space-y-1">
                  {(language === 'ENG'
                    ? activeLearningItem.takeawaysEng
                    : activeLearningItem.takeawaysBm
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Quick Quiz (+25 XP) */}
              <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-indigo-950 flex items-center gap-2">
                    <Award size={18} className="text-indigo-600" />
                    {language === 'ENG'
                      ? 'Quick Comprehension Quiz'
                      : 'Kuiz Kefahaman Pantas'}
                  </h4>
                  <Badge className="bg-indigo-600 text-white">+25 XP</Badge>
                </div>

                {activeLearningItem.quiz.map((q, qIdx) => {
                  const options = language === 'ENG' ? q.optionsEng : q.optionsBm;
                  return (
                    <div key={qIdx} className="space-y-2 bg-white p-4 rounded-lg border">
                      <p className="font-semibold text-sm text-gray-900">
                        {qIdx + 1}. {language === 'ENG' ? q.qEng : q.qBm}
                      </p>
                      <div className="space-y-1.5">
                        {options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          let btnClass = 'border-gray-200 hover:bg-gray-50 text-gray-800';
                          if (isSelected) {
                            btnClass =
                              'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold';
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnClass =
                                'border-green-600 bg-green-50 text-green-900 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnClass = 'border-red-500 bg-red-50 text-red-800';
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
                              className={`w-full text-left text-xs sm:text-sm p-2.5 rounded-lg border transition-colors ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveLearningItem(null)}
                  >
                    {language === 'ENG' ? 'Close' : 'Tutup'}
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={
                      Object.keys(quizAnswers).length < activeLearningItem.quiz.length
                    }
                    onClick={handleQuizSubmit}
                  >
                    {language === 'ENG'
                      ? 'Submit Answers & Claim +25 XP'
                      : 'Hantar Jawapan & Tuntut +25 XP'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
