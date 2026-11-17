import { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RiskQuestionnaire } from './components/RiskQuestionnaire';
import { Dashboard } from './components/Dashboard';
import { AIRecommendation } from './components/AIRecommendation';
import { StockDetails } from './components/StockDetails';
import { EducationalHub } from './components/EducationalHub';
import { ProfileSettings } from './components/ProfileSettings';
import { PortfolioPage } from './components/PortfolioPage';
import { WatchlistPage } from './components/WatchlistPage';
import { ChatbotModal } from './components/ChatbotModal';
import { StockData, stocks as defaultStocks, calculateBursaFees } from './data/stocks';
import { getInitialStocks, fetchBursaStockQuote, isBursaMarketOpen } from './services/bursaService';
import { toast, Toaster } from 'sonner';
import {
  BarChart2,
  Briefcase,
  Bookmark,
  BookOpen,
  Compass,
  Sliders,
  RefreshCw,
  MessageSquare,
  Sun,
  Moon,
  TrendingUp
} from 'lucide-react';

export type { StockData };

export type Screen =
  | 'login'
  | 'questionnaire'
  | 'dashboard'
  | 'ai-recommendation'
  | 'stock-details'
  | 'educational-hub'
  | 'profile'
  | 'portfolio'
  | 'watchlist';

export interface PortfolioItem {
  stock: StockData;
  quantity: number;
  averagePrice: number;
}

export interface TradeRecord {
  id: string;
  type: 'BUY' | 'SELL';
  ticker: string;
  stockName: string;
  quantity: number;
  pricePerShare: number;
  totalFees: number;
  netAmount: number;
  timestamp: string;
}

const STORAGE_KEY = 'jominvest_app_state_v2';
const INITIAL_CASH = 10000;

interface SavedAppState {
  language: 'ENG' | 'BM';
  userProfile: string;
  userName: string;
  userEmail: string;
  darkMode: boolean;
  cashBalance: number;
  portfolio: PortfolioItem[];
  watchlistIds: string[];
  tradeHistory: TradeRecord[];
  userXP: number;
  userLevel: number;
  hasLearnedTerm: string[];
}

function loadSavedState(): Partial<SavedAppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage read errors
  }
  return {};
}

export default function App() {
  const saved = loadSavedState();

  const [allStocks, setAllStocks] = useState<StockData[]>(() => getInitialStocks());
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [language, setLanguage] = useState<'ENG' | 'BM'>(saved.language || 'ENG');
  const [userProfile, setUserProfile] = useState<string>(saved.userProfile || 'Jom-Explorer (Aggressive)');
  const [userName, setUserName] = useState<string>(saved.userName || 'Tan Hao Yang');
  const [userEmail, setUserEmail] = useState<string>(saved.userEmail || 'tan@email.com');
  const [darkMode, setDarkMode] = useState<boolean>(saved.darkMode || false);

  const [selectedStock, setSelectedStock] = useState<StockData | null>(allStocks[0] || null);
  const [cashBalance, setCashBalance] = useState<number>(
    typeof saved.cashBalance === 'number' ? saved.cashBalance : INITIAL_CASH
  );
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(saved.portfolio || []);
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>(saved.tradeHistory || []);

  const [watchlist, setWatchlist] = useState<StockData[]>(() => {
    if (saved.watchlistIds && saved.watchlistIds.length > 0) {
      return allStocks.filter(s => saved.watchlistIds!.includes(s.id));
    }
    return allStocks.slice(0, 3);
  });

  // Gamification & Copilot State
  const [userXP, setUserXP] = useState<number>(typeof saved.userXP === 'number' ? saved.userXP : 0);
  const [userLevel, setUserLevel] = useState<number>(typeof saved.userLevel === 'number' ? saved.userLevel : 1);
  const [hasLearnedTerm, setHasLearnedTerm] = useState<string[]>(saved.hasLearnedTerm || []);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Sync dark mode class with document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      const stateToSave: SavedAppState = {
        language,
        userProfile,
        userName,
        userEmail,
        darkMode,
        cashBalance,
        portfolio,
        watchlistIds: watchlist.map(w => w.id),
        tradeHistory,
        userXP,
        userLevel,
        hasLearnedTerm
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore storage write errors
    }
  }, [
    language,
    userProfile,
    userName,
    userEmail,
    darkMode,
    cashBalance,
    portfolio,
    watchlist,
    tradeHistory,
    userXP,
    userLevel,
    hasLearnedTerm
  ]);

  const updateStockInState = useCallback((updated: StockData) => {
    setAllStocks(prev => {
      const exists = prev.some(s => s.id === updated.id || s.bursaCode === updated.bursaCode);
      if (!exists) return [...prev, updated];
      return prev.map(s => (s.id === updated.id || s.bursaCode === updated.bursaCode ? updated : s));
    });
    setSelectedStock(prev =>
      prev && (prev.id === updated.id || prev.bursaCode === updated.bursaCode) ? updated : prev
    );
    setPortfolio(prev =>
      prev.map(item =>
        item.stock.id === updated.id || item.stock.bursaCode === updated.bursaCode
          ? { ...item, stock: updated }
          : item
      )
    );
    setWatchlist(prev =>
      prev.map(s => (s.id === updated.id || s.bursaCode === updated.bursaCode ? updated : s))
    );
  }, []);

  useEffect(() => {
    if (currentScreen === 'stock-details' && selectedStock) {
      let cancelled = false;
      fetchBursaStockQuote(selectedStock, false).then(fresh => {
        if (!cancelled) {
          updateStockInState(fresh);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [currentScreen, selectedStock?.id, updateStockInState]);

  const refreshMarketPrices = async () => {
    if (isRefreshingMarket) return;
    setIsRefreshingMarket(true);
    try {
      const priorityIds = new Set([
        ...allStocks.slice(0, 6).map(s => s.id),
        ...portfolio.map(p => p.stock.id),
        ...watchlist.map(w => w.id)
      ]);
      const targets = allStocks.filter(s => priorityIds.has(s.id));
      for (const stock of targets) {
        const updated = await fetchBursaStockQuote(stock, true);
        updateStockInState(updated);
      }
      toast.success(
        language === 'ENG'
          ? 'Market feed synchronized (30m cache updated)'
          : 'Suapan pasaran Bursa Malaysia dikemas kini'
      );
    } finally {
      setIsRefreshingMarket(false);
    }
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ENG' ? 'BM' : 'ENG'));
  };

  const addXP = (amount: number, reason: string) => {
    setUserXP(prevXP => {
      const newXP = prevXP + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      setUserLevel(prevLevel => {
        if (newLevel > prevLevel) {
          toast.success(`Tier Advanced — Level ${newLevel} (+${amount} XP · ${reason})`);
          return newLevel;
        }
        toast.success(`+${amount} XP · ${reason}`);
        return prevLevel;
      });
      return newXP;
    });
  };

  const addToPortfolio = (stock: StockData, quantity: number): boolean => {
    if (quantity <= 0) return false;
    const price = parseFloat(stock.price);
    const fees = calculateBursaFees(price, quantity, 'BUY');

    if (cashBalance < fees.netTotal) {
      toast.error(
        language === 'ENG'
          ? `Insufficient buying power. Required: RM ${fees.netTotal.toFixed(2)} (incl. RM ${fees.totalFees.toFixed(2)} fees). Available: RM ${cashBalance.toFixed(2)}.`
          : `Kuasa beli tidak mencukupi. Perlu RM ${fees.netTotal.toFixed(2)}, baki RM ${cashBalance.toFixed(2)}.`
      );
      return false;
    }

    setCashBalance(prev => parseFloat((prev - fees.netTotal).toFixed(2)));

    const newTrade: TradeRecord = {
      id: `trade-${Date.now()}`,
      type: 'BUY',
      ticker: stock.ticker,
      stockName: stock.name,
      quantity,
      pricePerShare: price,
      totalFees: fees.totalFees,
      netAmount: fees.netTotal,
      timestamp: new Date().toLocaleString()
    };
    setTradeHistory(prev => [newTrade, ...prev]);

    setPortfolio(prevPortfolio => {
      const existingItemIndex = prevPortfolio.findIndex(item => item.stock.id === stock.id);

      if (existingItemIndex > -1) {
        const newPortfolio = [...prevPortfolio];
        const item = newPortfolio[existingItemIndex];
        const totalCost = item.quantity * item.averagePrice + fees.netTotal;
        const newQuantity = item.quantity + quantity;
        const newAveragePrice = totalCost / newQuantity;

        newPortfolio[existingItemIndex] = {
          ...item,
          stock,
          quantity: newQuantity,
          averagePrice: newAveragePrice
        };
        return newPortfolio;
      } else {
        return [
          ...prevPortfolio,
          {
            stock,
            quantity,
            averagePrice: fees.netTotal / quantity
          }
        ];
      }
    });

    toast.success(
      language === 'ENG'
        ? `Order Filled · Bought ${quantity} sh ${stock.ticker} @ RM ${price.toFixed(2)} (Net RM ${fees.netTotal.toFixed(2)})`
        : `Pesanan Berjaya · Beli ${quantity} unit ${stock.ticker} (Bersih RM ${fees.netTotal.toFixed(2)})`
    );
    addXP(50, `Executed buy order on ${stock.ticker}`);
    return true;
  };

  const sellFromPortfolio = (stockToSell: StockData, quantityToSell?: number): boolean => {
    const existingItem = portfolio.find(item => item.stock.id === stockToSell.id);
    if (!existingItem || existingItem.quantity <= 0) {
      toast.error(
        language === 'ENG'
          ? `No open position in ${stockToSell.ticker} available to sell.`
          : `Tiada pegangan ${stockToSell.ticker} untuk dijual.`
      );
      return false;
    }

    const sellQty = quantityToSell ? Math.min(quantityToSell, existingItem.quantity) : existingItem.quantity;
    const price = parseFloat(stockToSell.price);
    const fees = calculateBursaFees(price, sellQty, 'SELL');

    setCashBalance(prev => parseFloat((prev + fees.netTotal).toFixed(2)));

    const newTrade: TradeRecord = {
      id: `trade-${Date.now()}`,
      type: 'SELL',
      ticker: stockToSell.ticker,
      stockName: stockToSell.name,
      quantity: sellQty,
      pricePerShare: price,
      totalFees: fees.totalFees,
      netAmount: fees.netTotal,
      timestamp: new Date().toLocaleString()
    };
    setTradeHistory(prev => [newTrade, ...prev]);

    setPortfolio(prevPortfolio => {
      if (sellQty >= existingItem.quantity) {
        return prevPortfolio.filter(item => item.stock.id !== stockToSell.id);
      }
      return prevPortfolio.map(item =>
        item.stock.id === stockToSell.id
          ? { ...item, quantity: item.quantity - sellQty }
          : item
      );
    });

    toast.success(
      language === 'ENG'
        ? `Order Filled · Sold ${sellQty} sh ${stockToSell.ticker} (Net Proceeds RM ${fees.netTotal.toFixed(2)})`
        : `Pesanan Berjaya · Jual ${sellQty} unit ${stockToSell.ticker} (RM ${fees.netTotal.toFixed(2)})`
    );
    addXP(30, `Closed position on ${stockToSell.ticker}`);
    return true;
  };

  const removeFromPortfolio = (stockToRemove: StockData) => {
    sellFromPortfolio(stockToRemove);
  };

  const addToWatchlist = (stock: StockData) => {
    if (!watchlist.some(s => s.id === stock.id)) {
      setWatchlist(prev => [...prev, stock]);
      updateStockInState(stock);
      toast.success(`${stock.ticker} added to watchlist.`);
      addXP(5, `Tracked ${stock.ticker}`);
    } else {
      toast.info(`${stock.ticker} is already in your watchlist.`);
    }
  };

  const removeFromWatchlist = (stockId: string) => {
    setWatchlist(prev => prev.filter(s => s.id !== stockId));
    toast.success(language === 'ENG' ? 'Removed from watchlist.' : 'Dibuang daripada senarai pantau.');
  };

  const topUpCash = (amount: number = 5000) => {
    setCashBalance(prev => parseFloat((prev + amount).toFixed(2)));
    toast.success(
      language === 'ENG'
        ? `Credited RM ${amount.toLocaleString()} practice capital to account.`
        : `RM ${amount.toLocaleString()} modal latihan dikreditkan.`
    );
  };

  const resetDemoAccount = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCashBalance(INITIAL_CASH);
    setPortfolio([]);
    setTradeHistory([]);
    setWatchlist(defaultStocks.slice(0, 3));
    setUserXP(0);
    setUserLevel(1);
    setHasLearnedTerm([]);
    toast.success(
      language === 'ENG'
        ? 'Account reset to RM 10,000.00 opening capital.'
        : 'Akaun ditetapkan semula kepada modal RM 10,000.00.'
    );
  };

  // Standalone Onboarding Screens
  if (currentScreen === 'login') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LoginScreen navigateTo={navigateTo} language={language} toggleLanguage={toggleLanguage} />
        <Toaster richColors position="bottom-left" />
      </div>
    );
  }

  if (currentScreen === 'questionnaire') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <RiskQuestionnaire navigateTo={navigateTo} setUserProfile={setUserProfile} language={language} />
        <Toaster richColors position="bottom-left" />
      </div>
    );
  }

  const holdingsValue = portfolio.reduce(
    (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
    0
  );
  const netLiquidity = holdingsValue + cashBalance;
  const marketOpen = isBursaMarketOpen();

  const navItems: { id: Screen; labelEng: string; labelBm: string; icon: any; count?: number }[] = [
    { id: 'dashboard', labelEng: 'Market & Screener', labelBm: 'Pasaran & Saringan', icon: BarChart2 },
    { id: 'stock-details', labelEng: 'Equity Terminal', labelBm: 'Terminal Ekuiti', icon: TrendingUp },
    { id: 'portfolio', labelEng: 'Portfolio Ledger', labelBm: 'Lejar Portfolio', icon: Briefcase, count: portfolio.length },
    { id: 'watchlist', labelEng: 'Watchlist', labelBm: 'Senarai Pantau', icon: Bookmark, count: watchlist.length },
    { id: 'ai-recommendation', labelEng: 'Conviction Notes', labelBm: 'Nota Konviksi', icon: Compass },
    { id: 'educational-hub', labelEng: 'Research & Academy', labelBm: 'Penyelidikan & Akademi', icon: BookOpen },
    { id: 'profile', labelEng: 'Account & Mandate', labelBm: 'Akaun & Mandat', icon: Sliders }
  ];

  return (
    <div className={`jom-shell ${darkMode ? 'dark' : ''}`}>
      {/* Architectural Left Navigation Rail */}
      <aside className="jom-sidebar">
        <div className="p-5 space-y-6">
          {/* Brand Lockup */}
          <div
            className="flex items-center justify-between cursor-pointer pb-4 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
            onClick={() => navigateTo('dashboard')}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-2xl tracking-tight">JomINVEST</span>
                <span className="jom-tag">KLSE</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {language === 'ENG' ? 'Bursa Research & Practice Desk' : 'Meja Penyelidikan & Latihan Bursa'}
              </p>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <div className="jom-kicker px-3 pb-2">
              {language === 'ENG' ? 'Workspace' : 'Ruang Kerja'}
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`jom-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} strokeWidth={1.8} />
                    <span>{language === 'ENG' ? item.labelEng : item.labelBm}</span>
                  </span>
                  {typeof item.count === 'number' && (
                    <span className="font-tabular text-xs opacity-75">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Investor Mandate & Tier Block */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-hairline)' }}>
          <div className="jom-panel-subtle p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="jom-kicker">{language === 'ENG' ? 'Analyst Tier' : 'Tahap Penganalisis'}</span>
              <span className="font-tabular text-xs font-semibold">
                LVL 0{userLevel} · {userXP} XP
              </span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-hairline)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${userXP % 100}%`,
                  backgroundColor: 'var(--accent-brand)'
                }}
              />
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--ink-secondary)' }}>
              {userName} · <span style={{ color: 'var(--ink-muted)' }}>{userProfile.split('(')[0].trim()}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="jom-main-wrap">
        {/* Top Institutional Status Bar */}
        <header className="jom-topbar">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: marketOpen ? 'var(--signal-up)' : 'var(--ink-muted)' }}
              />
              <span className="font-tabular text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {marketOpen
                  ? 'BURSA MALAYSIA · CONTINUOUS TRADING'
                  : 'BURSA MALAYSIA · EOD / 15M DELAYED'}
              </span>
            </div>
            <button
              onClick={refreshMarketPrices}
              disabled={isRefreshingMarket}
              className="jom-btn py-1 px-2.5 text-xs"
            >
              <RefreshCw size={12} className={isRefreshingMarket ? 'animate-spin' : ''} />
              <span>{isRefreshingMarket ? 'Syncing' : language === 'ENG' ? 'Sync Feed' : 'Kemas Kini'}</span>
            </button>
          </div>

          {/* Right Account Telemetry & Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5 pr-3 border-r" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="text-right">
                <div className="jom-kicker">{language === 'ENG' ? 'Net Liquidity' : 'Kecairan Bersih'}</div>
                <div className="font-tabular text-xs font-semibold">RM {netLiquidity.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="text-right">
                <div className="jom-kicker">{language === 'ENG' ? 'Buying Power' : 'Kuasa Beli'}</div>
                <div className="font-tabular text-xs font-semibold" style={{ color: 'var(--signal-up)' }}>
                  RM {cashBalance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCopilotOpen(true)}
                className="jom-btn jom-btn-inverse py-1.5 px-3 text-xs"
              >
                <MessageSquare size={13} />
                <span>{language === 'ENG' ? 'Research Copilot' : 'Pembantu AI'}</span>
              </button>
              <button onClick={toggleLanguage} className="jom-btn py-1.5 px-2.5 font-tabular text-xs">
                {language}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="jom-btn py-1.5 px-2.5 text-xs"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </header>

        {/* Active Screen Viewport */}
        <div className="flex-1">
          {currentScreen === 'dashboard' && (
            <Dashboard
              navigateTo={navigateTo}
              userProfile={userProfile}
              userName={userName}
              language={language}
              stocks={allStocks}
              setSelectedStock={stock => {
                updateStockInState(stock);
                setSelectedStock(stock);
              }}
              portfolio={portfolio}
              cashBalance={cashBalance}
              watchlist={watchlist}
              userXP={userXP}
              userLevel={userLevel}
              onRefreshMarket={refreshMarketPrices}
              isRefreshingMarket={isRefreshingMarket}
            />
          )}
          {currentScreen === 'watchlist' && (
            <WatchlistPage
              navigateTo={navigateTo}
              language={language}
              stocks={allStocks}
              watchlist={watchlist}
              addToWatchlist={addToWatchlist}
              removeFromWatchlist={removeFromWatchlist}
              setSelectedStock={stock => {
                updateStockInState(stock);
                setSelectedStock(stock);
              }}
            />
          )}
          {currentScreen === 'ai-recommendation' && (
            <AIRecommendation
              navigateTo={navigateTo}
              userProfile={userProfile}
              language={language}
              stocks={allStocks}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              addToPortfolio={addToPortfolio}
            />
          )}
          {currentScreen === 'stock-details' && (
            <StockDetails
              navigateTo={navigateTo}
              language={language}
              stock={selectedStock}
              allStocks={allStocks}
              setSelectedStock={setSelectedStock}
              portfolio={portfolio}
              cashBalance={cashBalance}
              watchlist={watchlist}
              addToWatchlist={addToWatchlist}
              removeFromWatchlist={removeFromWatchlist}
              addToPortfolio={addToPortfolio}
              sellFromPortfolio={sellFromPortfolio}
              addXP={addXP}
              hasLearnedTerm={hasLearnedTerm}
              setHasLearnedTerm={setHasLearnedTerm}
            />
          )}
          {currentScreen === 'educational-hub' && (
            <EducationalHub
              navigateTo={navigateTo}
              language={language}
              stocks={allStocks}
              setSelectedStock={setSelectedStock}
              addXP={addXP}
            />
          )}
          {currentScreen === 'profile' && (
            <ProfileSettings
              navigateTo={navigateTo}
              userProfile={userProfile}
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              language={language}
              toggleLanguage={toggleLanguage}
              userXP={userXP}
              userLevel={userLevel}
              portfolio={portfolio}
              tradeHistory={tradeHistory}
              hasLearnedTerm={hasLearnedTerm}
              cashBalance={cashBalance}
              onTopUpCash={topUpCash}
              onResetDemo={resetDemoAccount}
            />
          )}
          {currentScreen === 'portfolio' && (
            <PortfolioPage
              navigateTo={navigateTo}
              language={language}
              portfolio={portfolio}
              cashBalance={cashBalance}
              tradeHistory={tradeHistory}
              userProfile={userProfile}
              removeFromPortfolio={removeFromPortfolio}
              sellFromPortfolio={sellFromPortfolio}
              setSelectedStock={setSelectedStock}
              onTopUpCash={topUpCash}
            />
          )}
        </div>
      </div>

      {/* Global Research Copilot Drawer */}
      <ChatbotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        language={language}
        stocks={allStocks}
        portfolio={portfolio}
        cashBalance={cashBalance}
        userProfile={userProfile}
        userName={userName}
      />

      <Toaster richColors position="bottom-left" />
    </div>
  );
}
