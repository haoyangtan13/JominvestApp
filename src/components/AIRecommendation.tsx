import { TrendingUp, TrendingDown, CheckCircle2, Sparkles, ArrowUpRight } from 'lucide-react';
import type { Screen } from '../App';
import { StockData, stocks } from '../data/stocks';
import { StockBadge } from './StockVisuals';

interface AIRecommendationProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  setSelectedStock?: (stock: StockData) => void;
  addToPortfolio?: (stock: StockData, quantity: number) => void;
}

export function AIRecommendation({
  navigateTo,
  userProfile,
  language,
  setSelectedStock,
  addToPortfolio,
}: AIRecommendationProps) {
  const featuredStock = stocks.find((s) => s.ticker === 'TENAGA') || stocks[0];

  const texts = {
    ENG: {
      title: 'JomINVEST AI Spotlight',
      subtitle: 'Personalized Bursa Malaysia stock idea matched to your investor persona',
      currentPrice: 'Current Price',
      change24h: '24h Change',
      aiAnalysis: 'Why JomINVEST AI Picked This Stock',
      reason1: 'Strong Fundamentals',
      reason1desc: 'Consistent revenue generation, national grid moat, and resilient operating margins.',
      reason2: 'Energy Transition Catalyst',
      reason2desc: 'Grid modernization & renewable capex driving multi-year institutional interest.',
      reason3: 'Fits Your Persona',
      reason3desc: `Aligned with your ${userProfile || 'Jom-Explorer (Aggressive)'} risk-reward profile.`,
      addToPortfolio: 'Quick Buy 1 Unit (+50 XP)',
      viewDetails: 'Open Full Stock Analysis',
      keyMetrics: 'Snapshot Metrics',
      pe: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
    },
    BM: {
      title: 'Sorotan AI JomINVEST',
      subtitle: 'Idea saham Bursa Malaysia yang dipadankan dengan persona pelabur anda',
      currentPrice: 'Harga Semasa',
      change24h: 'Perubahan 24j',
      aiAnalysis: 'Mengapa AI JomINVEST Memilih Saham Ini',
      reason1: 'Asas Kewangan Kukuh',
      reason1desc: 'Pendapatan konsisten dan margin keuntungan yang mampan.',
      reason2: 'Pemangkin Tenaga Boleh Diperbaharui',
      reason2desc: 'Pelaburan grid hijau menarik minat pelabur institusi.',
      reason3: 'Sepadan Dengan Persona Anda',
      reason3desc: `Sesuai dengan gaya pelaburan ${userProfile || 'Jom-Explorer (Agresif)'} anda.`,
      addToPortfolio: 'Beli Pantas 1 Unit (+50 XP)',
      viewDetails: 'Buka Analisis Saham Penuh',
      keyMetrics: 'Metrik Ringkas',
      pe: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
    },
  };

  const t = texts[language];

  const handleOpenDetails = () => {
    if (setSelectedStock) setSelectedStock(featuredStock);
    navigateTo('stock-details');
  };

  return (
    <div className="jomi-stack-lg">
      {/* Page Title */}
      <div className="jomi-stack-xs">
        <h2 className="jomi-display jomi-title-xl">{t.title}</h2>
        <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.subtitle}</p>
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
                {featuredStock.ticker} · Bursa Malaysia · {featuredStock.sector}
              </p>
            </div>
          </div>

          <span className="jomi-pill-neutral">
            <Sparkles size={13} />
            AI Top Pick
          </span>
        </div>

        <div className="jomi-grid-2" style={{ paddingTop: '0.5rem' }}>
          <div>
            <p className="jomi-hero-label">{t.currentPrice}</p>
            <p className="jomi-display jomi-nums" style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
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
        </div>
      </div>

      {/* 3 AI Reasons */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <h3 className="jomi-display jomi-title-lg jomi-cluster">
          <Sparkles size={20} color="#0d9488" />
          <span>{t.aiAnalysis}</span>
        </h3>

        <div className="jomi-grid-3">
          {[
            { title: t.reason1, desc: t.reason1desc },
            { title: t.reason2, desc: t.reason2desc },
            { title: t.reason3, desc: t.reason3desc },
          ].map((r, idx) => (
            <div key={idx} className="jomi-card-soft jomi-stack-xs">
              <div className="jomi-cluster" style={{ color: '#047857', fontWeight: 800 }}>
                <CheckCircle2 size={18} />
                <h4 className="jomi-display" style={{ fontSize: '1rem', fontWeight: 700 }}>{r.title}</h4>
              </div>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{r.desc}</p>
            </div>
          ))}
        </div>
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
