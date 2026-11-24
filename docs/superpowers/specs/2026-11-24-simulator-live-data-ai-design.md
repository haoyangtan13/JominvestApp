# JomINVEST Phase 2 — Real Simulator Engine, Live/Cached Bursa Data & AI Coach Spec

**Date:** 2026-11-24  
**Branch:** `feat/simulator-and-ai` (branched from `feat/playful-ui-redesign`, `main` untouched)

---

## 1. Goals & Scope

Upgrade JomINVEST from a visual UI prototype into a persistent, realistic Malaysian student stock-investing simulator with real Bursa Malaysia `.KL` market data, integer-sen money accounting, Shariah compliance filtering, interactive lessons/quizzes, and a lightweight Cloudflare Worker backend for live quotes + Gemini Flash AI.

---

## 2. Core Simulator Engine (`src/lib/simulator.ts`)

### Money & Portfolio Rules (Integer Sen)
- All money math runs in **integer sen** (`1 RM = 100 sen`, e.g., starting virtual cash = `1_000_000` sen = `RM 10,000.00`) to avoid floating-point drift.
- `priceToSen(priceStr)` converts `"10.12"` → `1012` via `Math.round(Number(priceStr) * 100)`.
- `formatRMFromSen(sen)` formats `101250` → `"1,012.50"`.
- **Buy Execution (`executeBuy`):**
  - Validates `quantity >= 1` and `costSen = unitPriceSen * quantity <= cashSen`.
  - Returns explicit error code (`INSUFFICIENT_CASH` or `INVALID_QUANTITY`) when invalid — never mutates negative cash.
  - Deducts `costSen` from `cashSen`, updates weighted average cost (`avgPriceSen = Math.round((oldQty * oldAvgSen + costSen) / newQty)`), appends a `BUY` record to `transactions`.
- **Partial & Full Sell Execution (`executeSell`):**
  - Validates `1 <= quantity <= heldQuantity`.
  - Credits `proceedsSen = unitPriceSen * quantity` to `cashSen`.
  - Calculates realized P&L (`realizedPnlSen = (unitPriceSen - avgPriceSen) * quantity`).
  - Reduces `heldQuantity` (or removes position when `newQty === 0`), appends a `SELL` record to `transactions`.
- **Dividend Payout Simulation (`simulateDividendPayout`):**
  - Calculates annual dividend cash across held stocks based on `dividendYield` (`payoutSen = Math.round(positionValueSen * (yieldPct / 100))`), credits `cashSen`, and logs a `DIVIDEND` ledger entry so students experience passive dividend compounding.
- **Persistence (`localStorage` key `jominvest_state_v1`):**
  - Persists `cashSen`, `portfolio`, `watchlistIds`, `transactions`, `userXP`, `userLevel`, `userProfile`, `hasLearnedTerm`, `completedLessons`, and `language`.
  - Includes `resetAccount()` in `ProfileSettings` (with confirmation prompt) to restore starting `RM 10,000.00` cash and clear positions.

---

## 3. Real Bursa Malaysia `.KL` Data (`src/data/stocks.ts` + `src/services/marketData.ts` + `worker/`)

### KLSE Symbol Mapping & Shariah Metadata
Every stock in `stocks.ts` carries:
- `klseCode`: Official Bursa / Yahoo Finance symbol (`1155.KL` MAYBANK, `1295.KL` PBBANK, `5347.KL` TENAGA, `1023.KL` CIMB, `5183.KL` PCHEM, `5225.KL` IHH, `6947.KL` CDB, `8869.KL` PMETAL, `5819.KL` HLBANK, `5285.KL` SDG/SIMEPLT, `6012.KL` MAXIS, `3816.KL` MISC, `4707.KL` NESTLE, `1066.KL` RHBBANK, `1961.KL` IOICORP, `7113.KL` TOPGLOV, `5398.KL` GAMUDA, `4715.KL` GENM, `6742.KL` YTLPOWR, `5211.KL` SUNWAY).
- `shariahCompliant: boolean`: Accurate SC Malaysia Shariah Advisory Council classification (`true` for `TENAGA`, `PCHEM`, `IHH`, `CDB`, `PMETAL`, `SIMEPLT`, `MAXIS`, `MISC`, `NESTLE`, `IOICORP`, `TOPGLOV`, `GAMUDA`; `false` for conventional banks & gaming `MAYBANK`, `PBBANK`, `CIMB`, `HLBANK`, `RHBBANK`, `GENM`, `YTLPOWR`, `SUNWAY`).
- **Cached Real Snapshot Baseline:** `src/data/stocks.ts` is populated with real fetched KLSE daily closing prices and 30-day historical closes (`Asia/Kuala_Lumpur` dates), so even offline builds show real Bursa prices and real chart curves (replacing `Math.random()`).
- **Live Edge Refresh (`GET /api/stocks`):** On app load (and via a manual `"Sync Live Bursa"` button), `marketData.ts` queries `${VITE_API_BASE_URL}/api/stocks` (if configured or reachable) to merge fresh 15-minute cached Yahoo Finance `.KL` quotes + 30-day history, showing a `"Live KLSE"` vs `"Cached KLSE Snapshot"` indicator badge in the UI.

---

## 4. Simple LLM + Grounded Local Analyst (`src/services/aiService.ts` + `worker/`)

- **Cloudflare Worker (`worker/src/index.ts` + `worker/wrangler.toml`):**
  - Lightweight Hono Worker with CORS middleware, zero secrets committed (`GEMINI_API_KEY` read from `c.env.GEMINI_API_KEY` set only via `wrangler secret put`).
  - `GET /api/health` → `{ ok: true, aiConfigured: boolean }`
  - `GET /api/stocks` → Fetches `.KL` 1-month daily charts from `query1.finance.yahoo.com` in parallel, caches response in Cloudflare ` caches.default` for `900s` (15 minutes).
  - `POST /api/ai` → Accepts `{ mode: 'chat' | 'report', message?, stock?, portfolioSummary?, language }`, calls Gemini 2.5 Flash (`generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`) with strict system instructions (educational Malaysian Bursa coach, no emojis, concise, grounded in provided metrics).
- **Automatic Local Grounded Analyst Fallback (`aiService.ts`):**
  - When `VITE_API_BASE_URL` is unset, offline, or `GEMINI_API_KEY` isn't configured yet, `aiService.ts` dynamically computes accurate, stock-specific responses from the real `StockData` + user's `cashSen`/`portfolio` (covering *all 20 Bursa stocks* for both `JomAI Coach` chat questions and `JomRingkas` executive report scans).

---

## 5. Interactive Learn Hub Lessons & Quizzes + Daily Quests

- **Interactive Lesson & Video Reader Modal (`EducationalHub.tsx`):**
  - Clicking any Article (`Read Guide`) or Video Guide (`Watch Lesson`) opens a structured interactive study modal with key Malaysian examples + a **2-question comprehension quiz** that awards **`+25 XP`** once passed (`completedLessons` persisted).
- **JomRingkas All-20-Stocks Upgrade:**
  - Dropdown lets students scan **any of the 20 Bursa Malaysia companies** (live AI summary or data-driven fundamental executive summary with Growth Driver, Key Risk, Dividend Verdict, Shariah status, and Valuation score).
- **Shariah Filter & Daily Quests (`Dashboard.tsx`):**
  - Shariah-Compliant filter toggle (`All Stocks` vs `Shariah Only`) on Dashboard directory.
  - Compact 3-item **Student Quests** checklist on Dashboard tracking real progress (`Make 1 trade`, `Learn 2 financial terms`, `Complete 1 Learn Hub quiz`).
