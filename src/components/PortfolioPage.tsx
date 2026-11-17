import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import {
    ArrowLeft,
    PieChart,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    Stethoscope,
    ShieldCheck,
    AlertTriangle,
    Plus,
    History,
    Coins,
    ExternalLink
} from 'lucide-react';
import type { Screen, PortfolioItem, StockData, TradeRecord } from '../App';

interface PortfolioPageProps {
    navigateTo: (screen: Screen) => void;
    language: 'ENG' | 'BM';
    portfolio: PortfolioItem[];
    cashBalance: number;
    tradeHistory: TradeRecord[];
    userProfile: string;
    removeFromPortfolio: (stock: StockData) => void;
    sellFromPortfolio: (stockToSell: StockData, quantityToSell?: number) => boolean;
    setSelectedStock: (stock: StockData) => void;
    onTopUpCash: (amount?: number) => void;
}

export function PortfolioPage({
    navigateTo,
    language,
    portfolio,
    cashBalance,
    tradeHistory,
    userProfile,
    removeFromPortfolio,
    sellFromPortfolio,
    setSelectedStock,
    onTopUpCash
}: PortfolioPageProps) {
    const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');

    const texts = {
        ENG: {
            back: 'Back to Dashboard',
            myPortfolio: 'My Portfolio',
            totalEquity: 'Total Account Equity',
            holdingsValueLabel: 'Stock Holdings Value',
            virtualCash: 'Available Virtual Cash',
            topUpBtn: '+ Top Up RM 5,000',
            unrealizedPL: 'Total Unrealized P/L',
            estDividend: 'Est. Annual Passive Dividend',
            perYear: '/year',
            perMonth: '/month',
            totalHoldings: 'Holdings',
            sectorAllocation: 'Sector Allocation',
            aiDoctorTitle: 'AI Portfolio Doctor ("Klinik Portfolio AI")',
            aiDoctorSub: 'Real-time portfolio health check across diversification, Shariah & risk alignment',
            diversificationTitle: '1. Sector Diversification Score',
            shariahTitle: '2. Shariah Compliance Breakdown',
            riskTitle: '3. Risk Profile Alignment',
            holdings: 'Your Holdings',
            txHistory: 'Transaction History',
            noHoldings: 'Your portfolio is empty. Start investing on Bursa Malaysia!',
            noHistory: 'No simulated trades executed yet.',
            sellAll: 'Sell All',
            sellHalf: 'Sell 50%',
            sellOne: '-1 Unit',
            currentPrice: 'Current Price',
            avgPrice: 'Avg Cost',
            quantity: 'Qty',
            marketValue: 'Market Value',
            return: 'Return',
            findStocks: 'Explore Stocks',
            bursaFees: 'Bursa Fees',
            netAmount: 'Net Amount',
            viewDetails: 'Click card to inspect stock'
        },
        BM: {
            back: 'Kembali ke Papan Pemuka',
            myPortfolio: 'Portfolio Saya',
            totalEquity: 'Jumlah Ekuiti Akaun',
            holdingsValueLabel: 'Nilai Pegangan Saham',
            virtualCash: 'Tunai Maya Tersedia',
            topUpBtn: '+ Tambah RM 5,000',
            unrealizedPL: 'Jumlah Untung/Rugi Belum Realisasi',
            estDividend: 'Anggaran Dividen Pasif Tahunan',
            perYear: '/tahun',
            perMonth: '/bulan',
            totalHoldings: 'Pegangan',
            sectorAllocation: 'Peruntukan Sektor',
            aiDoctorTitle: 'Klinik Portfolio AI ("AI Portfolio Doctor")',
            aiDoctorSub: 'Pemeriksaan kesihatan portfolio masa nyata merentasi kepelbagaian, Syariah & profil risiko',
            diversificationTitle: '1. Skor Kepelbagaian Sektor',
            shariahTitle: '2. Pecahan Pematuhan Syariah',
            riskTitle: '3. Penjajaran Profil Risiko',
            holdings: 'Pegangan Anda',
            txHistory: 'Sejarah Transaksi',
            noHoldings: 'Portfolio anda kosong. Mulakan pelaburan di Bursa Malaysia!',
            noHistory: 'Tiada dagangan simulasi dilakukan lagi.',
            sellAll: 'Jual Semua',
            sellHalf: 'Jual 50%',
            sellOne: '-1 Unit',
            currentPrice: 'Harga Semasa',
            avgPrice: 'Kos Purata',
            quantity: 'Kuantiti',
            marketValue: 'Nilai Pasaran',
            return: 'Pulangan',
            findStocks: 'Teroka Saham',
            bursaFees: 'Yuran Bursa',
            netAmount: 'Jumlah Bersih',
            viewDetails: 'Klik kad untuk lihat saham'
        }
    };

    const t = texts[language];

    // Financial Calculations
    const holdingsValue = useMemo(() => {
        return portfolio.reduce((acc, item) => acc + parseFloat(item.stock.price) * item.quantity, 0);
    }, [portfolio]);

    const totalCostBasis = useMemo(() => {
        return portfolio.reduce((acc, item) => acc + item.averagePrice * item.quantity, 0);
    }, [portfolio]);

    const totalAccountEquity = holdingsValue + cashBalance;
    const unrealizedPL = holdingsValue - totalCostBasis;
    const unrealizedPLPercent = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0;

    // Estimated Annual Passive Dividend Income
    const annualDividend = useMemo(() => {
        return portfolio.reduce((acc, item) => {
            const val = parseFloat(item.stock.price) * item.quantity;
            const yieldPct = parseFloat(item.stock.dividendYield.replace('%', '')) || 0;
            return acc + val * (yieldPct / 100);
        }, 0);
    }, [portfolio]);

    const monthlyDividend = annualDividend / 12;

    // Group by sector for the chart
    const sectorData = useMemo(() => {
        const sectors: Record<string, number> = {};
        const colors = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea', '#0891b2', '#db2777'];

        portfolio.forEach(item => {
            const sector = item.stock.sector || 'Other';
            sectors[sector] = (sectors[sector] || 0) + parseFloat(item.stock.price) * item.quantity;
        });

        const total = Object.values(sectors).reduce((a, b) => a + b, 0) || 1;

        return Object.entries(sectors)
            .map(([name, value], index) => ({
                name,
                value,
                percentage: Math.round((value / total) * 100),
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, [portfolio]);

    // Conic gradient for donut chart
    const conicGradient = useMemo(() => {
        if (portfolio.length === 0 || holdingsValue <= 0) return '#e5e7eb 100%';

        let currentDeg = 0;
        return sectorData
            .map(sector => {
                const deg = (sector.value / holdingsValue) * 360;
                const str = `${sector.color} ${currentDeg}deg ${currentDeg + deg}deg`;
                currentDeg += deg;
                return str;
            })
            .join(', ');
    }, [sectorData, holdingsValue, portfolio.length]);

    // AI Portfolio Doctor Diagnostics
    const diagnostics = useMemo(() => {
        if (portfolio.length === 0 || holdingsValue <= 0) {
            return {
                diversificationStatus: 'neutral' as const,
                diversificationText:
                    language === 'ENG'
                        ? 'No stocks in portfolio yet. Aim to spread investments across at least 3 Bursa sectors (e.g. Banking, Utilities, Tech).'
                        : 'Tiada saham dalam portfolio lagi. Sasarkan pelaburan merentasi sekurang-kurangnya 3 sektor Bursa.',
                shariahPct: 0,
                shariahValue: 0,
                shariahText:
                    language === 'ENG'
                        ? '0% invested in Shariah-compliant counters. Look for the ☪️ Shariah badge when picking stocks.'
                        : '0% dilaburkan dalam kaunter patuh Syariah. Cari lencana ☪️ Syariah semasa memilih saham.',
                riskText:
                    language === 'ENG'
                        ? `Your profile is "${userProfile}". Start adding stocks from the Dashboard or AI Recommendations to evaluate risk alignment.`
                        : `Profil anda ialah "${userProfile}". Mula menambah saham daripada Papan Pemuka atau Cadangan AI.`
            };
        }

        const topSector = sectorData[0];
        const numSectors = sectorData.length;
        let diversificationStatus: 'good' | 'warn' | 'neutral' = 'neutral';
        let diversificationText = '';

        if (topSector && topSector.percentage > 60) {
            diversificationStatus = 'warn';
            diversificationText =
                language === 'ENG'
                    ? `Concentration Warning: ${topSector.percentage}% of your portfolio is concentrated in ${topSector.name}. Consider diversifying into other sectors to reduce sector-specific risk.`
                    : `Amaran Tumpuan: ${topSector.percentage}% daripada portfolio anda tertumpu dalam ${topSector.name}. Pertimbangkan untuk mempelbagaikan ke sektor lain.`;
        } else if (numSectors >= 3) {
            diversificationStatus = 'good';
            diversificationText =
                language === 'ENG'
                    ? `Well Diversified! Your holdings are spread across ${numSectors} sectors (Top: ${topSector.name} at ${topSector.percentage}%). Great job managing sector risk!`
                    : `Kepelbagaian Terbaik! Pegangan anda tersebar merentasi ${numSectors} sektor (Tertinggi: ${topSector.name} pada ${topSector.percentage}%).`;
        } else {
            diversificationStatus = 'neutral';
            diversificationText =
                language === 'ENG'
                    ? `Moderate Diversification: You hold ${numSectors} sector(s). Adding 1-2 more uncorrelated sectors will strengthen your portfolio resilience.`
                    : `Kepelbagaian Sederhana: Anda memegang ${numSectors} sektor. Menambah 1-2 lagi sektor berbeza akan mengukuhkan portfolio anda.`;
        }

        const shariahValue = portfolio.reduce((acc, item) => {
            return acc + (item.stock.isShariah ? parseFloat(item.stock.price) * item.quantity : 0);
        }, 0);
        const shariahPct = Math.round((shariahValue / holdingsValue) * 100);
        const shariahText =
            language === 'ENG'
                ? `${shariahPct}% (RM ${shariahValue.toFixed(2)}) of your stock holdings are SC Malaysia Shariah-compliant (☪️). ${
                      shariahPct === 100
                          ? 'Fully Shariah-compliant portfolio!'
                          : 'Non-Shariah holdings typically include conventional banks or gaming counters.'
                  }`
                : `${shariahPct}% (RM ${shariahValue.toFixed(2)}) daripada pegangan saham anda adalah patuh Syariah SC Malaysia (☪️).`;

        // Calculate average growth vs dividend score weighted by holding value
        const avgGrowthScore =
            portfolio.reduce((acc, item) => {
                const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
                return acc + item.stock.radarScores.growth * weight;
            }, 0) || 0;
        const avgDivScore =
            portfolio.reduce((acc, item) => {
                const weight = (parseFloat(item.stock.price) * item.quantity) / holdingsValue;
                return acc + item.stock.radarScores.dividend * weight;
            }, 0) || 0;

        const isAggressiveProfile = userProfile.toLowerCase().includes('aggressive') || userProfile.toLowerCase().includes('explorer');
        const isConservativeProfile = userProfile.toLowerCase().includes('conservative') || userProfile.toLowerCase().includes('guardian');

        let riskText = '';
        if (isAggressiveProfile) {
            riskText =
                avgGrowthScore >= 65
                    ? language === 'ENG'
                        ? `Aligned with ${userProfile}: Your portfolio tilts toward high-momentum & growth counters (Avg Growth Score: ${avgGrowthScore.toFixed(0)}/100). Keep monitoring earnings catalysts!`
                        : `Selaras dengan ${userProfile}: Portfolio anda cenderung kepada kaunter pertumbuhan tinggi (Skor Pertumbuhan: ${avgGrowthScore.toFixed(0)}/100).`
                    : language === 'ENG'
                    ? `Profile Mismatch (${userProfile}): Your current holdings are quite defensive (Avg Growth Score: ${avgGrowthScore.toFixed(0)}/100). Consider adding growth/tech leaders like INARI, GAMUDA, or FRONTKN.`
                    : `Kurang Selaras (${userProfile}): Pegangan semasa anda agak defensif. Pertimbangkan kaunter pertumbuhan seperti INARI, GAMUDA, atau FRONTKN.`;
        } else if (isConservativeProfile) {
            riskText =
                avgDivScore >= 70
                    ? language === 'ENG'
                        ? `Aligned with ${userProfile}: Strong defensive & dividend focus (Avg Dividend Score: ${avgDivScore.toFixed(0)}/100), providing steady cashflow cushion.`
                        : `Selaras dengan ${userProfile}: Fokus defensif & dividen yang kukuh (Skor Dividen: ${avgDivScore.toFixed(0)}/100).`
                    : language === 'ENG'
                    ? `Higher Volatility Warning (${userProfile}): Your holdings have lower dividend cushion. Consider blue-chip dividend payers like MAYBANK, TENAGA, or PAVREIT.`
                    : `Amaran Volatiliti (${userProfile}): Pertimbangkan saham dividen cip biru seperti MAYBANK, TENAGA, atau PAVREIT.`;
        } else {
            riskText =
                language === 'ENG'
                    ? `Balanced Alignment (${userProfile}): Portfolio balances growth (${avgGrowthScore.toFixed(0)}/100) and dividend stability (${avgDivScore.toFixed(0)}/100). Maintain 15-25% virtual cash for dips.`
                    : `Penjajaran Seimbang (${userProfile}): Portfolio mengimbangi pertumbuhan (${avgGrowthScore.toFixed(0)}/100) dan kestabilan dividen (${avgDivScore.toFixed(0)}/100).`;
        }

        return {
            diversificationStatus,
            diversificationText,
            shariahPct,
            shariahValue,
            shariahText,
            riskText
        };
    }, [portfolio, holdingsValue, sectorData, userProfile, language]);

    const calculateReturn = (currentPrice: number, avgPrice: number) => {
        if (avgPrice === 0) return '0.00';
        const percent = ((currentPrice - avgPrice) / avgPrice) * 100;
        return percent.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
                        <ArrowLeft className="mr-2" size={16} />
                        {t.back}
                    </Button>
                    <h1 className="text-xl font-bold text-gray-800">{t.myPortfolio}</h1>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-50"
                        onClick={() => onTopUpCash(5000)}
                    >
                        <Plus size={14} className="mr-1" />
                        {t.topUpBtn}
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Account Equity & Cash Breakdown */}
                    <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg md:col-span-1">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Wallet size={18} className="text-green-100" />
                                    <h3 className="text-sm font-medium text-green-100">{t.totalEquity}</h3>
                                </div>
                                <p className="text-3xl font-extrabold tracking-tight">
                                    RM {totalAccountEquity.toFixed(2)}
                                </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/20 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100">{t.holdingsValueLabel}:</span>
                                    <span className="font-bold">RM {holdingsValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100">{t.virtualCash}:</span>
                                    <span className="font-bold">RM {cashBalance.toFixed(2)}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full mt-2 bg-white/95 text-green-800 hover:bg-white font-semibold text-xs h-8"
                                    onClick={() => onTopUpCash(5000)}
                                >
                                    {t.topUpBtn}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unrealized P/L & Passive Dividend Card */}
                    <Card className="shadow-sm border-gray-200 flex flex-col justify-between">
                        <CardContent className="p-6 space-y-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                    {t.unrealizedPL}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className={`text-2xl font-bold ${
                                            unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {unrealizedPL >= 0 ? '+' : ''}RM {unrealizedPL.toFixed(2)}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            unrealizedPL >= 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }
                                    >
                                        {unrealizedPL >= 0 ? '+' : ''}
                                        {unrealizedPLPercent.toFixed(2)}%
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {portfolio.length} {t.totalHoldings} (Cost: RM {totalCostBasis.toFixed(2)})
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                                    <Coins size={14} />
                                    {t.estDividend}
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="text-xl font-bold text-gray-900">
                                            RM {annualDividend.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-500">{t.perYear}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-blue-700">
                                            ~RM {monthlyDividend.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-500">{t.perMonth}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sector Allocation Donut */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-2 pt-5 px-6">
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChart size={18} className="text-green-600" />
                                {t.sectorAllocation}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-24 h-24 rounded-full flex-shrink-0 border-4 border-white shadow-sm flex items-center justify-center"
                                    style={{
                                        background: `conic-gradient(${conicGradient})`
                                    }}
                                >
                                    <div className="w-14 h-14 bg-white rounded-full" />
                                </div>

                                <div className="flex-1 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                    {sectorData.length > 0 ? (
                                        sectorData.map(sector => (
                                            <div
                                                key={sector.name}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: sector.color }}
                                                    />
                                                    <span className="text-gray-600 truncate">{sector.name}</span>
                                                </div>
                                                <span className="font-semibold ml-2">{sector.percentage}%</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400">No sector exposure yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Portfolio Doctor ("Klinik Portfolio AI") */}
                <Card className="border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-emerald-50/50 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                                    <Stethoscope size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-indigo-950">{t.aiDoctorTitle}</CardTitle>
                                    <CardDescription className="text-xs text-gray-600">
                                        {t.aiDoctorSub}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
                                {userProfile}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* 1. Sector Diversification */}
                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                        {t.diversificationTitle}
                                    </h4>
                                    {diagnostics.diversificationStatus === 'warn' ? (
                                        <AlertTriangle size={16} className="text-amber-500" />
                                    ) : (
                                        <ShieldCheck size={16} className="text-green-600" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {diagnostics.diversificationText}
                                </p>
                            </div>

                            {/* 2. Shariah Breakdown */}
                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                        {t.shariahTitle}
                                    </h4>
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        ☪️ {diagnostics.shariahPct}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full transition-all"
                                        style={{ width: `${diagnostics.shariahPct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{diagnostics.shariahText}</p>
                            </div>

                            {/* 3. Risk Alignment */}
                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                                        {t.riskTitle}
                                    </h4>
                                    <TrendingUp size={16} className="text-indigo-600" />
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{diagnostics.riskText}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Holdings & Transaction History */}
                <div>
                    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'holdings' ? 'default' : 'ghost'}
                                size="sm"
                                className={activeTab === 'holdings' ? 'bg-green-600 hover:bg-green-700' : ''}
                                onClick={() => setActiveTab('holdings')}
                            >
                                <TrendingUp size={16} className="mr-1.5" />
                                {t.holdings} ({portfolio.length})
                            </Button>
                            <Button
                                variant={activeTab === 'history' ? 'default' : 'ghost'}
                                size="sm"
                                className={activeTab === 'history' ? 'bg-green-600 hover:bg-green-700' : ''}
                                onClick={() => setActiveTab('history')}
                            >
                                <History size={16} className="mr-1.5" />
                                {t.txHistory} ({tradeHistory.length})
                            </Button>
                        </div>
                    </div>

                    {activeTab === 'holdings' ? (
                        portfolio.length > 0 ? (
                            <div className="space-y-4">
                                {portfolio.map((item, index) => {
                                    const stock = item.stock;
                                    const currentPriceNum = parseFloat(stock.price);
                                    const returnPercent = calculateReturn(currentPriceNum, item.averagePrice);
                                    const isPositive = parseFloat(returnPercent) >= 0;
                                    const positionValue = currentPriceNum * item.quantity;
                                    const positionProfit = (currentPriceNum - item.averagePrice) * item.quantity;
                                    const halfQty = Math.max(1, Math.floor(item.quantity / 2));

                                    return (
                                        <Card
                                            key={`${stock.id}-${index}`}
                                            className="hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                                            onClick={() => {
                                                setSelectedStock(stock);
                                                navigateTo('stock-details');
                                            }}
                                        >
                                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center font-bold text-green-700 text-sm">
                                                        {stock.ticker.slice(0, 4)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-base text-gray-900 flex items-center gap-1">
                                                                {stock.name}
                                                                <ExternalLink size={13} className="text-gray-400" />
                                                            </h4>
                                                            {stock.isShariah && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-emerald-50 text-emerald-700 text-[10px]"
                                                                >
                                                                    ☪️ Shariah
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {stock.sector}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {stock.ticker} • Div Yield: {stock.dividendYield}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                                                                {t.quantity}: {item.quantity} units
                                                            </span>
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                                {t.avgPrice}: RM {item.averagePrice.toFixed(2)}
                                                            </span>
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                                {t.currentPrice}: RM {stock.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs text-gray-500">{t.marketValue}</p>
                                                        <p className="font-bold text-lg text-gray-900">
                                                            RM {positionValue.toFixed(2)}
                                                        </p>
                                                        <p
                                                            className={`text-xs font-semibold ${
                                                                isPositive ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                        >
                                                            {isPositive ? '+' : ''}RM {positionProfit.toFixed(2)} (
                                                            {isPositive ? '+' : ''}
                                                            {returnPercent}%)
                                                        </p>
                                                    </div>

                                                    <div
                                                        className="flex items-center gap-2"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {item.quantity > 1 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    sellFromPortfolio(stock, halfQty);
                                                                }}
                                                                title={`Sell ${halfQty} units`}
                                                            >
                                                                {t.sellHalf} ({halfQty})
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                removeFromPortfolio(stock);
                                                            }}
                                                            title="Sell Entire Position"
                                                        >
                                                            {t.sellAll}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500 text-lg">{t.noHoldings}</p>
                                <Button
                                    variant="default"
                                    className="mt-4 bg-green-600 hover:bg-green-700"
                                    onClick={() => navigateTo('dashboard')}
                                >
                                    {t.findStocks}
                                </Button>
                            </div>
                        )
                    ) : tradeHistory.length > 0 ? (
                        <div className="space-y-3">
                            {tradeHistory.map(trade => (
                                <Card key={trade.id} className="border-gray-200">
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                className={
                                                    trade.type === 'BUY'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-amber-600 text-white'
                                                }
                                            >
                                                {trade.type}
                                            </Badge>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{trade.ticker}</span>
                                                    <span className="text-xs text-gray-500">{trade.stockName}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {trade.quantity} units @ RM {trade.pricePerShare.toFixed(2)}/unit •{' '}
                                                    {trade.timestamp}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                                            <div>
                                                <p className="text-[11px] text-gray-400">{t.bursaFees}</p>
                                                <p className="text-xs font-medium text-gray-600">
                                                    RM {trade.totalFees.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400">{t.netAmount}</p>
                                                <p
                                                    className={`text-sm font-bold ${
                                                        trade.type === 'BUY' ? 'text-gray-900' : 'text-green-600'
                                                    }`}
                                                >
                                                    {trade.type === 'BUY' ? '-' : '+'}RM {trade.netAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <History className="text-gray-300 mx-auto mb-3" size={36} />
                            <p className="text-gray-500">{t.noHistory}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
