# JomINVEST Phase 2 — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-11-24-simulator-live-data-ai-design.md`  
**Branch:** `feat/simulator-and-ai`

## Tasks

### Task 1: Vitest Setup & TDD Simulator Engine (`src/lib/simulator.ts`)
- **Files:** `package.json`, `src/lib/simulator.ts`, `src/lib/__tests__/simulator.test.ts`
- **Steps:**
  - Add `vitest` (low concurrency `--pool=forks --maxWorkers=1`) to `devDependencies` and `"test": "vitest run --maxWorkers=1"` script.
  - Write failing unit tests first for `priceToSen`, `formatRMFromSen`, `executeBuy` (sufficient cash, weighted average cost, insufficient cash guard), `executeSell` (partial sell, full sell, realized P&L, over-sell guard), and `simulateDividendPayout`.
  - Implement `src/lib/simulator.ts` + `localStorage` persistence helpers until all tests pass.
- **Commit:** `feat(sim): add integer-sen portfolio, cash, sell, and dividend engine with tests`

### Task 2: Real Bursa `.KL` Snapshot & Market Data Service (`src/data/stocks.ts`, `src/services/marketData.ts`)
- **Files:** `scripts/fetch-klse-snapshot.mjs`, `src/data/stocks.ts`, `src/services/marketData.ts`, `src/services/__tests__/marketData.test.ts`
- **Steps:**
  - Fetch real 30-day daily closing prices & current quotes from Yahoo Finance `.KL` for all 20 Bursa Malaysia counters (`Asia/Kuala_Lumpur` dates), adding `klseCode`, `shariahCompliant`, and `lastUpdated` metadata into `src/data/stocks.ts` (replacing `Math.random()`).
  - Build `src/services/marketData.ts` + unit tests to merge live `/api/stocks` updates safely over the static snapshot with automatic fallback.
- **Commit:** `feat(data): populate real KLSE 30-day stock data, Shariah flags, and live sync service`

### Task 3: Smart AI Service & Interactive Lesson/Quiz Content (`src/services/aiService.ts`, `src/data/lessons.ts`)
- **Files:** `src/services/aiService.ts`, `src/services/__tests__/aiService.test.ts`, `src/data/lessons.ts`
- **Steps:**
  - Create `src/services/aiService.ts` supporting `/api/ai` (Gemini Flash) with automatic data-grounded local analyst fallback for all 20 Bursa stocks (`askJomAI` and `analyzeStockReport`), plus unit tests verifying zero emojis and stock-metric grounding.
  - Create `src/data/lessons.ts` with full ENG/BM content and 2-question quizzes (`+25 XP`) for all Articles and Video Guides.
- **Commit:** `feat(ai): add grounded AI coach/report service and interactive ENG/BM lessons`

### Task 4: Wire UI Upgrades Across App (`App.tsx`, `Dashboard`, `StockDetails`, `PortfolioPage`, `EducationalHub`, `ChatbotModal`, `ProfileSettings`)
- **Files:** `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/Dashboard.tsx`, `src/components/StockDetails.tsx`, `src/components/PortfolioPage.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`, `src/components/ProfileSettings.tsx`, `src/styles/theme.css`
- **Steps:**
  - Wire persistent `SimulatorState` (`cashSen`, partial/full sell, trade history ledger, dividend payout button, account reset, live/cached KLSE sync badge).
  - Add Shariah-Compliant badges/filter & Student Quests card on `Dashboard`.
  - Add Available Cash + Buy/Sell tabs (supporting partial unit sell right from `StockDetails` and `PortfolioPage`) + Trade History tab in `PortfolioPage`.
  - Upgrade `EducationalHub` (`JomRingkas` for all 20 stocks + working Lesson/Quiz modal awarding `+25 XP`) and `ChatbotModal` (portfolio-aware `askJomAI`).
- **Commit:** `feat(app): wire virtual RM 10k wallet, partial sells, Shariah filter, quizzes, and AI`

### Task 5: Lightweight Cloudflare Worker Proxy (`worker/`) & Verification
- **Files:** `worker/package.json`, `worker/wrangler.toml`, `worker/src/index.ts`, `worker/src/__tests__/worker.test.ts`, `.gitignore`, `HANDOFF.md`
- **Steps:**
  - Build Hono Cloudflare Worker (`GET /api/health`, `GET /api/stocks` with 15-min edge cache, `POST /api/ai` calling Gemini 2.5 Flash via `env.GEMINI_API_KEY`) with unit tests.
  - Run full test suite (`npm test`), Worker tests, TypeScript check, zero-emoji check, and `npm run build`; update `jominvest_real_app.html` preview and `HANDOFF.md`.
- **Commit:** `feat(worker): add Cloudflare Worker for cached KLSE quotes and Gemini AI proxy`
