import { useState, useMemo } from 'react';
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

type ScreenPreset = 'profile' | 'dividend' | 'value' | 'shariah';

export function AIRecommendation({
  navigateTo,
  userProfile,
  language,
  stocks,
  selectedStock,
  setSelectedStock,
  addToPortfolio
}: AIRecommendationProps) {
  const [preset, setPreset] = useState<ScreenPreset>('profile');

  const screenedStocks = useMemo(() => {
    const list = [...stocks];

    if (preset === 'dividend') {
      return list.sort((a, b) => {
        const ya = parseFloat(a.dividendYield.replace('%', '')) || 0;
        const yb = parseFloat(b.dividendYield.replace('%', '')) || 0;
        return yb - ya;
      });
    }

    if (preset === 'value') {
      return list.sort((a, b) => {
        const pa = parseFloat(a.peRatio) || 99;
        const pb = parseFloat(b.peRatio) || 99;
        return pa - pb;
      });
    }

    if (preset === 'shariah') {
      return list.filter(s => s.isShariah);
    }

    // Default: matched to investor profile
    const profileLower = (userProfile || '').toLowerCase();
    const priority =
      profileLower.includes('conservative') || profileLower.includes('protector')
        ? ['MAYBANK', 'PBBANK', 'TENAGA', 'PETGAS', 'MISC']
        : profileLower.includes('moderate') || profileLower.includes('builder')
        ? ['CIMB', 'TENAGA', 'TM', 'SUNWAY', 'MAYBANK']
        : ['GAMUDA', 'YTLPOWR', 'INARI', 'SUNWAY', 'CIMB'];

    return list.sort((a, b) => {
      const ia = priority.indexOf(a.ticker);
      const ib = priority.indexOf(b.ticker);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    });
  }, [stocks, preset, userProfile]);

  const activeStock = selectedStock || screenedStocks[0] || stocks[0];

  if (!activeStock) {
    return <div className="rh-page">Loading...</div>;
  }

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Column: Screener Table */}
        <div className="rh-main space-y-6">
          <div>
            <h1 className="text-xl font-semibold">
              {language === 'ENG' ? 'Stock Screener' : 'Saringan Saham'}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG'
                ? `Showing companies ranked for ${userProfile || 'Balanced'} investors.`
                : `Menunjukkan syarikat disusun untuk profil ${userProfile || 'Seimbang'}.`}
            </p>
          </div>

          {/* Preset Filter Tabs */}
          <div className="rh-tabs">
            <button
              type="button"
              onClick={() => setPreset('profile')}
              className={`rh-tab ${preset === 'profile' ? 'active' : ''}`}
            >
              {language === 'ENG' ? 'Matched to Profile' : 'Ikut Profil'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('dividend')}
              className={`rh-tab ${preset === 'dividend' ? 'active' : ''}`}
            >
              {language === 'ENG' ? 'Highest Yield' : 'Dividen Tertinggi'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('value')}
              className={`rh-tab ${preset === 'value' ? 'active' : ''}`}
            >
              {language === 'ENG' ? 'Lowest P/E' : 'P/E Terendah'}
            </button>
            <button
              type="button"
              onClick={() => setPreset('shariah')}
              className={`rh-tab ${preset === 'shariah' ? 'active' : ''}`}
            >
              {language === 'ENG' ? 'Shariah Only' : 'Patuh Syariah'}
            </button>
          </div>

          <div className="jom-table-wrap">
            <table className="jom-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="hidden sm:table-cell">Sector</th>
                  <th className="text-right">P/E</th>
                  <th className="text-right">Div Yield</th>
                  <th className="text-right hidden md:table-cell">Mkt Cap</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Today</th>
                </tr>
              </thead>
              <tbody>
                {screenedStocks.map(stock => {
                  const isSelected = stock.id === activeStock.id;
                  return (
                    <tr
                      key={stock.id}
                      onClick={() => setSelectedStock(stock)}
                      style={{
                        backgroundColor: isSelected ? 'var(--bg-subtle)' : undefined
                      }}
                    >
                      <td>
                        <div className="font-medium text-sm">{stock.ticker}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {stock.name}
                          {stock.isShariah ? ' · Shariah' : ''}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell text-xs" style={{ color: 'var(--ink-secondary)' }}>
                        {stock.sector}
                      </td>
                      <td className="text-right font-tabular text-xs">{stock.peRatio}x</td>
                      <td className="text-right font-tabular text-xs">{stock.dividendYield}</td>
                      <td className="text-right font-tabular text-xs hidden md:table-cell" style={{ color: 'var(--ink-secondary)' }}>
                        RM {stock.marketCap}
                      </td>
                      <td className="text-right font-tabular text-sm font-medium">
                        RM {stock.price}
                      </td>
                      <td
                        className="text-right font-tabular text-xs font-medium"
                        style={{
                          color: stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                        }}
                      >
                        {stock.changePercent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sticky Summary */}
        <aside className="rh-rail space-y-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">{activeStock.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {activeStock.ticker} · {activeStock.bursaCode} · {activeStock.sector}
              </p>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {activeStock.description}
            </p>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Share Price</span>
                <span className="font-tabular font-medium">RM {activeStock.price}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>P/E Ratio</span>
                <span className="font-tabular font-medium">{activeStock.peRatio}x</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Dividend Yield</span>
                <span className="font-tabular font-medium">{activeStock.dividendYield}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Annual Revenue</span>
                <span className="font-tabular font-medium">RM {activeStock.revenue}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Net Profit</span>
                <span className="font-tabular font-medium">RM {activeStock.netProfit}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Debt / Equity</span>
                <span className="font-tabular font-medium">{activeStock.debtEquity}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => addToPortfolio(activeStock, 100)}
                className="jom-btn jom-btn-primary w-full py-2.5"
              >
                {language === 'ENG'
                  ? `Buy 100 ${activeStock.ticker} (1 Lot)`
                  : `Beli 100 ${activeStock.ticker} (1 Lot)`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStock(activeStock);
                  navigateTo('stock-details');
                }}
                className="jom-btn w-full"
              >
                {language === 'ENG' ? 'Full Company Overview →' : 'Gambaran Penuh Syarikat →'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
