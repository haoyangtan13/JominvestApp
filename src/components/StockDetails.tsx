import { useState, useMemo, useEffect, useCallback } from 'react';
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
  ShieldCheck,
  Coins,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';
import { StockBadge } from './StockVisuals';
import { formatRMFromSen, priceToSen } from '../lib/simulator';
import {
  analyzeStockReport,
  computeStockTechnicals,
  fetchLiveStockNews,
  safeExternalHref,
  type NewsHeadline,
  type StockReportSummary,
} from '../services/aiService';

interface StockDetailsProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stock: StockData | null;
  allStocks?: StockData[];
  cashSen: number;
  heldQuantity: number;
  buyStock: (stock: StockData, quantity: number) => void;
  sellStock: (stock: StockData, quantity: number) => void;
  addXP: (amount: number, reason: string) => void;
  hasLearnedTerm: string[];
  setHasLearnedTerm: (terms: string[]) => void;
}

export function StockDetails({
  navigateTo,
  language,
  stock,
  allStocks,
  cashSen,
  heldQuantity,
  buyStock,
  sellStock,
  addXP,
  hasLearnedTerm,
  setHasLearnedTerm,
}: StockDetailsProps) {
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(10);
  const [learningTerm, setLearningTerm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'news'>('overview');
  const [timeframe, setTimeframe] = useState<'7D' | '15D' | '1M'>('1M');
  const [liveReport, setLiveReport] = useState<StockReportSummary | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [liveNews, setLiveNews] = useState<NewsHeadline[]>([]);
  const [newsSource, setNewsSource] = useState<'live' | 'offline' | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const definitions: Record<string, { ENG: { simple: string; detail: string }; BM: { simple: string; detail: string } }> = {
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
      priceChart: 'Interactive KLSE Price Action',
      keyMetrics: 'Tap a Metric to Learn (+10 XP)',
      peRatio: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      volume: 'Volume',
      overview: 'Overview & Trade',
      financials: 'Financials',
      news: 'News',
      buy: 'Execute Buy (+50 XP)',
      sell: 'Execute Sell (+30 XP)',
      revenue: 'Annual Revenue',
      netProfit: 'Net Profit',
      debtEquity: 'Debt / Equity',
      units: 'Quantity (Units)',
      estCost: 'Order Value',
      xpReward: '+10 XP',
      quickLearn: 'Jom-Learn Quick Tip',
      knowledgeGained: 'Knowledge Gained!',
      aiInsight: 'JomINVEST AI Insight',
      periodHigh: 'Period High',
      periodLow: 'Period Low',
      periodAvg: 'Avg Baseline',
      availCash: 'Available Cash',
      heldShares: 'You Hold',
      insufficientCash: 'Exceeds virtual cash balance',
      lotHint: '1 Bursa Lot = 100',
    },
    BM: {
      back: 'Kembali ke Papan Pemuka',
      priceChart: 'Carta Pergerakan Harga KLSE',
      keyMetrics: 'Ketik Metrik Untuk Belajar (+10 XP)',
      peRatio: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      volume: 'Volum Dagangan',
      overview: 'Gambaran & Dagang',
      financials: 'Kewangan',
      news: 'Berita',
      buy: 'Sahkan Belian (+50 XP)',
      sell: 'Sahkan Jualan (+30 XP)',
      revenue: 'Hasil Tahunan',
      netProfit: 'Untung Bersih',
      debtEquity: 'Hutang / Ekuiti',
      units: 'Kuantiti (Unit)',
      estCost: 'Nilai Pesanan',
      xpReward: '+10 XP',
      quickLearn: 'Tip Pantas Jom-Belajar',
      knowledgeGained: 'Ilmu Diperolehi!',
      aiInsight: 'Wawasan AI JomINVEST',
      periodHigh: 'Tertinggi',
      periodLow: 'Terendah',
      periodAvg: 'Purata',
      availCash: 'Tunai Tersedia',
      heldShares: 'Pegangan Anda',
      insufficientCash: 'Melebihi baki tunai maya',
      lotHint: '1 Lot Bursa = 100',
    },
  };

  const t = texts[language];

  const chartSlice = useMemo(() => {
    if (!stock?.history) return [];
    if (timeframe === '7D') return stock.history.slice(-7);
    if (timeframe === '15D') return stock.history.slice(-15);
    return stock.history;
  }, [stock, timeframe]);

  const chartStats = useMemo(() => {
    if (!chartSlice.length) return { high: 0, low: 0, avg: 0 };
    const prices = chartSlice.map((p) => p.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { high, low, avg };
  }, [chartSlice]);

  const technicals = useMemo(() => (stock ? computeStockTechnicals(stock) : null), [stock]);

  const loadLiveNews = useCallback(async (target: StockData) => {
    setIsLoadingNews(true);
    const res = await fetchLiveStockNews(target);
    setLiveNews(res.headlines);
    setNewsSource(res.source);
    setIsLoadingNews(false);
  }, []);

  const handleRunLiveInsight = async () => {
    if (!stock || isLoadingInsight) return;
    setIsLoadingInsight(true);
    const res = await analyzeStockReport(stock, language, undefined, fetch, allStocks);
    setLiveReport(res);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    setLiveReport(null);
    setLiveNews([]);
    setNewsSource(null);
  }, [stock?.id]);

  useEffect(() => {
    if (stock && activeTab === 'news' && newsSource === null && !isLoadingNews) {
      void loadLiveNews(stock);
    }
  }, [stock, activeTab, newsSource, isLoadingNews, loadLiveNews]);

  if (!stock) {
    return (
      <div className="jomi-card jomi-card-pad jomi-stack-md" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <p className="jomi-title-md">Select a stock from Dashboard to view details.</p>
        <div>
          <button type="button" className="jomi-btn jomi-btn-primary" onClick={() => navigateTo('dashboard')}>
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const unitPriceSen = priceToSen(stock.price);
  const orderTotalSen = unitPriceSen * quantity;
  const maxBuyable = unitPriceSen > 0 ? Math.floor(cashSen / unitPriceSen) : 0;
  const canBuy = quantity >= 1 && orderTotalSen <= cashSen;
  const canSell = quantity >= 1 && quantity <= heldQuantity;

  const handleQuantityChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) setQuantity(num);
  };

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
            <StockBadge ticker={stock.ticker} sector={stock.sector} size="lg" />
            <div className="jomi-stack-xs">
              <div className="jomi-cluster">
                <h2 className="jomi-display jomi-title-lg">{stock.name}</h2>
                <span className="jomi-pill-sector">{stock.sector}</span>
                {stock.shariahCompliant && (
                  <span className="jomi-pill-shariah">
                    <ShieldCheck size={12} />
                    Shariah-Compliant
                  </span>
                )}
              </div>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
                {stock.ticker} · {stock.klseCode} · Bursa Malaysia
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }} className="jomi-stack-xs">
            <div className="jomi-display jomi-nums" style={{ fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.1 }}>
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
          {/* Left: Rich Price Chart + Description + Tap-to-Learn Metrics */}
          <div className="jomi-stack-lg">
            {/* Live AI & News Insight Banner */}
            <div className="jomi-card-soft jomi-stack-sm">
              <div className="jomi-between">
                <div className="jomi-cluster" style={{ color: '#065f46', fontWeight: 800, fontSize: '0.9rem' }}>
                  <Sparkles size={17} color="#0d9488" />
                  <span>{t.aiInsight}</span>
                  {technicals && (
                    <span className="jomi-pill-neutral jomi-nums">30D: {technicals.return30dPct}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-primary jomi-btn-sm"
                  onClick={() => void handleRunLiveInsight()}
                  disabled={isLoadingInsight}
                >
                  {isLoadingInsight ? <Loader2 size={14} /> : <Sparkles size={14} />}
                  <span>
                    {isLoadingInsight
                      ? (language === 'ENG' ? 'Analyzing...' : 'Menganalisis...')
                      : liveReport
                        ? (language === 'ENG' ? 'Refresh AI Brief' : 'Segar Semula AI')
                        : (language === 'ENG' ? 'Run Live AI & News Insight' : 'Jana Analisis AI & Berita')}
                  </span>
                </button>
              </div>

              {!liveReport ? (
                <>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    {technicals ? technicals.trend : (stock.isPositive ? 'Positive Momentum' : 'Consolidation Zone')}
                  </p>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    {language === 'ENG'
                      ? `${stock.name} (${stock.klseCode}) trades at ${stock.peRatio}x P/E (${stock.dividendYield} yield), 30D range RM ${technicals?.low30d ?? stock.price}–RM ${technicals?.high30d ?? stock.price}. Click "Run Live AI & News Insight" for live catalysts & peer comparison.`
                      : `${stock.name} (${stock.klseCode}) didagangkan pada P/E ${stock.peRatio}x (hasil ${stock.dividendYield}). Tekan "Jana Analisis AI & Berita" untuk pemangkin berita & perbandingan rakan sektor.`}
                  </p>
                </>
              ) : (
                <div className="jomi-stack-xs">
                  <div className="jomi-cluster">
                    <span className="jomi-pill-gain">
                      {liveReport.source === 'live-ai' ? 'Live AI + News' : 'Local Brief'}
                    </span>
                    <span className="jomi-pill-neutral jomi-nums">Score: {liveReport.score}/100</span>
                  </div>
                  <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{liveReport.growth}</p>
                  {liveReport.newsCatalysts && (
                    <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                      <strong>{language === 'ENG' ? 'News Catalyst: ' : 'Pemangkin Berita: '}</strong>
                      {liveReport.newsCatalysts}
                    </p>
                  )}
                  {liveReport.peerComparison && (
                    <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                      <strong>{language === 'ENG' ? 'Peer Context: ' : 'Perbandingan Sektor: '}</strong>
                      {liveReport.peerComparison}
                    </p>
                  )}
                  {liveReport.studentTakeaway && (
                    <p className="jomi-text-xs" style={{ fontWeight: 800, color: '#065f46' }}>
                      {liveReport.studentTakeaway}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Timeframe Price Chart Card */}
            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <div className="jomi-between">
                <h3 className="jomi-display jomi-title-md">{t.priceChart}</h3>
                <div className="jomi-tabs-bar">
                  {(['7D', '15D', '1M'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`jomi-tab-btn ${timeframe === tf ? 'jomi-tab-btn-active' : ''}`}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.74rem' }}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jomi-grid-3">
                <div style={{ padding: '0.6rem 0.85rem', borderRadius: '0.85rem', backgroundColor: 'var(--jomi-emerald-soft)', border: '1.5px solid var(--jomi-emerald-border)' }}>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>{t.periodHigh}</p>
                  <p className="jomi-display jomi-nums" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#047857' }}>
                    RM {chartStats.high.toFixed(2)}
                  </p>
                </div>
                <div style={{ padding: '0.6rem 0.85rem', borderRadius: '0.85rem', backgroundColor: 'var(--jomi-canvas)', border: '1.5px solid var(--jomi-border)' }}>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>{t.periodAvg}</p>
                  <p className="jomi-display jomi-nums" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    RM {chartStats.avg.toFixed(2)}
                  </p>
                </div>
                <div style={{ padding: '0.6rem 0.85rem', borderRadius: '0.85rem', backgroundColor: 'var(--jomi-coral-soft)', border: '1.5px solid var(--jomi-coral-border)' }}>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>{t.periodLow}</p>
                  <p className="jomi-display jomi-nums" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#b91c1c' }}>
                    RM {chartStats.low.toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartSlice} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="jomiStockPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.42} />
                        <stop offset="85%" stopColor={chartColor} stopOpacity={0.04} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d6eae3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                      tick={{ fontSize: 11, fill: '#527972', fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      domain={['dataMin - 0.08', 'dataMax + 0.08']}
                      tickFormatter={(v) => v.toFixed(2)}
                      tick={{ fontSize: 11, fill: '#527972', fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <ReferenceLine y={chartStats.avg} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const val = Number(payload[0].value);
                        return (
                          <div className="jomi-chart-tooltip jomi-nums">
                            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', marginBottom: '2px' }}>{label}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800 }}>RM {val.toFixed(2)}</div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartColor}
                      strokeWidth={3}
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: chartColor }}
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

          {/* Right Trade Ticket (Buy & Partial/Full Sell + Cash Balance) */}
          <div className="jomi-card jomi-card-pad jomi-stack-md">
            <div className="jomi-between">
              <h3 className="jomi-display jomi-title-md">
                {language === 'ENG' ? 'Practice Trade Ticket' : 'Tiket Dagangan Simulasi'}
              </h3>
              <span className="jomi-pill-sector">{t.lotHint}</span>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="jomi-tabs-bar" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                onClick={() => setTradeSide('BUY')}
                className={`jomi-tab-btn ${tradeSide === 'BUY' ? 'jomi-tab-btn-active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                {language === 'ENG' ? 'BUY' : 'BELI'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTradeSide('SELL');
                  if (heldQuantity > 0 && quantity > heldQuantity) setQuantity(heldQuantity);
                }}
                className={`jomi-tab-btn ${tradeSide === 'SELL' ? 'jomi-tab-btn-active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                {language === 'ENG' ? `SELL (${heldQuantity})` : `JUAL (${heldQuantity})`}
              </button>
            </div>

            {/* Wallet & Position Status */}
            <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.8rem 0.95rem' }}>
              <div className="jomi-between jomi-text-xs">
                <span className="jomi-muted" style={{ fontWeight: 800 }}>
                  <Coins size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {t.availCash}
                </span>
                <span className="jomi-nums" style={{ fontWeight: 800, color: '#047857' }}>
                  RM {formatRMFromSen(cashSen)}
                </span>
              </div>
              <div className="jomi-between jomi-text-xs">
                <span className="jomi-muted" style={{ fontWeight: 800 }}>{t.heldShares}</span>
                <span className="jomi-nums" style={{ fontWeight: 800 }}>{heldQuantity} units</span>
              </div>
            </div>

            {/* Quantity Input + Quick Presets */}
            <div className="jomi-stack-xs">
              <label className="jomi-label" style={{ marginBottom: 0 }}>{t.units}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                  aria-label="Decrease"
                >
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
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-icon"
                  onClick={() => setQuantity((q) => q + 10)}
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="jomi-cluster" style={{ gap: '0.4rem', paddingTop: '0.25rem' }}>
                {tradeSide === 'BUY' ? (
                  <>
                    {[10, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="jomi-btn jomi-btn-outline jomi-btn-sm"
                        onClick={() => setQuantity(preset)}
                      >
                        {preset}u
                      </button>
                    ))}
                    {maxBuyable > 0 && (
                      <button
                        type="button"
                        className="jomi-btn jomi-btn-outline jomi-btn-sm"
                        onClick={() => setQuantity(maxBuyable)}
                      >
                        Max ({maxBuyable})
                      </button>
                    )}
                  </>
                ) : (
                  heldQuantity > 0 && (
                    <>
                      <button
                        type="button"
                        className="jomi-btn jomi-btn-outline jomi-btn-sm"
                        onClick={() => setQuantity(Math.max(1, Math.floor(heldQuantity / 2)))}
                      >
                        50% ({Math.max(1, Math.floor(heldQuantity / 2))})
                      </button>
                      <button
                        type="button"
                        className="jomi-btn jomi-btn-outline jomi-btn-sm"
                        onClick={() => setQuantity(heldQuantity)}
                      >
                        All ({heldQuantity})
                      </button>
                    </>
                  )
                )}
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
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                RM {formatRMFromSen(orderTotalSen)}
              </span>
            </div>

            {tradeSide === 'BUY' && !canBuy && (
              <p className="jomi-text-xs" style={{ color: '#b91c1c', fontWeight: 800 }}>
                {t.insufficientCash} (Max: {maxBuyable} units)
              </p>
            )}

            <div className="jomi-stack-sm">
              {tradeSide === 'BUY' ? (
                <button
                  type="button"
                  disabled={!canBuy}
                  className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full"
                  onClick={() => buyStock(stock, quantity)}
                >
                  {t.buy}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canSell}
                  className="jomi-btn jomi-btn-danger jomi-btn-lg jomi-btn-full"
                  onClick={() => sellStock(stock, quantity)}
                >
                  {t.sell}
                </button>
              )}
              <button
                type="button"
                className="jomi-btn jomi-btn-outline jomi-btn-full"
                onClick={() => navigateTo('portfolio')}
              >
                {language === 'ENG' ? 'Open Portfolio & Ledger' : 'Buka Portfolio & Lejar'}
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
        <div className="jomi-stack-md">
          <div className="jomi-between">
            <div className="jomi-cluster">
              <span className="jomi-pill-gain">
                {newsSource === 'live' ? 'Live Malaysian RSS' : 'News Feed'}
              </span>
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                {stock.name} ({stock.klseCode})
              </span>
            </div>
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => void loadLiveNews(stock)}
              disabled={isLoadingNews}
            >
              {isLoadingNews ? <Loader2 size={14} /> : <RefreshCw size={14} />}
              <span>{language === 'ENG' ? 'Refresh News' : 'Segar Berita'}</span>
            </button>
          </div>

          {isLoadingNews ? (
            <div className="jomi-card jomi-card-pad jomi-cluster" style={{ justifyContent: 'center', padding: '2rem' }}>
              <Loader2 size={18} />
              <span className="jomi-text-sm" style={{ fontWeight: 700 }}>
                {language === 'ENG' ? `Fetching live headlines for ${stock.ticker}...` : `Memuat turun berita terkini ${stock.ticker}...`}
              </span>
            </div>
          ) : liveNews.length > 0 ? (
            <div className="jomi-stack-sm">
              {liveNews.map((item, idx) => (
                <a
                  key={idx}
                  href={safeExternalHref(item.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jomi-card jomi-card-interactive jomi-card-pad"
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="jomi-between" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="jomi-cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: '1rem' }}>
                      <div className="jomi-ticker-badge">
                        <Newspaper size={18} />
                      </div>
                      <div className="jomi-stack-xs">
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{item.title}</h4>
                        <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                          {item.timeAgo} · {item.source}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={15} color="#0d9488" style={{ flexShrink: 0, marginTop: '3px' }} />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="jomi-card jomi-card-pad jomi-stack-xs" style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
                {language === 'ENG'
                  ? `No recent RSS headlines returned for ${stock.name} right now. Check the Overview tab for live AI & peer analysis.`
                  : `Tiada berita RSS terkini ditemui untuk ${stock.name} buat masa ini.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
