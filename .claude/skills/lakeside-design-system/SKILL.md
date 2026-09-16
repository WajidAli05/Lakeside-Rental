---
name: lakeside-design-system
description: The Editorial Dusk visual system for the Lakeside Party Rental site — navy/gold palette tokens, measured contrast pairs, typography scale, component rules, section background rules, and the anti-neon constraints that stop Aceternity and Animate UI from imposing their default SaaS aesthetic. Use whenever writing, styling, restyling or reviewing any component, page, layout, color, font, spacing, border, shadow or CSS token in this project.
---

# Lakeside Design System — "Editorial Dusk"

The client is a family-run Michigan tent and event rental company. The site must read as a
warm, competent local wedding vendor. It must never read as an AI startup landing page.

Their identity is **deep navy and blue** — the logo is a navy high-peak tent wordmark over
blue water waves. **Gold is a premium accent used on wedding material only.**
Blue is the brand. Gold is the upgrade signal. Do not invert that relationship.

---

## 1. Palette

| Token | Hex | Role |
|---|---|---|
| Brand Navy | `#16294F` | Primary. Logo color, hero, footer, headings |
| Midnight Navy | `#0B1730` | Deepest sections, 3D scene background |
| Signal Blue | `#1F5FBF` | Secondary. Icon circles, links, active states |
| Lake Blue | `#7FB2E5` | Light blue accents, the logo's water motif |
| Brand Gold | `#B8922F` | Premium accent. Wedding management, CTAs, hairline rules |
| **Gold Ink** | **`#785F1F`** | **Derived. Gold *text* on light backgrounds — see §2** |
| Soft Gold | `#E3C97A` | Light accents on dark, string-light color |
| Forest Green | `#2D4A36` | Essentials tier, badges |
| Cream | `#F6F2E9` | Light section background — **never pure white** |
| Warm Sand | `#EBE3D5` | Light alternate bands |
| Charcoal | `#22201D` | Body copy on light |
| Mist | `#CBD3DC` | Borders, dividers |

### Tailwind v4 tokens

Declare once in `src/app/globals.css`. Never write a raw hex inside a component.

```css
@theme {
  --color-navy:      #16294F;
  --color-midnight:  #0B1730;
  --color-signal:    #1F5FBF;
  --color-lake:      #7FB2E5;
  --color-gold:      #B8922F;
  --color-gold-ink:  #785F1F;
  --color-softgold:  #E3C97A;
  --color-forest:    #2D4A36;
  --color-cream:     #F6F2E9;
  --color-sand:      #EBE3D5;
  --color-charcoal:  #22201D;
  --color-mist:      #CBD3DC;
}
```

---

## 2. Contrast — measured, not assumed

These ratios are computed, not estimated. **Brand Gold is not a text color on light backgrounds.**

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| Brand Gold `#B8922F` | Cream | **2.61** | FAIL — never body or label text |
| Brand Gold | White | **2.92** | FAIL |
| Brand Gold | Warm Sand | **2.29** | FAIL |
| Brand Gold | Brand Navy | 4.91 | AA |
| Brand Gold | Midnight | 6.10 | AA |
| **Gold Ink `#785F1F`** | **Cream** | **5.44** | AA |
| Gold Ink | White | 6.08 | AA |
| Gold Ink | Warm Sand | 4.77 | AA |
| Signal Blue | Cream | 5.45 | AA |
| **Signal Blue** | **Brand Navy** | **2.35** | FAIL — see rule below |
| Lake Blue | Brand Navy | 6.42 | AA |
| Lake Blue | Midnight | 7.97 | AAA |
| Lake Blue | Cream | 2.00 | FAIL |
| Soft Gold | Brand Navy | 8.81 | AAA |
| Soft Gold | Cream | 1.46 | FAIL |
| Charcoal | Cream | 14.54 | AAA |
| Navy | Cream | 12.84 | AAA |
| Forest Green | Cream | 8.77 | AAA |
| Cream | Brand Navy | 12.84 | AAA |
| Mist | Brand Navy | 9.49 | AAA |
| Mist | Cream | 1.35 | FAIL — borders only, never text |

**Three hard consequences — ratified, not suggestions:**

1. **Gold text on light uses `--color-gold-ink`.** Brand Gold on light is for *fills, hairline
   rules, icon strokes, underlines and borders* only — non-text elements, where the 3:1
   non-text threshold applies. The moment gold becomes a word on cream, it becomes Gold Ink.
   Gold-on-navy text stays Brand Gold.
2. **Links inside dark navy sections use Lake Blue, not Signal Blue.** Signal Blue on navy is
   2.35:1 and effectively illegible. Signal Blue is a *light-background* color.
3. **Soft Gold and Lake Blue are dark-background-only colors.** Both fail on cream.

---

## 3. Typography

**Two webfonts. Not three.**

| Face | Use |
|---|---|
| **Cormorant Garamond 600** | Display — h1, h2, tier names, pull quotes |
| **Inter** | Body, UI, labels, buttons, tables, form fields |

**Never use a geometric sans for display type.** No Poppins, no Montserrat, no Space Grotesk,
no Satoshi. That is the fastest way to make this look like a generic template.

**Scale:** 72 / 48 / 32 / 24 / 20 / 17 / 14

**Body:** 17px, line-height 1.65, max measure **68ch**.

Load only the weights actually used, `font-display: swap`, and preload the display face used
in the hero. Two families is the budget — do not add a third.

### The handwritten accents are SVG, not a font — ratified

The client's collateral uses a handwritten script for a handful of accent lines. **There is
no script webfont on this site.** Those lines appear four or five times site-wide, so they
are converted to outlines at build time and shipped as static SVG path data.

- Data: `src/components/brand/script-accents.ts` — **auto-generated, never hand-edited**.
- Component: `src/components/brand/ScriptAccent.tsx`.
- Regenerate: `node scripts/generate-script-accents.mjs`.
- Source face: Parisienne, SIL OFL 1.1. The TTF in `assets/fonts/` is a **build-time input
  only** — it is never copied to `public/` and never served.

```tsx
<ScriptAccent id="nowBooking" className="h-10 text-gold-ink" />
```

Color comes from `currentColor`, so the accent obeys the contrast rules automatically:
**`text-gold-ink` on light, `text-softgold` on dark.**

**Rules, unchanged from when this was a font:** never below 20px, never for anything a user
must act on, never for a whole paragraph, **maximum one script accent per viewport.** It is a
garnish, not a typeface.

**Never bake an owner-editable value into a path.** Years, prices and counts stay as live
text beside the accent — "Now Booking" is an accent, `2026 & 2027` is text from config.
Changing a baked string requires regenerating the file, which the owners cannot do.

Adding a sixth accent is a deliberate decision, not a default: the longest existing line costs
~12 KB brotli on its own. If a new line is long, shorten the copy before generating it.

---

## 4. Section background rule — non-negotiable

| Section type | Background |
|---|---|
| Hero | Dark (Navy / Midnight) |
| 3D scene viewport | Dark (Midnight) |
| Gallery | Dark (Navy) |
| Final CTA bands | Dark (Navy) |
| **All pricing tables and package cards** | **Light (Cream / Warm Sand)** |
| **All forms, including the quote builder** | **Light (Cream)** |
| Long-form editorial, how-it-works | Light (Cream / Warm Sand) |

Dark UI measurably hurts conversion where people read numbers and fill in fields.

The configurator is the one nuance: the **3D viewport** is dark, but its **control panel,
item list and running total are light**. Split the surface — never put a price on a dark panel.

---

## 5. Components

- **Radius 2px.** Not `rounded-xl`, not pill-shaped cards. Aceternity defaults to large radii
  and `rounded-full`; override every time. Pills are permitted only for filter chips and
  small status badges.
- **1px Mist borders** as the default separator.
- **Shadows on hover only.** No resting drop shadows. No glow, ever.
- **48px minimum button height**, 44px minimum tap target on every interactive element.
- **Thin gold hairline rules as section dividers** — 1px Brand Gold, often with a centered
  label or small ornament, exactly as their collateral does it.
- **The small gold heart motif** from their wedding flyer: sparingly, and **only on wedding
  pages**. Never on rentals, gallery, or the quote builder.
- Tier colors, fixed: Essentials = Forest Green · Signature = Brand Navy · Masterpiece = Brand Gold.

---

## 6. Hard rules

1. **Aceternity UI and Animate UI are used for motion engineering only, never their default
   visual identity.** Every component is restyled to this palette before it ships.
   Banned on sight: neon, purple/cyan gradients, glow on everything, geometric-sans display
   type, `rounded-3xl` glass cards, dark-mode-by-default aesthetics, emoji as iconography.
2. **Maximum one signature motion effect per viewport.** If two want the same screen, the
   more conversion-relevant one wins and the other degrades to a plain fade.
3. **Gradients only in the gold or blue range, low opacity.** No three-stop rainbows. If you
   can point to where the gradient starts and stops, it is too strong.
4. **WCAG 2.1 AA throughout:** 4.5:1 text contrast, visible focus rings (2px Signal Blue on
   light, Soft Gold on dark, 2px offset — never `outline: none` without a replacement),
   44px tap targets, real `<label>` elements bound to inputs, never color-only state.
5. **Never pure white** as a page or section background. Cream is the light surface.

---

## 7. The hero tension — resolved

The designer wants a dark 3D tent-at-dusk hero. The UX specialist wants LCP under 2.5s.
Both are satisfiable, in this order only:

1. A static optimized render of the tent scene ships as the LCP element — real `<Image>`,
   `priority`, explicit `width`/`height`, AVIF/WebP, no layout shift.
2. The r3f canvas lazy-loads after hydration and cross-fades in over the static image.
3. On mobile and under `prefers-reduced-motion`, step 2 never happens. The static image *is*
   the hero, permanently.

The 3D is an enhancement layered onto an already-fast page, never the thing the page waits
for. See `r3f-3d-scene` for the implementation contract.

---

## 8. Self-check before shipping any component

- Would a bride in Howell, Michigan read this as a local wedding vendor?
- Is there a resting shadow, a glow, or a radius above 2px I did not deliberately choose?
- Is any price or form field sitting on a dark background?
- Is any gold word sitting on a light background instead of Gold Ink?
- Is there more than one signature motion effect in this viewport?
- Did I write a raw hex instead of a token?
