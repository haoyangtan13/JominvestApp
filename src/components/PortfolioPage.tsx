import { useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, PieChart, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import type { Screen, PortfolioItem, StockData } from '../App';

interface PortfolioPageProps {
    navigateTo: (screen: Screen) => void;
    language: 'ENG' | 'BM';
    portfolio: PortfolioItem[];
    removeFromPortfolio: (stock: StockData) => void;
}

export function PortfolioPage({ navigateTo, language, portfolio, removeFromPortfolio }: PortfolioPageProps) {
    const texts = {
        ENG: {
            back: 'Back to Dashboard',
            myPortfolio: 'My Portfolio',
            totalValue: 'Total Value',
            totalHoldings: 'Total Holdings',
            sectorAllocation: 'Sector Allocation',
            holdings: 'Your Holdings',
            noHoldings: 'Your portfolio is empty. Start investing!',
            sell: 'Sell Position',
            currentPrice: 'Current Price',
            avgPrice: 'Avg Price',
            quantity: 'Qty',
            marketValue: 'Market Value',
            return: 'Return',
        },
        BM: {
            back: 'Kembali ke Papan Pemuka',
            myPortfolio: 'Portfolio Saya',
            totalValue: 'Jumlah Nilai',
            totalHoldings: 'Jumlah Pegangan',
            sectorAllocation: 'Peruntukan Sektor',
            holdings: 'Pegangan Anda',
            noHoldings: 'Portfolio anda kosong. Mulakan pelaburan!',
            sell: 'Jual Posisi',
            currentPrice: 'Harga Semasa',
            avgPrice: 'Purata Harga',
            quantity: 'Kuantiti',
            marketValue: 'Nilai Pasaran',
            return: 'Pulangan',
        }
    };

    const t = texts[language];

    // Calculations
    const totalValue = portfolio.reduce((acc, item) => acc + (parseFloat(item.stock.price) * item.quantity), 0).toFixed(2);

    // Group by sector for the chart
    const sectorData = useMemo(() => {
        const sectors: Record<string, number> = {};
        const colors = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea', '#0891b2'];

        portfolio.forEach((item) => {
            const sector = item.stock.sector || 'Other';
            sectors[sector] = (sectors[sector] || 0) + (parseFloat(item.stock.price) * item.quantity);
        });

        const total = Object.values(sectors).reduce((a, b) => a + b, 0) || 1; // Avoid divide by zero

        return Object.entries(sectors).map(([name, value], index) => ({
            name,
            value,
            percentage: Math.round((value / total) * 100),
            color: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value);
    }, [portfolio]);

    // Render a simple donut chart using CSS format
    // We'll create a conic-gradient string
    const conicGradient = useMemo(() => {
        if (portfolio.length === 0) return 'gray 100%';

        let currentDeg = 0;
        return sectorData.map((sector) => {
            const deg = (sector.value / parseFloat(totalValue)) * 360;
            const str = `${sector.color} ${currentDeg}deg ${currentDeg + deg}deg`;
            currentDeg += deg;
            return str;
        }).join(', ');
    }, [sectorData, totalValue, portfolio.length]);

    const calculateReturn = (currentPrice: number, avgPrice: number) => {
        if (avgPrice === 0) return '0.00';
        const percent = ((currentPrice - avgPrice) / avgPrice) * 100;
        return percent.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
                        <ArrowLeft className="mr-2" size={16} />
                        {t.back}
                    </Button>
                    <h1 className="text-xl font-bold text-gray-800">{t.myPortfolio}</h1>
                    <div className="w-10"></div> {/* Spacer for alignment */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* Wealth Summary Card */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Wallet className="text-green-100" />
                                <h3 className="text-lg font-medium text-green-50">{t.totalValue}</h3>
                            </div>
                            <p className="text-4xl font-bold">RM {totalValue}</p>
                            <p className="text-sm text-green-100 mt-2">{portfolio.length} {t.totalHoldings}</p>
                        </CardContent>
                    </Card>

                    {/* Sector Allocation - Interactive-ish Visualization */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PieChart size={20} className="text-gray-500" />
                                {t.sectorAllocation}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {/* The Graph */}
                                <div
                                    className="w-32 h-32 rounded-full flex-shrink-0 border-4 border-white shadow-sm"
                                    style={{
                                        background: `conic-gradient(${conicGradient})`,
                                    }}
                                >
                                    <div className="w-20 h-20 bg-white rounded-full m-5" /> {/* Inner hole for donut */}
                                </div>

                                {/* Legend */}
                                <div className="flex-1 space-y-2">
                                    {sectorData.length > 0 ? sectorData.map((sector) => (
                                        <div key={sector.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                                                <span className="text-gray-600">{sector.name}</span>
                                            </div>
                                            <span className="font-medium">{sector.percentage}%</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400">No data</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Holdings List */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-600" />
                        {t.holdings}
                    </h2>

                    {portfolio.length > 0 ? (
                        <div className="space-y-4">
                            {portfolio.map((item, index) => {
                                const stock = item.stock;
                                const returnPercent = calculateReturn(parseFloat(stock.price), item.averagePrice);
                                const isPositive = parseFloat(returnPercent) >= 0;

                                return (
                                    <Card key={`${stock.id}-${index}`} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-sm">
                                                    {stock.ticker.slice(0, 3)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{stock.name}</h4>
                                                    <p className="text-xs text-gray-500">{stock.ticker}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t.quantity}: {item.quantity}</span>
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t.avgPrice}: {item.averagePrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm text-gray-500">{t.currentPrice}</p>
                                                    <p className="font-medium">RM {stock.price}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">{t.marketValue}</p>
                                                    <p className="font-bold text-lg">RM {(parseFloat(stock.price) * item.quantity).toFixed(2)}</p>
                                                    <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isPositive ? '+' : ''}{returnPercent}%
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeFromPortfolio(stock)}
                                                    title="Sell All"
                                                >
                                                    {t.sell}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 text-lg">{t.noHoldings}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigateTo('dashboard')}
                            >
                                Find Stocks
                            </Button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
