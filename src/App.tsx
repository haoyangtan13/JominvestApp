import { useState, useEffect, useMemo } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RiskQuestionnaire } from './components/RiskQuestionnaire';
import { Dashboard } from './components/Dashboard';
import { AIRecommendation } from './components/AIRecommendation';
import { StockDetails } from './components/StockDetails';
import { EducationalHub } from './components/EducationalHub';
import { ProfileSettings } from './components/ProfileSettings';
import { PortfolioPage } from './components/PortfolioPage';
import { WatchlistPage } from './components/WatchlistPage';
import { AppShell } from './components/AppShell';
import { stocks as baselineStocks, type StockData } from './data/stocks';
import { fetchBursaQuotes } from './services/marketData';
import {
  createDefaultState,
  executeBuy,
  executeSell,
  formatRMFromSen,
  loadPersistedState,
  priceToSen,
  savePersistedState,
  senToDecimal,
  simulateDividendPayout,
  type PersistedSimulatorState,
} from './lib/simulator';
import { toast, Toaster } from 'sonner';

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

const DEFAULT_WATCHLIST_IDS = ['1', '2', '3'];

export default function App() {
  const [simState, setSimState] = useState<PersistedSimulatorState>(() =>
    loadPersistedState(DEFAULT_WATCHLIST_IDS)
  );
  // Skip straight to dashboard on reload if user already completed the persona quiz
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    loadPersistedState(DEFAULT_WATCHLIST_IDS).userProfile ? 'dashboard' : 'login'
  );

  const [marketStocks, setMarketStocks] = useState<StockData[]>(baselineStocks);
  const [marketSource, setMarketSource] = useState<'live' | 'cached'>('cached');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string>('1');

  // Persist simulator state on every change
  useEffect(() => {
    savePersistedState(simState);
  }, [simState]);

  // Attempt live Bursa Malaysia quote sync on boot (falls back cleanly to cached snapshot)
  const syncMarketData = async (manual: boolean = false) => {
    setIsSyncing(true);
    const res = await fetchBursaQuotes();
    setMarketStocks(res.stocks);
    setMarketSource(res.source);
    setIsSyncing(false);
    if (manual) {
      toast.success(
        res.source === 'live'
          ? 'Synced latest KLSE quotes!'
          : `Using verified KLSE snapshot (${res.updatedAt}).`
      );
    }
  };

  useEffect(() => {
    void syncMarketData(false);
  }, []);

  const selectedStock = useMemo(
    () => marketStocks.find((s) => s.id === selectedStockId) || marketStocks[0] || null,
    [marketStocks, selectedStockId]
  );

  const setSelectedStock = (stock: StockData) => {
    setSelectedStockId(stock.id);
  };

  const portfolio: PortfolioItem[] = useMemo(() => {
    return simState.holdings
      .map((h) => {
        const stock = marketStocks.find((s) => s.id === h.stockId);
        if (!stock) return null;
        return {
          stock,
          quantity: h.quantity,
          averagePrice: senToDecimal(h.avgPriceSen),
        };
      })
      .filter((item): item is PortfolioItem => item !== null);
  }, [simState.holdings, marketStocks]);

  const watchlist: StockData[] = useMemo(() => {
    return simState.watchlistIds
      .map((id) => marketStocks.find((s) => s.id === id))
      .filter((s): s is StockData => Boolean(s));
  }, [simState.watchlistIds, marketStocks]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const toggleLanguage = () => {
    setSimState((prev) => ({
      ...prev,
      language: prev.language === 'ENG' ? 'BM' : 'ENG',
    }));
  };

  const setUserProfile = (profile: string) => {
    setSimState((prev) => ({ ...prev, userProfile: profile }));
  };

  const addXP = (amount: number, reason: string) => {
    setSimState((prev) => {
      const newXP = prev.userXP + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > prev.userLevel) {
        toast.success(`Level Up! You reached Level ${newLevel}!`);
      } else {
        toast.success(`+${amount} XP: ${reason}`);
      }
      return {
        ...prev,
        userXP: newXP,
        userLevel: newLevel,
      };
    });
  };

  const buyStock = (stock: StockData, quantity: number) => {
    const unitPriceSen = priceToSen(stock.price);
    const res = executeBuy({
      cashSen: simState.cashSen,
      holdings: simState.holdings,
      transactions: simState.transactions,
      stockId: stock.id,
      ticker: stock.ticker,
      name: stock.name,
      unitPriceSen,
      quantity,
    });

    if (!res.ok) {
      if (res.error === 'INSUFFICIENT_CASH') {
        toast.error(
          `Insufficient cash: need RM ${formatRMFromSen(res.requiredSen)}, available RM ${formatRMFromSen(simState.cashSen)}.`
        );
      } else {
        toast.error('Please enter a valid unit quantity.');
      }
      return;
    }

    setSimState((prev) => {
      const newXP = prev.userXP + 50;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        cashSen: res.cashSen,
        holdings: res.holdings,
        transactions: res.transactions,
        userXP: newXP,
        userLevel: newLevel,
      };
    });
    toast.success(`Bought ${quantity}u ${stock.ticker} for RM ${formatRMFromSen(res.costSen)} (+50 XP)!`);
  };

  const sellStock = (stock: StockData, quantity: number) => {
    const unitPriceSen = priceToSen(stock.price);
    const res = executeSell({
      cashSen: simState.cashSen,
      holdings: simState.holdings,
      transactions: simState.transactions,
      stockId: stock.id,
      ticker: stock.ticker,
      name: stock.name,
      unitPriceSen,
      quantity,
    });

    if (!res.ok) {
      toast.error('Cannot sell more units than you currently hold.');
      return;
    }

    setSimState((prev) => {
      const newXP = prev.userXP + 30;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        cashSen: res.cashSen,
        holdings: res.holdings,
        transactions: res.transactions,
        userXP: newXP,
        userLevel: newLevel,
      };
    });
    toast.success(
      `Sold ${quantity}u ${stock.ticker} for RM ${formatRMFromSen(res.proceedsSen)} (+30 XP)!`
    );
  };

  const handleSimulateDividends = () => {
    const lookup: Record<string, { ticker: string; name: string; priceSen: number; dividendYield: string }> = {};
    for (const s of marketStocks) {
      lookup[s.id] = {
        ticker: s.ticker,
        name: s.name,
        priceSen: priceToSen(s.price),
        dividendYield: s.dividendYield,
      };
    }

    const res = simulateDividendPayout({
      cashSen: simState.cashSen,
      holdings: simState.holdings,
      transactions: simState.transactions,
      stockLookup: lookup,
    });

    if (res.payoutSen <= 0) {
      toast.info('None of your current holdings pay a cash dividend yet.');
      return;
    }

    setSimState((prev) => ({
      ...prev,
      cashSen: res.cashSen,
      transactions: res.transactions,
    }));
    toast.success(`Credited RM ${formatRMFromSen(res.payoutSen)} in annual dividends to your cash!`);
  };

  const addToWatchlist = (stock: StockData) => {
    if (!simState.watchlistIds.includes(stock.id)) {
      setSimState((prev) => ({
        ...prev,
        watchlistIds: [...prev.watchlistIds, stock.id],
      }));
      toast.success(`${stock.ticker} added to watchlist!`);
    } else {
      toast.info(`${stock.ticker} is already in your watchlist.`);
    }
  };

  const removeFromWatchlist = (stockId: string) => {
    setSimState((prev) => ({
      ...prev,
      watchlistIds: prev.watchlistIds.filter((id) => id !== stockId),
    }));
    toast.success('Removed from watchlist.');
  };

  const setHasLearnedTerm = (terms: string[]) => {
    setSimState((prev) => ({ ...prev, hasLearnedTerm: terms }));
  };

  const handleCompleteLesson = (lessonId: string, xpReward: number, title: string) => {
    setSimState((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const newXP = prev.userXP + xpReward;
      const newLevel = Math.floor(newXP / 100) + 1;
      toast.success(`+${xpReward} XP: Completed "${title}"!`);
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        userXP: newXP,
        userLevel: newLevel,
      };
    });
  };

  const handleLearnGlossaryTerm = (termKey: string, xpReward: number, label: string) => {
    setSimState((prev) => {
      if (prev.hasLearnedTerm.includes(termKey)) return prev;
      const newXP = prev.userXP + xpReward;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > prev.userLevel) {
        toast.success(`Level Up! You reached Level ${newLevel}!`);
      } else {
        toast.success(`+${xpReward} XP: Mastered "${label}"!`);
      }
      return {
        ...prev,
        hasLearnedTerm: [...prev.hasLearnedTerm, termKey],
        userXP: newXP,
        userLevel: newLevel,
      };
    });
  };

  const handleResetAccount = () => {
    const fresh = createDefaultState(DEFAULT_WATCHLIST_IDS);
    setSimState({ ...fresh, language: simState.language, userProfile: simState.userProfile });
    toast.success('Virtual account reset to RM 10,000.00 cash!');
  };

  const cashRM = formatRMFromSen(simState.cashSen);
  const totalEquityRM = useMemo(() => {
    const holdingsVal = portfolio.reduce(
      (sum, item) => sum + parseFloat(item.stock.price) * item.quantity,
      0
    );
    return Math.round(simState.cashSen / 100 + holdingsVal);
  }, [simState.cashSen, portfolio]);
  const portfolioSummary =
    portfolio.length > 0
      ? portfolio.map((p) => `${p.quantity}u ${p.stock.ticker}`).join(', ')
      : '0 positions';

  const heldSelectedQty =
    simState.holdings.find((h) => h.stockId === selectedStock?.id)?.quantity || 0;

  const isOnboarding = currentScreen === 'login' || currentScreen === 'questionnaire';

  return (
    <div>
      {currentScreen === 'login' && (
        <LoginScreen
          navigateTo={navigateTo}
          language={simState.language}
          toggleLanguage={toggleLanguage}
        />
      )}

      {currentScreen === 'questionnaire' && (
        <RiskQuestionnaire
          navigateTo={navigateTo}
          setUserProfile={setUserProfile}
          language={simState.language}
        />
      )}

      {!isOnboarding && (
        <AppShell
          currentScreen={currentScreen}
          navigateTo={navigateTo}
          language={simState.language}
          toggleLanguage={toggleLanguage}
          userXP={simState.userXP}
          userLevel={simState.userLevel}
          cashRM={cashRM}
          portfolioSummary={portfolioSummary}
          userProfile={simState.userProfile}
          stocks={marketStocks}
          marketSource={marketSource}
        >
          {currentScreen === 'dashboard' && (
            <Dashboard
              navigateTo={navigateTo}
              userProfile={simState.userProfile}
              language={simState.language}
              setSelectedStock={setSelectedStock}
              portfolio={portfolio}
              cashSen={simState.cashSen}
              watchlist={watchlist}
              stocks={marketStocks}
              userXP={simState.userXP}
              userLevel={simState.userLevel}
              learnedCount={simState.hasLearnedTerm.length}
              completedLessonsCount={simState.completedLessons.length}
              onSyncQuotes={() => void syncMarketData(true)}
              isSyncing={isSyncing}
            />
          )}

          {currentScreen === 'watchlist' && (
            <WatchlistPage
              navigateTo={navigateTo}
              language={simState.language}
              watchlist={watchlist}
              addToWatchlist={addToWatchlist}
              removeFromWatchlist={removeFromWatchlist}
              setSelectedStock={setSelectedStock}
            />
          )}

          {currentScreen === 'ai-recommendation' && (
            <AIRecommendation
              navigateTo={navigateTo}
              userProfile={simState.userProfile}
              language={simState.language}
              stocks={marketStocks}
              cashRM={cashRM}
              portfolioSummary={portfolioSummary}
              setSelectedStock={setSelectedStock}
              addToPortfolio={buyStock}
            />
          )}

          {currentScreen === 'stock-details' && (
            <StockDetails
              navigateTo={navigateTo}
              language={simState.language}
              stock={selectedStock}
              allStocks={marketStocks}
              cashSen={simState.cashSen}
              heldQuantity={heldSelectedQty}
              buyStock={buyStock}
              sellStock={sellStock}
              addXP={addXP}
              hasLearnedTerm={simState.hasLearnedTerm}
              setHasLearnedTerm={setHasLearnedTerm}
            />
          )}

          {currentScreen === 'educational-hub' && (
            <EducationalHub
              navigateTo={navigateTo}
              language={simState.language}
              stocks={marketStocks}
              completedLessons={simState.completedLessons}
              onCompleteLesson={handleCompleteLesson}
              portfolioEquityRM={totalEquityRM}
              setSelectedStock={setSelectedStock}
              learnedTerms={simState.hasLearnedTerm}
              onLearnTerm={handleLearnGlossaryTerm}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileSettings
              navigateTo={navigateTo}
              userProfile={simState.userProfile}
              language={simState.language}
              toggleLanguage={toggleLanguage}
              userXP={simState.userXP}
              userLevel={simState.userLevel}
              learnedCount={simState.hasLearnedTerm.length}
              completedLessonsCount={simState.completedLessons.length}
              onResetAccount={handleResetAccount}
            />
          )}

          {currentScreen === 'portfolio' && (
            <PortfolioPage
              navigateTo={navigateTo}
              language={simState.language}
              portfolio={portfolio}
              cashSen={simState.cashSen}
              transactions={simState.transactions}
              sellStock={sellStock}
              onSimulateDividends={handleSimulateDividends}
              setSelectedStock={setSelectedStock}
            />
          )}
        </AppShell>
      )}

      <Toaster />
    </div>
  );
}
