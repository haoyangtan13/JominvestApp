import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import type { Screen } from '../App';

interface AIRecommendationProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
}

export function AIRecommendation({ navigateTo, userProfile, language }: AIRecommendationProps) {
  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      currentPrice: 'Current Price',
      change24h: '24h Change',
      aiAnalysis: 'JomINVEST AI Analysis',
      whyRecommend: 'Why JomINVEST AI Recommends This:',
      reason1: 'Strong Fundamentals',
      reason1desc: 'Consistent revenue growth and healthy profit margins',
      reason2: 'Positive Market Sentiment',
      reason2desc: 'Increasing institutional interest and positive analyst ratings',
      reason3: 'Fits Your Profile',
      reason3desc: `Matches your ${userProfile || 'Jom-Explorer (Aggressive)'} investment style`,
      addToPortfolio: 'Add to Simulated Portfolio',
      viewDetails: 'View Full Stock Details',
      keyMetrics: 'Key Metrics',
      pe: 'P/E Ratio',
      dividend: 'Dividend Yield',
      marketCap: 'Market Cap',
    },
    BM: {
      back: 'Kembali ke Dashboard',
      currentPrice: 'Harga Semasa',
      change24h: 'Perubahan 24j',
      aiAnalysis: 'Analisis AI JomINVEST',
      whyRecommend: 'Mengapa AI JomINVEST Mengesyorkan Ini:',
      reason1: 'Asas Yang Kukuh',
      reason1desc: 'Pertumbuhan pendapatan konsisten dan margin keuntungan sihat',
      reason2: 'Sentimen Pasaran Positif',
      reason2desc: 'Minat institusi meningkat dan penilaian penganalisis positif',
      reason3: 'Sesuai Dengan Profil Anda',
      reason3desc: `Sepadan dengan gaya pelaburan ${userProfile || 'Jom-Explorer (Agresif)'} anda`,
      addToPortfolio: 'Tambah ke Portfolio Simulasi',
      viewDetails: 'Lihat Butiran Saham Penuh',
      keyMetrics: 'Metrik Utama',
      pe: 'Nisbah P/E',
      dividend: 'Hasil Dividen',
      marketCap: 'Modal Pasaran',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stock Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white text-xl">
                  TNB
                </div>
                <div>
                  <CardTitle className="text-2xl">Tenaga Nasional Berhad</CardTitle>
                  <p className="text-gray-500">TENAGA · Bursa Malaysia</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Sparkles size={14} className="mr-1" />
                AI Pick
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t.currentPrice}</p>
                <p className="text-3xl">RM 17.50</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.change24h}</p>
                <p className="text-2xl text-green-600 flex items-center gap-2">
                  +2.4%
                  <TrendingUp size={20} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="text-green-600" size={24} />
              <CardTitle className="text-green-900">{t.aiAnalysis}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg">{t.whyRecommend}</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 bg-white p-4 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-green-900 mb-1">{t.reason1}</h4>
                  <p className="text-sm text-gray-600">{t.reason1desc}</p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-green-900 mb-1">{t.reason2}</h4>
                  <p className="text-sm text-gray-600">{t.reason2desc}</p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-green-900 mb-1">{t.reason3}</h4>
                  <p className="text-sm text-gray-600">{t.reason3desc}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.keyMetrics}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">{t.pe}</p>
                <p className="text-2xl">14.2</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">{t.dividend}</p>
                <p className="text-2xl">3.5%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">{t.marketCap}</p>
                <p className="text-2xl">RM 98B</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {t.addToPortfolio}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            size="lg"
            onClick={() => navigateTo('stock-details')}
          >
            {t.viewDetails}
          </Button>
        </div>
      </main>
    </div>
  );
}
