import { stocks as allStocks, type StockData } from '../data/stocks';
import { getApiBaseUrl } from './marketData';

export interface StockReportSummary {
  source: 'live-ai' | 'local-analyst';
  title: string;
  growth: string;
  risk: string;
  dividend: string;
  shariahNote: string;
  score: number;
}

export interface ChatContext {
  language: 'ENG' | 'BM';
  cashRM: string;
  portfolioSummary: string;
  userProfile: string;
  stocks?: StockData[];
}

function stripEmojis(input: string): string {
  return input.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

export function buildLocalReport(stock: StockData, language: 'ENG' | 'BM' = 'ENG'): StockReportSummary {
  const pe = parseFloat(stock.peRatio);
  const divYield = parseFloat(String(stock.dividendYield).replace('%', ''));
  const de = parseFloat(stock.debtEquity);

  let score = 76;
  if (Number.isFinite(divYield) && divYield >= 4) score += 8;
  if (Number.isFinite(pe) && pe > 0 && pe <= 16) score += 6;
  if (Number.isFinite(pe) && pe > 35) score -= 8;
  if (stock.isPositive) score += 3;
  score = Math.max(58, Math.min(95, score));

  if (language === 'BM') {
    const growth = `${stock.name} (${stock.klseCode}) menjana hasil tahunan RM ${stock.revenue} dengan untung bersih RM ${stock.netProfit} dalam sektor ${stock.sector}. Pergerakan harian semasa ialah ${stock.changePercent} pada harga RM ${stock.price}.`;
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

    return {
      source: 'local-analyst',
      title: `Ringkasan Eksekutif ${stock.name} (${stock.ticker})`,
      growth,
      risk,
      dividend,
      shariahNote,
      score,
    };
  }

  const growth = `${stock.name} (${stock.klseCode}) posts RM ${stock.revenue} in annual revenue and RM ${stock.netProfit} net profit within ${stock.sector}. Shares trade at RM ${stock.price} (${stock.changePercent} today) on ${stock.volume} volume.`;
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

  return {
    source: 'local-analyst',
    title: `${stock.name} (${stock.ticker}) Fundamental Brief`,
    growth,
    risk,
    dividend,
    shariahNote,
    score,
  };
}

export function buildLocalChatReply(message: string, ctx: ChatContext): string {
  const catalog = ctx.stocks || allStocks;
  const lower = message.toLowerCase();

  if (/ignore\s+(all\s+)?(previous|prior)/i.test(message) || /system\s+prompt/i.test(message)) {
    return ctx.language === 'ENG'
      ? 'I am JomAI Coach, scoped strictly to Bursa Malaysia stock education and portfolio simulation. Ask me about any Bursa ticker, Shariah screening, or financial ratios!'
      : 'Saya ialah Jurulatih JomAI untuk pendidikan saham Bursa Malaysia sahaja. Tanya saya tentang mana-mana kod saham Bursa, saringan Syariah, atau nisbah kewangan!';
  }

  // Check if user mentioned any specific Bursa stock by ticker or name keyword
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
      ? `Your virtual cash balance is RM ${ctx.cashRM} (${ctx.portfolioSummary}). Investor persona: ${ctx.userProfile || 'Jom-Explorer'}. Aim to diversify across 2–3 sectors!`
      : `Baki tunai maya anda ialah RM ${ctx.cashRM} (${ctx.portfolioSummary}). Persona pelabur: ${ctx.userProfile || 'Jom-Explorer'}. Cuba pelbagaikan merentas 2–3 sektor!`;
  }

  if (lower.includes('p/e') || lower.includes('pe ratio') || lower.includes('nisbah')) {
    return ctx.language === 'ENG'
      ? 'P/E Ratio compares share price to annual earnings per share. Malaysian banks often trade around 9x–13x P/E, while defensive consumer or healthcare names like NESTLE and IHH trade above 30x.'
      : 'Nisbah P/E membandingkan harga saham dengan pendapatan tahunan sesaham. Bank di Malaysia lazimnya sekitar 9x–13x P/E, manakala saham pengguna/kesihatan seperti NESTLE dan IHH melebihi 30x.';
  }

  return ctx.language === 'ENG'
    ? `Ask me about any of our 20 Bursa Malaysia stocks by ticker (e.g., "Analyze MAYBANK", "GAMUDA", "TENAGA"), Shariah stocks, highest dividends, or your RM ${ctx.cashRM} virtual cash!`
    : `Tanya saya tentang mana-mana 20 saham Bursa Malaysia mengikut kod (cth. "MAYBANK", "GAMUDA", "TENAGA"), saham Patuh Syariah, dividen tertinggi, atau tunai maya RM ${ctx.cashRM} anda!`;
}

export async function analyzeStockReport(
  stock: StockData,
  language: 'ENG' | 'BM',
  apiBase: string = getApiBaseUrl(),
  fetchImpl: typeof fetch = fetch
): Promise<StockReportSummary> {
  const fallback = buildLocalReport(stock, language);
  if (!apiBase) return fallback;

  try {
    const res = await fetchImpl(`${apiBase}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'report', stock, language }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as Partial<StockReportSummary>;
    if (!data.growth || !data.risk || !data.dividend) return fallback;
    return {
      source: 'live-ai',
      title: stripEmojis(data.title || fallback.title),
      growth: stripEmojis(data.growth),
      risk: stripEmojis(data.risk),
      dividend: stripEmojis(data.dividend),
      shariahNote: fallback.shariahNote,
      score: typeof data.score === 'number' ? data.score : fallback.score,
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
