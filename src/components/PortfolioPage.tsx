import { useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Wallet, Plus } from 'lucide-react';
import type { Screen, PortfolioItem } from '../App';
import type { StockData } from '../data/stocks';

interface PortfolioPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  portfolio: PortfolioItem[];
  removeFromPortfolio: (stock: StockData) => void;
  setSelectedStock?: (stock: StockData) => void;
}

export function PortfolioPage({
  navigateTo,
  language,
  portfolio,
  removeFromPortfolio,
  setSelectedStock,
}: PortfolioPageProps) {
  const texts = {
    ENG: {
      myPortfolio: 'My Simulated Portfolio',
      totalValue: 'Total Market Value',
      totalHoldings: 'Active Positions',
      sectorAllocation: 'Sector Allocation',
      holdings: 'Your Holdings',
      noHoldings: 'Your simulated portfolio is empty.',
      noHoldingsSub: 'Explore Bursa Malaysia stocks and make your first practice trade to earn +50 XP!',
      findStocks: 'Explore Bursa Stocks',
      sell: 'Sell All (+30 XP)',
      currentPrice: 'Current',
      avgPrice: 'Avg Cost',
      quantity: 'Units',
      marketValue: 'Market Value',
      noData: 'Buy stocks to see sector breakdown',
    },
    BM: {
      myPortfolio: 'Portfolio Simulasi Saya',
      totalValue: 'Jumlah Nilai Pasaran',
      totalHoldings: 'Pegangan Aktif',
      sectorAllocation: 'Peruntukan Sektor',
      holdings: 'Pegangan Anda',
      noHoldings: 'Portfolio simulasi anda masih kosong.',
      noHoldingsSub: 'Terokai saham Bursa Malaysia dan buat dagangan latihan pertama untuk +50 XP!',
      findStocks: 'Terokai Saham Bursa',
      sell: 'Jual Semua (+30 XP)',
      currentPrice: 'Semasa',
      avgPrice: 'Kos Purata',
      quantity: 'Unit',
      marketValue: 'Nilai Pasaran',
      noData: 'Beli saham untuk lihat pecahan sektor',
    },
  };

  const t = texts[language];

  const totalValueNum = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );
  const totalValue = totalValueNum.toFixed(2);

  const sectorData = useMemo(() => {
    const sectors: Record<string, number> = {};
    const colors = ['#10b981', '#0d9488', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

    portfolio.forEach((item) => {
      const sector = item.stock.sector || 'Other';
      sectors[sector] = (sectors[sector] || 0) + parseFloat(item.stock.price) * item.quantity;
    });

    const total = Object.values(sectors).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(sectors)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const conicGradient = useMemo(() => {
    if (portfolio.length === 0 || totalValueNum === 0) return '#e6f4ef 0deg 360deg';

    let currentDeg = 0;
    return sectorData
      .map((sector) => {
        const deg = (sector.value / totalValueNum) * 360;
        const str = `${sector.color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return str;
      })
      .join(', ');
  }, [sectorData, totalValueNum, portfolio.length]);

  const calculateReturn = (currentPrice: number, avgPrice: number) => {
    if (avgPrice === 0) return '0.00';
    return (((currentPrice - avgPrice) / avgPrice) * 100).toFixed(2);
  };

  return (
    <div className="jomi-stack-lg">
      {/* Summary Top Grid */}
      <div className="jomi-grid-2">
        {/* Wealth Hero */}
        <div className="jomi-hero jomi-stack-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="jomi-cluster">
            <Wallet size={20} color="#ccfbf1" />
            <span className="jomi-hero-label">{t.totalValue}</span>
          </div>
          <div className="jomi-display jomi-nums" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.15 }}>
            RM {totalValue}
          </div>
          <div className="jomi-between" style={{ marginTop: '0.5rem' }}>
            <span
              className="jomi-nums"
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                fontSize: '0.78rem',
                fontWeight: 800,
              }}
            >
              {portfolio.length} {t.totalHoldings}
            </span>
            <button
              type="button"
              className="jomi-btn jomi-btn-gold jomi-btn-sm"
              onClick={() => navigateTo('dashboard')}
            >
              <Plus size={15} />
              <span>{t.findStocks}</span>
            </button>
          </div>
        </div>

        {/* Sector Allocation Donut */}
        <div className="jomi-card jomi-card-pad jomi-stack-md">
          <h3 className="jomi-display jomi-title-md jomi-cluster">
            <PieChart size={19} color="#0d9488" />
            <span>{t.sectorAllocation}</span>
          </h3>

          <div className="jomi-cluster" style={{ gap: '1.5rem', flexWrap: 'nowrap' }}>
            <div
              style={{
                width: '7.5rem',
                height: '7.5rem',
                borderRadius: '9999px',
                background: `conic-gradient(${conicGradient})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid var(--jomi-border)',
              }}
            >
              <div
                style={{
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            <div style={{ flex: 1 }} className="jomi-stack-xs">
              {sectorData.length > 0 ? (
                sectorData.map((sector) => (
                  <div key={sector.name} className="jomi-between jomi-text-sm">
                    <span className="jomi-cluster" style={{ gap: '0.45rem', fontWeight: 700 }}>
                      <span
                        style={{
                          width: '0.65rem',
                          height: '0.65rem',
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

      {/* Holdings List */}
      <section className="jomi-stack-md">
        <h2 className="jomi-display jomi-title-lg jomi-cluster">
          <TrendingUp size={20} color="#0d9488" />
          <span>{t.holdings}</span>
        </h2>

        {portfolio.length > 0 ? (
          <div className="jomi-stack-sm">
            {portfolio.map((item, index) => {
              const stock = item.stock;
              const returnPercent = calculateReturn(parseFloat(stock.price), item.averagePrice);
              const isPositive = parseFloat(returnPercent) >= 0;
              const marketValue = (parseFloat(stock.price) * item.quantity).toFixed(2);

              return (
                <div
                  key={`${stock.id}-${index}`}
                  className="jomi-card jomi-card-pad jomi-between"
                  style={{ cursor: setSelectedStock ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (setSelectedStock) {
                      setSelectedStock(stock);
                      navigateTo('stock-details');
                    }
                  }}
                >
                  <div className="jomi-cluster" style={{ gap: '0.9rem' }}>
                    <div className="jomi-ticker-badge jomi-ticker-badge-lg">{stock.ticker.slice(0, 3)}</div>
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

                  <div className="jomi-cluster" style={{ gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
                      <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{t.marketValue}</p>
                      <p className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        RM {marketValue}
                      </p>
                      <span className={`jomi-nums ${isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPositive ? '+' : ''}{returnPercent}%
                      </span>
                    </div>

                    <button
                      type="button"
                      className="jomi-btn jomi-btn-danger jomi-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPortfolio(stock);
                      }}
                    >
                      {t.sell}
                    </button>
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
        )}
      </section>
    </div>
  );
}
