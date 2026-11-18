import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
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

export function AIRecommendation({
  navigateTo,
  userProfile,
  language,
  stocks,
  selectedStock,
  setSelectedStock,
  addToPortfolio
}: AIRecommendationProps) {
  const profilePicks = useMemo(() => {
    const profileLower = (userProfile || '').toLowerCase();
    let targetTickers: string[];

    if (profileLower.includes('conservative') || profileLower.includes('protector')) {
      targetTickers = ['MAYBANK', 'PBBANK', 'TENAGA'];
    } else if (profileLower.includes('moderate') || profileLower.includes('builder')) {
      targetTickers = ['CIMB', 'MISC', 'TM'];
    } else {
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
      kicker: 'Tailored to your risk comfort & learning style',
      title: 'Your Personalised Bursa Starter Picks',
      back: 'Back to Explore',
      topPicksForProfile: 'Top 3 companies matched to your investor profile',
      currentPrice: 'Share Price',
      change24h: 'Today’s Move',
      pe: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Company Size',
      shariah: 'Shariah Screening',
      thesisKicker: 'Why this stock fits your starter journey',
      whyRecommend: `In Plain English: Why ${activeStock?.name || ''} (${activeStock?.bursaCode || ''})`,
      reason1Tag: 'Business Strength',
      reason1Title: 'Proven Malaysian Market Leader',
      reason1desc: `${activeStock?.name} is a RM ${activeStock?.marketCap} leader in Malaysia's ${activeStock?.sector} sector, bringing in RM ${activeStock?.revenue} in annual sales and RM ${activeStock?.netProfit} in net profit with a manageable ${activeStock?.debtEquity} debt-to-equity ratio.`,
      reason2Tag: 'Income & Value',
      reason2Title: 'Fair Price & Cash Dividends',
      reason2desc: `Trades at ${activeStock?.peRatio}x annual earnings and pays a ${activeStock?.dividendYield} dividend yield. ${
        activeStock?.isShariah
          ? 'Approved as Shariah-compliant by the Securities Commission Malaysia.'
          : 'Listed as a Conventional stock on Bursa Malaysia Main Market.'
      }`,
      reason3Tag: 'Profile Match',
      reason3Title: 'Fits Your Comfort Level',
      reason3desc: `Matched to your ${
        userProfile || 'Balanced Growth'
      } profile thanks to a Financial Health score of ${
        activeStock?.radarScores?.health ?? 80
      }/100 and a Price Momentum score of ${activeStock?.radarScores?.momentum ?? 75}/100.`,
      factorKicker: '5-factor health snapshot out of 100',
      factorTitle: 'At-a-Glance Health Scores',
      add1Lot: 'Practice Buy 1 Standard Lot (100 shares)',
      add10Units: 'Practice Buy 10 Starter Shares',
      viewDetails: 'Explore Full Company Page'
    },
    BM: {
      kicker: 'Disesuaikan mengikut tahap keselesaan risiko & gaya pembelajaran anda',
      title: 'Pilihan Permulaan Bursa Peribadi Anda',
      back: 'Kembali ke Teroka',
      topPicksForProfile: '3 syarikat utama yang sepadan dengan profil pelabur anda',
      currentPrice: 'Harga Saham',
      change24h: 'Perubahan Hari Ini',
      pe: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Saiz Syarikat',
      shariah: 'Saringan Syariah',
      thesisKicker: 'Mengapa saham ini sesuai untuk permulaan anda',
      whyRecommend: `Bahasa Mudah: Mengapa ${activeStock?.name || ''} (${activeStock?.bursaCode || ''})`,
      reason1Tag: 'Kekuatan Perniagaan',
      reason1Title: 'Peneraju Pasaran Malaysia Yang Kukuh',
      reason1desc: `${activeStock?.name} ialah peneraju bernilai RM ${activeStock?.marketCap} dalam sektor ${activeStock?.sector} Malaysia, menjana jualan tahunan RM ${activeStock?.revenue} dan untung bersih RM ${activeStock?.netProfit} dengan nisbah hutang-ke-ekuiti ${activeStock?.debtEquity}.`,
      reason2Tag: 'Pendapatan & Nilai',
      reason2Title: 'Harga Berpatutan & Dividen Tunai',
      reason2desc: `Didagangkan pada gandaan P/E ${activeStock?.peRatio}x dengan hasil dividen tahunan ${activeStock?.dividendYield}. ${
        activeStock?.isShariah
          ? 'Diiktiraf Patuh Syariah oleh Suruhanjaya Sekuriti Malaysia.'
          : 'Disenaraikan sebagai saham Konvensional di Pasaran Utama Bursa Malaysia.'
      }`,
      reason3Tag: 'Padanan Profil',
      reason3Title: 'Sesuai Dengan Tahap Risiko Anda',
      reason3desc: `Dipadankan dengan profil ${
        userProfile || 'Pertumbuhan Seimbang'
      } anda berdasarkan skor Kesihatan Kewangan ${
        activeStock?.radarScores?.health ?? 80
      }/100 dan Momentum Harga ${activeStock?.radarScores?.momentum ?? 75}/100.`,
      factorKicker: 'Gambaran kesihatan 5 faktor daripada 100',
      factorTitle: 'Skor Kesihatan Sepintas Lalu',
      add1Lot: 'Latihan Beli 1 Lot Standard (100 saham)',
      add10Units: 'Latihan Beli 10 Saham Permulaan',
      viewDetails: 'Teroka Halaman Penuh Syarikat'
    }
  };

  const t = texts[language];

  if (!activeStock) {
    return <div className="jom-container">Loading personalised starter picks...</div>;
  }

  const radarList = [
    {
      label: language === 'ENG' ? 'Valuation' : 'Penilaian',
      score: activeStock.radarScores?.value ?? 75
    },
    {
      label: language === 'ENG' ? 'Growth' : 'Pertumbuhan',
      score: activeStock.radarScores?.growth ?? 75
    },
    {
      label: language === 'ENG' ? 'Financial Health' : 'Kesihatan Kewangan',
      score: activeStock.radarScores?.health ?? 80
    },
    {
      label: language === 'ENG' ? 'Dividend Income' : 'Pendapatan Dividen',
      score: activeStock.radarScores?.dividend ?? 70
    },
    {
      label: language === 'ENG' ? 'Price Momentum' : 'Momentum Harga',
      score: activeStock.radarScores?.momentum ?? 75
    }
  ];

  const activeMonogram = getCompanyMonogram(activeStock.ticker);
  const activeAvatarColor = getAvatarColorClass(activeStock.sector, activeStock.ticker);

  return (
    <div className="jom-container space-y-8">
      {/* Friendly Consumer Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="jom-kicker flex items-center gap-1.5">
            <Sparkles size={13} style={{ color: 'var(--accent-brand)' }} />
            <span>{t.kicker}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl" style={{ color: 'var(--ink-primary)' }}>
            {t.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="jom-tag jom-tag-shariah">
            <CheckCircle2 size={12} />
            <span>{userProfile || 'Beginner Friendly'}</span>
          </span>
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="jom-btn text-xs"
          >
            <ArrowLeft size={14} />
            <span>{t.back}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Personalised Stock Cards with Company Monograms */}
      <div className="space-y-3">
        <div className="jom-kicker">{t.topPicksForProfile}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profilePicks.map(pick => {
            const isSelected = pick.id === activeStock.id;
            const monogram = getCompanyMonogram(pick.ticker);
            const avatarColor = getAvatarColorClass(pick.sector, pick.ticker);

            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => setSelectedStock(pick)}
                className="jom-panel p-4 text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
                style={{
                  borderColor: isSelected ? 'var(--accent-brand)' : 'var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`jom-avatar ${avatarColor}`}>{monogram}</div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-tabular text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                        {pick.ticker}
                      </span>
                      {pick.isShariah ? (
                        <span className="jom-tag jom-tag-shariah">Shariah</span>
                      ) : (
                        <span className="jom-tag">Conventional</span>
                      )}
                    </div>
                    <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--ink-secondary)' }}>
                      {pick.name}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-tabular text-sm font-semibold">RM {pick.price}</div>
                  <span
                    className={`jom-tag font-tabular mt-1 ${
                      pick.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                    }`}
                  >
                    {pick.changePercent}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stock Key Snapshot Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.currentPrice}</div>
          <div className="font-tabular text-2xl font-bold">RM {activeStock.price}</div>
          <div className="text-xs font-tabular" style={{ color: 'var(--ink-muted)' }}>
            {activeStock.ticker} · {activeStock.bursaCode}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.change24h}</div>
          <div
            className="font-tabular text-2xl font-bold"
            style={{ color: activeStock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
          >
            {activeStock.changePercent}
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {activeStock.sector}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.pe} & {t.dividend}</div>
          <div className="font-tabular text-2xl font-bold">
            {activeStock.peRatio}x · {activeStock.dividendYield}
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {t.marketCap}: RM {activeStock.marketCap}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.shariah}</div>
          <div className="pt-1">
            {activeStock.isShariah ? (
              <span className="jom-tag jom-tag-shariah">
                <ShieldCheck size={12} />
                <span>Shariah-Compliant</span>
              </span>
            ) : (
              <span className="jom-tag">Conventional</span>
            )}
          </div>
          <div className="text-xs pt-1" style={{ color: 'var(--ink-muted)' }}>
            Securities Commission Malaysia
          </div>
        </div>
      </div>

      {/* 3 Plain-English Reasons Card */}
      <div className="jom-hero-verdict p-6 space-y-6">
        <div
          className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex items-center gap-3.5">
            <div className={`jom-avatar jom-avatar-lg ${activeAvatarColor}`}>
              {activeMonogram}
            </div>
            <div>
              <div className="jom-kicker">{t.thesisKicker}</div>
              <h2 className="font-editorial text-2xl sm:text-3xl mt-0.5" style={{ color: 'var(--ink-primary)' }}>
                {t.whyRecommend}
              </h2>
            </div>
          </div>
          <span className="jom-tag jom-tag-shariah">Starter Pick Guide</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="jom-panel p-5 space-y-2">
            <span className="jom-tag">{t.reason1Tag}</span>
            <h3 className="font-semibold text-sm pt-1" style={{ color: 'var(--ink-primary)' }}>
              {t.reason1Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason1desc}
            </p>
          </div>

          <div className="jom-panel p-5 space-y-2">
            <span className="jom-tag">{t.reason2Tag}</span>
            <h3 className="font-semibold text-sm pt-1" style={{ color: 'var(--ink-primary)' }}>
              {t.reason2Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason2desc}
            </p>
          </div>

          <div className="jom-panel p-5 space-y-2">
            <span className="jom-tag jom-tag-shariah">{t.reason3Tag}</span>
            <h3 className="font-semibold text-sm pt-1" style={{ color: 'var(--ink-primary)' }}>
              {t.reason3Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason3desc}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Factor Health Snapshot */}
      <div className="jom-panel p-6 space-y-5">
        <div>
          <div className="jom-kicker">{t.factorKicker}</div>
          <h3 className="font-editorial text-2xl mt-0.5">{t.factorTitle}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {radarList.map(item => (
            <div key={item.label} className="jom-panel-subtle p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="jom-kicker">{item.label}</span>
                <span className="font-tabular text-sm font-semibold">{item.score}/100</span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.score}%`, backgroundColor: 'var(--accent-brand)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Trade & Full Company Page Action Bar */}
      <div className="jom-panel p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addToPortfolio(activeStock, 100)}
            className="jom-btn jom-btn-primary"
          >
            {t.add1Lot}
          </button>
          <button
            type="button"
            onClick={() => addToPortfolio(activeStock, 10)}
            className="jom-btn"
          >
            {t.add10Units}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedStock(activeStock);
            navigateTo('stock-details');
          }}
          className="jom-btn jom-btn-inverse"
        >
          <span>{t.viewDetails}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
