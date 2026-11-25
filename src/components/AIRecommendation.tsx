import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Newspaper,
} from 'lucide-react';
import type { Screen } from '../App';
import { StockData, stocks as baselineStocks } from '../data/stocks';
import { StockBadge } from './StockVisuals';
import {
  computeStockTechnicals,
  fetchSpotlightAnalysis,
  safeExternalHref,
  type SpotlightAnalysisResult,
} from '../services/aiService';

interface AIRecommendationProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  stocks?: StockData[];
  cashRM?: string;
  portfolioSummary?: string;
  setSelectedStock?: (stock: StockData) => void;
  addToPortfolio?: (stock: StockData, quantity: number) => void;
}

function rankStocksForPersona(catalog: StockData[], userProfile: string): StockData[] {
  const lower = (userProfile || '').toLowerCase();
  const isConservative = lower.includes('conservative') || lower.includes('guardian') || lower.includes('dividend');
  const isBalanced = lower.includes('balanced') || lower.includes('builder');

  const scored = catalog.map((s) => {
    const div = parseFloat(String(s.dividendYield).replace('%', '')) || 0;
    const pe = parseFloat(s.peRatio) || 20;
    const chg = parseFloat(String(s.changePercent).replace('%', '')) || 0;
    const ret30 = parseFloat(String(computeStockTechnicals(s).return30dPct).replace('%', '')) || 0;

    let score = 0;
    if (isConservative) {
      score = div * 4 + (pe > 0 && pe <= 16 ? 12 : 0) + (s.shariahCompliant ? 3 : 0);
    } else if (isBalanced) {
      score = div * 2.5 + ret30 * 1.2 + (pe > 0 && pe <= 22 ? 8 : 0) + (s.shariahCompliant ? 4 : 0);
    } else {
      // Aggressive / Jom-Explorer: 30D momentum + daily strength + reasonable scale
      score = ret30 * 2.2 + chg * 2 + div * 0.8 + (s.isPositive ? 4 : 0);
    }
    return { stock: s, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.stock);
}

export function AIRecommendation({
  navigateTo,
  userProfile,
  language,
  stocks = baselineStocks,
  cashRM = '10,000.00',
  portfolioSummary = '0 positions',
  setSelectedStock,
  addToPortfolio,
}: AIRecommendationProps) {
  const topCandidates = useMemo(
    () => rankStocksForPersona(stocks.length ? stocks : baselineStocks, userProfile),
    [stocks, userProfile]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const featuredStock = topCandidates[selectedIdx] || topCandidates[0] || baselineStocks[0];

  const [spotlight, setSpotlight] = useState<SpotlightAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSpotlight = useCallback(
    async (target: StockData) => {
      if (!target) return;
      setIsLoading(true);
      const res = await fetchSpotlightAnalysis({
        stock: target,
        userProfile,
        cashRM,
        portfolioSummary,
        language,
      });
      setSpotlight(res);
      setIsLoading(false);
    },
    [userProfile, cashRM, portfolioSummary, language]
  );

  useEffect(() => {
    void loadSpotlight(featuredStock);
  }, [featuredStock, loadSpotlight]);

  const technicals = useMemo(() => computeStockTechnicals(featuredStock), [featuredStock]);

  const texts = {
    ENG: {
      title: 'JomINVEST AI Spotlight',
      subtitle: 'Live persona-matched Bursa Malaysia case studies powered by JomAI & real news',
      currentPrice: 'Current Price',
      change24h: '24h Change',
      ret30d: '30D Return',
      aiAnalysis: 'Live AI Thesis & Catalysts',
      refresh: 'Refresh AI Thesis',
      catalystTitle: 'News & Sector Catalyst',
      watchpointTitle: 'Key Risk Watchpoint',
      recentNews: 'Related Bursa Headlines',
      addToPortfolio: 'Quick Buy 1 Unit (+50 XP)',
      viewDetails: 'Open Full Stock Analysis',
      keyMetrics: 'Snapshot Metrics',
      pe: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
      disclaimer: 'Educational case study matched to your sandbox persona — not licensed financial advice.',
    },
    BM: {
      title: 'Sorotan AI JomINVEST',
      subtitle: 'Kajian kes Bursa Malaysia mengikut persona anda dikuasakan oleh JomAI & berita langsung',
      currentPrice: 'Harga Semasa',
      change24h: 'Perubahan 24j',
      ret30d: 'Pulangan 30H',
      aiAnalysis: 'Tesis & Pemangkin AI Langsung',
      refresh: 'Segar Tesis AI',
      catalystTitle: 'Pemangkin Berita & Sektor',
      watchpointTitle: 'Risiko Utama Untuk Dipantau',
      recentNews: 'Tajuk Berita Bursa Berkaitan',
      addToPortfolio: 'Beli Pantas 1 Unit (+50 XP)',
      viewDetails: 'Buka Analisis Saham Penuh',
      keyMetrics: 'Metrik Ringkas',
      pe: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
      disclaimer: 'Kajian kes pendidikan mengikut persona simulasi anda — bukan nasihat kewangan berlesen.',
    },
  };

  const t = texts[language];

  const handleOpenDetails = () => {
    if (setSelectedStock) setSelectedStock(featuredStock);
    navigateTo('stock-details');
  };

  return (
    <div className="jomi-stack-lg">
      {/* Page Title + Top 3 Persona Match Switcher */}
      <div className="jomi-between">
        <div className="jomi-stack-xs">
          <h2 className="jomi-display jomi-title-xl">{t.title}</h2>
          <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.subtitle}</p>
        </div>

        <div className="jomi-tabs-bar">
          {topCandidates.map((cand, idx) => (
            <button
              key={cand.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`jomi-tab-btn ${selectedIdx === idx ? 'jomi-tab-btn-active' : ''}`}
            >
              #{idx + 1} {cand.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Stock Spotlight Card */}
      <div className="jomi-hero jomi-stack-md">
        <div className="jomi-between" style={{ alignItems: 'flex-start' }}>
          <div className="jomi-cluster" style={{ gap: '1rem' }}>
            <StockBadge ticker={featuredStock.ticker} sector={featuredStock.sector} size="lg" />
            <div>
              <h3 className="jomi-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {featuredStock.name}
              </h3>
              <p style={{ color: '#ccfbf1', fontSize: '0.85rem', fontWeight: 700 }}>
                {featuredStock.ticker} · {featuredStock.klseCode} · {featuredStock.sector}
              </p>
            </div>
          </div>

          <span className="jomi-pill-neutral">
            <Sparkles size={13} />
            {spotlight?.source === 'live-ai' ? 'Live AI Match' : 'Persona Match'}
          </span>
        </div>

        {spotlight?.headline && (
          <p style={{ color: '#ecfdf5', fontSize: '0.92rem', fontWeight: 700 }}>
            {spotlight.headline}
          </p>
        )}

        <div className="jomi-grid-3" style={{ paddingTop: '0.35rem' }}>
          <div>
            <p className="jomi-hero-label">{t.currentPrice}</p>
            <p className="jomi-display jomi-nums" style={{ fontSize: '2.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
              RM {featuredStock.price}
            </p>
          </div>
          <div>
            <p className="jomi-hero-label">{t.change24h}</p>
            <div style={{ marginTop: '0.45rem' }}>
              <span className={`jomi-nums ${featuredStock.isPositive ? 'jomi-pill-gain' : 'jomi-pill-loss'}`}>
                {featuredStock.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {featuredStock.changePercent}
              </span>
            </div>
          </div>
          <div>
            <p className="jomi-hero-label">{t.ret30d}</p>
            <div style={{ marginTop: '0.45rem' }}>
              <span className="jomi-pill-neutral jomi-nums">{technicals.return30dPct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live AI Thesis & 3 Reasons */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <div className="jomi-between">
          <h3 className="jomi-display jomi-title-lg jomi-cluster">
            <Sparkles size={20} color="#0d9488" />
            <span>{t.aiAnalysis}</span>
          </h3>
          <button
            type="button"
            className="jomi-btn jomi-btn-outline jomi-btn-sm"
            onClick={() => void loadSpotlight(featuredStock)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={14} /> : <RefreshCw size={14} />}
            <span>{t.refresh}</span>
          </button>
        </div>

        {isLoading && !spotlight ? (
          <div className="jomi-card-soft jomi-cluster" style={{ justifyContent: 'center', padding: '1.5rem' }}>
            <Loader2 size={18} />
            <span className="jomi-text-sm" style={{ fontWeight: 700 }}>
              {language === 'ENG' ? 'Analyzing live headlines & persona fit...' : 'Menganalisis berita langsung & kesesuaian persona...'}
            </span>
          </div>
        ) : spotlight ? (
          <div className="jomi-stack-md">
            <div className="jomi-grid-3">
              {spotlight.reasons.map((r, idx) => (
                <div key={idx} className="jomi-card-soft jomi-stack-xs">
                  <div className="jomi-cluster" style={{ color: '#047857', fontWeight: 800 }}>
                    <CheckCircle2 size={18} />
                    <h4 className="jomi-display" style={{ fontSize: '1rem', fontWeight: 700 }}>{r.title}</h4>
                  </div>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{r.detail}</p>
                </div>
              ))}
            </div>

            <div className="jomi-grid-2">
              <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="jomi-cluster jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>
                  <Newspaper size={14} />
                  {t.catalystTitle}
                </span>
                <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{spotlight.catalystNote}</p>
              </div>
              <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', flexDirection: 'column', gap: '0.35rem', backgroundColor: 'var(--jomi-coral-soft)', borderColor: 'var(--jomi-coral-border)' }}>
                <span className="jomi-cluster jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c' }}>
                  <AlertTriangle size={14} />
                  {t.watchpointTitle}
                </span>
                <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{spotlight.watchpoint}</p>
              </div>
            </div>

            {spotlight.headlines.length > 0 && (
              <div className="jomi-stack-xs">
                <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{t.recentNews}</p>
                <div className="jomi-grid-2">
                  {spotlight.headlines.map((h, i) => (
                    <a
                      key={i}
                      href={safeExternalHref(h.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="jomi-row"
                      style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}
                    >
                      <div className="jomi-stack-xs">
                        <p className="jomi-text-xs" style={{ fontWeight: 700 }}>{h.title}</p>
                        <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{h.source} · {h.timeAgo}</span>
                      </div>
                      <ExternalLink size={14} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{t.disclaimer}</p>
      </div>

      {/* Snapshot Metrics */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <h3 className="jomi-display jomi-title-md">{t.keyMetrics}</h3>
        <div className="jomi-grid-3">
          <div className="jomi-row" style={{ cursor: 'default' }}>
            <span className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>{t.pe}</span>
            <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{featuredStock.peRatio}</span>
          </div>
          <div className="jomi-row" style={{ cursor: 'default' }}>
            <span className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>{t.dividend}</span>
            <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857' }}>{featuredStock.dividendYield}</span>
          </div>
          <div className="jomi-row" style={{ cursor: 'default' }}>
            <span className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>{t.marketCap}</span>
            <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700 }}>RM {featuredStock.marketCap}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="jomi-cluster">
        {addToPortfolio && (
          <button
            type="button"
            className="jomi-btn jomi-btn-primary jomi-btn-lg"
            onClick={() => addToPortfolio(featuredStock, 1)}
          >
            <span>{t.addToPortfolio}</span>
          </button>
        )}
        <button
          type="button"
          className="jomi-btn jomi-btn-outline jomi-btn-lg"
          onClick={handleOpenDetails}
        >
          <span>{t.viewDetails}</span>
          <ArrowUpRight size={17} />
        </button>
      </div>
    </div>
  );
}
