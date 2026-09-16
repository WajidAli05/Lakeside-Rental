---
name: qa-audit-loop
description: The Analyze and Test checklist for every phase of the Lakeside Party Rental build — Playwright screenshots at 390/768/1440/1920, aesthetic drift audit, animation and reduced-motion verification, 3D frame rate and draw calls, Lighthouse thresholds, keyboard and contrast pass, conversion-path timing, and content accuracy against the pricing config. Produces numbered findings with blocker/major/minor severity and a specific fix. Use at the start of every Analyze phase, before any QA, audit, review or sign-off, and before claiming a phase is done.
---

# QA Audit Loop

Every deliverable runs **Plan → Build → Analyze & Test → Improve → Report**, repeated until
the exit criteria are met. **Minimum two full cycles per phase.**

**If your first Analyze pass finds nothing, you are not looking hard enough.** A clean first
pass means the checklist was skimmed, not run.

**Code you have never watched run is not done.** Use Playwright to actually open and
screenshot it. Use Chrome DevTools to profile it. A description of behaviour is not evidence
of behaviour.

---

## 1. Screenshots — four breakpoints, every time

| Width | Represents |
|---|---|
| **390** | iPhone-class phone. The majority of this client's traffic. |
| **768** | Tablet / the GSAP breakpoint boundary. Also where Aceternity's `lg:` nav is still in mobile mode. |
| **1440** | Standard laptop. |
| **1920** | Desktop. |

Full-page screenshots, not just the fold. Look at them. Attach them to the report.

Also capture: mid-scroll states for any scroll-driven section, every interactive component in
its open/active state, and every form in its error state.

---

## 2. Aesthetic audit — the question automation cannot ask

**Does this read as a warm local wedding vendor in navy and gold, or has SaaS-neon crept in?**

Look for the specific failure signatures:

- Purple, cyan, violet or neon anywhere.
- Glow, halos, or resting drop shadows.
- Radii above 2px that were not a deliberate choice.
- Geometric sans in display positions.
- Grey — `neutral-*`/`zinc-*`/`slate-*` survivors instead of Cream, Sand, Mist and Charcoal.
- Pure white backgrounds.
- Dark backgrounds under pricing tables or form fields.
- More than one signature motion effect in a viewport.
- Emoji used as iconography.
- Gold used as body text on a light background instead of Gold Ink.
- Gold used anywhere outside wedding/premium context, where navy belongs.

**If it has drifted, redo the phase. Do not approve and defer.** Aesthetic error propagates
into every component built afterwards, and the cost of fixing it compounds.

---

## 3. Motion

- Does **every** animation actually run? Watch it, do not infer it from the code.
- Any jank, stutter or dropped frames during scroll?
- Any layout shift caused by an animation? (CLS is measured, but eyeball it too.)
- Do pins release cleanly, and does the content after a pinned section sit correctly?
- Does `ScrollTrigger.refresh()` fire after images load — test on a throttled connection where
  images arrive late, which is where this breaks.
- **Reduced motion:** emulate `prefers-reduced-motion: reduce`, reload, screenshot all four
  breakpoints. The page must be complete and readable, with **nothing invisible or missing.**
- Below 768px: confirm **no pinning and no scrubbing**. Scroll with touch emulation and
  confirm momentum scroll is unimpeded.

---

## 4. 3D

- **Frame rate** — desktop and a throttled mobile profile (6x CPU throttle minimum). Record
  the actual numbers.
- **Draw calls** — `gl.info.render.calls`. Under 60 for a fully populated layout.
- **Memory** — heap snapshot. Mount and unmount the configurator ten times; memory must
  return to baseline. If it climbs, disposal is wrong.
- Does the mobile fallback trigger, and is the fallback genuinely usable?
- Does the static render appear before 3D, and is it the LCP element?
- Does the render loop stop when the canvas scrolls off-screen? (Profile it.)
- Is there a center pole visible in any tent size? (There must not be.)
- Kill the WebGL context deliberately and confirm graceful degradation.

---

## 5. Lighthouse

Run against a production build (`next build && next start`), not the dev server. Dev-server
numbers are meaningless.

| Metric | Threshold |
|---|---|
| Performance | **≥ 90** |
| Accessibility | **≥ 95** |
| Best Practices | **≥ 95** |
| SEO | **≥ 95** |

Record LCP, CLS, TBT and total bundle size as numbers in the report, not just the category
scores. A 90 with a 4s LCP is a failing page that got lucky on weighting.

Run mobile emulation, not just desktop.

---

## 6. Accessibility

- **Keyboard-only pass**, no mouse: reach every interactive element, operate every control,
  open and close every menu and modal, complete the quote form, and drive the configurator.
- Focus visible at every step, never clipped by `overflow: hidden`, never `outline: none`.
- Logical tab order; no traps; no focusable elements inside faded-out content.
- Contrast: every text/background pair against the measured table in `lakeside-design-system`.
- Every input has a real bound `<label>`. Placeholders are not labels.
- Errors are announced, tied to their field, and not conveyed by color alone.
- Tap targets ≥44px, verified at 390px where they actually crowd.
- Images have meaningful alt text; decorative layers are `aria-hidden`.
- Headings form a sane outline — one `h1`, no skipped levels.

---

## 7. Conversion paths — timed, not estimated

Run these as real Playwright walkthroughs and record the click count and elapsed time.

| Path | Target |
|---|---|
| Bride lands on home → finds wedding pricing | **under 10 seconds** |
| Last-minute renter → finds the phone number | **under 3 seconds** |
| Visitor → package price for a 100-person graduation party | under 15 seconds |
| Visitor → completed quote request submitted | under 2 minutes |
| Visitor → builds a layout in the configurator | reachable in 2 clicks from home |

The phone number test is the one people fail. `(517) 294-1640` must be visible or one tap
away from the top of **every** page, and it must be a real `tel:` link on mobile.

---

## 8. Content accuracy

- **Every price on screen matches `src/config/pricing.ts`**, which matches
  `LAKESIDE-CURRENT-WEBSITE-INFO.md`. Check them one by one; do not spot-check.
- Zero hardcoded prices in JSX — grep for `$` followed by digits in component files.
- Wedding tiers say **"Starting at"** and carry the scope footnote, every appearance.
- Each wedding tier's own décor asterisk is present and complete.
- Dance floor selector disables invalid size/finish pairs — try to select black on 20x20.
- Quote form has exactly the eight Step 1 fields.
- Subfloor note appears on the dance floor page and in the configurator.
- Availability results carry both the freshness line and the 24-hour confirmation line; a
  Booked date offers three fully-open alternatives; no spinner or "real-time" label anywhere.
- No script webfont is requested — check the network panel. Accents render as inline SVG with
  no FOUT and no layout shift.
- **No banned phrases** — grep for: elevate, elevated, elevates, unforgettable, we've got you
  covered, nestled, next level, seamless, curated.
- No placeholder text, lorem ipsum, invented testimonials, or fake review counts.
- Phone number, service area counties and owner names correct throughout.

---

## 9. Report format

Findings as a **numbered list**, each with a severity and a **specific** fix:

```
1. [BLOCKER] Hero LCP is 4.1s at 390px — the r3f canvas is loading before the static
   render instead of after it.
   Fix: move TentScene behind next/dynamic with ssr:false and StaticHeroRender as the
   loading component; verify the <img> is the LCP element in the trace.

2. [MAJOR] Tier price "$1,395" renders in Brand Gold on Cream (2.61:1) in
   MasterpieceCard.tsx:42 — fails AA.
   Fix: swap text-gold to text-gold-ink; keep the gold hairline rule as-is.

3. [MINOR] Gallery filter chips are 38px tall at 390px.
   Fix: min-height 44px on the chip base class.
```

**Severity:**
- **Blocker** — breaks a conversion path, fails an exit criterion, breaks on a real device,
  or ships wrong pricing. Cannot advance.
- **Major** — accessibility failure, visible aesthetic drift, measurable performance
  regression. Cannot advance.
- **Minor** — polish. Log it; may advance with it open if justified.

---

## 10. Exit criteria — all must be true

- Zero blockers, zero majors.
- Lighthouse: performance ≥90, accessibility ≥95, best practices ≥95, SEO ≥95.
- 60fps desktop scroll; no jank on a throttled mobile profile.
- Fully keyboard navigable; reduced motion respected.
- Correct at all four breakpoints.
- Passes the aesthetic audit in §2.

**Report honestly. If something could not be verified, say so plainly rather than claiming
success.** "I could not measure mobile frame rate because X" is a usable report. "Performance
looks good" is not.
