import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RiskQuestionnaire } from './components/RiskQuestionnaire';
import { Dashboard } from './components/Dashboard';
import { AIRecommendation } from './components/AIRecommendation';
import { StockDetails } from './components/StockDetails';
import { EducationalHub } from './components/EducationalHub';
import { ProfileSettings } from './components/ProfileSettings';
import { PortfolioPage } from './components/PortfolioPage';
import { StockData } from './data/stocks';
import { toast, Toaster } from 'sonner';

export type Screen = 'login' | 'questionnaire' | 'dashboard' | 'ai-recommendation' | 'stock-details' | 'educational-hub' | 'profile' | 'portfolio';

export interface PortfolioItem {
  stock: StockData;
  quantity: number;
  averagePrice: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [language, setLanguage] = useState<'ENG' | 'BM'>('ENG');
  const [userProfile, setUserProfile] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Gamification State
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [hasLearnedTerm, setHasLearnedTerm] = useState<string[]>([]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ENG' ? 'BM' : 'ENG');
  };

  const addXP = (amount: number, reason: string) => {
    const newXP = userXP + amount;
    setUserXP(newXP);

    // Simple level up logic: Level up every 100 XP
    const newLevel = Math.floor(newXP / 100) + 1;
    if (newLevel > userLevel) {
      setUserLevel(newLevel);
      toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
    } else {
      toast.success(`+${amount} XP: ${reason}`);
    }
  };

  const addToPortfolio = (stock: StockData, quantity: number) => {
    setPortfolio(prevPortfolio => {
      const existingItemIndex = prevPortfolio.findIndex(item => item.stock.id === stock.id);

      addXP(50, `Bought ${stock.ticker}`); // XP Reward for investing

      if (existingItemIndex > -1) {
        // Update existing item
        const newPortfolio = [...prevPortfolio];
        const item = newPortfolio[existingItemIndex];

        // Calculate new weighted average price
        const totalCost = (item.quantity * item.averagePrice) + (quantity * parseFloat(stock.price));
        const newQuantity = item.quantity + quantity;
        const newAveragePrice = totalCost / newQuantity;

        newPortfolio[existingItemIndex] = {
          ...item,
          quantity: newQuantity,
          averagePrice: newAveragePrice
        };

        toast.success(`Bought ${quantity} more units of ${stock.name}!`);
        return newPortfolio;
      } else {
        // Add new item
        toast.success(`Added ${quantity} units of ${stock.name} to portfolio!`);
        return [...prevPortfolio, {
          stock,
          quantity,
          averagePrice: parseFloat(stock.price)
        }];
      }
    });
  };

  const removeFromPortfolio = (stockToRemove: StockData) => {
    setPortfolio(prevPortfolio => prevPortfolio.filter(item => item.stock.id !== stockToRemove.id));
    toast.success(`Sold all shares of ${stockToRemove.name}!`);
    addXP(30, `Sold ${stockToRemove.ticker}`); // XP Reward for selling
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {currentScreen === 'login' && (
        <LoginScreen
          navigateTo={navigateTo}
          language={language}
          toggleLanguage={toggleLanguage}
        />
      )}
      {currentScreen === 'questionnaire' && (
        <RiskQuestionnaire
          navigateTo={navigateTo}
          setUserProfile={setUserProfile}
          language={language}
        />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard
          navigateTo={navigateTo}
          userProfile={userProfile}
          language={language}
          setSelectedStock={setSelectedStock}
          portfolio={portfolio}
          userXP={userXP}
          userLevel={userLevel}
        />
      )}
      {currentScreen === 'ai-recommendation' && (
        <AIRecommendation
          navigateTo={navigateTo}
          userProfile={userProfile}
          language={language}
        />
      )}
      {currentScreen === 'stock-details' && (
        <StockDetails
          navigateTo={navigateTo}
          language={language}
          stock={selectedStock}
          addToPortfolio={addToPortfolio}
          addXP={addXP}
          hasLearnedTerm={hasLearnedTerm}
          setHasLearnedTerm={setHasLearnedTerm}
        />
      )}
      {currentScreen === 'educational-hub' && (
        <EducationalHub
          navigateTo={navigateTo}
          language={language}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileSettings
          navigateTo={navigateTo}
          userProfile={userProfile}
          language={language}
          toggleLanguage={toggleLanguage}
          userXP={userXP}
          userLevel={userLevel}
        />
      )}
      {currentScreen === 'portfolio' && (
        <PortfolioPage
          navigateTo={navigateTo}
          language={language}
          portfolio={portfolio}
          removeFromPortfolio={removeFromPortfolio}
        />
      )}

      <Toaster />
    </div>
  );
}
