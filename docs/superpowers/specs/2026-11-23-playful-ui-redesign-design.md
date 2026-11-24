# JomINVEST Full UI Redesign — Tactile Playful Fintech Design Spec

**Date:** 2026-11-23  
**Direction:** Direction 1 — Tactile Playful Fintech (Duolingo × Wise)  
**Scope:** Complete layout + visual redesign from scratch across all 9 screens, preserving 100% of existing features, state, and business logic.

---

## 1. Architecture: Shared App Shell + Dedicated Onboarding

Instead of 9 isolated screens with duplicate headers and mismatched styles:

1. **Onboarding Flow (`login`, `questionnaire`):**
   - Full-canvas split/card layout on warm-mint canvas (`#f4faf8`) with brand badge, persistent `ENG / BM` switcher, tactile inputs, and interactive option cards.
2. **Authenticated App Shell (`AppShell.tsx`)** wrapping `dashboard`, `portfolio`, `watchlist`, `ai-recommendation`, `stock-details`, `educational-hub`, and `profile`:
   - **Desktop Left Sidebar (`260px`):** Brand logo, primary navigation (`Dashboard`, `Portfolio`, `Watchlist`, `AI Picks`, `Learn`, `Profile`), and a bottom **Level & XP Quest Card** with live progress bar (`userXP % 100`).
   - **Sticky Top Bar:** Current screen title/context, `ENG / BM` language toggle, Level/XP badge, and **AI Coach** trigger button.
   - **Mobile Bottom Nav:** Compact 5-tab bar (`Home`, `Portfolio`, `Watchlist`, `Learn`, `Profile`) on viewports `< 1024px`.
   - **Global `ChatbotModal`:** Accessible from any authenticated screen via the top bar or floating AI Coach FAB.

---

## 2. Design System (`src/styles/theme.css`)

Because `src/index.css` is a precompiled CSS bundle without a Tailwind PostCSS step in `package.json`, **all layout, spacing, responsive grids, surfaces, typography, and component states for the redesign live in `src/styles/theme.css`** using semantic `.jomi-*` classes. Zero reliance on uncompiled Tailwind utility classes.

### Tokens
- **Surfaces:** `--jomi-canvas: #f4faf8`, `--jomi-surface: #ffffff`, `--jomi-surface-soft: #f0fdf9`
- **Typography:** `Fredoka` (`600–700`) for display/headings/numbers; clean system/rounded sans (`Nunito` + `system-ui`) for crisp small body text; `tabular-nums` on every RM price, percentage, and XP figure.
- **Colors:**
  - Brand Teal `#0d9488` & Gain Emerald `#10b981` (dark ledge `#047857`)
  - Gamification Gold `#f59e0b` (soft `#fef3c7`, ledge `#b45309`)
  - Loss Coral `#ef4444` (soft `#fef2f2`, ledge `#b91c1c`)
  - Deep Ink `#0f2926`, Muted Ink `#527972`, Crisp Border `#d6eae3`
- **Tactile Rules:** `2px` borders + bottom-ledge shadows (`0 4px 0 0`) on cards and primary buttons; smooth press (`translateY(3px)`); single-line `nowrap` pills with uniform padding/line-height so badges never wrap unevenly; `prefers-reduced-motion` support.

---

## 3. Screen-by-Screen Feature & Layout Spec

1. **`LoginScreen.tsx`:** Split hero + tactile auth card, Login/Register mode toggle, email/password/confirm fields, `ENG / BM` toggle, navigates to `questionnaire`.
2. **`RiskQuestionnaire.tsx`:** Tactile step progress bar (`Step X of 5`), chunky selectable A/B/C answer cards with radio indicators, exact existing score calculation (`<=7` Protector, `<=11` Builder, else Explorer) -> `dashboard`.
3. **`Dashboard.tsx`:** Clean Bento layout inside `AppShell` — Portfolio Hero banner + Investor Profile pill, instant Bursa stock search, horizontal/grid **Top AI Picks** (uniform StockCards), 2-column **Market Movers** (Gainers/Losers) + **Watchlist** preview, and **All Bursa Stocks** directory.
4. **`StockDetails.tsx`:** Back bar, Stock Hero header (ticker badge, sector pill, live price + delta), **AI Insight** banner, 3 tabs (`Overview`, `Financials`, `News`), Recharts `AreaChart` in emerald/coral, tactile **Trade Ticket** (`-` / qty / `+`, estimated RM cost, Buy `+50 XP` & Sell buttons), and **Tap-to-Learn Key Metrics** (`+10 XP` badge, inline Quick Learn drawer, `hasLearnedTerm` tracking).
5. **`PortfolioPage.tsx`:** Wealth summary hero + CSS conic-gradient **Sector Allocation** donut with legend, holdings list with Qty, Avg Price, Current Price, Market Value, Return `%` pill, and tactile `Sell Position` button (`+30 XP`), plus friendly empty state.
6. **`WatchlistPage.tsx`:** Instant search-to-add bar (excluding already-watched stocks, Note: fixes `stockId: string` type mismatch cleanly while supporting existing `App.tsx`), watched stock cards with sparkline, price, 24h delta pill, click-through to `StockDetails`, and tactile remove button.
7. **`AIRecommendation.tsx`:** Featured AI Pick spotlight (`TENAGA` + profile-tailored reasons), 3-reason checklist cards, Key Metrics strip, and working `Add to Simulated Portfolio` + `View Full Stock Details` actions.
8. **`EducationalHub.tsx`:** Replaced legacy purple/pink glow with cohesive Tactile Emerald & Gold styling across all 3 tabs:
   - **AI Tools:** `JomRingkas` PDF Annual Report scanner (`Tenaga` / `Maybank`, animated scan + Executive Summary), `JomSentimen` SVG Fear/Greed gauge + Live News sentiment feed, and `AI Wealth Projector` (10-year compound `AreaChart` + Monthly RM slider + Risk slider + Inflation switch).
   - **Articles & Video Tutorials:** Clean tactile cards with read/duration badges and thumbnails.
9. **`ProfileSettings.tsx` & `ChatbotModal.tsx`:** Editable user profile card (name/email edit & save!), Level & XP progress card, unlocked/locked Achievements grid (dynamically unlocking `Learned 3 Terms` when `hasLearnedTerm.length >= 3`), Language & Notification toggles, and a cohesive slide-up tactile `JomAI` coach drawer.
