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
      investedStocksLabel: 'Invested',
      availableCashLabel: 'Buying power',
      holdingsTitle: 'Positions',
      recentOrdersTitle: 'Order History',
      sellHalfBtn: 'Sell half',
      sellBtn: 'Close',
      emptyHoldingsDesc:
        'You have no open positions. Select a stock from the market list to place a practice order.',
      exploreMarket: 'Browse stocks →',
      emptyHistoryText: 'No orders placed yet.',
      cashDividendsTitle: 'Account Summary',
      topUpBtn: 'Add RM 5,000 practice cash',
      annualDivLabel: 'Est. annual dividends',
      monthlyDivLabel: 'Monthly equivalent',
      balanceCheckTitle: 'Allocation',
      sectorConcentrationLabel: 'Top sector',
      shariahShareLabel: 'Shariah weight'
    },
    BM: {
      investedStocksLabel: 'Dilabur',
      availableCashLabel: 'Kuasa beli',
      holdingsTitle: 'Pegangan',
      recentOrdersTitle: 'Rekod Pesanan',
      sellHalfBtn: 'Jual separuh',
      sellBtn: 'Tutup',
      emptyHoldingsDesc:
        'Tiada pegangan dibuka. Pilih saham daripada senarai pasaran untuk membuat pesanan latihan.',
      exploreMarket: 'Lihat senarai saham →',
      emptyHistoryText: 'Tiada pesanan dibuat lagi.',
      cashDividendsTitle: 'Ringkasan Akaun',
      topUpBtn: 'Tambah RM 5,000 tunai latihan',
      annualDivLabel: 'Anggaran dividen tahunan',
      monthlyDivLabel: 'Bersamaan bulanan',
      balanceCheckTitle: 'Agihan Portfolio',
      sectorConcentrationLabel: 'Sektor utama',
      shariahShareLabel: 'Pecahan Syariah'
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
        ? `Risk profile: ${userProfile}. Spread initial positions across 3 sectors to keep single-industry exposure below 60%.`
        : `Profil risiko: ${userProfile}. Agihkan pegangan awal merentasi 3 sektor.`;
    }
    if (topSector && topSector.percentage > 60) {
      return language === 'ENG'
        ? `${topSector.percentage}% is concentrated in ${topSector.name}. Consider diversifying into another sector.`
        : `${topSector.percentage}% tertumpu dalam ${topSector.name}. Pertimbangkan sektor lain untuk imbangan.`;
    }
    return language === 'ENG'
      ? `Diversified across ${sectorData.length} sector(s) with ${shariahPct}% in Shariah-compliant holdings.`
      : `Terpelbagai merentasi ${sectorData.length} sektor dengan ${shariahPct}% pegangan patuh Syariah.`;
  }, [portfolio.length, holdingsValue, topSector, sectorData.length, shariahPct, userProfile, language]);

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const investedPct = totalValue > 0 ? Math.round((holdingsValue / totalValue) * 100) : 0;
  const cashPct = Math.max(0, 100 - investedPct);

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Main Column */}
        <div className="rh-main space-y-10">
          {/* Unboxed Portfolio Summary */}
          <div className="space-y-4">
            <div>
              <div className="rh-hero-num">RM {formatRM(totalValue)}</div>
              <div className="flex items-center gap-2 mt-1.5 text-xs font-tabular">
                <span
                  className="font-medium"
                  style={{
                    color: unrealizedPL >= 0 ? 'var(--signal-up)' : 'var(--signal-down)'
                  }}
                >
                  {unrealizedPL >= 0 ? '+' : ''}RM {formatRM(unrealizedPL)} (
                  {unrealizedPL >= 0 ? '+' : ''}
                  {unrealizedPLPercent.toFixed(2)}%)
                </span>
                <span style={{ color: 'var(--ink-muted)' }}>·</span>
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {t.investedStocksLabel} RM {formatRM(holdingsValue)} ({investedPct}%) · {t.availableCashLabel} RM {formatRM(cashBalance)} ({cashPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              {t.holdingsTitle} ({portfolio.length})
            </h2>

            {portfolio.length > 0 ? (
              <div className="jom-table-wrap">
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th className="text-right">Shares</th>
                      <th className="text-right hidden sm:table-cell">Avg Cost</th>
                      <th className="text-right">Market Value</th>
                      <th className="text-right">Total Return</th>
                      <th className="text-right">Actions</th>
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

                      return (
                        <tr
                          key={`${stock.id}-${idx}`}
                          onClick={() => {
                            setSelectedStock(stock);
                            navigateTo('stock-details');
                          }}
                        >
                          <td>
                            <div className="font-medium text-sm">{stock.ticker}</div>
                            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                              {stock.name}
                            </div>
                          </td>
                          <td className="text-right font-tabular text-xs">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="text-right font-tabular text-xs hidden sm:table-cell" style={{ color: 'var(--ink-secondary)' }}>
                            RM {formatRM(item.averagePrice)}
                          </td>
                          <td className="text-right font-tabular text-sm font-medium">
                            RM {formatRM(marketVal)}
                          </td>
                          <td
                            className="text-right font-tabular text-xs font-medium"
                            style={{
                              color: isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                            }}
                          >
                            {isPositive ? '+' : ''}RM {formatRM(profit)} ({isPositive ? '+' : ''}
                            {returnPct.toFixed(2)}%)
                          </td>
                          <td
                            className="text-right"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-2">
                              {item.quantity > 1 && (
                                <button
                                  type="button"
                                  className="rh-link-btn"
                                  onClick={() => sellFromPortfolio(stock, halfQty)}
                                >
                                  {t.sellHalfBtn}
                                </button>
                              )}
                              <button
                                type="button"
                                className="rh-link-btn"
                                style={{ color: 'var(--signal-down)' }}
                                onClick={() => removeFromPortfolio(stock)}
                              >
                                {t.sellBtn}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 border-t border-b space-y-2" style={{ borderColor: 'var(--border-hairline)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {t.emptyHoldingsDesc}
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="rh-link-btn"
                  style={{ color: 'var(--ink-primary)' }}
                >
                  {t.exploreMarket}
                </button>
              </div>
            )}
          </section>

          {/* Order History Table */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              {t.recentOrdersTitle} ({tradeHistory.length})
            </h2>

            {tradeHistory.length > 0 ? (
              <div className="jom-table-wrap">
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th className="text-right">Shares</th>
                      <th className="text-right">Price</th>
                      <th className="text-right hidden sm:table-cell">Fees</th>
                      <th className="text-right">Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="font-tabular text-xs">
                    {tradeHistory.map(trade => {
                      const isBuy = trade.type === 'BUY';
                      return (
                        <tr key={trade.id} style={{ cursor: 'default' }}>
                          <td className="font-medium">
                            {isBuy ? 'Buy' : 'Sell'} {trade.ticker}
                          </td>
                          <td style={{ color: 'var(--ink-muted)' }}>{trade.timestamp}</td>
                          <td className="text-right">{trade.quantity.toLocaleString()}</td>
                          <td className="text-right">RM {formatRM(trade.pricePerShare)}</td>
                          <td className="text-right hidden sm:table-cell" style={{ color: 'var(--ink-muted)' }}>
                            RM {formatRM(trade.totalFees)}
                          </td>
                          <td
                            className="text-right font-medium"
                            style={{ color: isBuy ? 'var(--ink-primary)' : 'var(--signal-up)' }}
                          >
                            {isBuy ? '-' : '+'}RM {formatRM(trade.netAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs py-4 border-t" style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-muted)' }}>
                {t.emptyHistoryText}
              </p>
            )}
          </section>
        </div>

        {/* Right Unboxed Rail */}
        <aside className="rh-rail space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {t.cashDividendsTitle}
            </h3>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.availableCashLabel}</span>
                <span className="font-tabular font-medium">RM {formatRM(cashBalance)}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.annualDivLabel}</span>
                <span className="font-tabular font-medium" style={{ color: 'var(--signal-up)' }}>
                  RM {formatRM(annualDividend)}/yr
                </span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.monthlyDivLabel}</span>
                <span className="font-tabular font-medium">RM {formatRM(monthlyDividend)}/mo</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTopUpCash(5000)}
              className="jom-btn w-full text-xs mt-2"
            >
              <Plus size={13} />
              <span>{t.topUpBtn}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {t.balanceCheckTitle}
            </h3>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.sectorConcentrationLabel}</span>
                <span className="font-tabular font-medium">
                  {topSector ? `${topSector.name} (${topSector.percentage}%)` : '—'}
                </span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.shariahShareLabel}</span>
                <span className="font-tabular font-medium">{shariahPct}%</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {guidanceSentence}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
