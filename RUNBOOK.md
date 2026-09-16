# Lakeside Party Rental — Development Runbook

Development-focused. No client dependencies. Every asset is either scraped, generated, or rendered.

## Documents

| File | Purpose | Used how |
|---|---|---|
| `RUNBOOK.md` | This file | Your reference |
| `lakeside-website-brief.md` | Strategy, IA, content inventory | Reference only — never pasted |
| `lakeside-orchestration-prompt-v3.md` | Roles, skills, working loop | **Part 3** pasted first |
| `lakeside-build-prompt-v2.md` | Design system, components, pages, pricing | **Part 4** pasted second |

---

# STAGE 0 — Local setup

All commands from `D:\Projects\Lakeside Rental` in PowerShell.

## 0.1 Verify prerequisites

```powershell
node --version    # need 18+
git --version
```

Missing Node: `winget install OpenJS.NodeJS.LTS`, then restart the terminal.

## 0.2 Create `.gitignore`

```powershell
@'
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/
build/
dist/

# environment
.env
.env*.local

# playwright mcp
.playwright-mcp/
test-results/
playwright-report/

# claude code (skills stay tracked)
.claude/settings.local.json

# os
.DS_Store
Thumbs.db
desktop.ini

# editor
.vscode/*
!.vscode/extensions.json
.idea/

# logs
*.log
npm-debug.log*
'@ | Out-File -FilePath .gitignore -Encoding utf8
```

`.claude/skills/` is deliberately tracked. Those six skills govern the whole build — you want `git diff` to show you if a later session rewrites one.

## 0.3 Initialise git

```powershell
git init
git add .gitignore
git commit -m "chore: initial commit"
```

If prompted for identity:
```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 0.4 Asset folders

```powershell
mkdir assets\photos, assets\logo
```

Source images land in `assets/`. Processed, renamed, optimised versions go to `public/images/` later during the build.

## 0.5 Confirm MCP

In Claude Code, run `/mcp`. Expect playwright, chrome-devtools, context7 — all connected.

---

# STAGE 1 — Remote repository (GitHub, browser)

1. Go to **github.com/new**
2. **Repository name:** `lakeside-party-rental`
3. **Description:** `Next.js marketing site for a Michigan event rental company — GSAP, three.js, Aceternity UI`
4. **Visibility: Private.** The site is built from a real business's public content; keep it out of search results until it's a live agreed project.
5. **Do not** tick "Add a README", "Add .gitignore", or "Choose a license". You already have a local commit and these create a conflicting initial commit.
6. Click **Create repository**
7. Copy the HTTPS URL from the page

Then locally:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/lakeside-party-rental.git
git branch -M main
git push -u origin main
```

If it asks for credentials, use a **Personal Access Token**, not your password — github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → scope `repo`. Paste the token as the password. Windows Credential Manager stores it after the first push.

Verify: refresh the GitHub page, you should see `.gitignore` and one commit.

---

# STAGE 2 — Asset collection

The build needs volume to look real. Gather before phase 3.

## 2.1 Photos

Pull 25–40 images from the business's public Facebook photo albums into `assets/photos/`. Rename descriptively as you go — `tent-20x40-evening-reception.jpg`, not `IMG_2341.jpg`. Filenames become alt text and SEO copy later.

Prioritise, in order:
1. Tents, exterior, various sizes — the most-used category
2. Dance floors, all three colourways (white, black, checkered)
3. Full reception setups with tables, linens, lighting
4. Ceremony and aisle setups
5. Décor details — centrepieces, votives, place settings
6. Anything shot in the evening

## 2.2 Logo

Save the largest version available to `assets/logo/`. It's low-res, which is a known constraint — plan on a vector recreation during phase 1 for the dark header.

## 2.3 What you no longer need

The dusk hero photo is no longer a dependency. **The hero is now a three.js rendered tent at dusk with volumetric string lights**, with a static render fallback. This removes the only blocking asset from the plan and demos better, because it moves.

For the Compare slider's "before" state, if no bare-venue photo exists, render an empty ground plane from the same 3D scene. The comparison reads more cleanly anyway.

---

# STAGE 3 — Foundation (Claude Code)

## What changed from the original plan

Their recent marketing collateral supplied real brand and product data. Three things are now fixed rather than invented:

**Brand identity is navy and blue, not pine and brass.** Their logo is a navy high-peak tent wordmark over blue water waves. Gold appears only on premium wedding material; forest green is minor. Blue is the brand, gold is the upgrade signal. V2's palette is corrected to `#16294F` navy, `#1F5FBF` signal blue, `#7FB2E5` lake blue, `#B8922F` gold.

**They launched a new site recently.** So this is not replacing something abandoned — it has to beat something current. V2 now carries a hard requirement: match all four of their advertised capabilities and add at least two they don't have. The mandatory two are the **3D layout configurator** and the **instant quote builder**.

**Wedding management is a real priced product.** Three collections at $395 / $795 / $1,395, all built around custom 3D and 2D layouts. This validates the configurator commercially — they already sell layouts by hand. It also means `/weddings` is a revenue page, not a brochure page.

## 3.1 Confirm the content data

Before running anything, spot-check the pricing in V2 against their live site yourself. Their site now blocks automated fetching, so some figures came from earlier reads and cached snippets.

**Verify manually:** tent package sizes and prices, table and chair pricing, dance floor sizes, décor line items.

**Confirmed and current:** phone `(517) 294-1640`; 10% military discount; Lake Chemung half-mile discount; full payment due within two weeks to hold a date; tents delivered 1–2 days prior, collected the day after; tables and chairs delivered stacked unless setup is bought; wedding tiers as above.

> **Warning:** several similarly-named companies exist — Lakeside Party Rentals in Port Huron and Clinton Township MI, one in Indiana, one in San Diego. Do not let any of their data enter the project. Only `lakeside-party-rental.com` and the Howell Facebook page are valid sources.

## 3.2 Run the foundation prompt

Fresh Claude Code session. Paste **Part 3 of `lakeside-orchestration-prompt-v3.md`** — from "WHO YOU ARE" through "BEGIN".

Attach the four marketing images from `assets/reference/` — the wedding management flyer, the Memorial Day post, the delivery special, and the website launch post. They are the brand reference.

## 3.3 Review the six skills before approving

Highest-leverage review in the project. These govern every later session, including after compaction.

- `lakeside-design-system` — navy-primary palette correct; gold reserved for premium/wedding; anti-neon rule present; pricing and forms on light backgrounds
- `lakeside-content` — every price correct; **wedding collections present with the "Starting at" phrasing and the scope footnote**; military and Lake Chemung discounts; payment terms
- `aceternity-animate-ui` — do-not-use list present
- `gsap-motion` — sourced from `/greensock/gsap-skills` via Context7, `matchMedia` and reduced-motion rules present
- `r3f-3d-scene` — instancing, draco, lazy-load, mobile fallback
- `qa-audit-loop` — full checklist

## 3.4 Commit

```powershell
git add .claude CLAUDE.md
git commit -m "chore: add project skills and claude config"
git push
```

---

# STAGE 4 — Build

**4.1** Same session, paste **Part 4 of `lakeside-build-prompt-v2.md`**.

**4.2** Phases run as Plan → Build → Analyze → Improve → Report, stopping at each gate.

## At every gate

1. **Open the Playwright screenshots** at 390, 768, 1440, 1920.
2. **Ask the question automation can't:** does this read as a warm local wedding vendor in their navy-and-gold identity, or has it drifted to generic AI-startup neon? If drifted, redo the phase — don't approve and defer. That error propagates into every later component.
3. **Check Lighthouse:** performance ≥90, accessibility ≥95, best practices ≥95, SEO ≥95.
4. `git commit` and `git push`.

## Revised phase order

Reordered so the two mandatory differentiators land early — they are the reason the site exists, and they are the riskiest to build.

| # | Phase | Loops | Notes |
|---|---|---|---|
| 1 | Scaffold, tokens, base components | 2 | Navy/gold system from their collateral |
| 2 | Design system showcase page | 2 | Your visual contract |
| 3 | Homepage with full motion | 2–3 | 3D rendered tent hero |
| 4 | **3D/2D layout configurator** | 3 | Mandatory differentiator #1 |
| 5 | **Instant quote builder + running total** | 2 | Mandatory differentiator #2 |
| 6 | Rental category pages | 1 | Tents, dance floors, tables, décor |
| 7 | **Weddings + management collections** | 2 | Revenue page — three tiers, tier colors |
| 8 | Gallery with filtering | 1 | Uses your 31 photos |
| 9 | Graduations + service-area hub + 5 city pages | 1 | Local SEO |
| 10 | About, reviews, how-it-works, contact form | 1 | |
| 11 | SEO, schema, sitemap, OG images | 1 | |
| 12 | Performance and accessibility pass | 2 | |
| 13 | README and handoff docs | 1 | |

Phases **1, 2, 3, 4, 5, 7, 12** carry the project. Cut loops from 6, 8–11 if time runs short — never from these.

## 4.3 Photo handling

Your 31 images in `assets/photos/` get processed during phase 8. Before that, in phase 1, have Claude Code write a script that converts them to WebP at multiple widths and outputs them to `public/images/`. Keep originals in `assets/` untouched.

If filenames are still camera defaults, rename them descriptively first — they become alt text and gallery captions. `tent-20x40-checkered-floor-evening.jpg` beats `IMG_2341.jpg`.

**4.4** Run `/compact` between phases. Safe — skills reload from disk. If a session dies, tell the next one which phase you were on.

---

# STAGE 5 — Deploy

**5.1** Push everything to GitHub.

**5.2** Connect the repo to Netlify or Vercel. Both auto-detect Next.js; every push redeploys.

**5.3** **Verify on the live URL, not localhost.** The 3D configurator and scroll animation behave differently over a real network. Test on an actual phone, on cellular — their customers are outdoors in rural Michigan.

**5.4** Run Lighthouse against the deployed URL. Local scores flatter you.

**5.5** Check the two differentiators specifically on mobile: does the configurator fall back gracefully, and does the quote builder's running total work on a touch screen?

**5.6** Keep the preview URL. It's the artifact.

---

# Failure modes

| Symptom | Cause / fix |
|---|---|
| Output drifts to dark neon SaaS | Skills not loaded. Tell it to invoke `lakeside-design-system` and redo the phase. |
| Prices hardcoded in components | Violates the content skill. Refactor to the typed config file. |
| Animation "works" but you never saw it | No screenshot, no approval. Make it use Playwright. |
| Scroll breaks on mobile | `gsap.matchMedia()` guard missing below 768px. Pins must be disabled there. |
| Slow first load | 3D not lazy-loaded, or no static hero fallback before hydration. |
| Claims success without evidence | Ask for the screenshot and the Lighthouse number. |
| Context lost mid-build | `/compact`, then state the current phase. Skills restore the rules. |
| Push rejected on first `git push` | You initialised the GitHub repo with a README. Either `git pull --rebase origin main` or recreate the repo empty. |
