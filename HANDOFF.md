# JomINVEST — Project Handoff

**Last Updated:** 2026-11-24  
**Current Branch:** `feat/simulator-and-ai` (contains both Phase 1 UI Redesign + Phase 2 Simulator, Real KLSE Data & AI Proxy; `main` untouched)

## 1. What Is Live / Built

### Phase 1: Full Tactile Playful Fintech UI Redesign
- Shared `AppShell` (`src/components/AppShell.tsx`) + self-contained design system (`src/styles/theme.css`) + sector-coded SVG `StockBadge` and gradient `MiniSparkline` (`src/components/StockVisuals.tsx`).
- All 9 screens (`LoginScreen`, `RiskQuestionnaire`, `Dashboard`, `StockDetails`, `PortfolioPage`, `WatchlistPage`, `AIRecommendation`, `EducationalHub`, `ProfileSettings`) + `ChatbotModal` redesigned with resilient responsive grids and strictly zero emojis.

### Phase 2: Real Simulator Engine, KLSE Market Data, Interactive Lessons & Cloudflare Worker
- **Integer-Sen Simulator Engine (`src/lib/simulator.ts`):**
  - Starting **RM 10,000.00** virtual cash (`1_000_000` sen), cash validation on Buy, partial & full unit Sell with realized P&L, **Trade History Ledger**, **Simulate Annual Dividends** payout, `localStorage` persistence (`jominvest_state_v1`), and 2-step **Reset Virtual Account** in Profile.
- **Real Bursa Malaysia `.KL` Data (`src/data/stocks.ts` + `src/services/marketData.ts` + `scripts/fetch-klse-snapshot.mjs`):**
  - Populated with real fetched KLSE daily closing prices & 1-month history (`Asia/Kuala_Lumpur`) across all 20 Bursa Malaysia stocks (`1155.KL` MAYBANK through `5211.KL` SUNWAY), plus SC Malaysia **Shariah-Compliant** flags and Dashboard filter.
  - Auto-syncs live 15-min cached quotes from `${VITE_API_BASE_URL}/api/stocks` when deployed, falling back cleanly to the bundled KLSE snapshot.
- **Smart AI + 5 Production Guardrails (`src/services/aiService.ts` + `worker/src/index.ts`):**
  - `JomRingkas` supports **all 20 Bursa Malaysia companies**.
  - `JomAI Coach` is grounded in live stock metrics + your virtual cash & holdings.
  - Guardrails active: per-IP rate limiting (`15 req/min`, `429`), strict CORS origin check (`403`, allows `localhost`), pre-LLM prompt-injection shield, dedicated Gemini `systemInstruction` (SC Malaysia educational non-advice compliance + visible UI disclaimers), and Gemini `safetySettings` (`BLOCK_LOW_AND_ABOVE`) + `8s` timeout.
  - Calls `POST /api/ai` on the Cloudflare Worker when configured, with automatic data-grounded local analyst fallback when offline or before deploying.
- **Verification:** `npm test` (`18/18` passing across 4 test files), `npm run build` (`0` errors), zero emojis verified across `src/` and `worker/`.
- **Interactive Learn Hub (`src/data/lessons.ts`, `src/components/EducationalHub.tsx`):**
  - Clicking any Article or Video Guide opens an ENG/BM study modal + 2-question comprehension quiz awarding **`+25 XP`**.

## 2. Commands
| Action | Command (PowerShell) |
| --- | --- |
| Install app deps | `npm install` |
| Run unit tests (single fork, low RAM) | `npm test` |
| Start local dev server | `npm run dev` |
| Production build | `npm run build` |
| Refresh static KLSE snapshot | `node scripts/fetch-klse-snapshot.mjs` |

## 3. Optional Cloudflare Worker Deployment (User Step)
When you want live 15-minute edge-cached Yahoo `.KL` quotes + real LLM answers in production:
```powershell
# If Norton TLS intercepts wrangler on Windows:
# $env:NODE_EXTRA_CA_CERTS = "C:\ProgramData\Norton\Antivirus\wscert.pem"

cd worker
npm install
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```
Then set `VITE_API_BASE_URL=https://jominvest-api.<your-subdomain>.workers.dev` in a local `.env` (git-ignored) and run `npm run dev` / `npm run build`.
