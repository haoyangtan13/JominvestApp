import { useState, useMemo } from 'react';
import { Plus, RotateCcw, RefreshCw, Save, Edit3 } from 'lucide-react';
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
      kicker: 'ACCOUNT & MANDATE LEDGER',
      title: 'Investor Identity, Capital Controls & Analyst Milestones',
      subtitle:
        'Manage your investment risk mandate, simulated Bursa Malaysia practice capital, workspace preferences, and verified analyst milestones.',
      editBtn: 'Edit Account Details',
      saveBtn: 'Save Account Details',
      retakeMandate: 'Retake Risk Mandate Assessment',
      capitalKicker: 'PRACTICE CAPITAL CONTROLS',
      capitalTitle: 'Simulated Bursa Clearing Account',
      capitalDesc:
        'Credit additional practice liquidity or reset your position ledger and contract note history back to the RM 10,000.00 opening balance.',
      creditBtn: '+ Credit RM 5,000',
      resetBtn: 'Reset Account',
      milestonesKicker: 'ACCREDITATION & TELEMETRY',
      milestonesTitle: 'Analyst Milestones & Verification',
      colCode: 'Code',
      colMilestone: 'Milestone',
      colCriteria: 'Verification Criteria & Live Telemetry',
      colStatus: 'Standing',
      prefsKicker: 'WORKSPACE PREFERENCES',
      prefsTitle: 'Display & Localization',
      themeLabel: 'Color Palette',
      langLabel: 'Interface Language'
    },
    BM: {
      kicker: 'LEJAR AKAUN & MANDAT',
      title: 'Identiti Pelabur, Kawalan Modal & Pencapaian Penganalisis',
      subtitle:
        'Urus mandat risiko pelaburan anda, modal latihan simulasi Bursa Malaysia, tetapan ruang kerja, dan pencapaian penganalisis.',
      editBtn: 'kemas Kini Butiran',
      saveBtn: 'Simpan Butiran Akaun',
      retakeMandate: 'Ambil Semula Penilaian Mandat Risiko',
      capitalKicker: 'KAWALAN MODAL LATIHAN',
      capitalTitle: 'Akaun Penjelasan Simulasi Bursa',
      capitalDesc:
        'Kreditkan kecairan latihan tambahan atau tetapkan semula lejar posisi dan sejarah nota kontrak kepada baki permulaan RM 10,000.00.',
      creditBtn: '+ Kredit RM 5,000',
      resetBtn: 'Tetapkan Semula Akaun',
      milestonesKicker: 'AKREDITASI & TELEMETRI',
      milestonesTitle: 'Pencapaian & Pengesahan Penganalisis',
      colCode: 'Kod',
      colMilestone: 'Pencapaian',
      colCriteria: 'Kriteria Pengesahan & Telemetri Semasa',
      colStatus: 'Status',
      prefsKicker: 'TETAPAN RUANG KERJA',
      prefsTitle: 'Paparan & Bahasa',
      themeLabel: 'Tema Warna',
      langLabel: 'Bahasa Antara Muka'
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
        code: 'MS-01',
        titleEng: 'Initial Order Execution',
        titleBm: 'Pelaksanaan Pesanan Pertama',
        descEng: `Execute at least 1 simulated contract note on Bursa Malaysia (${tradeHistory.length} contract note(s) logged).`,
        descBm: `Laksanakan sekurang-kurangnya 1 nota kontrak simulasi di Bursa Malaysia (${tradeHistory.length} nota kontrak direkodkan).`,
        unlocked: tradeHistory.length > 0 || portfolio.length > 0
      },
      {
        code: 'MS-02',
        titleEng: 'Capital Deployment & Equity Growth',
        titleBm: 'Peruntukan Modal & Pertumbuhan Ekuiti',
        descEng: `Maintain RM 2,000+ in active equity holdings or exceed RM 10,500 net liquidity (Holdings: RM ${holdingsValue.toFixed(2)} | Net Liquidity: RM ${totalNetLiquidity.toFixed(2)}).`,
        descBm: `Pegang RM 2,000+ dalam saham aktif atau melebihi kecairan bersih RM 10,500 (Pegangan: RM ${holdingsValue.toFixed(2)}).`,
        unlocked: holdingsValue >= 2000 || totalNetLiquidity > 10500
      },
      {
        code: 'MS-03',
        titleEng: 'Lexicon & Factor Mastery',
        titleBm: 'Penguasaan Istilah & Faktor Kewangan',
        descEng: `Master at least 3 financial valuation terms in the Equity Terminal (${hasLearnedTerm.length} / 3 terms verified).`,
        descBm: `Kuasai sekurang-kurangnya 3 istilah penilaian kewangan di Terminal Ekuiti (${hasLearnedTerm.length} / 3 istilah disahkan).`,
        unlocked: hasLearnedTerm.length >= 3
      },
      {
        code: 'MS-04',
        titleEng: 'Multi-Sector Diversification',
        titleBm: 'Kepelbagaian Pelbagai Sektor',
        descEng: `Allocate equity capital across 3 or more uncorrelated Bursa Malaysia sectors (${uniqueSectorsCount} / 3 sectors active).`,
        descBm: `Agihkan modal ekuiti merentasi 3 atau lebih sektor Bursa Malaysia (${uniqueSectorsCount} / 3 sektor aktif).`,
        unlocked: uniqueSectorsCount >= 3
      },
      {
        code: 'MS-05',
        titleEng: 'SAC Shariah & Yield Mandate',
        titleBm: 'Mandat Syariah MPS & Hasil Dividen',
        descEng:
          'Hold at least 1 SAC Shariah-compliant security alongside 1 security yielding >4.0% p.a.',
        descBm:
          'Pegang sekurang-kurangnya 1 sekuriti patuh Syariah MPS dan 1 sekuriti dengan hasil dividen >4.0% setahun.',
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
          ? 'Investor account details updated.'
          : 'Butiran akaun pelabur dikemas kini.'
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
      {/* Editorial Header */}
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

      {/* 4-Cell Account & Tier Telemetry Strip */}
      <div className="jom-ledger-strip">
        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">ANALYST TIER</div>
          <div className="font-tabular text-2xl font-semibold">
            LEVEL 0{safeLevel}
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: 'var(--accent-brand)'
              }}
            />
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">ACCUMULATED XP</div>
          <div className="font-tabular text-2xl font-semibold">{safeXP} XP</div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {currentLevelXP} / {xpForNextLevel} XP to Level 0{safeLevel + 1}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">TOTAL NET LIQUIDITY</div>
          <div className="font-tabular text-2xl font-semibold">
            RM {formatRM(totalNetLiquidity)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            Holdings: RM {formatRM(holdingsValue)}
          </div>
        </div>

        <div className="jom-ledger-cell space-y-1.5">
          <div className="jom-kicker">AVAILABLE BUYING POWER</div>
          <div
            className="font-tabular text-2xl font-semibold"
            style={{ color: 'var(--signal-up)' }}
          >
            RM {formatRM(cashBalance)}
          </div>
          <div className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
            {tradeHistory.length} contract note(s) settled
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Account Mandate + Practice Capital Controls */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left 7 cols: Investor Identity & Mandate */}
        <section className="md:col-span-7 jom-panel p-6 flex flex-col justify-between space-y-6">
          <div
            className="flex items-start justify-between gap-4 pb-4 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-md flex items-center justify-center font-tabular text-sm font-semibold border shrink-0"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                {initials}
              </div>
              <div>
                <div className="jom-kicker">PRIMARY ACCOUNT HOLDER</div>
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
              <label className="jom-kicker block">FULL NAME</label>
              {isEditing ? (
                <input
                  type="text"
                  className="jom-input"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="Full Name"
                />
              ) : (
                <div className="jom-panel-subtle px-3.5 py-2 text-sm font-medium">
                  {userName}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="jom-kicker block">REGISTERED EMAIL</label>
              {isEditing ? (
                <input
                  type="email"
                  className="jom-input"
                  value={draftEmail}
                  onChange={e => setDraftEmail(e.target.value)}
                  placeholder="Email Address"
                />
              ) : (
                <div className="jom-panel-subtle px-3.5 py-2 text-sm font-tabular">
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
              <div className="jom-kicker">ASSIGNED RISK MANDATE</div>
              <div className="flex items-center gap-2">
                <span className="jom-tag jom-tag-shariah">{userProfile}</span>
                <span className="font-tabular text-xs" style={{ color: 'var(--ink-muted)' }}>
                  KLSE Practice CDS
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

        {/* Right 5 cols: Practice Capital Controls & Workspace Preferences */}
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

          {/* Workspace Preferences */}
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
                  ALABASTER (LIGHT)
                </button>
                <button
                  type="button"
                  className={darkMode ? 'active' : ''}
                  onClick={() => setDarkMode(true)}
                >
                  OBSIDIAN (DARK)
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
                  ENGLISH
                </button>
                <button
                  type="button"
                  className={language === 'BM' ? 'active' : ''}
                  onClick={() => {
                    if (language !== 'BM') toggleLanguage();
                  }}
                >
                  BAHASA MELAYU
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 5-Row Institutional Analyst Milestones & Verification Table */}
      <section className="jom-panel overflow-hidden">
        <div
          className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <div className="jom-kicker">{t.milestonesKicker}</div>
            <h2 className="font-editorial text-2xl mt-0.5">{t.milestonesTitle}</h2>
          </div>
          <span className="jom-tag font-tabular">
            {unlockedCount} / {dynamicMilestones.length} VERIFIED
          </span>
        </div>

        <div className="jom-table-wrap">
          <table className="jom-table">
            <thead>
              <tr>
                <th>{t.colCode}</th>
                <th>{t.colMilestone}</th>
                <th>{t.colCriteria}</th>
                <th className="text-right">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {dynamicMilestones.map(m => (
                <tr key={m.code} style={{ cursor: 'default' }}>
                  <td className="font-tabular font-semibold whitespace-nowrap">{m.code}</td>
                  <td className="font-semibold whitespace-nowrap">
                    {language === 'ENG' ? m.titleEng : m.titleBm}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                    {language === 'ENG' ? m.descEng : m.descBm}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {m.unlocked ? (
                      <span className="jom-tag jom-tag-up">UNLOCKED</span>
                    ) : (
                      <span className="jom-tag">PENDING</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
