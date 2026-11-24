import { useState, useEffect } from 'react';
import { Switch } from './ui/switch';
import {
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Sparkles,
  FileText,
  Zap,
  BarChart,
  Activity,
  Gauge,
  Loader2,
  Bot,
  Newspaper,
  MessageSquare,
  CheckCircle2,
  X,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';
import { lessons, type LessonItem } from '../data/lessons';
import { analyzeStockReport, type StockReportSummary } from '../services/aiService';

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  completedLessons: string[];
  onCompleteLesson: (lessonId: string, xpReward: number, title: string) => void;
}

export function EducationalHub({
  language,
  stocks,
  completedLessons,
  onCompleteLesson,
}: EducationalHubProps) {
  const [activeTab, setActiveTab] = useState<'ai-tools' | 'articles' | 'tutorials'>('ai-tools');

  // Wealth Projector State
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [riskLevel, setRiskLevel] = useState(5);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  // JomRingkas State (supports ALL 20 Bursa Malaysia stocks)
  const [selectedTicker, setSelectedTicker] = useState<string>('TENAGA');
  const [isScanning, setIsScanning] = useState(false);
  const [reportSummary, setReportSummary] = useState<StockReportSummary | null>(null);
  const [loadingText, setLoadingText] = useState('Analyzing...');

  // Interactive Lesson + Quiz Modal State
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const steps = ['Reading Bursa Filings...', 'Extracting Financials...', 'Evaluating Risks...', 'Finalizing...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(steps[i % steps.length]);
        i++;
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const texts = {
    ENG: {
      title: 'Learn & AI Lab',
      subtitle: 'Interactive AI tools for all 20 Bursa counters, bite-sized guides, and XP quizzes',
      articles: 'Articles & Quizzes',
      tutorials: 'Video Guides',
      aiTools: 'AI Lab Tools',
      readMore: 'Read & Take Quiz (+25 XP)',
      watchNow: 'Study & Take Quiz (+25 XP)',
      completed: 'Completed',
    },
    BM: {
      title: 'Makmal Ilmu & AI',
      subtitle: 'Alat AI interaktif untuk semua 20 kaunter Bursa, panduan ringkas, dan kuiz XP',
      articles: 'Artikel & Kuiz',
      tutorials: 'Panduan Video',
      aiTools: 'Alat Makmal AI',
      readMore: 'Baca & Jawab Kuiz (+25 XP)',
      watchNow: 'Belajar & Jawab Kuiz (+25 XP)',
      completed: 'Selesai',
    },
  };

  const t = texts[language];

  const generateWealthData = () => {
    const data = [];
    let currentWealth = 0;
    let totalInvested = 0;
    const years = 10;
    let annualReturn = 0.04 + riskLevel * 0.008;
    if (inflationAdjusted) annualReturn -= 0.03;

    for (let year = 0; year <= years; year++) {
      data.push({
        year: `Yr ${year}`,
        wealth: Math.round(currentWealth),
        invested: Math.round(totalInvested),
      });
      currentWealth = (currentWealth + monthlyInvest * 12) * (1 + annualReturn);
      totalInvested += monthlyInvest * 12;
    }
    return data;
  };

  const wealthData = generateWealthData();
  const finalWealth = wealthData[wealthData.length - 1].wealth;
  const finalInvested = wealthData[wealthData.length - 1].invested;

  const selectedStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];

  const handleAnalyze = async () => {
    if (!selectedStock) return;
    setIsScanning(true);
    setReportSummary(null);
    const [result] = await Promise.all([
      analyzeStockReport(selectedStock, language),
      new Promise((resolve) => setTimeout(resolve, 900)),
    ]);
    setReportSummary(result);
    setIsScanning(false);
  };

  const openLessonModal = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (!activeLesson) return;
    setQuizSubmitted(true);
    const allCorrect = activeLesson.quiz.every((q, idx) => quizAnswers[idx] === q.correctIndex);
    if (allCorrect && !completedLessons.includes(activeLesson.id)) {
      onCompleteLesson(
        activeLesson.id,
        activeLesson.xpReward,
        language === 'ENG' ? activeLesson.titleEng : activeLesson.titleBm
      );
    }
  };

  const articleLessons = lessons.filter((l) => l.type === 'article');
  const videoLessons = lessons.filter((l) => l.type === 'video');

  return (
    <div className="jomi-stack-lg">
      {/* Header Banner */}
      <div className="jomi-between">
        <div className="jomi-stack-xs">
          <h2 className="jomi-display jomi-title-xl">{t.title}</h2>
          <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.subtitle}</p>
        </div>

        <div className="jomi-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveTab('ai-tools')}
            className={`jomi-tab-btn ${activeTab === 'ai-tools' ? 'jomi-tab-btn-active' : ''}`}
          >
            <Sparkles size={15} color="#0d9488" />
            <span>{t.aiTools}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`jomi-tab-btn ${activeTab === 'articles' ? 'jomi-tab-btn-active' : ''}`}
          >
            <span>{t.articles}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tutorials')}
            className={`jomi-tab-btn ${activeTab === 'tutorials' ? 'jomi-tab-btn-active' : ''}`}
          >
            <span>{t.tutorials}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI LAB TOOLS */}
      {activeTab === 'ai-tools' && (
        <div className="jomi-stack-lg">
          {/* 1. JomRingkas — All 20 Bursa Malaysia Counters */}
          <section className="jomi-card jomi-card-pad">
            <div className="jomi-bento-main" style={{ alignItems: 'stretch' }}>
              <div className="jomi-card-soft jomi-stack-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="jomi-stack-xs">
                  <span className="jomi-pill-gain">
                    <FileText size={13} />
                    AI Fundamental Decoder
                  </span>
                  <h3 className="jomi-display jomi-title-lg" style={{ marginTop: '0.25rem' }}>JomRingkas</h3>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    Generate an instant student-friendly executive summary for any of the 20 Bursa Malaysia companies.
                  </p>
                </div>

                <div className="jomi-stack-md">
                  <div>
                    <label htmlFor="report-select" className="jomi-label">Select Bursa Malaysia Company</label>
                    <select
                      id="report-select"
                      value={selectedTicker}
                      onChange={(e) => {
                        setSelectedTicker(e.target.value);
                        setReportSummary(null);
                      }}
                      className="jomi-input"
                      style={{ cursor: 'pointer' }}
                    >
                      {stocks.map((st) => (
                        <option key={st.id} value={st.ticker}>
                          {st.ticker} ({st.klseCode.replace('.KL', '')}) — {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full"
                    onClick={() => void handleAnalyze()}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={18} />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Analyze {selectedTicker}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '280px' }}>
                {!reportSummary && !isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
                    <div className="jomi-ticker-badge jomi-ticker-badge-lg">
                      <Bot size={26} />
                    </div>
                    <h4 className="jomi-display jomi-title-md">Ready to Analyze {selectedTicker}</h4>
                    <p className="jomi-text-sm jomi-muted" style={{ maxWidth: '340px', fontWeight: 600 }}>
                      Pick any of the 20 Bursa counters on the left to decode revenue, valuation risk, dividend yield, and Shariah screening.
                    </p>
                  </div>
                )}

                {isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
                    <div className="jomi-pill-neutral" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <Loader2 size={16} />
                      <span>{loadingText}</span>
                    </div>
                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                      Analyzing {selectedStock?.name} ({selectedStock?.klseCode})...
                    </p>
                  </div>
                )}

                {reportSummary && (
                  <div className="jomi-stack-md">
                    <div className="jomi-between" style={{ paddingBottom: '0.75rem', borderBottom: '1.5px solid var(--jomi-border)' }}>
                      <div>
                        <div className="jomi-cluster" style={{ gap: '0.4rem' }}>
                          <span className="jomi-pill-gain">
                            {reportSummary.source === 'live-ai' ? 'Gemini AI Brief' : 'Fundamental Brief'}
                          </span>
                          {selectedStock?.shariahCompliant && (
                            <span className="jomi-pill-shariah">
                              <ShieldCheck size={11} />
                              Shariah
                            </span>
                          )}
                        </div>
                        <h4 className="jomi-display jomi-title-md" style={{ marginTop: '0.35rem' }}>
                          {reportSummary.title}
                        </h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>Quality Score</p>
                        <p className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857' }}>
                          {reportSummary.score} / 100
                        </p>
                      </div>
                    </div>

                    <div className="jomi-stack-sm">
                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <TrendingUp size={18} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>Growth &amp; Scale</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.growth}</p>
                          </div>
                        </div>
                      </div>

                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-coral-soft)', borderColor: 'var(--jomi-coral-border)' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <Activity size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c' }}>Valuation &amp; Key Risk</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.risk}</p>
                          </div>
                        </div>
                      </div>

                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-gold-soft)', borderColor: 'var(--jomi-gold-border)' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <Zap size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#92400e' }}>Dividend &amp; Screening</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                              {reportSummary.dividend} {reportSummary.shariahNote}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. JomSentimen Radar + Live News */}
          <section className="jomi-grid-2">
            <div className="jomi-card jomi-card-pad jomi-stack-md" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="jomi-between" style={{ width: '100%', textAlign: 'left' }}>
                <div className="jomi-cluster">
                  <div className="jomi-ticker-badge">
                    <Gauge size={18} />
                  </div>
                  <div>
                    <h3 className="jomi-display jomi-title-md">JomSentimen</h3>
                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>Bursa Market Breadth Radar</p>
                  </div>
                </div>
                <span className="jomi-pill-gain">
                  {stocks.filter((s) => s.isPositive).length}/{stocks.length} Advancers
                </span>
              </div>

              <div style={{ width: '240px', height: '125px', marginTop: '0.5rem' }}>
                <svg viewBox="0 0 200 105" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e6f4ef" strokeWidth="18" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 65 35" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
                  <path d="M 65 35 A 80 80 0 0 1 135 35" fill="none" stroke="#f59e0b" strokeWidth="18" />
                  <path d="M 135 35 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round" />
                  <g
                    style={{
                      transform: `rotate(${(Math.round((stocks.filter((s) => s.isPositive).length / stocks.length) * 100) / 100) * 180 - 90}deg)`,
                      transformOrigin: '100px 100px',
                    }}
                  >
                    <path d="M 100 100 L 100 24" stroke="#0f2926" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="6" fill="#0f2926" stroke="#ffffff" strokeWidth="2" />
                  </g>
                </svg>
              </div>

              <div className="jomi-between" style={{ width: '240px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span style={{ color: '#b91c1c' }}>Fear</span>
                <span style={{ color: '#b45309' }}>Neutral</span>
                <span style={{ color: '#047857' }}>Greed</span>
              </div>

              <div>
                <div className="jomi-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#047857' }}>
                  {stocks.filter((s) => s.isPositive).length >= 12 ? 'BULLISH' : 'BALANCED'}
                </div>
                <p className="jomi-text-sm jomi-muted jomi-nums" style={{ fontWeight: 700 }}>
                  Breadth Score: {Math.round((stocks.filter((s) => s.isPositive).length / stocks.length) * 100)} / 100
                </p>
              </div>
            </div>

            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <div className="jomi-between">
                <h3 className="jomi-display jomi-title-md">Live Headline Sentiment</h3>
                <span className="jomi-pill-loss">KLSE</span>
              </div>

              <div className="jomi-stack-sm">
                {[
                  {
                    source: 'The Edge',
                    time: '10m ago',
                    text: 'Johor AI data center & grid capex boosts YTLPOWR, TENAGA, and GAMUDA.',
                    sentiment: 'Positive',
                    pill: 'jomi-pill-gain',
                    icon: Newspaper,
                  },
                  {
                    source: 'Market Watch',
                    time: '32m ago',
                    text: 'Petrochemical & glove exporters face tight global pricing margins.',
                    sentiment: 'Cautious',
                    pill: 'jomi-pill-loss',
                    icon: MessageSquare,
                  },
                  {
                    source: 'StarBiz',
                    time: '1h ago',
                    text: 'Bank Negara steady OPR supports Malaysian bank dividend visibility.',
                    sentiment: 'Steady',
                    pill: 'jomi-pill-neutral',
                    icon: Newspaper,
                  },
                ].map((news, idx) => {
                  const Icon = news.icon;
                  return (
                    <div key={idx} className="jomi-row" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'default' }}>
                      <div className="jomi-between">
                        <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>
                          <Icon size={13} />
                          <span>{news.source} · {news.time}</span>
                        </span>
                        <span className={news.pill}>{news.sentiment}</span>
                      </div>
                      <p className="jomi-text-sm" style={{ fontWeight: 700 }}>&ldquo;{news.text}&rdquo;</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. AI Wealth Projector */}
          <section className="jomi-card jomi-card-pad jomi-stack-md">
            <div className="jomi-between">
              <div className="jomi-cluster">
                <div className="jomi-ticker-badge">
                  <BarChart size={19} />
                </div>
                <div>
                  <h3 className="jomi-display jomi-title-lg">AI Compound Wealth Projector</h3>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                    Simulate 10 years of consistent monthly investing in Malaysia
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>10-Year Projection</p>
                <p className="jomi-display jomi-nums" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#047857' }}>
                  RM {finalWealth.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="jomi-bento-main">
              <div className="jomi-stack-md">
                <div style={{ width: '100%', height: 290 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="jomiWealthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6f4ef" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#527972' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: '#527972' }}
                        axisLine={false}
                        tickLine={false}
                        width={54}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="jomi-chart-tooltip jomi-nums">
                              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginBottom: '2px' }}>{label}</div>
                              <div>Wealth: RM {Number(payload[0]?.value || 0).toLocaleString()}</div>
                              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                                Invested: RM {Number(payload[1]?.value || 0).toLocaleString()}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="wealth" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#jomiWealthGrad)" />
                      <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="jomi-grid-3">
                  <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.85rem 1rem' }}>
                    <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>PROJECTED WEALTH</span>
                    <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857' }}>
                      RM {finalWealth.toLocaleString()}
                    </span>
                  </div>
                  <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--jomi-canvas)', borderColor: 'var(--jomi-border)' }}>
                    <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>CASH INVESTED</span>
                    <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      RM {finalInvested.toLocaleString()}
                    </span>
                  </div>
                  <div className="jomi-card-gold jomi-stack-xs" style={{ padding: '0.85rem 1rem' }}>
                    <span className="jomi-text-xs" style={{ fontWeight: 800, color: 'var(--jomi-gold-ink)' }}>COMPOUND GAIN</span>
                    <span className="jomi-display jomi-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--jomi-gold-ink)' }}>
                      +RM {(finalWealth - finalInvested).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="jomi-card-soft jomi-stack-md">
                <div>
                  <div className="jomi-between" style={{ marginBottom: '0.4rem' }}>
                    <span className="jomi-text-sm" style={{ fontWeight: 800 }}>Monthly Contribution</span>
                    <span className="jomi-pill-gain jomi-nums">RM {monthlyInvest}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={monthlyInvest}
                    onChange={(e) => setMonthlyInvest(parseInt(e.target.value, 10))}
                    className="jomi-slider"
                  />
                </div>

                <div>
                  <div className="jomi-between" style={{ marginBottom: '0.4rem' }}>
                    <span className="jomi-text-sm" style={{ fontWeight: 800 }}>Risk Level</span>
                    <span className={`jomi-nums ${riskLevel > 7 ? 'jomi-pill-loss' : riskLevel > 4 ? 'jomi-pill-neutral' : 'jomi-pill-gain'}`}>
                      {riskLevel} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(parseInt(e.target.value, 10))}
                    className="jomi-slider"
                  />
                  <p className="jomi-text-xs jomi-muted" style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                    {riskLevel <= 3
                      ? 'Conservative: Sukuk / Blue-Chip Dividends (~4–6% p.a.)'
                      : riskLevel <= 7
                        ? 'Balanced: Diversified Bursa Equities (~6–9% p.a.)'
                        : 'Aggressive: Growth & Tech Counters (~9–12% p.a.)'}
                  </p>
                </div>

                <div
                  className="jomi-between"
                  style={{ paddingTop: '0.85rem', borderTop: '1.5px solid var(--jomi-emerald-border)' }}
                >
                  <div>
                    <p className="jomi-text-sm" style={{ fontWeight: 800 }}>Inflation Adjusted</p>
                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>Real purchasing power (-3% p.a.)</p>
                  </div>
                  <Switch checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ARTICLES & QUIZZES */}
      {activeTab === 'articles' && (
        <div className="jomi-grid-3">
          {articleLessons.map((lesson) => {
            const isDone = completedLessons.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="jomi-card jomi-card-interactive jomi-card-pad"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}
                onClick={() => openLessonModal(lesson)}
              >
                <div className="jomi-stack-sm">
                  <div className="jomi-between">
                    <span className={isDone ? 'jomi-pill-gain' : 'jomi-pill-neutral'}>
                      {isDone ? (
                        <>
                          <CheckCircle2 size={12} />
                          {t.completed}
                        </>
                      ) : (
                        `+${lesson.xpReward} XP`
                      )}
                    </span>
                    <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ gap: '0.25rem', fontWeight: 700 }}>
                      <Clock size={13} />
                      {lesson.duration}
                    </span>
                  </div>
                  <h3 className="jomi-display jomi-title-md">
                    {language === 'ENG' ? lesson.titleEng : lesson.titleBm}
                  </h3>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    {language === 'ENG' ? lesson.descEng : lesson.descBm}
                  </p>
                </div>

                <button type="button" className="jomi-btn jomi-btn-primary jomi-btn-sm jomi-btn-full">
                  <BookOpen size={15} />
                  <span>{t.readMore}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: INTERACTIVE VIDEO GUIDES & QUIZZES */}
      {activeTab === 'tutorials' && (
        <div className="jomi-grid-2">
          {videoLessons.map((lesson) => {
            const isDone = completedLessons.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="jomi-card jomi-card-interactive"
                style={{ overflow: 'hidden' }}
                onClick={() => openLessonModal(lesson)}
              >
                <div style={{ position: 'relative', height: '190px', backgroundColor: '#e6f4ef' }}>
                  {lesson.thumbnail && (
                    <ImageWithFallback
                      src={lesson.thumbnail}
                      alt="Lesson thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 41, 38, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ffffff',
                        color: '#047857',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 0 0 #047857',
                      }}
                    >
                      <Play size={22} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="jomi-card-pad jomi-stack-sm">
                  <div className="jomi-between">
                    <span className={isDone ? 'jomi-pill-gain' : 'jomi-pill-neutral'}>
                      {isDone ? t.completed : `${lesson.level} · +${lesson.xpReward} XP`}
                    </span>
                    <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{lesson.duration}</span>
                  </div>
                  <h3 className="jomi-display jomi-title-md">
                    {language === 'ENG' ? lesson.titleEng : lesson.titleBm}
                  </h3>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    {language === 'ENG' ? lesson.descEng : lesson.descBm}
                  </p>
                  <div style={{ paddingTop: '0.35rem' }}>
                    <button type="button" className="jomi-btn jomi-btn-primary jomi-btn-full">
                      <Play size={15} />
                      <span>{t.watchNow}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE STUDY & QUIZ MODAL */}
      {activeLesson && (
        <div className="jomi-dialog-backdrop" onClick={() => setActiveLesson(null)}>
          <div
            className="jomi-dialog-panel jomi-stack-md"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={language === 'ENG' ? activeLesson.titleEng : activeLesson.titleBm}
          >
            <div className="jomi-between">
              <div className="jomi-cluster">
                <span className="jomi-pill-gain">{activeLesson.category}</span>
                <span className="jomi-pill-neutral">+{activeLesson.xpReward} XP Quiz</span>
              </div>
              <button
                type="button"
                className="jomi-btn jomi-btn-ghost jomi-btn-icon"
                onClick={() => setActiveLesson(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="jomi-display jomi-title-lg">
              {language === 'ENG' ? activeLesson.titleEng : activeLesson.titleBm}
            </h3>

            {/* Study Notes */}
            <div className="jomi-card-soft jomi-stack-sm">
              {(language === 'ENG' ? activeLesson.bodyEng : activeLesson.bodyBm).map((para, idx) => (
                <p key={idx} className="jomi-text-sm" style={{ fontWeight: 600, lineHeight: 1.55 }}>
                  {para}
                </p>
              ))}
            </div>

            {/* 2-Question Comprehension Check */}
            <div className="jomi-stack-md">
              <h4 className="jomi-display jomi-title-md jomi-cluster">
                <Award size={18} color="#b45309" />
                <span>{language === 'ENG' ? 'Quick Knowledge Check' : 'Ujian Kefahaman Pantas'}</span>
              </h4>

              {activeLesson.quiz.map((q, qIdx) => {
                const opts = language === 'ENG' ? q.optionsEng : q.optionsBm;
                return (
                  <div key={qIdx} className="jomi-stack-xs">
                    <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      {qIdx + 1}. {language === 'ENG' ? q.questionEng : q.questionBm}
                    </p>
                    <div className="jomi-stack-xs">
                      {opts.map((opt, oIdx) => {
                        const chosen = quizAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let borderColor = chosen ? 'var(--jomi-emerald)' : 'var(--jomi-border)';
                        let bg = chosen ? 'var(--jomi-emerald-soft)' : '#ffffff';
                        if (quizSubmitted) {
                          if (isCorrect) {
                            borderColor = '#10b981';
                            bg = '#ecfdf5';
                          } else if (chosen && !isCorrect) {
                            borderColor = '#ef4444';
                            bg = '#fef2f2';
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.65rem 0.9rem',
                              borderRadius: '0.8rem',
                              border: `2px solid ${borderColor}`,
                              backgroundColor: bg,
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {quizSubmitted && (
                <div
                  className={
                    activeLesson.quiz.every((q, idx) => quizAnswers[idx] === q.correctIndex)
                      ? 'jomi-card-soft'
                      : 'jomi-card-gold'
                  }
                  style={{ padding: '0.8rem 1rem' }}
                >
                  <p style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                    {activeLesson.quiz.every((q, idx) => quizAnswers[idx] === q.correctIndex)
                      ? language === 'ENG'
                        ? 'Perfect score! Lesson completed.'
                        : 'Markah penuh! Pelajaran selesai.'
                      : language === 'ENG'
                        ? 'Almost there — review the highlighted green answers and try again!'
                        : 'Hampir berjaya — semak jawapan hijau dan cuba lagi!'}
                  </p>
                </div>
              )}

              <div className="jomi-between">
                <button type="button" className="jomi-btn jomi-btn-outline" onClick={() => setActiveLesson(null)}>
                  {language === 'ENG' ? 'Close' : 'Tutup'}
                </button>
                <button
                  type="button"
                  disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                  className="jomi-btn jomi-btn-primary"
                  onClick={handleQuizSubmit}
                >
                  {language === 'ENG' ? 'Submit Answers' : 'Hantar Jawapan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
