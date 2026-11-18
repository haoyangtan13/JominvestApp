import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
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

function getOverallScore(stock: StockData): number {
  const scores = stock.radarScores;
  if (!scores) return 75;
  return Math.round(
    (scores.value + scores.growth + scores.health + scores.dividend + scores.momentum) / 5
  );
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

  if (!activeStock) {
    return <div className="rh-page">Loading starter picks...</div>;
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
      label: language === 'ENG' ? 'Dividends' : 'Dividen',
      score: activeStock.radarScores?.dividend ?? 70
    },
    {
      label: language === 'ENG' ? 'Momentum' : 'Momentum',
      score: activeStock.radarScores?.momentum ?? 75
    }
  ];

  const activeMonogram = getCompanyMonogram(activeStock.ticker);
  const activeAvatarColor = getAvatarColorClass(activeStock.sector, activeStock.ticker);

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Column (.rh-main): List of 3 Suggested Stocks */}
        <div className="rh-main space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>
              {language === 'ENG'
                ? 'Suggested Starter Stocks'
                : 'Cadangan Saham Permulaan'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG'
                ? `Matched to your ${userProfile || 'Balanced'} investor profile on Bursa Malaysia.`
                : `Dipadankan dengan profil pelabur ${userProfile || 'Seimbang'} anda di Bursa Malaysia.`}
            </p>
          </div>

          <div className="space-y-3">
            {profilePicks.map(pick => {
              const isSelected = pick.id === activeStock.id;
              const monogram = getCompanyMonogram(pick.ticker);
              const avatarColor = getAvatarColorClass(pick.sector, pick.ticker);
              const overallScore = getOverallScore(pick);

              const plainReason =
                language === 'ENG'
                  ? `RM ${pick.marketCap} ${pick.sector.toLowerCase()} leader trading at ${pick.peRatio}x earnings with a ${pick.dividendYield} dividend yield.`
                  : `Peneraju ${pick.sector.toLowerCase()} bernilai RM ${pick.marketCap} pada P/E ${pick.peRatio}x dengan hasil dividen ${pick.dividendYield}.`;

              return (
                <button
                  key={pick.id}
                  type="button"
                  onClick={() => setSelectedStock(pick)}
                  className="rh-card w-full text-left cursor-pointer transition-all space-y-3"
                  style={{
                    borderColor: isSelected ? 'var(--accent-brand)' : 'var(--border-hairline)'
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`jom-avatar ${avatarColor}`}>{monogram}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-base truncate" style={{ color: 'var(--ink-primary)' }}>
                          {pick.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {pick.ticker} · {pick.bursaCode} · {pick.sector}
                          {pick.isShariah ? ' · Shariah' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-tabular">
                      <div className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>
                        RM {pick.price}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: pick.isPositive ? 'var(--signal-up)' : 'var(--signal-down)' }}
                      >
                        {pick.changePercent}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                    {plainReason}
                  </p>

                  <div
                    className="flex items-center justify-between pt-2 border-t text-xs font-tabular"
                    style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-muted)' }}
                  >
                    <span>
                      {language === 'ENG' ? '5-Factor Health Score' : 'Skor Kesihatan 5-Faktor'}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--accent-brand)' }}>
                      {overallScore} / 100
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Sticky Rail (.rh-rail): Selected Stock Breakdown + Actions */}
        <aside className="rh-rail space-y-4">
          <div className="rh-card space-y-4">
            <div className="flex items-center gap-3">
              <div className={`jom-avatar jom-avatar-lg ${activeAvatarColor}`}>
                {activeMonogram}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
                  {activeStock.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {activeStock.ticker} · {activeStock.bursaCode}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG'
                ? `${activeStock.name} generates RM ${activeStock.revenue} in annual revenue and RM ${activeStock.netProfit} in net profit, with a ${activeStock.dividendYield} dividend yield and ${activeStock.debtEquity} debt-to-equity.`
                : `${activeStock.name} menjana hasil tahunan RM ${activeStock.revenue} dan untung bersih RM ${activeStock.netProfit}, dengan hasil dividen ${activeStock.dividendYield}.`}
            </p>

            <div
              className="space-y-2.5 pt-3 border-t"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {radarList.map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--ink-secondary)' }}>{item.label}</span>
                    <span className="font-tabular font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      {item.score}/100
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
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

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => addToPortfolio(activeStock, 100)}
                className="jom-btn jom-btn-primary w-full"
              >
                {language === 'ENG'
                  ? 'Quick Practice Buy (100 shares)'
                  : 'Latihan Beli Pantas (100 saham)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStock(activeStock);
                  navigateTo('stock-details');
                }}
                className="jom-btn w-full"
              >
                <span>
                  {language === 'ENG' ? 'Open Stock Page' : 'Buka Halaman Saham'}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
