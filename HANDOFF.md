# HANDOFF.md — JomInvest (Bursa Malaysia Practice Trading & Research App)

## 1. What Is Live (`feat/bursa-upgrades`)

- **Clean Unboxed Consumer Investing UI (Phase 9)**:
  - Pure white `#FFFFFF` canvas, `#111111` primary ink, `#525252` secondary text, `#EBEBEB` 1px hairlines, and single-family `Inter` + system sans typography (`tabular-nums` on all prices, shares, and percentages).
  - Removed all AI-template patterns: no colored monogram squares, no pill-chip soup, no nested boxes inside boxes, no gradient area fills under charts, no radar spider charts, and no filler marketing cards.
  - **Top Navigation Bar** (`src/App.tsx`): 56px bar with `JomInvest` wordmark, 2px bottom-border active tab indicators (`Invest`, `Portfolio`, `Watchlist`, `Learn`, `Screener`, `Account`), and quiet right-hand controls (`EN/BM`, `Light/Dark`, `Ask`).
  - **Invest Home** (`src/components/Dashboard.tsx`): Unboxed portfolio balance + crisp 1.75px line chart, underline sector filter tabs, full-bleed tabular Malaysian stock table (`Company`, `Sector`, `Div Yield`, `7D`, `Price`, `Today`), and an unboxed right rail separated by a single 1px left border (`Positions` and `Watchlist`).
  - **Company Overview & Order Ticket** (`src/components/StockDetails.tsx`): Unboxed price line chart, 2-column hairline Key Statistics table (`Market Cap`, `P/E Ratio`, `Dividend Yield`, `Revenue / Net Profit`, `Debt / Equity`, `Volume`) with clickable definitions, Peer Comparison table, and an unboxed right-rail Order Ticket (`Buy`/`Sell`, `100 Shares (1 Lot)` vs `1 Share`, itemized Bursa Malaysia fees).
  - **Portfolio, Watchlist, Screener, Learn & Account** (`PortfolioPage.tsx`, `WatchlistPage.tsx`, `AIRecommendation.tsx`, `EducationalHub.tsx`, `ProfileSettings.tsx`, `ChatbotModal.tsx`, `LoginScreen.tsx`, `RiskQuestionnaire.tsx`): All unified on clean data tables and hairline key-value rows.
- **Bursa Malaysia Market Data & News Service (`src/services/bursaService.ts`, `src/data/stocks.ts`)**:
  - 26 Main Market Bursa Malaysia (`.KL`) equities (`MAYBANK`, `PBBANK`, `TENAGA`, `CIMB`, `GAMUDA`, `INARI`, `YTLPOWR`, `PAVREIT`, etc.) with SC Malaysia Shariah flags (`isShariah`) and statutory `calculateBursaFees()`.
  - 30-minute `localStorage` caching, Bursa trading-hours detection (`09:00–12:30`, `14:30–17:00` MYT), on-demand `.KL` search, and dynamic market breadth calculation.
- **Learn & Research Tools + Assistant (`src/services/aiService.ts`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`)**:
  - Annual Report Reader: Client-side `.PDF` / `.TXT` extraction + 3-part plain-English summary (`Business & Earnings`, `Valuation & Key Risks`, `Dividends & Shariah Status`).
  - Market News: Headlines table + Market Breadth summary (`Sentiment`, `Advancers`, `Decliners`, `Net Flow`, `BNM OPR`).
  - Wealth Calculator: 10-year compounding line chart + benchmark comparison table against EPF/KWSP (`5.5%`) and Fixed Deposits (`3.0%`).
  - Centralized AI routing (`/api/ai` in `api/ai.js` and `VITE_AI_API_KEY` in `.env`) with 6-hour `localStorage` cache, query safeguards, and local quantitative fallback.

---

## 2. Repo Layout

```text
JominvestApp/
├── AGENTS.md                        # Working style & project rules
├── HANDOFF.md                       # Current state, decisions, and resume steps
├── .env.example                     # Template for VITE_AI_API_KEY / AI_API_KEY
├── api/
│   └── ai.js                        # Serverless proxy endpoint (/api/ai) for shared app AI key
├── docs/superpowers/
│   ├── specs/2026-11-17-origin-public-ui-redesign-design.md
│   └── plans/2026-11-17-origin-public-ui-redesign.md
├── index.html                       # Inter font import & app root
├── vite.config.ts                   # Vite config + /api/yahoo proxy
└── src/
    ├── App.tsx                      # Top navigation shell, wallet, portfolio & XP state
    ├── index.css                    # Clean white-canvas design tokens & 100% static utility coverage
    ├── data/
    │   └── stocks.ts                # 26 Bursa Malaysia (.KL) equities & calculateBursaFees()
    ├── services/
    │   ├── bursaService.ts          # 30m cached Yahoo Finance .KL quotes, news wire & breadth
    │   └── aiService.ts             # PDF text parser, safeguards, 6h cache & AI routing
    └── components/
        ├── LoginScreen.tsx          # Split-screen sign-in & live market table preview
        ├── RiskQuestionnaire.tsx    # 5-step investor profile questionnaire
        ├── Dashboard.tsx            # Unboxed portfolio chart, stock table & right rail
        ├── StockDetails.tsx         # Stock chart, 2-col Key Statistics, Peer table & Order Ticket
        ├── PortfolioPage.tsx        # Positions table, Order History table & Account Summary rail
        ├── WatchlistPage.tsx        # Watchlist table & inline ticker search
        ├── AIRecommendation.tsx     # Fundamental Stock Screener table
        ├── EducationalHub.tsx       # Annual Report Reader, Market News, Wealth Calc & Lessons
        ├── ChatbotModal.tsx         # Slide-over Research Assistant drawer
        └── ProfileSettings.tsx      # Account key-value rows, Practice Checklist & Balance rail
```

---

## 3. Phase Status

- [x] **Phase 1–5**: Bursa Malaysia `.KL` data service, `RM 10,000` virtual wallet, statutory fee math, dividend estimator, and research tools (`b6aaf99`)
- [x] **Phase 6–8**: Earlier UI iterations and real PDF/news/AI backend (`1155f07`..`10188eb`)
- [x] **Phase 9**: Clean Unboxed Consumer Investing UI across all 11 components + static CSS verification + headless Chromium screenshot verification

---

## 4. How to Resume (Windows 11 PowerShell)

```powershell
Set-Location "$HOME\JominvestApp"
git fetch origin
git checkout feat/bursa-upgrades
git pull origin feat/bursa-upgrades
npm run dev
```
