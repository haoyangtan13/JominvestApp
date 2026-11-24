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
  Link,
  Bot,
  Newspaper,
  MessageSquare,
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

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
}

const articles = [
  {
    titleEng: 'What is a Dividend?',
    titleBm: 'Apakah Dividen?',
    descEng: 'Learn how companies share profits with shareholders every quarter or year.',
    descBm: 'Pelajari bagaimana syarikat berkongsi keuntungan dengan pemegang saham.',
    readTime: '5 min',
    category: 'Basics',
  },
  {
    titleEng: 'Understanding Bursa Malaysia',
    titleBm: 'Memahami Bursa Malaysia',
    descEng: "A friendly starter guide to Malaysia's stock exchange, board lots, and trading hours.",
    descBm: 'Panduan permulaan mesra pelajar tentang bursa saham Malaysia.',
    readTime: '8 min',
    category: 'Market',
  },
  {
    titleEng: 'Risk vs. Return',
    titleBm: 'Risiko vs. Pulangan',
    descEng: 'How to balance growth potential and downside protection in your portfolio.',
    descBm: 'Cara mengimbangi potensi pertumbuhan dan perlindungan risiko.',
    readTime: '6 min',
    category: 'Strategy',
  },
];

const tutorials = [
  {
    titleEng: 'How to Read a Stock Chart',
    titleBm: 'Cara Membaca Carta Saham',
    descEng: 'Master support, trends, and volume without confusing jargon.',
    descBm: 'Kuasai asas membaca trend dan volum tanpa istilah mengelirukan.',
    duration: '12 min',
    level: 'Beginner',
  },
  {
    titleEng: 'What is Risk Management?',
    titleBm: 'Apakah Pengurusan Risiko?',
    descEng: 'Protect your student capital with smart position sizing and diversification.',
    descBm: 'Lindungi modal anda dengan kepelbagaian sektor yang bijak.',
    duration: '15 min',
    level: 'Beginner',
  },
];

export function EducationalHub({ language }: EducationalHubProps) {
  const [activeTab, setActiveTab] = useState<'ai-tools' | 'articles' | 'tutorials'>('ai-tools');

  // Wealth Projector State
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [riskLevel, setRiskLevel] = useState(5);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  // JomRingkas State
  const [selectedReport, setSelectedReport] = useState<'tenaga' | 'maybank'>('tenaga');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing...');

  useEffect(() => {
    if (isScanning) {
      const steps = ['Reading PDF...', 'Extracting Financials...', 'Summarizing Risks...', 'Finalizing...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(steps[i % steps.length]);
        i++;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const texts = {
    ENG: {
      title: 'Learn & AI Lab',
      subtitle: 'Interactive AI tools, bite-sized guides, and compound calculators built for student investors',
      articles: 'Articles',
      tutorials: 'Video Guides',
      aiTools: 'AI Lab Tools',
      readMore: 'Read Guide',
      watchNow: 'Watch Lesson',
    },
    BM: {
      title: 'Makmal Ilmu & AI',
      subtitle: 'Alat AI interaktif, panduan ringkas, dan kalkulator kompaun untuk pelabur pelajar',
      articles: 'Artikel',
      tutorials: 'Panduan Video',
      aiTools: 'Alat Makmal AI',
      readMore: 'Baca Panduan',
      watchNow: 'Tonton Pelajaran',
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

  const handleAnalyze = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2200);
  };

  const reportData = {
    tenaga: {
      title: 'Tenaga Nasional Annual Report 2025',
      growth: 'CEO commits RM 2B into Renewable Energy Grid upgrades, projected to lift long-term revenue by 15%. (pg. 12)',
      risk: 'Elevated fuel input prices could squeeze Q3 margins if pass-through adjustments lag. (pg. 45)',
      dividend: 'Steady payout track record: 30 sen/share declared for FY25 (~4.5% yield). (pg. 8)',
      score: 85,
    },
    maybank: {
      title: 'Maybank Integrated Report 2024',
      growth: "Digital banking adoption rose 40% YoY, with MAE app leading SME onboarding across ASEAN. (pg. 4)",
      risk: 'Regional interest-rate shifts may compress Net Interest Margin (NIM) by ~5 bps. (pg. 67)',
      dividend: 'Dividend aristocrat maintaining ~75% profit payout ratio (~6.2% yield). (pg. 102)',
      score: 92,
    },
  };

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
          {/* 1. JomRingkas Annual Report Scanner */}
          <section className="jomi-card jomi-card-pad">
            <div className="jomi-bento-main" style={{ alignItems: 'stretch' }}>
              {/* Left Controls */}
              <div className="jomi-card-soft jomi-stack-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="jomi-stack-xs">
                  <span className="jomi-pill-gain">
                    <FileText size={13} />
                    AI Report Decoder
                  </span>
                  <h3 className="jomi-display jomi-title-lg" style={{ marginTop: '0.25rem' }}>JomRingkas</h3>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    Turn 300-page Bursa Malaysia annual reports into 3 student-friendly takeaways in seconds.
                  </p>
                </div>

                <div className="jomi-stack-md">
                  <div>
                    <label htmlFor="report-select" className="jomi-label">Select Annual Report</label>
                    <select
                      id="report-select"
                      value={selectedReport}
                      onChange={(e) => {
                        setSelectedReport(e.target.value as 'tenaga' | 'maybank');
                        setScanComplete(false);
                      }}
                      className="jomi-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="tenaga">Tenaga Nasional Annual Report &apos;25</option>
                      <option value="maybank">Maybank Integrated Report &apos;24</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full"
                    onClick={handleAnalyze}
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
                        <span>Analyze Annual Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Output */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '280px' }}>
                {!scanComplete && !isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
                    <div className="jomi-ticker-badge jomi-ticker-badge-lg">
                      <Bot size={26} />
                    </div>
                    <h4 className="jomi-display jomi-title-md">Ready to Scan</h4>
                    <p className="jomi-text-sm jomi-muted" style={{ maxWidth: '320px', fontWeight: 600 }}>
                      Choose a Bursa company report on the left and click Analyze to extract growth, risks, and dividend highlights.
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
                      Scanning {reportData[selectedReport].title}...
                    </p>
                  </div>
                )}

                {scanComplete && (
                  <div className="jomi-stack-md">
                    <div className="jomi-between" style={{ paddingBottom: '0.75rem', borderBottom: '1.5px solid var(--jomi-border)' }}>
                      <div>
                        <span className="jomi-pill-gain">Summary Ready</span>
                        <h4 className="jomi-display jomi-title-md" style={{ marginTop: '0.35rem' }}>
                          {reportData[selectedReport].title}
                        </h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>AI Confidence</p>
                        <p className="jomi-display jomi-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857' }}>
                          {reportData[selectedReport].score}%
                        </p>
                      </div>
                    </div>

                    <div className="jomi-stack-sm">
                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <TrendingUp size={18} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>Growth Driver</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportData[selectedReport].growth}</p>
                          </div>
                        </div>
                      </div>

                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-coral-soft)', borderColor: 'var(--jomi-coral-border)' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <Activity size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c' }}>Key Risk</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportData[selectedReport].risk}</p>
                          </div>
                        </div>
                      </div>

                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-gold-soft)', borderColor: 'var(--jomi-gold-border)' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <Zap size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#92400e' }}>Dividend Verdict</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportData[selectedReport].dividend}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="jomi-cluster" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-sm">
                        <Link size={13} />
                        <span>Source PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. JomSentimen Radar + Live News */}
          <section className="jomi-grid-2">
            {/* Gauge Card */}
            <div className="jomi-card jomi-card-pad jomi-stack-md" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="jomi-between" style={{ width: '100%', textAlign: 'left' }}>
                <div className="jomi-cluster">
                  <div className="jomi-ticker-badge">
                    <Gauge size={18} />
                  </div>
                  <div>
                    <h3 className="jomi-display jomi-title-md">JomSentimen</h3>
                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>Bursa Market Emotion Radar</p>
                  </div>
                </div>
                <span className="jomi-pill-gain">Updated 5m ago</span>
              </div>

              <div style={{ width: '240px', height: '125px', marginTop: '0.5rem' }}>
                <svg viewBox="0 0 200 105" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e6f4ef" strokeWidth="18" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 65 35" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
                  <path d="M 65 35 A 80 80 0 0 1 135 35" fill="none" stroke="#f59e0b" strokeWidth="18" />
                  <path d="M 135 35 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round" />
                  <g
                    style={{
                      transform: `rotate(${(78 / 100) * 180 - 90}deg)`,
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
                <div className="jomi-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#047857' }}>GREED</div>
                <p className="jomi-text-sm jomi-muted jomi-nums" style={{ fontWeight: 700 }}>Score: 78 / 100</p>
              </div>
            </div>

            {/* Live Headlines */}
            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <div className="jomi-between">
                <h3 className="jomi-display jomi-title-md">Live Headline Sentiment</h3>
                <span className="jomi-pill-loss">LIVE</span>
              </div>

              <div className="jomi-stack-sm">
                {[
                  {
                    source: 'The Edge',
                    time: '10m ago',
                    text: 'Tech sector rally continues as major data center confirmed in Johor.',
                    sentiment: 'Positive',
                    pill: 'jomi-pill-gain',
                    icon: Newspaper,
                  },
                  {
                    source: 'X Trending',
                    time: '32m ago',
                    text: 'Palm oil futures dip below RM 3,800; plantation counters cautious.',
                    sentiment: 'Negative',
                    pill: 'jomi-pill-loss',
                    icon: MessageSquare,
                  },
                  {
                    source: 'StarBiz',
                    time: '1h ago',
                    text: 'Bank Negara holds OPR steady at 3.00%, supporting banking stability.',
                    sentiment: 'Neutral',
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
              {/* Chart + Summary Strip */}
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

              {/* Controls */}
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

      {/* TAB 2: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="jomi-grid-3">
          {articles.map((article, index) => (
            <div
              key={index}
              className="jomi-card jomi-card-interactive jomi-card-pad"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}
            >
              <div className="jomi-stack-sm">
                <div className="jomi-between">
                  <span className="jomi-pill-gain">{article.category}</span>
                  <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ gap: '0.25rem', fontWeight: 700 }}>
                    <Clock size={13} />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="jomi-display jomi-title-md">
                  {language === 'ENG' ? article.titleEng : article.titleBm}
                </h3>
                <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                  {language === 'ENG' ? article.descEng : article.descBm}
                </p>
              </div>

              <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-full">
                <BookOpen size={15} />
                <span>{t.readMore}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VIDEO TUTORIALS */}
      {activeTab === 'tutorials' && (
        <div className="jomi-grid-2">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="jomi-card jomi-card-interactive" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '190px', backgroundColor: '#e6f4ef' }}>
                <ImageWithFallback
                  src={
                    index % 2 === 0
                      ? 'https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                      : 'https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                  }
                  alt="Tutorial thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
                  <span className="jomi-pill-neutral">{tutorial.level}</span>
                  <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>{tutorial.duration}</span>
                </div>
                <h3 className="jomi-display jomi-title-md">
                  {language === 'ENG' ? tutorial.titleEng : tutorial.titleBm}
                </h3>
                <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                  {language === 'ENG' ? tutorial.descEng : tutorial.descBm}
                </p>
                <div style={{ paddingTop: '0.35rem' }}>
                  <button type="button" className="jomi-btn jomi-btn-primary jomi-btn-full">
                    <Play size={15} />
                    <span>{t.watchNow}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
