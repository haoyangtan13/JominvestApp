import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, HelpCircle, TrendingUp, TrendingDown, Newspaper, DollarSign, Minus, Plus, BookOpen, Lightbulb, X, Trophy } from 'lucide-react';
import { Input } from './ui/input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import type { Screen } from '../App';
import type { StockData } from '../data/stocks';

interface StockDetailsProps {
    navigateTo: (screen: Screen) => void;
    language: 'ENG' | 'BM';
    stock: StockData | null;
    addToPortfolio: (stock: StockData, quantity: number) => void;
    addXP: (amount: number, reason: string) => void;
    hasLearnedTerm: string[];
    setHasLearnedTerm: (terms: string[]) => void;
}

export function StockDetails({ navigateTo, language, stock, addToPortfolio, addXP, hasLearnedTerm, setHasLearnedTerm }: StockDetailsProps) {
    const [quantity, setQuantity] = useState(1);
    const [learningTerm, setLearningTerm] = useState<string | null>(null);

    // Learning Definitions
    const definitions: Record<string, { ENG: { simple: string; detail: string }; BM: { simple: string; detail: string } }> = {
        'Price': {
            ENG: { simple: 'The current cost to buy one share.', detail: 'Stock prices change every second based on supply and demand.' },
            BM: { simple: 'Kos semasa untuk membeli satu saham.', detail: 'Harga saham berubah setiap saat berdasarkan permintaan dan penawaran.' }
        },
        'P/E Ratio': {
            ENG: { simple: 'Are you overpaying?', detail: 'Price-to-Earnings Ratio. A high number (above 20) means the stock might be expensive relative to its profit.' },
            BM: { simple: 'Adakah anda bayar terlalu mahal?', detail: 'Nisbah Harga-kepada-Pendapatan. Nombor tinggi (atas 20) bermakna saham mungkin mahal berbanding keuntungannya.' }
        },
        'Market Cap': {
            ENG: { simple: 'How big is the company?', detail: 'The total value of all shares combined. Large cap = stable, Small cap = risky but potential growth.' },
            BM: { simple: 'Berapa besar syarikat ini?', detail: 'Jumlah nilai semua saham digabungkan. Modal besar = stabil, Modal kecil = berisiko tapi potensi tumbuh.' }
        },
        'Dividend Yield': {
            ENG: { simple: 'Your annual bonus.', detail: 'The percentage of the stock price that the company pays out as cash to shareholders each year.' },
            BM: { simple: 'Bonus tahunan anda.', detail: 'Peratusan harga saham yang syarikat bayar sebagai tunai kepada pemegang saham setiap tahun.' }
        },
        'Volume': {
            ENG: { simple: 'How popular is this stock?', detail: 'The number of shares traded today. High volume means it is easy to buy or sell quickly.' },
            BM: { simple: 'Berapa popular saham ini?', detail: 'Bilangan saham yang didagangkan hari ini. Volum tinggi bermakna ia mudah dibeli atau dijual dengan cepat.' }
        }
    };

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
            overview: 'Overview',
            financials: 'Financials',
            news: 'News',
            buy: 'Buy',
            sell: 'Sell',
            revenue: 'Revenue',
            netProfit: 'Net Profit',
            debtEquity: 'Debt/Equity',
            sector: 'Sector',
            units: 'Units',
            estCost: 'Est. Cost',
            learnMore: 'Tap to Learn',
            xpReward: '+10 XP',
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
            overview: 'Gambaran Keseluruhan',
            financials: 'Kewangan',
            news: 'Berita',
            buy: 'Beli',
            sell: 'Jual',
            revenue: 'Hasil',
            netProfit: 'Untung Bersih',
            debtEquity: 'Hutang/Ekuiti',
            sector: 'Sektor',
            units: 'Unit',
            estCost: 'Anggaran Kos',
            learnMore: 'Ketik untuk Belajar',
            xpReward: '+10 XP',
        }
    };

    const t = texts[language];

    // Default fallback if stock is null
    if (!stock) {
        return <div>Loading...</div>;
    }

    // Handle quantity changes safely
    const handleQuantityChange = (val: string) => {
        const num = parseInt(val);
        if (!isNaN(num) && num > 0) {
            setQuantity(num);
        }
    };

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => Math.max(1, q - 1));

    const totalCost = (parseFloat(stock.price) * quantity).toFixed(2);

    const handleTermClick = (termKey: string) => {
        // XP Logic
        if (!hasLearnedTerm.includes(termKey)) {
            addXP(10, `Learned about ${termKey}`);
            setHasLearnedTerm([...hasLearnedTerm, termKey]);
        }

        // Toggle expansion
        setLearningTerm(learningTerm === termKey ? null : termKey);
    };

    const renderMetric = (label: string, value: string, tooltip: string, termKey: string) => {
        const isExpanded = learningTerm === termKey;
        const def = definitions[termKey];
        const isLearned = hasLearnedTerm.includes(termKey);

        return (
            <div className="flex flex-col gap-2">
                {/* Main Metric Row */}
                <div
                    className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden relative ${isExpanded ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'bg-white hover:bg-gray-50 border border-transparent'}`}
                    onClick={() => handleTermClick(termKey)}
                >
                    {/* XP Badge for unlearned terms */}
                    {!isLearned && (
                        <div className="absolute right-0 top-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            {t.xpReward}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${isExpanded ? 'text-blue-700' : 'text-gray-700'}`}>
                            {label}
                        </span>
                        <div className="bg-blue-100 text-blue-600 rounded-full p-1 opacity-70">
                            <HelpCircle size={14} />
                        </div>
                    </div>
                    <span className="text-xl font-semibold">{value}</span>
                </div>

                {/* Inline Educational Content */}
                {isExpanded && def && (
                    <div className="bg-white border-l-4 border-blue-500 pl-4 py-3 pr-3 shadow-sm rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                <Lightbulb size={18} className="text-amber-500" />
                                {language === 'ENG' ? 'Quick Learn' : 'Belajar Cepat'}
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                                e.stopPropagation();
                                setLearningTerm(null);
                            }}>
                                <X size={14} />
                            </Button>
                        </div>
                        <p className="text-gray-800 font-medium mb-2 leading-snug">{def[language].simple}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{def[language].detail}</p>

                        {/* Learned Badge */}
                        {isLearned && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                <Trophy size={14} />
                                {language === 'ENG' ? 'Knowledge Gained!' : 'Ilmu Diperolehi!'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

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
                                {stock.ticker.slice(0, 3)}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{stock.name}</CardTitle>
                                <p className="text-gray-500">{stock.ticker} · Bursa Malaysia</p>
                                <p className="text-sm text-blue-600 font-medium">{stock.sector}</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                        <TabsTrigger value="financials">{t.financials}</TabsTrigger>
                        <TabsTrigger value="news">{t.news}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">

                        {/* AI Insight Card */}
                        <Card className="bg-blue-50 border-blue-200 shadow-sm mb-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                                    <div className="bg-blue-200 p-1.5 rounded-lg text-blue-700">
                                        <TrendingUp size={18} />
                                    </div>
                                    {language === 'ENG' ? 'JomINVEST AI Insight' : 'Wawasan AI JomINVEST'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-900 font-bold mb-1">
                                    {stock.isPositive
                                        ? (language === 'ENG' ? "Bullish Momentum Detected 🚀" : "Momentum Naik Dikesan 🚀")
                                        : (language === 'ENG' ? "Attractive Entry Point? 📉" : "Titik Masuk Menarik? 📉")}
                                </p>
                                <p className="text-sm text-blue-800/80 leading-relaxed">
                                    {language === 'ENG'
                                        ? `${stock.name} is showing ${stock.isPositive ? 'strong' : 'weak'} short-term performance. With a P/E of ${stock.peRatio}, it looks ${parseFloat(stock.peRatio) > 20 ? 'premium priced' : 'undervalued'} compared to the sector average.`
                                        : `${stock.name} menunjukkan prestasi jangka pendek yang ${stock.isPositive ? 'kukuh' : 'lemah'}. Dengan P/E ${stock.peRatio}, ia kelihatan ${parseFloat(stock.peRatio) > 20 ? 'harga premium' : 'terkurang nilai'} berbanding purata sektor.`}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Price Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.priceChart}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full bg-white rounded-lg p-2 border border-gray-200">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={stock.history}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                                }}
                                                minTickGap={30}
                                            />
                                            <YAxis domain={['auto', 'auto']} />
                                            <RechartsTooltip
                                                formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Price']}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            />
                                            <Area type="monotone" dataKey="price" stroke="#16a34a" fillOpacity={1} fill="url(#colorPrice)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{t.price}</p>
                                        <p className="text-3xl">RM {stock.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Today</p>
                                        <p className={`text-xl flex items-center gap-2 ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {stock.changePercent}
                                            {stock.isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700">{stock.description}</p>
                                </div>

                                {/* Buy/Sell Zone */}
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex flex-col md:flex-row gap-6 items-end">

                                        {/* Quantity Selector */}
                                        <div className="flex-1 w-full space-y-2">
                                            <label className="text-sm font-medium text-gray-700">{t.units}</label>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" onClick={decrement}>
                                                    <Minus size={16} />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                                    className="text-center font-bold text-lg"
                                                />
                                                <Button variant="outline" size="icon" onClick={increment}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Est Cost */}
                                        <div className="flex-1 w-full space-y-1">
                                            <p className="text-sm text-gray-500">{t.estCost}</p>
                                            <p className="text-2xl font-bold text-gray-900">RM {totalCost}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button className="flex-1 bg-red-600 hover:bg-red-700" size="lg">
                                                {t.sell}
                                            </Button>
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 min-w-[120px]"
                                                size="lg"
                                                onClick={() => addToPortfolio(stock, quantity)}
                                            >
                                                {t.buy}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Key Metrics with Inline Learning - XP ENABLED */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.keyMetrics}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TooltipProvider>
                                    <div className="space-y-4">
                                        {renderMetric(t.peRatio, stock.peRatio, t.peTooltip, 'P/E Ratio')}
                                        {renderMetric(t.dividend, stock.dividendYield, t.dividendTooltip, 'Dividend Yield')}
                                        {renderMetric(t.marketCap, `RM ${stock.marketCap}`, t.marketCapTooltip, 'Market Cap')}
                                        {renderMetric(t.volume, stock.volume, t.volumeTooltip, 'Volume')}
                                    </div>
                                </TooltipProvider>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financials" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="text-green-600" />
                                    {t.financials}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">{t.revenue}</span>
                                    <span className="font-semibold text-lg">RM {stock.revenue}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">{t.netProfit}</span>
                                    <span className="font-semibold text-lg text-green-600">RM {stock.netProfit}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">{t.debtEquity}</span>
                                    <span className="font-semibold text-lg">{stock.debtEquity}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="news" className="space-y-6 mt-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            <Newspaper className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1 line-clamp-2">
                                                {stock.name} reports strong quarterly earnings growth despite market volatility
                                            </h4>
                                            <p className="text-xs text-gray-500">2 hours ago · Financial Daily</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
