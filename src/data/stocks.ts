export interface StockData {
  id: string;
  name: string;
  ticker: string;
  klseCode: string;
  shariahCompliant: boolean;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
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
}

export const SNAPSHOT_DATE_MYT = '2026-11-24';

export const stocks: StockData[] = [
  {
    "id": "1",
    "name": "Malayan Banking Berhad",
    "ticker": "MAYBANK",
    "klseCode": "1155.KL",
    "shariahCompliant": false,
    "price": "10.12",
    "change": "+0.23",
    "changePercent": "+2.33%",
    "isPositive": true,
    "description": "Malayan Banking Berhad is a Malaysian universal bank, with key operating home markets of Malaysia, Singapore, and Indonesia.",
    "sector": "Financial Services",
    "peRatio": "11.45",
    "dividendYield": "6.26%",
    "marketCap": "111.7B",
    "volume": "15.6M",
    "revenue": "26.4B",
    "netProfit": "9.3B",
    "debtEquity": "N/A",
    "sparkline": [
      9.98,
      9.97,
      9.92,
      9.93,
      9.87,
      9.89,
      10.12
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 9.98
      },
      {
        "date": "2026-10-27",
        "price": 9.99
      },
      {
        "date": "2026-10-28",
        "price": 9.99
      },
      {
        "date": "2026-10-29",
        "price": 10
      },
      {
        "date": "2026-10-30",
        "price": 10.02
      },
      {
        "date": "2026-11-02",
        "price": 9.98
      },
      {
        "date": "2026-11-03",
        "price": 10.04
      },
      {
        "date": "2026-11-04",
        "price": 9.9
      },
      {
        "date": "2026-11-05",
        "price": 10.16
      },
      {
        "date": "2026-11-06",
        "price": 10.12
      },
      {
        "date": "2026-11-10",
        "price": 10.06
      },
      {
        "date": "2026-11-11",
        "price": 9.95
      },
      {
        "date": "2026-11-12",
        "price": 9.91
      },
      {
        "date": "2026-11-13",
        "price": 9.94
      },
      {
        "date": "2026-11-16",
        "price": 9.98
      },
      {
        "date": "2026-11-17",
        "price": 9.97
      },
      {
        "date": "2026-11-18",
        "price": 9.92
      },
      {
        "date": "2026-11-19",
        "price": 9.93
      },
      {
        "date": "2026-11-20",
        "price": 9.87
      },
      {
        "date": "2026-11-23",
        "price": 9.89
      },
      {
        "date": "2026-11-24",
        "price": 10.12
      }
    ]
  },
  {
    "id": "2",
    "name": "Public Bank Berhad",
    "ticker": "PBBANK",
    "klseCode": "1295.KL",
    "shariahCompliant": false,
    "price": "4.55",
    "change": "+0.05",
    "changePercent": "+1.11%",
    "isPositive": true,
    "description": "Public Bank Berhad is a major banking group in Malaysia known for its prudent management and strong consumer banking franchise.",
    "sector": "Financial Services",
    "peRatio": "12.80",
    "dividendYield": "4.50%",
    "marketCap": "82.3B",
    "volume": "14.0M",
    "revenue": "20.1B",
    "netProfit": "6.6B",
    "debtEquity": "N/A",
    "sparkline": [
      4.55,
      4.56,
      4.5,
      4.52,
      4.49,
      4.5,
      4.55
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.73
      },
      {
        "date": "2026-10-27",
        "price": 4.75
      },
      {
        "date": "2026-10-28",
        "price": 4.71
      },
      {
        "date": "2026-10-29",
        "price": 4.73
      },
      {
        "date": "2026-10-30",
        "price": 4.75
      },
      {
        "date": "2026-11-02",
        "price": 4.79
      },
      {
        "date": "2026-11-03",
        "price": 4.81
      },
      {
        "date": "2026-11-04",
        "price": 4.77
      },
      {
        "date": "2026-11-05",
        "price": 4.96
      },
      {
        "date": "2026-11-06",
        "price": 4.9
      },
      {
        "date": "2026-11-10",
        "price": 4.68
      },
      {
        "date": "2026-11-11",
        "price": 4.53
      },
      {
        "date": "2026-11-12",
        "price": 4.53
      },
      {
        "date": "2026-11-13",
        "price": 4.54
      },
      {
        "date": "2026-11-16",
        "price": 4.55
      },
      {
        "date": "2026-11-17",
        "price": 4.56
      },
      {
        "date": "2026-11-18",
        "price": 4.5
      },
      {
        "date": "2026-11-19",
        "price": 4.52
      },
      {
        "date": "2026-11-20",
        "price": 4.49
      },
      {
        "date": "2026-11-23",
        "price": 4.5
      },
      {
        "date": "2026-11-24",
        "price": 4.55
      }
    ]
  },
  {
    "id": "3",
    "name": "Tenaga Nasional Berhad",
    "ticker": "TENAGA",
    "klseCode": "5347.KL",
    "shariahCompliant": true,
    "price": "12.46",
    "change": "+0.00",
    "changePercent": "+0.00%",
    "isPositive": true,
    "description": "Tenaga Nasional Berhad is the largest electricity utility firm in Malaysia driving national renewable grid modernization.",
    "sector": "Utilities",
    "peRatio": "18.23",
    "dividendYield": "3.38%",
    "marketCap": "78.5B",
    "volume": "1.9M",
    "revenue": "53.1B",
    "netProfit": "2.8B",
    "debtEquity": "1.45",
    "sparkline": [
      12.74,
      12.58,
      12.58,
      12.6,
      12.68,
      12.46,
      12.46
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 13.28
      },
      {
        "date": "2026-10-27",
        "price": 13.3
      },
      {
        "date": "2026-10-28",
        "price": 13.22
      },
      {
        "date": "2026-10-29",
        "price": 13.3
      },
      {
        "date": "2026-10-30",
        "price": 13.3
      },
      {
        "date": "2026-11-02",
        "price": 13.3
      },
      {
        "date": "2026-11-03",
        "price": 13.16
      },
      {
        "date": "2026-11-04",
        "price": 13.14
      },
      {
        "date": "2026-11-05",
        "price": 13.1
      },
      {
        "date": "2026-11-06",
        "price": 13.04
      },
      {
        "date": "2026-11-10",
        "price": 13.18
      },
      {
        "date": "2026-11-11",
        "price": 12.96
      },
      {
        "date": "2026-11-12",
        "price": 12.8
      },
      {
        "date": "2026-11-13",
        "price": 12.76
      },
      {
        "date": "2026-11-16",
        "price": 12.74
      },
      {
        "date": "2026-11-17",
        "price": 12.58
      },
      {
        "date": "2026-11-18",
        "price": 12.58
      },
      {
        "date": "2026-11-19",
        "price": 12.6
      },
      {
        "date": "2026-11-20",
        "price": 12.68
      },
      {
        "date": "2026-11-23",
        "price": 12.46
      },
      {
        "date": "2026-11-24",
        "price": 12.46
      }
    ]
  },
  {
    "id": "4",
    "name": "CIMB Group Holdings",
    "ticker": "CIMB",
    "klseCode": "1023.KL",
    "shariahCompliant": false,
    "price": "7.08",
    "change": "+0.03",
    "changePercent": "+0.43%",
    "isPositive": true,
    "description": "CIMB Group is a leading ASEAN universal bank and one of the region's foremost corporate advisors.",
    "sector": "Financial Services",
    "peRatio": "10.95",
    "dividendYield": "5.10%",
    "marketCap": "79.8B",
    "volume": "4.7M",
    "revenue": "19.8B",
    "netProfit": "6.9B",
    "debtEquity": "N/A",
    "sparkline": [
      7.16,
      7.04,
      7.03,
      7.02,
      7.04,
      7.05,
      7.08
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 7.1
      },
      {
        "date": "2026-10-27",
        "price": 7.11
      },
      {
        "date": "2026-10-28",
        "price": 7.11
      },
      {
        "date": "2026-10-29",
        "price": 6.89
      },
      {
        "date": "2026-10-30",
        "price": 6.91
      },
      {
        "date": "2026-11-02",
        "price": 6.92
      },
      {
        "date": "2026-11-03",
        "price": 6.98
      },
      {
        "date": "2026-11-04",
        "price": 6.91
      },
      {
        "date": "2026-11-05",
        "price": 7.15
      },
      {
        "date": "2026-11-06",
        "price": 7.06
      },
      {
        "date": "2026-11-10",
        "price": 7.08
      },
      {
        "date": "2026-11-11",
        "price": 7.08
      },
      {
        "date": "2026-11-12",
        "price": 7.09
      },
      {
        "date": "2026-11-13",
        "price": 7.08
      },
      {
        "date": "2026-11-16",
        "price": 7.16
      },
      {
        "date": "2026-11-17",
        "price": 7.04
      },
      {
        "date": "2026-11-18",
        "price": 7.03
      },
      {
        "date": "2026-11-19",
        "price": 7.02
      },
      {
        "date": "2026-11-20",
        "price": 7.04
      },
      {
        "date": "2026-11-23",
        "price": 7.05
      },
      {
        "date": "2026-11-24",
        "price": 7.08
      }
    ]
  },
  {
    "id": "5",
    "name": "Petronas Chemicals Group",
    "ticker": "PCHEM",
    "klseCode": "5183.KL",
    "shariahCompliant": true,
    "price": "3.81",
    "change": "-0.01",
    "changePercent": "-0.26%",
    "isPositive": false,
    "description": "Petronas Chemicals Group Berhad is the integrated chemicals arm of the Petronas Group and one of the largest chemical producers in Southeast Asia.",
    "sector": "Industrial Products",
    "peRatio": "16.50",
    "dividendYield": "2.80%",
    "marketCap": "43.6B",
    "volume": "2.7M",
    "revenue": "28.9B",
    "netProfit": "1.2B",
    "debtEquity": "0.15",
    "sparkline": [
      4.32,
      4.27,
      4.17,
      4,
      3.97,
      3.82,
      3.81
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.57
      },
      {
        "date": "2026-10-27",
        "price": 4.63
      },
      {
        "date": "2026-10-28",
        "price": 4.72
      },
      {
        "date": "2026-10-29",
        "price": 4.57
      },
      {
        "date": "2026-10-30",
        "price": 4.7
      },
      {
        "date": "2026-11-02",
        "price": 4.74
      },
      {
        "date": "2026-11-03",
        "price": 4.66
      },
      {
        "date": "2026-11-04",
        "price": 4.7
      },
      {
        "date": "2026-11-05",
        "price": 4.31
      },
      {
        "date": "2026-11-06",
        "price": 4.2
      },
      {
        "date": "2026-11-10",
        "price": 4.2
      },
      {
        "date": "2026-11-11",
        "price": 4.26
      },
      {
        "date": "2026-11-12",
        "price": 4.26
      },
      {
        "date": "2026-11-13",
        "price": 4.36
      },
      {
        "date": "2026-11-16",
        "price": 4.32
      },
      {
        "date": "2026-11-17",
        "price": 4.27
      },
      {
        "date": "2026-11-18",
        "price": 4.17
      },
      {
        "date": "2026-11-19",
        "price": 4
      },
      {
        "date": "2026-11-20",
        "price": 3.97
      },
      {
        "date": "2026-11-23",
        "price": 3.82
      },
      {
        "date": "2026-11-24",
        "price": 3.81
      }
    ]
  },
  {
    "id": "6",
    "name": "IHH Healthcare Berhad",
    "ticker": "IHH",
    "klseCode": "5225.KL",
    "shariahCompliant": true,
    "price": "7.90",
    "change": "-0.03",
    "changePercent": "-0.38%",
    "isPositive": false,
    "description": "IHH Healthcare is a leading international healthcare provider with a network of 80 hospitals in 10 countries.",
    "sector": "Health Care",
    "peRatio": "32.40",
    "dividendYield": "1.20%",
    "marketCap": "55.7B",
    "volume": "1.2M",
    "revenue": "21.5B",
    "netProfit": "2.9B",
    "debtEquity": "0.62",
    "sparkline": [
      7.96,
      7.96,
      7.92,
      7.9,
      7.9,
      7.93,
      7.9
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 7.84
      },
      {
        "date": "2026-10-27",
        "price": 7.84
      },
      {
        "date": "2026-10-28",
        "price": 7.83
      },
      {
        "date": "2026-10-29",
        "price": 7.85
      },
      {
        "date": "2026-10-30",
        "price": 7.85
      },
      {
        "date": "2026-11-02",
        "price": 7.85
      },
      {
        "date": "2026-11-03",
        "price": 7.76
      },
      {
        "date": "2026-11-04",
        "price": 7.78
      },
      {
        "date": "2026-11-05",
        "price": 7.72
      },
      {
        "date": "2026-11-06",
        "price": 7.7
      },
      {
        "date": "2026-11-10",
        "price": 7.74
      },
      {
        "date": "2026-11-11",
        "price": 7.73
      },
      {
        "date": "2026-11-12",
        "price": 7.84
      },
      {
        "date": "2026-11-13",
        "price": 7.93
      },
      {
        "date": "2026-11-16",
        "price": 7.96
      },
      {
        "date": "2026-11-17",
        "price": 7.96
      },
      {
        "date": "2026-11-18",
        "price": 7.92
      },
      {
        "date": "2026-11-19",
        "price": 7.9
      },
      {
        "date": "2026-11-20",
        "price": 7.9
      },
      {
        "date": "2026-11-23",
        "price": 7.93
      },
      {
        "date": "2026-11-24",
        "price": 7.9
      }
    ]
  },
  {
    "id": "7",
    "name": "CelcomDigi Berhad",
    "ticker": "CDB",
    "klseCode": "6947.KL",
    "shariahCompliant": true,
    "price": "2.28",
    "change": "-0.02",
    "changePercent": "-0.87%",
    "isPositive": false,
    "description": "CelcomDigi is Malaysia's largest mobile network operator, formed by the merger of Celcom and Digi.",
    "sector": "Telecommunications",
    "peRatio": "24.15",
    "dividendYield": "3.90%",
    "marketCap": "42.8B",
    "volume": "2.3M",
    "revenue": "12.7B",
    "netProfit": "1.6B",
    "debtEquity": "1.20",
    "sparkline": [
      2.43,
      2.43,
      2.43,
      2.48,
      2.35,
      2.3,
      2.28
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 2.47
      },
      {
        "date": "2026-10-27",
        "price": 2.47
      },
      {
        "date": "2026-10-28",
        "price": 2.44
      },
      {
        "date": "2026-10-29",
        "price": 2.5
      },
      {
        "date": "2026-10-30",
        "price": 2.54
      },
      {
        "date": "2026-11-02",
        "price": 2.67
      },
      {
        "date": "2026-11-03",
        "price": 2.67
      },
      {
        "date": "2026-11-04",
        "price": 2.6
      },
      {
        "date": "2026-11-05",
        "price": 2.57
      },
      {
        "date": "2026-11-06",
        "price": 2.51
      },
      {
        "date": "2026-11-10",
        "price": 2.51
      },
      {
        "date": "2026-11-11",
        "price": 2.57
      },
      {
        "date": "2026-11-12",
        "price": 2.45
      },
      {
        "date": "2026-11-13",
        "price": 2.46
      },
      {
        "date": "2026-11-16",
        "price": 2.43
      },
      {
        "date": "2026-11-17",
        "price": 2.43
      },
      {
        "date": "2026-11-18",
        "price": 2.43
      },
      {
        "date": "2026-11-19",
        "price": 2.48
      },
      {
        "date": "2026-11-20",
        "price": 2.35
      },
      {
        "date": "2026-11-23",
        "price": 2.3
      },
      {
        "date": "2026-11-24",
        "price": 2.28
      }
    ]
  },
  {
    "id": "8",
    "name": "Press Metal Aluminium",
    "ticker": "PMETAL",
    "klseCode": "8869.KL",
    "shariahCompliant": true,
    "price": "6.41",
    "change": "+0.11",
    "changePercent": "+1.75%",
    "isPositive": true,
    "description": "Press Metal is the largest integrated low-carbon aluminium producer in Southeast Asia.",
    "sector": "Industrial Products",
    "peRatio": "28.50",
    "dividendYield": "1.45%",
    "marketCap": "42.0B",
    "volume": "6.6M",
    "revenue": "14.5B",
    "netProfit": "1.2B",
    "debtEquity": "0.68",
    "sparkline": [
      6.87,
      6.86,
      6.65,
      6.69,
      6.27,
      6.3,
      6.41
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 6.75
      },
      {
        "date": "2026-10-27",
        "price": 6.72
      },
      {
        "date": "2026-10-28",
        "price": 6.86
      },
      {
        "date": "2026-10-29",
        "price": 6.86
      },
      {
        "date": "2026-10-30",
        "price": 6.95
      },
      {
        "date": "2026-11-02",
        "price": 7
      },
      {
        "date": "2026-11-03",
        "price": 6.96
      },
      {
        "date": "2026-11-04",
        "price": 6.94
      },
      {
        "date": "2026-11-05",
        "price": 7
      },
      {
        "date": "2026-11-06",
        "price": 6.85
      },
      {
        "date": "2026-11-10",
        "price": 6.76
      },
      {
        "date": "2026-11-11",
        "price": 6.89
      },
      {
        "date": "2026-11-12",
        "price": 6.9
      },
      {
        "date": "2026-11-13",
        "price": 6.81
      },
      {
        "date": "2026-11-16",
        "price": 6.87
      },
      {
        "date": "2026-11-17",
        "price": 6.86
      },
      {
        "date": "2026-11-18",
        "price": 6.65
      },
      {
        "date": "2026-11-19",
        "price": 6.69
      },
      {
        "date": "2026-11-20",
        "price": 6.27
      },
      {
        "date": "2026-11-23",
        "price": 6.3
      },
      {
        "date": "2026-11-24",
        "price": 6.41
      }
    ]
  },
  {
    "id": "9",
    "name": "Hong Leong Bank",
    "ticker": "HLBANK",
    "klseCode": "5819.KL",
    "shariahCompliant": false,
    "price": "20.96",
    "change": "+0.04",
    "changePercent": "+0.19%",
    "isPositive": true,
    "description": "Hong Leong Bank Berhad is a major public listed banking group in Malaysia.",
    "sector": "Financial Services",
    "peRatio": "10.50",
    "dividendYield": "3.10%",
    "marketCap": "42.1B",
    "volume": "768K",
    "revenue": "5.6B",
    "netProfit": "3.8B",
    "debtEquity": "N/A",
    "sparkline": [
      21.5,
      21.2,
      21.1,
      21.1,
      21.1,
      20.92,
      20.96
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 21.2
      },
      {
        "date": "2026-10-27",
        "price": 21.2
      },
      {
        "date": "2026-10-28",
        "price": 21.3
      },
      {
        "date": "2026-10-29",
        "price": 21.4
      },
      {
        "date": "2026-10-30",
        "price": 21.14
      },
      {
        "date": "2026-11-02",
        "price": 21.18
      },
      {
        "date": "2026-11-03",
        "price": 21.34
      },
      {
        "date": "2026-11-04",
        "price": 21.24
      },
      {
        "date": "2026-11-05",
        "price": 22.2
      },
      {
        "date": "2026-11-06",
        "price": 22
      },
      {
        "date": "2026-11-10",
        "price": 21.98
      },
      {
        "date": "2026-11-11",
        "price": 21.48
      },
      {
        "date": "2026-11-12",
        "price": 21.5
      },
      {
        "date": "2026-11-13",
        "price": 21.5
      },
      {
        "date": "2026-11-16",
        "price": 21.5
      },
      {
        "date": "2026-11-17",
        "price": 21.2
      },
      {
        "date": "2026-11-18",
        "price": 21.1
      },
      {
        "date": "2026-11-19",
        "price": 21.1
      },
      {
        "date": "2026-11-20",
        "price": 21.1
      },
      {
        "date": "2026-11-23",
        "price": 20.92
      },
      {
        "date": "2026-11-24",
        "price": 20.96
      }
    ]
  },
  {
    "id": "10",
    "name": "SD Guthrie (Sime Plantation)",
    "ticker": "SIMEPLT",
    "klseCode": "5285.KL",
    "shariahCompliant": true,
    "price": "5.93",
    "change": "+0.08",
    "changePercent": "+1.37%",
    "isPositive": true,
    "description": "SD Guthrie Berhad (formerly Sime Darby Plantation) is the world's largest producer of certified sustainable palm oil.",
    "sector": "Plantation",
    "peRatio": "14.20",
    "dividendYield": "2.60%",
    "marketCap": "31.2B",
    "volume": "3.0M",
    "revenue": "18.4B",
    "netProfit": "2.2B",
    "debtEquity": "0.35",
    "sparkline": [
      6.1,
      6.08,
      5.97,
      6,
      5.91,
      5.85,
      5.93
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 5.7
      },
      {
        "date": "2026-10-27",
        "price": 5.76
      },
      {
        "date": "2026-10-28",
        "price": 5.75
      },
      {
        "date": "2026-10-29",
        "price": 5.77
      },
      {
        "date": "2026-10-30",
        "price": 5.83
      },
      {
        "date": "2026-11-02",
        "price": 5.84
      },
      {
        "date": "2026-11-03",
        "price": 5.93
      },
      {
        "date": "2026-11-04",
        "price": 5.93
      },
      {
        "date": "2026-11-05",
        "price": 6
      },
      {
        "date": "2026-11-06",
        "price": 6
      },
      {
        "date": "2026-11-10",
        "price": 5.93
      },
      {
        "date": "2026-11-11",
        "price": 5.99
      },
      {
        "date": "2026-11-12",
        "price": 6.15
      },
      {
        "date": "2026-11-13",
        "price": 6.04
      },
      {
        "date": "2026-11-16",
        "price": 6.1
      },
      {
        "date": "2026-11-17",
        "price": 6.08
      },
      {
        "date": "2026-11-18",
        "price": 5.97
      },
      {
        "date": "2026-11-19",
        "price": 6
      },
      {
        "date": "2026-11-20",
        "price": 5.91
      },
      {
        "date": "2026-11-23",
        "price": 5.85
      },
      {
        "date": "2026-11-24",
        "price": 5.93
      }
    ]
  },
  {
    "id": "11",
    "name": "Maxis Berhad",
    "ticker": "MAXIS",
    "klseCode": "6012.KL",
    "shariahCompliant": true,
    "price": "3.77",
    "change": "+0.05",
    "changePercent": "+1.34%",
    "isPositive": true,
    "description": "Maxis Berhad is a leading converged communications and digital services company in Malaysia.",
    "sector": "Telecommunications",
    "peRatio": "22.80",
    "dividendYield": "4.50%",
    "marketCap": "27.8B",
    "volume": "1.7M",
    "revenue": "10.2B",
    "netProfit": "1.1B",
    "debtEquity": "0.95",
    "sparkline": [
      3.56,
      3.59,
      3.65,
      3.7,
      3.74,
      3.72,
      3.77
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 3.58
      },
      {
        "date": "2026-10-27",
        "price": 3.65
      },
      {
        "date": "2026-10-28",
        "price": 3.51
      },
      {
        "date": "2026-10-29",
        "price": 3.54
      },
      {
        "date": "2026-10-30",
        "price": 3.56
      },
      {
        "date": "2026-11-02",
        "price": 3.61
      },
      {
        "date": "2026-11-03",
        "price": 3.58
      },
      {
        "date": "2026-11-04",
        "price": 3.6
      },
      {
        "date": "2026-11-05",
        "price": 3.6
      },
      {
        "date": "2026-11-06",
        "price": 3.5
      },
      {
        "date": "2026-11-10",
        "price": 3.58
      },
      {
        "date": "2026-11-11",
        "price": 3.57
      },
      {
        "date": "2026-11-12",
        "price": 3.54
      },
      {
        "date": "2026-11-13",
        "price": 3.56
      },
      {
        "date": "2026-11-16",
        "price": 3.56
      },
      {
        "date": "2026-11-17",
        "price": 3.59
      },
      {
        "date": "2026-11-18",
        "price": 3.65
      },
      {
        "date": "2026-11-19",
        "price": 3.7
      },
      {
        "date": "2026-11-20",
        "price": 3.74
      },
      {
        "date": "2026-11-23",
        "price": 3.72
      },
      {
        "date": "2026-11-24",
        "price": 3.77
      }
    ]
  },
  {
    "id": "12",
    "name": "MISC Berhad",
    "ticker": "MISC",
    "klseCode": "3816.KL",
    "shariahCompliant": true,
    "price": "7.70",
    "change": "+0.02",
    "changePercent": "+0.26%",
    "isPositive": true,
    "description": "MISC Berhad is a global energy-related maritime solutions and LNG shipping provider.",
    "sector": "Transportation",
    "peRatio": "15.60",
    "dividendYield": "4.05%",
    "marketCap": "36.4B",
    "volume": "706K",
    "revenue": "12.8B",
    "netProfit": "2.1B",
    "debtEquity": "0.28",
    "sparkline": [
      7.78,
      7.65,
      7.8,
      7.62,
      7.56,
      7.68,
      7.7
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 8.35
      },
      {
        "date": "2026-10-27",
        "price": 8.3
      },
      {
        "date": "2026-10-28",
        "price": 8.29
      },
      {
        "date": "2026-10-29",
        "price": 8.2
      },
      {
        "date": "2026-10-30",
        "price": 8.25
      },
      {
        "date": "2026-11-02",
        "price": 8.52
      },
      {
        "date": "2026-11-03",
        "price": 8.35
      },
      {
        "date": "2026-11-04",
        "price": 8.45
      },
      {
        "date": "2026-11-05",
        "price": 8.11
      },
      {
        "date": "2026-11-06",
        "price": 8.01
      },
      {
        "date": "2026-11-10",
        "price": 7.99
      },
      {
        "date": "2026-11-11",
        "price": 7.7
      },
      {
        "date": "2026-11-12",
        "price": 7.85
      },
      {
        "date": "2026-11-13",
        "price": 7.72
      },
      {
        "date": "2026-11-16",
        "price": 7.78
      },
      {
        "date": "2026-11-17",
        "price": 7.65
      },
      {
        "date": "2026-11-18",
        "price": 7.8
      },
      {
        "date": "2026-11-19",
        "price": 7.62
      },
      {
        "date": "2026-11-20",
        "price": 7.56
      },
      {
        "date": "2026-11-23",
        "price": 7.68
      },
      {
        "date": "2026-11-24",
        "price": 7.7
      }
    ]
  },
  {
    "id": "13",
    "name": "Nestle (Malaysia)",
    "ticker": "NESTLE",
    "klseCode": "4707.KL",
    "shariahCompliant": true,
    "price": "94.64",
    "change": "+1.64",
    "changePercent": "+1.76%",
    "isPositive": true,
    "description": "Nestle Malaysia is the largest Halal producer in the Nestle world and a leading household nutrition brand.",
    "sector": "Consumer Products",
    "peRatio": "45.20",
    "dividendYield": "2.80%",
    "marketCap": "27.8B",
    "volume": "41K",
    "revenue": "6.5B",
    "netProfit": "0.7B",
    "debtEquity": "1.05",
    "sparkline": [
      94.42,
      95.26,
      94.3,
      94.64,
      94.7,
      93,
      94.64
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 90.26
      },
      {
        "date": "2026-10-27",
        "price": 94.28
      },
      {
        "date": "2026-10-28",
        "price": 97.98
      },
      {
        "date": "2026-10-29",
        "price": 95.9
      },
      {
        "date": "2026-10-30",
        "price": 95.94
      },
      {
        "date": "2026-11-02",
        "price": 96.12
      },
      {
        "date": "2026-11-03",
        "price": 95.88
      },
      {
        "date": "2026-11-04",
        "price": 93.5
      },
      {
        "date": "2026-11-05",
        "price": 96
      },
      {
        "date": "2026-11-06",
        "price": 94.16
      },
      {
        "date": "2026-11-10",
        "price": 95
      },
      {
        "date": "2026-11-11",
        "price": 95.54
      },
      {
        "date": "2026-11-12",
        "price": 94.94
      },
      {
        "date": "2026-11-13",
        "price": 93
      },
      {
        "date": "2026-11-16",
        "price": 94.42
      },
      {
        "date": "2026-11-17",
        "price": 95.26
      },
      {
        "date": "2026-11-18",
        "price": 94.3
      },
      {
        "date": "2026-11-19",
        "price": 94.64
      },
      {
        "date": "2026-11-20",
        "price": 94.7
      },
      {
        "date": "2026-11-23",
        "price": 93
      },
      {
        "date": "2026-11-24",
        "price": 94.64
      }
    ]
  },
  {
    "id": "14",
    "name": "RHB Bank Berhad",
    "ticker": "RHBBANK",
    "klseCode": "1066.KL",
    "shariahCompliant": false,
    "price": "7.69",
    "change": "+0.01",
    "changePercent": "+0.13%",
    "isPositive": true,
    "description": "RHB Bank is the fourth largest fully integrated financial services group in Malaysia.",
    "sector": "Financial Services",
    "peRatio": "8.90",
    "dividendYield": "6.40%",
    "marketCap": "26.2B",
    "volume": "10.8M",
    "revenue": "13.2B",
    "netProfit": "2.9B",
    "debtEquity": "N/A",
    "sparkline": [
      7.59,
      7.63,
      7.63,
      7.65,
      7.65,
      7.68,
      7.69
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 7.35
      },
      {
        "date": "2026-10-27",
        "price": 7.36
      },
      {
        "date": "2026-10-28",
        "price": 7.38
      },
      {
        "date": "2026-10-29",
        "price": 7.47
      },
      {
        "date": "2026-10-30",
        "price": 7.45
      },
      {
        "date": "2026-11-02",
        "price": 7.5
      },
      {
        "date": "2026-11-03",
        "price": 7.71
      },
      {
        "date": "2026-11-04",
        "price": 7.73
      },
      {
        "date": "2026-11-05",
        "price": 7.74
      },
      {
        "date": "2026-11-06",
        "price": 7.73
      },
      {
        "date": "2026-11-10",
        "price": 7.69
      },
      {
        "date": "2026-11-11",
        "price": 7.54
      },
      {
        "date": "2026-11-12",
        "price": 7.53
      },
      {
        "date": "2026-11-13",
        "price": 7.73
      },
      {
        "date": "2026-11-16",
        "price": 7.59
      },
      {
        "date": "2026-11-17",
        "price": 7.63
      },
      {
        "date": "2026-11-18",
        "price": 7.63
      },
      {
        "date": "2026-11-19",
        "price": 7.65
      },
      {
        "date": "2026-11-20",
        "price": 7.65
      },
      {
        "date": "2026-11-23",
        "price": 7.68
      },
      {
        "date": "2026-11-24",
        "price": 7.69
      }
    ]
  },
  {
    "id": "15",
    "name": "IOI Corporation",
    "ticker": "IOICORP",
    "klseCode": "1961.KL",
    "shariahCompliant": true,
    "price": "4.32",
    "change": "+0.04",
    "changePercent": "+0.93%",
    "isPositive": true,
    "description": "IOI Corporation is a leading global integrated and sustainable palm oil player.",
    "sector": "Plantation",
    "peRatio": "20.10",
    "dividendYield": "2.50%",
    "marketCap": "25.0B",
    "volume": "3.2M",
    "revenue": "11.5B",
    "netProfit": "1.2B",
    "debtEquity": "0.30",
    "sparkline": [
      4.45,
      4.4,
      4.34,
      4.33,
      4.32,
      4.28,
      4.32
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.47
      },
      {
        "date": "2026-10-27",
        "price": 4.45
      },
      {
        "date": "2026-10-28",
        "price": 4.44
      },
      {
        "date": "2026-10-29",
        "price": 4.43
      },
      {
        "date": "2026-10-30",
        "price": 4.44
      },
      {
        "date": "2026-11-02",
        "price": 4.46
      },
      {
        "date": "2026-11-03",
        "price": 4.45
      },
      {
        "date": "2026-11-04",
        "price": 4.44
      },
      {
        "date": "2026-11-05",
        "price": 4.42
      },
      {
        "date": "2026-11-06",
        "price": 4.33
      },
      {
        "date": "2026-11-10",
        "price": 4.29
      },
      {
        "date": "2026-11-11",
        "price": 4.39
      },
      {
        "date": "2026-11-12",
        "price": 4.51
      },
      {
        "date": "2026-11-13",
        "price": 4.41
      },
      {
        "date": "2026-11-16",
        "price": 4.45
      },
      {
        "date": "2026-11-17",
        "price": 4.4
      },
      {
        "date": "2026-11-18",
        "price": 4.34
      },
      {
        "date": "2026-11-19",
        "price": 4.33
      },
      {
        "date": "2026-11-20",
        "price": 4.32
      },
      {
        "date": "2026-11-23",
        "price": 4.28
      },
      {
        "date": "2026-11-24",
        "price": 4.32
      }
    ]
  },
  {
    "id": "16",
    "name": "Top Glove Corporation",
    "ticker": "TOPGLOV",
    "klseCode": "7113.KL",
    "shariahCompliant": true,
    "price": "0.86",
    "change": "-0.02",
    "changePercent": "-2.27%",
    "isPositive": false,
    "description": "Top Glove Corporation is one of the world's largest manufacturers of medical and nitrile gloves.",
    "sector": "Health Care",
    "peRatio": "78.50",
    "dividendYield": "N/A",
    "marketCap": "7.5B",
    "volume": "12.1M",
    "revenue": "2.2B",
    "netProfit": "-0.05B",
    "debtEquity": "0.18",
    "sparkline": [
      0.94,
      0.93,
      0.93,
      0.93,
      0.92,
      0.88,
      0.86
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 0.93
      },
      {
        "date": "2026-10-27",
        "price": 0.96
      },
      {
        "date": "2026-10-28",
        "price": 0.97
      },
      {
        "date": "2026-10-29",
        "price": 0.99
      },
      {
        "date": "2026-10-30",
        "price": 0.98
      },
      {
        "date": "2026-11-02",
        "price": 0.96
      },
      {
        "date": "2026-11-03",
        "price": 0.95
      },
      {
        "date": "2026-11-04",
        "price": 1
      },
      {
        "date": "2026-11-05",
        "price": 0.94
      },
      {
        "date": "2026-11-06",
        "price": 0.96
      },
      {
        "date": "2026-11-10",
        "price": 0.94
      },
      {
        "date": "2026-11-11",
        "price": 0.96
      },
      {
        "date": "2026-11-12",
        "price": 0.93
      },
      {
        "date": "2026-11-13",
        "price": 0.91
      },
      {
        "date": "2026-11-16",
        "price": 0.94
      },
      {
        "date": "2026-11-17",
        "price": 0.93
      },
      {
        "date": "2026-11-18",
        "price": 0.93
      },
      {
        "date": "2026-11-19",
        "price": 0.93
      },
      {
        "date": "2026-11-20",
        "price": 0.92
      },
      {
        "date": "2026-11-23",
        "price": 0.88
      },
      {
        "date": "2026-11-24",
        "price": 0.86
      }
    ]
  },
  {
    "id": "17",
    "name": "Gamuda Berhad",
    "ticker": "GAMUDA",
    "klseCode": "5398.KL",
    "shariahCompliant": true,
    "price": "4.49",
    "change": "+0.02",
    "changePercent": "+0.45%",
    "isPositive": true,
    "description": "Gamuda Berhad is a regional engineering, data-center infrastructure, and property group based in Malaysia.",
    "sector": "Construction",
    "peRatio": "18.40",
    "dividendYield": "1.50%",
    "marketCap": "21.5B",
    "volume": "9.1M",
    "revenue": "8.4B",
    "netProfit": "1.2B",
    "debtEquity": "0.45",
    "sparkline": [
      4.57,
      4.55,
      4.59,
      4.56,
      4.56,
      4.47,
      4.49
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.88
      },
      {
        "date": "2026-10-27",
        "price": 4.91
      },
      {
        "date": "2026-10-28",
        "price": 5
      },
      {
        "date": "2026-10-29",
        "price": 5
      },
      {
        "date": "2026-10-30",
        "price": 4.92
      },
      {
        "date": "2026-11-02",
        "price": 4.86
      },
      {
        "date": "2026-11-03",
        "price": 4.94
      },
      {
        "date": "2026-11-04",
        "price": 4.94
      },
      {
        "date": "2026-11-05",
        "price": 4.93
      },
      {
        "date": "2026-11-06",
        "price": 4.82
      },
      {
        "date": "2026-11-10",
        "price": 4.84
      },
      {
        "date": "2026-11-11",
        "price": 4.9
      },
      {
        "date": "2026-11-12",
        "price": 4.68
      },
      {
        "date": "2026-11-13",
        "price": 4.56
      },
      {
        "date": "2026-11-16",
        "price": 4.57
      },
      {
        "date": "2026-11-17",
        "price": 4.55
      },
      {
        "date": "2026-11-18",
        "price": 4.59
      },
      {
        "date": "2026-11-19",
        "price": 4.56
      },
      {
        "date": "2026-11-20",
        "price": 4.56
      },
      {
        "date": "2026-11-23",
        "price": 4.47
      },
      {
        "date": "2026-11-24",
        "price": 4.49
      }
    ]
  },
  {
    "id": "18",
    "name": "Genting Malaysia",
    "ticker": "GENM",
    "klseCode": "4715.KL",
    "shariahCompliant": false,
    "price": "1.14",
    "change": "+0.00",
    "changePercent": "+0.00%",
    "isPositive": true,
    "description": "Genting Malaysia operates integrated leisure and hospitality resorts including Resorts World Genting.",
    "sector": "Consumer Services",
    "peRatio": "14.80",
    "dividendYield": "5.80%",
    "marketCap": "14.5B",
    "volume": "2.5M",
    "revenue": "10.2B",
    "netProfit": "0.9B",
    "debtEquity": "0.86",
    "sparkline": [
      1.22,
      1.21,
      1.21,
      1.19,
      1.16,
      1.14,
      1.14
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 1.16
      },
      {
        "date": "2026-10-27",
        "price": 1.15
      },
      {
        "date": "2026-10-28",
        "price": 1.22
      },
      {
        "date": "2026-10-29",
        "price": 1.22
      },
      {
        "date": "2026-10-30",
        "price": 1.25
      },
      {
        "date": "2026-11-02",
        "price": 1.26
      },
      {
        "date": "2026-11-03",
        "price": 1.26
      },
      {
        "date": "2026-11-04",
        "price": 1.23
      },
      {
        "date": "2026-11-05",
        "price": 1.26
      },
      {
        "date": "2026-11-06",
        "price": 1.22
      },
      {
        "date": "2026-11-10",
        "price": 1.24
      },
      {
        "date": "2026-11-11",
        "price": 1.23
      },
      {
        "date": "2026-11-12",
        "price": 1.25
      },
      {
        "date": "2026-11-13",
        "price": 1.22
      },
      {
        "date": "2026-11-16",
        "price": 1.22
      },
      {
        "date": "2026-11-17",
        "price": 1.21
      },
      {
        "date": "2026-11-18",
        "price": 1.21
      },
      {
        "date": "2026-11-19",
        "price": 1.19
      },
      {
        "date": "2026-11-20",
        "price": 1.16
      },
      {
        "date": "2026-11-23",
        "price": 1.14
      },
      {
        "date": "2026-11-24",
        "price": 1.14
      }
    ]
  },
  {
    "id": "19",
    "name": "YTL Power International",
    "ticker": "YTLPOWR",
    "klseCode": "6742.KL",
    "shariahCompliant": false,
    "price": "4.20",
    "change": "+0.29",
    "changePercent": "+7.42%",
    "isPositive": true,
    "description": "YTL Power operates power generation, water utilities, telecommunications, and AI data centers.",
    "sector": "Utilities",
    "peRatio": "12.50",
    "dividendYield": "1.80%",
    "marketCap": "39.8B",
    "volume": "41.0M",
    "revenue": "21.8B",
    "netProfit": "3.1B",
    "debtEquity": "1.60",
    "sparkline": [
      4.46,
      4.05,
      4,
      4,
      3.95,
      3.91,
      4.2
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.96
      },
      {
        "date": "2026-10-27",
        "price": 5.1
      },
      {
        "date": "2026-10-28",
        "price": 5.27
      },
      {
        "date": "2026-10-29",
        "price": 5.3
      },
      {
        "date": "2026-10-30",
        "price": 5.32
      },
      {
        "date": "2026-11-02",
        "price": 5.14
      },
      {
        "date": "2026-11-03",
        "price": 5.15
      },
      {
        "date": "2026-11-04",
        "price": 5.24
      },
      {
        "date": "2026-11-05",
        "price": 5.27
      },
      {
        "date": "2026-11-06",
        "price": 5.01
      },
      {
        "date": "2026-11-10",
        "price": 4.69
      },
      {
        "date": "2026-11-11",
        "price": 4.79
      },
      {
        "date": "2026-11-12",
        "price": 4.4
      },
      {
        "date": "2026-11-13",
        "price": 4.35
      },
      {
        "date": "2026-11-16",
        "price": 4.46
      },
      {
        "date": "2026-11-17",
        "price": 4.05
      },
      {
        "date": "2026-11-18",
        "price": 4
      },
      {
        "date": "2026-11-19",
        "price": 4
      },
      {
        "date": "2026-11-20",
        "price": 3.95
      },
      {
        "date": "2026-11-23",
        "price": 3.91
      },
      {
        "date": "2026-11-24",
        "price": 4.2
      }
    ]
  },
  {
    "id": "20",
    "name": "Sunway Berhad",
    "ticker": "SUNWAY",
    "klseCode": "5211.KL",
    "shariahCompliant": false,
    "price": "4.14",
    "change": "+0.07",
    "changePercent": "+1.72%",
    "isPositive": true,
    "description": "Sunway Berhad is a Malaysian conglomerate spanning townships, healthcare, construction, and hospitality.",
    "sector": "Industrial Products",
    "peRatio": "20.60",
    "dividendYield": "2.10%",
    "marketCap": "20.5B",
    "volume": "1.6M",
    "revenue": "6.1B",
    "netProfit": "0.8B",
    "debtEquity": "0.65",
    "sparkline": [
      4.35,
      4.36,
      4.32,
      4.07,
      4.05,
      4.07,
      4.14
    ],
    "history": [
      {
        "date": "2026-10-26",
        "price": 4.24
      },
      {
        "date": "2026-10-27",
        "price": 4.29
      },
      {
        "date": "2026-10-28",
        "price": 4.35
      },
      {
        "date": "2026-10-29",
        "price": 4.3
      },
      {
        "date": "2026-10-30",
        "price": 4.39
      },
      {
        "date": "2026-11-02",
        "price": 4.37
      },
      {
        "date": "2026-11-03",
        "price": 4.35
      },
      {
        "date": "2026-11-04",
        "price": 4.36
      },
      {
        "date": "2026-11-05",
        "price": 4.47
      },
      {
        "date": "2026-11-06",
        "price": 4.33
      },
      {
        "date": "2026-11-10",
        "price": 4.4
      },
      {
        "date": "2026-11-11",
        "price": 4.41
      },
      {
        "date": "2026-11-12",
        "price": 4.35
      },
      {
        "date": "2026-11-13",
        "price": 4.3
      },
      {
        "date": "2026-11-16",
        "price": 4.35
      },
      {
        "date": "2026-11-17",
        "price": 4.36
      },
      {
        "date": "2026-11-18",
        "price": 4.32
      },
      {
        "date": "2026-11-19",
        "price": 4.07
      },
      {
        "date": "2026-11-20",
        "price": 4.05
      },
      {
        "date": "2026-11-23",
        "price": 4.07
      },
      {
        "date": "2026-11-24",
        "price": 4.14
      }
    ]
  }
];
