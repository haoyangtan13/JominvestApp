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
      kicker: 'Profile, Wallet & Preferences',
      title: 'Your Investor Profile & Learning Milestones',
      subtitle:
        'Manage your personal investor style, top up your practice cash wallet, and track your Bursa learning milestones.',
      editBtn: 'Edit Profile',
      saveBtn: 'Save Changes',
      retakeMandate: 'Retake Investor Style Quiz',
      capitalKicker: 'Virtual Wallet',
      capitalTitle: 'Practice Cash Wallet Top-Up',
      capitalDesc:
        'Add RM 5,000 in virtual practice cash anytime to test new investment ideas, or reset your demo portfolio back to RM 10,000.00.',
      creditBtn: '+ Add RM 5,000 Cash',
      resetBtn: 'Reset Practice Account',
      milestonesKicker: 'Your Learning Journey',
      milestonesTitle: 'Investor Learning Milestones',
      prefsKicker: 'App Appearance & Language',
      prefsTitle: 'Display & Language Settings',
      themeLabel: 'Appearance',
      langLabel: 'App Language'
    },
    BM: {
      kicker: 'Profil, Dompet & Tetapan',
      title: 'Profil Pelabur & Pencapaian Pembelajaran Anda',
      subtitle:
        'Urus gaya pelaburan anda, tambah nilai dompet tunai latihan, dan jejak pencapaian pembelajaran Bursa anda.',
      editBtn: 'Kemas Kini Profil',
      saveBtn: 'Simpan Perubahan',
      retakeMandate: 'Ambil Semula Kuiz Gaya Pelabur',
      capitalKicker: 'Dompet Maya',
      capitalTitle: 'Tambah Nilai Dompet Tunai Latihan',
      capitalDesc:
        'Tambah RM 5,000 tunai latihan pada bila-bila masa untuk mencuba idea pelaburan baharu, atau tetapkan semula akaun ke RM 10,000.00.',
      creditBtn: '+ Tambah RM 5,000 Tunai',
      resetBtn: 'Tetapkan Semula Akaun',
      milestonesKicker: 'Perjalanan Pembelajaran Anda',
      milestonesTitle: 'Pencapaian Pembelajaran Pelabur',
      prefsKicker: 'Paparan & Bahasa Aplikasi',
      prefsTitle: 'Tetapan Paparan & Bahasa',
      themeLabel: 'Tema Paparan',
      langLabel: 'Bahasa Aplikasi'
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
        descEng: `Place at least 1 practice buy or sell order on Bursa Malaysia (${tradeHistory.length} trade(s) completed).`,
        descBm: `Lakukan sekurang-kurangnya 1 pesanan belian atau jualan latihan di Bursa Malaysia (${tradeHistory.length} dagangan selesai).`,
        unlocked: tradeHistory.length > 0 || portfolio.length > 0
      },
      {
        code: 'Step 2',
        titleEng: 'Putting Your Cash to Work',
        titleBm: 'Mengembangkan Modal Latihan',
        descEng: `Invest RM 2,000+ in stocks or grow your total portfolio above RM 10,500 (Currently invested: RM ${holdingsValue.toFixed(2)}).`,
        descBm: `Laburkan RM 2,000+ dalam saham atau kembangkan nilai portfolio melebihi RM 10,500 (Dilabur: RM ${holdingsValue.toFixed(2)}).`,
        unlocked: holdingsValue >= 2000 || totalNetLiquidity > 10500
      },
      {
        code: 'Step 3',
        titleEng: 'Key Metric Explorer',
        titleBm: 'Peneroka Metrik Utama',
        descEng: `Tap and learn at least 3 financial terms on any Stock Overview page (${hasLearnedTerm.length} / 3 terms learned).`,
        descBm: `Tekan dan pelajari sekurang-kurangnya 3 istilah kewangan di halaman Gambaran Saham (${hasLearnedTerm.length} / 3 istilah dipelajari).`,
        unlocked: hasLearnedTerm.length >= 3
      },
      {
        code: 'Step 4',
        titleEng: 'Well-Diversified Builder',
        titleBm: 'Pembina Portfolio Pelbagai Sektor',
        descEng: `Spread your investments across 3 or more different Bursa industries (${uniqueSectorsCount} / 3 sectors owned).`,
        descBm: `Agihkan pelaburan anda merentasi 3 atau lebih sektor Bursa Malaysia (${uniqueSectorsCount} / 3 sektor dimiliki).`,
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
    <div className="jom-container space-y-8">
      {/* Friendly Consumer Header */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="space-y-1.5">
          <div className="jom-kicker">{t.kicker}</div>
          <h1 className="font-editorial text-4xl">{t.title}</h1>
          <p className="text-sm max-w-2xl" style={{ color: 'var(--ink-secondary)' }}>
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('questionnaire')}
            className="jom-btn"
          >
            <RefreshCw size={13} />
            <span>{t.retakeMandate}</span>
          </button>
        </div>
      </div>

      {/* 4-Card Learning & Account Summary Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">
            {language === 'ENG' ? 'Learning Level' : 'Tahap Pembelajaran'}
          </div>
          <div className="font-tabular text-2xl font-semibold">
            Level {safeLevel}
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
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

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">
            {language === 'ENG' ? 'Total Learning XP' : 'Jumlah XP Pembelajaran'}
          </div>
          <div className="font-tabular text-2xl font-semibold">{safeXP} XP</div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {currentLevelXP} / {xpForNextLevel} XP to Level {safeLevel + 1}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">
            {language === 'ENG' ? 'Total Portfolio Value' : 'Jumlah Nilai Portfolio'}
          </div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(totalNetLiquidity)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {language === 'ENG' ? 'Invested in stocks' : 'Dilabur dalam saham'}: RM{' '}
            {formatRM(holdingsValue)}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">
            {language === 'ENG' ? 'Practice Cash Available' : 'Tunai Latihan Tersedia'}
          </div>
          <div
            className="font-tabular text-2xl font-semibold"
            style={{ color: 'var(--signal-up)' }}
          >
            RM {formatRM(cashBalance)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {tradeHistory.length}{' '}
            {language === 'ENG' ? 'practice trade(s) completed' : 'dagangan latihan selesai'}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Investor Profile + Practice Cash Wallet */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left 7 cols: Personal Profile & Investor Style */}
        <section className="md:col-span-7 jom-panel p-6 flex flex-col justify-between space-y-6">
          <div
            className="flex items-start justify-between gap-4 pb-4 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="jom-avatar jom-avatar-lg jom-avatar-emerald">
                {initials}
              </div>
              <div>
                <div className="jom-kicker">
                  {language === 'ENG' ? 'Investor Profile' : 'Profil Pelabur'}
                </div>
                <h2 className="font-editorial text-2xl">{userName}</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleEdit}
              className={`jom-btn ${isEditing ? 'jom-btn-primary' : ''}`}
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="jom-kicker block">
                {language === 'ENG' ? 'Your Name' : 'Nama Penuh'}
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
                <div className="jom-panel-subtle px-3.5 py-2.5 text-sm font-medium">
                  {userName}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="jom-kicker block">
                {language === 'ENG' ? 'Email Address' : 'Alamat E-mel'}
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
                <div className="jom-panel-subtle px-3.5 py-2.5 text-sm font-tabular">
                  {userEmail}
                </div>
              )}
            </div>
          </div>

          <div
            className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="space-y-1">
              <div className="jom-kicker">
                {language === 'ENG' ? 'Your Investor Style' : 'Gaya Pelaburan Anda'}
              </div>
              <div className="flex items-center gap-2">
                <span className="jom-tag jom-tag-shariah">{userProfile}</span>
                <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {language === 'ENG' ? 'Bursa Practice Account' : 'Akaun Latihan Bursa'}
                </span>
              </div>
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
        </section>

        {/* Right 5 cols: Practice Cash Wallet Top-Up & App Preferences */}
        <section className="md:col-span-5 jom-panel p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div
              className="pb-4 border-b"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="jom-kicker">{t.capitalKicker}</div>
              <h2 className="font-editorial text-2xl mt-0.5">{t.capitalTitle}</h2>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                {t.capitalDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onTopUpCash(5000)}
                className="jom-btn jom-btn-primary flex-1"
              >
                <Plus size={14} />
                <span>{t.creditBtn}</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="jom-btn jom-btn-danger"
              >
                <RotateCcw size={13} />
                <span>{t.resetBtn}</span>
              </button>
            </div>
          </div>

          {/* App Preferences */}
          <div
            className="pt-5 border-t space-y-3"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="jom-kicker">{t.prefsKicker}</div>

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
                  English
                </button>
                <button
                  type="button"
                  className={language === 'BM' ? 'active' : ''}
                  onClick={() => {
                    if (language !== 'BM') toggleLanguage();
                  }}
                >
                  Bahasa Melayu
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Friendly Learning Milestones Section */}
      <section className="jom-panel p-6 space-y-5">
        <div
          className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <div className="jom-kicker">{t.milestonesKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.milestonesTitle}</h2>
          </div>
          <span className="jom-tag jom-tag-shariah font-tabular">
            {unlockedCount} / {dynamicMilestones.length}{' '}
            {language === 'ENG' ? 'Completed' : 'Selesai'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicMilestones.map(m => (
            <div
              key={m.code}
              className="jom-panel-subtle p-4 flex flex-col justify-between space-y-3"
              style={{
                border: m.unlocked
                  ? '1px solid var(--accent-brand)'
                  : '1px solid var(--border-hairline)',
                backgroundColor: m.unlocked ? 'var(--accent-brand-subtle)' : 'var(--bg-subtle)'
              }}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="jom-kicker">{m.code}</span>
                  {m.unlocked ? (
                    <span className="jom-tag jom-tag-up flex items-center gap-1">
                      <Check size={11} />
                      <span>{language === 'ENG' ? 'Unlocked' : 'Dicapai'}</span>
                    </span>
                  ) : (
                    <span className="jom-tag">
                      {language === 'ENG' ? 'In Progress' : 'Dalam Proses'}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm">
                  {language === 'ENG' ? m.titleEng : m.titleBm}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? m.descEng : m.descBm}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
