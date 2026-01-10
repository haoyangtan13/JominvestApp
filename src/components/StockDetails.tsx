import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ArrowLeft, HelpCircle, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface StockDetailsProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
}

export function StockDetails({ navigateTo, language }: StockDetailsProps) {
  const texts = {
    ENG: {
      back: 'Back',
      stockDetails: 'Stock Details',
      priceChart: 'Price Chart',
      keyMetrics: 'Key Metrics',
      price: 'Price',
      peRatio: 'P/E Ratio',
      peTooltip: 'Price-to-Earnings Ratio: Shows how much investors are willing to pay for each ringgit of earnings. Lower values may indicate a better value.',
      dividend: 'Dividend Yield',
      dividendTooltip: 'Annual dividend payment as a percentage of stock price. Higher yields mean more income for shareholders.',
      marketCap: 'Market Cap',
      marketCapTooltip: 'Total value of all company shares. It represents the company\'s size in the market.',
      volume: 'Volume',
      volumeTooltip: 'Number of shares traded today. Higher volume indicates more investor interest.',
      addToPortfolio: 'Add to Portfolio',
    },
    BM: {
      back: 'Kembali',
      stockDetails: 'Butiran Saham',
      priceChart: 'Carta Harga',
      keyMetrics: 'Metrik Utama',
      price: 'Harga',
      peRatio: 'Nisbah P/E',
      peTooltip: 'Nisbah Harga-kepada-Pendapatan: Menunjukkan berapa banyak pelabur sanggup bayar untuk setiap ringgit pendapatan. Nilai rendah mungkin menunjukkan nilai lebih baik.',
      dividend: 'Hasil Dividen',
      dividendTooltip: 'Pembayaran dividen tahunan sebagai peratusan harga saham. Hasil tinggi bermakna lebih pendapatan untuk pemegang saham.',
      marketCap: 'Modal Pasaran',
      marketCapTooltip: 'Jumlah nilai semua saham syarikat. Ia mewakili saiz syarikat di pasaran.',
      volume: 'Volum',
      volumeTooltip: 'Bilangan saham yang didagangkan hari ini. Volum tinggi menunjukkan lebih minat pelabur.',
      addToPortfolio: 'Tambah ke Portfolio',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
          <h1 className="text-xl">{t.stockDetails}</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stock Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white text-xl">
                TNB
              </div>
              <div>
                <CardTitle className="text-2xl">Tenaga Nasional Berhad</CardTitle>
                <p className="text-gray-500">TENAGA · Bursa Malaysia</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t.priceChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBjaGFydCUyMGdyYXBofGVufDF8fHx8MTc2MTg2MDk2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Stock price chart"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t.price}</p>
                <p className="text-3xl">RM 17.50</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-xl text-green-600 flex items-center gap-2">
                  +2.4% <TrendingUp size={20} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics with Jargon Buster */}
        <Card>
          <CardHeader>
            <CardTitle>{t.keyMetrics}</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="space-y-4">
                {/* Price */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{t.price}</span>
                  <span className="text-xl">RM 17.50</span>
                </div>

                {/* P/E Ratio with Tooltip */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{t.peRatio}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <HelpCircle size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t.peTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xl">14.2</span>
                </div>

                {/* Dividend Yield with Tooltip */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{t.dividend}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <HelpCircle size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t.dividendTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xl">3.5%</span>
                </div>

                {/* Market Cap with Tooltip */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{t.marketCap}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <HelpCircle size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t.marketCapTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xl">RM 98.2B</span>
                </div>

                {/* Volume with Tooltip */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{t.volume}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <HelpCircle size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t.volumeTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xl">2.4M</span>
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {t.addToPortfolio}
        </Button>
      </main>
    </div>
  );
}
