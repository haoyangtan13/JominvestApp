# JomINVEST Tactile Playful Fintech Redesign — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-11-23-playful-ui-redesign-design.md`  
**Branch:** `feat/playful-ui-redesign`

## Tasks

### Task 1: Global Theme Tokens, Fonts & Tactile CSS System
- **Files:** `index.html`, `src/styles/theme.css`, `src/main.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`
- **Changes:**
  - Add Google Fonts (`Fredoka`, `Nunito`) and update `<title>` in `index.html`.
  - Create `src/styles/theme.css` with JomINVEST `:root` tokens, typography rules, tactile card/button/pill/XP classes, and `prefers-reduced-motion` overrides.
  - Import `./styles/theme.css` in `src/main.tsx` after `./index.css`.
  - Add `cursor-pointer` and tactile rounded styling hooks to `ui/button.tsx` and `ui/card.tsx` without breaking existing props/variants.
- **Verification:** Inspect CSS selectors, verify no broken imports or undefined classes, verify `git diff`.
- **Commit:** `feat(ui): add tactile playful fintech theme tokens and primitives`

### Task 2: Redesign Dashboard Screen (`Dashboard.tsx`)
- **Files:** `src/components/Dashboard.tsx`
- **Changes:**
  - Upgrade header to tactile sticky bar with brand badge, Level/XP pill, quick nav buttons, and profile button.
  - Build Bento top row: Portfolio Hero Card (tabular RM balance + CTAs) + XP/Level Quest Progress Card.
  - Upgrade search bar, AI Top Picks grid, Bursa Market Today tabs (Top Gainers, Top Losers, Watchlist), and floating AI Chatbot FAB to tactile playful cards/pills.
  - Preserve 100% of existing props, ENG/BM translations, filtering, sorting, portfolio calculation, and navigation.
- **Verification:** Audit all props, state, event handlers, ENG/BM keys, and responsive classes; check `git diff`.
- **Commit:** `feat(ui): redesign Dashboard with tactile playful bento layout`

### Task 3 (Next Phase — Pending User Go-Ahead): Onboarding & Auth
- **Files:** `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`
- **Commit:** `feat(ui): redesign LoginScreen and RiskQuestionnaire`

### Task 4 (Next Phase — Pending User Go-Ahead): Investing Screens
- **Files:** `src/components/StockDetails.tsx`, `src/components/PortfolioPage.tsx`, `src/components/WatchlistPage.tsx`
- **Commit:** `feat(ui): redesign StockDetails, PortfolioPage, and WatchlistPage`

### Task 5 (Next Phase — Pending User Go-Ahead): AI, Learning & Profile Screens
- **Files:** `src/components/AIRecommendation.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`, `src/components/ProfileSettings.tsx`, `src/components/StudentModeToggle.tsx`, `src/components/LearningPopup.tsx`
- **Commit:** `feat(ui): redesign AI, EducationalHub, and Profile screens`
