import { useState, type ReactNode } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Wallet,
  Bookmark,
  Sparkles,
  BookOpen,
  User,
  Star,
  Coins,
} from 'lucide-react';
import { ChatbotModal } from './ChatbotModal';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';

interface AppShellProps {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
  userXP: number;
  userLevel: number;
  cashRM: string;
  portfolioSummary: string;
  userProfile: string;
  stocks: StockData[];
  marketSource: 'live' | 'cached';
  children: ReactNode;
}

export function AppShell({
  currentScreen,
  navigateTo,
  language,
  toggleLanguage,
  userXP,
  userLevel,
  cashRM,
  portfolioSummary,
  userProfile,
  stocks,
  marketSource,
  children,
}: AppShellProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const safeXP = Number(userXP) || 0;
  const safeLevel = Number(userLevel) || 1;
  const levelProgress = safeXP % 100;

  const texts = {
    ENG: {
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      watchlist: 'Watchlist',
      aiPicks: 'AI Advisor',
      learn: 'Learn Hub',
      profile: 'Profile',
      stockDetails: 'Stock Details',
      level: 'Level',
      nextLevel: 'to next level',
      aiCoach: 'JomAI Coach',
      tagline: 'Student Investing',
      cash: 'Cash:',
      liveFeed: 'KLSE Live',
      cachedFeed: 'KLSE Snapshot',
    },
    BM: {
      dashboard: 'Papan Pemuka',
      portfolio: 'Portfolio',
      watchlist: 'Senarai Pantau',
      aiPicks: 'Penasihat AI',
      learn: 'Hab Ilmu',
      profile: 'Profil',
      stockDetails: 'Butiran Saham',
      level: 'Tahap',
      nextLevel: 'ke tahap seterusnya',
      aiCoach: 'Jurulatih JomAI',
      tagline: 'Pelaburan Pelajar',
      cash: 'Tunai:',
      liveFeed: 'KLSE Langsung',
      cachedFeed: 'Data KLSE',
    },
  };

  const t = texts[language];

  const navItems: { screen: Screen; label: string; icon: typeof LayoutDashboard }[] = [
    { screen: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { screen: 'portfolio', label: t.portfolio, icon: Wallet },
    { screen: 'watchlist', label: t.watchlist, icon: Bookmark },
    { screen: 'ai-recommendation', label: t.aiPicks, icon: Sparkles },
    { screen: 'educational-hub', label: t.learn, icon: BookOpen },
    { screen: 'profile', label: t.profile, icon: User },
  ];

  const mobileTabs: { screen: Screen; label: string; icon: typeof LayoutDashboard }[] = [
    { screen: 'dashboard', label: language === 'ENG' ? 'Home' : 'Utama', icon: LayoutDashboard },
    { screen: 'portfolio', label: t.portfolio, icon: Wallet },
    { screen: 'watchlist', label: language === 'ENG' ? 'Watch' : 'Pantau', icon: Bookmark },
    { screen: 'educational-hub', label: language === 'ENG' ? 'Learn' : 'Ilmu', icon: BookOpen },
    { screen: 'profile', label: t.profile, icon: User },
  ];

  const screenTitles: Record<Screen, string> = {
    login: 'JomINVEST',
    questionnaire: 'JomINVEST',
    dashboard: t.dashboard,
    portfolio: t.portfolio,
    watchlist: t.watchlist,
    'ai-recommendation': t.aiPicks,
    'educational-hub': t.learn,
    profile: t.profile,
    'stock-details': t.stockDetails,
  };

  return (
    <div className="jomi-shell">
      {/* Desktop Left Sidebar */}
      <aside className="jomi-sidebar">
        <div>
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'transparent',
              border: 'none',
              padding: '0.25rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div className="jomi-brand-mark" aria-hidden="true">
              <TrendingUp size={22} strokeWidth={2.6} />
            </div>
            <div>
              <div className="jomi-display" style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>
                JomINVEST
              </div>
              <div className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                {t.tagline}
              </div>
            </div>
          </button>

          <nav className="jomi-nav-list" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentScreen === item.screen ||
                (currentScreen === 'stock-details' && item.screen === 'dashboard');
              return (
                <button
                  key={item.screen}
                  type="button"
                  onClick={() => navigateTo(item.screen)}
                  className={`jomi-nav-item ${isActive ? 'jomi-nav-item-active' : ''}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Wallet + XP Card */}
        <div className="jomi-stack-sm">
          <div
            className="jomi-card-soft"
            style={{ padding: '0.8rem 0.95rem', cursor: 'pointer' }}
            onClick={() => navigateTo('portfolio')}
          >
            <div className="jomi-between">
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                {language === 'ENG' ? 'Virtual Cash' : 'Tunai Maya'}
              </span>
              <Coins size={14} color="#047857" />
            </div>
            <div className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#047857', marginTop: '2px' }}>
              RM {cashRM}
            </div>
          </div>

          <div
            className="jomi-sidebar-xp"
            onClick={() => navigateTo('profile')}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('profile');
              }
            }}
          >
            <div className="jomi-between" style={{ marginBottom: '0.45rem' }}>
              <span className="jomi-cluster" style={{ gap: '0.35rem', fontWeight: 800, fontSize: '0.82rem', color: 'var(--jomi-gold-ink)' }}>
                <Star size={15} fill="#f59e0b" color="#b45309" />
                {t.level} {safeLevel}
              </span>
              <span className="jomi-nums jomi-text-xs" style={{ fontWeight: 800, color: 'var(--jomi-ink)' }}>
                {safeXP} XP
              </span>
            </div>
            <div className="jomi-progress-track" style={{ height: '0.65rem', backgroundColor: '#ffffff', borderColor: 'var(--jomi-gold-border)' }}>
              <div className="jomi-progress-fill-gold" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="jomi-nums" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--jomi-gold-ink)', marginTop: '0.4rem' }}>
              {100 - levelProgress} XP {t.nextLevel}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="jomi-shell-body">
        {/* Sticky Top Header */}
        <header className="jomi-topbar">
          <div className="jomi-mobile-brand">
            <div className="jomi-brand-mark" style={{ width: '2.15rem', height: '2.15rem' }} aria-hidden="true">
              <TrendingUp size={18} strokeWidth={2.6} />
            </div>
            <span className="jomi-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              JomINVEST
            </span>
          </div>

          <div className="jomi-cluster">
            <h1 className="jomi-display jomi-topbar-title">{screenTitles[currentScreen]}</h1>
            <span className="jomi-pill-sector">
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: marketSource === 'live' ? '#10b981' : '#0d9488',
                  display: 'inline-block',
                }}
              />
              {marketSource === 'live' ? t.liveFeed : t.cachedFeed}
            </span>
          </div>

          <div className="jomi-cluster">
            <button
              type="button"
              onClick={() => navigateTo('portfolio')}
              className="jomi-pill-gain jomi-nums"
              style={{ cursor: 'pointer', padding: '0.32rem 0.7rem' }}
            >
              <Coins size={13} />
              <span>{t.cash} RM {cashRM}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="jomi-pill-xp jomi-nums"
            >
              <Star size={13} fill="#f59e0b" color="#b45309" />
              <span>{t.level} {safeLevel}</span>
              <span>·</span>
              <span>{safeXP} XP</span>
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
            >
              {language === 'ENG' ? 'ENG / BM' : 'BM / ENG'}
            </button>

            <button
              type="button"
              onClick={() => setIsChatbotOpen(true)}
              className="jomi-btn jomi-btn-primary jomi-btn-sm"
            >
              <Sparkles size={14} />
              <span>{t.aiCoach}</span>
            </button>
          </div>
        </header>

        <main className="jomi-main">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="jomi-bottom-nav" aria-label="Mobile navigation">
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.screen ||
            (currentScreen === 'stock-details' && item.screen === 'dashboard');
          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => navigateTo(item.screen)}
              className={`jomi-bottom-tab ${isActive ? 'jomi-bottom-tab-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating AI Coach Button */}
      <button
        type="button"
        onClick={() => setIsChatbotOpen(true)}
        className="jomi-fab"
        aria-label={t.aiCoach}
      >
        <Sparkles size={18} />
        <span>{t.aiCoach}</span>
      </button>

      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        language={language}
        cashRM={cashRM}
        portfolioSummary={portfolioSummary}
        userProfile={userProfile}
        stocks={stocks}
      />
    </div>
  );
}
