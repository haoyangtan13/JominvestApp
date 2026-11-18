import { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
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

function getPlainEnglishStory(
  stock: StockData,
  language: 'ENG' | 'BM'
): { howTheyMakeMoney: string; dividendVsEpf: string } {
  const divNum = parseFloat((stock.dividendYield || '0').replace('%', '')) || 0;
  const epfBenchmark = 5.5;
  const diffFromEpf = (divNum - epfBenchmark).toFixed(2);
  const beatsEpf = divNum >= epfBenchmark;

  const businessStoriesEN: Record<string, string> = {
    MAYBANK:
      'Maybank takes deposits from millions of Malaysians and businesses, lends for mortgages, car loans, and corporate expansion, and earns fees across Malaysia, Singapore, and Indonesia.',
    TENAGA:
      'Tenaga Nasional operates the national power grid across Peninsular Malaysia, collecting recurring monthly electricity payments from households, factories, and data centers.',
    CIMB:
      'CIMB Group operates consumer banking, Touch ’n Go Digital partnerships, and regional investment banking across Malaysia, Indonesia, Singapore, and Thailand.',
    PBBANK:
      'Public Bank focuses on residential mortgages, passenger car financing, and SME lending, maintaining one of the lowest loan default rates in Asia.',
    GAMUDA:
      'Gamuda builds major regional infrastructure — MRT lines, highways, water plants, and data center campuses — alongside master-planned residential townships.',
    INARI:
      'Inari Amertron is Malaysia’s largest semiconductor outsourced assembly and test (OSAT) provider in Penang, packaging and testing RF and optical chips for smartphones and servers.'
  };

  const businessStoriesBM: Record<string, string> = {
    MAYBANK:
      'Maybank menerima simpanan jutaan rakyat dan perniagaan, menyalurkan pembiayaan perumahan, kenderaan, dan korporat di Malaysia, Singapura, dan Indonesia.',
    TENAGA:
      'Tenaga Nasional mengendalikan grid elektrik Semenanjung Malaysia dengan aliran tunai bulanan daripada isi rumah, kilang, dan pusat data.',
    CIMB:
      'CIMB mengendalikan perbankan pengguna, ekosistem digital, dan perbankan pelaburan serantau di ASEAN.',
    PBBANK:
      'Public Bank memberi tumpuan kepada pinjaman perumahan, kenderaan, dan PKS dengan kualiti pinjaman yang sangat berdisiplin.',
    GAMUDA:
      'Gamuda membina projek infrastruktur utama seperti MRT, lebuh raya, dan pusat data serta membangunkan perbandaran kediaman.',
    INARI:
      'Inari Amertron memasang dan menguji cip semikonduktor frekuensi radio serta optik di Pulau Pinang.'
  };

  const howTheyMakeMoney =
    language === 'ENG'
      ? businessStoriesEN[stock.ticker] ||
        `${stock.name} operates in Malaysia's ${stock.sector} sector. ${stock.description} Annual revenue is RM ${stock.revenue} with RM ${stock.netProfit} in net profit.`
      : businessStoriesBM[stock.ticker] ||
        `${stock.name} beroperasi dalam sektor ${stock.sector} di Malaysia. ${stock.description} Jualan tahunan ialah RM ${stock.revenue} dengan untung bersih RM ${stock.netProfit}.`;

  const dividendVsEpf =
    language === 'ENG'
      ? divNum > 0
        ? beatsEpf
          ? `Pays a ${stock.dividendYield} annual dividend yield (${diffFromEpf}% above the 5.5% EPF historical benchmark).`
          : `Pays a ${stock.dividendYield} annual dividend yield compared to the 5.5% EPF benchmark, balancing cash payouts with capital growth.`
        : `Reinvests most earnings back into operations (${stock.dividendYield} dividend yield vs. 5.5% EPF benchmark).`
      : divNum > 0
      ? beatsEpf
        ? `Membayar hasil dividen tahunan ${stock.dividendYield} (${diffFromEpf}% mengatasi penanda aras KWSP 5.5%).`
        : `Membayar hasil dividen tahunan ${stock.dividendYield} berbanding penanda aras KWSP 5.5%.`
      : `Melaburkan semula sebahagian besar keuntungan ke dalam operasi (${stock.dividendYield}).`;

  return { howTheyMakeMoney, dividendVsEpf };
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
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
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
    {
      ENG: { simple: string; detail: string };
      BM: { simple: string; detail: string };
    }
  > = {
    'P/E Ratio': {
      ENG: {
        simple: 'How many years of current profits it takes to pay back the share price.',
        detail:
          'Price-to-Earnings compares share price to annual profit per share. Lower P/E can indicate value; higher P/E reflects higher growth expectations.'
      },
      BM: {
        simple: 'Berapa tahun keuntungan semasa diperlukan untuk menyamai harga belian saham.',
        detail:
          'Nisbah Harga-kepada-Pendapatan (P/E) membandingkan harga saham dengan keuntungan bersih sesaham.'
      }
    },
    'Dividend Yield': {
      ENG: {
        simple: 'Yearly cash dividend expressed as a percentage of the current share price.',
        detail:
          'Malaysian single-tier dividends are tax-exempt in the hands of retail shareholders. Compare directly against EPF (5.5%) or fixed deposit rates.'
      },
      BM: {
        simple: 'Pulangan tunai tahunan dalam bentuk peratusan daripada harga saham semasa.',
        detail:
          'Dividen saham di Malaysia dikecualikan cukai untuk pelabur runcit dan boleh dibandingkan terus dengan kadar KWSP (5.5%).'
      }
    },
    'Market Cap': {
      ENG: {
        simple: 'Total market value of all issued shares of the company.',
        detail:
          'Calculated as Share Price × Total Shares. FBM KLCI constituents are the 30 largest companies on the exchange.'
      },
      BM: {
        simple: 'Nilai pasaran keseluruhan bagi semua saham terbitan syarikat.',
        detail:
          'Dikira sebagai Harga Saham × Jumlah Saham Terbitan.'
      }
    },
    'FY Revenue / Profit': {
      ENG: {
        simple: 'Total annual customer sales vs. net profit remaining after all expenses.',
        detail:
          'Revenue is top-line sales; Net Profit is the bottom-line earnings left after operating costs, interest, and taxes.'
      },
      BM: {
        simple: 'Jumlah jualan tahunan berbanding untung bersih selepas ditolak semua kos.',
        detail:
          'Hasil ialah jumlah jualan keseluruhan; Untung Bersih ialah baki keuntungan selepas kos operasi dan cukai.'
      }
    }
  };

  const peerStock = useMemo(
    () => allStocks.find(s => s.id === peerStockId) || null,
    [allStocks, peerStockId]
  );

  const filteredChartHistory = useMemo(() => {
    if (!stock?.history?.length) return [];
    const len = stock.history.length;
    if (timeframe === '1D') return stock.history.slice(Math.max(0, len - 5));
    if (timeframe === '1W') return stock.history.slice(Math.max(0, len - 7));
    return stock.history;
  }, [stock, timeframe]);

  if (!stock) {
    return <div className="rh-page">Loading...</div>;
  }

  const isInWatchlist = watchlist.some(w => w.id === stock.id);
  const ownedHolding = portfolio.find(item => item.stock.id === stock.id);
  const ownedUnits = ownedHolding ? ownedHolding.quantity : 0;

  const effectiveUnits = lotMode === 'lot' ? quantity * 100 : quantity;
  const priceNum = parseFloat(stock.price);
  const buyFees = calculateBursaFees(priceNum, effectiveUnits, 'BUY');
  const sellUnits = Math.min(effectiveUnits, ownedUnits || effectiveUnits);
  const sellFees = calculateBursaFees(priceNum, sellUnits, 'SELL');
  const fees = tradeSide === 'BUY' ? buyFees : sellFees;

  const plainStory = getPlainEnglishStory(stock, language);

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
      addXP(10, `Learned ${termKey}`);
      setHasLearnedTerm([...hasLearnedTerm, termKey]);
    }
    setLearningTerm(learningTerm === termKey ? null : termKey);
  };

  const keyStats = [
    {
      key: 'Market Cap',
      label: language === 'ENG' ? 'Market Cap' : 'Modal Pasaran',
      value: `RM ${stock.marketCap}`
    },
    {
      key: 'P/E Ratio',
      label: language === 'ENG' ? 'P/E Ratio' : 'Nisbah P/E',
      value: `${stock.peRatio}x`
    },
    {
      key: 'Dividend Yield',
      label: language === 'ENG' ? 'Dividend Yield' : 'Hasil Dividen',
      value: stock.dividendYield
    },
    {
      key: 'FY Revenue / Profit',
      label: language === 'ENG' ? 'Revenue / Net Profit' : 'Jualan / Untung Bersih',
      value: `RM ${stock.revenue} / ${stock.netProfit}`
    }
  ];

  const handleOrderSubmit = () => {
    if (tradeSide === 'BUY') {
      addToPortfolio(stock, effectiveUnits);
    } else if (ownedUnits > 0) {
      sellFromPortfolio(stock, sellUnits);
    }
  };

  const strokeColor = stock.isPositive ? 'var(--signal-up)' : 'var(--signal-down)';

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Main Column */}
        <div className="rh-main space-y-10">
          {/* Back link */}
          <div>
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="rh-link-btn"
            >
              {language === 'ENG' ? '← All stocks' : '← Semua saham'}
            </button>
          </div>

          {/* Unboxed Stock Header & Chart */}
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">
                  {stock.name}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                  {stock.ticker} · {stock.bursaCode} · {stock.sector}
                  {stock.isShariah ? ' · Shariah' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  isInWatchlist ? removeFromWatchlist(stock.id) : addToWatchlist(stock)
                }
                className="jom-btn text-xs py-1.5 px-3"
              >
                <Bookmark size={13} />
                <span>
                  {isInWatchlist
                    ? language === 'ENG'
                      ? 'Saved'
                      : 'Disimpan'
                    : language === 'ENG'
                    ? 'Watch'
                    : 'Pantau'}
                </span>
              </button>
            </div>

            <div className="rh-hero-num mt-4">RM {stock.price}</div>
            <div
              className="text-xs font-medium font-tabular mt-1"
              style={{ color: strokeColor }}
            >
              {stock.change} ({stock.changePercent}) · {timeframe}
            </div>

            <div className="w-full mt-4" style={{ height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    tickFormatter={str => {
                      const date = new Date(str);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    minTickGap={28}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                    width={44}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, stock.ticker]}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={strokeColor}
                    strokeWidth={1.75}
                    fillOpacity={0}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rh-timeframe-bar">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rh-tf-btn ${timeframe === tf ? 'active' : ''}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Key Statistics (Unboxed Hairline Grid) */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">
                {language === 'ENG' ? 'Key Statistics' : 'Statistik Utama'}
              </h2>
              <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                {language === 'ENG' ? 'Select any metric for definition' : 'Klik statistik untuk penerangan'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              {keyStats.map(stat => {
                const isSelected = learningTerm === stat.key;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => handleTermClick(stat.key)}
                    className="rh-kv-row text-left cursor-pointer"
                    style={{
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none'
                    }}
                  >
                    <span
                      style={{
                        color: isSelected ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                        textUnderlineOffset: '3px'
                      }}
                    >
                      {stat.label}
                    </span>
                    <span className="font-tabular font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {stat.value}
                    </span>
                  </button>
                );
              })}
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Debt / Equity' : 'Hutang / Ekuiti'}
                </span>
                <span className="font-tabular font-medium">{stock.debtEquity}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Volume' : 'Volum'}
                </span>
                <span className="font-tabular font-medium">{stock.volume}</span>
              </div>
            </div>

            {learningTerm && definitions[learningTerm] && (
              <div
                className="p-3.5 rounded-lg text-xs space-y-1"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div className="flex items-center justify-between font-semibold" style={{ color: 'var(--ink-primary)' }}>
                  <span>{learningTerm}</span>
                  <button
                    type="button"
                    onClick={() => setLearningTerm(null)}
                    className="rh-link-btn"
                  >
                    {language === 'ENG' ? 'Close' : 'Tutup'}
                  </button>
                </div>
                <p style={{ color: 'var(--ink-primary)' }}>
                  {definitions[learningTerm][language].simple}
                </p>
                <p style={{ color: 'var(--ink-secondary)' }}>
                  {definitions[learningTerm][language].detail}
                </p>
              </div>
            )}
          </section>

          {/* About */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold">
              {language === 'ENG' ? `About ${stock.name}` : `Mengenai ${stock.name}`}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {plainStory.howTheyMakeMoney}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {plainStory.dividendVsEpf}
            </p>
          </section>

          {/* Sector Peer Comparison Table */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                {language === 'ENG' ? 'Peer Comparison' : 'Perbandingan Setara'}
              </h2>
              <select
                aria-label="Compare with peer"
                value={peerStockId}
                onChange={e => setPeerStockId(e.target.value)}
                className="jom-input text-xs font-tabular"
                style={{ width: 'auto', padding: '0.3rem 0.6rem' }}
              >
                {allStocks
                  .filter(s => s.id !== stock.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      vs. {s.ticker} ({s.name})
                    </option>
                  ))}
              </select>
            </div>

            {peerStock && (
              <div className="jom-table-wrap">
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>{language === 'ENG' ? 'Metric' : 'Metrik'}</th>
                      <th className="text-right">{stock.ticker}</th>
                      <th
                        className="text-right cursor-pointer hover:underline"
                        onClick={() => setSelectedStock(peerStock)}
                      >
                        {peerStock.ticker} →
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-tabular text-xs">
                    <tr>
                      <td style={{ color: 'var(--ink-secondary)' }}>Price</td>
                      <td className="text-right font-medium">RM {stock.price}</td>
                      <td className="text-right">RM {peerStock.price}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-secondary)' }}>P/E Ratio</td>
                      <td className="text-right font-medium">{stock.peRatio}x</td>
                      <td className="text-right">{peerStock.peRatio}x</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-secondary)' }}>Dividend Yield</td>
                      <td className="text-right font-medium">{stock.dividendYield}</td>
                      <td className="text-right">{peerStock.dividendYield}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-secondary)' }}>Market Cap</td>
                      <td className="text-right font-medium">RM {stock.marketCap}</td>
                      <td className="text-right">RM {peerStock.marketCap}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-secondary)' }}>Debt / Equity</td>
                      <td className="text-right font-medium">{stock.debtEquity}</td>
                      <td className="text-right">{peerStock.debtEquity}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Order Ticket */}
        <aside className="rh-rail space-y-5">
          <div className="space-y-4">
            {/* Buy / Sell Tabs */}
            <div className="rh-tabs">
              <button
                type="button"
                onClick={() => setTradeSide('BUY')}
                className={`rh-tab ${tradeSide === 'BUY' ? 'active' : ''}`}
              >
                {language === 'ENG' ? `Buy ${stock.ticker}` : `Beli ${stock.ticker}`}
              </button>
              <button
                type="button"
                onClick={() => setTradeSide('SELL')}
                className={`rh-tab ${tradeSide === 'SELL' ? 'active' : ''}`}
              >
                {language === 'ENG' ? `Sell ${stock.ticker}` : `Jual ${stock.ticker}`}
              </button>
            </div>

            {/* Order Unit Mode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Unit size' : 'Saiz unit'}
                </span>
                <span className="font-tabular" style={{ color: 'var(--ink-muted)' }}>
                  {effectiveUnits} {language === 'ENG' ? 'shares' : 'unit'}
                </span>
              </div>
              <div className="jom-segmented w-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLotMode('lot')}
                  className={lotMode === 'lot' ? 'active' : ''}
                >
                  {language === 'ENG' ? '100 Shares (1 Lot)' : '100 Unit (1 Lot)'}
                </button>
                <button
                  type="button"
                  onClick={() => setLotMode('micro')}
                  className={lotMode === 'micro' ? 'active' : ''}
                >
                  {language === 'ENG' ? '1 Share' : '1 Unit'}
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {lotMode === 'lot'
                  ? language === 'ENG'
                    ? 'Lots'
                    : 'Lot'
                  : language === 'ENG'
                  ? 'Shares'
                  : 'Unit'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={decrement}
                  className="jom-btn px-2 py-1"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className="jom-input font-tabular text-center font-medium text-xs"
                  style={{ width: '60px', padding: '0.3rem 0.4rem' }}
                />
                <button
                  type="button"
                  onClick={increment}
                  className="jom-btn px-2 py-1"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Market Price */}
            <div className="rh-kv-row text-xs">
              <span style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Market price' : 'Harga pasaran'}
              </span>
              <span className="font-tabular font-medium">RM {stock.price}</span>
            </div>

            {/* Bursa Fees */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowFeeBreakdown(prev => !prev)}
                className="w-full flex items-center justify-between text-xs cursor-pointer"
                style={{ color: 'var(--ink-secondary)', background: 'none', border: 'none', padding: 0 }}
              >
                <span className="flex items-center gap-1">
                  <span>{language === 'ENG' ? 'Bursa fees' : 'Yuran Bursa'}</span>
                  {showFeeBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </span>
                <span className="font-tabular">RM {fees.totalFees.toFixed(2)}</span>
              </button>

              {showFeeBreakdown && (
                <div
                  className="p-2.5 rounded text-xs font-tabular space-y-1"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--ink-muted)' }}>Brokerage</span>
                    <span>RM {fees.brokerageFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--ink-muted)' }}>Clearing</span>
                    <span>RM {fees.clearingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--ink-muted)' }}>Stamp duty</span>
                    <span>RM {fees.stampDuty.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Total */}
            <div
              className="flex items-baseline justify-between pt-3 border-t font-tabular"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Estimated total' : 'Jumlah anggaran'}
              </span>
              <span className="text-base font-semibold">
                RM {fees.netTotal.toFixed(2)}
              </span>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={tradeSide === 'SELL' && ownedUnits <= 0}
              onClick={handleOrderSubmit}
              className="jom-btn jom-btn-primary w-full py-2.5"
            >
              {tradeSide === 'BUY'
                ? language === 'ENG'
                  ? `Buy ${effectiveUnits} ${stock.ticker}`
                  : `Beli ${effectiveUnits} ${stock.ticker}`
                : language === 'ENG'
                ? `Sell ${ownedUnits > 0 ? sellUnits : 0} ${stock.ticker}`
                : `Jual ${ownedUnits > 0 ? sellUnits : 0} ${stock.ticker}`}
            </button>

            {/* Balance & Position footer */}
            <div className="text-xs font-tabular space-y-1 pt-1" style={{ color: 'var(--ink-muted)' }}>
              <div>RM {cashBalance.toFixed(2)} buying power</div>
              {ownedUnits > 0 && (
                <div style={{ color: 'var(--ink-secondary)' }}>
                  {ownedUnits} shares owned (avg RM {ownedHolding?.averagePrice.toFixed(2)})
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
