# Design Spec: Origin × Public.com UI Redesign ("Guided Consumer Wealth & Bite-Sized Learning")

**Date:** 2026-11-17
**Project:** JomINVEST (`haoyangtan13/JominvestApp`)
**Branch:** `feat/bursa-upgrades`

---

## 1. Problem Statement & Design Goals

The previous UI leaned heavily into an "editorial newspaper terminal" aesthetic (`Instrument Serif` + ALL-CAPS `JetBrains Mono` kickers like `01 / EQUITY SCREENER` and `VERIFIED ANALYST MILESTONES` inside uniform `1px` bordered beige boxes). While structured, that pattern reads as a recognizable AI design cliché and feels cold for a **Malaysian student & beginner finance education app**.

Grounded in Mobbin's 2,108-dashboard study (*Origin*, *Public.com*, *Revolut*, *Plausible*) and consumer investment education patterns:
1. **Verdict Before Data (Origin Pattern):** Every main screen opens with a plain-English human takeaway alongside the numbers ("Your practice portfolio is up today, led by Tenaga Nasional's grid expansion news") so beginners immediately grasp the *so-what*.
2. **Natural Consumer Typography (Public.com Pattern):** Drop `Instrument Serif` and ALL-CAPS monospace kickers completely. Use a single warm, high-legibility geometric/humanist sans (`Plus Jakarta Sans` / `Inter`) in natural sentence case, paired with `tabular-nums` on numbers so prices align cleanly without looking like code.
3. **Soft Surface Depth & Brand Identity:** Replace rigid `1px` wireframe boxes with `16px` rounded cards, soft ambient elevation shadows, generous whitespace, and color-coded **Company Monogram Avatars** (`MB` for Maybank, `TN` for Tenaga, `GM` for Gamuda, etc.).
4. **Guided Financial Literacy:** Turn raw financial metrics into approachable, tap-to-learn cards with beginner analogies, visual progress bars, and a 30-second annual report cheat sheet.

---

## 2. Design System Tokens (`index.html` & `src/index.css`)

### 2.1 Typography
- **Font Family (`--font-sans` & `--font-display`):** `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Heading Style (`.font-editorial` mapped to clean Display Sans):** `font-family: var(--font-sans); font-weight: 700; letter-spacing: -0.025em; line-height: 1.18;` (eliminates serif italics across the app).
- **Numeric Style (`.font-tabular`):** `font-family: var(--font-sans); font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; letter-spacing: -0.015em;`
- **Section Labels (`.jom-kicker`):** Natural sentence/title case sans (`font-family: var(--font-sans); font-size: 0.75rem; font-weight: 600; text-transform: none; letter-spacing: 0; color: var(--ink-muted);`).

### 2.2 Color Palette (Light-First Warm Porcelain + Slate Dark Mode)
- **Light Mode (`:root`):**
  - `--bg-canvas`: `#F7F8FA`
  - `--bg-surface`: `#FFFFFF`
  - `--bg-subtle`: `#F1F4F8`
  - `--bg-elevated`: `#FAFBFD`
  - `--bg-inverse`: `#0F172A`
  - `--ink-primary`: `#0F172A`
  - `--ink-secondary`: `#475569`
  - `--ink-muted`: `#64748B`
  - `--ink-inverse`: `#FFFFFF`
  - `--border-hairline`: `#E8ECF2`
  - `--border-strong`: `#CBD5E1`
  - `--accent-brand`: `#059669`
  - `--accent-brand-hover`: `#047857`
  - `--accent-brand-subtle`: `#ECFDF5`
  - `--signal-up`: `#059669` (`--signal-up-bg`: `#ECFDF5`)
  - `--signal-down`: `#E11D48` (`--signal-down-bg`: `#FFF1F2`)
  - `--signal-warn`: `#D97706` (`--signal-warn-bg`: `#FEF3C7`)
- **Dark Mode (`.dark`):**
  - `--bg-canvas`: `#0B0F17`
  - `--bg-surface`: `#131A26`
  - `--bg-subtle`: `#1C2536`
  - `--bg-elevated`: `#172030`
  - `--ink-primary`: `#F8FAFC`
  - `--ink-secondary`: `#94A3B8`
  - `--ink-muted`: `#64748B`

### 2.3 Surfaces, Pills & Company Monograms
- **`.jom-panel`:** `border-radius: 16px`, `border: 1px solid var(--border-hairline)`, `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 16px rgba(15, 23, 42, 0.02)`.
- **`.jom-tag`:** Pill badge (`border-radius: 9999px`), sentence case, soft tinted background, `font-family: var(--font-sans)`.
- **`.jom-avatar`:** `40px × 40px` (`border-radius: 12px`) company monogram badge with curated sector/brand colors so every stock row looks like a real consumer investing app.

---

## 3. Screen-by-Screen Architecture

1. **App Shell (`src/App.tsx`):**
   - Left navigation rail with friendly labels: *Home*, *Stock Overview*, *My Portfolio*, *Watchlist*, *Learn & Research*, *Profile & Goals*.
   - Bottom card in sidebar shows a clean **Learning Progress** card (`Level X · XP progress bar`) and **Practice Buying Power** (`RM X,XXX.XX`).
   - Top bar shows live Bursa market status pill, language toggle (`EN` / `BM`), theme toggle, and a rounded **"Ask JomAI"** button.

2. **Home & Market Discovery (`src/components/Dashboard.tsx`, `src/components/LoginScreen.tsx`, `src/components/RiskQuestionnaire.tsx`, `src/components/WatchlistPage.tsx`):**
   - **Origin Verdict Hero:** Left card displays total practice portfolio value, daily gain/loss pill, cash vs. invested split, and projected annual dividend income. Right card displays **"Today's Market Brief"** — a conversational summary of what is moving on Bursa Malaysia today plus 3 quick action buttons (*Explore Stocks*, *2-Min Lesson*, *Summarize a Filing*).
   - **Featured Learning Picks ("Popular with Malaysian Beginners"):** 3 approachable stock cards with company monogram icons, 1-sentence plain-English business descriptions, Shariah-compliant badge, and smooth sparkline.
   - **Bursa Stock Explorer:** Search bar + horizontal scrollable sector & Shariah filter pills + clean stock list with company monograms, sector subtitle, sparkline, price, and daily change pill.

3. **Stock Overview & Practice Order Ticket (`src/components/StockDetails.tsx`, `src/components/AIRecommendation.tsx`):**
   - **Public.com-style Header:** Company monogram + full name + ticker (`1155.KL`) + Shariah pill + large tabular price + timeframe pills (`1D`, `1W`, `1M`, `3M`, `1Y`).
   - **"How This Company Makes Money" Card:** Plain-English explanation directly below the price chart.
   - **5-Factor Company Health Check & Peer Comparison:** Clean visual progress bars (*Valuation*, *Growth*, *Financial Health*, *Dividend Yield*, *Momentum*) alongside the interactive radar & peer comparison selector.
   - **Tap-to-Learn Key Metrics:** Beginner-friendly cards for *P/E Ratio*, *Dividend Yield*, *Market Cap*, and *Shariah Screening* that reveal a real-world analogy and award `+10 XP` when read.
   - **Sticky Practice Order Card:** Friendly **Buy / Sell** toggle, **Standard Lot (100 shares)** vs. **Starter Unit (1 share)** switch, clear Bursa fee breakdown, and instant simulated execution.

4. **Portfolio, Learn & Research Hub, and JomAI Copilot (`src/components/PortfolioPage.tsx`, `src/components/ProfileSettings.tsx`, `src/components/EducationalHub.tsx`, `src/components/ChatbotModal.tsx`):**
   - **Portfolio Page:** Visual allocation bar, conversational **Diversification Coach** card, **Passive Dividend Income** card, holdings list with company monograms, and clean trade history.
   - **Learn & Research Hub:**
     - *Tab 1 — AI Research Tools:* `JomRingkas` ("30-Second Annual Report Cheat Sheet" with PDF/TXT upload and 3 clear takeaway cards: *What's Going Well*, *Risks to Watch*, *Dividend & Shariah Check*), `JomSentimen` (visual Market Mood bar + clickable Malaysian business news cards), and the **10-Year Wealth Calculator** (Stocks vs. EPF 5.5% vs. FD 3.0%).
     - *Tab 2 — 5-Minute Lessons:* Interactive bite-sized cards with progress badges and 1-question check-ins (`+25 XP`).
     - *Tab 3 — Video Guides:* Curated walkthroughs with key takeaways.
   - **JomAI Copilot Drawer:** Conversational research assistant with suggested beginner questions, clickable stock chips, and plain-English answers.
