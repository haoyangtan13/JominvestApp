import { useState, useMemo } from 'react';
import { Plus, RotateCcw, RefreshCw, Save, Edit3, Check } from 'lucide-react';
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
      title: 'Account & Preferences',
      editBtn: 'Edit Profile',
      saveBtn: 'Save Changes',
      retakeMandate: 'Retake Investor Style Quiz',
      walletTitle: 'Practice Cash Wallet',
      walletDesc:
        'Add RM 5,000 in virtual practice cash anytime, or reset your practice portfolio back to RM 10,000.00.',
      creditBtn: '+ Add RM 5,000 Cash',
      resetBtn: 'Reset Practice Account',
      milestonesTitle: 'Learning Milestones',
      prefsTitle: 'Display & Language',
      themeLabel: 'Appearance',
      langLabel: 'Language'
    },
    BM: {
      title: 'Akaun & Tetapan',
      editBtn: 'Kemas Kini Profil',
      saveBtn: 'Simpan Perubahan',
      retakeMandate: 'Ambil Semula Kuiz Gaya Pelabur',
      walletTitle: 'Dompet Tunai Latihan',
      walletDesc:
        'Tambah RM 5,000 tunai latihan pada bila-bila masa, atau tetapkan semula akaun ke RM 10,000.00.',
      creditBtn: '+ Tambah RM 5,000 Tunai',
      resetBtn: 'Tetapkan Semula Akaun',
      milestonesTitle: 'Pencapaian Pembelajaran',
      prefsTitle: 'Paparan & Bahasa',
      themeLabel: 'Tema',
      langLabel: 'Bahasa'
    }
  };

  const t = texts[language];

  const initials = useMemo(() => {
    const parts = (userName || 'TH').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (userName || 'TH').slice(0, 2).toUpperCase();
  }, [userName]);

  const holdingsValue = useMemo(() => {
    return portfolio.reduce(
      (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
      0
    );
  }, [portfolio]);

  const totalNetLiquidity = holdingsValue + cashBalance;

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

  const dynamicMilestones = useMemo(
    () => [
      {
        code: 'Step 1',
        titleEng: 'First Practice Investment',
        titleBm: 'Pelaburan Latihan Pertama',
        descEng: `Place at least 1 practice buy or sell order on Bursa Malaysia (${tradeHistory.length} completed).`,
        descBm: `Lakukan sekurang-kurangnya 1 pesanan belian atau jualan latihan di Bursa Malaysia (${tradeHistory.length} selesai).`,
        unlocked: tradeHistory.length > 0 || portfolio.length > 0
      },
      {
        code: 'Step 2',
        titleEng: 'Putting Your Cash to Work',
        titleBm: 'Mengembangkan Modal Latihan',
        descEng: `Invest RM 2,000+ in stocks or grow your total portfolio above RM 10,500 (Invested: RM ${holdingsValue.toFixed(2)}).`,
        descBm: `Laburkan RM 2,000+ dalam saham atau kembangkan nilai portfolio melebihi RM 10,500 (Dilabur: RM ${holdingsValue.toFixed(2)}).`,
        unlocked: holdingsValue >= 2000 || totalNetLiquidity > 10500
      },
      {
        code: 'Step 3',
        titleEng: 'Key Metric Explorer',
        titleBm: 'Peneroka Metrik Utama',
        descEng: `Tap and learn at least 3 financial terms on any Stock page (${hasLearnedTerm.length} / 3 learned).`,
        descBm: `Tekan dan pelajari sekurang-kurangnya 3 istilah kewangan di halaman Saham (${hasLearnedTerm.length} / 3 dipelajari).`,
        unlocked: hasLearnedTerm.length >= 3
      },
      {
        code: 'Step 4',
        titleEng: 'Well-Diversified Builder',
        titleBm: 'Pembina Portfolio Pelbagai Sektor',
        descEng: `Spread your investments across 3 or more different Bursa industries (${uniqueSectorsCount} / 3 sectors).`,
        descBm: `Agihkan pelaburan anda merentasi 3 atau lebih sektor Bursa Malaysia (${uniqueSectorsCount} / 3 sektor).`,
        unlocked: uniqueSectorsCount >= 3
      },
      {
        code: 'Step 5',
        titleEng: 'Shariah & Passive Income Mix',
        titleBm: 'Gabungan Syariah & Pendapatan Pasif',
        descEng:
          'Own at least 1 Shariah-compliant stock alongside 1 dividend stock paying over 4.0% per year.',
        descBm:
          'Miliki sekurang-kurangnya 1 saham patuh Syariah bersama 1 saham dividen yang membayar lebih 4.0% setahun.',
        unlocked: hasShariahAndDividend
      }
    ],
    [
      tradeHistory.length,
      portfolio.length,
      holdingsValue,
      totalNetLiquidity,
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
        language === 'ENG'
          ? 'Your profile details have been saved.'
          : 'Butiran profil anda telah disimpan.'
      );
    } else {
      setDraftName(userName);
      setDraftEmail(userEmail);
      setIsEditing(true);
    }
  };

  const xpForNextLevel = 100;
  const safeXP = Number(userXP) || 0;
  const safeLevel = Number(userLevel) || 1;
  const currentLevelXP = safeXP % xpForNextLevel;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;
  const unlockedCount = dynamicMilestones.filter(m => m.unlocked).length;

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rh-page space-y-8">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      <div className="rh-split">
        {/* Left Main Column */}
        <div className="rh-main space-y-6">
          {/* Personal Profile Card */}
          <div className="rh-card space-y-6">
            <div
              className="flex items-center justify-between gap-4 pb-4 border-b"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-3.5">
                <div className="jom-avatar jom-avatar-lg jom-avatar-emerald">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{userName}</h2>
                  <div className="text-xs font-tabular" style={{ color: 'var(--ink-secondary)' }}>
                    {userProfile} · Level {safeLevel} ({safeXP} XP)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleEdit}
                className={`jom-btn text-xs ${isEditing ? 'jom-btn-primary' : ''}`}
              >
                {isEditing ? (
                  <>
                    <Save size={13} />
                    <span>{t.saveBtn}</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={13} />
                    <span>{t.editBtn}</span>
                  </>
                )}
              </button>
            </div>

            <div className="rh-grid-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Name' : 'Nama Penuh'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="jom-input"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    placeholder="Full Name"
                  />
                ) : (
                  <div
                    className="px-3.5 py-2.5 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    {userName}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold block" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Email' : 'E-mel'}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="jom-input"
                    value={draftEmail}
                    onChange={e => setDraftEmail(e.target.value)}
                    placeholder="Email Address"
                  />
                ) : (
                  <div
                    className="px-3.5 py-2.5 rounded-xl text-sm font-tabular"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    {userEmail}
                  </div>
                )}
              </div>
            </div>

            <div
              className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Investor Style:' : 'Gaya Pelabur:'}{' '}
                <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                  {userProfile}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('questionnaire')}
                className="jom-btn text-xs"
              >
                <RefreshCw size={12} />
                <span>{t.retakeMandate}</span>
              </button>
            </div>
          </div>

          {/* Learning Milestones */}
          <div className="rh-card space-y-5">
            <div
              className="pb-4 border-b flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <h2 className="text-lg font-bold">{t.milestonesTitle}</h2>
              <span className="text-xs font-tabular font-semibold" style={{ color: 'var(--accent-brand)' }}>
                {unlockedCount} / {dynamicMilestones.length}{' '}
                {language === 'ENG' ? 'Completed' : 'Selesai'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-tabular">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  Level {safeLevel} Progress
                </span>
                <span className="font-semibold">
                  {currentLevelXP} / {xpForNextLevel} XP
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: 'var(--accent-brand)'
                  }}
                />
              </div>
            </div>

            <div className="rh-grid-2">
              {dynamicMilestones.map(m => (
                <div
                  key={m.code}
                  className="p-4 rounded-xl space-y-1.5"
                  style={{
                    border: m.unlocked
                      ? '1px solid var(--accent-brand)'
                      : '1px solid var(--border-hairline)',
                    backgroundColor: m.unlocked ? 'var(--accent-brand-subtle)' : 'var(--bg-subtle)'
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-tabular">
                    <span style={{ color: 'var(--ink-muted)' }}>{m.code}</span>
                    {m.unlocked ? (
                      <span
                        className="font-semibold flex items-center gap-1"
                        style={{ color: 'var(--signal-up)' }}
                      >
                        <Check size={12} />
                        <span>{language === 'ENG' ? 'Unlocked' : 'Dicapai'}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ink-muted)' }}>
                        {language === 'ENG' ? 'In Progress' : 'Dalam Proses'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm">
                    {language === 'ENG' ? m.titleEng : m.titleBm}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                    {language === 'ENG' ? m.descEng : m.descBm}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <aside className="rh-rail space-y-4">
          {/* Practice Cash Wallet Card */}
          <div className="rh-card space-y-4">
            <h2 className="text-base font-bold">{t.walletTitle}</h2>

            <div className="space-y-1 font-tabular">
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Available Practice Cash' : 'Tunai Latihan Tersedia'}
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--signal-up)' }}>
                RM {formatRM(cashBalance)}
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                {language === 'ENG' ? 'Total Portfolio:' : 'Jumlah Portfolio:'} RM{' '}
                {formatRM(totalNetLiquidity)}
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.walletDesc}
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onTopUpCash(5000)}
                className="jom-btn jom-btn-primary w-full text-xs"
              >
                <Plus size={14} />
                <span>{t.creditBtn}</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="jom-btn w-full text-xs"
              >
                <RotateCcw size={13} />
                <span>{t.resetBtn}</span>
              </button>
            </div>
          </div>

          {/* Display & Language Preferences Card */}
          <div className="rh-card space-y-4">
            <h2 className="text-base font-bold">{t.prefsTitle}</h2>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {t.themeLabel}
              </span>
              <div className="jom-segmented">
                <button
                  type="button"
                  className={!darkMode ? 'active' : ''}
                  onClick={() => setDarkMode(false)}
                >
                  {language === 'ENG' ? 'Light' : 'Cerah'}
                </button>
                <button
                  type="button"
                  className={darkMode ? 'active' : ''}
                  onClick={() => setDarkMode(true)}
                >
                  {language === 'ENG' ? 'Dark' : 'Gelap'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {t.langLabel}
              </span>
              <div className="jom-segmented">
                <button
                  type="button"
                  className={language === 'ENG' ? 'active' : ''}
                  onClick={() => {
                    if (language !== 'ENG') toggleLanguage();
                  }}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={language === 'BM' ? 'active' : ''}
                  onClick={() => {
                    if (language !== 'BM') toggleLanguage();
                  }}
                >
                  BM
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
