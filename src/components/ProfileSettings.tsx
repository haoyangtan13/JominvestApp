import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArrowLeft, Edit, Trophy, Lock, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
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
    id: 'streak-5',
    titleEng: '5-Day Streak',
    titleBm: 'Berturut-turut 5 Hari',
    descEng: 'Logged in for 5 consecutive days',
    descBm: 'Log masuk selama 5 hari berturut-turut',
    unlocked: false,
  },
  {
    id: 'learned-3',
    titleEng: 'Learned 3 New Terms',
    titleBm: 'Belajar 3 Istilah Baru',
    descEng: 'Used Jargon Buster 3 times',
    descBm: 'Gunakan Jargon Buster 3 kali',
    unlocked: false,
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
    id: 'ai-expert',
    titleEng: 'AI Expert',
    titleBm: 'Pakar AI',
    descEng: 'Used AI recommendations 10 times',
    descBm: 'Gunakan cadangan AI 10 kali',
    unlocked: false,
  },
  {
    id: 'educator',
    titleEng: 'Educator',
    titleBm: 'Pendidik',
    descEng: 'Completed 5 educational articles',
    descBm: 'Selesai 5 artikel pendidikan',
    unlocked: false,
  },
];

export function ProfileSettings({ navigateTo, userProfile, language, toggleLanguage }: ProfileSettingsProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Profile & Settings',
      profileCard: 'Profile',
      name: 'Tan Hao Yang',
      email: 'tan@email.com',
      edit: 'Edit',
      investorProfile: 'My Investor Profile',
      retakeQuestionnaire: 'Re-take Risk Questionnaire',
      achievements: 'Achievements',
      achievementsDesc: 'Unlock badges as you learn and grow',
      unlocked: 'Unlocked',
      locked: 'Locked',
      settings: 'Settings',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Switch to dark theme',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Receive updates and alerts',
      language: 'Language',
      languageDesc: 'English / Bahasa Melayu',
    },
    BM: {
      back: 'Kembali ke Dashboard',
      title: 'Profil & Tetapan',
      profileCard: 'Profil',
      name: 'Tan Hao Yang',
      email: 'tan@email.com',
      edit: 'Edit',
      investorProfile: 'Profil Pelabur Saya',
      retakeQuestionnaire: 'Ambil Semula Soal Selidik Risiko',
      achievements: 'Pencapaian',
      achievementsDesc: 'Buka lencana semasa anda belajar dan berkembang',
      unlocked: 'Dibuka',
      locked: 'Dikunci',
      settings: 'Tetapan',
      darkMode: 'Mod Gelap',
      darkModeDesc: 'Tukar ke tema gelap',
      pushNotifications: 'Pemberitahuan Push',
      pushNotificationsDesc: 'Terima kemas kini dan amaran',
      language: 'Bahasa',
      languageDesc: 'English / Bahasa Melayu',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50">
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
        {/* Page Title */}
        <div>
          <h1 className="text-3xl mb-2">{t.title}</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.profileCard}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-xl">
                  TH
                </div>
                <div>
                  <p className="text-lg">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.email}</p>
                </div>
              </div>
              <Button variant="outline">
                <Edit size={16} className="mr-2" />
                {t.edit}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investor Profile Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              {t.investorProfile}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'ENG' ? 'Current Profile:' : 'Profil Semasa:'}
              </p>
              <Badge className="bg-green-600 text-white text-base px-4 py-2">
                {userProfile || 'Jom-Explorer (Aggressive)'}
              </Badge>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigateTo('questionnaire')}
            >
              {t.retakeQuestionnaire}
            </Button>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              {t.achievements}
            </CardTitle>
            <CardDescription>{t.achievementsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    {achievement.unlocked ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-white" size={32} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <Lock className="text-gray-500" size={32} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm mb-1">
                    {language === 'ENG' ? achievement.titleEng : achievement.titleBm}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'ENG' ? achievement.descEng : achievement.descBm}
                  </p>
                  <Badge 
                    variant={achievement.unlocked ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {achievement.unlocked ? t.unlocked : t.locked}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-base">{t.darkMode}</Label>
                <p className="text-sm text-gray-500">{t.darkModeDesc}</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">{t.pushNotifications}</Label>
                <p className="text-sm text-gray-500">{t.pushNotificationsDesc}</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{t.language}</Label>
                <p className="text-sm text-gray-500">{t.languageDesc}</p>
              </div>
              <Button variant="outline" onClick={toggleLanguage}>
                {language === 'ENG' ? 'English' : 'Bahasa Melayu'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
