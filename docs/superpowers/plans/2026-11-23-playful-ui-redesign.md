# JomINVEST Full UI Redesign — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-11-23-playful-ui-redesign-design.md`  
**Branch:** `feat/playful-ui-redesign`

## Tasks

### Task 1: Complete CSS Design System & AppShell Layout (`theme.css` + `AppShell.tsx`)
- **Files:** `src/styles/theme.css`, `src/components/AppShell.tsx`, `src/components/ChatbotModal.tsx`
- **Changes:**
  - Build self-contained responsive layout & component system in `src/styles/theme.css` (AppShell sidebar, mobile bottom nav, top bar, responsive grids, tactile cards, uniform pills, inputs, tabs, progress bars, trade controls, chat bubbles) with zero reliance on uncompiled Tailwind classes.
  - Create `src/components/AppShell.tsx` providing persistent navigation, Level/XP progress widget, `ENG / BM` switcher, and global `JomAI` Coach trigger + FAB.
  - Redesign `src/components/ChatbotModal.tsx` to match the tactile emerald/mint aesthetic while keeping all quick-reply and message simulation logic.
- **Commit:** `feat(ui): add AppShell navigation layout and redesigned ChatbotModal`

### Task 2: Onboarding Flow (`LoginScreen.tsx` + `RiskQuestionnaire.tsx`)
- **Files:** `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`
- **Changes:**
  - Redesign `LoginScreen` with brand value proposition + tactile Login/Register card and `ENG / BM` toggle.
  - Redesign `RiskQuestionnaire` with tactile step progress bar, interactive A/B/C choice cards, and exact existing risk-profile scoring.
- **Commit:** `feat(ui): redesign LoginScreen and RiskQuestionnaire`

### Task 3: Core Investing Screens (`Dashboard.tsx`, `StockDetails.tsx`, `PortfolioPage.tsx`, `WatchlistPage.tsx`)
- **Files:** `src/components/Dashboard.tsx`, `src/components/StockDetails.tsx`, `src/components/PortfolioPage.tsx`, `src/components/WatchlistPage.tsx`
- **Changes:**
  - Adapt `Dashboard` cleanly into `AppShell` with uniform `StockCard` layout, search, Top AI Picks, Market Movers, Watchlist preview, and Bursa directory.
  - Redesign `StockDetails` with tactile header, AI Insight card, Recharts AreaChart, +/- Trade Ticket (`addToPortfolio`), Financials/News tabs, and `+10 XP` Tap-to-Learn metrics.
  - Redesign `PortfolioPage` with wealth summary, sector conic-gradient donut, holdings list with return `%` and `Sell Position`.
  - Redesign `WatchlistPage` with instant search-to-add, watched stock cards, click-to-view details, and remove action (fixing `stock.id` string type cleanly).
- **Commit:** `feat(ui): redesign Dashboard, StockDetails, PortfolioPage, and WatchlistPage`

### Task 4: AI, Learning & Profile Screens + Root Wiring (`AIRecommendation.tsx`, `EducationalHub.tsx`, `ProfileSettings.tsx`, `App.tsx`)
- **Files:** `src/components/AIRecommendation.tsx`, `src/components/EducationalHub.tsx`, `src/components/ProfileSettings.tsx`, `src/components/StudentModeToggle.tsx`, `src/components/LearningPopup.tsx`, `src/App.tsx`
- **Changes:**
  - Redesign `AIRecommendation` with interactive stock selection/buy + view details wiring.
  - Redesign `EducationalHub` (`JomRingkas`, `JomSentimen`, `AI Wealth Projector`, Articles, Video Tutorials) in cohesive emerald/gold tactile style (eliminating legacy purple/pink glow).
  - Redesign `ProfileSettings` with working name/email edit-save, XP/Level journey bar, dynamic achievements, and settings controls; polish `StudentModeToggle` & `LearningPopup`.
  - Wire `AppShell` in `src/App.tsx` around authenticated screens while preserving all state and handlers.
- **Commit:** `feat(ui): redesign AI, EducationalHub, ProfileSettings and wire AppShell`

### Task 5: Verification & Interactive Full-App Preview
- **Verification:** Audit all `.tsx` files for CSS class coverage, prop/type alignment, and untouched business logic; generate an interactive multi-screen HTML preview artifact so all redesigned screens can be inspected directly in chat without pushing.
