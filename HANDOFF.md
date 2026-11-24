# JomINVEST — Project Handoff

**Last Updated:** 2026-11-23  
**Current Branch:** `feat/playful-ui-redesign` (`main` untouched)

## 1. What Is Live / Built
- **Full Tactile Playful Fintech UI Redesign (Duolingo × Wise direction)** built across all 9 screens using `ui-ux-pro-max` design intelligence:
  - **Shared App Shell (`src/components/AppShell.tsx`):** Persistent desktop left sidebar, sticky top header (`ENG / BM` switcher, Level/XP pill, `JomAI Coach` trigger), mobile bottom tab bar, live XP progress card, and global `ChatbotModal`.
  - **Visual & Chart Primitives (`src/components/StockVisuals.tsx`, `src/styles/theme.css`):** Sector-coded SVG `StockBadge` icons (Financials, Utilities, Healthcare, Telecom, Industrial, Plantation, Consumer, Tech, Property), gradient `MiniSparkline` charts, textured grid/glow hero cards, uniform single-line status pills, and resilient `auto-fit` responsive grids. Zero emojis anywhere in the codebase.
  - **Onboarding (`LoginScreen.tsx`, `RiskQuestionnaire.tsx`):** Split value-pitch login/register screen + 5-step tactile Investor Persona quiz preserving exact risk scoring.
  - **Investing (`Dashboard.tsx`, `StockDetails.tsx`, `PortfolioPage.tsx`, `WatchlistPage.tsx`):**
    - `Dashboard`: Textured multi-stat Portfolio Hero, Bursa search, uniform 2-row Top AI Picks cards, Market Movers (Gainers/Losers), Watchlist preview, and Bursa directory.
    - `StockDetails`: `7D / 15D / 1M` timeframe `AreaChart` with High/Avg/Low stats, dashed `ReferenceLine`, dark custom hover tooltip, +/- Trade Ticket (`+50 XP`), Financials/News tabs, and `+10 XP` Tap-to-Learn metrics.
    - `PortfolioPage`: Interactive Recharts `PieChart` sector allocation ring + holdings list with return `%` and `Sell All (+30 XP)`.
    - `WatchlistPage`: Quick-add search + 2-row watched stock cards with sparklines and click-through to `StockDetails` (fixed `stockId: string` typing).
  - **AI, Learn & Profile (`AIRecommendation.tsx`, `EducationalHub.tsx`, `ProfileSettings.tsx`, `ChatbotModal.tsx`):** Featured AI spotlight, `JomRingkas` PDF analyzer, `JomSentimen` SVG radar + live news, 10-year `AI Wealth Projector`, editable profile, dynamic milestone badges, and `JomAI Coach` drawer.

## 2. Key Decisions & Rationale
- **Self-contained CSS (`src/styles/theme.css`):** `src/index.css` is a precompiled bundle without a Tailwind build step in `package.json`. Putting all `.jomi-*` tokens, grids, and tactile components in `theme.css` avoids silent missing-utility bugs.
- **Resilient Card Layouts:** Stock cards separate `Price + Sparkline` onto their own row above a full-width action button, and compact list badges use icon-only `size="sm"` so company names, tickers (`MAYBANK`, `TENAGA`), and buttons never wrap or clip awkwardly across narrow/split viewports.
- **Strictly Zero Emojis:** All icons use `lucide-react` SVGs.

## 3. Phase Status
- [x] Install `ui-ux-pro-max` skill & define Tactile Playful Fintech spec/plan (`docs/superpowers/`)
- [x] Build `AppShell` + `theme.css` design system
- [x] Redesign all 9 screens + `ChatbotModal`
- [x] Rich Visual & Chart Upgrade (`StockVisuals`, Recharts timeframes/tooltips/ring)
- [x] Layout resilience fix pass + production build verification (`vite build`)
- [ ] Push `feat/playful-ui-redesign` / merge to `main` (awaiting user sign-off)

## 4. How to Resume / Run Locally (Windows PowerShell)
```powershell
git fetch origin
git checkout feat/playful-ui-redesign
npm install
npm run dev
```
