# Working Style: personal side-project development

Drop this file at the project root as `AGENTS.md` (Antigravity also reads `GEMINI.md`), or into `~/.gemini/GEMINI.md` for all projects. It captures how I (Hao) work with an AI coding agent on side projects, learned from my Claude Code sessions. Workflows are in `workflows/`.

## 1. Collaboration style
- **Short answers, quick decisions.** Lead with the result or the recommendation, not a survey. When I say "go with X" or "just merge it", do it.
- **Recommend, don't list.** If you must offer options, put your pick first with one-line reasons. Ask only what blocks progress (0-2 questions); take a sensible default for the rest and say which.
- **Ask before acting** when work is hard to reverse or goes outside the request:
  - merging to `main`, pushing to shared branches, opening PRs (only when asked);
  - deleting or overwriting files, branches, data, migrations on real databases;
  - deploys, secrets, logins, OAuth and cloud-console setup, device settings;
  - anything beyond what I asked for (extra features, refactors, "while I'm here" fixes).
- **Before each step, check it was assigned.** A step that came from your own plan (not my request or a decision of mine) needs a pause and a question, even if the plan was approved.
- **My own steps:** deploys, cloud logins, OAuth setup, secrets, phone/device setup are mine. Prepare the exact steps, then stop.
- **Phone / device instructions:** one step at a time, naming the exact UI actions or Shortcut actions. Text I must paste on the phone goes as plain text, not code blocks.
- **Report faithfully.** Say what ran and what it printed. If a test failed or a step was skipped, say so. Don't claim "done" without evidence.

## 2. Development process (the loop I use)
1. **Orient first.** Read `AGENTS.md`/`CLAUDE.md`, then `HANDOFF.md` if it exists, then `git log --oneline -15` and `git status`. The progress ledger and git log are the truth; trust them over memory.
2. **Brainstorm** any new feature before building: understand the goal, propose 2-3 approaches with a recommendation, get my sign-off.
3. **Spec** to `docs/superpowers/specs/<date>-<topic>-design.md`. This becomes the binding design.
4. **Plan** to `docs/superpowers/plans/<date>-<topic>.md`: small numbered tasks, each with files, tests, commit message.
5. **Execute** on a feature branch, one task at a time:
   - TDD: failing test first, then code, then green.
   - One commit per task. Push regularly.
   - Keep a progress ledger (`.superpowers/<plan>/progress.md`, git-ignored) with rulings and deferred review findings.
   - For bigger plans: a fresh implementer per task, then a reviewer, then a fix loop (cap about 5 rounds). For smaller plans: execute inline.
6. **Whole-branch review** by a fresh reviewer (clean context) at the end, then one fix wave.
7. **Finish the branch:** summarize, then ask me before merging to `main`. Never merge or commit to `main` unprompted.
8. **Handoff:** keep `HANDOFF.md` at the repo root current (what is live, decisions with reasons, phase status, next steps, how to resume). Update it when a phase finishes or a decision is made.

## 3. Code rules
- Match the existing code's patterns, naming, encoding and formatting. Don't refactor unrelated code.
- Typecheck and run the full test suite before saying a task is done (`tsc --noEmit`, test runner, build).
- Every new API route / data path must follow the project's isolation or security pattern and get a test; meta-tests that fail on omissions are intentional.
- Don't touch business-critical logic (money, splitting, dedup, settlement) unless asked.
- Don't raise parallelism settings (e.g. test `maxWorkers`): the machine has limited free RAM and froze before.
- Keep dates/time zones and units explicit (money as integers in the smallest unit; local timezone for dates).

## 4. Secrets, git and attribution
- Secrets only through the platform's secret tool (e.g. `wrangler secret put`); never committed, never pasted in chat. No bank/payment credentials anywhere.
- Keep placeholders committed and real IDs in local uncommitted edits; never commit those.
- No AI model names or AI attribution in commits, code or docs (add attribution lines only if the host tool is configured to).
- Commit messages: short imperative subject; one commit per task.

## 5. Environment notes (Windows PC)
- Shell is PowerShell on Windows 11; use PowerShell syntax for commands I'll run.
- Antivirus (Norton) re-signs TLS and breaks Node tools like wrangler ("fetch failed") in a plain terminal. Per-terminal fix: `$env:NODE_EXTRA_CA_CERTS = "C:\ProgramData\Norton\Antivirus\wscert.pem"`. Ask before making it permanent.
- Limited free RAM: keep test concurrency low, avoid heavy parallel jobs.

## 6. Docs and learning
- Before answering about a library/framework/SDK/CLI, fetch current docs rather than relying on memory.
- Explain unfamiliar choices briefly; I'm learning, and I may later be quizzed on my own code, so keep structure clear and logic explainable function by function.

## 7. Long sessions
If a session gets long, repeats work, or contradicts earlier decisions: say so and run `workflows/handoff.md` rather than pushing on. Treat any handoff note as claims to verify against the real files.

## 8. Reference example: how a real project is set up
Finance tracker (React + Vite web app, Cloudflare Worker + Hono + D1 + R2 API, iPhone Shortcuts), built in phases (accounts, UI rebuild, connected splits). Its `CLAUDE.md` has: start-of-session checklist, commands table, rules (money, scoping, tests, merging, secrets, how I like instructions). Its `HANDOFF.md` has: what is live, repo layout, binding decisions, phase status, next steps, how to resume. Reuse that shape for new projects.
