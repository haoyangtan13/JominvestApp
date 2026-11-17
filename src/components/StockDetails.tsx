import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import type { Screen, PortfolioItem } from '../App';
import { StockData, calculateBursaFees } from '../data/stocks';

interface StockDetailsProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stock: StockData | null;
  allStocks: StockData[];
  setSelectedStock: (stock: StockData | null) => void;
  portfolio: PortfolioItem[];
  cashBalance: number;
  watchlist: StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (stockId: string) => void;
  addToPortfolio: (stock: StockData, quantity: number) => boolean;
  sellFromPortfolio: (stock: StockData, quantity?: number) => boolean;
  addXP: (amount: number, reason: string) => void;
  hasLearnedTerm: string[];
  setHasLearnedTerm: (terms: string[]) => void;
}

export function StockDetails({
  navigateTo,
  language,
  stock,
  allStocks,
  setSelectedStock,
  portfolio,
  cashBalance,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
  addToPortfolio,
  sellFromPortfolio,
  addXP,
  hasLearnedTerm,
  setHasLearnedTerm
}: StockDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [lotMode, setLotMode] = useState<'lot' | 'micro'>('lot');
  const [learningTerm, setLearningTerm] = useState<string | null>(null);
  const [peerStockId, setPeerStockId] = useState<string>('');

  useEffect(() => {
    if (!stock || !allStocks.length) return;
    const sameSector = allStocks.find(
      s => s.id !== stock.id && s.sector === stock.sector
    );
    const fallbackPeer = allStocks.find(s => s.id !== stock.id);
    const chosen = sameSector || fallbackPeer;
    if (chosen) {
      setPeerStockId(chosen.id);
    }
  }, [stock?.id, allStocks]);

  const definitions: Record<
    string,
    { ENG: { simple: string; detail: string }; BM: { simple: string; detail: string } }
  > = {
    'P/E Ratio': {
      ENG: {
        simple: 'Valuation multiple comparing share price to annual earnings per share.',
        detail:
          'Price-to-Earnings Ratio indicates how much capital investors pay per RM 1.00 of reported net profit. Comparing a security’s P/E against its Bursa Malaysia sector peer helps identify relative undervaluation or growth expectations.'
      },
      BM: {
        simple: 'Gandaan penilaian membandingkan harga saham dengan pendapatan sesaham tahunan.',
        detail:
          'Nisbah Harga-kepada-Pendapatan menunjukkan berapa pelabur membayar untuk setiap RM 1.00 keuntungan bersih. Membandingkan P/E dengan rakan sektor Bursa Malaysia membantu mengenal pasti penilaian relatif.'
      }
    },
    'Dividend Yield': {
      ENG: {
        simple: 'Annualized cash distribution expressed as a percentage of current share price.',
        detail:
          'Calculated as annual dividend per share divided by current market price. Malaysian blue-chip banks, utilities, and REITs traditionally distribute semi-annual or quarterly cash dividends.'
      },
      BM: {
        simple: 'Agihan tunai tahunan dinyatakan sebagai peratusan daripada harga saham semasa.',
        detail:
          'Dikira sebagai dividen tahunan sesaham dibahagikan dengan harga pasaran semasa. Saham cip biru Malaysia lazimnya mengagihkan dividen tunai secara separuh tahunan atau suku tahunan.'
      }
    },
    'Market Cap': {
      ENG: {
        simple: 'Total equity market valuation of all issued shares on Bursa Malaysia.',
        detail:
          'Computed by multiplying total issued shares by current market price. FBM KLCI constituents represent the 30 largest companies by full market capitalization on the Main Market.'
      },
      BM: {
        simple: 'Jumlah penilaian pasaran ekuiti bagi semua saham terbitan di Bursa Malaysia.',
        detail:
          'Dikira dengan mendarabkan jumlah saham terbitan dengan harga pasaran semasa. Komponen FBM KLCI mewakili 30 syarikat terbesar di Pasaran Utama.'
      }
    },
    'Volume': {
      ENG: {
        simple: 'Aggregate number of shares traded during the active KLSE session.',
        detail:
          'Higher trading volume signifies deeper order-book liquidity and tighter bid-ask spreads, allowing institutional and retail board-lot orders to clear with minimal slippage.'
      },
      BM: {
        simple: 'Jumlah agregat saham yang didagangkan sepanjang sesi aktif KLSE.',
        detail:
          'Volum dagangan yang tinggi menandakan kecairan buku pesanan yang kukuh dan memudahkan pesanan dibeli atau dijual dengan pantas.'
      }
    },
    'Shariah Status': {
      ENG: {
        simple: 'Screened semi-annually by the Shariah Advisory Council (SAC) of SC Malaysia.',
        detail:
          'Securities Commission Malaysia evaluates business activity benchmarks (5% revenue cap on conventional finance, insurance, gambling, liquor, tobacco; 20% cap on hotel/resort operations and share trading) and financial ratio thresholds (conventional debt and cash placed in conventional accounts must each remain below 33% of total assets).'
      },
      BM: {
        simple: 'Disaring dua kali setahun oleh Majlis Penasihat Syariah (MPS) Suruhanjaya Sekuriti Malaysia.',
        detail:
          'Suruhanjaya Sekuriti Malaysia menilai tanda aras aktiviti perniagaan (had 5% bagi kewangan konvensional, perjudian, arak, tembakau; had 20% bagi operasi hotel dan dagangan saham) serta tanda aras nisbah kewangan (hutang dan tunai konvensional masing-masing mestilah di bawah 33% daripada jumlah aset).'
      }
    }
  };

  const texts = {
    ENG: {
      backToScreener: '← Market Screener',
      addWatchlist: 'Add to Watchlist',
      inWatchlist: 'Tracked in Watchlist',
      viewThesis: 'Conviction Thesis →',
      chartKicker: 'HISTORICAL PRICE ACTION · 30 TRADING SESSIONS',
      chartTitle: '30-Day Price Chart (MYR)',
      radarKicker: 'MULTI-FACTOR QUANTITATIVE BENCHMARK',
      radarTitle: '5-Axis Fundamental Health Radar & Peer Benchmark',
      compareWithPeer: 'Benchmark Peer:',
      colMetric: 'Fundamental Metric',
      peRatio: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      revenue: 'Revenue',
      netProfit: 'Net Profit',
      debtEquity: 'Debt/Equity',
      volume: 'Volume',
      shariahStatus: 'Shariah Status',
      glossaryKicker: 'ANALYST COMPETENCY · +10 XP PER METRIC INSPECTED',
      glossaryTitle: 'Interactive Fundamental Glossary',
      ticketHeader: 'ORDER TICKET · KLSE SIMULATION',
      boardLot: 'Board Lot (×100 sh)',
      microUnit: 'Micro Unit (×1 sh)',
      quantityLabel: 'Order Quantity',
      availableCash: 'Available Cash',
      currentPosition: 'Current Position',
      feeScheduleTitle: 'Bursa Malaysia Fee Schedule',
      grossPrincipal: 'Gross Principal',
      brokerageFee: 'Brokerage (0.10%, min RM1)',
      clearingFee: 'Clearing Fee (0.03%)',
      stampDuty: 'Contract Stamp Duty',
      netSettlement: 'Net Settlement',
      executeBuy: 'Execute Buy Order',
      executeSell: 'Execute Sell Order',
      lotFootnote: '1 standard Bursa Malaysia board lot equals 100 shares. Micro Unit mode allows single-share sizing for practice.',
      filingsKicker: 'MARKET INTELLIGENCE & DISCLOSURES',
      filingsTitle: 'Recent Bursa Malaysia Filings & Sector Notes'
    },
    BM: {
      backToScreener: '← Saringan Pasaran',
      addWatchlist: 'Tambah Senarai Pantau',
      inWatchlist: 'Dalam Senarai Pantau',
      viewThesis: 'Tesis Konviksi →',
      chartKicker: 'PRESTASI HARGA HISTORIKAL · 30 SESI DAGANGAN',
      chartTitle: 'Carta Harga 30 Hari (MYR)',
      radarKicker: 'PENANDA ARAS KUANTITATIF PELBAGAI FAKTOR',
      radarTitle: 'Radar Kesihatan Asas 5-Paksi & Penanda Aras Rakan Setara',
      compareWithPeer: 'Rakan Setara:',
      colMetric: 'Metrik Asas',
      peRatio: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      revenue: 'Hasil',
      netProfit: 'Untung Bersih',
      debtEquity: 'Hutang/Ekuiti',
      volume: 'Volum',
      shariahStatus: 'Status Syariah',
      glossaryKicker: 'KOMPETENSI PENGANALISIS · +10 XP SETIAP METRIK DISEMAK',
      glossaryTitle: 'Glosari Asas Interaktif',
      ticketHeader: 'TIKET PESANAN · SIMULASI KLSE',
      boardLot: 'Lot Papan (×100 sh)',
      microUnit: 'Unit Mikro (×1 sh)',
      quantityLabel: 'Kuantiti Pesanan',
      availableCash: 'Tunai Tersedia',
      currentPosition: 'Pegangan Semasa',
      feeScheduleTitle: 'Jadual Yuran Bursa Malaysia',
      grossPrincipal: 'Prinsipal Kasar',
      brokerageFee: 'Brokeraj (0.10%, min RM1)',
      clearingFee: 'Yuran Penjelasan (0.03%)',
      stampDuty: 'Duti Setem Kontrak',
      netSettlement: 'Penyelesaian Bersih',
      executeBuy: 'Laksanakan Pesanan Beli',
      executeSell: 'Laksanakan Pesanan Jual',
      lotFootnote: '1 lot papan piawai Bursa Malaysia bersamaan 100 saham. Mod Unit Mikro membenarkan latihan unit tunggal.',
      filingsKicker: 'MAKLUMAT PASARAN & PENGUMUMAN',
      filingsTitle: 'Nota Sektor & Pengumuman Terkini Bursa Malaysia'
    }
  };

  const t = texts[language];

  const peerStock = useMemo(
    () => allStocks.find(s => s.id === peerStockId) || null,
    [allStocks, peerStockId]
  );

  const radarData = useMemo(() => {
    if (!stock) return [];
    const scores = stock.radarScores || {
      value: 70,
      growth: 70,
      health: 75,
      dividend: 70,
      momentum: 70
    };
    const peerScores = peerStock?.radarScores;

    return [
      {
        axis: 'Value',
        [stock.ticker]: scores.value,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.value } : {})
      },
      {
        axis: 'Growth',
        [stock.ticker]: scores.growth,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.growth } : {})
      },
      {
        axis: 'Health',
        [stock.ticker]: scores.health,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.health } : {})
      },
      {
        axis: 'Dividend',
        [stock.ticker]: scores.dividend,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.dividend } : {})
      },
      {
        axis: 'Momentum',
        [stock.ticker]: scores.momentum,
        ...(peerStock && peerScores ? { [peerStock.ticker]: peerScores.momentum } : {})
      }
    ];
  }, [stock, peerStock]);

  if (!stock) {
    return <div className="jom-container">Loading security terminal...</div>;
  }

  const isInWatchlist = watchlist.some(w => w.id === stock.id);
  const ownedHolding = portfolio.find(item => item.stock.id === stock.id);
  const ownedUnits = ownedHolding ? ownedHolding.quantity : 0;

  const effectiveUnits = lotMode === 'lot' ? quantity * 100 : quantity;
  const priceNum = parseFloat(stock.price);
  const buyFees = calculateBursaFees(priceNum, effectiveUnits, 'BUY');
  const sellUnits = Math.min(effectiveUnits, ownedUnits || effectiveUnits);
  const sellFees = calculateBursaFees(priceNum, sellUnits, 'SELL');

  const handleQuantityChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleTermClick = (termKey: string) => {
    if (!hasLearnedTerm.includes(termKey)) {
      addXP(10, `Inspected ${termKey}`);
      setHasLearnedTerm([...hasLearnedTerm, termKey]);
    }
    setLearningTerm(learningTerm === termKey ? null : termKey);
  };

  const glossaryItems = [
    { key: 'P/E Ratio', label: t.peRatio, value: `${stock.peRatio}x` },
    { key: 'Dividend Yield', label: t.dividend, value: stock.dividendYield },
    { key: 'Market Cap', label: t.marketCap, value: `RM ${stock.marketCap}` },
    { key: 'Volume', label: t.volume, value: stock.volume },
    {
      key: 'Shariah Status',
      label: t.shariahStatus,
      value: stock.isShariah ? 'SAC SHARIAH COMPLIANT' : 'CONVENTIONAL'
    }
  ];

  return (
    <div className="jom-container space-y-8">
      {/* Equity Header Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="jom-btn text-xs"
          >
            <ArrowLeft size={14} />
            <span>{t.backToScreener}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('ai-recommendation')}
              className="jom-btn text-xs"
            >
              <span>{t.viewThesis}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                isInWatchlist ? removeFromWatchlist(stock.id) : addToWatchlist(stock)
              }
              className={`jom-btn text-xs ${isInWatchlist ? 'jom-btn-inverse' : ''}`}
            >
              <Bookmark size={14} />
              <span>{isInWatchlist ? t.inWatchlist : t.addWatchlist}</span>
            </button>
          </div>
        </div>

        <div
          className="jom-panel p-6 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-tabular text-xs font-semibold">
                {stock.ticker} · {stock.bursaCode}
              </span>
              <span className="jom-tag">{stock.sector}</span>
              {stock.isShariah ? (
                <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
              ) : (
                <span className="jom-tag">CONVENTIONAL</span>
              )}
            </div>
            <h1 className="font-editorial text-4xl" style={{ color: 'var(--ink-primary)' }}>
              {stock.name}
            </h1>
            <p className="text-xs max-w-2xl leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {stock.description}
            </p>
          </div>

          <div className="md:text-right shrink-0 space-y-1">
            <div className="jom-kicker">LAST TRADED PRICE (MYR)</div>
            <div className="font-tabular text-3xl sm:text-4xl font-semibold">
              RM {stock.price}
            </div>
            <div className="flex md:justify-end items-center gap-2 pt-0.5">
              <span
                className={`jom-tag font-tabular ${
                  stock.isPositive ? 'jom-tag-up' : 'jom-tag-down'
                }`}
              >
                {stock.change} ({stock.changePercent})
              </span>
              {stock.lastUpdated && (
                <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {stock.lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Terminal Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* 30-Day Price Chart Panel */}
          <div className="jom-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="jom-kicker">{t.chartKicker}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.chartTitle}</h2>
              </div>
              <span className="jom-tag font-tabular">{stock.bursaCode} · DAILY EOD</span>
            </div>

            <div className="w-full" style={{ height: '290px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stock.history}>
                  <defs>
                    <linearGradient id="editorialPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A5C36" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#0A5C36" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    tickFormatter={str => {
                      const date = new Date(str);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    minTickGap={28}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    width={52}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, stock.ticker]}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#0A5C36"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#editorialPriceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5-Axis Fundamental Health Radar & Peer Benchmark */}
          <div className="jom-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="jom-kicker">{t.radarKicker}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.radarTitle}</h2>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="peer-select" className="jom-kicker whitespace-nowrap">
                  {t.compareWithPeer}
                </label>
                <select
                  id="peer-select"
                  value={peerStockId}
                  onChange={e => setPeerStockId(e.target.value)}
                  className="jom-input text-xs font-tabular"
                  style={{ width: 'auto', minWidth: '175px' }}
                >
                  {allStocks
                    .filter(s => s.id !== stock.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.ticker} · {s.sector}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 w-full" style={{ height: '270px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-hairline)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fill: 'var(--ink-secondary)' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name={stock.ticker}
                      dataKey={stock.ticker}
                      stroke="#0A5C36"
                      fill="#0A5C36"
                      fillOpacity={0.28}
                    />
                    {peerStock && (
                      <Radar
                        name={peerStock.ticker}
                        dataKey={peerStock.ticker}
                        stroke="#52585E"
                        fill="#52585E"
                        fillOpacity={0.18}
                      />
                    )}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Peer Benchmark Table */}
              {peerStock && (
                <div className="md:col-span-7 jom-panel-subtle overflow-hidden">
                  <div className="jom-table-wrap">
                    <table className="jom-table">
                      <thead>
                        <tr>
                          <th>{t.colMetric}</th>
                          <th style={{ textAlign: 'right' }}>{stock.ticker}</th>
                          <th style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedStock(peerStock)}
                              className="inline-flex items-center gap-1 underline cursor-pointer"
                              style={{ color: 'var(--ink-primary)' }}
                            >
                              <span>{peerStock.ticker}</span>
                              <ArrowUpRight size={12} />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.peRatio}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            {stock.peRatio}x
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            {peerStock.peRatio}x
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.dividend}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            {stock.dividendYield}
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            {peerStock.dividendYield}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.marketCap}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            RM {stock.marketCap}
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            RM {peerStock.marketCap}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.revenue}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            RM {stock.revenue}
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            RM {peerStock.revenue}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.netProfit}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            RM {stock.netProfit}
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            RM {peerStock.netProfit}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.debtEquity}
                          </td>
                          <td className="font-tabular text-xs font-semibold" style={{ textAlign: 'right' }}>
                            {stock.debtEquity}
                          </td>
                          <td className="font-tabular text-xs" style={{ textAlign: 'right' }}>
                            {peerStock.debtEquity}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                            {t.shariahStatus}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {stock.isShariah ? (
                              <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                            ) : (
                              <span className="jom-tag">CONVENTIONAL</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {peerStock.isShariah ? (
                              <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                            ) : (
                              <span className="jom-tag">CONVENTIONAL</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Fundamental Glossary (+10 XP per metric inspected) */}
          <div className="jom-panel overflow-hidden">
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <div className="jom-kicker">{t.glossaryKicker}</div>
                <h2 className="font-editorial text-2xl mt-0.5">{t.glossaryTitle}</h2>
              </div>
              <span className="jom-tag font-tabular">
                {hasLearnedTerm.length} / 5 VERIFIED
              </span>
            </div>

            <div>
              {glossaryItems.map((item, idx) => {
                const isExpanded = learningTerm === item.key;
                const isLearned = hasLearnedTerm.includes(item.key);
                const def = definitions[item.key];

                return (
                  <div
                    key={item.key}
                    className={idx !== glossaryItems.length - 1 ? 'border-b' : ''}
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleTermClick(item.key)}
                      className="w-full p-4 px-6 flex items-center justify-between text-left cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isExpanded ? 'var(--bg-subtle)' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm" style={{ color: 'var(--ink-primary)' }}>
                          {item.label}
                        </span>
                        {isLearned ? (
                          <span className="jom-tag jom-tag-shariah">VERIFIED</span>
                        ) : (
                          <span className="jom-tag">+10 XP</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-tabular text-sm font-semibold">
                          {item.value}
                        </span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {isExpanded && def && (
                      <div
                        className="px-6 pb-5 pt-2 space-y-2 border-t"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          backgroundColor: 'var(--bg-elevated)'
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                          {def[language].simple}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                          {def[language].detail}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Filings & Sector Notes */}
          <div className="jom-panel p-6 space-y-4">
            <div>
              <div className="jom-kicker">{t.filingsKicker}</div>
              <h3 className="font-editorial text-2xl mt-0.5">{t.filingsTitle}</h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  headline: `${stock.name} (${stock.bursaCode}) reports resilient quarterly operational performance on Bursa Malaysia Main Market`,
                  source: 'THE EDGE MALAYSIA · INSTITUTIONAL DESK'
                },
                {
                  headline: `Domestic institutional funds maintain net allocation in ${stock.sector} constituents ahead of dividend cycle`,
                  source: 'BURSA MARKETPLACE · SECTOR BRIEFING'
                }
              ].map((note, index) => (
                <div key={index} className="jom-panel-subtle p-4 space-y-1">
                  <div className="jom-kicker">{note.source}</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                    {note.headline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns — Sticky Brokerage Order Ticket */}
        <div className="lg:col-span-4">
          <div className="jom-panel p-6 sticky top-20 space-y-5">
            <div
              className="pb-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <span className="jom-kicker">{t.ticketHeader}</span>
              <span className="jom-tag font-tabular">{stock.ticker}</span>
            </div>

            {/* Segmented Unit Mode */}
            <div className="space-y-2">
              <div className="jom-segmented w-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLotMode('lot')}
                  className={lotMode === 'lot' ? 'active' : ''}
                >
                  {t.boardLot}
                </button>
                <button
                  type="button"
                  onClick={() => setLotMode('micro')}
                  className={lotMode === 'micro' ? 'active' : ''}
                >
                  {t.microUnit}
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {t.lotFootnote}
              </p>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="jom-kicker">{t.quantityLabel}</span>
                <span className="font-tabular text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                  = {effectiveUnits} sh
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decrement}
                  className="jom-btn px-3 py-2"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className="jom-input font-tabular text-center font-semibold"
                />
                <button
                  type="button"
                  onClick={increment}
                  className="jom-btn px-3 py-2"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Position & Buying Power Summary */}
            <div className="jom-panel-subtle p-3.5 space-y-2 font-tabular text-xs">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.availableCash}</span>
                <span className="font-semibold" style={{ color: 'var(--signal-up)' }}>
                  RM {cashBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.currentPosition}</span>
                <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                  {ownedUnits} sh ({Math.floor(ownedUnits / 100)} lots)
                </span>
              </div>
            </div>

            {/* Line-Item Bursa Malaysia Fee Schedule */}
            <div
              className="space-y-2.5 pt-3 border-t font-tabular text-xs"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="jom-kicker">{t.feeScheduleTitle}</div>

              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {t.grossPrincipal} ({effectiveUnits} × {stock.price})
                </span>
                <span>RM {buyFees.grossAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.brokerageFee}</span>
                <span>RM {buyFees.brokerageFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.clearingFee}</span>
                <span>RM {buyFees.clearingFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--ink-secondary)' }}>{t.stampDuty}</span>
                <span>RM {buyFees.stampDuty.toFixed(2)}</span>
              </div>

              <div
                className="flex items-center justify-between pt-2.5 border-t text-sm font-semibold"
                style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
              >
                <span>{t.netSettlement}</span>
                <span>RM {buyFees.netTotal.toFixed(2)}</span>
              </div>

              {ownedUnits > 0 && (
                <div
                  className="flex items-center justify-between pt-1 text-xs"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  <span>Est. Sell Proceeds ({sellUnits} sh)</span>
                  <span>RM {sellFees.netTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Execution Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => addToPortfolio(stock, effectiveUnits)}
                className="jom-btn jom-btn-primary w-full py-2.5"
              >
                {t.executeBuy} ({effectiveUnits} sh)
              </button>

              <button
                type="button"
                disabled={ownedUnits <= 0}
                onClick={() => sellFromPortfolio(stock, effectiveUnits)}
                className="jom-btn jom-btn-danger w-full py-2.5"
              >
                {t.executeSell} ({ownedUnits > 0 ? sellUnits : 0} sh)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
