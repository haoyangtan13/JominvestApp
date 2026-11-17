import { useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
      kicker: 'RESEARCH DESK · MANDATE CONVICTION NOTES',
      title: 'Institutional Conviction Memorandum',
      back: '← Market Screener',
      topPicksForProfile: 'MANDATE-CALIBRATED SELECTION',
      currentPrice: 'Last Traded Price',
      change24h: '24h Session Change',
      pe: 'P/E Multiple',
      dividend: 'Trailing Dividend Yield',
      marketCap: 'Market Capitalization',
      shariah: 'Regulatory Screening',
      thesisKicker: 'INVESTMENT THESIS & CATALYSTS',
      whyRecommend: `Analytical Thesis — ${activeStock?.name || ''} (${activeStock?.bursaCode || ''})`,
      reason1Code: '01 · BALANCE SHEET &EARNINGS SCALE',
      reason1Title: 'Fundamental & Financial Strength',
      reason1desc: `${activeStock?.name} commands a RM ${activeStock?.marketCap} market capitalization in the Malaysian ${activeStock?.sector} sector, generating RM ${activeStock?.revenue} in annual revenue and RM ${activeStock?.netProfit} in net earnings with a ${activeStock?.debtEquity} debt-to-equity ratio.`,
      reason2Code: '02 · VALUATION & DISTRIBUTION PROFILE',
      reason2Title: 'Valuation Multiple & Cash Yield',
      reason2desc: `Currently trading at ${activeStock?.peRatio}x earnings with an indicated dividend yield of ${activeStock?.dividendYield}. Classified as ${
        activeStock?.isShariah
          ? 'SAC Shariah-Compliant by the Securities Commission of Malaysia'
          : 'Conventional Main Market Equity'
      }.`,
      reason3Code: '03 · MANDATE ALIGNMENT',
      reason3Title: 'Calibrated to Your Investor Mandate',
      reason3desc: `Selected for the ${
        userProfile || 'Jom-Explorer (Aggressive)'
      } mandate based on a quantitative Momentum rating of ${
        activeStock?.radarScores?.momentum ?? 75
      }/100 and Balance Sheet Health score of ${activeStock?.radarScores?.health ?? 80}/100.`,
      factorKicker: 'QUANTITATIVE 5-AXIS SCORECARD',
      factorTitle: 'Multi-Factor Fundamental Breakdown',
      add1Lot: 'Execute 1 Board Lot (100 sh)',
      add10Units: 'Execute Micro Order (10 sh)',
      viewDetails: 'Open Equity Terminal →'
    },
    BM: {
      kicker: 'MEJA PENYELIDIKAN · NOTA KONVIKSI MANDAT',
      title: 'Memorandum Konviksi Institusi',
      back: '← Saringan Pasaran',
      topPicksForProfile: 'PILIHAN DISESUAIKAN MENGIKUT MANDAT',
      currentPrice: 'Harga Dagangan Terakhir',
      change24h: 'Perubahan Sesi 24j',
      pe: 'Gandaan P/E',
      dividend: 'Hasil Dividen Semasa',
      marketCap: 'Modal Pasaran',
      shariah: 'Saringan Kawal Selia',
      thesisKicker: 'TESIS PELABURAN & PEMANGKIN',
      whyRecommend: `Tesis Analisis — ${activeStock?.name || ''} (${activeStock?.bursaCode || ''})`,
      reason1Code: '01 · SKALA KUNCI KIRA-KIRA & PENDAPATAN',
      reason1Title: 'Kekuatan Asas & Kewangan',
      reason1desc: `${activeStock?.name} mempunyai modal pasaran RM ${activeStock?.marketCap} dalam sektor ${activeStock?.sector} Malaysia, menjana hasil tahunan RM ${activeStock?.revenue} dan untung bersih RM ${activeStock?.netProfit} dengan nisbah hutang-ke-ekuiti ${activeStock?.debtEquity}.`,
      reason2Code: '02 · PROFIL PENILAIAN & AGIHAN',
      reason2Title: 'Gandaan Penilaian & Hasil Tunai',
      reason2desc: `Didagangkan pada gandaan P/E ${activeStock?.peRatio}x dengan hasil dividen tahunan ${activeStock?.dividendYield}. Diklasifikasikan sebagai ${
        activeStock?.isShariah
          ? 'Patuh Syariah MPS oleh Suruhanjaya Sekuriti Malaysia'
          : 'Ekuiti Konvensional Pasaran Utama'
      }.`,
      reason3Code: '03 · KESELARASAN MANDAT',
      reason3Title: 'Disesuaikan Dengan Mandat Pelabur Anda',
      reason3desc: `Dipilih untuk mandat ${
        userProfile || 'Jom-Explorer (Aggressive)'
      } berdasarkan skor Momentum kuantitatif ${
        activeStock?.radarScores?.momentum ?? 75
      }/100 dan Kesihatan Kunci Kira-kira ${activeStock?.radarScores?.health ?? 80}/100.`,
      factorKicker: 'KAD SKOR KUANTITATIF 5-PAKSI',
      factorTitle: 'Pecahan Asas Pelbagai Faktor',
      add1Lot: 'Beli 1 Lot Papan (100 sh)',
      add10Units: 'Beli Pesanan Mikro (10 sh)',
      viewDetails: 'Buka Terminal Ekuiti →'
    }
  };

  const t = texts[language];

  if (!activeStock) {
    return <div className="jom-container">Loading research memorandum...</div>;
  }

  const radarList = [
    { label: 'Value', score: activeStock.radarScores?.value ?? 75 },
    { label: 'Growth', score: activeStock.radarScores?.growth ?? 75 },
    { label: 'Health', score: activeStock.radarScores?.health ?? 80 },
    { label: 'Dividend', score: activeStock.radarScores?.dividend ?? 70 },
    { label: 'Momentum', score: activeStock.radarScores?.momentum ?? 75 }
  ];

  return (
    <div className="jom-container space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-4xl" style={{ color: 'var(--ink-primary)' }}>
            {t.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="jom-tag">{userProfile}</span>
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

      {/* Top 3 Profile Conviction Switcher */}
      <div className="space-y-3">
        <div className="jom-kicker">{t.topPicksForProfile}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profilePicks.map((pick, idx) => {
            const isSelected = pick.id === activeStock.id;
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => setSelectedStock(pick)}
                className="jom-panel p-4 text-left transition-all flex items-center justify-between cursor-pointer"
                style={{
                  borderColor: isSelected ? 'var(--ink-primary)' : 'var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                      0{idx + 1}
                    </span>
                    <span className="font-tabular text-sm font-semibold">{pick.ticker}</span>
                    {pick.isShariah ? (
                      <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                    ) : (
                      <span className="jom-tag">CONVENTIONAL</span>
                    )}
                  </div>
                  <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--ink-secondary)' }}>
                    {pick.name}
                  </p>
                </div>

                <div className="text-right">
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

      {/* Active Security Ledger Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.currentPrice}</div>
          <div className="font-tabular text-2xl font-semibold">RM {activeStock.price}</div>
          <div className="text-xs font-tabular" style={{ color: 'var(--ink-muted)' }}>
            {activeStock.ticker} · {activeStock.bursaCode}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.change24h}</div>
          <div
            className="font-tabular text-2xl font-semibold"
            style={{ color: activeStock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
          >
            {activeStock.changePercent}
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {activeStock.sector}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1">
          <div className="jom-kicker">{t.pe} / {t.dividend}</div>
          <div className="font-tabular text-2xl font-semibold">
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
              <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
            ) : (
              <span className="jom-tag">CONVENTIONAL</span>
            )}
          </div>
          <div className="text-xs pt-1" style={{ color: 'var(--ink-muted)' }}>
            SC Malaysia Classification
          </div>
        </div>
      </div>

      {/* 3-Pillar Research Memorandum */}
      <div className="jom-panel p-6 space-y-6">
        <div
          className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <div className="jom-kicker">{t.thesisKicker}</div>
            <h2 className="font-editorial text-3xl mt-0.5">{t.whyRecommend}</h2>
          </div>
          <span className="jom-tag">CONVICTION NOTE</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="jom-panel-subtle p-5 space-y-2">
            <div className="jom-kicker">{t.reason1Code}</div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>
              {t.reason1Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason1desc}
            </p>
          </div>

          <div className="jom-panel-subtle p-5 space-y-2">
            <div className="jom-kicker">{t.reason2Code}</div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>
              {t.reason2Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason2desc}
            </p>
          </div>

          <div className="jom-panel-subtle p-5 space-y-2">
            <div className="jom-kicker">{t.reason3Code}</div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>
              {t.reason3Title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.reason3desc}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Axis Quantitative Factor Scorecard */}
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
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${item.score}%`, backgroundColor: 'var(--accent-brand)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution & Terminal Navigation Bar */}
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
