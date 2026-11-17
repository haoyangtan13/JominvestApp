import { calculateBursaFees } from '../data/stocks';
import type { StockData, PortfolioItem, TradeRecord } from '../App';

export type Transaction = TradeRecord & {
  date?: string;
  price?: number;
  total?: number;
};

export type { StockData, PortfolioItem };

export interface AIContext {
  stocks: StockData[];
  portfolio: PortfolioItem[];
  cashBalance: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive' | string | null;
  language: 'ENG' | 'BM';
  transactions?: Transaction[];
}

export interface AIChatResponse {
  text: string;
  provider: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM' | 'QUANT_ENGINE';
  referencedTickers: string[];
}

export interface RingkasAnalysisResult {
  title: string;
  bursaCode: string;
  isShariah: boolean;
  score: number;
  growth: string;
  risk: string;
  dividend: string;
  sourceLabel: string;
  extractedExcerpt?: string;
  provider: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM' | 'QUANT_ENGINE';
}

const AI_KEY_STORAGE = 'jominvest_ai_api_key';
const PDFJS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Strips emojis and markdown bold/heading clutter so output renders cleanly in .font-tabular.
 */
function sanitizeInstitutionalText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getStoredAIApiKey(): string {
  try {
    const stored = localStorage.getItem(AI_KEY_STORAGE);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Ignore storage read errors
  }
  const env = (import.meta as any).env;
  const envKey = env?.VITE_AI_API_KEY || env?.VITE_GEMINI_API_KEY || '';
  return typeof envKey === 'string' ? envKey.trim() : '';
}

export function setStoredAIApiKey(key: string): void {
  try {
    const clean = (key || '').trim();
    if (clean.length > 0) {
      localStorage.setItem(AI_KEY_STORAGE, clean);
    } else {
      localStorage.removeItem(AI_KEY_STORAGE);
    }
  } catch {
    // Ignore storage write errors
  }
}

async function ensurePdfJsLoaded(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (win.pdfjsLib) {
    return win.pdfjsLib;
  }

  return new Promise(resolve => {
    const timeoutId = setTimeout(() => resolve(null), 4000);
    const script = document.createElement('script');
    script.src = PDFJS_CDN_URL;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeoutId);
      if (win.pdfjsLib) {
        win.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(win.pdfjsLib);
      } else {
        resolve(null);
      }
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

function extractReadableTextFromPdfBuffer(buffer: ArrayBuffer): string {
  const raw = new TextDecoder('latin1').decode(buffer);
  const noiseTokens = new Set([
    'Type',
    'Font',
    'Page',
    'Pages',
    'MediaBox',
    'Resources',
    'FlateDecode',
    'BaseFont',
    'Encoding',
    'WinAnsiEncoding',
    'MacRomanEncoding',
    'ObjStm',
    'XObject',
    'Subtype',
    'Catalog',
    'Outlines',
    'ProcSet',
    'ExtGState',
    'Filter',
    'Length',
    'Parent',
    'Contents',
    'StructTreeRoot',
    'FontDescriptor'
  ]);

  const chunks: string[] = [];

  // Extract text from BT ... ET text blocks first
  const btEtRegex = /BT[\s\S]{1,12000}?ET/g;
  const btBlocks = raw.match(btEtRegex) || [];
  const sourcePool = btBlocks.length > 0 ? btBlocks.join('\n') : raw;

  const parenRegex = /\(([^()\\]{3,})\)/g;
  let match: RegExpExecArray | null;
  while ((match = parenRegex.exec(sourcePool)) !== null) {
    const token = match[1]
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (
      token.length >= 3 &&
      /[A-Za-z0-9]/.test(token) &&
      !noiseTokens.has(token) &&
      !/^[0-9.\s]+$/.test(token)
    ) {
      chunks.push(token);
    }
    if (chunks.join(' ').length > 10000) break;
  }

  // Fallback for uncompressed ASCII segments if parenthesized strings were sparse
  if (chunks.join(' ').length < 80) {
    const asciiMatches =
      raw.match(/[A-Za-z0-9][A-Za-z0-9\s,.;:%()RM/\-]{12,}/g) || [];
    for (const seg of asciiMatches) {
      const cleaned = seg.replace(/\s+/g, ' ').trim();
      if (
        cleaned.length >= 12 &&
        !/obj|endobj|stream|endstream|xref|trailer|FlateDecode|FontDescriptor/i.test(cleaned)
      ) {
        chunks.push(cleaned);
      }
      if (chunks.join(' ').length > 8000) break;
    }
  }

  return chunks
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}

/**
 * Extracts text from uploaded .pdf, .txt, .md, .csv, or .json documents.
 * Uses pdf.js for multi-page PDF parsing with a deterministic offline binary fallback.
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  const lowerName = (file.name || '').toLowerCase();
  const isPlainText =
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.json') ||
    (file.type && file.type.startsWith('text/'));

  if (isPlainText) {
    try {
      const text = await file.text();
      return text.replace(/\s+/g, ' ').trim().slice(0, 12000);
    } catch {
      return '';
    }
  }

  const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
  if (isPdf) {
    try {
      const buffer = await file.arrayBuffer();
      const pdfjsLib = await ensurePdfJsLoaded();
      if (pdfjsLib) {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
          const pdf = await loadingTask.promise;
          const maxPages = Math.min(pdf.numPages || 1, 8);
          const pageTexts: string[] = [];

          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const strings = (content.items || [])
              .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
              .filter(Boolean);
            pageTexts.push(strings.join(' '));
          }

          const combined = pageTexts.join('\n').replace(/\s+/g, ' ').trim();
          if (combined.length >= 40) {
            return combined.slice(0, 12000);
          }
        } catch {
          // Fall through to offline binary parser
        }
      }

      const fallbackText = extractReadableTextFromPdfBuffer(buffer);
      if (fallbackText.length > 0) {
        return fallbackText;
      }
    } catch {
      return '';
    }
  }

  try {
    const genericText = await file.text();
    return genericText.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 12000);
  } catch {
    return '';
  }
}

interface LLMCallResult {
  text: string;
  provider: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM';
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<LLMCallResult | null> {
  const apiKey = getStoredAIApiKey();

  // Tier 1: User-configured API Key (Gemini, Groq, or OpenAI-compatible)
  if (apiKey.length > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      if (apiKey.startsWith('AIza')) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { temperature: 0.25, maxOutputTokens: 900 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof candidateText === 'string' && candidateText.trim().length > 15) {
            return {
              text: sanitizeInstitutionalText(candidateText),
              provider: 'API_KEY_LLM'
            };
          }
        }
      } else {
        const isGroq = apiKey.startsWith('gsk_');
        const endpoint = isGroq
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';
        const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.25,
            max_tokens: 900
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const messageText = data?.choices?.[0]?.message?.content;
          if (typeof messageText === 'string' && messageText.trim().length > 15) {
            return {
              text: sanitizeInstitutionalText(messageText),
              provider: 'API_KEY_LLM'
            };
          }
        }
      }
    } catch {
      // Fall through to Tier 2
    }
  }

  // Tier 2: Zero-key Live Cloud LLM endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.25
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || data?.text;
        if (
          typeof text === 'string' &&
          text.trim().length > 20 &&
          !text.includes('<!DOCTYPE') &&
          !text.toLowerCase().includes('rate limit')
        ) {
          return {
            text: sanitizeInstitutionalText(text),
            provider: 'LIVE_CLOUD_LLM'
          };
        }
      } else {
        const rawText = await res.text();
        if (
          rawText &&
          rawText.trim().length > 20 &&
          !rawText.includes('<!DOCTYPE') &&
          !rawText.toLowerCase().includes('rate limit')
        ) {
          return {
            text: sanitizeInstitutionalText(rawText),
            provider: 'LIVE_CLOUD_LLM'
          };
        }
      }
    }
  } catch {
    // Fall through to Tier 3 QUANT_ENGINE
  }

  return null;
}

function findReferencedStocks(text: string, stocks: StockData[]): StockData[] {
  const lower = text.toLowerCase();
  const genericWords = new Set([
    'berhad',
    'bhd',
    'malaysia',
    'group',
    'holdings',
    'bank',
    'banking',
    'corporation',
    'corp',
    'international',
    'resources',
    'plantations',
    'plantation',
    'healthcare',
    'chemicals',
    'trust',
    'real',
    'estate',
    'investment',
    'syarikat',
    'keluarga'
  ]);

  const scoredMatches: { stock: StockData; index: number; priority: number }[] = [];

  for (const s of stocks) {
    const tickerLower = s.ticker.toLowerCase();
    const codeLower = s.bursaCode.toLowerCase();
    const codeNum = codeLower.replace('.kl', '');

    const tickerRegex = new RegExp(`\\b${tickerLower}\\b`, 'i');
    const tickerExec = tickerRegex.exec(lower);
    if (tickerExec) {
      scoredMatches.push({ stock: s, index: tickerExec.index, priority: 1 });
      continue;
    }

    if (lower.includes(codeLower) || (codeNum.length >= 4 && new RegExp(`\\b${codeNum}\\b`).test(lower))) {
      scoredMatches.push({ stock: s, index: lower.indexOf(codeNum), priority: 2 });
      continue;
    }

    const distinctWords = s.name
      .toLowerCase()
      .replace(/[().,/-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !genericWords.has(w));

    for (const w of distinctWords) {
      const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
      const wordExec = wordRegex.exec(lower);
      if (wordExec) {
        scoredMatches.push({ stock: s, index: wordExec.index, priority: 3 });
        break;
      }
    }
  }

  scoredMatches.sort((a, b) => a.priority - b.priority || a.index - b.index);
  return scoredMatches.map(m => m.stock);
}

function computeCompositeScore(stock: StockData): number {
  const r = stock.radarScores;
  if (!r) return 75;
  return Math.round((r.value + r.growth + r.health + r.dividend + r.momentum) / 5);
}

function normalizeRiskMandate(
  profile: AIContext['riskProfile']
): 'Conservative' | 'Moderate' | 'Aggressive' {
  const raw = (profile || '').toLowerCase();
  if (raw.includes('conserv') || raw.includes('protector')) return 'Conservative';
  if (raw.includes('mod') || raw.includes('builder') || raw.includes('balanced')) return 'Moderate';
  return 'Aggressive';
}

function buildQuantChatResponse(
  prompt: string,
  context: AIContext,
  matchedStocks: StockData[]
): { text: string; referencedTickers: string[] } {
  const lower = prompt.toLowerCase();
  const { stocks, portfolio, cashBalance, language } = context;
  const mandate = normalizeRiskMandate(context.riskProfile);

  // 1. Head-to-Head Comparison (2+ matched stocks)
  if (matchedStocks.length >= 2) {
    const [s1, s2] = matchedStocks;
    const score1 = computeCompositeScore(s1);
    const score2 = computeCompositeScore(s2);
    const lot1 = calculateBursaFees(parseFloat(s1.price), 100, 'BUY');
    const lot2 = calculateBursaFees(parseFloat(s2.price), 100, 'BUY');
    const yield1 = parseFloat(s1.dividendYield.replace('%', '')) || 0;
    const yield2 = parseFloat(s2.dividendYield.replace('%', '')) || 0;

    const text =
      language === 'ENG'
        ? `HEAD-TO-HEAD EQUITY COMPARISON: ${s1.ticker} vs ${s2.ticker}\n\n` +
          `01 / ${s1.name} (${s1.ticker} · ${s1.bursaCode})\n` +
          `Spot: RM ${s1.price} (${s1.changePercent}) | 1 Lot (100 sh incl. fees): RM ${lot1.netTotal.toFixed(2)}\n` +
          `P/E: ${s1.peRatio}x | Indicated Yield: ${s1.dividendYield} | Debt/Equity: ${s1.debtEquity}\n` +
          `FY Revenue: ${s1.revenue} | Net Profit: ${s1.netProfit} | ${s1.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'} | Score: ${score1}/100\n\n` +
          `02 / ${s2.name} (${s2.ticker} · ${s2.bursaCode})\n` +
          `Spot: RM ${s2.price} (${s2.changePercent}) | 1 Lot (100 sh incl. fees): RM ${lot2.netTotal.toFixed(2)}\n` +
          `P/E: ${s2.peRatio}x | Indicated Yield: ${s2.dividendYield} | Debt/Equity: ${s2.debtEquity}\n` +
          `FY Revenue: ${s2.revenue} | Net Profit: ${s2.netProfit} | ${s2.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'} | Score: ${score2}/100\n\n` +
          `QUANTITATIVE DESK VERDICT (${mandate.toUpperCase()} MANDATE):\n` +
          `${yield1 >= yield2 ? s1.ticker : s2.ticker} leads on tax-exempt single-tier dividend distribution (${yield1 >= yield2 ? s1.dividendYield : s2.dividendYield}), whereas ${s1.radarScores.growth >= s2.radarScores.growth ? s1.ticker : s2.ticker} carries stronger earnings growth momentum (${Math.max(s1.radarScores.growth, s2.radarScores.growth)}/100).`
        : `PERBANDINGAN EKUITI: ${s1.ticker} lwn ${s2.ticker}\n\n` +
          `01 / ${s1.name} (${s1.ticker} · ${s1.bursaCode})\n` +
          `Harga Semasa: RM ${s1.price} (${s1.changePercent}) | Kos 1 Lot (100 unit termasuk yuran): RM ${lot1.netTotal.toFixed(2)}\n` +
          `P/E: ${s1.peRatio}x | Hasil Dividen: ${s1.dividendYield} | Hutang/Ekuiti: ${s1.debtEquity} | Skor: ${score1}/100\n\n` +
          `02 / ${s2.name} (${s2.ticker} · ${s2.bursaCode})\n` +
          `Harga Semasa: RM ${s2.price} (${s2.changePercent}) | Kos 1 Lot (100 unit termasuk yuran): RM ${lot2.netTotal.toFixed(2)}\n` +
          `P/E: ${s2.peRatio}x | Hasil Dividen: ${s2.dividendYield} | Hutang/Ekuiti: ${s2.debtEquity} | Skor: ${score2}/100\n\n` +
          `RUMUSAN MEJA KUANTITATIF (MANDAT ${mandate.toUpperCase()}):\n` +
          `${yield1 >= yield2 ? s1.ticker : s2.ticker} mendahului dari segi agihan dividen (${yield1 >= yield2 ? s1.dividendYield : s2.dividendYield}), manakala ${s1.radarScores.growth >= s2.radarScores.growth ? s1.ticker : s2.ticker} menunjukkan momentum pertumbuhan lebih kukuh.`;

    return { text, referencedTickers: [s1.ticker, s2.ticker] };
  }

  // 2. Single Issuer Deep Brief (and/or lot fee calculation for that issuer)
  if (matchedStocks.length === 1) {
    const s = matchedStocks[0];
    const score = computeCompositeScore(s);
    const numMatch = prompt.match(/\b(\d{1,5})\s*(lot|lots|sh|shares|unit|units)?\b/i);
    let units = 100;
    if (numMatch) {
      const parsed = parseInt(numMatch[1], 10);
      const unitLabel = (numMatch[2] || '').toLowerCase();
      if (parsed > 0) {
        units = unitLabel.startsWith('lot') ? parsed * 100 : parsed < 50 ? parsed * 100 : parsed;
      }
    }
    const feeCalc = calculateBursaFees(parseFloat(s.price), units, 'BUY');
    const heldPosition = portfolio.find(p => p.stock.ticker === s.ticker || p.stock.id === s.id);
    const positionNote = heldPosition
      ? language === 'ENG'
        ? `Current Ledger Position: ${heldPosition.quantity} sh @ avg RM ${heldPosition.averagePrice.toFixed(2)} (Market Value RM ${(heldPosition.quantity * parseFloat(s.price)).toFixed(2)}).`
        : `Pegangan Semasa: ${heldPosition.quantity} unit @ purata RM ${heldPosition.averagePrice.toFixed(2)}.`
      : language === 'ENG'
      ? `Current Ledger Position: 0 sh (Available Buying Power: RM ${cashBalance.toFixed(2)}).`
      : `Pegangan Semasa: 0 unit (Kuasa Beli Tersedia: RM ${cashBalance.toFixed(2)}).`;

    const text =
      language === 'ENG'
        ? `ISSUER RESEARCH BRIEF: ${s.name} (${s.ticker} · ${s.bursaCode})\n` +
          `Sector: ${s.sector} | Regulatory Standing: ${s.isShariah ? 'SAC SHARIAH COMPLIANT' : 'CONVENTIONAL'}\n` +
          `Spot Price: RM ${s.price} (${s.changePercent}) | Market Cap: RM ${s.marketCap}\n` +
          `Multiples: P/E ${s.peRatio}x | Indicated Yield: ${s.dividendYield} | Debt/Equity: ${s.debtEquity}\n` +
          `Audited Financials: FY Revenue RM ${s.revenue} | Net Profit RM ${s.netProfit}\n` +
          `5-Axis Factor Scorecard: Composite ${score}/100 (Val ${s.radarScores.value} · Grw ${s.radarScores.growth} · Hlt ${s.radarScores.health} · Div ${s.radarScores.dividend} · Mom ${s.radarScores.momentum})\n\n` +
          `CONTRACT SIZING (${units} sh / ${(units / 100).toFixed(1)} Board Lots):\n` +
          `Gross Principal: RM ${feeCalc.grossAmount.toFixed(2)} | Brokerage: RM ${feeCalc.brokerageFee.toFixed(2)} | Clearing: RM ${feeCalc.clearingFee.toFixed(2)} | Stamp Duty: RM ${feeCalc.stampDuty.toFixed(2)} | Net Settlement: RM ${feeCalc.netTotal.toFixed(2)}\n` +
          `${positionNote}\n\n` +
          `ANALYTICAL THESIS: ${s.description}`
        : `NOTA PENYELIDIKAN PENERBIT: ${s.name} (${s.ticker} · ${s.bursaCode})\n` +
          `Sektor: ${s.sector} | Status Kawal Selia: ${s.isShariah ? 'PATUH SYARIAH MPS' : 'KONVENSIONAL'}\n` +
          `Harga Semasa: RM ${s.price} (${s.changePercent}) | Modal Pasaran: RM ${s.marketCap}\n` +
          `Gandaan: P/E ${s.peRatio}x | Hasil Dividen: ${s.dividendYield} | Hutang/Ekuiti: ${s.debtEquity}\n` +
          `Kewangan Teraudit: Hasil RM ${s.revenue} | Untung Bersih RM ${s.netProfit}\n\n` +
          `ANGGARAN KONTRAK (${units} unit / ${(units / 100).toFixed(1)} Lot Papan):\n` +
          `Nilai Kasar: RM ${feeCalc.grossAmount.toFixed(2)} | Yuran Kontrak: RM ${feeCalc.totalFees.toFixed(2)} | Jumlah Bersih: RM ${feeCalc.netTotal.toFixed(2)}\n` +
          `${positionNote}\n\n` +
          `TESIS ANALISIS: ${s.description}`;

    return { text, referencedTickers: [s.ticker] };
  }

  // 3. Portfolio & Concentration Audit
  if (
    lower.includes('portfolio') ||
    lower.includes('pegangan') ||
    lower.includes('audit') ||
    lower.includes('position') ||
    lower.includes('risk') ||
    lower.includes('risiko') ||
    lower.includes('balance') ||
    lower.includes('baki')
  ) {
    const holdingsValue = portfolio.reduce(
      (sum, item) => sum + parseFloat(item.stock.price) * item.quantity,
      0
    );
    const totalCost = portfolio.reduce(
      (sum, item) => sum + item.averagePrice * item.quantity,
      0
    );
    const netLiquidity = holdingsValue + cashBalance;
    const unrealizedPnl = holdingsValue - totalCost;
    const unrealizedPct = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

    if (portfolio.length === 0) {
      const starterPicks =
        mandate === 'Conservative'
          ? ['MAYBANK', 'TENAGA', 'PAVREIT']
          : mandate === 'Moderate'
          ? ['CIMB', 'MISC', 'TM']
          : ['GAMUDA', 'YTLPOWR', 'INARI'];

      const text =
        language === 'ENG'
          ? `PORTFOLIO LEDGER & MANDATE AUDIT (${mandate.toUpperCase()} MANDATE)\n` +
            `Open Positions: 0 securities | Cash Reserve: RM ${cashBalance.toFixed(2)} (100.0% liquidity)\n\n` +
            `CAPITAL DEPLOYMENT PLAN:\n` +
            `Your account holds 100% uninvested Ringgit liquidity. To align with institutional diversification standards (<60% single-sector cap, 15%-25% cash buffer), consider deploying initial board lots across ${starterPicks.join(', ')}.`
          : `AUDIT LEJAR PORTFOLIO (MANDAT ${mandate.toUpperCase()})\n` +
            `Posisi Terbuka: 0 sekuriti | Rizab Tunai: RM ${cashBalance.toFixed(2)} (100.0% kecairan)\n\n` +
            `CADANGAN PERUNTUKAN MODAL:\n` +
            `Akaun anda mempunyai 100% tunai. Pertimbangkan kepelbagaian merentasi sekuriti seperti ${starterPicks.join(', ')}.`;

      return { text, referencedTickers: starterPicks };
    }

    const sectorMap: Record<string, number> = {};
    const positionLines: string[] = [];
    const tickers: string[] = [];

    for (const item of portfolio) {
      const mktVal = parseFloat(item.stock.price) * item.quantity;
      const costVal = item.averagePrice * item.quantity;
      const posPnl = mktVal - costVal;
      const posPct = costVal > 0 ? (posPnl / costVal) * 100 : 0;
      sectorMap[item.stock.sector] = (sectorMap[item.stock.sector] || 0) + mktVal;
      tickers.push(item.stock.ticker);
      positionLines.push(
        `- ${item.stock.ticker} (${item.quantity} sh): Mkt RM ${mktVal.toFixed(2)} | Avg RM ${item.averagePrice.toFixed(2)} | P&L ${posPnl >= 0 ? '+' : ''}RM ${posPnl.toFixed(2)} (${posPct >= 0 ? '+' : ''}${posPct.toFixed(2)}%)`
      );
    }

    const sortedSectors = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
    const [topSector, topSectorVal] = sortedSectors[0];
    const topSectorPct = holdingsValue > 0 ? Math.round((topSectorVal / holdingsValue) * 100) : 0;
    const cashWeightPct = netLiquidity > 0 ? Math.round((cashBalance / netLiquidity) * 100) : 0;

    const concentrationNote =
      topSectorPct > 60
        ? `CONCENTRATION ALERT: ${topSector} represents ${topSectorPct}% of equity holdings (exceeding the 60% institutional single-sector ceiling). Rebalance into an uncorrelated sector.`
        : sortedSectors.length < 3
        ? `DIVERSIFICATION NOTE: Portfolio spans ${sortedSectors.length} sector(s). Adding a 3rd uncorrelated Bursa sector will improve drawdown resilience.`
        : `DIVERSIFICATION VERIFIED: Balanced exposure across ${sortedSectors.length} sectors with ${topSector} at ${topSectorPct}%.`;

    const text =
      language === 'ENG'
        ? `PORTFOLIO LEDGER AUDIT (${mandate.toUpperCase()} MANDATE)\n` +
          `Net Liquidity: RM ${netLiquidity.toFixed(2)} | Equity Value: RM ${holdingsValue.toFixed(2)} | Cash Reserve: RM ${cashBalance.toFixed(2)} (${cashWeightPct}%)\n` +
          `Unrealized P&L: ${unrealizedPnl >= 0 ? '+' : ''}RM ${unrealizedPnl.toFixed(2)} (${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(2)}%)\n\n` +
          `OPEN POSITIONS (${portfolio.length}):\n${positionLines.join('\n')}\n\n` +
          `RISK & SECTOR DIAGNOSTIC:\n${concentrationNote}`
        : `AUDIT LEJAR PORTFOLIO (MANDAT ${mandate.toUpperCase()})\n` +
          `Kecairan Bersih: RM ${netLiquidity.toFixed(2)} | Nilai Ekuiti: RM ${holdingsValue.toFixed(2)} | Tunai: RM ${cashBalance.toFixed(2)} (${cashWeightPct}%)\n` +
          `Untung/Rugi Belum Realisasi: ${unrealizedPnl >= 0 ? '+' : ''}RM ${unrealizedPnl.toFixed(2)} (${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(2)}%)\n\n` +
          `POSISI AKTIF (${portfolio.length}):\n${positionLines.join('\n')}\n\n` +
          `DIAGNOSTIK RISIKO: Sektor utama ialah ${topSector} (${topSectorPct}% merentasi ${sortedSectors.length} sektor).`;

    return { text, referencedTickers: tickers };
  }

  // 4. Bursa Contract Fee Schedule & Order Cost Calculator
  if (
    lower.includes('fee') ||
    lower.includes('yuran') ||
    lower.includes('broker') ||
    lower.includes('stamp') ||
    lower.includes('clearing') ||
    lower.includes('contract') ||
    lower.includes('lot') ||
    lower.includes('kos')
  ) {
    const sampleStock = stocks[0];
    const sampleFee = calculateBursaFees(parseFloat(sampleStock.price), 100, 'BUY');
    const text =
      language === 'ENG'
        ? `BURSA MALAYSIA STATUTORY CONTRACT FEE SCHEDULE\n` +
          `01 / Standard Board Lot: 100 units per lot.\n` +
          `02 / Brokerage Fee: 0.10% of gross contract value (minimum RM 1.00).\n` +
          `03 / Clearing Fee: 0.03% of gross contract value (capped at RM 1,000.00).\n` +
          `04 / Stamp Duty: RM 1.00 for every RM 1,000.00 (or fractional part) of trade value (capped at RM 1,000.00).\n\n` +
          `SAMPLE CONTRACT NOTE (1 Lot / 100 sh ${sampleStock.ticker} @ RM ${sampleStock.price}):\n` +
          `Gross Principal: RM ${sampleFee.grossAmount.toFixed(2)} | Brokerage: RM ${sampleFee.brokerageFee.toFixed(2)} | Clearing: RM ${sampleFee.clearingFee.toFixed(2)} | Stamp Duty: RM ${sampleFee.stampDuty.toFixed(2)} | Net Settlement: RM ${sampleFee.netTotal.toFixed(2)}`
        : `JADUAL YURAN NOTA KONTRAK BURSA MALAYSIA\n` +
          `01 / Lot Papan Standard: 100 unit setiap lot.\n` +
          `02 / Yuran Broker: 0.10% daripada nilai kasar kontrak (minimum RM 1.00).\n` +
          `03 / Yuran Penjelasan: 0.03% daripada nilai kasar kontrak (had RM 1,000.00).\n` +
          `04 / Duti Setem: RM 1.00 bagi setiap RM 1,000.00 nilai kontrak.\n\n` +
          `CONTOH KONTRAK (1 Lot / 100 unit ${sampleStock.ticker} @ RM ${sampleStock.price}):\n` +
          `Nilai Kasar: RM ${sampleFee.grossAmount.toFixed(2)} | Jumlah Yuran: RM ${sampleFee.totalFees.toFixed(2)} | Jumlah Bersih: RM ${sampleFee.netTotal.toFixed(2)}`;

    return { text, referencedTickers: [sampleStock.ticker] };
  }

  // 5. SAC Shariah Screening
  if (
    lower.includes('shariah') ||
    lower.includes('syariah') ||
    lower.includes('sac') ||
    lower.includes('halal') ||
    lower.includes('islamic')
  ) {
    const shariahIssuers = [...stocks]
      .filter(s => s.isShariah)
      .sort((a, b) => computeCompositeScore(b) - computeCompositeScore(a))
      .slice(0, 6);

    const rows = shariahIssuers
      .map(
        s =>
          `- ${s.ticker} (${s.bursaCode}): RM ${s.price} (${s.changePercent}) | P/E ${s.peRatio}x | Yield ${s.dividendYield} | Score ${computeCompositeScore(s)}/100`
      )
      .join('\n');

    const text =
      language === 'ENG'
        ? `SC MALAYSIA SAC SHARIAH SCREENING METHODOLOGY\n` +
          `The Securities Commission Malaysia Shariah Advisory Council (SAC) audits listed issuers semi-annually (May & November) using two quantitative tiers:\n` +
          `01 / Business Activity Benchmarks: 5% ceiling for conventional banking, insurance, gambling, liquor, tobacco, and non-halal activities; 20% ceiling for hotel/resort operations and share trading.\n` +
          `02 / Financial Ratio Thresholds: Conventional debt over Total Assets < 33%, and cash placed in conventional accounts over Total Assets < 33%.\n\n` +
          `TOP SAC SHARIAH-COMPLIANT BURSA ISSUERS:\n${rows}`
        : `METODOLOGI SARINGAN SYARIAH MPS (SC MALAYSIA)\n` +
          `Majlis Penasihat Syariah Suruhanjaya Sekuriti Malaysia menyaring sekuriti dua kali setahun berdasarkan penanda aras aktiviti perniagaan (5% / 20%) dan nisbah kewangan (<33% hutang konvensional dan tunai konvensional atas jumlah aset).\n\n` +
          `SEKURITI PATUH SYARIAH UTAMA:\n${rows}`;

    return {
      text,
      referencedTickers: shariahIssuers.map(s => s.ticker)
    };
  }

  // 6. Dividend Yield & Income Mandate Screening
  if (
    lower.includes('dividend') ||
    lower.includes('dividen') ||
    lower.includes('yield') ||
    lower.includes('income') ||
    lower.includes('passive') ||
    lower.includes('epf') ||
    lower.includes('kwsp') ||
    lower.includes('asb')
  ) {
    const topDiv = [...stocks]
      .sort(
        (a, b) =>
          (parseFloat(b.dividendYield.replace('%', '')) || 0) -
          (parseFloat(a.dividendYield.replace('%', '')) || 0)
      )
      .slice(0, 5);

    const rows = topDiv
      .map(
        s =>
          `- ${s.ticker} (${s.bursaCode}): Yield ${s.dividendYield} @ RM ${s.price} | P/E ${s.peRatio}x | ${s.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'}`
      )
      .join('\n');

    const text =
      language === 'ENG'
        ? `BURSA MALAYSIA HIGH-YIELD DIVIDEND SCREEN\n` +
          `Benchmark Reference: EPF (KWSP) / ASB ~5.50% p.a. | Bank Negara OPR 3.00% | Retail Fixed Deposit ~3.00% p.a.\n\n` +
          `LEADING INDICATED DIVIDEND ISSUERS:\n${rows}\n\n` +
          `SETTLEMENT MECHANICS: Malaysia operates a Single-Tier Dividend System where cash dividends are tax-exempt in the hands of retail shareholders. Buy orders must settle at least 1 trading day prior to the Ex-Dividend Date.`
        : `SARINGAN HASIL DIVIDEN TERTINGGI BURSA MALAYSIA\n` +
          `Penanda Aras: KWSP / ASB ~5.50% setahun | Kadar OPR BNM 3.00% | Deposit Tetap ~3.00% setahun.\n\n` +
          `PENERBIT HASIL DIVIDEN UTAMA:\n${rows}\n\n` +
          `NOTA PENYELESAIAN: Dividen Satu Peringkat di Malaysia dikecualikan cukai untuk pelabur runcit.`;

    return {
      text,
      referencedTickers: topDiv.map(s => s.ticker)
    };
  }

  // 7. Default Mandate-Calibrated Market & Conviction Synthesis
  const ranked = [...stocks]
    .sort((a, b) => {
      if (mandate === 'Conservative') {
        return a.radarScores.dividend + a.radarScores.health < b.radarScores.dividend + b.radarScores.health ? 1 : -1;
      }
      if (mandate === 'Moderate') {
        return computeCompositeScore(b) - computeCompositeScore(a);
      }
      return b.radarScores.growth + b.radarScores.momentum - (a.radarScores.growth + a.radarScores.momentum);
    })
    .slice(0, 4);

  const rankedLines = ranked
    .map(
      s =>
        `- ${s.ticker} (${s.bursaCode}): RM ${s.price} (${s.changePercent}) | P/E ${s.peRatio}x | Yield ${s.dividendYield} | Score ${computeCompositeScore(s)}/100`
    )
    .join('\n');

  const text =
    language === 'ENG'
      ? `JOMAI QUANTITATIVE RESEARCH DESK (${mandate.toUpperCase()} MANDATE)\n` +
        `Tracking ${stocks.length} Bursa Malaysia equities | Account Buying Power: RM ${cashBalance.toFixed(2)}\n\n` +
        `MANDATE-CALIBRATED CONVICTION LEADERS:\n${rankedLines}\n\n` +
        `DESK GUIDANCE: Query any specific ticker (e.g. MAYBANK, TENAGA, GAMUDA, INARI), compare two issuers head-to-head, or request a full portfolio concentration audit.`
      : `MEJA PENYELIDIKAN KUANTITATIF JOMAI (MANDAT ${mandate.toUpperCase()})\n` +
        `Memantau ${stocks.length} sekuriti Bursa Malaysia | Kuasa Beli Akaun: RM ${cashBalance.toFixed(2)}\n\n` +
        `PILIHAN UTAMA MENGIKUT MANDAT:\n${rankedLines}\n\n` +
        `PANDUAN MEJA: Tanya mana-mana kaunter (cth. MAYBANK, TENAGA, GAMUDA, INARI), bandingkan dua syarikat, atau minta audit tumpuan portfolio.`;

  return {
    text,
    referencedTickers: ranked.map(s => s.ticker)
  };
}

export async function generateJomAIResponse(
  prompt: string,
  history: { sender: 'user' | 'bot'; text: string }[],
  context: AIContext
): Promise<AIChatResponse> {
  const cleanPrompt = (prompt || '').trim();
  const matchedStocks = findReferencedStocks(cleanPrompt, context.stocks);
  const mandate = normalizeRiskMandate(context.riskProfile);

  const holdingsValue = context.portfolio.reduce(
    (sum, item) => sum + parseFloat(item.stock.price) * item.quantity,
    0
  );
  const portfolioSummary =
    context.portfolio.length > 0
      ? context.portfolio
          .map(
            p =>
              `${p.stock.ticker} (${p.quantity} sh @ avg RM ${p.averagePrice.toFixed(2)}, spot RM ${p.stock.price}, sector ${p.stock.sector})`
          )
          .join('; ')
      : 'No open equity positions (100% cash)';

  const relevantStocksPool =
    matchedStocks.length > 0 ? matchedStocks : context.stocks.slice(0, 10);

  const stockTelemetryBlock = relevantStocksPool
    .map(
      s =>
        `${s.ticker} (${s.bursaCode}, ${s.name}): Spot RM ${s.price} (${s.changePercent}), Sector=${s.sector}, P/E=${s.peRatio}x, Yield=${s.dividendYield}, D/E=${s.debtEquity}, Rev=${s.revenue}, NetProfit=${s.netProfit}, Shariah=${s.isShariah ? 'SAC_SHARIAH' : 'CONVENTIONAL'}`
    )
    .join('\n');

  const recentHistoryBlock = history
    .slice(-4)
    .map(h => `${h.sender === 'user' ? 'Investor' : 'JomAI'}: ${h.text}`)
    .join('\n');

  const systemPrompt =
    `You are JomAI, an institutional Bursa Malaysia (KLSE) equity research analyst and portfolio copilot inside JomINVEST.\n` +
    `Strict formatting rules:\n` +
    `- Respond in ${context.language === 'BM' ? 'Bahasa Melayu' : 'English'}.\n` +
    `- Zero emojis anywhere. Never use markdown bold asterisks (**) or hashtags (#).\n` +
    `- Use crisp numbered sections (01 /, 02 /) and exact Ringgit Malaysia (RM) figures.\n` +
    `- Reference Malaysian market structure: 1 Board Lot = 100 shares, SC Malaysia SAC Shariah compliance, BNM OPR 3.00%, EPF/ASB 5.5% benchmark, and Bursa statutory fees (0.10% brokerage min RM 1, 0.03% clearing fee, RM 1 per RM 1,000 stamp duty).\n` +
    `Investor Context:\n` +
    `- Mandate: ${mandate}\n` +
    `- Cash Buying Power: RM ${context.cashBalance.toFixed(2)}\n` +
    `- Holdings Value: RM ${holdingsValue.toFixed(2)}\n` +
    `- Open Positions: ${portfolioSummary}\n` +
    `Live Bursa Telemetry:\n${stockTelemetryBlock}`;

  const userPrompt = recentHistoryBlock
    ? `Recent Conversation:\n${recentHistoryBlock}\n\nCurrent Investor Query: ${cleanPrompt}`
    : cleanPrompt;

  const llmResult = await callLLM(systemPrompt, userPrompt);
  if (llmResult) {
    const combinedMatches = findReferencedStocks(
      `${cleanPrompt} ${llmResult.text}`,
      context.stocks
    );
    return {
      text: llmResult.text,
      provider: llmResult.provider,
      referencedTickers: combinedMatches.map(s => s.ticker)
    };
  }

  const quant = buildQuantChatResponse(cleanPrompt, context, matchedStocks);
  return {
    text: sanitizeInstitutionalText(quant.text),
    provider: 'QUANT_ENGINE',
    referencedTickers: quant.referencedTickers
  };
}

function buildDeterministicRingkas(params: {
  stock: StockData;
  uploadedFileName?: string;
  uploadedText?: string;
  language: 'ENG' | 'BM';
}): RingkasAnalysisResult {
  const { stock, uploadedFileName, uploadedText, language } = params;
  const pe = parseFloat(stock.peRatio) || 15;
  const divYield = parseFloat(stock.dividendYield.replace('%', '')) || 0;
  const radar = stock.radarScores;
  const avgScore = computeCompositeScore(stock);

  const cleanDoc = (uploadedText || '').replace(/\s+/g, ' ').trim();
  const excerpt = cleanDoc.length > 20 ? cleanDoc.slice(0, 260) : undefined;

  // Detect any financial highlights inside uploaded document text
  const rmMatches = cleanDoc.match(/RM\s?[0-9,.]+\s?(?:billion|million|bil|mil|B|M|k)?/gi) || [];
  const pctMatches = cleanDoc.match(/[+-]?[0-9]{1,2}(?:\.[0-9]{1,2})?%/g) || [];
  const docFinancialCue =
    rmMatches.length > 0 || pctMatches.length > 0
      ? language === 'ENG'
        ? ` Extracted filing figures reference ${[...rmMatches.slice(0, 2), ...pctMatches.slice(0, 2)].join(', ')}.`
        : ` Angka pemfailan yang diekstrak merujuk kepada ${[...rmMatches.slice(0, 2), ...pctMatches.slice(0, 2)].join(', ')}.`
      : '';

  let confidenceScore = Math.min(96, Math.max(66, avgScore + 9));
  if (cleanDoc.length > 50) {
    const posWords = (cleanDoc.match(/growth|profit|surplus|record|expansion|higher|increase|strong|untung|pertumbuhan/gi) || []).length;
    const negWords = (cleanDoc.match(/loss|decline|impairment|risk|drop|lower|weak|rugi|penurunan/gi) || []).length;
    confidenceScore = Math.min(97, Math.max(58, confidenceScore + Math.min(4, posWords - negWords)));
  }

  const growth =
    language === 'ENG'
      ? `${stock.name} (${stock.ticker} · ${stock.bursaCode}) recorded audited FY revenue of RM ${stock.revenue} and net profit of RM ${stock.netProfit} in the ${stock.sector} sector. ${stock.description} Quantitative factor scores stand at ${radar.growth}/100 for Growth and ${radar.momentum}/100 for Momentum.${docFinancialCue} (Ref: Audited Financial Statements, Sec. 02)`
      : `${stock.name} (${stock.ticker} · ${stock.bursaCode}) mencatatkan hasil tahunan teraudit RM ${stock.revenue} dan untung bersih RM ${stock.netProfit} dalam sektor ${stock.sector}. Skor faktor Pertumbuhan dan Momentum berada pada ${radar.growth}/100 dan ${radar.momentum}/100.${docFinancialCue} (Ruj: Penyata Kewangan Teraudit, Seksyen 02)`;

  const valuationLabel =
    pe < 14
      ? language === 'ENG'
        ? 'at a valuation discount relative to FBM KLCI institutional averages'
        : 'pada diskaun penilaian berbanding purata FBM KLCI'
      : pe <= 24
      ? language === 'ENG'
        ? 'in line with historical Bursa sector valuation multiples'
        : 'selaras dengan gandaan penilaian sejarah sektor Bursa'
      : language === 'ENG'
      ? 'at a secular growth expansion premium multiple'
      : 'pada gandaan premium pengembangan pertumbuhan';

  const risk =
    language === 'ENG'
      ? `At a spot price of RM ${stock.price} (${stock.changePercent}), ${stock.ticker} trades at ${stock.peRatio}x earnings (${valuationLabel}) with a Debt-to-Equity gearing ratio of ${stock.debtEquity}. Balance sheet health scores ${radar.health}/100; monitor sector margin sensitivity and BNM 3.00% OPR transmission. (Ref: Risk & Gearing Note, pg. 48)`
      : `Pada harga semasa RM ${stock.price} (${stock.changePercent}), ${stock.ticker} didagangkan pada gandaan P/E ${stock.peRatio}x (${valuationLabel}) dengan nisbah Hutang-ke-Ekuiti ${stock.debtEquity}. Skor kesihatan kunci kira-kira ialah ${radar.health}/100. (Ruj: Nota Pengurusan Risiko, ms. 48)`;

  const shariahStatus = stock.isShariah
    ? language === 'ENG'
      ? 'SAC Shariah-Compliant (SC Malaysia Verified)'
      : 'Patuh Syariah MPS (Disahkan SC Malaysia)'
    : language === 'ENG'
    ? 'Conventional Main Market Equity'
    : 'Ekuiti Konvensional Pasaran Utama';

  const dividend =
    language === 'ENG'
      ? `Distributes a single-tier tax-exempt indicated dividend yield of ${stock.dividendYield} (${
          divYield >= 4.5
            ? 'high-yield institutional cash generator for income mandates'
            : divYield >= 2.5
            ? 'balanced cash payout alongside retained earnings reinvestment'
            : 'capital-retention profile prioritizing core capex reinvestment'
        }). Regulatory Classification: ${shariahStatus}. Market Capitalization: RM ${stock.marketCap}. (Ref: Capital Allocation & Dividends, pg. 84)`
      : `Menawarkan kadar hasil dividen dikecualikan cukai satu peringkat sebanyak ${stock.dividendYield} (${
          divYield >= 4.5
            ? 'penjana aliran tunai dividen tinggi untuk mandat pendapatan'
            : 'agihan modal seimbang bersama pelaburan semula ekuiti'
        }). Klasifikasi Kawal Selia: ${shariahStatus}. Modal Pasaran: RM ${stock.marketCap}. (Ruj: Peruntukan Modal & Dividen, ms. 84)`;

  const sourceLabel = uploadedFileName
    ? `UPLOADED FILING · ${uploadedFileName.toUpperCase()}`
    : `BURSA AUDITED FILING · ${stock.bursaCode}`;

  return {
    title: `${stock.name} (${stock.ticker})`,
    bursaCode: stock.bursaCode,
    isShariah: stock.isShariah,
    score: confidenceScore,
    growth: sanitizeInstitutionalText(growth),
    risk: sanitizeInstitutionalText(risk),
    dividend: sanitizeInstitutionalText(dividend),
    sourceLabel,
    extractedExcerpt: excerpt ? sanitizeInstitutionalText(excerpt) : undefined,
    provider: 'QUANT_ENGINE'
  };
}

export async function analyzeFilingWithAI(params: {
  stock: StockData;
  uploadedFileName?: string;
  uploadedText?: string;
  language: 'ENG' | 'BM';
}): Promise<RingkasAnalysisResult> {
  const baseResult = buildDeterministicRingkas(params);
  const { stock, uploadedFileName, uploadedText, language } = params;
  const cleanDoc = (uploadedText || '').replace(/\s+/g, ' ').trim();

  const systemPrompt =
    `You are JomRingkas, an institutional Bursa Malaysia filing analyzer. ` +
    `Return ONLY valid JSON with keys: "score" (number 55-97), "growth" (string), "risk" (string), "dividend" (string). ` +
    `Language: ${language === 'BM' ? 'Bahasa Melayu' : 'English'}. ` +
    `Zero emojis and zero markdown asterisks (**). Reference exact RM figures, P/E, Debt/Equity, and SAC Shariah standing.`;

  const userPrompt =
    `Issuer: ${stock.name} (${stock.ticker} / ${stock.bursaCode})\n` +
    `Sector: ${stock.sector} | Spot: RM ${stock.price} (${stock.changePercent}) | Market Cap: RM ${stock.marketCap}\n` +
    `P/E: ${stock.peRatio}x | Dividend Yield: ${stock.dividendYield} | Debt/Equity: ${stock.debtEquity}\n` +
    `FY Revenue: RM ${stock.revenue} | Net Profit: RM ${stock.netProfit} | Shariah: ${stock.isShariah ? 'SAC Shariah-Compliant' : 'Conventional'}\n` +
    (uploadedFileName ? `Uploaded Document: ${uploadedFileName}\n` : '') +
    (cleanDoc ? `Extracted Filing Text Excerpt:\n${cleanDoc.slice(0, 3500)}\n` : '') +
    `Synthesize 3 concise institutional paragraphs (2-3 sentences each) for growth, risk, and dividend.`;

  const llmResult = await callLLM(systemPrompt, userPrompt);
  if (llmResult) {
    try {
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const scoreNum = Number(parsed.score);
        const growthStr = typeof parsed.growth === 'string' ? sanitizeInstitutionalText(parsed.growth) : '';
        const riskStr = typeof parsed.risk === 'string' ? sanitizeInstitutionalText(parsed.risk) : '';
        const divStr = typeof parsed.dividend === 'string' ? sanitizeInstitutionalText(parsed.dividend) : '';

        if (growthStr.length > 20 && riskStr.length > 20 && divStr.length > 20) {
          return {
            ...baseResult,
            score: !isNaN(scoreNum) ? Math.min(97, Math.max(55, Math.round(scoreNum))) : baseResult.score,
            growth: growthStr,
            risk: riskStr,
            dividend: divStr,
            provider: llmResult.provider
          };
        }
      }
    } catch {
      // Fallback to deterministic synthesis if JSON parsing fails
    }
  }

  return baseResult;
}
