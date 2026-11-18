# HANDOFF.md — JomINVEST (Bursa Malaysia Equity Simulator & Research Platform)

## 1. What Is Live (`feat/bursa-upgrades`)

- **Origin × Public.com Consumer Wealth & Guided Learning UI**:
  - Replaced `Instrument Serif` and ALL-CAPS terminal kickers with **`Plus Jakarta Sans`** + **`Inter`** (`tabular-nums` for prices), warm porcelain surfaces (`#F7F8FA` canvas, `#FFFFFF` `16px` elevated cards with soft shadows), and color-coded company monogram avatars (`.jom-avatar` for `MB`, `TN`, `CB`, `PB`, `GM`, `IN`, etc.).
  - **Origin-style Portfolio & Daily Market Brief Hero** (`src/components/Dashboard.tsx`) that pairs the user's Total Practice Balance (`RM 10,000.00`+) with a 1-sentence plain-English takeaway of what is moving on Bursa Malaysia today.
  - **Public.com-style Company Overview** (`src/components/StockDetails.tsx`) featuring an **"In Plain English: How They Make Money"** story card, 5 horizontal factor health bars alongside the Radar chart, **"Tap to Learn (+10 XP)"** beginner metric cards with Malaysian analogies, and a streamlined **Practice Trade** card with a collapsible Bursa fee breakdown.
  - **Friendly Diversification Coach & Learn Hub** (`src/components/PortfolioPage.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`) with a 3-card **"30-Second Annual Report Cheat Sheet"** (`JomRingkas`), visual **Bursa Market Mood** & news story cards (`JomSentimen`), **Stocks vs. EPF (KWSP) & FD Wealth Calculator**, and **Ask JomAI — Your Bursa Study Buddy**.
- **Bursa Malaysia Market Data & News Service (`src/services/bursaService.ts`, `src/data/stocks.ts`)**:
  - 26 Main Market Bursa Malaysia (`.KL`) equities (`MAYBANK`, `PBBANK`, `TENAGA`, `CIMB`, `GAMUDA`, `INARI`, `YTLPOWR`, `PAVREIT`, etc.) with SC Malaysia SAC Shariah tags (`isShariah`), 5-axis `radarScores`, and statutory `calculateBursaFees()`.
  - 30-minute `localStorage` caching (`jominvest_bursa_quotes_v1` and `jominvest_bursa_news_v1`), Bursa trading-hours detection (`09:00–12:30`, `14:30–17:00` MYT), on-demand `.KL` search, and dynamic market breadth calculation (`computeMarketBreadth`).
- **Simulated Brokerage Execution & Portfolio Risk Ledger (`src/components/StockDetails.tsx`, `src/components/PortfolioPage.tsx`)**:
  - `RM 10,000.00` practice capital wallet (`cashBalance`), `Standard Lot (100 shares)` vs `Starter Unit (1 share)` order toggle, itemized Bursa Malaysia fee breakdown (`Brokerage 0.10% min RM 1`, `Clearing 0.03%`, `Stamp Duty RM 1/RM 1,000`), and Trade History ledger.
  - 5-Axis Fundamental Factor Radar + horizontal progress bars with side-by-side peer comparison.
  - Diversification Coach (`Sector Mix`, `Shariah Balance`, `Dividend Income`) + Projected Annual/Monthly Single-Tier Dividend tracker.
- **Learn & Research Hub (`JomRingkas`, `JomSentimen`, 10-Year Benchmark Model) & `JomAI` Study Buddy (`src/services/aiService.ts`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`)**:
  - `JomRingkas`: Client-side `.PDF` / `.TXT` document extraction (`extractTextFromDocument`) + custom text paste + 3-card plain-English cheat sheet (`What's Going Well`, `What to Watch Out For`, `Dividends & Shariah Status`).
  - `JomSentimen`: Visual Market Mood bar (`0–100`) + Yahoo Finance Malaysia news story cards with sentiment pills (`Bullish`, `Neutral`, `Cautious`).
  - `10-Year Compounding Model`: Compares monthly Ringgit contributions against **EPF (KWSP) / ASB (5.5% p.a.)** and **Malaysian Fixed Deposits (3.0% p.a.)**.
  - Centralized AI routing (`/api/ai` in `api/ai.js` and `VITE_AI_API_KEY` in `.env`) with 6-hour `localStorage` response caching (`jominvest_ai_cache_v1`), prompt-injection/compliance safeguards (`evaluateQuerySafeguards`), and a local quantitative fallback engine (`QUANT_ENGINE`).

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
├── index.html                       # Plus Jakarta Sans & Inter typography imports & app root
├── vite.config.ts                   # Vite config + /api/yahoo proxy
└── src/
    ├── App.tsx                      # Unified workspace shell, wallet, portfolio & XP state
    ├── index.css                    # Origin x Public.com design tokens & static utility rules
    ├── data/
    │   └── stocks.ts                # 26 Bursa Malaysia (.KL) equities & calculateBursaFees()
    ├── services/
    │   ├── bursaService.ts          # 30m cached Yahoo Finance .KL quotes, news wire & breadth
    │   └── aiService.ts             # PDF text parser, safeguards, 6h cache & AI routing
    └── components/
        ├── LoginScreen.tsx          # Approachable Malaysian finance education onboarding
        ├── RiskQuestionnaire.tsx    # 60-second investing style quiz
        ├── Dashboard.tsx            # Origin Daily Brief hero, Guided Picks & Stock Explorer
        ├── StockDetails.tsx         # Public.com-style Company Overview & Practice Trade card
        ├── PortfolioPage.tsx        # Holdings, Diversification Coach & Dividend Estimator
        ├── WatchlistPage.tsx        # Saved Stocks Watchlist with monograms & yield summary
        ├── AIRecommendation.tsx     # Personalised Bursa Starter Picks
        ├── EducationalHub.tsx       # 30-Sec Annual Report Cheat Sheet, Market Mood & EPF Calc
        ├── ChatbotModal.tsx         # Slide-over Ask JomAI Study Buddy drawer
        └── ProfileSettings.tsx      # Investor Profile, Wallet Top-Up & Learning Milestones
```

---

## 3. Binding Decisions & Reasons

1. **Origin × Public.com Consumer Wealth & Guided Learning UI over Faux-Newspaper Terminal**:
   - *Reason*: Dropped `Instrument Serif` and ALL-CAPS monospace kickers (`01 / EQUITY SCREENER`) which felt cold and AI-generated. Adopted `Plus Jakarta Sans` + `Inter`, `16px` soft-shadow cards, company monograms (`.jom-avatar`), and Origin's "verdict-first" layout (balance + 1-sentence plain-English takeaway before raw data).
2. **Delayed + Cached Market Feed (30-min TTL) over Paid Real-Time WebSockets**:
   - *Reason*: Keeps infrastructure 100% free while covering all major Bursa Malaysia `.KL` equities and respecting trading hours (`09:00–12:30`, `14:30–17:00` MYT).
3. **Centralized App AI Key (`/api/ai` + `VITE_AI_API_KEY`) with 6-Hour Cache & Local Quantitative Fallback**:
   - *Reason*: End-users never have to bring their own key (`BYOK` UI removed). A 6-hour response cache (`jominvest_ai_cache_v1`) stretches the 15 RPM free quota across concurrent users, and `QUANT_ENGINE` guarantees zero downtime if rate-limited or offline.
4. **Static CSS Utility Coverage in `src/index.css`**:
   - *Reason*: The project was exported without a PostCSS/Tailwind compiler in `package.json`, so all `.jom-*` design tokens and responsive grid/spacing utilities are explicitly defined in `src/index.css`.

---

## 4. Phase Status

- [x] **Phase 1**: Low-resource Bursa Malaysia `.KL` data service & 26 stocks (`b6aaf99`)
- [x] **Phase 2**: Virtual Cash Wallet (`RM 10,000`), Bursa fee math & Lot/Unit toggle (`b6aaf99`)
- [x] **Phase 3**: Portfolio Risk & Concentration Audit + Dividend tracker (`b6aaf99`)
- [x] **Phase 4**: 5-Axis Fundamental Health Radar & Peer Comparison (`b6aaf99`)
- [x] **Phase 5**: `JomRingkas`, `JomSentimen`, EPF/ASB 10Y benchmark & verification quizzes (`b6aaf99`)
- [x] **Phase 6**: Initial Editorial UI overhaul (`ceefae6`)
- [x] **Phase 7**: Real PDF extraction, Yahoo Finance news wire, safeguards & centralized AI service (`1155f07`)
- [x] **Phase 8**: Origin × Public.com Consumer Wealth & Guided Learning UI redesign across all 10 screens + live preview

---

## 5. Next Steps

1. Pull `feat/bursa-upgrades` on your Windows PC, add your `VITE_AI_API_KEY` to `.env`, and verify all flows locally at `http://localhost:3000`.
2. When satisfied, approve merging `feat/bursa-upgrades` into `main`.

---

## 6. How to Resume (Windows 11 PowerShell)

```powershell
# 1. Fetch and switch to the feature branch
git fetch origin
git checkout feat/bursa-upgrades
git pull origin feat/bursa-upgrades

# 2. Configure your local .env file (git-ignored)
Copy-Item .env.example .env
# Edit .env and paste your key after VITE_AI_API_KEY=

# 3. If Norton Antivirus blocks npm/Node TLS in PowerShell:
# $env:NODE_EXTRA_CA_CERTS = "C:\ProgramData\Norton\Antivirus\wscert.pem"

# 4. Install dependencies and start the Vite dev server
npm install
npm run dev
```
