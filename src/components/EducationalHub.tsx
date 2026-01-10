import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ArrowLeft, BookOpen, Play, Clock, TrendingUp, Sparkles, FileText, Zap, BarChart, Activity, Gauge, Loader2, Link, Bot, Newspaper, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Screen } from '../App';

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
}

const articles = [
  {
    titleEng: 'What is a Dividend?',
    titleBm: 'Apakah Dividen?',
    descEng: 'Learn how companies share profits with shareholders',
    descBm: 'Pelajari bagaimana syarikat berkongsi keuntungan dengan pemegang saham',
    readTime: '5 min',
    category: 'Basics',
  },
  {
    titleEng: 'Understanding Bursa Malaysia',
    titleBm: 'Memahami Bursa Malaysia',
    descEng: 'A complete guide to Malaysia\'s stock exchange',
    descBm: 'Panduan lengkap tentang bursa saham Malaysia',
    readTime: '8 min',
    category: 'Market',
  },
  {
    titleEng: 'Risk vs. Return',
    titleBm: 'Risiko vs. Pulangan',
    descEng: 'Balance risk and reward in your investment strategy',
    descBm: 'Seimbangkan risiko dan ganjaran dalam strategi pelaburan anda',
    readTime: '6 min',
    category: 'Strategy',
  },
];

const tutorials = [
  {
    titleEng: 'How to Read a Stock Chart',
    titleBm: 'Cara Membaca Carta Saham',
    descEng: 'Master the basics of technical analysis',
    descBm: 'Kuasai asas analisis teknikal',
    duration: '12 min',
    level: 'Beginner',
  },
  {
    titleEng: 'What is Risk Management?',
    titleBm: 'Apakah Pengurusan Risiko?',
    descEng: 'Protect your investments with smart strategies',
    descBm: 'Lindungi pelaburan anda dengan strategi pintar',
    duration: '15 min',
    level: 'Beginner',
  },
];

export function EducationalHub({ navigateTo, language }: EducationalHubProps) {
  // Wealth Projector State
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [riskLevel, setRiskLevel] = useState(5);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  // JomRingkas State
  const [selectedReport, setSelectedReport] = useState("tenaga");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Animation State for Scanning
  const [loadingText, setLoadingText] = useState("Analyzing...");

  useEffect(() => {
    if (isScanning) {
      const texts = ["Reading PDF...", "Extracting Data...", "Summarizing Risks...", "Finalizing..."];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isScanning]);


  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Educational Hub',
      subtitle: 'Learn to invest with confidence',
      articles: 'Articles',
      tutorials: 'Video Tutorials',
      aiTools: 'AI Tools',
      readMore: 'Read More',
      watchNow: 'Watch Now',
    },
    BM: {
      back: 'Kembali ke Dashboard',
      title: 'Hab Pendidikan',
      subtitle: 'Belajar melabur dengan yakin',
      articles: 'Artikel',
      tutorials: 'Tutorial Video',
      aiTools: 'Alat AI',
      readMore: 'Baca Lagi',
      watchNow: 'Tonton Sekarang',
    }
  };

  const t = texts[language];

  // Logic 1: Wealth Calculation
  const generateWealthData = () => {
    const data = [];
    let currentWealth = 0;
    let totalInvested = 0;
    const years = 10;
    let annualReturn = 0.04 + (riskLevel * 0.008);
    if (inflationAdjusted) annualReturn -= 0.03;

    for (let year = 0; year <= years; year++) {
      data.push({
        year: `Year ${year}`,
        wealth: Math.round(currentWealth),
        invested: Math.round(totalInvested),
      });
      // Compound
      currentWealth = (currentWealth + (monthlyInvest * 12)) * (1 + annualReturn);
      totalInvested += (monthlyInvest * 12);
    }
    return data;
  };

  const wealthData = generateWealthData();
  const finalWealth = wealthData[wealthData.length - 1].wealth;

  // Logic 2: JomRingkas Scan
  const handleAnalyze = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  const reportData: any = {
    tenaga: {
      title: "Tenaga Nasional Annual Report 2025",
      growth: "CEO promises RM 2B investment in Renewable Energy Grid. Expected to boost long-term revenue by 15%. (pg. 12)",
      risk: "High coal prices may impact profit margins in Q3 2026 if fuel costs are not passed through to consumers. (pg. 45)",
      dividend: "Consistent Payout. Declared 30 sen/share total for FY25. Yield is attractive at 4.5%. (pg. 8)",
      score: 85
    },
    maybank: {
      title: "Maybank Integrated Report 2024",
      growth: "Digital Banking adoption grew 40% YoY. New 'MAE' app features driving dominance in SME sector. (pg. 4)",
      risk: "Exposure to global interest rate volatility could compress Net Interest Margin (NIM) by 5bps. (pg. 67)",
      dividend: "Solid Dividend Aristocrat. Payout ratio maintained at 75% of profits. Yield ~6.2%. (pg. 102)",
      score: 92
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="hover:bg-gray-100/50">
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Animated Hero Section */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-200 mb-4 animate-in fade-in zoom-in duration-500">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ai-tools" className="space-y-8">
          <div className="flex justify-center md:justify-start">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-white border shadow-sm p-1 h-auto rounded-xl">
              <TabsTrigger value="ai-tools" className="rounded-lg py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 font-medium transition-all">
                <Sparkles size={16} className="mr-2 text-purple-600" /> {t.aiTools}
              </TabsTrigger>
              <TabsTrigger value="articles" className="rounded-lg py-2 data-[state=active]:bg-gray-100">{t.articles}</TabsTrigger>
              <TabsTrigger value="tutorials" className="rounded-lg py-2 data-[state=active]:bg-gray-100">{t.tutorials}</TabsTrigger>
            </TabsList>
          </div>

          {/* === DETAILED AI TOOLS TAB === */}
          <TabsContent value="ai-tools" className="space-y-12 animate-in slide-in-from-bottom-5 fade-in duration-500">

            {/* 1. JomRingkas */}
            <section className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

              <Card className="relative border-none shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

                <CardContent className="p-0">
                  <div className="grid md:grid-cols-12 min-h-[500px]">
                    {/* Left Panel: Control */}
                    <div className="md:col-span-5 bg-gray-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 mb-2 flex items-center gap-2">
                          <FileText className="text-purple-600" /> JomRingkas
                        </h2>
                        <p className="text-sm text-gray-500">AI-Powered Annual Report Analyzer</p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl border shadow-sm hover:border-purple-300 transition-colors">
                          <Label className="text-xs text-gray-400 font-bold tracking-wider mb-2 block uppercase">Select Document</Label>
                          <Select value={selectedReport} onValueChange={setSelectedReport}>
                            <SelectTrigger className="border-none shadow-none p-0 h-auto font-medium text-lg focus:ring-0 w-full">
                              <SelectValue placeholder="Select Report" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tenaga">Tenaga Nasional '25</SelectItem>
                              <SelectItem value="maybank">Maybank Integrated '24</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          className={`w-full h-12 text-lg font-bold shadow-lg shadow-purple-200 transition-all ${isScanning ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-300 hover:scale-[1.02]'}`}
                          onClick={handleAnalyze}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <><Loader2 className="mr-2 animate-spin" /> {loadingText}</>
                          ) : (
                            <><Sparkles className="mr-2" /> Analyze Document</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Right Panel: Visualization */}
                    <div className="md:col-span-7 p-8 bg-white relative">
                      {/* Empty State */}
                      {!scanComplete && !isScanning && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 text-gray-400">
                          <div className="p-6 bg-gray-50 rounded-full">
                            <Bot size={48} className="text-gray-300" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium text-gray-600">No Report Analyzed</h3>
                            <p className="text-sm max-w-xs mx-auto mt-2">Pick a report from the menu to extract insights automatically.</p>
                          </div>
                        </div>
                      )}

                      {/* Scanning Animation */}
                      {isScanning && (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="relative w-32 h-40 border-2 border-gray-100 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden mb-6">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
                            <div className="space-y-2 p-4 w-full opacity-30">
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-full"></div>
                              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                              <div className="h-2 bg-gray-200 rounded w-full"></div>
                            </div>
                          </div>
                          <p className="font-mono text-purple-600 animate-pulse text-sm font-bold">{loadingText}</p>
                        </div>
                      )}

                      {/* Results */}
                      {scanComplete && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <div>
                              <Badge variant="secondary" className="mb-2 bg-green-50 text-green-700 hover:bg-green-100">Complete</Badge>
                              <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Confidence</p>
                              <p className="text-2xl font-black text-green-600">{reportData[selectedReport].score}%</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {[
                              { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", title: "Growth Driver", text: reportData[selectedReport].growth },
                              { icon: Activity, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", title: "Key Risk", text: reportData[selectedReport].risk },
                              { icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", title: "Dividend Verdict", text: reportData[selectedReport].dividend }
                            ].map((item, idx) => (
                              <div key={idx} className={`p-4 ${item.bg} border ${item.border} rounded-xl group hover:shadow-md transition-all`}>
                                <div className="flex gap-3">
                                  <div className={`mt-0.5 p-1.5 bg-white rounded-lg shadow-sm h-fit ${item.color}`}>
                                    <item.icon size={18} />
                                  </div>
                                  <div>
                                    <h4 className={`font-bold ${item.color} text-sm mb-1 uppercase tracking-wide`}>{item.title}</h4>
                                    <p className="text-gray-800 text-sm leading-relaxed">{item.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3 justify-end pt-2">
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                              <Link size={12} className="mr-1" /> Open PDF
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">Export</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 2. JomSentimen */}
            <section className="grid md:grid-cols-2 gap-8">
              {/* Gauge Card */}
              <Card className="border-none shadow-lg bg-gradient-to-b from-white to-gray-50 overflow-hidden relative min-h-[300px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-[60px] opacity-40 pointer-events-none"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="p-2 bg-orange-100 rounded-lg text-orange-600"><Gauge size={18} /></span>
                    JomSentimen
                  </CardTitle>
                  <CardDescription>Market Emotion Radar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                  {/* Corrected Gauge Visual - No overlapping text */}
                  <div className="relative w-64 h-32 mb-8">
                    {/* Gauge Body */}
                    <div className="w-full h-full rounded-t-full bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-0 bg-[conic-gradient(from_0.5turn_at_50%_100%,_#ef4444_0deg,_#ef4444_45deg,_#eab308_45deg,_#eab308_135deg,_#22c55e_135deg,_#22c55e_180deg)] opacity-80 blur-[1px]"></div>
                      <div className="absolute top-[20%] left-[20%] right-[20%] bottom-0 bg-white rounded-t-full z-10"></div>
                    </div>

                    {/* Needle */}
                    <div className="absolute bottom-0 left-1/2 w-full h-2 z-20 flex items-center justify-center">
                      <div className="w-1.5 h-[6.5rem] bg-slate-800 origin-bottom transform rotate-[45deg] rounded-full transition-all duration-1000 shadow-xl pb-6"></div>
                      <div className="absolute w-4 h-4 bg-slate-900 rounded-full border-2 border-white shadow-lg"></div>
                    </div>
                  </div>

                  {/* Grid for labels below gauge */}
                  <div className="flex justify-between w-64 text-[10px] font-bold uppercase tracking-widest text-gray-400 -mt-6 mb-4 px-2">
                    <span className="text-red-500">Fear</span>
                    <span className="text-yellow-500">Neutral</span>
                    <span className="text-green-600">Greed</span>
                  </div>

                  <div className="text-center space-y-1 mt-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs mb-2 shadow-sm border border-green-200">
                      Updated 5m ago
                    </div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">GREED</h3>
                    <p className="text-gray-500 text-sm">Score: <span className="font-bold text-slate-800">78</span> / 100</p>
                  </div>
                </CardContent>
              </Card>

              {/* News Feed - Fixed Alignment */}
              <Card className="border-none shadow-lg bg-white h-full relative overflow-hidden flex flex-col">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="flex justify-between items-center text-base">
                    <span>Live Analysis</span>
                    <span className="flex items-center gap-1.5 text-[0.65rem] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> LIVE
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="divide-y divide-gray-100">
                    {[
                      { source: "The Edge", time: "10m ago", text: "Tech sector rally continues as major data center confirmed in Johor.", sentiment: "Positive", color: "text-green-700", bg: "bg-green-100", border: "border-green-200", icon: Newspaper },
                      { source: "X Trending", time: "32m ago", text: "Palm oil futures drop below RM 3800. Worrying for plantation stocks.", sentiment: "Negative", color: "text-red-700", bg: "bg-red-100", border: "border-red-200", icon: MessageSquare },
                      { source: "StarBiz", time: "1h ago", text: "Bank Negara holds OPR at 3.00%. Stability expected.", sentiment: "Neutral", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200", icon: Newspaper },
                    ].map((news, i) => (
                      <div key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer block">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <news.icon size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-700">{news.source}</span>
                            <span className="text-[10px] text-gray-400">• {news.time}</span>
                          </div>
                          <Badge variant="outline" className={`${news.bg} ${news.color} ${news.border} text-[10px] uppercase font-bold shrink-0 self-center`}>
                            {news.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-snug">"{news.text}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-3 bg-gray-50/80 text-center border-t border-gray-100 mt-auto">
                  <Button variant="link" size="sm" className="text-gray-500 h-auto py-0 text-xs">View All Sources</Button>
                </div>
              </Card>
            </section>

            {/* 3. Wealth Projector - Fixed Chart Height */}
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-5 transform rotate-1 scale-[1.01]"></div>

              <Card className="border-none shadow-xl bg-white relative z-10 overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

                <CardHeader className="md:flex md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl mb-1">
                      <span className="p-2 bg-blue-100 rounded-lg text-blue-600"><BarChart size={20} /></span>
                      AI Wealth Projector
                    </CardTitle>
                    <CardDescription>Simulate the power of compound interest over 10 years.</CardDescription>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Projected Total</p>
                    <p className="text-3xl font-black text-blue-600">RM {finalWealth.toLocaleString()}</p>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-12 min-h-[400px]">
                    {/* Chart - FORCED HEIGHT */}
                    <div className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between h-[450px]">
                      <div className="h-full w-full relative">
                        {/* ResponsiveContainer needs a parent with definite height */}
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={wealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={50} />
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px', fontSize: '13px' }}
                            />
                            <Area type="monotone" dataKey="wealth" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorWealth)" />
                            <Area type="monotone" dataKey="invested" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-6 justify-center mt-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Total Wealth
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span> Cash Invested
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-4 p-6 md:p-8 bg-gray-50/50 space-y-8 flex flex-col justify-center">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <Label className="text-sm font-bold text-gray-700">Monthly Investment</Label>
                          <span className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded text-xs">RM {monthlyInvest}</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="5000"
                          step="100"
                          value={monthlyInvest}
                          onChange={(e) => setMonthlyInvest(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <Label className="text-sm font-bold text-gray-700">Risk Profile</Label>
                          <span className={`font-bold px-2 py-1 rounded text-xs ${riskLevel > 7 ? 'text-red-700 bg-red-100' : riskLevel > 4 ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'}`}>
                            {riskLevel}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={riskLevel}
                          onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${riskLevel > 7 ? 'accent-red-500' : riskLevel > 4 ? 'accent-yellow-500' : 'accent-green-500'} transition-all`}
                        />
                        <div className="mt-3 p-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 leading-relaxed shadow-sm">
                          {riskLevel <= 3 ? "🛡️ Conservative: Gov Bonds & Blue Chips (Est. 4-6% p.a)" :
                            riskLevel <= 7 ? "⚖️ Balanced: Mixed Equity & Bonds (Est. 6-9% p.a)" :
                              "🚀 Aggressive: Growth Stocks & Tech (Est. 9-12% p.a)"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div>
                          <Label className="font-bold text-sm cursor-pointer" onClick={() => setInflationAdjusted(!inflationAdjusted)}>Inflation Adjusted</Label>
                          <p className="text-[10px] text-gray-400">Real purchasing power (3%)</p>
                        </div>
                        <Switch checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

          </TabsContent>

          {/* Existing Tabs Content - Unchanged */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock size={14} />
                        {article.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'ENG' ? article.titleEng : article.titleBm}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {language === 'ENG' ? article.descEng : article.descBm}
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2" size={16} />
                      {t.readMore}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="relative aspect-video bg-gray-200">
                    <ImageWithFallback
                      src={index % 2 === 0
                        ? "https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMHRyYWRpbmclMjBkYXRhfGVufDF8fHx8MTc2MTkwMDk2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        : "https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGVkdWNhdGlvbiUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MTgyMDI5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      }
                      alt="Tutorial thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="text-green-600 ml-1" size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={tutorial.level === 'Beginner' ? 'secondary' : 'default'}>{tutorial.level}</Badge>
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'ENG' ? tutorial.titleEng : tutorial.titleBm}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {language === 'ENG' ? tutorial.descEng : tutorial.descBm}
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="mr-2" size={16} />
                      {t.watchNow}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
