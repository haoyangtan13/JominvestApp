export interface RadarScores {
    value: number;
    growth: number;
    health: number;
    dividend: number;
    momentum: number;
}

export interface StockData {
    id: string;
    name: string;
    ticker: string;
    bursaCode: string; // e.g., '1155.KL'
    price: string;
    change: string;
    changePercent: string;
    isPositive: boolean;
    isShariah: boolean;
    description: string;
    sector: string;
    peRatio: string;
    dividendYield: string;
    marketCap: string;
    volume: string;
    revenue: string;
    netProfit: string;
    debtEquity: string;
    sparkline: number[];
    history: { date: string; price: number }[];
    radarScores: RadarScores;
    lastUpdated?: string;
}

export interface BursaFeeBreakdown {
    grossAmount: number;
    brokerageFee: number;
    clearingFee: number;
    stampDuty: number;
    totalFees: number;
    netTotal: number; // gross + fees for buy, gross - fees for sell
}

/**
 * Calculates realistic Bursa Malaysia retail trading fees:
 * - Brokerage Fee: 0.10% of trade value (min RM 1.00, typical modern online broker tier)
 * - Clearing Fee: 0.03% of trade value (capped at RM 1,000)
 * - Stamp Duty: RM 1.00 for every RM 1,000 (or fractional part) of trade value (capped at RM 1,000)
 */
export function calculateBursaFees(price: number, units: number, side: 'BUY' | 'SELL' = 'BUY'): BursaFeeBreakdown {
    const grossAmount = price * units;
    if (grossAmount <= 0) {
        return { grossAmount: 0, brokerageFee: 0, clearingFee: 0, stampDuty: 0, totalFees: 0, netTotal: 0 };
    }
    const brokerageFee = Math.max(1.0, parseFloat((grossAmount * 0.001).toFixed(2)));
    const clearingFee = Math.min(1000, parseFloat((grossAmount * 0.0003).toFixed(2)));
    const stampDuty = Math.min(1000, Math.ceil(grossAmount / 1000) * 1.0);
    const totalFees = parseFloat((brokerageFee + clearingFee + stampDuty).toFixed(2));
    const netTotal = side === 'BUY'
        ? parseFloat((grossAmount + totalFees).toFixed(2))
        : Math.max(0, parseFloat((grossAmount - totalFees).toFixed(2)));

    return {
        grossAmount: parseFloat(grossAmount.toFixed(2)),
        brokerageFee,
        clearingFee,
        stampDuty,
        totalFees,
        netTotal
    };
}

// Deterministic seeded pseudo-random helper so history charts are stable across renders
const seededNoise = (seedStr: string, index: number) => {
    let hash = 0;
    const combined = `${seedStr}-${index}`;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 1000); // 0..1
};

// Helper to generate realistic 30-day history ending at current price
export const generateHistory = (currentPriceStr: string, days: number = 30, seedKey: string = currentPriceStr) => {
    const currentPrice = parseFloat(currentPriceStr);
    const history = [];
    let price = currentPrice;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        history.unshift({
            date: date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2))
        });

        const rand = seededNoise(seedKey, i);
        const changePercent = (rand * 0.036) - 0.0175;
        price = price / (1 + changePercent);
    }
    return history;
};

export const stocks: StockData[] = [
    {
        id: '1',
        name: 'Malayan Banking Berhad',
        ticker: 'MAYBANK',
        bursaCode: '1155.KL',
        price: '10.54',
        change: '+0.08',
        changePercent: '+0.76%',
        isPositive: true,
        isShariah: false,
        description: 'Malayan Banking Berhad is Malaysia\'s largest financial services group and a leading ASEAN universal bank operating across Malaysia, Singapore, and Indonesia.',
        sector: 'Financial Services',
        peRatio: '12.10',
        dividendYield: '6.15%',
        marketCap: '127.1B',
        volume: '8.4M',
        revenue: '27.6B',
        netProfit: '9.6B',
        debtEquity: 'N/A',
        sparkline: [10.32, 10.38, 10.40, 10.44, 10.48, 10.46, 10.54],
        history: generateHistory('10.54', 30, 'MAYBANK'),
        radarScores: { value: 82, growth: 68, health: 88, dividend: 95, momentum: 78 }
    },
    {
        id: '2',
        name: 'Public Bank Berhad',
        ticker: 'PBBANK',
        bursaCode: '1295.KL',
        price: '4.56',
        change: '+0.04',
        changePercent: '+0.88%',
        isPositive: true,
        isShariah: false,
        description: 'Public Bank Berhad is a premier domestic banking group in Malaysia renowned for its prudent credit management, low impaired loan ratio, and strong retail franchise.',
        sector: 'Financial Services',
        peRatio: '13.10',
        dividendYield: '4.60%',
        marketCap: '88.5B',
        volume: '11.2M',
        revenue: '21.4B',
        netProfit: '6.9B',
        debtEquity: 'N/A',
        sparkline: [4.42, 4.45, 4.48, 4.47, 4.50, 4.52, 4.56],
        history: generateHistory('4.56', 30, 'PBBANK'),
        radarScores: { value: 78, growth: 65, health: 94, dividend: 82, momentum: 75 }
    },
    {
        id: '3',
        name: 'Tenaga Nasional Berhad',
        ticker: 'TENAGA',
        bursaCode: '5347.KL',
        price: '14.28',
        change: '+0.18',
        changePercent: '+1.28%',
        isPositive: true,
        isShariah: true,
        description: 'Tenaga Nasional Berhad is Malaysia\'s national electricity utility infrastructure leader and a major beneficiary of data center power demand and the National Energy Transition Roadmap (NETR).',
        sector: 'Utilities',
        peRatio: '19.40',
        dividendYield: '3.65%',
        marketCap: '82.9B',
        volume: '6.3M',
        revenue: '54.8B',
        netProfit: '3.4B',
        debtEquity: '1.38',
        sparkline: [13.85, 13.92, 14.00, 14.05, 14.12, 14.10, 14.28],
        history: generateHistory('14.28', 30, 'TENAGA'),
        radarScores: { value: 70, growth: 84, health: 74, dividend: 78, momentum: 88 }
    },
    {
        id: '4',
        name: 'CIMB Group Holdings',
        ticker: 'CIMB',
        bursaCode: '1023.KL',
        price: '8.12',
        change: '+0.14',
        changePercent: '+1.75%',
        isPositive: true,
        isShariah: false,
        description: 'CIMB Group is a leading ASEAN universal bank and corporate advisor with strong digital banking operations (Touch \'n Go Digital / CIMB OCTO).',
        sector: 'Financial Services',
        peRatio: '11.40',
        dividendYield: '5.35%',
        marketCap: '86.8B',
        volume: '9.5M',
        revenue: '21.1B',
        netProfit: '7.3B',
        debtEquity: 'N/A',
        sparkline: [7.80, 7.88, 7.92, 7.95, 8.02, 7.98, 8.12],
        history: generateHistory('8.12', 30, 'CIMB'),
        radarScores: { value: 85, growth: 76, health: 84, dividend: 88, momentum: 86 }
    },
    {
        id: '5',
        name: 'Petronas Chemicals Group',
        ticker: 'PCHEM',
        bursaCode: '5183.KL',
        price: '5.18',
        change: '-0.07',
        changePercent: '-1.33%',
        isPositive: false,
        isShariah: true,
        description: 'Petronas Chemicals Group Berhad is the integrated chemicals arm of PETRONAS and one of the largest chemical producers in Southeast Asia.',
        sector: 'Industrial Products',
        peRatio: '17.20',
        dividendYield: '2.90%',
        marketCap: '41.4B',
        volume: '4.1M',
        revenue: '28.9B',
        netProfit: '1.7B',
        debtEquity: '0.14',
        sparkline: [5.40, 5.36, 5.30, 5.28, 5.24, 5.25, 5.18],
        history: generateHistory('5.18', 30, 'PCHEM'),
        radarScores: { value: 72, growth: 58, health: 92, dividend: 65, momentum: 45 }
    },
    {
        id: '6',
        name: 'IHH Healthcare Berhad',
        ticker: 'IHH',
        bursaCode: '5225.KL',
        price: '7.15',
        change: '+0.06',
        changePercent: '+0.85%',
        isPositive: true,
        isShariah: true,
        description: 'IHH Healthcare is a world-leading integrated healthcare provider operating Gleneagles, Pantai, and Prince Court hospitals across 10 countries.',
        sector: 'Health Care',
        peRatio: '26.80',
        dividendYield: '1.85%',
        marketCap: '63.0B',
        volume: '3.2M',
        revenue: '22.4B',
        netProfit: '2.9B',
        debtEquity: '0.58',
        sparkline: [6.95, 7.00, 7.02, 7.05, 7.08, 7.09, 7.15],
        history: generateHistory('7.15', 30, 'IHH'),
        radarScores: { value: 60, growth: 82, health: 80, dividend: 52, momentum: 84 }
    },
    {
        id: '7',
        name: 'CelcomDigi Berhad',
        ticker: 'CDB',
        bursaCode: '6947.KL',
        price: '3.72',
        change: '-0.02',
        changePercent: '-0.53%',
        isPositive: false,
        isShariah: true,
        description: 'CelcomDigi is Malaysia\'s largest mobile network operator serving over 20 million subscribers following the landmark merger of Celcom and Digi.',
        sector: 'Telecommunications',
        peRatio: '23.50',
        dividendYield: '3.85%',
        marketCap: '43.6B',
        volume: '4.5M',
        revenue: '12.7B',
        netProfit: '1.6B',
        debtEquity: '1.15',
        sparkline: [3.78, 3.76, 3.75, 3.74, 3.73, 3.74, 3.72],
        history: generateHistory('3.72', 30, 'CDB'),
        radarScores: { value: 64, growth: 66, health: 70, dividend: 78, momentum: 58 }
    },
    {
        id: '8',
        name: 'Press Metal Aluminium',
        ticker: 'PMETAL',
        bursaCode: '8869.KL',
        price: '5.12',
        change: '+0.14',
        changePercent: '+2.81%',
        isPositive: true,
        isShariah: true,
        description: 'Press Metal Aluminium Holdings is the largest integrated low-carbon aluminium producer in Southeast Asia powered largely by hydroelectricity.',
        sector: 'Industrial Products',
        peRatio: '25.40',
        dividendYield: '1.65%',
        marketCap: '42.2B',
        volume: '5.8M',
        revenue: '14.9B',
        netProfit: '1.5B',
        debtEquity: '0.62',
        sparkline: [4.88, 4.92, 4.96, 5.00, 5.04, 4.98, 5.12],
        history: generateHistory('5.12', 30, 'PMETAL'),
        radarScores: { value: 62, growth: 85, health: 76, dividend: 50, momentum: 86 }
    },
    {
        id: '9',
        name: 'Hong Leong Bank Berhad',
        ticker: 'HLBANK',
        bursaCode: '5819.KL',
        price: '20.40',
        change: '+0.10',
        changePercent: '+0.49%',
        isPositive: true,
        isShariah: false,
        description: 'Hong Leong Bank Berhad is a leading Malaysian banking group with strong asset quality and significant regional earnings contribution from Bank of Chengdu.',
        sector: 'Financial Services',
        peRatio: '10.40',
        dividendYield: '3.35%',
        marketCap: '44.2B',
        volume: '1.1M',
        revenue: '5.9B',
        netProfit: '4.1B',
        debtEquity: 'N/A',
        sparkline: [20.10, 20.15, 20.20, 20.22, 20.28, 20.30, 20.40],
        history: generateHistory('20.40', 30, 'HLBANK'),
        radarScores: { value: 86, growth: 74, health: 90, dividend: 72, momentum: 74 }
    },
    {
        id: '10',
        name: 'SD Guthrie Berhad (Sime Darby Plantation)',
        ticker: 'SDG',
        bursaCode: '5285.KL',
        price: '4.85',
        change: '+0.09',
        changePercent: '+1.89%',
        isPositive: true,
        isShariah: true,
        description: 'SD Guthrie Berhad (formerly Sime Darby Plantation) is the world\'s largest producer of certified sustainable palm oil and is expanding into solar and industrial parks.',
        sector: 'Plantation',
        peRatio: '15.20',
        dividendYield: '2.95%',
        marketCap: '33.5B',
        volume: '3.4M',
        revenue: '19.1B',
        netProfit: '2.2B',
        debtEquity: '0.32',
        sparkline: [4.62, 4.68, 4.70, 4.74, 4.78, 4.76, 4.85],
        history: generateHistory('4.85', 30, 'SDG'),
        radarScores: { value: 76, growth: 72, health: 85, dividend: 68, momentum: 82 }
    },
    {
        id: '11',
        name: 'Maxis Berhad',
        ticker: 'MAXIS',
        bursaCode: '6012.KL',
        price: '3.64',
        change: '-0.03',
        changePercent: '-0.82%',
        isPositive: false,
        isShariah: true,
        description: 'Maxis Berhad is a leading converged communications and enterprise digital solutions provider in Malaysia.',
        sector: 'Telecommunications',
        peRatio: '21.80',
        dividendYield: '4.40%',
        marketCap: '28.5B',
        volume: '2.1M',
        revenue: '10.4B',
        netProfit: '1.3B',
        debtEquity: '0.92',
        sparkline: [3.72, 3.70, 3.68, 3.69, 3.67, 3.67, 3.64],
        history: generateHistory('3.64', 30, 'MAXIS'),
        radarScores: { value: 68, growth: 60, health: 72, dividend: 82, momentum: 55 }
    },
    {
        id: '12',
        name: 'MISC Berhad',
        ticker: 'MISC',
        bursaCode: '3816.KL',
        price: '7.95',
        change: '+0.08',
        changePercent: '+1.02%',
        isPositive: true,
        isShariah: true,
        description: 'MISC Berhad is a global leader in energy-related maritime solutions and LNG shipping, and a subsidiary of PETRONAS.',
        sector: 'Transportation',
        peRatio: '15.40',
        dividendYield: '4.50%',
        marketCap: '35.5B',
        volume: '1.8M',
        revenue: '14.2B',
        netProfit: '2.3B',
        debtEquity: '0.28',
        sparkline: [7.75, 7.80, 7.82, 7.85, 7.88, 7.87, 7.95],
        history: generateHistory('7.95', 30, 'MISC'),
        radarScores: { value: 78, growth: 70, health: 86, dividend: 84, momentum: 76 }
    },
    {
        id: '13',
        name: 'Nestlé (Malaysia) Berhad',
        ticker: 'NESTLE',
        bursaCode: '4707.KL',
        price: '102.40',
        change: '-0.60',
        changePercent: '-0.58%',
        isPositive: false,
        isShariah: true,
        description: 'Nestlé Malaysia is the largest Halal producer in the global Nestlé network, producing iconic household staples including MILO, MAGGI, and NESCAFÉ.',
        sector: 'Consumer Products',
        peRatio: '38.50',
        dividendYield: '2.95%',
        marketCap: '24.0B',
        volume: '0.08M',
        revenue: '6.8B',
        netProfit: '0.65B',
        debtEquity: '1.05',
        sparkline: [104.2, 103.8, 103.5, 103.2, 103.0, 103.0, 102.4],
        history: generateHistory('102.40', 30, 'NESTLE'),
        radarScores: { value: 48, growth: 62, health: 78, dividend: 74, momentum: 50 }
    },
    {
        id: '14',
        name: 'RHB Bank Berhad',
        ticker: 'RHBBANK',
        bursaCode: '1066.KL',
        price: '6.48',
        change: '+0.04',
        changePercent: '+0.62%',
        isPositive: true,
        isShariah: false,
        description: 'RHB Bank Berhad is the fourth largest fully integrated financial services group in Malaysia, well known among retail investors for its high dividend yield.',
        sector: 'Financial Services',
        peRatio: '9.40',
        dividendYield: '6.25%',
        marketCap: '28.2B',
        volume: '4.2M',
        revenue: '13.5B',
        netProfit: '3.0B',
        debtEquity: 'N/A',
        sparkline: [6.34, 6.38, 6.40, 6.42, 6.44, 6.44, 6.48],
        history: generateHistory('6.48', 30, 'RHBBANK'),
        radarScores: { value: 90, growth: 66, health: 85, dividend: 94, momentum: 78 }
    },
    {
        id: '15',
        name: 'IOI Corporation Berhad',
        ticker: 'IOICORP',
        bursaCode: '1961.KL',
        price: '3.92',
        change: '+0.04',
        changePercent: '+1.03%',
        isPositive: true,
        isShariah: true,
        description: 'IOI Corporation is a leading global integrated and sustainable palm oil player with upstream plantations and downstream oleochemical manufacturing.',
        sector: 'Plantation',
        peRatio: '19.20',
        dividendYield: '2.65%',
        marketCap: '24.6B',
        volume: '2.9M',
        revenue: '11.5B',
        netProfit: '1.2B',
        debtEquity: '0.30',
        sparkline: [3.82, 3.84, 3.86, 3.87, 3.89, 3.88, 3.92],
        history: generateHistory('3.92', 30, 'IOICORP'),
        radarScores: { value: 72, growth: 68, health: 86, dividend: 66, momentum: 72 }
    },
    {
        id: '16',
        name: 'Top Glove Corporation',
        ticker: 'TOPGLOV',
        bursaCode: '7113.KL',
        price: '1.14',
        change: '+0.03',
        changePercent: '+2.70%',
        isPositive: true,
        isShariah: true,
        description: 'Top Glove Corporation is the world\'s largest manufacturer of nitrile, latex, and surgical gloves exporting to 195 countries.',
        sector: 'Health Care',
        peRatio: '48.50',
        dividendYield: '0.50%',
        marketCap: '9.1B',
        volume: '24.6M',
        revenue: '2.6B',
        netProfit: '0.12B',
        debtEquity: '0.18',
        sparkline: [1.06, 1.08, 1.09, 1.10, 1.12, 1.11, 1.14],
        history: generateHistory('1.14', 30, 'TOPGLOV'),
        radarScores: { value: 52, growth: 78, health: 82, dividend: 25, momentum: 80 }
    },
    {
        id: '17',
        name: 'Gamuda Berhad',
        ticker: 'GAMUDA',
        bursaCode: '5398.KL',
        price: '9.15',
        change: '+0.28',
        changePercent: '+3.16%',
        isPositive: true,
        isShariah: true,
        description: 'Gamuda Berhad is a regional engineering, MRT infrastructure, data center construction, and property powerhouse across Malaysia, Australia, and Taiwan.',
        sector: 'Construction',
        peRatio: '21.40',
        dividendYield: '1.75%',
        marketCap: '25.8B',
        volume: '9.2M',
        revenue: '13.4B',
        netProfit: '1.1B',
        debtEquity: '0.45',
        sparkline: [8.65, 8.75, 8.82, 8.90, 8.95, 8.87, 9.15],
        history: generateHistory('9.15', 30, 'GAMUDA'),
        radarScores: { value: 70, growth: 94, health: 80, dividend: 58, momentum: 95 }
    },
    {
        id: '18',
        name: 'Genting Malaysia Berhad',
        ticker: 'GENM',
        bursaCode: '4715.KL',
        price: '2.32',
        change: '-0.02',
        changePercent: '-0.85%',
        isPositive: false,
        isShariah: false,
        description: 'Genting Malaysia operates Resorts World Genting in Malaysia as well as leisure and hospitality resorts in the US, UK, and Bahamas.',
        sector: 'Consumer Services',
        peRatio: '14.80',
        dividendYield: '6.45%',
        marketCap: '13.1B',
        volume: '7.4M',
        revenue: '10.5B',
        netProfit: '0.7B',
        debtEquity: '0.88',
        sparkline: [2.38, 2.36, 2.35, 2.34, 2.33, 2.34, 2.32],
        history: generateHistory('2.32', 30, 'GENM'),
        radarScores: { value: 78, growth: 60, health: 62, dividend: 92, momentum: 48 }
    },
    {
        id: '19',
        name: 'YTL Power International',
        ticker: 'YTLPOWR',
        bursaCode: '6742.KL',
        price: '4.18',
        change: '+0.15',
        changePercent: '+3.72%',
        isPositive: true,
        isShariah: false,
        description: 'YTL Power International operates power generation in Singapore (YTL PowerSeraya), water utilities in the UK (Wessex Water), and green AI data centers in Johor.',
        sector: 'Utilities',
        peRatio: '11.20',
        dividendYield: '1.90%',
        marketCap: '34.2B',
        volume: '18.5M',
        revenue: '22.3B',
        netProfit: '3.2B',
        debtEquity: '1.52',
        sparkline: [3.90, 3.95, 4.00, 4.02, 4.08, 4.03, 4.18],
        history: generateHistory('4.18', 30, 'YTLPOWR'),
        radarScores: { value: 88, growth: 92, health: 68, dividend: 60, momentum: 90 }
    },
    {
        id: '20',
        name: 'Sunway Berhad',
        ticker: 'SUNWAY',
        bursaCode: '5211.KL',
        price: '4.42',
        change: '+0.11',
        changePercent: '+2.55%',
        isPositive: true,
        isShariah: true,
        description: 'Sunway Berhad is a leading Malaysian conglomerate with thriving township property, Sunway Medical Centre healthcare, construction, and hospitality divisions.',
        sector: 'Property & Conglomerate',
        peRatio: '24.60',
        dividendYield: '1.80%',
        marketCap: '25.1B',
        volume: '8.7M',
        revenue: '6.6B',
        netProfit: '0.85B',
        debtEquity: '0.62',
        sparkline: [4.15, 4.20, 4.25, 4.28, 4.32, 4.31, 4.42],
        history: generateHistory('4.42', 30, 'SUNWAY'),
        radarScores: { value: 66, growth: 88, health: 78, dividend: 58, momentum: 92 }
    },
    {
        id: '21',
        name: 'MR D.I.Y. Group (M) Berhad',
        ticker: 'MRDIY',
        bursaCode: '5296.KL',
        price: '2.16',
        change: '+0.04',
        changePercent: '+1.89%',
        isPositive: true,
        isShariah: true,
        description: 'MR D.I.Y. Group is Malaysia\'s largest home improvement retailer with over 1,300 stores nationwide offering everyday value essentials.',
        sector: 'Consumer Products',
        peRatio: '32.40',
        dividendYield: '1.95%',
        marketCap: '20.4B',
        volume: '6.9M',
        revenue: '4.5B',
        netProfit: '0.60B',
        debtEquity: '0.18',
        sparkline: [2.05, 2.08, 2.10, 2.11, 2.13, 2.12, 2.16],
        history: generateHistory('2.16', 30, 'MRDIY'),
        radarScores: { value: 64, growth: 86, health: 90, dividend: 62, momentum: 85 }
    },
    {
        id: '22',
        name: 'Inari Amertron Berhad',
        ticker: 'INARI',
        bursaCode: '0166.KL',
        price: '3.12',
        change: '+0.07',
        changePercent: '+2.30%',
        isPositive: true,
        isShariah: true,
        description: 'Inari Amertron is Malaysia\'s largest outsourced semiconductor assembly and test (OSAT) technology leader, specializing in RF and optoelectronics.',
        sector: 'Technology',
        peRatio: '34.50',
        dividendYield: '2.55%',
        marketCap: '11.8B',
        volume: '10.4M',
        revenue: '1.5B',
        netProfit: '0.32B',
        debtEquity: '0.02',
        sparkline: [2.98, 3.00, 3.04, 3.02, 3.06, 3.05, 3.12],
        history: generateHistory('3.12', 30, 'INARI'),
        radarScores: { value: 60, growth: 86, health: 96, dividend: 68, momentum: 82 }
    },
    {
        id: '23',
        name: 'Telekom Malaysia Berhad',
        ticker: 'TM',
        bursaCode: '4863.KL',
        price: '6.68',
        change: '+0.06',
        changePercent: '+0.91%',
        isPositive: true,
        isShariah: true,
        description: 'Telekom Malaysia (TM) is Malaysia\'s national fibre broadband (Unifi) and subsea cable/data center connectivity champion.',
        sector: 'Telecommunications',
        peRatio: '13.80',
        dividendYield: '3.75%',
        marketCap: '25.6B',
        volume: '4.8M',
        revenue: '12.3B',
        netProfit: '1.8B',
        debtEquity: '0.54',
        sparkline: [6.52, 6.55, 6.58, 6.60, 6.62, 6.62, 6.68],
        history: generateHistory('6.68', 30, 'TM'),
        radarScores: { value: 82, growth: 78, health: 82, dividend: 78, momentum: 80 }
    },
    {
        id: '24',
        name: 'Pavilion Real Estate Investment Trust',
        ticker: 'PAVREIT',
        bursaCode: '5212.KL',
        price: '1.52',
        change: '+0.02',
        changePercent: '+1.33%',
        isPositive: true,
        isShariah: false,
        description: 'Pavilion REIT owns flagship prime retail malls including Pavilion Kuala Lumpur, Pavilion Bukit Jalil, and Elite Pavilion Mall.',
        sector: 'REITs',
        peRatio: '14.10',
        dividendYield: '6.05%',
        marketCap: '5.6B',
        volume: '3.1M',
        revenue: '0.82B',
        netProfit: '0.36B',
        debtEquity: '0.48',
        sparkline: [1.47, 1.48, 1.49, 1.50, 1.50, 1.50, 1.52],
        history: generateHistory('1.52', 30, 'PAVREIT'),
        radarScores: { value: 84, growth: 68, health: 80, dividend: 92, momentum: 76 }
    },
    {
        id: '25',
        name: 'Syarikat Takaful Malaysia Keluarga',
        ticker: 'TAKAFUL',
        bursaCode: '6139.KL',
        price: '3.90',
        change: '+0.04',
        changePercent: '+1.04%',
        isPositive: true,
        isShariah: true,
        description: 'Syarikat Takaful Malaysia Keluarga Berhad is the pioneer and leading Islamic insurance (Takaful) operator in Malaysia.',
        sector: 'Financial Services',
        peRatio: '9.10',
        dividendYield: '4.25%',
        marketCap: '3.3B',
        volume: '0.9M',
        revenue: '3.4B',
        netProfit: '0.38B',
        debtEquity: 'N/A',
        sparkline: [3.80, 3.82, 3.84, 3.85, 3.86, 3.86, 3.90],
        history: generateHistory('3.90', 30, 'TAKAFUL'),
        radarScores: { value: 88, growth: 74, health: 86, dividend: 80, momentum: 74 }
    },
    {
        id: '26',
        name: 'QL Resources Berhad',
        ticker: 'QL',
        bursaCode: '7084.KL',
        price: '4.76',
        change: '+0.05',
        changePercent: '+1.06%',
        isPositive: true,
        isShariah: true,
        description: 'QL Resources is a multinational agro-food leader in marine products, integrated livestock (eggs/poultry), and FamilyMart convenience stores in Malaysia.',
        sector: 'Consumer Products',
        peRatio: '26.40',
        dividendYield: '1.50%',
        marketCap: '17.4B',
        volume: '2.6M',
        revenue: '6.7B',
        netProfit: '0.44B',
        debtEquity: '0.25',
        sparkline: [4.65, 4.68, 4.70, 4.71, 4.72, 4.71, 4.76],
        history: generateHistory('4.76', 30, 'QL'),
        radarScores: { value: 65, growth: 82, health: 90, dividend: 52, momentum: 79 }
    }
];
