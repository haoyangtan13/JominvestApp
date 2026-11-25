import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Sparkles,
  FileText,
  Zap,
  Activity,
  Gauge,
  Loader2,
  Bot,
  Newspaper,
  CheckCircle2,
  X,
  ShieldCheck,
  Award,
  RefreshCw,
  ExternalLink,
  GitCompare,
  Compass,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Lightbulb,
  ArrowRight,
  Check,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';
import { lessons, type LessonItem } from '../data/lessons';
import { glossaryFlashcards, type GlossaryCategory } from '../data/glossary';
import { WealthProjector } from './WealthProjector';
import {
  analyzeStockReport,
  compareStocksAI,
  fetchSentimentAnalysis,
  safeExternalHref,
  type StockReportSummary,
  type StockComparisonResult,
  type SentimentAnalysisResult,
} from '../services/aiService';

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  completedLessons: string[];
  onCompleteLesson: (lessonId: string, xpReward: number, title: string) => void;
  portfolioEquityRM?: number;
  setSelectedStock?: (stock: StockData) => void;
  learnedTerms?: string[];
  onLearnTerm?: (termKey: string, xpReward: number, label: string) => void;
}

export function EducationalHub({
  navigateTo,
  language,
  stocks,
  completedLessons,
  onCompleteLesson,
  portfolioEquityRM,
  setSelectedStock,
  learnedTerms = [],
  onLearnTerm,
}: EducationalHubProps) {
  const [activeTab, setActiveTab] = useState<'ai-tools' | 'articles' | 'tutorials' | 'glossary'>('ai-tools');

  // JomRingkas State (supports ALL 20 Bursa Malaysia stocks + 2-Stock Compare)
  const [ringkasMode, setRingkasMode] = useState<'brief' | 'compare'>('brief');
  const [selectedTicker, setSelectedTicker] = useState<string>('TENAGA');
  const [compareA, setCompareA] = useState<string>('TENAGA');
  const [compareB, setCompareB] = useState<string>('MAYBANK');
  const [isScanning, setIsScanning] = useState(false);
  const [reportSummary, setReportSummary] = useState<StockReportSummary | null>(null);
  const [comparisonResult, setComparisonResult] = useState<StockComparisonResult | null>(null);
  const [loadingText, setLoadingText] = useState('Analyzing...');

  // JomSentimen State (Live Malaysian RSS + AI)
  const [sentimentScope, setSentimentScope] = useState<string>('KLCI');
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisResult | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);

  // Interactive Lesson + Quiz Modal & Academy Filter State
  const [lessonCategory, setLessonCategory] = useState<string>('All');
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Interactive Glossary Flashcard State
  const [glossaryCategory, setGlossaryCategory] = useState<'All' | GlossaryCategory>('All');
  const [activeGlossaryIdx, setActiveGlossaryIdx] = useState(0);
  const [isGlossaryFlipped, setIsGlossaryFlipped] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const steps = ['Fetching Bursa News...', 'Reading Filings & Peers...', 'Synthesizing Thesis...', 'Finalizing...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(steps[i % steps.length]);
        i++;
      }, 450);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const loadSentiment = useCallback(
    async (scopeTicker: string) => {
      setIsLoadingSentiment(true);
      const focusStock = scopeTicker === 'KLCI' ? null : stocks.find((s) => s.ticker === scopeTicker) || null;
      const res = await fetchSentimentAnalysis({
        language,
        stocks,
        focusStock,
      });
      setSentimentData(res);
      setIsLoadingSentiment(false);
    },
    [language, stocks]
  );

  useEffect(() => {
    if (activeTab === 'ai-tools') {
      void loadSentiment(sentimentScope);
    }
  }, [activeTab, sentimentScope, loadSentiment]);

  const texts = {
    ENG: {
      title: 'Learn & AI Lab',
      subtitle: 'Interactive AI tools for all 20 Bursa counters, 12 Bursa lessons, and 15 flashcards',
      articles: 'Articles & Quizzes',
      tutorials: 'Video Guides',
      glossary: 'Glossary',
      aiTools: 'AI Lab Tools',
      readMore: 'Read & Take Quiz',
      watchNow: 'Start Guided Walkthrough',
      completed: 'Completed',
    },
    BM: {
      title: 'Makmal Ilmu & AI',
      subtitle: 'Alat AI untuk semua 20 kaunter Bursa, 12 pelajaran Bursa, dan 15 kad imbas',
      articles: 'Artikel & Kuiz',
      tutorials: 'Panduan Video',
      glossary: 'Glosari',
      aiTools: 'Alat Makmal AI',
      readMore: 'Baca & Jawab Kuiz',
      watchNow: 'Mula Panduan Interaktif',
      completed: 'Selesai',
    },
  };

  const t = texts[language];
  const isEng = language === 'ENG';

  const selectedStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];
  const stockA = stocks.find((s) => s.ticker === compareA) || stocks[0];
  const stockB = stocks.find((s) => s.ticker === compareB) || stocks[1] || stocks[0];

  const handleAnalyze = async () => {
    if (!selectedStock) return;
    setIsScanning(true);
    setReportSummary(null);
    const [result] = await Promise.all([
      analyzeStockReport(selectedStock, language, undefined, fetch, stocks),
      new Promise((resolve) => setTimeout(resolve, 650)),
    ]);
    setReportSummary(result);
    setIsScanning(false);
  };

  const handleCompare = async () => {
    if (!stockA || !stockB) return;
    setIsScanning(true);
    setComparisonResult(null);
    const [result] = await Promise.all([
      compareStocksAI(stockA, stockB, language),
      new Promise((resolve) => setTimeout(resolve, 650)),
    ]);
    setComparisonResult(result);
    setIsScanning(false);
  };

  const openLessonModal = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setActiveChapterIdx(0);
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

  const completedLessonsInCurriculum = lessons.filter((l) => completedLessons.includes(l.id));
  const completedCount = completedLessonsInCurriculum.length;
  const totalLessonXP = lessons.reduce((sum, l) => sum + l.xpReward, 0);
  const earnedLessonXP = completedLessonsInCurriculum.reduce((sum, l) => sum + l.xpReward, 0);
  const masteryPct = Math.round((completedCount / Math.max(1, lessons.length)) * 100);
  const masteredTermsCount = glossaryFlashcards.filter((c) => learnedTerms.includes(c.termEng)).length;

  const academyRank =
    completedCount >= 10
      ? isEng
        ? 'Jom Master'
        : 'Master Jom'
      : completedCount >= 6
        ? isEng
          ? 'Market Analyst'
          : 'Penganalisis Pasaran'
        : completedCount >= 3
          ? isEng
            ? 'Bursa Explorer'
            : 'Penjelajah Bursa'
          : isEng
            ? 'Freshman'
            : 'Pelajar Baru';

  const currentTabLessons = activeTab === 'tutorials' ? videoLessons : articleLessons;
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(currentTabLessons.map((l) => l.category)));
    return ['All', ...cats];
  }, [currentTabLessons]);

  const filteredLessons = useMemo(() => {
    return currentTabLessons.filter((lesson) => {
      if (lessonCategory !== 'All' && lesson.category !== lessonCategory) return false;
      if (incompleteOnly && completedLessons.includes(lesson.id)) return false;
      return true;
    });
  }, [currentTabLessons, lessonCategory, incompleteOnly, completedLessons]);

  const filteredGlossary = useMemo(() => {
    if (glossaryCategory === 'All') return glossaryFlashcards;
    return glossaryFlashcards.filter((card) => card.category === glossaryCategory);
  }, [glossaryCategory]);

  const safeGlossaryIdx =
    filteredGlossary.length > 0 ? Math.min(activeGlossaryIdx, filteredGlossary.length - 1) : 0;
  const activeCard = filteredGlossary[safeGlossaryIdx] || glossaryFlashcards[0];

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
            onClick={() => {
              setActiveTab('articles');
              setLessonCategory('All');
            }}
            className={`jomi-tab-btn ${activeTab === 'articles' ? 'jomi-tab-btn-active' : ''}`}
          >
            <span>{t.articles} ({articleLessons.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('tutorials');
              setLessonCategory('All');
            }}
            className={`jomi-tab-btn ${activeTab === 'tutorials' ? 'jomi-tab-btn-active' : ''}`}
          >
            <span>{t.tutorials} ({videoLessons.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`jomi-tab-btn ${activeTab === 'glossary' ? 'jomi-tab-btn-active' : ''}`}
          >
            <Layers size={14} />
            <span>{t.glossary} ({glossaryFlashcards.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI LAB TOOLS */}
      {activeTab === 'ai-tools' && (
        <div className="jomi-stack-lg">
          {/* 1. JomRingkas — Deep-Dive Brief + 2-Stock Comparator */}
          <section className="jomi-card jomi-card-pad jomi-stack-md">
            <div className="jomi-between">
              <div className="jomi-cluster">
                <span className="jomi-pill-gain">
                  <FileText size={13} />
                  {language === 'ENG' ? 'AI Fundamental & News Decoder' : 'Penyahkod Asas & Berita AI'}
                </span>
                <h3 className="jomi-display jomi-title-lg">JomRingkas</h3>
              </div>

              <div className="jomi-tabs-bar">
                <button
                  type="button"
                  onClick={() => setRingkasMode('brief')}
                  className={`jomi-tab-btn ${ringkasMode === 'brief' ? 'jomi-tab-btn-active' : ''}`}
                >
                  <FileText size={14} />
                  <span>{language === 'ENG' ? 'Deep-Dive Brief' : 'Ringkasan Mendalam'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRingkasMode('compare')}
                  className={`jomi-tab-btn ${ringkasMode === 'compare' ? 'jomi-tab-btn-active' : ''}`}
                >
                  <GitCompare size={14} />
                  <span>{language === 'ENG' ? 'Compare 2 Stocks' : 'Banding 2 Saham'}</span>
                </button>
              </div>
            </div>

            {ringkasMode === 'brief' ? (
              <div className="jomi-stack-md">
                {/* Compact Top Selector Bar */}
                <div className="jomi-card-soft jomi-stack-sm">
                  <div className="jomi-stack-xs">
                    <h4 className="jomi-display jomi-title-md">
                      {language === 'ENG' ? 'News-Grounded Equity Brief' : 'Ringkasan Ekuiti Berasaskan Berita'}
                    </h4>
                    <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                      {language === 'ENG'
                        ? 'Synthesizes 30-day technicals, Bursa sector peers, fundamentals, and live Malaysian headlines.'
                        : 'Menggabungkan teknikal 30 hari, rakan sektor Bursa, asas kewangan, dan berita terkini Malaysia.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'end' }}>
                    <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                      <label htmlFor="report-select" className="jomi-label">
                        {language === 'ENG' ? 'Select Bursa Malaysia Company' : 'Pilih Syarikat Bursa Malaysia'}
                      </label>
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
                      className="jomi-btn jomi-btn-primary jomi-btn-lg"
                      style={{ flexShrink: 0 }}
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
                          <span>{language === 'ENG' ? `Analyze ${selectedTicker}` : `Analisis ${selectedTicker}`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Full-Width Report Output */}
                {!reportSummary && !isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '160px', padding: '1.5rem 1rem' }}>
                    <div className="jomi-ticker-badge jomi-ticker-badge-lg">
                      <Bot size={26} />
                    </div>
                    <h4 className="jomi-display jomi-title-md">
                      {language === 'ENG' ? `Ready to Analyze ${selectedTicker}` : `Sedia Menganalisis ${selectedTicker}`}
                    </h4>
                    <p className="jomi-text-sm jomi-muted" style={{ maxWidth: '460px', fontWeight: 600 }}>
                      {language === 'ENG'
                        ? 'Run a live AI research brief covering 30D momentum, peer comparison, news catalysts, and Shariah status.'
                        : 'Jalankan ringkasan penyelidikan AI merangkumi momentum 30H, perbandingan rakan sektor, pemangkin berita, dan status Syariah.'}
                    </p>
                  </div>
                )}

                {isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '160px', padding: '1.5rem 1rem' }}>
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
                            {reportSummary.source === 'live-ai' ? 'Live AI + News' : 'Local Brief'}
                          </span>
                          {selectedStock?.shariahCompliant && (
                            <span className="jomi-pill-shariah">
                              <ShieldCheck size={11} />
                              Shariah
                            </span>
                          )}
                          {reportSummary.technicals && (
                            <span className="jomi-pill-neutral jomi-nums">
                              30D: {reportSummary.technicals.return30dPct}
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

                    <div
                      className="jomi-grid-2"
                      style={{
                        alignItems: 'stretch',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
                      }}
                    >
                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <TrendingUp size={18} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>Growth &amp; 30D Momentum</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.growth}</p>
                          </div>
                        </div>
                      </div>

                      {reportSummary.newsCatalysts && (
                        <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', flexDirection: 'column', gap: '0.45rem' }}>
                          <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                            <Newspaper size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>Live News &amp; Catalysts</p>
                              <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.newsCatalysts}</p>
                            </div>
                          </div>
                          {reportSummary.headlines && reportSummary.headlines.length > 0 && (
                            <div className="jomi-stack-xs" style={{ width: '100%', paddingLeft: '1.75rem' }}>
                              {reportSummary.headlines.slice(0, 3).map((h, i) => (
                                <a
                                  key={i}
                                  href={safeExternalHref(h.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="jomi-cluster jomi-text-xs"
                                  style={{ color: '#0f766e', fontWeight: 700, textDecoration: 'none', justifyContent: 'space-between' }}
                                >
                                  <span>{h.title} ({h.source} · {h.timeAgo})</span>
                                  <ExternalLink size={12} style={{ flexShrink: 0 }} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {reportSummary.peerComparison && (
                        <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                          <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                            <Compass size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>Sector Peer Comparison</p>
                              <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.peerComparison}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-coral-soft)', borderColor: 'var(--jomi-coral-border)' }}>
                        <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                          <Activity size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c' }}>Valuation &amp; Key Risk</p>
                            <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{reportSummary.risk}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="jomi-row" style={{ cursor: 'default', alignItems: 'flex-start', backgroundColor: 'var(--jomi-gold-soft)', borderColor: 'var(--jomi-gold-border)' }}>
                      <div className="jomi-cluster" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                        <Zap size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#92400e' }}>Dividend &amp; Student Takeaway</p>
                          <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                            {reportSummary.dividend} {reportSummary.shariahNote}
                          </p>
                          {reportSummary.studentTakeaway && (
                            <p className="jomi-text-xs" style={{ fontWeight: 700, color: '#92400e', marginTop: '0.35rem' }}>
                              Next Watch: {reportSummary.studentTakeaway}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                      {language === 'ENG'
                        ? 'Educational summary grounded in live metrics & RSS news — not a buy/sell recommendation.'
                        : 'Ringkasan pendidikan berdasarkan metrik & berita langsung — bukan cadangan beli/jual.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="jomi-stack-md">
                {/* Compact Top Comparison Controls */}
                <div className="jomi-card-soft jomi-stack-sm">
                  <div className="jomi-stack-xs">
                    <h4 className="jomi-display jomi-title-md">
                      {language === 'ENG' ? 'Head-to-Head Stock Comparator' : 'Perbandingan Saham Berdepan'}
                    </h4>
                    <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                      {language === 'ENG'
                        ? 'Compare any two Bursa Malaysia counters side by side across valuation, dividends, 30D trend, and live news.'
                        : 'Bandingkan dua kaunter Bursa Malaysia dari segi penilaian, dividen, trend 30H, dan berita langsung.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label htmlFor="compare-a" className="jomi-label">Stock A</label>
                      <select
                        id="compare-a"
                        value={compareA}
                        onChange={(e) => {
                          setCompareA(e.target.value);
                          setComparisonResult(null);
                        }}
                        className="jomi-input"
                      >
                        {stocks.map((st) => (
                          <option key={st.id} value={st.ticker}>{st.ticker} — {st.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="compare-b" className="jomi-label">Stock B</label>
                      <select
                        id="compare-b"
                        value={compareB}
                        onChange={(e) => {
                          setCompareB(e.target.value);
                          setComparisonResult(null);
                        }}
                        className="jomi-input"
                      >
                        {stocks.map((st) => (
                          <option key={st.id} value={st.ticker}>{st.ticker} — {st.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full"
                      onClick={() => void handleCompare()}
                      disabled={isScanning || compareA === compareB}
                    >
                      {isScanning ? <Loader2 size={18} /> : <GitCompare size={18} />}
                      <span>{compareA === compareB ? 'Pick 2 Different Stocks' : `Compare ${compareA} vs ${compareB}`}</span>
                    </button>
                  </div>
                </div>

                {/* Full-Width Comparison Output */}
                {!comparisonResult && !isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '160px', padding: '1.5rem 1rem' }}>
                    <div className="jomi-ticker-badge jomi-ticker-badge-lg">
                      <GitCompare size={24} />
                    </div>
                    <h4 className="jomi-display jomi-title-md">Compare {compareA} vs {compareB}</h4>
                    <p className="jomi-text-sm jomi-muted" style={{ maxWidth: '460px', fontWeight: 600 }}>
                      {language === 'ENG'
                        ? 'See which stock leads on P/E value, dividend yield, 30-day momentum, and news flow.'
                        : 'Lihat saham mana lebih unggul dalam nilai P/E, hasil dividen, momentum 30 hari, dan berita.'}
                    </p>
                  </div>
                )}

                {isScanning && (
                  <div className="jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '160px', padding: '1.5rem 1rem' }}>
                    <div className="jomi-pill-neutral" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <Loader2 size={16} />
                      <span>{loadingText}</span>
                    </div>
                  </div>
                )}

                {comparisonResult && (
                  <div className="jomi-stack-md">
                    <div className="jomi-between" style={{ paddingBottom: '0.65rem', borderBottom: '1.5px solid var(--jomi-border)' }}>
                      <div>
                        <span className="jomi-pill-gain">
                          {comparisonResult.source === 'live-ai' ? 'Live AI Compare' : 'Local Compare'}
                        </span>
                        <h4 className="jomi-display jomi-title-md" style={{ marginTop: '0.35rem' }}>
                          {comparisonResult.headline}
                        </h4>
                      </div>
                      <div className="jomi-cluster jomi-nums">
                        <span className="jomi-pill-neutral">{compareA}: {comparisonResult.scoreA}/100</span>
                        <span className="jomi-pill-neutral">{compareB}: {comparisonResult.scoreB}/100</span>
                      </div>
                    </div>

                    <div
                      className="jomi-grid-2"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
                      }}
                    >
                      <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <span className="jomi-text-xs" style={{ fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Valuation Edge</span>
                        <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{comparisonResult.valuationEdge}</p>
                      </div>
                      <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <span className="jomi-text-xs" style={{ fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>Dividend &amp; Income</span>
                        <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{comparisonResult.incomeComparison}</p>
                      </div>
                      <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <span className="jomi-text-xs" style={{ fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>Momentum &amp; Live News</span>
                        <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{comparisonResult.momentumAndNews}</p>
                      </div>
                      <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', backgroundColor: 'var(--jomi-coral-soft)', borderColor: 'var(--jomi-coral-border)' }}>
                        <span className="jomi-text-xs" style={{ fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>Risk &amp; Shariah</span>
                        <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{comparisonResult.riskComparison}</p>
                      </div>
                    </div>

                    <div className="jomi-card-gold" style={{ padding: '0.85rem 1rem' }}>
                      <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--jomi-gold-ink)' }}>
                        Student Learning Takeaway
                      </p>
                      <p className="jomi-text-sm" style={{ fontWeight: 700, marginTop: '0.2rem' }}>{comparisonResult.studentVerdict}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 2. JomSentimen AI News & Market Radar */}
          <section className="jomi-grid-2" style={{ alignItems: 'start' }}>
            {(() => {
              const breadthScore = Math.round((stocks.filter((s) => s.isPositive).length / Math.max(1, stocks.length)) * 100);
              const displayScore = sentimentData?.score ?? breadthScore;
              const needleDeg = (Math.max(0, Math.min(100, displayScore)) / 100) * 180 - 90;
              return (
                <div className="jomi-card jomi-card-pad jomi-stack-md" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <div className="jomi-between" style={{ width: '100%', textAlign: 'left' }}>
                    <div className="jomi-cluster">
                      <div className="jomi-ticker-badge">
                        <Gauge size={18} />
                      </div>
                      <div>
                        <h3 className="jomi-display jomi-title-md">JomSentimen</h3>
                        <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                          {language === 'ENG' ? 'Live Malaysian News & Breadth AI' : 'AI Berita Malaysia & Keluasan Pasaran'}
                        </p>
                      </div>
                    </div>
                    <span className="jomi-pill-gain">
                      {sentimentData?.source === 'live-ai'
                        ? 'Live AI + News'
                        : sentimentData?.source === 'live-rss'
                          ? 'Live RSS'
                          : 'Snapshot'}
                    </span>
                  </div>

                  {/* Scope Selector + Refresh */}
                  <div style={{ width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      aria-label="Sentiment Scope"
                      value={sentimentScope}
                      onChange={(e) => setSentimentScope(e.target.value)}
                      className="jomi-input"
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <option value="KLCI">All Bursa Malaysia (FBM KLCI)</option>
                      {stocks.map((st) => (
                        <option key={st.id} value={st.ticker}>{st.ticker} — {st.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="jomi-btn jomi-btn-outline jomi-btn-sm"
                      onClick={() => void loadSentiment(sentimentScope)}
                      disabled={isLoadingSentiment}
                      aria-label="Refresh Sentiment"
                    >
                      {isLoadingSentiment ? <Loader2 size={14} /> : <RefreshCw size={14} />}
                    </button>
                  </div>

                  <div style={{ width: '240px', height: '125px', marginTop: '0.25rem' }}>
                    <svg viewBox="0 0 200 105" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e6f4ef" strokeWidth="18" strokeLinecap="round" />
                      <path d="M 20 100 A 80 80 0 0 1 65 35" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
                      <path d="M 65 35 A 80 80 0 0 1 135 35" fill="none" stroke="#f59e0b" strokeWidth="18" />
                      <path d="M 135 35 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round" />
                      <g
                        style={{
                          transform: `rotate(${needleDeg}deg)`,
                          transformOrigin: '100px 100px',
                          transition: 'transform 350ms ease',
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
                    <span style={{ color: '#047857' }}>Bullish</span>
                  </div>

                  <div>
                    <div className="jomi-display" style={{ fontSize: '1.85rem', fontWeight: 700, color: displayScore >= 56 ? '#047857' : displayScore >= 42 ? '#b45309' : '#b91c1c' }}>
                      {(sentimentData?.label || (breadthScore >= 60 ? 'BULLISH' : 'BALANCED')).toUpperCase()}
                    </div>
                    <p className="jomi-text-sm jomi-muted jomi-nums" style={{ fontWeight: 700 }}>
                      AI Sentiment Score: {displayScore} / 100 ({stocks.filter((s) => s.isPositive).length}/{stocks.length} Advancers)
                    </p>
                  </div>

                  {sentimentData?.summary && (
                    <div className="jomi-card-soft jomi-stack-xs" style={{ width: '100%', textAlign: 'left' }}>
                      <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
                        AI Market Pulse ({sentimentScope})
                      </p>
                      <p className="jomi-text-sm" style={{ fontWeight: 600 }}>{sentimentData.summary}</p>
                      {sentimentData.keyDrivers.length > 0 && (
                        <div className="jomi-stack-xs" style={{ paddingTop: '0.25rem' }}>
                          {sentimentData.keyDrivers.map((drv, i) => (
                            <p key={i} className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                              - {drv}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="jomi-card jomi-card-pad jomi-stack-md">
              <div className="jomi-between">
                <div>
                  <h3 className="jomi-display jomi-title-md">Live Headline Sentiment</h3>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                    {isEng
                      ? `Real Malaysian headlines analyzed by JomAI (${sentimentScope})`
                      : `Tajuk berita Malaysia dianalisis oleh JomAI (${sentimentScope})`}
                  </p>
                </div>
                <span className="jomi-pill-neutral">{sentimentScope}</span>
              </div>

              {isLoadingSentiment ? (
                <div className="jomi-card-soft jomi-cluster" style={{ justifyContent: 'center', padding: '2rem 1rem' }}>
                  <Loader2 size={18} />
                  <span className="jomi-text-sm" style={{ fontWeight: 700 }}>
                    {language === 'ENG' ? 'Scanning live Malaysian headlines...' : 'Mengimbas berita langsung Malaysia...'}
                  </span>
                </div>
              ) : sentimentData && sentimentData.headlines.length > 0 ? (
                <div className="jomi-stack-sm">
                  {sentimentData.headlines.map((news, idx) => {
                    const pill =
                      news.sentiment === 'Positive'
                        ? 'jomi-pill-gain'
                        : news.sentiment === 'Cautious'
                          ? 'jomi-pill-loss'
                          : 'jomi-pill-neutral';
                    return (
                      <a
                        key={idx}
                        href={safeExternalHref(news.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="jomi-row"
                        style={{ flexDirection: 'column', alignItems: 'stretch', textDecoration: 'none', color: 'inherit', gap: '0.35rem' }}
                      >
                        <div className="jomi-between">
                          <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>
                            <Newspaper size={13} />
                            <span>{news.source} · {news.timeAgo}</span>
                          </span>
                          <div className="jomi-cluster" style={{ gap: '0.35rem' }}>
                            <span className={pill}>{news.sentiment}</span>
                            <ExternalLink size={12} color="#0d9488" />
                          </div>
                        </div>
                        <p className="jomi-text-sm" style={{ fontWeight: 700 }}>{news.title}</p>
                        {news.impact && (
                          <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>{news.impact}</p>
                        )}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
                    {language === 'ENG'
                      ? 'No live headlines retrieved for this selection right now. Try Refresh or switch scope to All Bursa Malaysia (KLCI).'
                      : 'Tiada berita langsung ditemui buat masa ini. Cuba Segar semula atau tukar skop ke All Bursa Malaysia (KLCI).'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 3. AI Wealth Projector */}
          <WealthProjector language={language} portfolioEquityRM={portfolioEquityRM} />
        </div>
      )}

      {/* ACADEMY MASTERY BANNER (Articles, Video Guides & Glossary) */}
      {activeTab !== 'ai-tools' && (
        <section className="jomi-card jomi-card-pad jomi-stack-sm">
          <div className="jomi-between">
            <div className="jomi-cluster">
              <div className="jomi-ticker-badge">
                <GraduationCap size={19} />
              </div>
              <div>
                <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
                  <h3 className="jomi-display jomi-title-md">
                    {isEng ? 'Bursa Academy Mastery' : 'Penguasaan Akademi Bursa'}
                  </h3>
                  <span className="jomi-pill-neutral">{academyRank}</span>
                </div>
                <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                  {isEng
                    ? `${completedCount} of ${lessons.length} lessons completed · ${masteredTermsCount} of ${glossaryFlashcards.length} flashcards learned`
                    : `${completedCount} daripada ${lessons.length} pelajaran selesai · ${masteredTermsCount} daripada ${glossaryFlashcards.length} kad imbas dikuasai`}
                </p>
              </div>
            </div>

            <div className="jomi-cluster jomi-nums">
              <span className="jomi-pill-gain">
                {earnedLessonXP} / {totalLessonXP} XP
              </span>
              <span className="jomi-pill-sector">{masteryPct}%</span>
            </div>
          </div>

          <div className="jomi-progress-track">
            <div className="jomi-progress-fill-emerald" style={{ width: `${masteryPct}%` }} />
          </div>
        </section>
      )}

      {/* FILTER BAR (Articles & Video Guides) */}
      {(activeTab === 'articles' || activeTab === 'tutorials') && (
        <div className="jomi-between">
          <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setLessonCategory(cat)}
                className={`jomi-btn jomi-btn-sm ${lessonCategory === cat ? 'jomi-btn-primary' : 'jomi-btn-outline'}`}
              >
                {cat === 'All' ? (isEng ? 'All Topics' : 'Semua Topik') : cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIncompleteOnly((prev) => !prev)}
            className={`jomi-btn jomi-btn-sm ${incompleteOnly ? 'jomi-btn-gold' : 'jomi-btn-outline'}`}
          >
            {incompleteOnly
              ? isEng
                ? 'Showing Incomplete Only'
                : 'Tunjuk Belum Selesai Sahaja'
              : isEng
                ? 'Filter: Incomplete Only'
                : 'Tapis: Belum Selesai'}
          </button>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ARTICLES & QUIZZES */}
      {activeTab === 'articles' && (
        filteredLessons.length === 0 ? (
          <div className="jomi-card jomi-card-pad jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center' }}>
            <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
              {isEng
                ? 'No articles match this filter right now. Reset filters to view all 8 guides.'
                : 'Tiada artikel sepadan dengan penapis ini. Tetap semula penapis untuk melihat kesemua 8 panduan.'}
            </p>
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => {
                setLessonCategory('All');
                setIncompleteOnly(false);
              }}
            >
              {isEng ? 'Show All Articles' : 'Tunjuk Semua Artikel'}
            </button>
          </div>
        ) : (
          <div className="jomi-grid-3">
            {filteredLessons.map((lesson) => {
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
                      <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ gap: '0.35rem', fontWeight: 700 }}>
                        <span className="jomi-pill-sector">{lesson.category}</span>
                        <span className="jomi-cluster" style={{ gap: '0.2rem' }}>
                          <Clock size={12} />
                          {lesson.duration}
                        </span>
                      </span>
                    </div>
                    <h3 className="jomi-display jomi-title-md">
                      {isEng ? lesson.titleEng : lesson.titleBm}
                    </h3>
                    <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                      {isEng ? lesson.descEng : lesson.descBm}
                    </p>
                    <div className="jomi-cluster" style={{ gap: '0.4rem' }}>
                      <span className="jomi-pill-sector">{lesson.level}</span>
                      {lesson.relatedTicker && (
                        <span className="jomi-pill-sector">{lesson.relatedTicker}</span>
                      )}
                    </div>
                  </div>

                  <button type="button" className="jomi-btn jomi-btn-primary jomi-btn-sm jomi-btn-full">
                    <BookOpen size={15} />
                    <span>{t.readMore} (+{lesson.xpReward} XP)</span>
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 3: INTERACTIVE VIDEO GUIDES & QUIZZES */}
      {activeTab === 'tutorials' && (
        filteredLessons.length === 0 ? (
          <div className="jomi-card jomi-card-pad jomi-stack-sm" style={{ textAlign: 'center', alignItems: 'center' }}>
            <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 700 }}>
              {isEng
                ? 'No guided walkthroughs match this filter right now.'
                : 'Tiada panduan video sepadan dengan penapis ini.'}
            </p>
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => {
                setLessonCategory('All');
                setIncompleteOnly(false);
              }}
            >
              {isEng ? 'Show All Guides' : 'Tunjuk Semua Panduan'}
            </button>
          </div>
        ) : (
          <div className="jomi-grid-2">
            {filteredLessons.map((lesson) => {
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
                      <span className="jomi-cluster jomi-text-xs jomi-muted" style={{ fontWeight: 700, gap: '0.35rem' }}>
                        <span className="jomi-pill-sector">{lesson.chapters?.length || 3} {isEng ? 'Chapters' : 'Bab'}</span>
                        <span>{lesson.duration}</span>
                      </span>
                    </div>
                    <h3 className="jomi-display jomi-title-md">
                      {isEng ? lesson.titleEng : lesson.titleBm}
                    </h3>
                    <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                      {isEng ? lesson.descEng : lesson.descBm}
                    </p>
                    <div style={{ paddingTop: '0.35rem' }}>
                      <button type="button" className="jomi-btn jomi-btn-primary jomi-btn-full">
                        <Play size={15} />
                        <span>{t.watchNow} (+{lesson.xpReward} XP)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 4: INTERACTIVE BURSA GLOSSARY FLASHCARDS */}
      {activeTab === 'glossary' && activeCard && (
        <div className="jomi-stack-lg">
          {/* Category Filter Pills */}
          <div className="jomi-between">
            <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
              {(['All', 'Basics', 'Valuation', 'Trading', 'Shariah & MY'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setGlossaryCategory(cat);
                    setActiveGlossaryIdx(0);
                    setIsGlossaryFlipped(false);
                  }}
                  className={`jomi-btn jomi-btn-sm ${glossaryCategory === cat ? 'jomi-btn-primary' : 'jomi-btn-outline'}`}
                >
                  {cat === 'All' ? (isEng ? 'All 15 Terms' : 'Semua 15 Istilah') : cat}
                </button>
              ))}
            </div>

            <span className="jomi-pill-gain jomi-nums">
              {masteredTermsCount} / {glossaryFlashcards.length} {isEng ? 'Mastered' : 'Dikuasai'}
            </span>
          </div>

          {/* Interactive Flip Flashcard Deck */}
          <section className="jomi-card jomi-card-pad jomi-stack-md">
            <div className="jomi-between">
              <div className="jomi-cluster">
                <span className="jomi-pill-sector">{activeCard.category}</span>
                <span className="jomi-pill-neutral jomi-nums">
                  {isEng ? 'Card' : 'Kad'} {safeGlossaryIdx + 1} / {filteredGlossary.length}
                </span>
              </div>

              {learnedTerms.includes(activeCard.termEng) ? (
                <span className="jomi-pill-gain">
                  <CheckCircle2 size={12} />
                  {isEng ? 'Learned (+10 XP)' : 'Dipelajari (+10 XP)'}
                </span>
              ) : (
                <span className="jomi-pill-neutral">+10 XP</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsGlossaryFlipped((prev) => !prev)}
              className={isGlossaryFlipped ? 'jomi-card-soft jomi-stack-sm' : 'jomi-card-gold jomi-stack-sm'}
              style={{
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '190px',
                justifyContent: 'center',
                padding: '1.5rem',
              }}
            >
              {!isGlossaryFlipped ? (
                <div className="jomi-stack-sm" style={{ alignItems: 'center', textAlign: 'center', width: '100%' }}>
                  <span className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--jomi-gold-ink)' }}>
                    {isEng ? 'Term — Click Card to Reveal Definition' : 'Istilah — Klik Kad untuk Lihat Maksud'}
                  </span>
                  <h3 className="jomi-display jomi-title-xl">
                    {isEng ? activeCard.termEng : activeCard.termBm}
                  </h3>
                  <span className="jomi-cluster jomi-text-xs" style={{ fontWeight: 800, color: 'var(--jomi-gold-ink)' }}>
                    <RotateCw size={13} />
                    <span>{isEng ? 'Flip for Bursa example' : 'Pusing untuk contoh Bursa'}</span>
                  </span>
                </div>
              ) : (
                <div className="jomi-stack-sm" style={{ width: '100%' }}>
                  <div className="jomi-between">
                    <h4 className="jomi-display jomi-title-md">
                      {isEng ? activeCard.termEng : activeCard.termBm}
                    </h4>
                    <span className="jomi-pill-gain">
                      <RotateCw size={11} />
                      {isEng ? 'Definition' : 'Definisi'}
                    </span>
                  </div>
                  <p className="jomi-text-sm" style={{ fontWeight: 800 }}>
                    {isEng ? activeCard.shortEng : activeCard.shortBm}
                  </p>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                    {isEng ? activeCard.detailEng : activeCard.detailBm}
                  </p>
                  <div className="jomi-row" style={{ cursor: 'default', backgroundColor: '#ffffff' }}>
                    <div>
                      <p className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
                        {isEng ? 'Bursa Example' : 'Contoh Bursa'}
                      </p>
                      <p className="jomi-text-xs" style={{ fontWeight: 700, marginTop: '0.15rem' }}>
                        {isEng ? activeCard.exampleEng : activeCard.exampleBm}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </button>

            <div className="jomi-between">
              <div className="jomi-cluster" style={{ gap: '0.5rem' }}>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-sm"
                  onClick={() => {
                    setActiveGlossaryIdx((prev) =>
                      prev <= 0 ? filteredGlossary.length - 1 : prev - 1
                    );
                    setIsGlossaryFlipped(false);
                  }}
                >
                  <ChevronLeft size={15} />
                  <span>{isEng ? 'Previous' : 'Sebelum'}</span>
                </button>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-sm"
                  onClick={() => setIsGlossaryFlipped((prev) => !prev)}
                >
                  <RotateCw size={14} />
                  <span>{isEng ? 'Flip Card' : 'Pusing Kad'}</span>
                </button>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-sm"
                  onClick={() => {
                    setActiveGlossaryIdx((prev) => (prev + 1) % filteredGlossary.length);
                    setIsGlossaryFlipped(false);
                  }}
                >
                  <span>{isEng ? 'Next' : 'Seterusnya'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              <button
                type="button"
                className="jomi-btn jomi-btn-primary jomi-btn-sm"
                disabled={learnedTerms.includes(activeCard.termEng)}
                onClick={() =>
                  onLearnTerm?.(
                    activeCard.termEng,
                    10,
                    isEng ? activeCard.termEng : activeCard.termBm
                  )
                }
              >
                <Check size={14} />
                <span>
                  {learnedTerms.includes(activeCard.termEng)
                    ? isEng
                      ? 'Mastered'
                      : 'Dikuasai'
                    : isEng
                      ? 'Mark Learned (+10 XP)'
                      : 'Tanda Dipelajari (+10 XP)'}
                </span>
              </button>
            </div>
          </section>

          {/* Quick-Reference Grid */}
          <div className="jomi-grid-3">
            {filteredGlossary.map((card, idx) => {
              const isSelected = card.id === activeCard.id;
              const isMastered = learnedTerms.includes(card.termEng);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setActiveGlossaryIdx(idx);
                    setIsGlossaryFlipped(true);
                  }}
                  className={`jomi-card jomi-card-interactive jomi-card-pad jomi-stack-xs`}
                  style={{
                    textAlign: 'left',
                    borderColor: isSelected ? 'var(--jomi-primary)' : undefined,
                    backgroundColor: isSelected ? 'var(--jomi-surface-soft)' : undefined,
                  }}
                >
                  <div className="jomi-between">
                    <span className="jomi-pill-sector">{card.category}</span>
                    {isMastered && (
                      <span className="jomi-pill-gain">
                        <CheckCircle2 size={11} />
                        {isEng ? 'Done' : 'Selesai'}
                      </span>
                    )}
                  </div>
                  <h4 className="jomi-display jomi-title-md">
                    {isEng ? card.termEng : card.termBm}
                  </h4>
                  <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>
                    {isEng ? card.shortEng : card.shortBm}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* INTERACTIVE STUDY & QUIZ MODAL */}
      {activeLesson && (
        <div className="jomi-dialog-backdrop" onClick={() => setActiveLesson(null)}>
          <div
            className="jomi-dialog-panel jomi-stack-md"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={isEng ? activeLesson.titleEng : activeLesson.titleBm}
          >
            <div className="jomi-between">
              <div className="jomi-cluster">
                <span className="jomi-pill-gain">{activeLesson.category}</span>
                <span className="jomi-pill-sector">{activeLesson.level}</span>
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
              {isEng ? activeLesson.titleEng : activeLesson.titleBm}
            </h3>

            {/* Interactive Chapter Walkthrough for Video Guides */}
            {activeLesson.type === 'video' && activeLesson.chapters && activeLesson.chapters.length > 0 && (
              <div className="jomi-card-soft jomi-stack-sm">
                <div className="jomi-between">
                  <span className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
                    {isEng ? 'Interactive Chapter Walkthrough' : 'Panduan Bab Interaktif'}
                  </span>
                  <div className="jomi-cluster" style={{ gap: '0.35rem' }}>
                    {activeLesson.chapters.map((_, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setActiveChapterIdx(cIdx)}
                        className={`jomi-btn jomi-btn-sm jomi-nums ${activeChapterIdx === cIdx ? 'jomi-btn-primary' : 'jomi-btn-outline'}`}
                      >
                        {isEng ? `Ch ${cIdx + 1}` : `Bab ${cIdx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const chapter =
                    activeLesson.chapters[Math.min(activeChapterIdx, activeLesson.chapters.length - 1)];
                  return (
                    <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch', backgroundColor: '#ffffff' }}>
                      <div className="jomi-between">
                        <h4 className="jomi-display jomi-title-md">
                          {isEng ? chapter.titleEng : chapter.titleBm}
                        </h4>
                        {chapter.metricBadge && (
                          <span className="jomi-pill-gain">{chapter.metricBadge}</span>
                        )}
                      </div>
                      <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                        {isEng ? chapter.summaryEng : chapter.summaryBm}
                      </p>
                      <div className="jomi-between" style={{ paddingTop: '0.25rem' }}>
                        <button
                          type="button"
                          className="jomi-btn jomi-btn-outline jomi-btn-sm"
                          disabled={activeChapterIdx === 0}
                          onClick={() => setActiveChapterIdx((prev) => Math.max(0, prev - 1))}
                        >
                          <ChevronLeft size={14} />
                          <span>{isEng ? 'Prev Chapter' : 'Bab Sebelum'}</span>
                        </button>
                        <button
                          type="button"
                          className="jomi-btn jomi-btn-outline jomi-btn-sm"
                          disabled={activeChapterIdx >= activeLesson.chapters!.length - 1}
                          onClick={() =>
                            setActiveChapterIdx((prev) =>
                              Math.min(activeLesson.chapters!.length - 1, prev + 1)
                            )
                          }
                        >
                          <span>{isEng ? 'Next Chapter' : 'Bab Seterusnya'}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Study Notes */}
            <div className="jomi-card-soft jomi-stack-sm">
              {(isEng ? activeLesson.bodyEng : activeLesson.bodyBm).map((para, idx) => (
                <p key={idx} className="jomi-text-sm" style={{ fontWeight: 600, lineHeight: 1.55 }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Key Rule / Formula Callout */}
            <div className="jomi-card-gold jomi-stack-xs" style={{ padding: '0.9rem 1.05rem' }}>
              <div className="jomi-cluster" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <Lightbulb size={15} color="#b45309" />
                <span>{isEng ? 'Key Formula / Rule of Thumb' : 'Formula / Peraturan Utama'}</span>
              </div>
              <p className="jomi-text-sm" style={{ fontWeight: 700, color: 'var(--jomi-ink)' }}>
                {isEng ? activeLesson.keyRuleEng : activeLesson.keyRuleBm}
              </p>
            </div>

            {/* Real Bursa Example + Inspect Ticker CTA */}
            <div className="jomi-row" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div className="jomi-between">
                <span className="jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
                  {isEng ? 'Real Bursa Malaysia Example' : 'Contoh Sebenar Bursa Malaysia'}
                </span>
                {activeLesson.relatedTicker && setSelectedStock && (
                  <button
                    type="button"
                    className="jomi-btn jomi-btn-outline jomi-btn-sm"
                    onClick={() => {
                      const target = stocks.find((s) => s.ticker === activeLesson.relatedTicker);
                      if (target) {
                        setSelectedStock(target);
                        setActiveLesson(null);
                        navigateTo('stock-details');
                      }
                    }}
                  >
                    <span>
                      {isEng
                        ? `Inspect ${activeLesson.relatedTicker}`
                        : `Lihat ${activeLesson.relatedTicker}`}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
              <p className="jomi-text-sm" style={{ fontWeight: 600 }}>
                {isEng ? activeLesson.bursaExampleEng : activeLesson.bursaExampleBm}
              </p>
            </div>

            {/* 3-Question Comprehension Check */}
            <div className="jomi-stack-md">
              <h4 className="jomi-display jomi-title-md jomi-cluster">
                <Award size={18} color="#b45309" />
                <span>{isEng ? 'Quick Knowledge Check (3 Questions)' : 'Ujian Kefahaman Pantas (3 Soalan)'}</span>
              </h4>

              {activeLesson.quiz.map((q, qIdx) => {
                const opts = isEng ? q.optionsEng : q.optionsBm;
                return (
                  <div key={qIdx} className="jomi-stack-xs">
                    <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      {qIdx + 1}. {isEng ? q.questionEng : q.questionBm}
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

                    {quizSubmitted && (
                      <div className="jomi-card-soft" style={{ padding: '0.65rem 0.85rem' }}>
                        <p className="jomi-text-xs" style={{ fontWeight: 700, color: '#065f46' }}>
                          {isEng ? q.explanationEng : q.explanationBm}
                        </p>
                      </div>
                    )}
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
                      ? isEng
                        ? 'Perfect score! Lesson completed.'
                        : 'Markah penuh! Pelajaran selesai.'
                      : isEng
                        ? 'Almost there — review the highlighted green answers and explanations, then try again!'
                        : 'Hampir berjaya — semak jawapan hijau serta penerangan, dan cuba lagi!'}
                  </p>
                </div>
              )}

              <div className="jomi-between">
                <button type="button" className="jomi-btn jomi-btn-outline" onClick={() => setActiveLesson(null)}>
                  {isEng ? 'Close' : 'Tutup'}
                </button>
                <button
                  type="button"
                  disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                  className="jomi-btn jomi-btn-primary"
                  onClick={handleQuizSubmit}
                >
                  {isEng ? 'Submit Answers' : 'Hantar Jawapan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
