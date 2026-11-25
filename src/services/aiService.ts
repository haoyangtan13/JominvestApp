import { stocks as allStocks, type StockData } from '../data/stocks';
import { getApiBaseUrl } from './marketData';

export interface NewsHeadline {
  title: string;
  source: string;
  link: string;
  pubDate: string;
  timeAgo: string;
}

export interface TaggedHeadline extends NewsHeadline {
  sentiment: 'Positive' | 'Cautious' | 'Neutral';
  impact: string;
}

export interface StockTechnicals {
  return30dPct: string;
  high30d: string;
  low30d: string;
  distFromHighPct: string;
  trend: string;
}

export interface StockReportSummary {
  source: 'live-ai' | 'local-analyst';
  title: string;
  growth: string;
  newsCatalysts?: string;
  peerComparison?: string;
  risk: string;
  dividend: string;
  studentTakeaway?: string;
  shariahNote: string;
  score: number;
  technicals?: StockTechnicals;
  headlines?: NewsHeadline[];
}

export interface StockComparisonResult {
  source: 'live-ai' | 'local-analyst';
  headline: string;
  valuationEdge: string;
  incomeComparison: string;
  momentumAndNews: string;
  riskComparison: string;
  studentVerdict: string;
  scoreA: number;
  scoreB: number;
  headlinesA: NewsHeadline[];
  headlinesB: NewsHeadline[];
}

export interface SentimentAnalysisResult {
  source: 'live-ai' | 'live-rss' | 'local-snapshot';
  updatedAt: string;
  scope: string;
  score: number;
  label: string;
  summary: string;
  keyDrivers: string[];
  headlines: TaggedHeadline[];
}

export interface SpotlightAnalysisResult {
  source: 'live-ai' | 'local-analyst';
  headline: string;
  reasons: Array<{ title: string; detail: string }>;
  catalystNote: string;
  watchpoint: string;
  headlines: NewsHeadline[];
}

export interface ChatTurn {
  role: 'user' | 'ai';
  content: string;
}

export interface ChatContext {
  language: 'ENG' | 'BM';
  cashRM: string;
  portfolioSummary: string;
  userProfile: string;
  stocks?: StockData[];
  history?: ChatTurn[];
}

function stripEmojis(input: string): string {
  return input.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

export function safeExternalHref(rawUrl?: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '#';
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : '#';
  } catch {
    return '#';
  }
}

export function computeStockTechnicals(stock: StockData): StockTechnicals {
  const prices = (stock.history || []).map((h) => h.price).filter((p) => Number.isFinite(p) && p > 0);
  const current = parseFloat(stock.price) || prices[prices.length - 1] || 0;
  if (prices.length < 2 || current <= 0) {
    return {
      return30dPct: stock.changePercent || '0.00%',
      high30d: stock.price,
      low30d: stock.price,
      distFromHighPct: '0.0%',
      trend: stock.isPositive ? 'Upward' : 'Soft',
    };
  }

  const first = prices[0];
  const high = Math.max(...prices, current);
  const low = Math.min(...prices, current);
  const ret30 = first > 0 ? ((current - first) / first) * 100 : 0;
  const distHigh = high > 0 ? ((current - high) / high) * 100 : 0;

  const recent7 = prices.slice(-7);
  const avg7 = recent7.reduce((a, b) => a + b, 0) / recent7.length;
  const avg30 = prices.reduce((a, b) => a + b, 0) / prices.length;
  const trend =
    avg7 > avg30 * 1.01
      ? 'Uptrend (above 30D avg)'
      : avg7 < avg30 * 0.99
        ? 'Pullback (below 30D avg)'
        : 'Consolidating near 30D avg';

  return {
    return30dPct: `${ret30 >= 0 ? '+' : ''}${ret30.toFixed(2)}%`,
    high30d: high.toFixed(2),
    low30d: low.toFixed(2),
    distFromHighPct: `${distHigh.toFixed(1)}%`,
    trend,
  };
}

export function findSectorPeers(stock: StockData, catalog: StockData[] = allStocks) {
  const sameSector = catalog.filter((s) => s.ticker !== stock.ticker && s.sector === stock.sector);
  const pool =
    sameSector.length >= 2
      ? sameSector
      : [...sameSector, ...catalog.filter((s) => s.ticker !== stock.ticker && s.sector !== stock.sector)];
  return pool.slice(0, 3).map((p) => ({
    ticker: p.ticker,
    price: p.price,
    peRatio: p.peRatio,
    dividendYield: p.dividendYield,
    changePercent: p.changePercent,
  }));
}

function scoreStockHeuristic(stock: StockData): number {
  const pe = parseFloat(stock.peRatio);
  const divYield = parseFloat(String(stock.dividendYield).replace('%', ''));
  let score = 76;
  if (Number.isFinite(divYield) && divYield >= 4) score += 8;
  if (Number.isFinite(pe) && pe > 0 && pe <= 16) score += 6;
  if (Number.isFinite(pe) && pe > 35) score -= 8;
  if (stock.isPositive) score += 3;
  return Math.max(58, Math.min(95, score));
}

export function buildLocalReport(
  stock: StockData,
  language: 'ENG' | 'BM' = 'ENG',
  catalog: StockData[] = allStocks
): StockReportSummary {
  const pe = parseFloat(stock.peRatio);
  const divYield = parseFloat(String(stock.dividendYield).replace('%', ''));
  const de = parseFloat(stock.debtEquity);
  const technicals = computeStockTechnicals(stock);
  const peers = findSectorPeers(stock, catalog);
  const peerSummaryText = peers.map((p) => `${p.ticker} (${p.peRatio}x P/E, ${p.dividendYield} div)`).join(', ');
  const score = scoreStockHeuristic(stock);

  if (language === 'BM') {
    const growth = `${stock.name} (${stock.klseCode}) menjana hasil tahunan RM ${stock.revenue} dengan untung bersih RM ${stock.netProfit} dalam sektor ${stock.sector}. Pergerakan 30 hari ialah ${technicals.return30dPct} (${technicals.trend}).`;
    const newsCatalysts = `Pemantauan berita langsung luar talian buat masa ini; perhatikan perkembangan sektor ${stock.sector} dan pengumuman suku tahunan Bursa Malaysia untuk ${stock.ticker}.`;
    const peerComparison = peerSummaryText
      ? `Berbanding rakan sektor seperti ${peerSummaryText}, ${stock.ticker} didagangkan pada P/E ${stock.peRatio}x dengan hasil dividen ${stock.dividendYield}.`
      : `${stock.ticker} didagangkan pada P/E ${stock.peRatio}x dalam sektor ${stock.sector}.`;
    const risk =
      Number.isFinite(pe) && pe > 25
        ? `Nisbah P/E ${stock.peRatio} adalah agak premium; sebarang kelembapan pendapatan suku tahunan boleh memberi tekanan harga jangka pendek.`
        : Number.isFinite(de) && de > 1.0
          ? `Hutang/Ekuiti pada ${stock.debtEquity} memerlukan pemantauan kos faedah dan aliran tunai operasi.`
          : `Risiko utama melibatkan kitaran makro sektor ${stock.sector} dan perubahan sentimen institusi Bursa Malaysia.`;
    const dividend =
      Number.isFinite(divYield) && divYield > 0
        ? `Hasil dividen semasa ialah ${stock.dividendYield} (${divYield >= 4 ? 'menarik untuk pendapatan pasif' : 'sederhana, fokus pertumbuhan modal'}).`
        : 'Tiada pembayaran dividen tetap buat masa ini; pulangan bergantung kepada pemulihan harga saham.';
    const shariahNote = stock.shariahCompliant
      ? 'Disenaraikan sebagai Patuh Syariah oleh Majlis Penasihat Syariah SC Malaysia.'
      : 'Tidak Patuh Syariah (perbankan konvensional / aktiviti tidak patuh).';
    const studentTakeaway = `Pantau sama ada ${stock.ticker} kekal di atas paras terendah 30 hari RM ${technicals.low30d} sambil mengekalkan margin keuntungan.`;

    return {
      source: 'local-analyst',
      title: `Ringkasan Eksekutif ${stock.name} (${stock.ticker})`,
      growth,
      newsCatalysts,
      peerComparison,
      risk,
      dividend,
      studentTakeaway,
      shariahNote,
      score,
      technicals,
      headlines: [],
    };
  }

  const growth = `${stock.name} (${stock.klseCode}) posts RM ${stock.revenue} in annual revenue and RM ${stock.netProfit} net profit within ${stock.sector}. Over 30 days it moved ${technicals.return30dPct} (${technicals.trend}).`;
  const newsCatalysts = `Live RSS headlines are unavailable offline; watch Bursa Malaysia quarterly filings and ${stock.sector} institutional catalysts for ${stock.ticker}.`;
  const peerComparison = peerSummaryText
    ? `Against Bursa peers ${peerSummaryText}, ${stock.ticker} trades at ${stock.peRatio}x P/E with a ${stock.dividendYield} dividend yield.`
    : `${stock.ticker} trades at ${stock.peRatio}x P/E within ${stock.sector}.`;
  const risk =
    Number.isFinite(pe) && pe > 25
      ? `At ${stock.peRatio}x P/E, valuation prices in strong growth — earnings misses could trigger multiple compression.`
      : Number.isFinite(de) && de > 1.0
        ? `Debt/Equity stands at ${stock.debtEquity}; watch interest coverage and capital expenditure execution.`
        : `Key watchpoints are ${stock.sector} margin cycles and regional ASEAN macro shifts.`;
  const dividend =
    Number.isFinite(divYield) && divYield > 0
      ? `Current dividend yield is ${stock.dividendYield} (${divYield >= 4 ? 'strong cash income payer' : 'modest payout with capital reinvestment focus'}).`
      : 'Currently non-dividend paying; thesis relies on operational turnaround and capital appreciation.';
  const shariahNote = stock.shariahCompliant
    ? 'SC Malaysia Shariah-Compliant counter.'
    : 'Non-Shariah counter (conventional financial / non-compliant revenue mix).';
  const studentTakeaway = `Track whether ${stock.ticker} holds above its 30D low of RM ${technicals.low30d} and sustains its ${stock.dividendYield} payout profile.`;

  return {
    source: 'local-analyst',
    title: `${stock.name} (${stock.ticker}) Fundamental Brief`,
    growth,
    newsCatalysts,
    peerComparison,
    risk,
    dividend,
    studentTakeaway,
    shariahNote,
    score,
    technicals,
    headlines: [],
  };
}

export function buildLocalComparison(
  stockA: StockData,
  stockB: StockData,
  language: 'ENG' | 'BM' = 'ENG'
): StockComparisonResult {
  const techA = computeStockTechnicals(stockA);
  const techB = computeStockTechnicals(stockB);
  const scoreA = scoreStockHeuristic(stockA);
  const scoreB = scoreStockHeuristic(stockB);

  if (language === 'BM') {
    return {
      source: 'local-analyst',
      headline: `Perbandingan ${stockA.ticker} vs ${stockB.ticker} di Bursa Malaysia`,
      valuationEdge: `${stockA.ticker} didagangkan pada P/E ${stockA.peRatio}x (Modal Pasaran RM ${stockA.marketCap}) berbanding ${stockB.ticker} pada ${stockB.peRatio}x (RM ${stockB.marketCap}).`,
      incomeComparison: `Hasil dividen ${stockA.ticker} ialah ${stockA.dividendYield} manakala ${stockB.ticker} menawarkan ${stockB.dividendYield}.`,
      momentumAndNews: `Dalam 30 hari terkini, ${stockA.ticker} mencatat ${techA.return30dPct} berbanding ${stockB.ticker} pada ${techB.return30dPct}.`,
      riskComparison: `Hutang/Ekuiti: ${stockA.ticker} (${stockA.debtEquity}) vs ${stockB.ticker} (${stockB.debtEquity}). Status Syariah: ${stockA.shariahCompliant ? 'Ya' : 'Tidak'} vs ${stockB.shariahCompliant ? 'Ya' : 'Tidak'}.`,
      studentVerdict: `${stockA.ticker} sesuai untuk kajian sektor ${stockA.sector}, manakala ${stockB.ticker} menonjolkan pendedahan kepada ${stockB.sector}.`,
      scoreA,
      scoreB,
      headlinesA: [],
      headlinesB: [],
    };
  }

  return {
    source: 'local-analyst',
    headline: `${stockA.ticker} vs ${stockB.ticker} Bursa Malaysia Comparison`,
    valuationEdge: `${stockA.ticker} trades at ${stockA.peRatio}x P/E (RM ${stockA.marketCap} cap) versus ${stockB.ticker} at ${stockB.peRatio}x P/E (RM ${stockB.marketCap} cap).`,
    incomeComparison: `${stockA.ticker} offers a ${stockA.dividendYield} dividend yield compared with ${stockB.dividendYield} for ${stockB.ticker}.`,
    momentumAndNews: `Over the past 30 days, ${stockA.ticker} moved ${techA.return30dPct} while ${stockB.ticker} moved ${techB.return30dPct}.`,
    riskComparison: `Debt/Equity stands at ${stockA.debtEquity} for ${stockA.ticker} vs ${stockB.debtEquity} for ${stockB.ticker}; Shariah status is ${stockA.shariahCompliant ? 'Compliant' : 'Non-Shariah'} vs ${stockB.shariahCompliant ? 'Compliant' : 'Non-Shariah'}.`,
    studentVerdict: `Use ${stockA.ticker} to study ${stockA.sector} fundamentals and ${stockB.ticker} to compare ${stockB.sector} risk-reward dynamics.`,
    scoreA,
    scoreB,
    headlinesA: [],
    headlinesB: [],
  };
}

export function buildLocalSentiment(
  language: 'ENG' | 'BM',
  stocks: StockData[] = allStocks,
  focusStock?: StockData | null
): SentimentAnalysisResult {
  const adv = stocks.filter((s) => s.isPositive).length;
  const tot = Math.max(1, stocks.length);
  const score = Math.max(10, Math.min(90, Math.round((adv / tot) * 100)));
  const label =
    language === 'BM'
      ? score >= 60 ? 'Optimis' : score >= 45 ? 'Neutral' : 'Berhati-hati'
      : score >= 60 ? 'Bullish' : score >= 45 ? 'Balanced' : 'Cautious';

  const scope = focusStock ? focusStock.ticker : 'KLCI';
  const summary =
    language === 'BM'
      ? `Mod luar talian: ${adv}/${tot} kaunter Bursa meningkat (Skor Keluasan ${score}/100). Sambungkan perkhidmatan AI untuk analisis tajuk berita langsung.`
      : `Offline snapshot: ${adv}/${tot} Bursa counters are advancing (Breadth ${score}/100). Connect live AI service for real-time news sentiment.`;

  return {
    source: 'local-snapshot',
    updatedAt: new Date().toISOString().slice(0, 10),
    scope,
    score,
    label,
    summary,
    keyDrivers: [
      `${adv} of ${tot} Bursa Malaysia stocks trading positive`,
      focusStock ? `${focusStock.name} (${focusStock.changePercent})` : 'Broad FBM KLCI sector rotation',
    ],
    headlines: [],
  };
}

export function buildLocalSpotlight(
  stock: StockData,
  userProfile: string,
  language: 'ENG' | 'BM'
): SpotlightAnalysisResult {
  const tech = computeStockTechnicals(stock);
  if (language === 'BM') {
    return {
      source: 'local-analyst',
      headline: `${stock.name} (${stock.ticker}) dipilih sebagai kajian kes untuk persona ${userProfile || 'Jom-Explorer'}.`,
      reasons: [
        { title: 'Skala & Asas', detail: `Hasil tahunan RM ${stock.revenue} dan untung bersih RM ${stock.netProfit} pada P/E ${stock.peRatio}x.` },
        { title: 'Momentum 30 Hari', detail: `Pergerakan 30 hari ialah ${tech.return30dPct} dengan julat RM ${tech.low30d} hingga RM ${tech.high30d}.` },
        { title: 'Profil Dividen & Syariah', detail: `Hasil dividen ${stock.dividendYield}; status ${stock.shariahCompliant ? 'Patuh Syariah' : 'Konvensional'}.` },
      ],
      catalystNote: `Perhatikan perkembangan sektor ${stock.sector} dan aliran institusi Bursa Malaysia.`,
      watchpoint: `Pantau nisbah Hutang/Ekuiti (${stock.debtEquity}) serta risiko kitaran sektor ${stock.sector}.`,
      headlines: [],
    };
  }

  return {
    source: 'local-analyst',
    headline: `${stock.name} (${stock.ticker}) selected as a case study for your ${userProfile || 'Jom-Explorer'} persona.`,
    reasons: [
      { title: 'Scale & Valuation', detail: `Generates RM ${stock.revenue} revenue and RM ${stock.netProfit} net profit, trading at ${stock.peRatio}x P/E.` },
      { title: '30-Day Trend', detail: `Moved ${tech.return30dPct} over 30 days within a RM ${tech.low30d} to RM ${tech.high30d} range.` },
      { title: 'Income & Screening', detail: `Dividend yield of ${stock.dividendYield}; ${stock.shariahCompliant ? 'SC Malaysia Shariah-Compliant' : 'Conventional non-Shariah counter'}.` },
    ],
    catalystNote: `Monitor ${stock.sector} sector announcements and institutional volume on Bursa Malaysia.`,
    watchpoint: `Keep an eye on Debt/Equity (${stock.debtEquity}) and ${stock.sector} margin pressures.`,
    headlines: [],
  };
}

function buildCompactMarketSnapshot(message: string, catalog: StockData[]): string {
  const sorted = [...catalog].sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
  const gainers = sorted.slice(0, 3).map((s) => `${s.ticker} RM${s.price} (${s.changePercent})`).join(', ');
  const losers = sorted.slice(-3).reverse().map((s) => `${s.ticker} RM${s.price} (${s.changePercent})`).join(', ');
  const topDiv = [...catalog]
    .filter((s) => Number.isFinite(parseFloat(s.dividendYield)))
    .sort((a, b) => parseFloat(b.dividendYield) - parseFloat(a.dividendYield))
    .slice(0, 3)
    .map((s) => `${s.ticker} ${s.dividendYield}`)
    .join(', ');

  const lower = message.toLowerCase();
  const mentioned = catalog
    .filter(
      (s) =>
        lower.includes(s.ticker.toLowerCase()) ||
        lower.includes(s.klseCode.toLowerCase().replace('.kl', ''))
    )
    .slice(0, 2)
    .map((s) => `${s.ticker}: RM${s.price} (${s.changePercent}), PE ${s.peRatio}, Div ${s.dividendYield}, Shariah=${s.shariahCompliant}`)
    .join(' | ');

  return `Top Gainers: ${gainers}. Top Losers: ${losers}. Top Dividends: ${topDiv}.${mentioned ? ` Mentioned: ${mentioned}.` : ''}`;
}

export function buildLocalChatReply(message: string, ctx: ChatContext): string {
  const catalog = ctx.stocks || allStocks;
  const lower = message.toLowerCase();

  if (/ignore\s+(all\s+)?(previous|prior)/i.test(message) || /system\s+prompt/i.test(message)) {
    return ctx.language === 'ENG'
      ? 'I am JomAI Coach, scoped strictly to Bursa Malaysia stock education and portfolio simulation. Ask me about any Bursa ticker, Shariah screening, or financial ratios!'
      : 'Saya ialah Jurulatih JomAI untuk pendidikan saham Bursa Malaysia sahaja. Tanya saya tentang mana-mana kod saham Bursa, saringan Syariah, atau nisbah kewangan!';
  }

  const matched = catalog.find(
    (s) =>
      lower.includes(s.ticker.toLowerCase()) ||
      lower.includes(s.klseCode.toLowerCase().replace('.kl', '')) ||
      s.name
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['berhad', 'group', 'holdings', 'malaysia'].includes(w))
        .some((w) => lower.includes(w))
  );

  if (matched) {
    const shariahLabel = matched.shariahCompliant
      ? ctx.language === 'ENG' ? 'Shariah-compliant' : 'Patuh Syariah'
      : ctx.language === 'ENG' ? 'Non-Shariah' : 'Tidak Patuh Syariah';

    return ctx.language === 'ENG'
      ? `${matched.name} (${matched.ticker} / ${matched.klseCode}) trades at RM ${matched.price} (${matched.changePercent}), with a P/E of ${matched.peRatio}, dividend yield of ${matched.dividendYield}, and Market Cap of RM ${matched.marketCap} (${shariahLabel}). You currently have RM ${ctx.cashRM} virtual cash available.`
      : `${matched.name} (${matched.ticker} / ${matched.klseCode}) didagangkan pada RM ${matched.price} (${matched.changePercent}), dengan P/E ${matched.peRatio}, hasil dividen ${matched.dividendYield}, dan Modal Pasaran RM ${matched.marketCap} (${shariahLabel}). Baki tunai maya anda ialah RM ${ctx.cashRM}.`;
  }

  if (lower.includes('shariah') || lower.includes('syariah') || lower.includes('halal')) {
    const shariahTickers = catalog.filter((s) => s.shariahCompliant).slice(0, 6).map((s) => s.ticker).join(', ');
    return ctx.language === 'ENG'
      ? `Shariah-compliant Bursa counters in JomINVEST include ${shariahTickers}, and more. You can filter for Shariah-only stocks directly on the Dashboard!`
      : `Kaunter Bursa Patuh Syariah dalam JomINVEST termasuk ${shariahTickers} dan lain-lain. Anda boleh menapis saham Patuh Syariah terus di Papan Pemuka!`;
  }

  if (lower.includes('dividend') || lower.includes('dividen') || lower.includes('income')) {
    const topDiv = [...catalog]
      .filter((s) => Number.isFinite(parseFloat(s.dividendYield)))
      .sort((a, b) => parseFloat(b.dividendYield) - parseFloat(a.dividendYield))
      .slice(0, 3)
      .map((s) => `${s.ticker} (${s.dividendYield})`)
      .join(', ');
    return ctx.language === 'ENG'
      ? `Top dividend yielders on our Bursa board right now are ${topDiv}. Tip: Once you buy dividend stocks, try the "Simulate Dividend Payout" button in your Portfolio!`
      : `Saham hasil dividen tertinggi di papan Bursa kami sekarang ialah ${topDiv}. Tip: Selepas membeli saham dividen, cuba butang "Simulasi Dividen" dalam Portfolio anda!`;
  }

  if (lower.includes('portfolio') || lower.includes('cash') || lower.includes('tunai') || lower.includes('baki')) {
    return ctx.language === 'ENG'
      ? `Your virtual cash balance is RM ${ctx.cashRM} (${ctx.portfolioSummary}). Investor persona: ${ctx.userProfile || 'Jom-Explorer'}. Aim to diversify across 2-3 sectors!`
      : `Baki tunai maya anda ialah RM ${ctx.cashRM} (${ctx.portfolioSummary}). Persona pelabur: ${ctx.userProfile || 'Jom-Explorer'}. Cuba pelbagaikan merentas 2-3 sektor!`;
  }

  if (lower.includes('p/e') || lower.includes('pe ratio') || lower.includes('nisbah')) {
    return ctx.language === 'ENG'
      ? 'P/E Ratio compares share price to annual earnings per share. Malaysian banks often trade around 9x-13x P/E, while defensive consumer or healthcare names like NESTLE and IHH trade above 30x.'
      : 'Nisbah P/E membandingkan harga saham dengan pendapatan tahunan sesaham. Bank di Malaysia lazimnya sekitar 9x-13x P/E, manakala saham pengguna/kesihatan seperti NESTLE dan IHH melebihi 30x.';
  }

  return ctx.language === 'ENG'
    ? `Ask me about any of our 20 Bursa Malaysia stocks by ticker (e.g., "Analyze MAYBANK", "GAMUDA", "TENAGA"), Shariah stocks, highest dividends, or your RM ${ctx.cashRM} virtual cash!`
    : `Tanya saya tentang mana-mana 20 saham Bursa Malaysia mengikut kod (cth. "MAYBANK", "GAMUDA", "TENAGA"), saham Patuh Syariah, dividen tertinggi, atau tunai maya RM ${ctx.cashRM} anda!`;
}

export async function analyzeStockReport(
  stock: StockData,
  language: 'ENG' | 'BM',
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch,
  catalog: StockData[] = allStocks
): Promise<StockReportSummary> {
  const fallback = buildLocalReport(stock, language, catalog);
  if (!apiBase) return fallback;

  const technicals = computeStockTechnicals(stock);
  const peers = findSectorPeers(stock, catalog);

  try {
    const res = await fetchImpl(`${apiBase}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'report',
        stock,
        technicals,
        peers,
        language,
        includeLiveNews: true,
      }),
    });
    if (!res.ok) {
      try {
        const errData = (await res.json()) as { headlines?: NewsHeadline[] };
        if (Array.isArray(errData.headlines) && errData.headlines.length > 0) {
          return {
            ...fallback,
            headlines: errData.headlines,
            newsCatalysts:
              language === 'BM'
                ? `Sintesis AI sibuk buat sementara — memaparkan ${errData.headlines.length} tajuk berita RSS Malaysia terkini bersama analisis asas tempatan. Tekan Analisis untuk cuba semula.`
                : `Live AI synthesis was temporarily busy — showing ${errData.headlines.length} live Malaysian RSS headlines below with local fundamental analysis. Click Analyze to retry live AI.`,
          };
        }
      } catch {
        // Ignore non-JSON error body
      }
      return fallback;
    }
    const data = (await res.json()) as Partial<StockReportSummary>;
    if (!data.growth || !data.risk || !data.dividend) return fallback;
    return {
      source: 'live-ai',
      title: stripEmojis(data.title || fallback.title),
      growth: stripEmojis(data.growth),
      newsCatalysts: data.newsCatalysts ? stripEmojis(data.newsCatalysts) : fallback.newsCatalysts,
      peerComparison: data.peerComparison ? stripEmojis(data.peerComparison) : fallback.peerComparison,
      risk: stripEmojis(data.risk),
      dividend: stripEmojis(data.dividend),
      studentTakeaway: data.studentTakeaway ? stripEmojis(data.studentTakeaway) : fallback.studentTakeaway,
      shariahNote: fallback.shariahNote,
      score: typeof data.score === 'number' ? data.score : fallback.score,
      technicals,
      headlines: Array.isArray(data.headlines) ? data.headlines : [],
    };
  } catch {
    return fallback;
  }
}

export async function compareStocksAI(
  stockA: StockData,
  stockB: StockData,
  language: 'ENG' | 'BM',
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch
): Promise<StockComparisonResult> {
  const fallback = buildLocalComparison(stockA, stockB, language);
  if (!apiBase) return fallback;

  try {
    const res = await fetchImpl(`${apiBase}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'compare',
        stockA,
        stockB,
        language,
        includeLiveNews: true,
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as Partial<StockComparisonResult>;
    if (!data.valuationEdge || !data.studentVerdict) return fallback;
    return {
      source: 'live-ai',
      headline: stripEmojis(data.headline || fallback.headline),
      valuationEdge: stripEmojis(data.valuationEdge),
      incomeComparison: stripEmojis(data.incomeComparison || fallback.incomeComparison),
      momentumAndNews: stripEmojis(data.momentumAndNews || fallback.momentumAndNews),
      riskComparison: stripEmojis(data.riskComparison || fallback.riskComparison),
      studentVerdict: stripEmojis(data.studentVerdict),
      scoreA: typeof data.scoreA === 'number' ? data.scoreA : fallback.scoreA,
      scoreB: typeof data.scoreB === 'number' ? data.scoreB : fallback.scoreB,
      headlinesA: Array.isArray(data.headlinesA) ? data.headlinesA : [],
      headlinesB: Array.isArray(data.headlinesB) ? data.headlinesB : [],
    };
  } catch {
    return fallback;
  }
}

export async function fetchSentimentAnalysis(params: {
  language: 'ENG' | 'BM';
  stocks: StockData[];
  focusStock?: StockData | null;
  apiBase?: string;
  fetchImpl?: typeof fetch;
}): Promise<SentimentAnalysisResult> {
  const { language, stocks, focusStock, apiBase = getApiBaseUrl(), fetchImpl = fetch } = params;
  const fallback = buildLocalSentiment(language, stocks, focusStock);
  if (!apiBase) return fallback;

  const sorted = [...stocks].sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
  const marketSummary = {
    advancers: stocks.filter((s) => s.isPositive).length,
    total: stocks.length,
    topGainers: sorted.slice(0, 3).map((s) => `${s.ticker} (${s.changePercent})`),
    topLosers: sorted.slice(-3).reverse().map((s) => `${s.ticker} (${s.changePercent})`),
  };

  try {
    const res = await fetchImpl(`${apiBase}/api/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        ticker: focusStock?.ticker,
        stockName: focusStock?.name,
        klseCode: focusStock?.klseCode,
        marketSummary,
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as Partial<SentimentAnalysisResult>;
    if (typeof data.score !== 'number' || !data.summary) return fallback;
    return {
      source: data.source === 'live-ai' || data.source === 'live-rss' ? data.source : 'live-rss',
      updatedAt: data.updatedAt || fallback.updatedAt,
      scope: data.scope || fallback.scope,
      score: data.score,
      label: stripEmojis(data.label || fallback.label),
      summary: stripEmojis(data.summary),
      keyDrivers: Array.isArray(data.keyDrivers) ? data.keyDrivers.map((d) => stripEmojis(d)) : fallback.keyDrivers,
      headlines: Array.isArray(data.headlines) ? data.headlines : [],
    };
  } catch {
    return fallback;
  }
}

export async function fetchLiveStockNews(
  stock: StockData,
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch
): Promise<{ source: 'live' | 'offline'; headlines: NewsHeadline[] }> {
  if (!apiBase) return { source: 'offline', headlines: [] };
  const query = `"${stock.name}" Bursa Malaysia`;
  try {
    const res = await fetchImpl(
      `${apiBase}/api/news?q=${encodeURIComponent(query)}&klseCode=${encodeURIComponent(stock.klseCode)}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return { source: 'offline', headlines: [] };
    const data = (await res.json()) as { headlines?: NewsHeadline[] };
    return {
      source: 'live',
      headlines: Array.isArray(data.headlines) ? data.headlines : [],
    };
  } catch {
    return { source: 'offline', headlines: [] };
  }
}

export async function fetchSpotlightAnalysis(params: {
  stock: StockData;
  userProfile: string;
  cashRM: string;
  portfolioSummary: string;
  language: 'ENG' | 'BM';
  apiBase?: string;
  fetchImpl?: typeof fetch;
}): Promise<SpotlightAnalysisResult> {
  const {
    stock,
    userProfile,
    cashRM,
    portfolioSummary,
    language,
    apiBase = getApiBaseUrl(),
    fetchImpl = fetch,
  } = params;
  const fallback = buildLocalSpotlight(stock, userProfile, language);
  if (!apiBase) return fallback;

  const technicals = computeStockTechnicals(stock);

  try {
    const res = await fetchImpl(`${apiBase}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'spotlight',
        stock,
        technicals,
        userProfile,
        cashRM,
        portfolioSummary,
        language,
        includeLiveNews: true,
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as Partial<SpotlightAnalysisResult>;
    if (!data.headline || !Array.isArray(data.reasons) || data.reasons.length === 0) return fallback;
    return {
      source: 'live-ai',
      headline: stripEmojis(data.headline),
      reasons: data.reasons.slice(0, 3).map((r) => ({
        title: stripEmojis(r.title || ''),
        detail: stripEmojis(r.detail || ''),
      })),
      catalystNote: stripEmojis(data.catalystNote || fallback.catalystNote),
      watchpoint: stripEmojis(data.watchpoint || fallback.watchpoint),
      headlines: Array.isArray(data.headlines) ? data.headlines : [],
    };
  } catch {
    return fallback;
  }
}

export async function askJomAI(
  message: string,
  ctx: ChatContext,
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch
): Promise<{ reply: string; source: 'live-ai' | 'local-analyst' }> {
  const localReply = stripEmojis(buildLocalChatReply(message, ctx));
  if (!apiBase) return { reply: localReply, source: 'local-analyst' };

  const catalog = ctx.stocks || allStocks;
  const marketSnapshot = buildCompactMarketSnapshot(message, catalog);

  try {
    const res = await fetchImpl(`${apiBase}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'chat',
        message,
        language: ctx.language,
        cashRM: ctx.cashRM,
        portfolioSummary: ctx.portfolioSummary,
        userProfile: ctx.userProfile,
        marketSnapshot,
        history: (ctx.history || []).slice(-6),
        includeLiveNews: true,
      }),
    });
    if (!res.ok) return { reply: localReply, source: 'local-analyst' };
    const data = (await res.json()) as { reply?: string };
    if (!data.reply) return { reply: localReply, source: 'local-analyst' };
    return { reply: stripEmojis(data.reply), source: 'live-ai' };
  } catch {
    return { reply: localReply, source: 'local-analyst' };
  }
}
