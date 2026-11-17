import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Edit,
  Trophy,
  Lock,
  CheckCircle2,
  Save,
  Wallet,
  Plus,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, PortfolioItem, TradeRecord } from '../App';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
  userXP: number;
  userLevel: number;
  portfolio: PortfolioItem[];
  tradeHistory: TradeRecord[];
  hasLearnedTerm: string[];
  cashBalance: number;
  onTopUpCash: (amount?: number) => void;
  onResetDemo: () => void;
}

export function ProfileSettings({
  navigateTo,
  userProfile,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  darkMode,
  setDarkMode,
  language,
  toggleLanguage,
  userXP,
  userLevel,
  portfolio,
  tradeHistory,
  hasLearnedTerm,
  cashBalance,
  onTopUpCash,
  onResetDemo
}: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftEmail, setDraftEmail] = useState(userEmail);

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Profile & Settings',
      profileCard: 'Investor Profile',
      edit: 'Edit Profile',
      save: 'Save Changes',
      retakeRisk: 'Retake Risk Assessment',
      walletCard: 'Virtual Practice Wallet',
      walletDesc: 'Manage your simulated Bursa Malaysia practice funds',
      virtualCash: 'Available Practice Cash',
      totalEquity: 'Total Account Equity',
      topUpBtn: '+ Top Up RM 5,000 Practice Cash',
      resetBtn: 'Reset Demo Account',
      learningJourney: 'Learning Journey',
      level: 'Level',
      achievements: 'Dynamic Investor Achievements',
      settings: 'App Preferences',
      darkMode: 'Dark Mode',
      language: 'Language',
      unlocked: 'Unlocked',
      locked: 'Locked'
    },
    BM: {
      back: 'Kembali ke Papan Pemuka',
      title: 'Profil & Tetapan',
      profileCard: 'Profil Pelabur',
      edit: 'Edit Profil',
      save: 'Simpan Perubahan',
      retakeRisk: 'Ambil Semula Ujian Risiko',
      walletCard: 'Dompet Latihan Maya',
      walletDesc: 'Urus dana latihan simulasi Bursa Malaysia anda',
      virtualCash: 'Tunai Latihan Tersedia',
      totalEquity: 'Jumlah Ekuiti Akaun',
      topUpBtn: '+ Tambah RM 5,000 Tunai Latihan',
      resetBtn: 'Tetapkan Semula Akaun Demo',
      learningJourney: 'Perjalanan Pembelajaran',
      level: 'Tahap',
      achievements: 'Pencapaian Pelabur Dinamik',
      settings: 'Tetapan Aplikasi',
      darkMode: 'Mod Gelap',
      language: 'Bahasa',
      unlocked: 'Dibuka',
      locked: 'Terkunci'
    }
  };

  const t = texts[language];

  // Initials from userName
  const initials = useMemo(() => {
    const parts = (userName || 'TH').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (userName || 'TH').slice(0, 2).toUpperCase();
  }, [userName]);

  // Portfolio calculations for achievements
  const holdingsValue = useMemo(() => {
    return portfolio.reduce(
      (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
      0
    );
  }, [portfolio]);

  const totalEquity = holdingsValue + cashBalance;

  const uniqueSectorsCount = useMemo(() => {
    return new Set(portfolio.map(item => item.stock.sector)).size;
  }, [portfolio]);

  const hasShariahAndDividend = useMemo(() => {
    const hasShariah = portfolio.some(item => item.stock.isShariah);
    const hasHighDiv = portfolio.some(
      item => parseFloat(item.stock.dividendYield.replace('%', '')) > 4
    );
    return hasShariah && hasHighDiv;
  }, [portfolio]);

  const dynamicAchievements = useMemo(
    () => [
      {
        id: 'first-trade',
        titleEng: 'First Simulated Trade',
        titleBm: 'Dagangan Simulasi Pertama',
        descEng: 'Executed your first practice trade on Bursa Malaysia',
        descBm: 'Melaksanakan dagangan latihan pertama di Bursa Malaysia',
        unlocked: tradeHistory.length > 0 || portfolio.length > 0
      },
      {
        id: 'wealth-builder',
        titleEng: 'Wealth Builder (RM 10.5K+ Equity or RM 2K+ Invested)',
        titleBm: 'Pembina Kekayaan (Ekuiti RM 10.5K+ atau RM 2K+ Dilabur)',
        descEng: `Invested RM ${holdingsValue.toFixed(0)} in stocks / RM ${totalEquity.toFixed(0)} equity`,
        descBm: `Melabur RM ${holdingsValue.toFixed(0)} dalam saham / Ekuiti RM ${totalEquity.toFixed(0)}`,
        unlocked: holdingsValue >= 2000 || totalEquity > 10500
      },
      {
        id: 'jargon-master',
        titleEng: 'Jargon Master (Learned 3+ Terms)',
        titleBm: 'Pakar Istilah (Belajar 3+ Istilah)',
        descEng: `Learned ${hasLearnedTerm.length}/3 financial terms in Jargon Buster`,
        descBm: `Belajar ${hasLearnedTerm.length}/3 istilah kewangan dalam Jargon Buster`,
        unlocked: hasLearnedTerm.length >= 3
      },
      {
        id: 'sector-diversifier',
        titleEng: 'Sector Diversifier (3+ Sectors)',
        titleBm: 'Kepelbagaian Sektor (3+ Sektor)',
        descEng: `Currently holding ${uniqueSectorsCount}/3 Bursa Malaysia sectors`,
        descBm: `Kini memegang ${uniqueSectorsCount}/3 sektor Bursa Malaysia`,
        unlocked: uniqueSectorsCount >= 3
      },
      {
        id: 'shariah-dividend',
        titleEng: 'Shariah & Dividend Explorer',
        titleBm: 'Peneroka Syariah & Dividen',
        descEng: 'Hold at least 1 Shariah stock (☪️) and 1 stock with >4% dividend yield',
        descBm: 'Pegang sekurang-kurangnya 1 saham Syariah (☪️) dan 1 saham dividen >4%',
        unlocked: hasShariahAndDividend
      }
    ],
    [
      tradeHistory.length,
      portfolio.length,
      holdingsValue,
      totalEquity,
      hasLearnedTerm.length,
      uniqueSectorsCount,
      hasShariahAndDividend
    ]
  );

  const handleToggleEdit = () => {
    if (isEditing) {
      const cleanedName = draftName.trim() || 'Tan Hao Yang';
      const cleanedEmail = draftEmail.trim() || 'tan@email.com';
      setUserName(cleanedName);
      setUserEmail(cleanedEmail);
      setIsEditing(false);
      toast.success(
        language === 'ENG' ? 'Profile updated!' : 'Profil berjaya dikemas kini!'
      );
    } else {
      setDraftName(userName);
      setDraftEmail(userEmail);
      setIsEditing(true);
    }
  };

  // Safe Math for XP Bar
  const xpForNextLevel = 100;
  const safeXP = Number(userXP) || 0;
  const safeLevel = Number(userLevel) || 1;
  const currentLevelXP = safeXP % xpForNextLevel;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
          <span className="text-sm font-semibold text-gray-500">{t.title}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>

        {/* 1. EDITABLE PROFILE CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>{t.profileCard}</CardTitle>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              className={isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              onClick={handleToggleEdit}
            >
              {isEditing ? (
                <>
                  <Save size={15} className="mr-1.5" /> {t.save}
                </>
              ) : (
                <>
                  <Edit size={15} className="mr-1.5" /> {t.edit}
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials}
                </div>
                {isEditing ? (
                  <div className="space-y-2 flex-1 max-w-sm">
                    <Input
                      value={draftName}
                      onChange={e => setDraftName(e.target.value)}
                      placeholder="Your Name"
                    />
                    <Input
                      value={draftEmail}
                      onChange={e => setDraftEmail(e.target.value)}
                      placeholder="Your Email"
                      type="email"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold">{userName}</p>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-green-50 text-green-700 border border-green-200"
                    >
                      {userProfile}
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo('questionnaire')}
              >
                <RefreshCw size={14} className="mr-1.5" />
                {t.retakeRisk}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. VIRTUAL WALLET MANAGEMENT CARD */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50/70 to-emerald-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Wallet size={20} className="text-green-600" />
              {t.walletCard}
            </CardTitle>
            <CardDescription>{t.walletDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {t.virtualCash}
                </p>
                <p className="text-2xl font-extrabold text-green-700">
                  RM {cashBalance.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {t.totalEquity}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  RM {totalEquity.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onTopUpCash(5000)}
              >
                <Plus size={15} className="mr-1" />
                {t.topUpBtn}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={onResetDemo}
              >
                <RotateCcw size={14} className="mr-1.5" />
                {t.resetBtn}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. XP & LEVEL CARD */}
        <Card className="border-2 border-indigo-100 bg-white">
          <CardHeader className="bg-indigo-50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-indigo-900 flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  {t.learningJourney}
                </CardTitle>
                <CardDescription className="text-indigo-700 font-medium mt-1">
                  {t.level} {safeLevel}
                </CardDescription>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-xs border border-indigo-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total XP</p>
                <p className="text-2xl font-bold text-indigo-600">{safeXP}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span>Progress to Level {safeLevel + 1}</span>
              <span>
                {currentLevelXP} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Learn terms in Stock Details, complete Educational Hub quizzes & trade stocks to earn XP!
            </p>
          </CardContent>
        </Card>

        {/* 4. DYNAMIC ACHIEVEMENTS (5 BADGES) */}
        <Card>
          <CardHeader>
            <CardTitle>{t.achievements}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dynamicAchievements.map(a => (
                <div
                  key={a.id}
                  className={`border p-4 rounded-xl flex flex-col items-center text-center transition-all ${
                    a.unlocked
                      ? 'bg-green-50/40 border-green-200 shadow-xs'
                      : 'bg-gray-50/50 border-gray-200 opacity-80'
                  }`}
                >
                  {a.unlocked ? (
                    <CheckCircle2 className="text-green-600 mb-2" size={26} />
                  ) : (
                    <Lock className="text-gray-400 mb-2" size={26} />
                  )}
                  <p className="font-bold text-sm">
                    {language === 'ENG' ? a.titleEng : a.titleBm}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ENG' ? a.descEng : a.descBm}
                  </p>
                  <Badge
                    variant={a.unlocked ? 'default' : 'secondary'}
                    className={`mt-3 text-xs ${
                      a.unlocked ? 'bg-green-600 text-white' : ''
                    }`}
                  >
                    {a.unlocked ? t.unlocked : t.locked}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. SETTINGS */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>{t.darkMode}</Label>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex justify-between items-center">
              <Label>{t.language}</Label>
              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                {language === 'ENG' ? 'English (Switch to BM)' : 'Bahasa Melayu (Tukar ke ENG)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
