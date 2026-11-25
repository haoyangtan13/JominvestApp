import { useMemo, useState } from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  Coins,
  ReceiptText,
  Sparkles,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Screen, PortfolioItem } from '../App';
import type { StockData } from '../data/stocks';
import { StockBadge } from './StockVisuals';
import { formatRMFromSen, priceToSen, type TransactionRecord } from '../lib/simulator';

interface PortfolioPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  portfolio: PortfolioItem[];
  cashSen: number;
  transactions: TransactionRecord[];
  sellStock: (stock: StockData, quantity: number) => void;
  onSimulateDividends: () => void;
  setSelectedStock?: (stock: StockData) => void;
}

export function PortfolioPage({
  navigateTo,
  language,
  portfolio,
  cashSen,
  transactions,
  sellStock,
  onSimulateDividends,
  setSelectedStock,
}: PortfolioPageProps) {
  const [viewTab, setViewTab] = useState<'holdings' | 'ledger'>('holdings');
  const [sellUnitsMap, setSellUnitsMap] = useState<Record<string, number>>({});

  const texts = {
    ENG: {
      totalEquity: 'Total Account Equity',
      cashBalance: 'Virtual Cash',
      holdingsValue: 'Stock Value',
      sectorAllocation: 'Sector Allocation',
      holdingsTab: 'Holdings',
      ledgerTab: 'Trade Ledger',
      noHoldings: 'Your simulated portfolio is empty.',
      noHoldingsSub: 'Use your RM 10,000.00 virtual cash to buy Bursa Malaysia stocks and earn +50 XP!',
      findStocks: 'Explore Bursa Stocks',
      sellPartial: 'Sell Units',
      sellAll: 'Sell All',
      currentPrice: 'Current',
      avgPrice: 'Avg Cost',
      quantity: 'Held',
      marketValue: 'Market Value',
      noData: 'Buy stocks to see interactive sector ring',
      simDividend: 'Simulate Annual Dividends',
      noTx: 'No transactions recorded yet.',
    },
    BM: {
      totalEquity: 'Jumlah Ekuiti Akaun',
      cashBalance: 'Tunai Maya',
      holdingsValue: 'Nilai Saham',
      sectorAllocation: 'Peruntukan Sektor',
      holdingsTab: 'Pegangan',
      ledgerTab: 'Lejar Dagangan',
      noHoldings: 'Portfolio simulasi anda masih kosong.',
      noHoldingsSub: 'Gunakan tunai maya RM 10,000.00 anda untuk membeli saham Bursa Malaysia (+50 XP)!',
      findStocks: 'Terokai Saham Bursa',
      sellPartial: 'Jual Unit',
      sellAll: 'Jual Semua',
      currentPrice: 'Semasa',
      avgPrice: 'Kos Purata',
      quantity: 'Unit',
      marketValue: 'Nilai Pasaran',
      noData: 'Beli saham untuk lihat cincin sektor interaktif',
      simDividend: 'Simulasi Dividen Tahunan',
      noTx: 'Tiada rekod transaksi lagi.',
    },
  };

  const t = texts[language];

  const holdingsValueSen = portfolio.reduce(
    (acc, item) => acc + priceToSen(item.stock.price) * item.quantity,
    0
  );
  const totalEquitySen = cashSen + holdingsValueSen;

  const sectorData = useMemo(() => {
    const sectors: Record<string, number> = {};
    const colors = ['#10b981', '#0d9488', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

    portfolio.forEach((item) => {
      const sector = item.stock.sector || 'Other';
      sectors[sector] = (sectors[sector] || 0) + (priceToSen(item.stock.price) * item.quantity) / 100;
    });

    const total = Object.values(sectors).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(sectors)
      .map(([name, value], index) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: Math.round((value / total) * 100),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const calculateReturn = (currentPrice: number, avgPrice: number) => {
    if (avgPrice === 0) return '0.00';
    return (((currentPrice - avgPrice) / avgPrice) * 100).toFixed(2);
  };

  return (
    <div className="jomi-stack-lg">
      {/* Summary Top Grid */}
      <div className="jomi-grid-2">
        {/* Account Equity + Cash Split Hero */}
        <div className="jomi-hero jomi-stack-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="jomi-cluster">
              <Wallet size={19} color="#ccfbf1" />
              <span className="jomi-hero-label">{t.totalEquity}</span>
            </div>
            <div className="jomi-display jomi-nums" style={{ fontSize: '2.45rem', fontWeight: 700, lineHeight: 1.15, marginTop: '0.25rem' }}>
              RM {formatRMFromSen(totalEquitySen)}
            </div>
          </div>

          <div className="jomi-cluster" style={{ gap: '0.6rem' }}>
            <div
              className="jomi-nums"
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(15, 41, 38, 0.28)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.76rem',
                fontWeight: 800,
              }}
            >
              {t.cashBalance}: RM {formatRMFromSen(cashSen)}
            </div>
            <div
              className="jomi-nums"
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(15, 41, 38, 0.28)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.76rem',
                fontWeight: 800,
              }}
            >
              {t.holdingsValue}: RM {formatRMFromSen(holdingsValueSen)}
            </div>
          </div>

          <div className="jomi-cluster">
            <button
              type="button"
              className="jomi-btn jomi-btn-gold jomi-btn-sm"
              onClick={() => navigateTo('dashboard')}
            >
              <Plus size={15} />
              <span>{t.findStocks}</span>
            </button>
            {portfolio.length > 0 && (
              <button
                type="button"
                className="jomi-btn jomi-btn-outline jomi-btn-sm"
                onClick={onSimulateDividends}
              >
                <Coins size={14} color="#047857" />
                <span>{t.simDividend}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Recharts Sector Allocation Ring */}
        <div className="jomi-card jomi-card-pad jomi-stack-md">
          <h3 className="jomi-display jomi-title-md jomi-cluster">
            <PieChartIcon size={19} color="#0d9488" />
            <span>{t.sectorAllocation}</span>
          </h3>

          <div className="jomi-cluster" style={{ gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '128px', height: '128px', flexShrink: 0, margin: '0 auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData.length > 0 ? sectorData : [{ name: 'Empty', value: 1, color: '#e6f4ef' }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={sectorData.length > 1 ? 4 : 0}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {(sectorData.length > 0 ? sectorData : [{ name: 'Empty', value: 1, color: '#e6f4ef' }]).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  {sectorData.length > 0 && (
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="jomi-chart-tooltip jomi-nums">
                            <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>{d.name}</div>
                            <div>RM {d.value} ({d.percentage}%)</div>
                          </div>
                        );
                      }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1 }} className="jomi-stack-xs">
              {sectorData.length > 0 ? (
                sectorData.map((sector) => (
                  <div key={sector.name} className="jomi-between jomi-text-sm">
                    <span className="jomi-cluster" style={{ gap: '0.45rem', fontWeight: 700 }}>
                      <span
                        style={{
                          width: '0.68rem',
                          height: '0.68rem',
                          borderRadius: '9999px',
                          backgroundColor: sector.color,
                          display: 'inline-block',
                        }}
                      />
                      {sector.name}
                    </span>
                    <span className="jomi-nums" style={{ fontWeight: 800 }}>{sector.percentage}%</span>
                  </div>
                ))
              ) : (
                <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.noData}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Holdings vs Trade Ledger */}
      <div className="jomi-between">
        <div className="jomi-tabs-bar">
          <button
            type="button"
            onClick={() => setViewTab('holdings')}
            className={`jomi-tab-btn ${viewTab === 'holdings' ? 'jomi-tab-btn-active' : ''}`}
          >
            <TrendingUp size={15} />
            <span>{t.holdingsTab} ({portfolio.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('ledger')}
            className={`jomi-tab-btn ${viewTab === 'ledger' ? 'jomi-tab-btn-active' : ''}`}
          >
            <ReceiptText size={15} />
            <span>{t.ledgerTab} ({transactions.length})</span>
          </button>
        </div>
      </div>

      {viewTab === 'holdings' ? (
        portfolio.length > 0 ? (
          <div className="jomi-stack-sm">
            {portfolio.map((item, index) => {
              const stock = item.stock;
              const returnPercent = calculateReturn(parseFloat(stock.price), item.averagePrice);
              const isPositive = parseFloat(returnPercent) >= 0;
              const marketValueSen = priceToSen(stock.price) * item.quantity;
              const sellQty = Math.min(item.quantity, Math.max(1, sellUnitsMap[stock.id] ?? item.quantity));

              return (
                <div
                  key={`${stock.id}-${index}`}
                  className="jomi-card jomi-card-pad jomi-stack-md"
                >
                  <div className="jomi-between">
                    <div
                      className="jomi-cluster"
                      style={{ gap: '0.9rem', cursor: 'pointer' }}
                      onClick={() => {
                        if (setSelectedStock) {
                          setSelectedStock(stock);
                          navigateTo('stock-details');
                        }
                      }}
                    >
                      <StockBadge ticker={stock.ticker} sector={stock.sector} size="lg" />
                      <div className="jomi-stack-xs">
                        <div className="jomi-cluster">
                          <h4 className="jomi-display jomi-title-md">{stock.name}</h4>
                          <span className="jomi-pill-sector">{stock.ticker}</span>
                        </div>
                        <div className="jomi-cluster">
                          <span className="jomi-pill-sector jomi-nums">{t.quantity}: {item.quantity}</span>
                          <span className="jomi-pill-sector jomi-nums">{t.avgPrice}: RM {item.averagePrice.toFixed(2)}</span>
                          <span className="jomi-pill-sector jomi-nums">{t.currentPrice}: RM {stock.price}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{t.marketValue}</p>
                      <p className="jomi-display jomi-nums" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                        RM {formatRMFromSen(marketValueSen)}
                      </p>
                      <span className={`jomi-nums ${isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPositive ? '+' : ''}{returnPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Partial / Full Sell Controls */}
                  <div
                    className="jomi-between"
                    style={{
                      paddingTop: '0.75rem',
                      borderTop: '1.5px solid var(--jomi-canvas)',
                    }}
                  >
                    <div className="jomi-cluster">
                      <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>
                        {t.sellPartial}:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={sellQty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v)) {
                            setSellUnitsMap((prev) => ({
                              ...prev,
                              [stock.id]: Math.min(item.quantity, Math.max(1, v)),
                            }));
                          }
                        }}
                        className="jomi-input jomi-nums"
                        style={{ width: '92px', height: '2.2rem', textAlign: 'center', padding: '0 0.5rem' }}
                      />
                      {item.quantity > 1 && (
                        <button
                          type="button"
                          className="jomi-btn jomi-btn-outline jomi-btn-sm"
                          onClick={() =>
                            setSellUnitsMap((prev) => ({
                              ...prev,
                              [stock.id]: Math.max(1, Math.floor(item.quantity / 2)),
                            }))
                          }
                        >
                          50%
                        </button>
                      )}
                    </div>

                    <div className="jomi-cluster">
                      <button
                        type="button"
                        className="jomi-btn jomi-btn-danger jomi-btn-sm"
                        onClick={() => sellStock(stock, sellQty)}
                      >
                        {sellQty === item.quantity ? t.sellAll : `Sell ${sellQty}u`} (+30 XP)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="jomi-card jomi-card-pad jomi-stack-sm" style={{ textAlign: 'center', padding: '3rem 1.5rem', alignItems: 'center' }}>
            <div className="jomi-ticker-badge jomi-ticker-badge-lg">
              <DollarSign size={26} />
            </div>
            <h3 className="jomi-display jomi-title-md">{t.noHoldings}</h3>
            <p className="jomi-text-sm jomi-muted" style={{ maxWidth: '420px', fontWeight: 600 }}>
              {t.noHoldingsSub}
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" className="jomi-btn jomi-btn-primary" onClick={() => navigateTo('dashboard')}>
                {t.findStocks}
              </button>
            </div>
          </div>
        )
      ) : (
        /* Trade History Ledger Tab */
        <div className="jomi-card jomi-card-pad jomi-stack-sm">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const badgeCls =
                tx.type === 'BUY'
                  ? 'jomi-pill-gain'
                  : tx.type === 'DIVIDEND'
                    ? 'jomi-pill-neutral'
                    : 'jomi-pill-loss';
              return (
                <div key={tx.id} className="jomi-row" style={{ cursor: 'default' }}>
                  <div className="jomi-cluster">
                    <span className={badgeCls}>
                      {tx.type === 'DIVIDEND' && <Sparkles size={11} />}
                      {tx.type}
                    </span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        {tx.ticker} · {tx.quantity} units @ RM {formatRMFromSen(tx.unitPriceSen)}
                      </p>
                      <p className="jomi-text-xs jomi-muted jomi-nums" style={{ fontWeight: 600 }}>
                        {tx.timestampIso.slice(0, 16).replace('T', ' ')} MYT
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p className="jomi-display jomi-nums" style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {tx.type === 'BUY' ? '-' : '+'}RM {formatRMFromSen(tx.totalSen)}
                    </p>
                    {typeof tx.realizedPnlSen === 'number' && tx.type === 'SELL' && (
                      <p
                        className="jomi-text-xs jomi-nums"
                        style={{
                          fontWeight: 800,
                          color: tx.realizedPnlSen >= 0 ? '#047857' : '#b91c1c',
                        }}
                      >
                        P&amp;L: {tx.realizedPnlSen >= 0 ? '+' : ''}RM {formatRMFromSen(tx.realizedPnlSen)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="jomi-text-sm jomi-muted" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
              {t.noTx}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
