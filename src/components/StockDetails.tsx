import { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Newspaper,
  DollarSign,
  Minus,
  Plus,
  Lightbulb,
  X,
  Trophy,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';

interface StockDetailsProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stock: StockData | null;
  addToPortfolio: (stock: StockData, quantity: number) => void;
  addXP: (amount: number, reason: string) => void;
  hasLearnedTerm: string[];
  setHasLearnedTerm: (terms: string[]) => void;
}

export function StockDetails({
  navigateTo,
  language,
  stock,
  addToPortfolio,
  addXP,
  hasLearnedTerm,
  setHasLearnedTerm,
}: StockDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [learningTerm, setLearningTerm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'news'>('overview');

  const definitions: Record<string, { ENG: { simple: string; detail: string }; BM: { simple: string; detail: string } }> = {
    Price: {
      ENG: { simple: 'The current cost to buy one share.', detail: 'Stock prices change every second based on supply and demand.' },
      BM: { simple: 'Kos semasa untuk membeli satu saham.', detail: 'Harga saham berubah setiap saat berdasarkan permintaan dan penawaran.' },
    },
    'P/E Ratio': {
      ENG: { simple: 'Are you overpaying?', detail: 'Price-to-Earnings Ratio. A high number (above 20) means the stock might be expensive relative to its profit.' },
      BM: { simple: 'Adakah anda bayar terlalu mahal?', detail: 'Nisbah Harga-kepada-Pendapatan. Nombor tinggi (atas 20) bermakna saham mungkin mahal berbanding keuntungannya.' },
    },
    'Market Cap': {
      ENG: { simple: 'How big is the company?', detail: 'The total value of all shares combined. Large cap = stable, Small cap = risky but potential growth.' },
      BM: { simple: 'Berapa besar syarikat ini?', detail: 'Jumlah nilai semua saham digabungkan. Modal besar = stabil, Modal kecil = berisiko tapi potensi tumbuh.' },
    },
    'Dividend Yield': {
      ENG: { simple: 'Your annual bonus.', detail: 'The percentage of the stock price that the company pays out as cash to shareholders each year.' },
      BM: { simple: 'Bonus tahunan anda.', detail: 'Peratusan harga saham yang syarikat bayar sebagai tunai kepada pemegang saham setiap tahun.' },
    },
    Volume: {
      ENG: { simple: 'How popular is this stock?', detail: 'The number of shares traded today. High volume means it is easy to buy or sell quickly.' },
      BM: { simple: 'Berapa popular saham ini?', detail: 'Bilangan saham yang didagangkan hari ini. Volum tinggi bermakna ia mudah dibeli atau dijual dengan cepat.' },
    },
  };

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      priceChart: '30-Day Price Trend',
      keyMetrics: 'Tap a Metric to Learn (+10 XP)',
      price: 'Current Share Price',
      peRatio: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      volume: 'Volume',
      overview: 'Overview & Trade',
      financials: 'Financials',
      news: 'News',
      buy: 'Simulate Buy (+50 XP)',
      sell: 'View Portfolio',
      revenue: 'Annual Revenue',
      netProfit: 'Net Profit',
      debtEquity: 'Debt / Equity',
      units: 'Quantity (Units)',
      estCost: 'Estimated Total Cost',
      xpReward: '+10 XP',
      quickLearn: 'Jom-Learn Quick Tip',
      knowledgeGained: 'Knowledge Gained!',
      aiInsight: 'JomINVEST AI Insight',
    },
    BM: {
      back: 'Kembali ke Papan Pemuka',
      priceChart: 'Trend Harga 30 Hari',
      keyMetrics: 'Ketik Metrik Untuk Belajar (+10 XP)',
      price: 'Harga Saham Semasa',
      peRatio: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      volume: 'Volum Dagangan',
      overview: 'Gambaran & Dagang',
      financials: 'Kewangan',
      news: 'Berita',
      buy: 'Simulasi Beli (+50 XP)',
      sell: 'Lihat Portfolio',
      revenue: 'Hasil Tahunan',
      netProfit: 'Untung Bersih',
      debtEquity: 'Hutang / Ekuiti',
      units: 'Kuantiti (Unit)',
      estCost: 'Anggaran Jumlah Kos',
      xpReward: '+10 XP',
      quickLearn: 'Tip Pantas Jom-Belajar',
      knowledgeGained: 'Ilmu Diperolehi!',
      aiInsight: 'Wawasan AI JomINVEST',
    },
  };

  const t = texts[language];

  if (!stock) {
    return (
      <div className="jomi-card jomi-card-pad jomi-stack-md" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <p className="jomi-title-md">
          {language === 'ENG' ? 'Select a stock from Dashboard to view details.' : 'Pilih saham daripada Papan Pemuka untuk melihat butiran.'}
        </p>
        <div>
          <button type="button" className="jomi-btn jomi-btn-primary" onClick={() => navigateTo('dashboard')}>
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) setQuantity(num);
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const totalCost = (parseFloat(stock.price) * quantity).toFixed(2);

  const handleTermClick = (termKey: string) => {
    if (!hasLearnedTerm.includes(termKey)) {
      addXP(10, `Learned about ${termKey}`);
      setHasLearnedTerm([...hasLearnedTerm, termKey]);
    }
    setLearningTerm(learningTerm === termKey ? null : termKey);
  };

  const chartColor = stock.isPositive ? '#10b981' : '#ef4444';

  const renderMetric = (label: string, value: string, termKey: string) => {
    const isExpanded = learningTerm === termKey;
    const def = definitions[termKey];
    const isLearned = hasLearnedTerm.includes(termKey);

    return (
      <div key={termKey} className="jomi-stack-xs">
        <div
          className="jomi-row"
          style={{
            backgroundColor: isExpanded ? 'var(--jomi-emerald-soft)' : '#ffffff',
            borderColor: isExpanded ? 'var(--jomi-emerald)' : 'var(--jomi-border)',
            padding: '1rem 1.15rem',
          }}
          onClick={() => handleTermClick(termKey)}
        >
          <div className="jomi-cluster">
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{label}</span>
            <HelpCircle size={16} color="#0d9488" />
            {!isLearned && <span className="jomi-pill-neutral">{t.xpReward}</span>}
          </div>
          <span className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {value}
          </span>
        </div>

        {isExpanded && def && (
          <div className="jomi-card-gold" style={{ padding: '1rem 1.15rem' }}>
            <div className="jomi-between" style={{ marginBottom: '0.35rem' }}>
              <span className="jomi-cluster" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--jomi-gold-ink)' }}>
                <Lightbulb size={16} color="#b45309" />
                {t.quickLearn}
              </span>
              <button
                type="button"
                className="jomi-btn jomi-btn-ghost jomi-btn-icon"
                style={{ width: '1.75rem', height: '1.75rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLearningTerm(null);
                }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.25rem' }}>{def[language].simple}</p>
            <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{def[language].detail}</p>
            {isLearned && (
              <div style={{ marginTop: '0.6rem' }}>
                <span className="jomi-pill-gain">
                  <Trophy size={12} />
                  {t.knowledgeGained}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="jomi-stack-lg">
      {/* Top Back Action */}
      <div>
        <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-sm" onClick={() => navigateTo('dashboard')}>
          <ArrowLeft size={15} />
          <span>{t.back}</span>
        </button>
      </div>

      {/* Stock Identity Hero Card */}
      <div className="jomi-card jomi-card-pad">
        <div className="jomi-between">
          <div className="jomi-cluster" style={{ gap: '1rem' }}>
            <div className="jomi-ticker-badge jomi-ticker-badge-lg">{stock.ticker.slice(0, 3)}</div>
            <div className="jomi-stack-xs">
              <div className="jomi-cluster">
                <h2 className="jomi-display jomi-title-lg">{stock.name}</h2>
                <span className="jomi-pill-sector">{stock.sector}</span>
              </div>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
                {stock.ticker} · Bursa Malaysia
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
            <div className="jomi-display jomi-nums" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>
              RM {stock.price}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span className={`jomi-nums ${stock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                {stock.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {stock.change} ({stock.changePercent})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div>
        <div className="jomi-tabs-bar">
          {(['overview', 'financials', 'news'] as const).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`jomi-tab-btn ${activeTab === tabKey ? 'jomi-tab-btn-active' : ''}`}
            >
              {t[tabKey]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="jomi-bento-main">
          {/* Left: Chart + Description + Tap-to-Learn Metrics */}
          <div className="jomi-stack-lg">
            {/* AI Insight Banner */}
            <div className="jomi-card-soft jomi-stack-xs">
              <div className="jomi-cluster" style={{ color: '#065f46', fontWeight: 800, fontSize: '0.9rem' }}>
                <Sparkles size={17} color="#0d9488" />
                <span>{t.aiInsight}</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                {stock.isPositive
                  ? (language === 'ENG' ? 'Bullish Momentum Detected' : 'Momentum Naik Dikesan')
                  : (language === 'ENG' ? 'Potential Value Dip?' : 'Peluang Harga Diskaun?')}
              </p>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                {language === 'ENG'
                  ? `${stock.name} shows ${stock.isPositive ? 'positive' : 'soft'} short-term momentum. With a P/E of ${stock.peRatio}, it trades ${parseFloat(stock.peRatio) > 20 ? 'at a growth premium' : 'at a reasonable multiple'} relative to peers.`
                  : `${stock.name} menunjukkan momentum jangka pendek yang ${stock.isPositive ? 'positif' : 'perlahan'}. Dengan P/E ${stock.peRatio}, penilaiannya kelihatan ${parseFloat(stock.peRatio) > 20 ? 'premium' : 'berpatutan'}.`}
              </p>
            </div>

            {/* Price Chart Card */}
            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <h3 className="jomi-display jomi-title-md">{t.priceChart}</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stock.history}>
                    <defs>
                      <linearGradient id="jomiStockPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6f4ef" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                      tick={{ fontSize: 11, fill: '#527972' }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={28}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 11, fill: '#527972' }}
                      axisLine={false}
                      tickLine={false}
                      width={46}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartColor}
                      strokeWidth={2.8}
                      fillOpacity={1}
                      fill="url(#jomiStockPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ padding: '0.9rem 1rem', borderRadius: '0.875rem', backgroundColor: 'var(--jomi-canvas)', border: '1.5px solid var(--jomi-border)' }}>
                <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{stock.description}</p>
              </div>
            </div>

            {/* Tap-to-Learn Metrics */}
            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <h3 className="jomi-display jomi-title-md">{t.keyMetrics}</h3>
              <div className="jomi-stack-sm">
                {renderMetric(t.peRatio, stock.peRatio, 'P/E Ratio')}
                {renderMetric(t.dividend, stock.dividendYield, 'Dividend Yield')}
                {renderMetric(t.marketCap, `RM ${stock.marketCap}`, 'Market Cap')}
                {renderMetric(t.volume, stock.volume, 'Volume')}
              </div>
            </div>
          </div>

          {/* Right Sticky Trade Ticket */}
          <div className="jomi-card jomi-card-pad jomi-stack-md">
            <h3 className="jomi-display jomi-title-md">
              {language === 'ENG' ? 'Practice Trade Ticket' : 'Tiket Dagangan Simulasi'}
            </h3>

            <div>
              <label className="jomi-label">{t.units}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-icon" onClick={decrement} aria-label="Decrease">
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="jomi-input jomi-nums"
                  style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}
                />
                <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-icon" onClick={increment} aria-label="Increase">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: 'var(--jomi-canvas)',
                border: '1.5px solid var(--jomi-border)',
              }}
              className="jomi-between"
            >
              <span className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>{t.estCost}</span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                RM {totalCost}
              </span>
            </div>

            <div className="jomi-stack-sm">
              <button
                type="button"
                className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full"
                onClick={() => addToPortfolio(stock, quantity)}
              >
                {t.buy}
              </button>
              <button
                type="button"
                className="jomi-btn jomi-btn-outline jomi-btn-full"
                onClick={() => navigateTo('portfolio')}
              >
                {t.sell}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="jomi-card jomi-card-pad jomi-stack-md">
          <h3 className="jomi-display jomi-title-md jomi-cluster">
            <DollarSign size={20} color="#0d9488" />
            <span>{t.financials}</span>
          </h3>
          <div className="jomi-grid-3">
            <div className="jomi-card-soft jomi-stack-xs">
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{t.revenue}</span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700 }}>RM {stock.revenue}</span>
            </div>
            <div className="jomi-card-soft jomi-stack-xs">
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{t.netProfit}</span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857' }}>RM {stock.netProfit}</span>
            </div>
            <div className="jomi-card-soft jomi-stack-xs">
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{t.debtEquity}</span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stock.debtEquity}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="jomi-stack-sm">
          {[
            { time: '2h ago · The Edge Markets', title: `${stock.name} reports resilient quarterly earnings amid ASEAN growth` },
            { time: '5h ago · StarBiz', title: `Analysts maintain positive outlook on ${stock.ticker} dividend sustainability` },
            { time: '1d ago · Bursa Filing', title: `${stock.name} highlights digital & sustainability capex roadmap` },
          ].map((item, idx) => (
            <div key={idx} className="jomi-card jomi-card-interactive jomi-card-pad">
              <div className="jomi-cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="jomi-ticker-badge">
                  <Newspaper size={18} />
                </div>
                <div className="jomi-stack-xs">
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{item.title}</h4>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
