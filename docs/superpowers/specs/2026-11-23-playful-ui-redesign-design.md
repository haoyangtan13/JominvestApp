# JomINVEST UI Redesign — Tactile Playful Fintech Design Spec

**Date:** 2026-11-23  
**Direction:** Direction 1 — Tactile Playful Fintech (Duolingo × Wise)  
**Target App:** JomINVEST (React 18 + Vite 6 + shadcn/ui + precompiled Tailwind v4 CSS)

---

## 1. Visual Identity & Core Principles

JomINVEST blends **gamified student learning** (XP, levels, Student Mode, Educational Hub) with **Bursa Malaysia simulated investing**. The UI must feel approachable, encouraging, and tactile without sacrificing financial clarity.

- **Light-mode first:** Soft warm-mint canvas (`#F4FAF8`) with crisp white elevated cards (`#FFFFFF`) and high-contrast deep ink text (`#0F2926`).
- **Tactile depth:** Chunky rounded corners (`16px–24px`), crisp `2px` borders (`#D6EAE3`), and subtle bottom-edge 3D shadows (`0 4px 0 0`) on cards and primary buttons that depress smoothly (`translateY(3px)`) on press.
- **No generic AI purple gradients:** Keep investing identity rooted in emerald/teal, with warm gold reserved for gamification (XP, levels, streaks, watchlist stars).
- **Financial clarity:** All RM stock prices, portfolio values, and percentage changes use `font-variant-numeric: tabular-nums`. Gains use emerald (`#10B981`), losses use coral red (`#EF4444`), and badges never rely on color alone (always paired with `+`/`-` or directional icons).
- **Accessibility & motion:** Minimum `4.5:1` contrast for body text, visible focus rings (`#0D9488`), `cursor: pointer` on all interactive controls, and `@media (prefers-reduced-motion: reduce)` support.

---

## 2. Design Tokens (`src/styles/theme.css`)

### Colors
| Token | Hex | Usage |
| --- | --- | --- |
| `--jomi-canvas` / `--background` | `#F4FAF8` | App page background |
| `--jomi-surface` / `--card` | `#FFFFFF` | Card, modal, header surfaces |
| `--jomi-ink` / `--foreground` | `#0F2926` | Primary text & headings |
| `--jomi-muted-ink` / `--muted-foreground` | `#527972` | Secondary labels & metadata |
| `--jomi-border` / `--border` | `#D6EAE3` | Crisp 2px borders & card ledges |
| `--jomi-primary` / `--primary` | `#0D9488` | Brand primary teal |
| `--jomi-emerald` | `#10B981` | Positive gains, primary buy CTAs |
| `--jomi-emerald-dark` | `#047857` | Tactile button bottom-shadow & hover |
| `--jomi-gold` | `#F59E0B` | XP bars, level pills, streaks, reward CTAs |
| `--jomi-gold-soft` | `#FEF3C7` | Gamification pill backgrounds |
| `--jomi-gold-dark` | `#B45309` | Gold button shadow & text on gold-soft |
| `--jomi-coral` / `--destructive` | `#EF4444` | Losses, sell/destructive CTAs |

### Typography
- **Display / Headings:** `Fredoka` (`500`, `600`, `700`) via Google Fonts in `index.html`, with rounded system fallbacks.
- **Body / UI:** `Nunito` (`400`, `600`, `700`, `800`) via Google Fonts in `index.html`.
- **Numbers:** `tabular-nums` utility (`.jomi-nums`) on all prices, percentages, and XP counters.

### CSS Architecture Constraint
`src/index.css` is a precompiled Tailwind v4.1.3 bundle exported from Figma Make (there is no Tailwind build step in `package.json`). Therefore:
- Do **not** rely on uncompiled arbitrary Tailwind classes (e.g., `bg-[#0D9488]`).
- Define all new design tokens and semantic tactile classes (`.jomi-page`, `.jomi-header`, `.jomi-card`, `.jomi-card-interactive`, `.jomi-hero`, `.jomi-btn-primary`, `.jomi-btn-gold`, `.jomi-btn-outline`, `.jomi-btn-danger`, `.jomi-pill-xp`, `.jomi-pill-gain`, `.jomi-pill-loss`, `.jomi-xp-track`, `.jomi-xp-fill`) in `src/styles/theme.css`, imported in `src/main.tsx` immediately after `./index.css`.

---

## 3. Component & Screen Scope (Phased)

### Phase 1 — Foundation & Primitives
- `index.html`: Load `Fredoka` & `Nunito` fonts, update page title to `JomINVEST — Gamified Student Investing`.
- `src/styles/theme.css` + `src/main.tsx`: Global tokens, font rules, tactile card/button/badge/XP classes, reduced-motion rules.
- `src/components/ui/button.tsx` & `src/components/ui/card.tsx`: Subtle tactile defaults (`cursor-pointer`, rounded corners, tactile focus states) preserving all existing variants and props.

### Phase 2 — Dashboard Hub
- `src/components/Dashboard.tsx`:
  - Sticky rounded tactile top navigation bar with brand mark, clickable Level/XP pill, Watchlist/Portfolio quick nav, and Profile button.
  - Bento top row: Emerald-Teal **Portfolio Hero Card** (tabular RM value, held count, quick action CTAs) + **XP & Level Progress Card** (visual progress bar to next level, Educational Hub CTA).
  - Playful tactile search bar with crisp focus ring and instant stock results.
  - **Top AI Picks** & **Bursa Market Today** (Gainers / Losers / Watchlist tabs) upgraded to tactile stock cards with clean sparklines, green/coral delta pills, and hover lift.
  - Floating tactile **AI Coach** FAB.
  - Zero changes to business logic (`portfolio`, `watchlist`, `userXP`, `userLevel`, `language`, `navigateTo`).

### Phase 3 — Remaining 8 Screens (After Phase 1–2 Review)
- Onboarding: `LoginScreen.tsx`, `RiskQuestionnaire.tsx`
- Investing: `StockDetails.tsx`, `PortfolioPage.tsx`, `WatchlistPage.tsx`
- AI & Learning: `AIRecommendation.tsx`, `EducationalHub.tsx`, `ChatbotModal.tsx`, `ProfileSettings.tsx`, `StudentModeToggle.tsx`, `LearningPopup.tsx`
