# Implementation Plan: Robinhood × Wealthsimple UI Redesign (Zero AI Slop)

**Date:** 2026-11-17
**Spec:** `docs/superpowers/specs/2026-11-17-origin-public-ui-redesign-design.md`
**Branch:** `feat/bursa-upgrades`

---

## Tasks

### Task 1: Bulletproof Semantic CSS Layout & Top-Nav Shell (`src/index.css`, `src/App.tsx`)
- **Files:** `src/index.css`, `src/App.tsx`
- **Changes:**
  - Add explicit `.rh-*` layout & component rules in `src/index.css` (`.rh-topnav`, `.rh-page`, `.rh-split`, `.rh-main`, `.rh-rail`, `.rh-stock-row`, `.rh-chip`, `.rh-card`, `.rh-stat-grid`, `.rh-divider`, `.rh-timeframe-bar`) so layout never depends on fragile uncompiled grid utilities.
  - Default theme to crisp Light Mode (`light` unless user explicitly switches to `dark`), and migrate `src/App.tsx` from the 250px SaaS admin sidebar to a single clean **Robinhood/Wealthsimple Top Navigation Bar** with zero duplicated balance clutter.
- **Commit Message:** `Replace SaaS sidebar shell with clean top navigation and semantic rh-* CSS layout`

### Task 2: Unboxed Home & Market Discovery + Watchlist (`src/components/Dashboard.tsx`, `src/components/WatchlistPage.tsx`, `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`)
- **Files:** `src/components/Dashboard.tsx`, `src/components/WatchlistPage.tsx`, `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`
- **Changes:**
  - Redesign `Dashboard.tsx` into the `.rh-split` 2-column layout:
    - **Left Main Column (`.rh-main`):** Unboxed Portfolio Value (`RM 9,994.34`), change line, and interactive SVG portfolio/market chart with `1D / 1W / 1M / 3M / 1Y` tabs directly on the canvas; Buying Power row; horizontal filter chips (`All`, `Shariah`, `Banks`, `Utilities`, `Tech`, `Dividend`) + search bar; and clean Apple Stocks / Robinhood-style stock rows (`.rh-stock-row`) instead of a 9-column spreadsheet table.
    - **Right Sticky Rail (`.rh-rail`):** Unified **Positions & Watchlist** card + a compact **Daily 2-Min Insight** card.
  - Strip all kicker subtitles and badge clutter from `WatchlistPage.tsx`, `LoginScreen.tsx`, and `RiskQuestionnaire.tsx`.
- **Commit Message:** `Redesign home feed, watchlist, and onboarding with unboxed Robinhood x Wealthsimple layout`

### Task 3: Unboxed Stock Page & Right-Rail Order Ticket (`src/components/StockDetails.tsx`, `src/components/AIRecommendation.tsx`)
- **Files:** `src/components/StockDetails.tsx`, `src/components/AIRecommendation.tsx`
- **Changes:**
  - Redesign `StockDetails.tsx` using `.rh-split`:
    - **Left (`.rh-main`):** Unboxed stock title, price, change, and interactive Recharts area chart directly on the canvas; clean **About** section; **Key Stats** 4-cell grid (click to learn `+10 XP`); and clean **Factor Health vs. Peer** bars.
    - **Right Sticky Rail (`.rh-rail`):** Clean **Buy / Sell Order Ticket** card (`100-Share Lot` vs `1 Share`, share stepper, collapsible fee breakdown, `Estimated Total`, and Watchlist toggle).
  - Clean up `AIRecommendation.tsx` to use `.rh-page` and `.rh-stock-row` cards without kicker/badge soup.
- **Commit Message:** `Redesign stock detail page and order ticket with unboxed chart and sticky right rail`

### Task 4: Portfolio, Learn Hub, Profile, Copilot & Live Preview (`src/components/PortfolioPage.tsx`, `src/components/EducationalHub.tsx`, `src/components/ProfileSettings.tsx`, `src/components/ChatbotModal.tsx`, `JomINVEST_Live_Preview.html`)
- **Files:** `src/components/PortfolioPage.tsx`, `src/components/EducationalHub.tsx`, `src/components/ProfileSettings.tsx`, `src/components/ChatbotModal.tsx`, `JomINVEST_Live_Preview.html`
- **Changes:**
  - Redesign `PortfolioPage.tsx` with `.rh-split` (Left: unboxed value, allocation bar, clean holdings rows, and recent orders; Right: Portfolio Health & Dividend card).
  - Redesign `EducationalHub.tsx` into a clean, uncluttered 4-tab **Learn & Research** page (`Annual Report Reader`, `Market News`, `Wealth Calculator`, `Lessons`) with zero institutional tables or robotic badges.
  - Clean up `ProfileSettings.tsx` and `ChatbotModal.tsx`, and sync `JomINVEST_Live_Preview.html` 1:1.
- **Commit Message:** `Redesign portfolio, learn hub, profile, copilot, and sync live preview`
