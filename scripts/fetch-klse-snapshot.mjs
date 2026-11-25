// Fetches real 1-month daily closes and quotes from Yahoo Finance (.KL) for JomINVEST's 20 Bursa Malaysia stocks
import fs from 'node:fs';

const STOCK_METADATA = [
  { id: '1', ticker: 'MAYBANK', klseCode: '1155.KL', shariahCompliant: false, name: 'Malayan Banking Berhad', sector: 'Financial Services', peRatio: '11.45', dividendYield: '6.26%', marketCap: '111.7B', revenue: '26.4B', netProfit: '9.3B', debtEquity: 'N/A', description: 'Malayan Banking Berhad is a Malaysian universal bank, with key operating home markets of Malaysia, Singapore, and Indonesia.' },
  { id: '2', ticker: 'PBBANK', klseCode: '1295.KL', shariahCompliant: false, name: 'Public Bank Berhad', sector: 'Financial Services', peRatio: '12.80', dividendYield: '4.50%', marketCap: '82.3B', revenue: '20.1B', netProfit: '6.6B', debtEquity: 'N/A', description: 'Public Bank Berhad is a major banking group in Malaysia known for its prudent management and strong consumer banking franchise.' },
  { id: '3', ticker: 'TENAGA', klseCode: '5347.KL', shariahCompliant: true, name: 'Tenaga Nasional Berhad', sector: 'Utilities', peRatio: '18.23', dividendYield: '3.38%', marketCap: '78.5B', revenue: '53.1B', netProfit: '2.8B', debtEquity: '1.45', description: 'Tenaga Nasional Berhad is the largest electricity utility firm in Malaysia driving national renewable grid modernization.' },
  { id: '4', ticker: 'CIMB', klseCode: '1023.KL', shariahCompliant: false, name: 'CIMB Group Holdings', sector: 'Financial Services', peRatio: '10.95', dividendYield: '5.10%', marketCap: '79.8B', revenue: '19.8B', netProfit: '6.9B', debtEquity: 'N/A', description: "CIMB Group is a leading ASEAN universal bank and one of the region's foremost corporate advisors." },
  { id: '5', ticker: 'PCHEM', klseCode: '5183.KL', shariahCompliant: true, name: 'Petronas Chemicals Group', sector: 'Industrial Products', peRatio: '16.50', dividendYield: '2.80%', marketCap: '43.6B', revenue: '28.9B', netProfit: '1.2B', debtEquity: '0.15', description: 'Petronas Chemicals Group Berhad is the integrated chemicals arm of the Petronas Group and one of the largest chemical producers in Southeast Asia.' },
  { id: '6', ticker: 'IHH', klseCode: '5225.KL', shariahCompliant: true, name: 'IHH Healthcare Berhad', sector: 'Health Care', peRatio: '32.40', dividendYield: '1.20%', marketCap: '55.7B', revenue: '21.5B', netProfit: '2.9B', debtEquity: '0.62', description: 'IHH Healthcare is a leading international healthcare provider with a network of 80 hospitals in 10 countries.' },
  { id: '7', ticker: 'CDB', klseCode: '6947.KL', shariahCompliant: true, name: 'CelcomDigi Berhad', sector: 'Telecommunications', peRatio: '24.15', dividendYield: '3.90%', marketCap: '42.8B', revenue: '12.7B', netProfit: '1.6B', debtEquity: '1.20', description: "CelcomDigi is Malaysia's largest mobile network operator, formed by the merger of Celcom and Digi." },
  { id: '8', ticker: 'PMETAL', klseCode: '8869.KL', shariahCompliant: true, name: 'Press Metal Aluminium', sector: 'Industrial Products', peRatio: '28.50', dividendYield: '1.45%', marketCap: '42.0B', revenue: '14.5B', netProfit: '1.2B', debtEquity: '0.68', description: 'Press Metal is the largest integrated low-carbon aluminium producer in Southeast Asia.' },
  { id: '9', ticker: 'HLBANK', klseCode: '5819.KL', shariahCompliant: false, name: 'Hong Leong Bank', sector: 'Financial Services', peRatio: '10.50', dividendYield: '3.10%', marketCap: '42.1B', revenue: '5.6B', netProfit: '3.8B', debtEquity: 'N/A', description: 'Hong Leong Bank Berhad is a major public listed banking group in Malaysia.' },
  { id: '10', ticker: 'SIMEPLT', klseCode: '5285.KL', shariahCompliant: true, name: 'SD Guthrie (Sime Plantation)', sector: 'Plantation', peRatio: '14.20', dividendYield: '2.60%', marketCap: '31.2B', revenue: '18.4B', netProfit: '2.2B', debtEquity: '0.35', description: "SD Guthrie Berhad (formerly Sime Darby Plantation) is the world's largest producer of certified sustainable palm oil." },
  { id: '11', ticker: 'MAXIS', klseCode: '6012.KL', shariahCompliant: true, name: 'Maxis Berhad', sector: 'Telecommunications', peRatio: '22.80', dividendYield: '4.50%', marketCap: '27.8B', revenue: '10.2B', netProfit: '1.1B', debtEquity: '0.95', description: 'Maxis Berhad is a leading converged communications and digital services company in Malaysia.' },
  { id: '12', ticker: 'MISC', klseCode: '3816.KL', shariahCompliant: true, name: 'MISC Berhad', sector: 'Transportation', peRatio: '15.60', dividendYield: '4.05%', marketCap: '36.4B', revenue: '12.8B', netProfit: '2.1B', debtEquity: '0.28', description: 'MISC Berhad is a global energy-related maritime solutions and LNG shipping provider.' },
  { id: '13', ticker: 'NESTLE', klseCode: '4707.KL', shariahCompliant: true, name: 'Nestle (Malaysia)', sector: 'Consumer Products', peRatio: '45.20', dividendYield: '2.80%', marketCap: '27.8B', revenue: '6.5B', netProfit: '0.7B', debtEquity: '1.05', description: 'Nestle Malaysia is the largest Halal producer in the Nestle world and a leading household nutrition brand.' },
  { id: '14', ticker: 'RHBBANK', klseCode: '1066.KL', shariahCompliant: false, name: 'RHB Bank Berhad', sector: 'Financial Services', peRatio: '8.90', dividendYield: '6.40%', marketCap: '26.2B', revenue: '13.2B', netProfit: '2.9B', debtEquity: 'N/A', description: 'RHB Bank is the fourth largest fully integrated financial services group in Malaysia.' },
  { id: '15', ticker: 'IOICORP', klseCode: '1961.KL', shariahCompliant: true, name: 'IOI Corporation', sector: 'Plantation', peRatio: '20.10', dividendYield: '2.50%', marketCap: '25.0B', revenue: '11.5B', netProfit: '1.2B', debtEquity: '0.30', description: 'IOI Corporation is a leading global integrated and sustainable palm oil player.' },
  { id: '16', ticker: 'TOPGLOV', klseCode: '7113.KL', shariahCompliant: true, name: 'Top Glove Corporation', sector: 'Health Care', peRatio: '78.50', dividendYield: 'N/A', marketCap: '7.5B', revenue: '2.2B', netProfit: '-0.05B', debtEquity: '0.18', description: "Top Glove Corporation is one of the world's largest manufacturers of medical and nitrile gloves." },
  { id: '17', ticker: 'GAMUDA', klseCode: '5398.KL', shariahCompliant: true, name: 'Gamuda Berhad', sector: 'Construction', peRatio: '18.40', dividendYield: '1.50%', marketCap: '21.5B', revenue: '8.4B', netProfit: '1.2B', debtEquity: '0.45', description: 'Gamuda Berhad is a regional engineering, data-center infrastructure, and property group based in Malaysia.' },
  { id: '18', ticker: 'GENM', klseCode: '4715.KL', shariahCompliant: false, name: 'Genting Malaysia', sector: 'Consumer Services', peRatio: '14.80', dividendYield: '5.80%', marketCap: '14.5B', revenue: '10.2B', netProfit: '0.9B', debtEquity: '0.86', description: 'Genting Malaysia operates integrated leisure and hospitality resorts including Resorts World Genting.' },
  { id: '19', ticker: 'YTLPOWR', klseCode: '6742.KL', shariahCompliant: false, name: 'YTL Power International', sector: 'Utilities', peRatio: '12.50', dividendYield: '1.80%', marketCap: '39.8B', revenue: '21.8B', netProfit: '3.1B', debtEquity: '1.60', description: 'YTL Power operates power generation, water utilities, telecommunications, and AI data centers.' },
  { id: '20', ticker: 'SUNWAY', klseCode: '5211.KL', shariahCompliant: false, name: 'Sunway Berhad', sector: 'Industrial Products', peRatio: '20.60', dividendYield: '2.10%', marketCap: '20.5B', revenue: '6.1B', netProfit: '0.8B', debtEquity: '0.65', description: 'Sunway Berhad is a Malaysian conglomerate spanning townships, healthcare, construction, and hospitality.' },
];

function toMytDate(epochSec) {
  const d = new Date((epochSec + 8 * 3600) * 1000);
  return d.toISOString().slice(0, 10);
}

function formatVolume(vol) {
  if (!Number.isFinite(vol) || vol <= 0) return '1.5M';
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return String(vol);
}

async function fetchOne(meta) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${meta.klseCode}?range=1mo&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${meta.klseCode} HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No chart result for ${meta.klseCode}`);

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const volumes = result.indicators?.quote?.[0]?.volume || [];

  const history = [];
  for (let i = 0; i < timestamps.length; i++) {
    const c = closes[i];
    if (typeof c === 'number' && Number.isFinite(c)) {
      history.push({
        date: toMytDate(timestamps[i]),
        price: Number(c.toFixed(2)),
      });
    }
  }

  const latest = result.meta?.regularMarketPrice ?? history[history.length - 1]?.price ?? 1;
  const prevClose =
    history.length >= 2
      ? history[history.length - 2].price
      : result.meta?.chartPreviousClose ?? latest;

  const diff = latest - prevClose;
  const pct = prevClose > 0 ? (diff / prevClose) * 100 : 0;
  const isPositive = diff >= 0;
  const lastVol = volumes.filter((v) => typeof v === 'number' && v > 0).pop() || result.meta?.regularMarketVolume || 1500000;

  return {
    id: meta.id,
    name: meta.name,
    ticker: meta.ticker,
    klseCode: meta.klseCode,
    shariahCompliant: meta.shariahCompliant,
    price: Number(latest).toFixed(2),
    change: `${isPositive ? '+' : ''}${diff.toFixed(2)}`,
    changePercent: `${isPositive ? '+' : ''}${pct.toFixed(2)}%`,
    isPositive,
    description: meta.description,
    sector: meta.sector,
    peRatio: meta.peRatio,
    dividendYield: meta.dividendYield,
    marketCap: meta.marketCap,
    volume: formatVolume(lastVol),
    revenue: meta.revenue,
    netProfit: meta.netProfit,
    debtEquity: meta.debtEquity,
    sparkline: history.slice(-7).map((h) => h.price),
    history,
  };
}

const out = [];
for (const m of STOCK_METADATA) {
  const item = await fetchOne(m);
  out.push(item);
  console.log(`Fetched ${item.ticker} (${item.klseCode}): RM ${item.price} (${item.changePercent}), ${item.history.length} days`);
}

const snapshotDate = toMytDate(Math.floor(Date.now() / 1000));
const tsFile = `export interface StockData {
  id: string;
  name: string;
  ticker: string;
  klseCode: string;
  shariahCompliant: boolean;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  description: string;
  sector: string;
  peRatio: string;
  dividendYield: string;
  marketCap: string;
  volume: string;
  revenue: string;
  netProfit: string;
  debtEquity: string;
  sparkline: number[];
  history: { date: string; price: number }[];
}

export const SNAPSHOT_DATE_MYT = '${snapshotDate}';

export const stocks: StockData[] = ${JSON.stringify(out, null, 2)};
`;

fs.writeFileSync('src/data/stocks.ts', tsFile);
console.log('Wrote real KLSE snapshot to src/data/stocks.ts');
