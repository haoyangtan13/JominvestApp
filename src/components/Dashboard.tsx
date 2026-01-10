import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, TrendingDown, Search, Lightbulb, BookOpen, Menu, Plus, Sparkles, User } from 'lucide-react';
import { ChatbotModal } from './ChatbotModal';
import type { Screen } from '../App';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
}

const topPicks = [
  { name: 'Tenaga Nasional', ticker: 'TENAGA', price: 'RM 17.50', change: '+2.4%', positive: true },
  { name: 'Public Bank', ticker: 'PBBANK', price: 'RM 4.21', change: '+1.8%', positive: true },
  { name: 'Maybank', ticker: 'MAYBANK', price: 'RM 9.15', change: '+3.2%', positive: true },
  { name: 'CIMB Group', ticker: 'CIMB', price: 'RM 6.88', change: '-0.5%', positive: false },
];

const topGainers = [
  { name: 'Maybank', ticker: 'MAYBANK', change: '+4.1%' },
  { name: 'Public Bank', ticker: 'PBBANK', change: '+3.8%' },
  { name: 'Tenaga Nasional', ticker: 'TENAGA', change: '+2.4%' },
];

const topLosers = [
  { name: 'AirAsia Group', ticker: 'AIRASIA', change: '-3.2%' },
  { name: 'Genting Berhad', ticker: 'GENTING', change: '-2.7%' },
  { name: 'Petronas Dagangan', ticker: 'PETDAG', change: '-1.9%' },
];

const watchlist = [
  { name: 'Tenaga Nasional', ticker: 'TENAGA', price: 'RM 17.50', sparkline: [12, 15, 13, 17, 16, 18, 17.5] },
  { name: 'Maybank', ticker: 'MAYBANK', price: 'RM 9.15', sparkline: [8, 8.5, 9, 8.8, 9.2, 9.1, 9.15] },
  { name: 'Public Bank', ticker: 'PBBANK', price: 'RM 4.21', sparkline: [4, 4.1, 4.2, 4.15, 4.18, 4.2, 4.21] },
];

export function Dashboard({ navigateTo, userProfile, language }: DashboardProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const texts = {
    ENG: {
      welcome: 'Welcome back, Tan!',
      profile: 'Your Investor Profile',
      portfolio: 'My Simulated Portfolio',
      topPicks: 'Top AI Picks for You',
      searchPlaceholder: 'Search Bursa Malaysia stocks...',
      viewDetails: 'View Details',
      education: 'Educational Hub',
      exploreMore: 'Explore',
      marketToday: 'Bursa Market Today',
      topGainers: 'Top Gainers',
      topLosers: 'Top Losers',
      myWatchlist: 'My Watchlist',
      addToWatchlist: '+ Add to Watchlist',
    },
    BM: {
      welcome: 'Selamat kembali, Tan!',
      profile: 'Profil Pelabur Anda',
      portfolio: 'Portfolio Simulasi Saya',
      topPicks: 'Pilihan Teratas AI Untuk Anda',
      searchPlaceholder: 'Cari saham Bursa Malaysia...',
      viewDetails: 'Lihat Butiran',
      education: 'Hab Pendidikan',
      exploreMore: 'Terokai',
      marketToday: 'Bursa Hari Ini',
      topGainers: 'Penaik Teratas',
      topLosers: 'Penurun Teratas',
      myWatchlist: 'Senarai Pantau Saya',
      addToWatchlist: '+ Tambah ke Senarai Pantau',
    }
  };

  const t = texts[language];

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const width = 80;
    const height = 30;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-green-600"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={28} strokeWidth={2.5} />
            <h1 className="text-2xl">JomINVEST</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateTo('profile')}>
            <User />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl mb-2">{t.welcome}</h2>
              <p className="text-gray-600">
                {t.profile}: <span className="text-green-600">{userProfile || 'Jom-Explorer (Aggressive)'}</span>
              </p>
            </div>

            {/* Portfolio Card */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
              <CardHeader>
                <CardTitle className="text-white">{t.portfolio}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-4xl">RM 105,243.50</div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-100 text-xl">+5.2%</span>
                    <TrendingUp className="text-green-100" size={20} />
                  </div>
                  <p className="text-green-100 text-sm">vs. last month</p>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-10"
                onClick={() => navigateTo('stock-details')}
              />
            </div>

            {/* Top AI Picks Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-green-600" size={24} />
                <h3 className="text-xl">{t.topPicks}</h3>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {topPicks.map((stock, index) => (
                  <Card 
                    key={index} 
                    className="min-w-[280px] snap-start cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigateTo('ai-recommendation')}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{stock.name}</CardTitle>
                          <p className="text-sm text-gray-500">{stock.ticker}</p>
                        </div>
                        <Lightbulb className="text-yellow-500" size={20} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl">{stock.price}</div>
                          <div className={`text-sm ${stock.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          {t.viewDetails}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Educational Hub Link */}
            <Card 
              className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateTo('educational-hub')}
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg">{t.education}</h3>
                      <p className="text-sm text-gray-600">
                        {language === 'ENG' ? 'Learn investing basics' : 'Pelajari asas pelaburan'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">{t.exploreMore}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Market Movers & Watchlist */}
          <div className="space-y-8">
            {/* Market Movers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  {t.marketToday}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gainers">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gainers">{t.topGainers}</TabsTrigger>
                    <TabsTrigger value="losers">{t.topLosers}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gainers" className="space-y-3 mt-4">
                    {topGainers.map((stock, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div>
                          <p className="text-sm">{stock.name}</p>
                          <p className="text-xs text-gray-500">{stock.ticker}</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={16} />
                          <span className="text-sm">{stock.change}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="losers" className="space-y-3 mt-4">
                    {topLosers.map((stock, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div>
                          <p className="text-sm">{stock.name}</p>
                          <p className="text-xs text-gray-500">{stock.ticker}</p>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown size={16} />
                          <span className="text-sm">{stock.change}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* My Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>{t.myWatchlist}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchlist.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
                        {stock.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm">{stock.name}</p>
                        <p className="text-xs text-gray-500">{stock.ticker}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderSparkline(stock.sparkline)}
                      <p className="text-sm">{stock.price}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus size={16} className="mr-2" />
                  {t.addToWatchlist}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Chatbot */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-20"
      >
        <Sparkles size={24} />
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        language={language}
      />
    </div>
  );
}
