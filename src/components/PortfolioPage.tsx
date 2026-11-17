import { useMemo, useState } from 'react';
import { Plus, ArrowUpRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');

  const texts = {
    ENG: {
      kicker: 'PORTFOLIO LEDGER & RISK AUDIT',
      title: 'Capital Allocation & Position Book',
      subtitle:
        'Mark-to-market valuation, institutional concentration diagnostics, and regulated Bursa Malaysia contract notes.',
      creditBtn: '+ Credit RM 5,000 Practice Capital',
      netLiquidity: 'Total Net Liquidity',
      marketValueHoldings: 'Market Value of Holdings',
      buyingPower: 'Available Buying Power',
      projDividend: 'Projected Annual Dividend',
      perYear: '/yr',
      perMonth: '/mo',
      costBasisLabel: 'Cost Basis',
      auditKicker: 'INSTITUTIONAL PORTFOLIO DIAGNOSTICS',
      auditTitle: 'Portfolio Risk & Concentration Audit',
      col1Title: '01 / Sector Concentration',
      col2Title: '02 / SAC Shariah Allocation',
      col3Title: '03 / Mandate Alignment',
      openPositions: 'Open Positions',
      contractNotes: 'Contract Note History',
      colSecurity: 'Security',
      colSector: 'Sector',
      colQty: 'Quantity',
      colAvgCost: 'Avg Cost (RM)',
      colLastPrice: 'Last Price (RM)',
      colMarketVal: 'Market Value (RM)',
      colUnrealized: 'Unrealized P/L',
      colActions: 'Actions',
      trimHalf: 'Trim 50%',
      closePos: 'Close Position',
      emptyHoldingsTitle: 'No Active Equity Positions',
      emptyHoldingsDesc:
        'Your position ledger is currently in 100% cash reserve. Deploy practice capital via the Market Screener or Conviction Notes.',
      exploreMarket: 'Open Market Screener',
      colSide: 'Side',
      colExecPrice: 'Execution Price',
      colFees: 'Bursa Fees',
      colNetSettlement: 'Net Settlement',
      colTimestamp: 'Timestamp',
      emptyHistoryTitle: 'No Executed Contract Notes',
      emptyHistoryDesc:
        'All simulated buy and sell executions with regulated brokerage, clearing, and stamp duty calculations are recorded here.'
    },
    BM: {
      kicker: 'LEJAR PORTFOLIO & AUDIT RISIKO',
      title: 'Peruntukan Modal & Buku Posisi',
      subtitle:
        'Penilaian semasa ke pasaran, diagnostik tumpuan sektor, dan rekod nota kontrak Bursa Malaysia.',
      creditBtn: '+ Kredit RM 5,000 Modal Latihan',
      netLiquidity: 'Jumlah Kecairan Bersih',
      marketValueHoldings: 'Nilai Pasaran Pegangan',
      buyingPower: 'Kuasa Beli Tersedia',
      projDividend: 'Unjuran Dividen Tahunan',
      perYear: '/thn',
      perMonth: '/bln',
      costBasisLabel: 'Kos Asas',
      auditKicker: 'DIAGNOSTIK PORTFOLIO INSTITUSI',
      auditTitle: 'Audit Risiko & Tumpuan Portfolio',
      col1Title: '01 / Tumpuan Sektor',
      col2Title: '02 / Peruntukan Syariah MPS',
      col3Title: '03 / Penjajaran Mandat',
      openPositions: 'Posisi Terbuka',
      contractNotes: 'Sejarah Nota Kontrak',
      colSecurity: 'Sekuriti',
      colSector: 'Sektor',
      colQty: 'Kuantiti',
      colAvgCost: 'Kos Purata (RM)',
      colLastPrice: 'Harga Semasa (RM)',
      colMarketVal: 'Nilai Pasaran (RM)',
      colUnrealized: 'Untung/Rugi Belum Realisasi',
      colActions: 'Tindakan',
      trimHalf: 'Kurangkan 50%',
      closePos: 'Tutup Posisi',
      emptyHoldingsTitle: 'Tiada Posisi Ekuiti Aktif',
      emptyHoldingsDesc:
        'Lejar posisi anda kini berada dalam 100% rizab tunai. Mulakan pelaburan melalui Saringan Pasaran.',
      exploreMarket: 'Buka Saringan Pasaran',
      colSide: 'arah',
      colExecPrice: 'Harga Pelaksanaan',
      colFees: 'Yuran Bursa',
      colNetSettlement: 'Penyelesaian Bersih',
      colTimestamp: 'Masa',
      emptyHistoryTitle: 'Tiada Nota Kontrak Dilaksanakan',
      emptyHistoryDesc:
        'Semua rekod belian dan jualan simulasi bersama kiraan yuran broker, penjelasan dan duti setem direkodkan di sini.'
    }
  };

  const t = texts[language];

  const holdingsValue = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + parseFloat(item.stock.price) * item.quantity, 0);
  }, [portfolio]);

  const totalCostBasis = useMemo(() => {
    return portfolio.reduce((acc, item) => acc + item.averagePrice * item.quantity, 0);
  }, [portfolio]);

  const totalNetLiquidity = holdingsValue + cashBalance;
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
      const sector = item.stock.sector || 'Unclassified';
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

  const diagnostics = useMemo(() => {
    if (portfolio.length === 0 || holdingsValue <= 0) {
      return {
        diversificationTag: 'UNALLOCATED',
        diversificationTagClass: 'jom-tag',
        diversificationText:
          language === 'ENG'
            ? 'No active equity exposure. Institutional risk guidelines recommend allocating across at least 3 distinct Bursa Malaysia sectors to mitigate single-industry drawdowns.'
            : 'Tiada pendedahan ekuiti aktif. Garis panduan risiko mengesyorkan pelaburan merentasi sekurang-kurangnya 3 sektor Bursa berbeza.',
        shariahPct: 0,
        shariahValue: 0,
        shariahText:
          language === 'ENG'
            ? 'RM 0.00 allocated to SAC Shariah-compliant securities. Filter for SAC SHARIAH counters in the Market Screener to build a compliant mandate.'
            : 'RM 0.00 diperuntukkan kepada sekuriti patuh Syariah MPS. Tapis kaunter SAC SHARIAH di Saringan Pasaran.',
        mandateTag: 'STANDBY',
        mandateTagClass: 'jom-tag',
        avgGrowthScore: 0,
        avgDivScore: 0,
        riskText:
          language === 'ENG'
            ? `Active Mandate: ${userProfile}. Deploy capital to evaluate weighted growth and dividend factor alignment.`
            : `Mandat Aktif: ${userProfile}. Laburkan modal untuk menilai penjajaran faktor pertumbuhan dan dividen.`
      };
    }

    const topSector = sectorData[0];
    const numSectors = sectorData.length;
    let diversificationTag = 'MODERATE';
    let diversificationTagClass = 'jom-tag';
    let diversificationText = '';

    if (topSector && topSector.percentage > 60) {
      diversificationTag = 'CONCENTRATED';
      diversificationTagClass = 'jom-tag jom-tag-warn';
      diversificationText =
        language === 'ENG'
          ? `${topSector.percentage}% of equity capital is concentrated in ${topSector.name} (>60% threshold). Rebalance into uncorrelated sectors to reduce idiosyncratic risk.`
          : `${topSector.percentage}% daripada modal ekuiti tertumpu dalam ${topSector.name} (melebihi ambang 60%). Pelbagaikan ke sektor lain.`;
    } else if (numSectors >= 3) {
      diversificationTag = 'OPTIMAL';
      diversificationTagClass = 'jom-tag jom-tag-up';
      diversificationText =
        language === 'ENG'
          ? `Holdings are distributed across ${numSectors} sectors (lead exposure: ${topSector.name} at ${topSector.percentage}%). Meets institutional multi-sector diversification criteria.`
          : `Pegangan diagihkan merentasi ${numSectors} sektor (pendedahan utama: ${topSector.name} pada ${topSector.percentage}%). Memenuhi kriteria kepelbagaian institusi.`;
    } else {
      diversificationTag = 'MODERATE';
      diversificationTagClass = 'jom-tag';
      diversificationText =
        language === 'ENG'
          ? `Exposure spans ${numSectors} sector(s) with ${topSector.name} representing ${topSector.percentage}%. Adding 1–2 additional sectors will improve portfolio resilience.`
          : `Pendedahan merangkumi ${numSectors} sektor dengan ${topSector.name} mewakili ${topSector.percentage}%. Tambah 1–2 sektor lagi untuk ketahanan portfolio.`;
    }

    const shariahValue = portfolio.reduce((acc, item) => {
      return acc + (item.stock.isShariah ? parseFloat(item.stock.price) * item.quantity : 0);
    }, 0);
    const shariahPct = Math.round((shariahValue / holdingsValue) * 100);
    const shariahText =
      language === 'ENG'
        ? `${shariahPct}% (RM ${shariahValue.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}) of invested equity meets Securities Commission (SC) Shariah Advisory Council screening benchmarks.`
        : `${shariahPct}% (RM ${shariahValue.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}) daripada ekuiti dilaburkan mematuhi penanda aras Majlis Penasihat Syariah SC.`;

    const avgGrowthScore =
      portfolio.reduce((acc, item) => {
        const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
        return acc + item.stock.radarScores.growth * weight;
      }, 0) || 0;
    const avgDivScore =
      portfolio.reduce((acc, item) => {
        const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
        return acc + item.stock.radarScores.dividend * weight;
      }, 0) || 0;

    const isAggressiveProfile =
      userProfile.toLowerCase().includes('aggressive') ||
      userProfile.toLowerCase().includes('explorer');
    const isConservativeProfile =
      userProfile.toLowerCase().includes('conservative') ||
      userProfile.toLowerCase().includes('guardian');

    let mandateTag = 'OPTIMAL';
    let mandateTagClass = 'jom-tag jom-tag-up';
    let riskText = '';

    if (isAggressiveProfile) {
      if (avgGrowthScore >= 65) {
        mandateTag = 'OPTIMAL';
        mandateTagClass = 'jom-tag jom-tag-up';
        riskText =
          language === 'ENG'
            ? `Aligned with ${userProfile}. Weighted Growth Factor stands at ${avgGrowthScore.toFixed(0)}/100, capturing capital appreciation catalysts.`
            : `Selaras dengan ${userProfile}. Faktor Pertumbuhan Berwajaran pada ${avgGrowthScore.toFixed(0)}/100.`;
      } else {
        mandateTag = 'DRIFT';
        mandateTagClass = 'jom-tag jom-tag-warn';
        riskText =
          language === 'ENG'
            ? `Mandate drift relative to ${userProfile}. Current holdings tilt defensive (Growth Factor: ${avgGrowthScore.toFixed(0)}/100). Consider high-conviction growth counters such as GAMUDA, INARI, or YTLPOWR.`
            : `Kurang selaras dengan ${userProfile} (Faktor Pertumbuhan: ${avgGrowthScore.toFixed(0)}/100). Pertimbangkan kaunter pertumbuhan seperti GAMUDA atau INARI.`;
      }
    } else if (isConservativeProfile) {
      if (avgDivScore >= 70) {
        mandateTag = 'OPTIMAL';
        mandateTagClass = 'jom-tag jom-tag-up';
        riskText =
          language === 'ENG'
            ? `Aligned with ${userProfile}. Weighted Dividend Factor of ${avgDivScore.toFixed(0)}/100 provides strong defensive yield cushion.`
            : `Selaras dengan ${userProfile}. Faktor Dividen Berwajaran ${avgDivScore.toFixed(0)}/100 memberi aliran hasil defensif.`;
      } else {
        mandateTag = 'DRIFT';
        mandateTagClass = 'jom-tag jom-tag-warn';
        riskText =
          language === 'ENG'
            ? `Elevated volatility relative to ${userProfile} (Dividend Factor: ${avgDivScore.toFixed(0)}/100). Consider anchoring with dividend leaders such as MAYBANK or TENAGA.`
            : `Volatiliti lebih tinggi berbanding ${userProfile} (Faktor Dividen: ${avgDivScore.toFixed(0)}/100). Pertimbangkan kaunter dividen utama.`;
      }
    } else {
      mandateTag = 'OPTIMAL';
      mandateTagClass = 'jom-tag jom-tag-up';
      riskText =
        language === 'ENG'
          ? `Balanced allocation under ${userProfile}. Weighted Growth (${avgGrowthScore.toFixed(0)}/100) and Dividend (${avgDivScore.toFixed(0)}/100) factors maintain equilibrium.`
          : `Peruntukan seimbang di bawah ${userProfile}. Faktor Pertumbuhan (${avgGrowthScore.toFixed(0)}/100) dan Dividen (${avgDivScore.toFixed(0)}/100) seimbang.`;
    }

    return {
      diversificationTag,
      diversificationTagClass,
      diversificationText,
      shariahPct,
      shariahValue,
      shariahText,
      mandateTag,
      mandateTagClass,
      avgGrowthScore,
      avgDivScore,
      riskText
    };
  }, [portfolio, holdingsValue, sectorData, userProfile, language]);

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="jom-container space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="space-y-1.5">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-4xl">{t.title}</h1>
          <p className="text-sm max-w-2xl" style={{ color: 'var(--ink-secondary)' }}>
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onTopUpCash(5000)}
            className="jom-btn"
          >
            <Plus size={14} />
            <span>{t.creditBtn}</span>
          </button>
        </div>
      </div>

      {/* 4-Cell Account Ledger Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.netLiquidity}</div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(totalNetLiquidity)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {portfolio.length} {language === 'ENG' ? 'open position(s)' : 'posisi aktif'} ·{' '}
            {totalNetLiquidity > 0
              ? `${Math.round((holdingsValue / totalNetLiquidity) * 100)}% ${
                  language === 'ENG' ? 'invested' : 'dilabur'
                }`
              : '0%'}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="jom-kicker">{t.marketValueHoldings}</span>
            <span
              className={`jom-tag font-tabular ${
                unrealizedPL >= 0 ? 'jom-tag-up' : 'jom-tag-down'
              }`}
            >
              {unrealizedPL >= 0 ? '+' : ''}
              {unrealizedPLPercent.toFixed(2)}%
            </span>
          </div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(holdingsValue)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {t.costBasisLabel}: RM {formatRM(totalCostBasis)} (
            <span
              style={{
                color: unrealizedPL >= 0 ? 'var(--signal-up)' : 'var(--signal-down)'
              }}
            >
              {unrealizedPL >= 0 ? '+' : ''}RM {formatRM(unrealizedPL)}
            </span>
            )
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.buyingPower}</div>
          <div
            className="font-tabular text-2xl font-semibold"
            style={{ color: 'var(--signal-up)' }}
          >
            RM {formatRM(cashBalance)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {totalNetLiquidity > 0
              ? `${Math.round((cashBalance / totalNetLiquidity) * 100)}% ${
                  language === 'ENG' ? 'cash reserve' : 'rizab tunai'
                }`
              : '100%'}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">{t.projDividend}</div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(annualDividend)}
            <span className="text-xs font-normal ml-1" style={{ color: 'var(--ink-muted)' }}>
              {t.perYear}
            </span>
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-secondary)' }}>
            RM {formatRM(monthlyDividend)} {t.perMonth} ·{' '}
            {holdingsValue > 0
              ? `${((annualDividend / holdingsValue) * 100).toFixed(2)}% ${
                  language === 'ENG' ? 'weighted yield' : 'hasil wajaran'
                }`
              : '0.00%'}
          </div>
        </div>
      </div>

      {/* Portfolio Risk & Concentration Audit */}
      <section className="jom-panel p-6 space-y-5">
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <div className="jom-kicker">{t.auditKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.auditTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="jom-tag">{userProfile}</span>
            {sectorData.length > 0 && (
              <span className="jom-tag font-tabular">
                {sectorData.length} {language === 'ENG' ? 'SECTORS' : 'SEKTOR'}
              </span>
            )}
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          {/* Column 1: Sector Concentration */}
          <div className="md:pr-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col1Title}</span>
              <span className={diagnostics.diversificationTagClass}>
                {diagnostics.diversificationTag}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {diagnostics.diversificationText}
            </p>
            {sectorData.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {sectorData.slice(0, 3).map(sec => (
                  <div key={sec.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-tabular">
                      <span style={{ color: 'var(--ink-secondary)' }}>{sec.name}</span>
                      <span className="font-semibold">{sec.percentage}%</span>
                    </div>
                    <div
                      className="w-full h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${sec.percentage}%`,
                          backgroundColor:
                            sec.percentage > 60 ? 'var(--signal-warn)' : 'var(--ink-primary)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: SAC Shariah Allocation */}
          <div className="md:px-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col2Title}</span>
              <span className="jom-tag jom-tag-shariah font-tabular">
                SAC SHARIAH · {diagnostics.shariahPct}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${diagnostics.shariahPct}%`,
                  backgroundColor: 'var(--accent-brand)'
                }}
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {diagnostics.shariahText}
            </p>
          </div>

          {/* Column 3: Mandate Alignment */}
          <div className="md:pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{t.col3Title}</span>
              <span className={diagnostics.mandateTagClass}>{diagnostics.mandateTag}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {diagnostics.riskText}
            </p>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="jom-panel-subtle p-2">
                  <div className="jom-kicker">GROWTH FACTOR</div>
                  <div className="font-tabular text-sm font-semibold mt-0.5">
                    {diagnostics.avgGrowthScore.toFixed(0)} / 100
                  </div>
                </div>
                <div className="jom-panel-subtle p-2">
                  <div className="jom-kicker">DIVIDEND FACTOR</div>
                  <div className="font-tabular text-sm font-semibold mt-0.5">
                    {diagnostics.avgDivScore.toFixed(0)} / 100
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Holdings Table & Contract Note Ledger */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="jom-segmented">
            <button
              type="button"
              className={activeTab === 'holdings' ? 'active' : ''}
              onClick={() => setActiveTab('holdings')}
            >
              {t.openPositions} ({portfolio.length})
            </button>
            <button
              type="button"
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              {t.contractNotes} ({tradeHistory.length})
            </button>
          </div>
        </div>

        {activeTab === 'holdings' ? (
          portfolio.length > 0 ? (
            <div className="jom-panel overflow-hidden">
              <div className="jom-table-wrap">
                <table className="jom-table">
                  <thead>
                    <tr>
                      <th>{t.colSecurity}</th>
                      <th>{t.colSector}</th>
                      <th className="text-right">{t.colQty}</th>
                      <th className="text-right">{t.colAvgCost}</th>
                      <th className="text-right">{t.colLastPrice}</th>
                      <th className="text-right">{t.colMarketVal}</th>
                      <th className="text-right">{t.colUnrealized}</th>
                      <th className="text-right">{t.colActions}</th>
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
                            <div className="flex items-center gap-2">
                              <span className="font-tabular font-semibold">{stock.ticker}</span>
                              <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                                {stock.bursaCode}
                              </span>
                              {stock.isShariah && (
                                <span className="jom-tag jom-tag-shariah">SAC SHARIAH</span>
                              )}
                            </div>
                            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--ink-secondary)' }}>
                              <span>{stock.name}</span>
                              <ArrowUpRight size={11} />
                            </div>
                          </td>
                          <td>
                            <span className="jom-tag">{stock.sector}</span>
                          </td>
                          <td className="text-right font-tabular">
                            <div className="font-semibold">{item.quantity.toLocaleString()} sh</div>
                            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                              {(item.quantity / 100).toFixed(1)} lots
                            </div>
                          </td>
                          <td className="text-right font-tabular">
                            RM {formatRM(item.averagePrice)}
                          </td>
                          <td className="text-right font-tabular">
                            RM {formatRM(currentPrice)}
                          </td>
                          <td className="text-right font-tabular font-semibold">
                            RM {formatRM(marketVal)}
                          </td>
                          <td className="text-right font-tabular">
                            <div
                              className="font-semibold"
                              style={{
                                color: isPositive ? 'var(--signal-up)' : 'var(--signal-down)'
                              }}
                            >
                              {isPositive ? '+' : ''}RM {formatRM(profit)}
                            </div>
                            <div className="mt-0.5">
                              <span
                                className={`jom-tag font-tabular ${
                                  isPositive ? 'jom-tag-up' : 'jom-tag-down'
                                }`}
                              >
                                {isPositive ? '+' : ''}
                                {returnPct.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td
                            className="text-right"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {item.quantity > 1 && (
                                <button
                                  type="button"
                                  className="jom-btn py-1 px-2.5 text-xs font-tabular"
                                  onClick={e => {
                                    e.stopPropagation();
                                    sellFromPortfolio(stock, halfQty);
                                  }}
                                >
                                  {t.trimHalf} ({halfQty})
                                </button>
                              )}
                              <button
                                type="button"
                                className="jom-btn jom-btn-danger py-1 px-2.5 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  removeFromPortfolio(stock);
                                }}
                              >
                                {t.closePos}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="jom-panel p-12 text-center space-y-4">
              <div className="jom-kicker">POSITION BOOK EMPTY</div>
              <h3 className="font-editorial text-2xl">{t.emptyHoldingsTitle}</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--ink-secondary)' }}>
                {t.emptyHoldingsDesc}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="jom-btn jom-btn-primary"
                >
                  {t.exploreMarket}
                </button>
              </div>
            </div>
          )
        ) : tradeHistory.length > 0 ? (
          <div className="jom-panel overflow-hidden">
            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>{t.colSide}</th>
                    <th>{t.colSecurity}</th>
                    <th className="text-right">{t.colQty}</th>
                    <th className="text-right">{t.colExecPrice}</th>
                    <th className="text-right">{t.colFees}</th>
                    <th className="text-right">{t.colNetSettlement}</th>
                    <th className="text-right">{t.colTimestamp}</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map(trade => (
                    <tr key={trade.id} style={{ cursor: 'default' }}>
                      <td>
                        <span
                          className={`jom-tag font-tabular ${
                            trade.type === 'BUY' ? 'jom-tag-up' : 'jom-tag-warn'
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td>
                        <div className="font-tabular font-semibold">{trade.ticker}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {trade.stockName}
                        </div>
                      </td>
                      <td className="text-right font-tabular">
                        {trade.quantity.toLocaleString()} sh
                      </td>
                      <td className="text-right font-tabular">
                        RM {formatRM(trade.pricePerShare)}
                      </td>
                      <td className="text-right font-tabular" style={{ color: 'var(--ink-secondary)' }}>
                        RM {formatRM(trade.totalFees)}
                      </td>
                      <td
                        className="text-right font-tabular font-semibold"
                        style={{
                          color:
                            trade.type === 'BUY' ? 'var(--ink-primary)' : 'var(--signal-up)'
                        }}
                      >
                        {trade.type === 'BUY' ? '-' : '+'}RM {formatRM(trade.netAmount)}
                      </td>
                      <td
                        className="text-right font-tabular text-xs"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        {trade.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="jom-panel p-12 text-center space-y-3">
            <div className="jom-kicker">CONTRACT LEDGER</div>
            <h3 className="font-editorial text-2xl">{t.emptyHistoryTitle}</h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--ink-secondary)' }}>
              {t.emptyHistoryDesc}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
