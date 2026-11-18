# Design Spec: Robinhood × Wealthsimple Consumer Investing UI (Zero AI Slop)

**Date:** 2026-11-17
**Project:** JomINVEST (`haoyangtan13/JominvestApp`)
**Direction:** Robinhood Web × Wealthsimple Trade — Unboxed Canvas, Top Navigation, 2-Column Split Layout, Zero Kicker/Badge Clutter

---

## 1. Root Cause Analysis of Previous UI Issues

1. **Broken Grid Columns (`8%` wide strips):**
   - `package.json` does not include a Tailwind build step; it relies on static CSS rules in `src/index.css`. Relying on ad-hoc Tailwind grid classes (`lg:col-span-5`, `lg:col-span-7`) caused uncompiled classes to collapse into 1/12th width columns.
   - **Fix:** Define explicit, semantic, bulletproof CSS layout classes (`.rh-nav`, `.rh-page`, `.rh-split`, `.rh-main`, `.rh-rail`, `.rh-stock-row`, `.rh-card`, `.rh-grid-2`, `.rh-grid-3`, `.rh-grid-4`) directly in `src/index.css` with standard `@media` queries, plus automated verification that 100% of `className` tokens exist in `src/index.css`.
2. **"AI Slop" Visual Patterns Eliminated:**
   - **Eliminated Left SaaS Admin Sidebar + Topbar Duplication:** Replaced with a single, clean **Top Navigation Bar** (`JomINVEST`, inline navigation links `Invest`, `Portfolio`, `Learn`, `Suggested`, `Watchlist`, `Profile`, and right-side actions). Balance is shown once on the page, never duplicated in the header.
   - **Eliminated "Kicker + Heading + Pill Soup":** Deleted small gray subtitles above headings (`Home & Daily Market Brief` above `Welcome back`), removed repetitive `"Bursa Malaysia"` badges, and capped row badges to at most one subtle indicator.
   - **Eliminated Box-Inside-Box Clutter:** The primary portfolio value, daily change, and interactive price/portfolio chart sit **directly on the canvas** (unboxed), separated by clean `1px` horizontal dividers — matching Robinhood Web and Wealthsimple.

---

## 2. Architecture & Layout System (`.rh-*` Semantic CSS)

- **Default Theme:** Crisp Light Mode (`#FFFFFF` background, `#F7F8FA` subtle surface, `#0F172A` primary ink, `#00A86B` / `#059669` emerald gain, `#E11D48` rose loss) with seamless Dark Mode toggle (`#0B0E14` background, `#131822` card surface).
- **Top Navigation (`.rh-topnav`):**
  - Sticky `64px` header with centered `1160px` container.
  - Brand wordmark (`JomINVEST`) + primary text tabs (`Invest`, `Portfolio`, `Learn`, `Suggested`, `Watchlist`, `Profile`) + right actions (`Ask JomAI`, `EN/BM`, theme toggle).
- **2-Column Asymmetric Split (`.rh-split`):**
  - `.rh-main` (`flex: 1; min-width: 0`): Unboxed hero number + interactive chart + filter chips + clean single-line stock rows.
  - `.rh-rail` (`width: 340px; flex-shrink: 0; position: sticky; top: 88px`): Contextual right-hand card (Holdings & Watchlist mini-list on Home; Buy/Sell Order Card on Stock Detail; Portfolio Health on Portfolio).
  - Collapses cleanly to a single column below `960px`.
