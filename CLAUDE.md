# Lakeside Party Rental — Project Guide

Marketing and booking site for **Lakeside Party Rental LLC**, a family-run tent and event
rental company in Howell, Michigan. Owners Josh and Josie. Phone **(517) 294-1640**.
Specialty: **high peak frame tents — no center poles.** Serving Livingston, Washtenaw,
Oakland, Jackson, Ingham and Genesee counties.

> **Source warning:** several unrelated companies share similar names — Lakeside Party
> Rentals of Port Huron MI, Clinton Township MI, Indiana and San Diego CA. **None are this
> client.** Only `lakeside-party-rental.com` and their Howell Facebook page are valid
> sources. Never pull product data from the others.

---

## Canonical content

**`LAKESIDE-CURRENT-WEBSITE-INFO.md` (project root) is the single source of truth** for every
package, price, product size, inclusion, booking step and wedding collection.

Read it before writing anything that states a price, a size or what a package includes.
Never invent a price, size or inclusion that does not appear there.

All pricing flows through **one typed config**, `src/config/pricing.ts`, derived from that
file. **Never hardcode a price in JSX.**

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind v4** — design tokens declared in `@theme` in `src/app/globals.css`
- **GSAP** + ScrollTrigger + `@gsap/react` — all scroll-driven and timeline motion
- **Motion** (`motion/react`) — ships with Aceternity components; component-local transitions only
- **react-three-fiber** + drei — 3D hero and layout configurator
- **Aceternity UI** and **Animate UI** — installed via `npx shadcn@latest add @aceternity/<name>`,
  used for motion engineering only, always restyled

---

## The aesthetic constraint

The direction is **"Editorial Dusk"**: deep navy and blue as the brand identity, taken from
their logo — a navy high-peak tent wordmark over blue water waves — with gold as a premium
accent reserved for wedding and upgrade contexts. Cream and warm sand are the light surfaces;
never pure white. Cormorant Garamond for display and Inter for UI — two webfonts, with the
handwritten accent lines from their print collateral shipped as static SVG outlines rather
than a third family. Radii stay at 2px,
borders are 1px, shadows appear only on hover, and gold hairline rules divide sections.
Aceternity and Animate UI are used for their motion engineering and never for their default
visual identity — **no neon, no purple or cyan gradients, no glow, no geometric-sans display
type.** Dark navy carries the hero, 3D, gallery and CTA bands; **every pricing table and every
form sits on light cream**, because dark UI hurts conversion where people read numbers and
fill in fields. One signature motion effect per viewport, and WCAG 2.1 AA throughout.

Full detail, including the measured contrast table, is in `.claude/skills/lakeside-design-system/`.

---

## The two mandatory differentiating features

The client recently launched a new site advertising four capabilities: view rental options,
see pricing and packages, browse dance floors, request a quote. **We must deliver all four
done better, plus at least two theirs does not have.** Two are mandatory:

1. **Interactive 2D/3D event layout configurator.** They already sell custom 3D layouts as a
   paid service — up to seven on their top wedding tier. Nobody in their market lets a
   customer build one in the browser.
2. **Instant quote builder with a live running total.** Their site makes you read a price
   list, then describe what you want in a text box.

Four further differentiators strengthen the case: filterable event gallery, wedding management
collections as a real product page, live availability checker, and service-area landing pages
for local search.

---

## Ratified decisions

**These decisions and the six skills take precedence over the V2 build document wherever they
conflict.** V2 still describes the availability checker generically and still assumes a script
webfont; both are superseded below. Where V2 and a skill disagree, the skill wins — say so and
continue rather than silently following V2.

1. **Gold Ink `#785F1F` is a permanent 13th token.** Brand Gold `#B8922F` is for fills,
   hairline rules, icon strokes and gold-on-navy text. **The moment gold becomes text on a
   light background it becomes Gold Ink** — Brand Gold scores 2.61:1 on cream and fails AA.
   Same rule for blue: **links on dark surfaces use Lake Blue**, never Signal Blue (2.35:1 on
   navy).

2. **Resizable Navbar is forked**, at `src/components/ui/resizable-navbar.tsx`, with three
   upstream defects fixed: the `sticky top-20` positioning, the hardcoded
   `minWidth: 800px` that overflowed between 1024–1280px, and the unlabelled unfocusable
   mobile toggle SVG. **Import from the fork. Never re-run `shadcn add` for it.**

3. **No script webfont.** The handwritten accents are static SVG outlines, generated at build
   time from Parisienne (OFL) by `scripts/generate-script-accents.mjs` into
   `src/components/brand/script-accents.ts`, and rendered by `<ScriptAccent>`. Exact look,
   no font request, no FOUT. The TTF in `assets/fonts/` is a build-time input that is never
   served. **Two webfonts total: Cormorant Garamond and Inter.**

4. **The availability checker is JSON/CMS-backed and honest.** `src/data/blocked-dates.json`
   records **exceptions only** — an unlisted date is Available. Three states: Available /
   Limited / Booked, with **the next three open dates offered when Booked**. Guest count
   cross-checks package capacity (passed in from the pricing config, never duplicated). Every
   result shows "Availability current as of {date}" and "We confirm every date within 24
   hours." No spinner implying a live lookup, no "real-time" label, no countdown.

5. **Motion and GSAP split.** Motion (`motion/react`) owns component-local transitions that
   ship with Aceternity components — hover, layout, mount/unmount. GSAP owns everything
   scroll-driven. **Never both on one element.**

---

## Skills

Project skills live in **`.claude/skills/`** and are tracked in git deliberately — they govern
every session, including after context compaction. **Announce which skills you are invoking at
the start of every phase.**

| Skill | Governs |
|---|---|
| `lakeside-design-system` | Palette, contrast, type, components, section backgrounds, anti-neon rules |
| `lakeside-content` | Canonical source, typed pricing config, dance floor constraints, wedding tiers, quote schema, copy voice, banned phrases |
| `aceternity-animate-ui` | Approved/forbidden components, install, restyling procedure, per-component gotchas |
| `gsap-motion` | `useGSAP`, `matchMedia` breakpoints, reduced motion, easings, ScrollTrigger failure modes |
| `r3f-3d-scene` | Instancing, draco, lazy load, fallbacks, parametric tent, 2D/3D toggle |
| `qa-audit-loop` | The Analyze checklist, severity format, exit criteria |

---

## Commands

```bash
npm run dev      # dev server
npm run build    # production build — Lighthouse must be run against this, not dev
npm run start    # serve the production build
npm run lint     # eslint
npm run test     # tests
```

*(Wired up during Phase 1 scaffold; keep this list accurate as scripts are added.)*

Already runnable, before the scaffold exists:

```bash
node scripts/generate-script-accents.mjs              # regenerate handwritten accent paths
node --experimental-strip-types src/lib/availability.test.ts   # 12 assertions, currently green
```

`generate-script-accents.mjs` needs `opentype.js`, which Phase 1 adds as a devDependency.

---

## How we work

Every deliverable runs **Plan → Build → Analyze & Test → Improve → Report**, repeated until
exit criteria are met. **Minimum two full cycles per phase.** If the first Analyze pass finds
nothing, it was not run properly.

Use **Playwright** to open and screenshot what was built, at 390/768/1440/1920. Use **Chrome
DevTools** to profile it. Use **Context7** to verify library APIs rather than guessing.
**Code that has never been watched running is not done.**

**Exit criteria — all must be true before advancing:** zero blockers and zero majors ·
Lighthouse performance ≥90, accessibility ≥95, best practices ≥95, SEO ≥95 · 60fps desktop
scroll and no jank on a throttled mobile profile · fully keyboard navigable and reduced-motion
respected · correct at all four breakpoints · passes the aesthetic audit.

Commit at the end of each phase with a clear message.

**If something cannot be verified, say so plainly instead of claiming success.**
