import { useState, useMemo } from 'react';
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
        code: '1',
        titleEng: 'First Practice Order',
        titleBm: 'Pesanan Latihan Pertama',
        descEng: `Place at least 1 buy or sell order (${tradeHistory.length} completed).`,
        descBm: `Lakukan sekurang-kurangnya 1 pesanan belian atau jualan (${tradeHistory.length} selesai).`,
        unlocked: tradeHistory.length > 0 || portfolio.length > 0
      },
      {
        code: '2',
        titleEng: 'Capital Deployed',
        titleBm: 'Modal Dilaburkan',
        descEng: `Invest RM 2,000+ across stocks (Invested: RM ${holdingsValue.toFixed(2)}).`,
        descBm: `Laburkan RM 2,000+ dalam saham (Dilabur: RM ${holdingsValue.toFixed(2)}).`,
        unlocked: holdingsValue >= 2000 || totalNetLiquidity > 10500
      },
      {
        code: '3',
        titleEng: 'Financial Metrics Reviewed',
        titleBm: 'Metrik Kewangan Disemak',
        descEng: `Review 3 financial definitions on stock pages (${hasLearnedTerm.length} / 3).`,
        descBm: `Semak 3 istilah kewangan di halaman saham (${hasLearnedTerm.length} / 3).`,
        unlocked: hasLearnedTerm.length >= 3
      },
      {
        code: '4',
        titleEng: 'Multi-Sector Diversification',
        titleBm: 'Kepelbagaian Sektor',
        descEng: `Hold positions across 3 or more sectors (${uniqueSectorsCount} / 3).`,
        descBm: `Miliki pegangan merentasi 3 atau lebih sektor (${uniqueSectorsCount} / 3).`,
        unlocked: uniqueSectorsCount >= 3
      },
      {
        code: '5',
        titleEng: 'Shariah & Dividend Balance',
        titleBm: 'Imbangan Syariah & Dividen',
        descEng: 'Hold 1 Shariah-compliant stock and 1 stock yielding above 4.0%.',
        descBm: 'Miliki 1 saham patuh Syariah dan 1 saham dengan hasil dividen melebihi 4.0%.',
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
        language === 'ENG' ? 'Profile updated.' : 'Profil dikemas kini.'
      );
    } else {
      setDraftName(userName);
      setDraftEmail(userEmail);
      setIsEditing(true);
    }
  };

  const formatRM = (val: number) =>
    val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rh-page">
      <div className="rh-split">
        {/* Left Main: Profile & Progress */}
        <div className="rh-main space-y-10">
          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h1 className="text-xl font-semibold">
                {language === 'ENG' ? 'Account' : 'Akaun'}
              </h1>
              <button
                type="button"
                onClick={handleToggleEdit}
                className="rh-link-btn"
              >
                {isEditing
                  ? language === 'ENG'
                    ? 'Save changes'
                    : 'Simpan'
                  : language === 'ENG'
                  ? 'Edit profile'
                  : 'Ubah profil'}
              </button>
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Name' : 'Nama'}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    className="jom-input text-xs"
                    style={{ maxWidth: '240px' }}
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                  />
                ) : (
                  <span className="font-medium">{userName}</span>
                )}
              </div>

              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Email' : 'E-mel'}
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    className="jom-input text-xs font-tabular"
                    style={{ maxWidth: '240px' }}
                    value={draftEmail}
                    onChange={e => setDraftEmail(e.target.value)}
                  />
                ) : (
                  <span className="font-tabular">{userEmail}</span>
                )}
              </div>

              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Investor profile' : 'Profil pelabur'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{userProfile}</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('questionnaire')}
                    className="rh-link-btn"
                  >
                    {language === 'ENG' ? 'Retake quiz →' : 'Ulang kuiz →'}
                  </button>
                </div>
              </div>

              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>
                  {language === 'ENG' ? 'Learning progress' : 'Tahap pembelajaran'}
                </span>
                <span className="font-tabular">
                  Level {userLevel || 1} ({userXP || 0} XP)
                </span>
              </div>
            </div>
          </section>

          {/* Checklist Table */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              {language === 'ENG' ? 'Practice Checklist' : 'Senarai Semak Latihan'}
            </h2>

            <div className="jom-table-wrap">
              <table className="jom-table">
                <thead>
                  <tr>
                    <th>Milestone</th>
                    <th>Requirement</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicMilestones.map(m => (
                    <tr key={m.code} style={{ cursor: 'default' }}>
                      <td className="font-medium text-sm">
                        {language === 'ENG' ? m.titleEng : m.titleBm}
                      </td>
                      <td className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                        {language === 'ENG' ? m.descEng : m.descBm}
                      </td>
                      <td className="text-right text-xs font-medium">
                        {m.unlocked ? (
                          <span style={{ color: 'var(--signal-up)' }}>Completed</span>
                        ) : (
                          <span style={{ color: 'var(--ink-muted)' }}>Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Rail: Practice Balance & Preferences */}
        <aside className="rh-rail space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG' ? 'Practice Balance' : 'Baki Latihan'}
            </h3>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Buying power</span>
                <span className="font-tabular font-medium">RM {formatRM(cashBalance)}</span>
              </div>
              <div className="rh-kv-row">
                <span style={{ color: 'var(--ink-secondary)' }}>Total account value</span>
                <span className="font-tabular font-medium">RM {formatRM(totalNetLiquidity)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onTopUpCash(5000)}
                className="jom-btn jom-btn-primary w-full text-xs"
              >
                {language === 'ENG' ? 'Add RM 5,000 practice cash' : 'Tambah RM 5,000 tunai'}
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="jom-btn w-full text-xs"
              >
                {language === 'ENG' ? 'Reset account to RM 10,000' : 'Tetapkan semula ke RM 10,000'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {language === 'ENG' ? 'Preferences' : 'Tetapan'}
            </h3>

            <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="rh-kv-row items-center">
                <span style={{ color: 'var(--ink-secondary)' }}>Theme</span>
                <div className="jom-segmented">
                  <button
                    type="button"
                    className={!darkMode ? 'active' : ''}
                    onClick={() => setDarkMode(false)}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={darkMode ? 'active' : ''}
                    onClick={() => setDarkMode(true)}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div className="rh-kv-row items-center">
                <span style={{ color: 'var(--ink-secondary)' }}>Language</span>
                <div className="jom-segmented">
                  <button
                    type="button"
                    className={language === 'ENG' ? 'active' : ''}
                    onClick={() => language !== 'ENG' && toggleLanguage()}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    className={language === 'BM' ? 'active' : ''}
                    onClick={() => language !== 'BM' && toggleLanguage()}
                  >
                    BM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
