import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RiskQuestionnaire } from './components/RiskQuestionnaire';
import { Dashboard } from './components/Dashboard';
import { AIRecommendation } from './components/AIRecommendation';
import { StockDetails } from './components/StockDetails';
import { EducationalHub } from './components/EducationalHub';
import { ProfileSettings } from './components/ProfileSettings';

export type Screen = 'login' | 'questionnaire' | 'dashboard' | 'ai-recommendation' | 'stock-details' | 'educational-hub' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [language, setLanguage] = useState<'ENG' | 'BM'>('ENG');
  const [userProfile, setUserProfile] = useState<string>('');

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ENG' ? 'BM' : 'ENG');
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
        />
      )}
    </div>
  );
}
