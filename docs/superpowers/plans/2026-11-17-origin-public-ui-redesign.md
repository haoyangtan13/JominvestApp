# Implementation Plan: Origin × Public.com UI Redesign

**Date:** 2026-11-17
**Spec:** `docs/superpowers/specs/2026-11-17-origin-public-ui-redesign-design.md`
**Branch:** `feat/bursa-upgrades`

---

## Tasks

### Task 1: Design System Foundation (`index.html`, `src/index.css`)
- **Files:** `index.html`, `src/index.css`
- **Changes:**
  - Remove `Instrument Serif` from `index.html`; load `Plus Jakarta Sans` (400, 500, 600, 700, 800) and `Inter` (400, 500, 600, 700).
  - Update `:root` and `.dark` tokens in `src/index.css` to the Origin × Public.com warm porcelain/slate palette (`#F7F8FA` canvas, `#FFFFFF` surface, `#0F172A` ink, `#059669` emerald accent).
  - Redefine `.font-editorial` to clean display sans-serif (`Plus Jakarta Sans` 700, `-0.025em` tracking), `.font-tabular` to `Plus Jakarta Sans` with `tabular-nums`, `.jom-kicker` to natural sentence-case sans subtitle, `.jom-panel` to `16px` rounded elevated cards with soft shadow, `.jom-tag` to pill badges (`9999px`), and add `.jom-avatar` company monogram styles.
- **Verification:** Ensure all CSS classes compile cleanly with zero missing utilities.
- **Commit Message:** `Update design tokens and typography to Origin x Public consumer wealth style`

### Task 2: App Shell, Onboarding & Market Discovery (`src/App.tsx`, `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`, `src/components/Dashboard.tsx`, `src/components/WatchlistPage.tsx`)
- **Files:** `src/App.tsx`, `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`, `src/components/Dashboard.tsx`, `src/components/WatchlistPage.tsx`
- **Changes:**
  - Replace all ALL-CAPS robotic kickers and terminal jargon in `App.tsx`, `LoginScreen.tsx`, `RiskQuestionnaire.tsx`, `Dashboard.tsx`, and `WatchlistPage.tsx` with friendly, natural sentence-case copy.
  - Add color-coded company monogram avatars (`MB`, `TN`, `CB`, `PB`, `GM`, `IN`, etc.) across stock cards and rows.
  - Build the Origin-style **Daily Market Brief + Portfolio Hero** at the top of `Dashboard.tsx` ("What's happening on Bursa today" alongside the user's balance).
- **Verification:** Verify all props, imports, and TypeScript types match `src/App.tsx`.
- **Commit Message:** `Redesign app shell, onboarding, dashboard, and watchlist with Origin x Public UI`

### Task 3: Stock Overview Terminal & AI Picks (`src/components/StockDetails.tsx`, `src/components/AIRecommendation.tsx`)
- **Files:** `src/components/StockDetails.tsx`, `src/components/AIRecommendation.tsx`
- **Changes:**
  - Redesign `StockDetails.tsx` into Public.com's approachable company page: monogram avatar, clean price header, **"In Plain English: How They Make Money"** story card, visual 5-factor health bars + peer comparison, tap-to-learn beginner metric cards (`+10 XP`), and a sleek right-hand **Practice Order Card** (Buy/Sell, 100-share Lot vs 1-share Starter unit, expandable fee breakdown).
  - Redesign `AIRecommendation.tsx` with friendly personalised stock match cards and plain-English explanations.
- **Verification:** Verify all trade execution, fee calculation, and XP callbacks work identically.
- **Commit Message:** `Redesign stock overview, practice order ticket, and personalised picks`

### Task 4: Portfolio, Learn & Research Hub, Profile, Copilot & Live Preview (`src/components/PortfolioPage.tsx`, `src/components/ProfileSettings.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`, `JomINVEST_Live_Preview.html`)
- **Files:** `src/components/PortfolioPage.tsx`, `src/components/ProfileSettings.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`, `JomINVEST_Live_Preview.html`
- **Changes:**
  - Update `PortfolioPage.tsx` and `ProfileSettings.tsx` with conversational **Diversification Coach**, **Annual Dividend Tracker**, company monograms, and natural milestone badges.
  - Transform `EducationalHub.tsx` into a warm, approachable **Learn & Research Hub**: `JomRingkas` ("30-Second Annual Report Cheat Sheet" with 3 clear takeaway cards), `JomSentimen` (visual Market Mood bar + news cards instead of a dense HTML table), 10-year EPF vs. Stocks wealth calculator, and bite-sized 5-minute lessons.
  - Update `ChatbotModal.tsx` into a friendly **Ask JomAI** research copilot drawer.
  - Sync the self-contained `JomINVEST_Live_Preview.html` artifact so the built-in Antigravity preview matches the new UI 1:1.
- **Verification:** Full whole-branch review by a fresh reviewer subagent, `git status`, and push to `origin/feat/bursa-upgrades`.
- **Commit Message:** `Redesign portfolio, learning hub, AI copilot, and sync interactive preview`
