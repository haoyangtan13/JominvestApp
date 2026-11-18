import { useMemo, useState } from 'react';
import { Plus, ArrowUpRight } from 'lucide-react';
import type { Screen, PortfolioItem, StockData, TradeRecord } from '../App';

interface PortfolioPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  portfolio: PortfolioItem[];
  cashBalance: number;
  tradeHistory: TradeRecord[];
  userProfile: string;
  removeFromPortfolio: (stock: StockData) => void;
  sellFromPortfolio: (stockToSell: StockData, quantityToSell?: number) => boolean;
  setSelectedStock: (stock: StockData) => void;
  onTopUpCash: (amount?: number) => void;
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

export function PortfolioPage({
  navigateTo,
  language,
  portfolio,
  cashBalance,
  tradeHistory,
  userProfile,
  removeFromPortfolio,
  sellFromPortfolio,
  setSelectedStock,
  onTopUpCash
}: PortfolioPageProps) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');

  const texts = {
    ENG: {
      kicker: 'Practice Portfolio & Wealth Coach',
      title: 'My Bursa Portfolio',
      subtitle:
        'Track your practice holdings, sector diversification, and estimated passive dividend income in plain English.',
      creditBtn: '+ Top Up RM 5,000 Practice Cash',
      netLiquidity: 'Total Portfolio Value',
      marketValueHoldings: 'Invested in Stocks',
      buyingPower: 'Available Practice Cash',
      projDividend: 'Est. Annual Dividends',
      perYear: '/yr',
      perMonth: '/mo',
      costBasisLabel: 'Total Cost',
      coachKicker: 'Guided Portfolio Check-Up',
      coachTitle: 'Diversification Coach & Passive Income',
      col1Title: 'Diversification Coach',
      col2Title: 'Passive Dividend Income Estimator',
      col3Title: 'Shariah & Investor Style Fit',
      openPositions: 'My Stock Holdings',
      contractNotes: 'Trade History',
      colSecurity: 'Company',
      colSector: 'Sector',
      colQty: 'Shares Owned',
      colAvgCost: 'Avg Buy Price',
      colLastPrice: 'Current Price',
      colMarketVal: 'Total Value',
      colUnrealized: 'Total Return',
      colActions: 'Quick Actions',
      trimHalf: 'Sell Half',
      closePos: 'Sell All',
      emptyHoldingsTitle: 'Your portfolio is 100% in cash right now',
      emptyHoldingsDesc:
        'You have plenty of practice cash ready! Explore Malaysian companies on the Home screen to make your first simulated investment.',
      exploreMarket: 'Explore Bursa Stocks',
      colSide: 'Order Type',
      colExecPrice: 'Fill Price',
      colFees: 'Bursa Fees',
      colNetSettlement: 'Total Amount',
      colTimestamp: 'Time',
      emptyHistoryTitle: 'No practice trades yet',
      emptyHistoryDesc:
        'Every time you practice buying or selling a stock, your trade receipt and Bursa fee breakdown will appear here.'
    },
    BM: {
      kicker: 'Portfolio Latihan & Jurulatih Kekayaan',
      title: 'Portfolio Bursa Saya',
      subtitle:
        'Pantau pegangan saham latihan anda, kepelbagaian sektor, dan anggaran pendapatan dividen pasif dengan mudah.',
      creditBtn: '+ Tambah RM 5,000 Tunai Latihan',
      netLiquidity: 'Jumlah Nilai Portfolio',
      marketValueHoldings: 'Dilaburkan Dalam Saham',
      buyingPower: 'Tunai Latihan Tersedia',
      projDividend: 'Anggaran Dividen Tahunan',
      perYear: '/thn',
      perMonth: '/bln',
      costBasisLabel: 'Jumlah Kos',
      coachKicker: 'Semakan Kesihatan Portfolio',
      coachTitle: 'Jurulatih Kepelbagaian & Pendapatan Pasif',
      col1Title: 'Jurulatih Kepelbagaian',
      col2Title: 'Penganggar Pendapatan Dividen Pasif',
      col3Title: 'Status Syariah & Gaya Pelabur',
      openPositions: 'Pegangan Saham Saya',
      contractNotes: 'Sejarah Dagangan',
      colSecurity: 'Syarikat',
      colSector: 'Sektor',
      colQty: 'Unit Dimiliki',
      colAvgCost: 'Harga Beli Purata',
      colLastPrice: 'Harga Semasa',
      colMarketVal: 'Jumlah Nilai',
      colUnrealized: 'Jumlah Pulangan',
      colActions: 'Tindakan Pantas',
      trimHalf: 'Jual Separuh',
      closePos: 'Jual Semua',
      emptyHoldingsTitle: 'Portfolio anda masih 100% tunai',
      emptyHoldingsDesc:
        'Anda mempunyai tunai latihan yang sedia digunakan! Terokai syarikat Malaysia di skrin Utama untuk membuat pelaburan latihan pertama anda.',
      exploreMarket: 'Terokai Saham Bursa',
      colSide: 'Jenis Pesanan',
      colExecPrice: 'Harga Pelaksanaan',
      colFees: 'Yuran Bursa',
      colNetSettlement: 'Jumlah Bersih',
      colTimestamp: 'Masa',
      emptyHistoryTitle: 'Belum ada rekod dagangan latihan',
      emptyHistoryDesc:
        'Setiap kali anda berlatih membeli atau menjual saham, resit dagangan dan pecahan yuran Bursa akan dipaparkan di sini.'
    }
  };

  const t = texts[language];

  const holdingsValue = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + parseFloat(item.stock.price) * item.quantity, 0);
  }, [portfolio]);

  const totalCostBasis = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + item.averagePrice * item.quantity, 0);
  }, [portfolio]);

  const totalNetLiquidity = holdingsValue + cashBalance;
  const unrealizedPL = holdingsValue - totalCostBasis;
  const unrealizedPLPercent = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0;

  const annualDividend = useMemo(() => {
    return portfolio.reduce((acc, item) => {
      const val = parseFloat(item.stock.price) * item.quantity;
      const yieldPct = parseFloat(item.stock.dividendYield.replace('%', '')) || 0;
      return acc + val * (yieldPct / 100);
    }, 0);
  }, [portfolio]);

  const monthlyDividend = annualDividend / 12;

  const sectorData = useMemo(() => {
    const sectors: Record<string, number> = {};
    portfolio.forEach(item => {
      const sector = item.stock.sector || 'Other';
      sectors[sector] = (sectors[sector] || 0) + parseFloat(item.stock.price) * item.quantity;
    });

    const total = Object.values(sectors).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(sectors)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const diagnostics = useMemo(() => {
    if (portfolio.length === 0 || holdingsValue <= 0) {
      return {
        diversificationTag: language === 'ENG' ? 'Ready to Start' : 'Sedia Bermula',
        diversificationTagClass: 'jom-tag',
        diversificationText:
          language === 'ENG'
            ? 'You have not bought any stocks yet. A great rule of thumb for beginners is spreading your money across at least 3 different industries (like Banking, Utilities, and Tech).'
            : 'Anda belum membeli sebarang saham lagi. Petua terbaik untuk pemula ialah mempelbagaikan wang anda merentasi sekurang-kurangnya 3 industri berbeza.',
        shariahPct: 0,
        shariahValue: 0,
        shariahText:
          language === 'ENG'
            ? 'RM 0.00 in Shariah-compliant stocks so far. Look for the green Shariah badge on the Home screen if you want halal-screened counters.'
            : 'RM 0.00 dalam saham patuh Syariah setakat ini. Cari lencana hijau Syariah di skrin Utama untuk pilihan patuh Syariah.',
        mandateTag: language === 'ENG' ? 'Cash Mode' : 'Mod Tunai',
        mandateTagClass: 'jom-tag',
        avgGrowthScore: 0,
        avgDivScore: 0,
        riskText:
          language === 'ENG'
            ? `Your profile is set to ${userProfile}. Pick your first stock to see how well your portfolio matches your goals.`
            : `Profil anda ialah ${userProfile}. Pilih saham pertama anda untuk melihat keserasian dengan matlamat anda.`
      };
    }

    const topSector = sectorData[0];
    const numSectors = sectorData.length;
    let diversificationTag = language === 'ENG' ? 'Getting There' : 'Sederhana';
    let diversificationTagClass = 'jom-tag';
    let diversificationText = '';

    if (topSector && topSector.percentage > 60) {
      diversificationTag = language === 'ENG' ? 'Heavy in 1 Sector' : 'Tertumpu 1 Sektor';
      diversificationTagClass = 'jom-tag jom-tag-warn';
      diversificationText =
        language === 'ENG'
          ? `${topSector.percentage}% of your stock investments are in ${topSector.name}. Adding a company from another industry helps protect your portfolio if one sector slows down.`
          : `${topSector.percentage}% daripada pelaburan saham anda berada dalam ${topSector.name}. Menambah syarikat daripada industri lain membantu mengurangkan risiko.`;
    } else if (numSectors >= 3) {
      diversificationTag = language === 'ENG' ? 'Well Diversified' : 'Pelbagai & Kukuh';
      diversificationTagClass = 'jom-tag jom-tag-up';
      diversificationText =
        language === 'ENG'
          ? `Nice work! Your money is spread across ${numSectors} sectors (largest is ${topSector.name} at ${topSector.percentage}%). You are not overly reliant on any single industry.`
          : `Bagus! Pelaburan anda diagihkan merentasi ${numSectors} sektor (terbesar ialah ${topSector.name} pada ${topSector.percentage}%).`;
    } else {
      diversificationTag = language === 'ENG' ? 'Good Start' : 'Permulaan Baik';
      diversificationTagClass = 'jom-tag';
      diversificationText =
        language === 'ENG'
          ? `You are invested in ${numSectors} sector(s), led by ${topSector.name} (${topSector.percentage}%). Adding 1 or 2 more sectors will give you a smoother ride.`
          : `Anda melabur dalam ${numSectors} sektor, diketuai oleh ${topSector.name} (${topSector.percentage}%). Tambah 1 atau 2 lagi sektor untuk lebih seimbang.`;
    }

    const shariahValue = portfolio.reduce((acc, item) => {
      return acc + (item.stock.isShariah ? parseFloat(item.stock.price) * item.quantity : 0);
    }, 0);
    const shariahPct = Math.round((shariahValue / holdingsValue) * 100);
    const shariahText =
      language === 'ENG'
        ? `${shariahPct}% (RM ${shariahValue.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}) of your invested stocks are certified Shariah-compliant by SC Malaysia.`
        : `${shariahPct}% (RM ${shariahValue.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}) daripada saham anda disahkan patuh Syariah oleh SC Malaysia.`;

    const avgGrowthScore =
      portfolio.reduce((acc, item) => {
        const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
        return acc + item.stock.radarScores.growth * weight;
      }, 0) || 0;
    const avgDivScore =
      portfolio.reduce((acc, item) => {
        const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
        return acc + item.stock.radarScores.dividend * weight;
      }, 0) || 0;

    const isAggressiveProfile =
      userProfile.toLowerCase().includes('aggressive') ||
      userProfile.toLowerCase().includes('explorer');
    const isConservativeProfile =
      userProfile.toLowerCase().includes('conservative') ||
      userProfile.toLowerCase().includes('guardian');

    let mandateTag = language === 'ENG' ? 'Great Match' : 'Padanan Baik';
    let mandateTagClass = 'jom-tag jom-tag-up';
    let riskText = '';

    if (isAggressiveProfile) {
      if (avgGrowthScore >= 65) {
        mandateTag = language === 'ENG' ? 'Matches Your Goal' : 'Selaras Matlamat';
        mandateTagClass = 'jom-tag jom-tag-up';
        riskText =
          language === 'ENG'
            ? `Your holdings fit your ${userProfile} style well, with a strong Growth Score of ${avgGrowthScore.toFixed(0)}/100.`
            : `Pegangan anda selaras dengan gaya ${userProfile}, dengan Skor Pertumbuhan ${avgGrowthScore.toFixed(0)}/100.`;
      } else {
        mandateTag = language === 'ENG' ? 'More Cautious' : 'Lebih Defensif';
        mandateTagClass = 'jom-tag jom-tag-warn';
        riskText =
          language === 'ENG'
            ? `Your profile is ${userProfile}, but your stocks are mostly defensive right now (Growth Score: ${avgGrowthScore.toFixed(0)}/100). Explore growth names like GAMUDA, INARI, or YTLPOWR.`
            : `Profil anda ialah ${userProfile}, tetapi pilihan semasa lebih defensif (Skor Pertumbuhan: ${avgGrowthScore.toFixed(0)}/100). Cuba lihat GAMUDA atau INARI.`;
      }
    } else if (isConservativeProfile) {
      if (avgDivScore >= 70) {
        mandateTag = language === 'ENG' ? 'Matches Your Goal' : 'Selaras Matlamat';
        mandateTagClass = 'jom-tag jom-tag-up';
        riskText =
          language === 'ENG'
            ? `Fits your ${userProfile} style nicely! Your Dividend Score of ${avgDivScore.toFixed(0)}/100 gives you steady passive cash flow.`
            : `Sesuai dengan gaya ${userProfile}! Skor Dividen ${avgDivScore.toFixed(0)}/100 memberi aliran pendapatan pasif yang stabil.`;
      } else {
        mandateTag = language === 'ENG' ? 'Higher Risk' : 'Risiko Lebih Tinggi';
        mandateTagClass = 'jom-tag jom-tag-warn';
        riskText =
          language === 'ENG'
            ? `A bit fast-moving for ${userProfile} (Dividend Score: ${avgDivScore.toFixed(0)}/100). Consider steady dividend payers like MAYBANK or TENAGA.`
            : `Agak berisiko untuk ${userProfile} (Skor Dividen: ${avgDivScore.toFixed(0)}/100). Pertimbangkan pembayar dividen stabil seperti MAYBANK atau TENAGA.`;
      }
    } else {
      mandateTag = language === 'ENG' ? 'Balanced Fit' : 'Seimbang';
      mandateTagClass = 'jom-tag jom-tag-up';
      riskText =
        language === 'ENG'
          ? `Well-balanced for ${userProfile}! Your Growth (${avgGrowthScore.toFixed(0)}/100) and Dividend (${avgDivScore.toFixed(0)}/100) scores complement each other.`
          : `Seimbang untuk ${userProfile}! Skor Pertumbuhan (${avgGrowthScore.toFixed(0)}/100) dan Dividen (${avgDivScore.toFixed(0)}/100) saling melengkapi.`;
    }

    return {
      diversificationTag,
      diversificationTagClass,
      diversificationText,
      shariahPct,
      shariahValue,
      shariahText,
      mandateTag,
      mandateTagClass,
      avgGrowthScore,
      avgDivScore,
      riskText
    };
  }, [portfolio, holdingsValue, sectorData, userProfile, language]);

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const investedPct = totalNetLiquidity > 0 ? Math.round((holdingsValue / totalNetLiquidity) * 100) : 0;
  const cashPct = Math.max(0, 100 - investedPct);

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
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onTopUpCash(5000)}
            className="jom-btn jom-btn-primary"
          >
            <Plus size={14} />
            <span>{t.creditBtn}</span>
          </button>
        </div>
      </div>

      {/* Origin-Style Plain-English Verdict Banner */}
      <div className="jom-hero-verdict p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="jom-tag jom-tag-shariah">
                {language === 'ENG' ? 'Portfolio Takeaway' : 'Ringkasan Portfolio'}
              </span>
              <span className="jom-tag">{userProfile}</span>
            </div>
            <h2 className="font-editorial text-2xl pt-1">
              {portfolio.length > 0
                ? language === 'ENG'
                  ? `You have ${portfolio.length} active stock${portfolio.length > 1 ? 's' : ''} worth RM ${formatRM(holdingsValue)}, generating ~RM ${formatRM(annualDividend)}/yr in passive dividends.`
                  : `Anda mempunyai ${portfolio.length} saham aktif bernilai RM ${formatRM(holdingsValue)}, menjana ~RM ${formatRM(annualDividend)}/thn dalam dividen pasif.`
                : language === 'ENG'
                ? `You have RM ${formatRM(cashBalance)} in practice cash ready to build your first Bursa portfolio.`
                : `Anda mempunyai RM ${formatRM(cashBalance)} tunai latihan sedia untuk membina portfolio Bursa pertama anda.`}
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="jom-kicker">
                {language === 'ENG' ? 'Stocks vs. Cash Mix' : 'Campuran Saham vs Tunai'}
              </div>
              <div className="font-tabular text-sm font-semibold">
                {investedPct}% {language === 'ENG' ? 'Stocks' : 'Saham'} · {cashPct}%{' '}
                {language === 'ENG' ? 'Cash' : 'Tunai'}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Allocation Bar */}
        <div
          className="w-full h-2.5 rounded-full overflow-hidden flex"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${investedPct}%`,
              backgroundColor: 'var(--accent-brand)'
            }}
          />
        </div>
      </div>

      {/* 4-Card Summary Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.netLiquidity}</div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(totalNetLiquidity)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {portfolio.length} {language === 'ENG' ? 'companies owned' : 'syarikat dimiliki'} ·{' '}
            {investedPct}% {language === 'ENG' ? 'invested' : 'dilabur'}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="jom-kicker">{t.marketValueHoldings}</span>
            <span
              className={`jom-tag font-tabular ${
                unrealizedPL >= 0 ? 'jom-tag-up' : 'jom-tag-down'
              }`}
            >
              {unrealizedPL >= 0 ? '+' : ''}
              {unrealizedPLPercent.toFixed(2)}%
            </span>
          </div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(holdingsValue)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {t.costBasisLabel}: RM {formatRM(totalCostBasis)} (
            <span
              style={{
                color: unrealizedPL >= 0 ? 'var(--signal-up)' : 'var(--signal-down)'
              }}
            >
              {unrealizedPL >= 0 ? '+' : ''}RM {formatRM(unrealizedPL)}
            </span>
            )
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.buyingPower}</div>
          <div
            className="font-tabular text-2xl font-semibold"
            style={{ color: 'var(--signal-up)' }}
          >
            RM {formatRM(cashBalance)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {cashPct}% {language === 'ENG' ? 'in practice cash wallet' : 'dalam dompet tunai latihan'}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.projDividend}</div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(annualDividend)}
            <span className="text-xs font-normal ml-1" style={{ color: 'var(--ink-muted)' }}>
              {t.perYear}
            </span>
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-secondary)' }}>
            ~RM {formatRM(monthlyDividend)} {t.perMonth} ·{' '}
            {holdingsValue > 0
              ? `${((annualDividend / holdingsValue) * 100).toFixed(2)}% ${
                  language === 'ENG' ? 'avg yield' : 'purata hasil'
                }`
              : '0.00%'}
          </div>
        </div>
      </div>

      {/* Friendly Diversification Coach & Passive Dividend Estimator */}
      <section className="jom-panel p-6 space-y-5">
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <div className="jom-kicker">{t.coachKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.coachTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="jom-tag">{userProfile}</span>
            {sectorData.length > 0 && (
              <span className="jom-tag font-tabular">
                {sectorData.length} {language === 'ENG' ? 'Sectors Owned' : 'Sektor Dimiliki'}
              </span>
            )}
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          {/* Card 1: Diversification Coach */}
          <div className="md:pr-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col1Title}</span>
              <span className={diagnostics.diversificationTagClass}>
                {diagnostics.diversificationTag}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {diagnostics.diversificationText}
            </p>
            {sectorData.length > 0 && (
              <div className="space-y-2 pt-1">
                {sectorData.slice(0, 3).map(sec => (
                  <div key={sec.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-tabular">
                      <span style={{ color: 'var(--ink-secondary)' }}>{sec.name}</span>
                      <span className="font-semibold">{sec.percentage}%</span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sec.percentage}%`,
                          backgroundColor:
                            sec.percentage > 60 ? 'var(--signal-warn)' : 'var(--accent-brand)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Passive Dividend Income Estimator */}
          <div className="md:px-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col2Title}</span>
              <span className="jom-tag jom-tag-up font-tabular">
                {language === 'ENG' ? 'Tax-Exempt Payouts' : 'Dikecualikan Cukai'}
              </span>
            </div>
            <div className="jom-panel-subtle p-3.5 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Estimated Yearly Cash' : 'Anggaran Tunai Tahunan'}
                </span>
                <span
                  className="font-tabular text-lg font-semibold"
                  style={{ color: 'var(--signal-up)' }}
                >
                  RM {formatRM(annualDividend)}/yr
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs font-tabular" style={{ color: 'var(--ink-muted)' }}>
                <span>{language === 'ENG' ? 'Monthly equivalent' : 'Bersamaan bulanan'}</span>
                <span>~RM {formatRM(monthlyDividend)}/mo</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG'
                ? 'Malaysian companies pay single-tier dividends that are 100% tax-free for everyday investors. Holding steady dividend payers builds passive cash flow.'
                : 'Syarikat di Bursa Malaysia membayar dividen satu peringkat yang dikecualikan cukai sepenuhnya untuk pelabur individu.'}
            </p>
          </div>

          {/* Card 3: Shariah & Investor Style Fit */}
          <div className="md:pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col3Title}</span>
              <span className={diagnostics.mandateTagClass}>{diagnostics.mandateTag}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Shariah-Compliant Share' : 'Peratusan Patuh Syariah'}
                </span>
                <span className="font-tabular font-semibold" style={{ color: 'var(--accent-brand)' }}>
                  {diagnostics.shariahPct}%
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${diagnostics.shariahPct}%`,
                    backgroundColor: 'var(--accent-brand)'
                  }}
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {diagnostics.riskText}
            </p>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="jom-panel-subtle p-2.5">
                  <div className="jom-kicker">
                    {language === 'ENG' ? 'Growth Score' : 'Skor Pertumbuhan'}
                  </div>
                  <div className="font-tabular text-sm font-semibold mt-0.5">
                    {diagnostics.avgGrowthScore.toFixed(0)} / 100
                  </div>
                </div>
                <div className="jom-panel-subtle p-2.5">
                  <div className="jom-kicker">
                    {language === 'ENG' ? 'Dividend Score' : 'Skor Dividen'}
                  </div>
                  <div className="font-tabular text-sm font-semibold mt-0.5">
                    {diagnostics.avgDivScore.toFixed(0)} / 100
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Holdings List & Trade History */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="jom-segmented">
            <button
              type="button"
              className={activeTab === 'holdings' ? 'active' : ''}
              onClick={() => setActiveTab('holdings')}
            >
              {t.openPositions} ({portfolio.length})
            </button>
            <button
              type="button"
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              {t.contractNotes} ({tradeHistory.length})
            </button>
          </div>
        </div>

        {activeTab === 'holdings' ? (
          portfolio.length > 0 ? (
            <div className="jom-panel overflow-hidden">
              <div className="jom-table-wrap">
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>{t.colSecurity}</th>
                      <th>{t.colSector}</th>
                      <th className="text-right">{t.colQty}</th>
                      <th className="text-right">{t.colAvgCost}</th>
                      <th className="text-right">{t.colLastPrice}</th>
                      <th className="text-right">{t.colMarketVal}</th>
                      <th className="text-right">{t.colUnrealized}</th>
                      <th className="text-right">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item, idx) => {
                      const stock = item.stock;
                      const currentPrice = parseFloat(stock.price);
                      const marketVal = currentPrice * item.quantity;
                      const profit = (currentPrice - item.averagePrice) * item.quantity;
                      const returnPct =
                        item.averagePrice > 0
                          ? ((currentPrice - item.averagePrice) / item.averagePrice) * 100
                          : 0;
                      const isPositive = profit >= 0;
                      const halfQty = Math.max(1, Math.floor(item.quantity / 2));
                      const monogram = getStockMonogram(stock.ticker, stock.sector);

                      return (
                        <tr
                          key={`${stock.id}-${idx}`}
                          onClick={() => {
                            setSelectedStock(stock);
                            navigateTo('stock-details');
                          }}
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <div className={monogram.avatarClass}>{monogram.initials}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-tabular font-semibold">{stock.ticker}</span>
                                  <span
                                    className="font-tabular text-xs"
                                    style={{ color: 'var(--ink-muted)' }}
                                  >
                                    {stock.bursaCode}
                                  </span>
                                  {stock.isShariah && (
                                    <span className="jom-tag jom-tag-shariah">Shariah</span>
                                  )}
                                </div>
                                <div
                                  className="text-xs mt-0.5 flex items-center gap-1"
                                  style={{ color: 'var(--ink-secondary)' }}
                                >
                                  <span>{stock.name}</span>
                                  <ArrowUpRight size={11} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="jom-tag">{stock.sector}</span>
                          </td>
                          <td className="text-right font-tabular">
                            <div className="font-semibold">{item.quantity.toLocaleString()} sh</div>
                            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                              {(item.quantity / 100).toFixed(1)} lots
                            </div>
                          </td>
                          <td className="text-right font-tabular">
                            RM {formatRM(item.averagePrice)}
                          </td>
                          <td className="text-right font-tabular">
                            RM {formatRM(currentPrice)}
                          </td>
                          <td className="text-right font-tabular font-semibold">
                            RM {formatRM(marketVal)}
                          </td>
                          <td className="text-right font-tabular">
                            <div
                              className="font-semibold"
                              style={{
                                color: isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                              }}
                            >
                              {isPositive ? '+' : ''}RM {formatRM(profit)}
                            </div>
                            <div className="mt-0.5">
                              <span
                                className={`jom-tag font-tabular ${
                                  isPositive ? 'jom-tag-up' : 'jom-tag-down'
                                }`}
                              >
                                {isPositive ? '+' : ''}
                                {returnPct.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td
                            className="text-right"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {item.quantity > 1 && (
                                <button
                                  type="button"
                                  className="jom-btn py-1 px-2.5 text-xs font-tabular"
                                  onClick={e => {
                                    e.stopPropagation();
                                    sellFromPortfolio(stock, halfQty);
                                  }}
                                >
                                  {t.trimHalf} ({halfQty})
                                </button>
                              )}
                              <button
                                type="button"
                                className="jom-btn jom-btn-danger py-1 px-2.5 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  removeFromPortfolio(stock);
                                }}
                              >
                                {t.closePos}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="jom-panel p-12 text-center space-y-4">
              <div className="jom-kicker">
                {language === 'ENG' ? 'Ready for Your First Trade' : 'Sedia Untuk Dagangan Pertama'}
              </div>
              <h3 className="font-editorial text-2xl">{t.emptyHoldingsTitle}</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--ink-secondary)' }}>
                {t.emptyHoldingsDesc}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="jom-btn jom-btn-primary"
                >
                  {t.exploreMarket}
                </button>
              </div>
            </div>
          )
        ) : tradeHistory.length > 0 ? (
          <div className="jom-panel overflow-hidden">
            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>{t.colSide}</th>
                    <th>{t.colSecurity}</th>
                    <th className="text-right">{t.colQty}</th>
                    <th className="text-right">{t.colExecPrice}</th>
                    <th className="text-right">{t.colFees}</th>
                    <th className="text-right">{t.colNetSettlement}</th>
                    <th className="text-right">{t.colTimestamp}</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map(trade => {
                    const monogram = getStockMonogram(trade.ticker);
                    return (
                      <tr key={trade.id} style={{ cursor: 'default' }}>
                        <td>
                          <span
                            className={`jom-tag font-tabular ${
                              trade.type === 'BUY' ? 'jom-tag-up' : 'jom-tag-warn'
                            }`}
                          >
                            {trade.type === 'BUY'
                              ? language === 'ENG'
                                ? 'Bought'
                                : 'Beli'
                              : language === 'ENG'
                              ? 'Sold'
                              : 'Jual'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={monogram.avatarClass}>{monogram.initials}</div>
                            <div>
                              <div className="font-tabular font-semibold">{trade.ticker}</div>
                              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                                {trade.stockName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-tabular">
                          {trade.quantity.toLocaleString()} sh
                        </td>
                        <td className="text-right font-tabular">
                          RM {formatRM(trade.pricePerShare)}
                        </td>
                        <td
                          className="text-right font-tabular"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          RM {formatRM(trade.totalFees)}
                        </td>
                        <td
                          className="text-right font-tabular font-semibold"
                          style={{
                            color:
                              trade.type === 'BUY' ? 'var(--ink-primary)' : 'var(--signal-up)'
                          }}
                        >
                          {trade.type === 'BUY' ? '-' : '+'}RM {formatRM(trade.netAmount)}
                        </td>
                        <td
                          className="text-right font-tabular text-xs"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {trade.timestamp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="jom-panel p-12 text-center space-y-3">
            <div className="jom-kicker">
              {language === 'ENG' ? 'Practice Trade Receipts' : 'Resit Dagangan Latihan'}
            </div>
            <h3 className="font-editorial text-2xl">{t.emptyHistoryTitle}</h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--ink-secondary)' }}>
              {t.emptyHistoryDesc}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
