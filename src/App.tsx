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
          ? 'Bursa Malaysia prices updated'
          : 'Harga pasaran Bursa Malaysia dikemas kini'
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
          toast.success(`Level Up! You reached Level ${newLevel} (+${amount} XP · ${reason})`);
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
          ? `Not enough cash to invest. Needed: RM ${fees.netTotal.toFixed(2)} (incl. RM ${fees.totalFees.toFixed(2)} fees). Available: RM ${cashBalance.toFixed(2)}.`
          : `Baki tunai tidak mencukupi. Perlu RM ${fees.netTotal.toFixed(2)}, baki RM ${cashBalance.toFixed(2)}.`
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
        ? `Bought ${quantity} shares of ${stock.ticker} @ RM ${price.toFixed(2)} (Total RM ${fees.netTotal.toFixed(2)})`
        : `Berjaya membeli ${quantity} unit ${stock.ticker} (Jumlah RM ${fees.netTotal.toFixed(2)})`
    );
    addXP(50, `Practiced buying ${stock.ticker}`);
    return true;
  };

  const sellFromPortfolio = (stockToSell: StockData, quantityToSell?: number): boolean => {
    const existingItem = portfolio.find(item => item.stock.id === stockToSell.id);
    if (!existingItem || existingItem.quantity <= 0) {
      toast.error(
        language === 'ENG'
          ? `You don't own any shares of ${stockToSell.ticker} to sell.`
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
        ? `Sold ${sellQty} shares of ${stockToSell.ticker} (Received RM ${fees.netTotal.toFixed(2)})`
        : `Berjaya menjual ${sellQty} unit ${stockToSell.ticker} (RM ${fees.netTotal.toFixed(2)})`
    );
    addXP(30, `Practiced selling ${stockToSell.ticker}`);
    return true;
  };

  const removeFromPortfolio = (stockToRemove: StockData) => {
    sellFromPortfolio(stockToRemove);
  };

  const addToWatchlist = (stock: StockData) => {
    if (!watchlist.some(s => s.id === stock.id)) {
      setWatchlist(prev => [...prev, stock]);
      updateStockInState(stock);
      toast.success(`${stock.ticker} saved to your watchlist.`);
      addXP(5, `Saved ${stock.ticker} to Watchlist`);
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
        ? `Added RM ${amount.toLocaleString()} in practice cash to your account.`
        : `RM ${amount.toLocaleString()} tunai latihan telah ditambah.`
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
        ? 'Practice account reset to RM 10,000.00 starting balance.'
        : 'Akaun latihan ditetapkan semula kepada baki permulaan RM 10,000.00.'
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

  const navItems: { id: Screen; labelEng: string; labelBm: string }[] = [
    { id: 'dashboard', labelEng: 'Invest', labelBm: 'Melabur' },
    { id: 'portfolio', labelEng: 'Portfolio', labelBm: 'Portfolio' },
    { id: 'watchlist', labelEng: 'Watchlist', labelBm: 'Pantau' },
    { id: 'educational-hub', labelEng: 'Learn', labelBm: 'Belajar' },
    { id: 'ai-recommendation', labelEng: 'Screener', labelBm: 'Saringan' },
    { id: 'profile', labelEng: 'Account', labelBm: 'Akaun' }
  ];

  return (
    <div className={`rh-app ${darkMode ? 'dark' : ''}`}>
      <header className="rh-topnav">
        <div className="rh-topnav-inner">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="rh-brand"
            >
              <span>JomInvest</span>
            </button>

            <nav className="rh-nav-links">
              {navItems.map(item => {
                const isActive =
                  currentScreen === item.id ||
                  (item.id === 'dashboard' && currentScreen === 'stock-details');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`rh-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {language === 'ENG' ? item.labelEng : item.labelBm}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={refreshMarketPrices}
              disabled={isRefreshingMarket}
              className="jom-btn-ghost"
              title={language === 'ENG' ? 'Refresh quotes' : 'Segar semula harga'}
            >
              <RefreshCw size={14} className={isRefreshingMarket ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="jom-btn-ghost font-tabular"
            >
              {language === 'ENG' ? 'EN' : 'BM'}
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="jom-btn-ghost"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setIsCopilotOpen(true)}
              className="jom-btn py-1.5 px-3 text-xs ml-1"
            >
              <span>{language === 'ENG' ? 'Ask' : 'Tanya'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div>
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
      </main>

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

