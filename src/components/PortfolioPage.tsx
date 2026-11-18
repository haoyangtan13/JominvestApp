import { useMemo } from 'react';
import { Plus } from 'lucide-react';
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
  const texts = {
    ENG: {
      totalPortfolioLabel: 'Total Portfolio Value',
      investedStocksLabel: 'Invested Stocks',
      availableCashLabel: 'Available Cash',
      holdingsTitle: 'Holdings',
      recentOrdersTitle: 'Recent Orders',
      sellHalfBtn: 'Sell Half',
      sellBtn: 'Sell',
      emptyHoldingsTitle: 'No stocks in your portfolio yet',
      emptyHoldingsDesc:
        'Use your practice cash to buy shares in Malaysian companies and track your gains and dividends here.',
      exploreMarket: 'Explore Stocks',
      emptyHistoryText: 'Your practice buy and sell orders will appear here.',
      cashDividendsTitle: 'Cash & Dividends',
      topUpBtn: '+ Add RM 5,000 Practice Cash',
      annualDivLabel: 'Estimated Annual Dividends',
      monthlyDivLabel: 'Monthly Equivalent',
      balanceCheckTitle: 'Portfolio Balance Check',
      sectorConcentrationLabel: 'Sector Concentration',
      shariahShareLabel: 'Shariah-Compliant Share'
    },
    BM: {
      totalPortfolioLabel: 'Jumlah Nilai Portfolio',
      investedStocksLabel: 'Saham Dilabur',
      availableCashLabel: 'Tunai Tersedia',
      holdingsTitle: 'Pegangan Saham',
      recentOrdersTitle: 'Pesanan Terkini',
      sellHalfBtn: 'Jual Separuh',
      sellBtn: 'Jual',
      emptyHoldingsTitle: 'Belum ada saham dalam portfolio anda',
      emptyHoldingsDesc:
        'Gunakan tunai latihan anda untuk membeli saham syarikat Malaysia dan jejak pulangan serta dividen di sini.',
      exploreMarket: 'Teroka Saham',
      emptyHistoryText: 'Rekod pesanan belian dan jualan latihan anda akan dipaparkan di sini.',
      cashDividendsTitle: 'Tunai & Dividen',
      topUpBtn: '+ Tambah RM 5,000 Tunai Latihan',
      annualDivLabel: 'Anggaran Dividen Tahunan',
      monthlyDivLabel: 'Bersamaan Bulanan',
      balanceCheckTitle: 'Semakan Imbangan Portfolio',
      sectorConcentrationLabel: 'Tumpuan Sektor',
      shariahShareLabel: 'Peratusan Patuh Syariah'
    }
  };

  const t = texts[language];

  const holdingsValue = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + parseFloat(item.stock.price) * item.quantity, 0);
  }, [portfolio]);

  const totalCostBasis = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + item.averagePrice * item.quantity, 0);
  }, [portfolio]);

  const totalValue = holdingsValue + cashBalance;
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

  const shariahPct = useMemo(() => {
    if (holdingsValue <= 0) return 0;
    const shariahValue = portfolio.reduce((acc, item) => {
      return acc + (item.stock.isShariah ? parseFloat(item.stock.price) * item.quantity : 0);
    }, 0);
    return Math.round((shariahValue / holdingsValue) * 100);
  }, [portfolio, holdingsValue]);

  const topSector = sectorData[0];

  const guidanceSentence = useMemo(() => {
    if (portfolio.length === 0 || holdingsValue <= 0) {
      return language === 'ENG'
        ? `Your style is set to ${userProfile} — try spreading your first picks across 3 different Bursa industries.`
        : `Gaya anda ialah ${userProfile} — cuba agihkan pilihan pertama anda merentasi 3 industri Bursa berbeza.`;
    }
    if (topSector && topSector.percentage > 60) {
      return language === 'ENG'
        ? `${topSector.percentage}% of your stocks are in ${topSector.name}; adding another industry helps reduce single-sector risk.`
        : `${topSector.percentage}% saham anda berada dalam ${topSector.name}; menambah industri lain membantu mengurangkan risiko.`;
    }
    return language === 'ENG'
      ? `Well balanced across ${sectorData.length} industry sector(s) with ${shariahPct}% in Shariah-compliant companies.`
      : `Seimbang merentasi ${sectorData.length} sektor industri dengan ${shariahPct}% dalam syarikat patuh Syariah.`;
  }, [portfolio.length, holdingsValue, topSector, sectorData.length, shariahPct, userProfile, language]);

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const investedPct = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const cashPct = Math.max(0, 100 - investedPct);

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Main Column */}
        <div className="rh-main space-y-8">
          {/* Unboxed Total Portfolio Value + Allocation Bar */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {t.totalPortfolioLabel}
              </div>
              <div className="rh-hero-num">RM {formatRM(totalValue)}</div>
              <div className="flex items-center gap-2 text-sm font-tabular">
                <span
                  className="font-semibold"
                  style={{
                    color: unrealizedPL >= 0 ? 'var(--signal-up)' : 'var(--signal-down)'
                  }}
                >
                  {unrealizedPL >= 0 ? '+' : ''}RM {formatRM(unrealizedPL)} (
                  {unrealizedPL >= 0 ? '+' : ''}
                  {unrealizedPLPercent.toFixed(2)}%)
                </span>
                <span style={{ color: 'var(--ink-muted)' }}>
                  {language === 'ENG' ? 'all-time return' : 'pulangan keseluruhan'}
                </span>
              </div>
            </div>

            {/* Clean Visual Allocation Bar (Invested Stocks vs Available Cash) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-tabular">
                <div>
                  <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {t.investedStocksLabel}: RM {formatRM(holdingsValue)}
                  </span>{' '}
                  <span style={{ color: 'var(--ink-muted)' }}>({investedPct}%)</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {t.availableCashLabel}: RM {formatRM(cashBalance)}
                  </span>{' '}
                  <span style={{ color: 'var(--ink-muted)' }}>({cashPct}%)</span>
                </div>
              </div>
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
          </div>

          {/* Holdings Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {t.holdingsTitle} ({portfolio.length})
              </h2>
            </div>

            {portfolio.length > 0 ? (
              <div className="rh-stock-list">
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
                    <div
                      key={`${stock.id}-${idx}`}
                      className="rh-stock-row"
                      onClick={() => {
                        setSelectedStock(stock);
                        navigateTo('stock-details');
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={monogram.avatarClass}>{monogram.initials}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{stock.name}</span>
                            <span
                              className="text-xs font-tabular"
                              style={{ color: 'var(--ink-muted)' }}
                            >
                              {stock.ticker}
                            </span>
                          </div>
                          <div
                            className="text-xs font-tabular mt-0.5"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            {item.quantity.toLocaleString()} sh · Avg RM {formatRM(item.averagePrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right font-tabular">
                          <div className="text-sm font-semibold">RM {formatRM(marketVal)}</div>
                          <div
                            className="text-xs font-medium"
                            style={{
                              color: isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                            }}
                          >
                            {isPositive ? '+' : ''}RM {formatRM(profit)} ({isPositive ? '+' : ''}
                            {returnPct.toFixed(2)}%)
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5"
                          onClick={e => e.stopPropagation()}
                        >
                          {item.quantity > 1 && (
                            <button
                              type="button"
                              className="jom-btn py-1 px-2.5 text-xs font-tabular"
                              onClick={() => sellFromPortfolio(stock, halfQty)}
                            >
                              {t.sellHalfBtn}
                            </button>
                          )}
                          <button
                            type="button"
                            className="jom-btn py-1 px-2.5 text-xs"
                            onClick={() => removeFromPortfolio(stock)}
                          >
                            {t.sellBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rh-card text-center space-y-3">
                <h3 className="text-base font-bold">{t.emptyHoldingsTitle}</h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--ink-secondary)' }}>
                  {t.emptyHoldingsDesc}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="jom-btn jom-btn-primary text-xs"
                  >
                    {t.exploreMarket}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Recent Orders Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              {t.recentOrdersTitle} ({tradeHistory.length})
            </h2>

            {tradeHistory.length > 0 ? (
              <div className="rh-stock-list">
                {tradeHistory.map(trade => {
                  const monogram = getStockMonogram(trade.ticker);
                  const isBuy = trade.type === 'BUY';
                  return (
                    <div
                      key={trade.id}
                      className="rh-stock-row"
                      style={{ cursor: 'default' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={monogram.avatarClass}>{monogram.initials}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {isBuy
                                ? language === 'ENG'
                                  ? 'Bought'
                                  : 'Beli'
                                : language === 'ENG'
                                ? 'Sold'
                                : 'Jual'}{' '}
                              {trade.ticker}
                            </span>
                            <span
                              className="text-xs font-tabular"
                              style={{ color: 'var(--ink-muted)' }}
                            >
                              {trade.quantity.toLocaleString()} sh @ RM {formatRM(trade.pricePerShare)}
                            </span>
                          </div>
                          <div
                            className="text-xs font-tabular mt-0.5"
                            style={{ color: 'var(--ink-muted)' }}
                          >
                            {trade.timestamp} · Fees RM {formatRM(trade.totalFees)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-tabular shrink-0">
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color: isBuy ? 'var(--ink-primary)' : 'var(--signal-up)'
                          }}
                        >
                          {isBuy ? '-' : '+'}RM {formatRM(trade.netAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rh-card text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {t.emptyHistoryText}
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Rail */}
        <aside className="rh-rail space-y-4">
          {/* Cash & Dividends Card */}
          <div className="rh-card space-y-4">
            <h3 className="text-base font-bold">{t.cashDividendsTitle}</h3>

            <div className="space-y-1">
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {t.availableCashLabel}
              </div>
              <div
                className="text-2xl font-bold font-tabular"
                style={{ color: 'var(--signal-up)' }}
              >
                RM {formatRM(cashBalance)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTopUpCash(5000)}
              className="jom-btn jom-btn-primary w-full text-xs"
            >
              <Plus size={14} />
              <span>{t.topUpBtn}</span>
            </button>

            <div
              className="pt-4 border-t space-y-2 text-xs"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.annualDivLabel}</span>
                <span className="font-tabular font-semibold" style={{ color: 'var(--signal-up)' }}>
                  RM {formatRM(annualDividend)}/yr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.monthlyDivLabel}</span>
                <span className="font-tabular font-semibold">
                  RM {formatRM(monthlyDividend)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Balance Check Card */}
          <div className="rh-card space-y-4">
            <h3 className="text-base font-bold">{t.balanceCheckTitle}</h3>

            {/* Sector Concentration Progress Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {t.sectorConcentrationLabel}
                </span>
                <span className="font-tabular font-semibold">
                  {topSector ? `${topSector.name} (${topSector.percentage}%)` : '0%'}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${topSector ? topSector.percentage : 0}%`,
                    backgroundColor:
                      topSector && topSector.percentage > 60
                        ? 'var(--signal-warn)'
                        : 'var(--accent-brand)'
                  }}
                />
              </div>
            </div>

            {/* Shariah % Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.shariahShareLabel}</span>
                <span className="font-tabular font-semibold" style={{ color: 'var(--accent-brand)' }}>
                  {shariahPct}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${shariahPct}%`,
                    backgroundColor: 'var(--accent-brand)'
                  }}
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--ink-secondary)' }}>
              {guidanceSentence}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
