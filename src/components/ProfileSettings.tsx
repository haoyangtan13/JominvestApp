import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ArrowLeft, Edit, Trophy, Lock, CheckCircle2, TrendingUp, Save, CreditCard, Plus } from 'lucide-react';
import type { Screen } from '../App';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
  userXP: number;
  userLevel: number;
}

const achievements = [
  {
    id: 'first-trade',
    titleEng: 'First Simulated Trade',
    titleBm: 'Dagangan Simulasi Pertama',
    descEng: 'Made your first practice trade',
    descBm: 'Buat dagangan latihan pertama',
    unlocked: true,
  },
  {
    id: 'portfolio-10k',
    titleEng: 'Portfolio Hit RM 10K',
    titleBm: 'Portfolio Capai RM 10K',
    descEng: 'Grew portfolio to RM 10,000',
    descBm: 'Portfolio berkembang ke RM 10,000',
    unlocked: true,
  },
  {
    id: 'learned-3',
    titleEng: 'Learned 3 New Terms',
    titleBm: 'Belajar 3 Istilah Baru',
    descEng: 'Used Jargon Buster 3 times',
    descBm: 'Gunakan Jargon Buster 3 kali',
    unlocked: false,
  },
];

export function ProfileSettings({ navigateTo, userProfile, language, toggleLanguage, userXP, userLevel }: ProfileSettingsProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Tan Hao Yang');
  const [email, setEmail] = useState('tan@email.com');

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Profile & Settings',
      profileCard: 'Profile',
      edit: 'Edit',
      save: 'Save',
      learningJourney: 'Learning Journey',
      noviceInvestor: 'Novice Investor',
      level: 'Level',
      xp: 'XP',
      nextLevel: 'Next Level',
      achievements: 'Achievements',
      settings: 'Settings',
      darkMode: 'Dark Mode',
      language: 'Language',
    },
    BM: {
      back: 'Kembali ke Dashboard',
      title: 'Profil & Tetapan',
      profileCard: 'Profil',
      edit: 'Edit',
      save: 'Simpan',
      learningJourney: 'Perjalanan Pembelajaran',
      noviceInvestor: 'Pelabur Baru',
      level: 'Tahap',
      xp: 'XP',
      nextLevel: 'Tahap Seterusnya',
      achievements: 'Pencapaian',
      settings: 'Tetapan',
      darkMode: 'Mod Gelap',
      language: 'Bahasa',
    }
  };

  const t = texts[language];

  // Safe Math
  const xpForNextLevel = 100;
  // Ensure userXP is a number
  const safeXP = Number(userXP) || 0;
  const safeLevel = Number(userLevel) || 1;
  const currentLevelXP = safeXP % xpForNextLevel;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>

        {/* 1. PROFILE CARD */}
        <Card>
          <CardHeader><CardTitle>{t.profileCard}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">TH</div>
              <div>
                <p className="text-lg font-bold">{name}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. XP & LEVEL CARD - SIMPLIFIED & ROBUST */}
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
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total XP</p>
                <p className="text-2xl font-bold text-indigo-600">{safeXP}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span>Progress to Level {safeLevel + 1}</span>
              <span>{currentLevelXP} / {xpForNextLevel} XP</span>
            </div>
            {/* Native HTML Progress for Max Compatibility */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Learn terms in Stock Details & buy stocks to earn more!
            </p>
          </CardContent>
        </Card>

        {/* 3. ACHIEVEMENTS */}
        <Card>
          <CardHeader><CardTitle>{t.achievements}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {achievements.map(a => (
                <div key={a.id} className="border p-4 rounded-lg flex flex-col items-center text-center">
                  {a.unlocked ? <CheckCircle2 className="text-green-500 mb-2" /> : <Lock className="text-gray-300 mb-2" />}
                  <p className="font-bold text-sm">{language === 'ENG' ? a.titleEng : a.titleBm}</p>
                  <Badge variant={a.unlocked ? 'default' : 'secondary'} className="mt-2 text-xs">
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. SETTINGS */}
        <Card>
          <CardHeader><CardTitle>{t.settings}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>{t.darkMode}</Label>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex justify-between items-center">
              <Label>{t.language}</Label>
              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                {language === 'ENG' ? 'English' : 'Bahasa Melayu'}
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
