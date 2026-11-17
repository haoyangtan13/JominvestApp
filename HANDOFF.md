# HANDOFF.md — JomINVEST (Bursa Malaysia Equity Simulator & Research Platform)

## 1. What Is Live (`feat/bursa-upgrades`)

- **Editorial Fintech Design System & Unified Workspace Shell**:
  - Fonts (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono` with `tabular-nums`) and Light/Dark architectural tokens (`#F6F5F0` Warm Alabaster / `#0B0D10` Deep Obsidian, `1px` hairline borders, `#0A5C36` Bursa Emerald).
  - Persistent Left Navigation Rail (`.jom-sidebar`) + Top Institutional Telemetry Bar (`.jom-topbar`) in `src/App.tsx`.
  - All 10 screens rebuilt with zero emojis and zero gradient clutter.
- **Bursa Malaysia Market Data & News Service (`src/services/bursaService.ts`, `src/data/stocks.ts`)**:
  - 26 Main Market Bursa Malaysia (`.KL`) equities (`MAYBANK`, `PBBANK`, `TENAGA`, `CIMB`, `GAMUDA`, `INARI`, `YTLPOWR`, `PAVREIT`, etc.) with SC Malaysia SAC Shariah tags (`isShariah`), 5-axis `radarScores`, and statutory `calculateBursaFees()`.
  - 30-minute `localStorage` caching (`jominvest_bursa_quotes_v1` and `jominvest_bursa_news_v1`), Bursa trading-hours detection (`09:00–12:30`, `14:30–17:00` MYT), on-demand `.KL` search, and dynamic market breadth calculation (`computeMarketBreadth`).
- **Simulated Brokerage Execution & Portfolio Risk Ledger (`src/components/StockDetails.tsx`, `src/components/PortfolioPage.tsx`)**:
  - `RM 10,000.00` practice capital wallet (`cashBalance`), `Board Lot (×100 sh)` vs `Micro-Unit (×1 sh)` order toggle, itemized Bursa Malaysia fee breakdown (`Brokerage 0.10% min RM 1`, `Clearing 0.03%`, `Stamp Duty RM 1/RM 1,000`), and Contract Note History ledger.
  - 5-Axis Fundamental Factor Radar with side-by-side peer comparison table.
  - 3-column Portfolio Risk & Concentration Audit (`Sector Concentration`, `SAC Shariah Allocation`, `Mandate Alignment`) + Projected Annual/Monthly Single-Tier Dividend tracker.
- **Research Desk (`JomRingkas`, `JomSentimen`, 10-Year Benchmark Model) & `JomAI` Copilot (`src/services/aiService.ts`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`)**:
  - `JomRingkas`: Client-side `.PDF` / `.TXT` document extraction (`extractTextFromDocument`) + custom text paste + 3-section filing synthesis (`Growth`, `Risk`, `Dividend`) across all listed Bursa issuers.
  - `JomSentimen`: Architectural SVG sentiment breadth arc (`0–100`) + Yahoo Finance Malaysia news wire with automated impact classification (`CONSTRUCTIVE`, `NEUTRAL`, `CAUTIOUS`).
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
├── index.html                       # Typography imports & app root
├── vite.config.ts                   # Vite config + /api/yahoo proxy
└── src/
    ├── App.tsx                      # Unified workspace shell, wallet, portfolio & XP state
    ├── index.css                    # Editorial Fintech Design System tokens & utility rules
    ├── data/
    │   └── stocks.ts                # 26 Bursa Malaysia (.KL) equities & calculateBursaFees()
    ├── services/
    │   ├── bursaService.ts          # 30m cached Yahoo Finance .KL quotes, news wire & breadth
    │   └── aiService.ts             # PDF text parser, safeguards, 6h cache & AI routing
    └── components/
        ├── LoginScreen.tsx          # Split-screen editorial onboarding
        ├── RiskQuestionnaire.tsx    # 5-step investor mandate assessment
        ├── Dashboard.tsx            # 4-cell ledger, conviction list & Bursa screener table
        ├── StockDetails.tsx         # 12-col Equity Terminal, 5-axis radar & Order Ticket
        ├── PortfolioPage.tsx        # Holdings table, 3-col Risk Audit & Contract Notes
        ├── WatchlistPage.tsx        # Tracked securities table & yield summary
        ├── AIRecommendation.tsx     # Mandate-calibrated equity thesis list
        ├── EducationalHub.tsx       # JomRingkas PDF, JomSentimen, 10Y EPF/ASB model & quizzes
        ├── ChatbotModal.tsx         # Slide-over JomAI Research Copilot drawer
        └── ProfileSettings.tsx      # Account configuration, capital controls & milestones
```

---

## 3. Binding Decisions & Reasons

1. **Delayed + Cached Market Feed (30-min TTL) over Paid Real-Time WebSockets**:
   - *Reason*: Keeps infrastructure 100% free while covering all major Bursa Malaysia `.KL` equities and respecting trading hours (`09:00–12:30`, `14:30–17:00` MYT).
2. **Centralized App AI Key (`/api/ai` + `VITE_AI_API_KEY`) with 6-Hour Cache & Local Quantitative Fallback**:
   - *Reason*: End-users never have to bring their own key (`BYOK` UI removed). A 6-hour response cache (`jominvest_ai_cache_v1`) stretches the 15 RPM free quota across concurrent users, and `QUANT_ENGINE` guarantees zero downtime if rate-limited or offline.
3. **Static CSS Utility Coverage in `src/index.css`**:
   - *Reason*: The project was exported without a PostCSS/Tailwind compiler in `package.json`, so all `.jom-*` design tokens and responsive grid/spacing utilities are explicitly defined in `src/index.css`.

---

## 4. Phase Status

- [x] **Phase 1**: Low-resource Bursa Malaysia `.KL` data service & 26 stocks (`b6aaf99`)
- [x] **Phase 2**: Virtual Cash Wallet (`RM 10,000`), Bursa fee math & Board Lot/Micro-Unit toggle (`b6aaf99`)
- [x] **Phase 3**: Portfolio Risk & Concentration Audit + Dividend tracker (`b6aaf99`)
- [x] **Phase 4**: 5-Axis Fundamental Health Radar & Peer Comparison (`b6aaf99`)
- [x] **Phase 5**: `JomRingkas`, `JomSentimen`, EPF/ASB 10Y benchmark & verification quizzes (`b6aaf99`)
- [x] **Phase 6**: Complete Editorial Fintech UI overhaul across all 10 screens (`ceefae6`)
- [x] **Phase 7**: Real PDF extraction, Yahoo Finance news wire, safeguards & centralized AI service

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
