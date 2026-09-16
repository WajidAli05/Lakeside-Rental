---
name: aceternity-animate-ui
description: Which Aceternity UI and Animate UI components are approved or forbidden for the Lakeside Party Rental site, how to install them, and the mandatory procedure for stripping their default neon/SaaS aesthetic down to the navy-and-gold palette. Use whenever adding, installing, restyling or reviewing any Aceternity or Animate UI component, background, card, navbar, grid, tab, form control or animated block.
---

# Aceternity UI + Animate UI — approved set and restyling procedure

These libraries are used for **motion engineering only, never their visual identity.**
Every component is restyled before it ships. See `lakeside-design-system` for the palette.

---

## 1. Verify the API before you document or use it

**Aceternity components are copy-paste source, not a versioned package. Props drift.**

Before using a component for the first time, **query Context7** — do not rely on memory or on
another component's signature:

- `/llmstxt/ui_aceternity_llms_txt` — deepest coverage, full component source
- `/websites/ui_aceternity` — prop tables and install commands

Install is now via the shadcn registry (verified):

```bash
npx shadcn@latest add @aceternity/<component-name>
```

This drops editable source into `src/components/ui/`. **That source is ours to modify** —
restyling is expected, not a hack. Do not wrap an Aceternity component in override classes
when you can edit its source directly; specificity wars are how the neon leaks back in.

**Before installing anything, check whether `src/components/ui/` already has a fork of it.**
Re-running the add command silently overwrites our fixes. Forked so far:
`resizable-navbar.tsx` (see §6).

### Two runtimes — a deliberate decision

Aceternity ships on **`motion/react`** (Motion, formerly Framer Motion). We use **GSAP** for
scroll-driven and timeline work. Both will be in the bundle. The split is:

- **Motion** — component-local state transitions that come with an Aceternity component:
  hover, layout, mount/unmount, `AnimatePresence`. Leave these as authored.
- **GSAP + ScrollTrigger** — every scroll-driven effect, every pinned section, every
  multi-element timeline. See `gsap-motion`.

**Never drive the same element from both.** Pick one owner per element and keep it. Where an
Aceternity component's internal Motion animation duplicates something GSAP should own, strip
the Motion animation out of the copied source rather than layering GSAP on top of it.

---

## 2. Approved Aceternity components

**Navigation and chrome**
Resizable Navbar · Floating Dock · Sticky Banner · Footers

**Type and hero**
Text Generate Effect · Container Text Flip · Parallax Hero Images · Container Scroll Animation

**Pricing and layout**
Pricing Sections · Bento Grid · Card Hover Effect · 3D Card Effect · Comet Card

**Gallery and imagery**
Parallax Grid Scroll · Layout Grid · Lens · Compare

**Social proof**
Animated Testimonials · Infinite Moving Cards

**Narrative and structure**
Timeline · Sticky Scroll Reveal · Tracing Beam · Animated Tabs · FAQs · World Map

**Forms and actions**
Contact Sections · Signup Form · Placeholders And Vanish Input · Stateful Button ·
Magnetic Button · Moving Border

---

## 3. Forbidden — wrong register for this client

Terminal · Code Block · Keyboard · ASCII Art · Encrypted Text · Dither Shader ·
Webcam Pixel Grid · Macbook Scroll · GitHub Globe · Meteors · Shooting Stars ·
Background Boxes · Vortex · Colourful Text · Squiggly Text · Glowing Stars

These are developer-tool and sci-fi motifs. A bride pricing a tent for her August wedding
does not need a terminal emulator. **Do not use these even "restyled" — the problem is the
metaphor, not the color.**

---

## 4. Animate UI backgrounds

| Background | Where | Settings |
|---|---|---|
| **Gradient** | Hero base layer | Recolored navy → gold, **very low opacity** |
| **Fireworks** | Final CTA only | Gold particles, low population, slow |
| **Stars** | Dark sections | Recolored warm gold, low density — **must read as distant string lights, not outer space** |
| **Hexagon** | Gallery, service-area pages | Very low opacity texture |

**Do not use:** Hole · Bubble · Gravity Stars.

One background effect per page section. Never two layered. If a section already has a
signature GSAP effect, it gets no animated background — see the one-effect-per-viewport rule.

---

## 5. The restyling procedure

Run this on **every** component after `npx shadcn@latest add`, before wiring it into a page.

**Step 1 — Strip the palette.**
Delete every `neutral-*`, `zinc-*`, `slate-*`, `gray-*`, `purple-*`, `cyan-*`, `blue-500`,
`indigo-*` and `emerald-*` class. Replace with project tokens: `navy`, `midnight`, `signal`,
`lake`, `gold`, `gold-ink`, `softgold`, `forest`, `cream`, `sand`, `charcoal`, `mist`.
Check the result against the contrast table in `lakeside-design-system` — gold text on a
light surface becomes `gold-ink`, links on navy become `lake`.

**Step 2 — Kill dark mode.**
Aceternity source is littered with `dark:` variants. **This site has one theme.** Delete every
`dark:` class rather than leaving both — a stray `dark:bg-neutral-950` will fire on a visitor
whose OS is in dark mode and break the section-background rule.

**Step 3 — Fix the geometry.**
`rounded-lg`/`rounded-xl`/`rounded-2xl`/`rounded-3xl`/`rounded-full` → `rounded-[2px]`.
Exceptions: filter chips, small status badges, and genuinely circular icon wells.

**Step 4 — Remove resting shadows and all glow.**
Delete resting `shadow-*`, every `drop-shadow`, every `blur` used as a halo, every
`box-shadow` with a saturated color. Shadows are hover-only. Aceternity's signature
multi-layer `box-shadow` strings (the long `rgba(34,42,53,...)` ones) go entirely.

**Step 5 — Fix the type.**
Remove font-family classes the component sets. Display text takes Cormorant Garamond 600;
everything else takes Inter. Never leave a component on the default sans stack.

**Step 6 — Accessibility pass.**
Aceternity demos are frequently inaccessible. Every time:
- `<div onClick>` → real `<button>` or `<a>`.
- Add visible focus styles; the source often has none.
- Interactive targets to 44px minimum.
- Icon-only controls get `aria-label`.
- Decorative animated layers get `aria-hidden="true"` and `pointer-events-none`.
- Anything driven by hover needs a keyboard-reachable equivalent.

**Step 7 — Reduced motion.**
Wrap or guard the component's motion so `prefers-reduced-motion: reduce` yields a static,
complete, readable state. Never a blank one — `Text Generate Effect` in particular must
render the full text immediately, not nothing.

---

## 6. Known component-specific gotchas

**Resizable Navbar — already forked. Do not re-install it.**

`src/components/ui/resizable-navbar.tsx` is our corrected fork. **Import from there.** Running
`npx shadcn@latest add @aceternity/resizable-navbar` would overwrite it and reintroduce three
fixed defects. The header file documents each change inline.

Fixed in the fork:
1. `sticky top-20` → `fixed inset-x-0 top-0`. Callers pad page content below the header.
2. The hardcoded inline `style={{ minWidth: "800px" }}` on `NavBody` is gone — it collided
   with the animated `width: 40%` between 1024px and ~1280px and overflowed the container.
   Width is now `max-w-7xl` plus `min-w-0`, and the condensed width is 72%, not 40%.
3. `MobileNavToggle` is a real `<button>` with `aria-label`, `aria-expanded`, `aria-controls`
   and a 44px target, replacing a bare unfocusable SVG with an `onClick`.

Still true of the fork, and worth remembering:
- `Navbar` injects a `visible` boolean into children via `React.cloneElement` — any custom
  child must accept and ignore an unexpected `visible` prop.
- `MobileNavMenu` requires an `id` matching `MobileNavToggle`'s `controlsId`. Use the exported
  `useMobileNavId()` hook so the two cannot drift.
- Desktop nav is `lg:flex` / mobile is `lg:hidden` — the breakpoint is **1024px**, not our
  768px motion breakpoint. **Verify the 768px screenshot specifically; it uses the mobile nav.**
- Upstream's `dark` and `gradient` button variants are deliberately not ported. Only
  `primary` and `secondary` exist. Do not re-add a `blue-500 → blue-700` gradient.

**Timeline** — `data: { title: string; content: React.ReactNode }[]`. Maps directly onto the
four booking steps from the canonical content file.

**Tracing Beam** — takes `className` and `children` only. It measures its content height on
mount; if it wraps images, refresh after they load or the beam ends early.

**Pricing Sections / Bento Grid** — the most aggressively styled components in the library and
the ones that land on cream backgrounds. Budget real time for steps 1–4 on these.

**Compare** — for the empty-venue vs. finished-setup slider. Needs equal intrinsic dimensions
on both images or it jumps. Provide a keyboard-operable handle; the default is drag-only.

**Lens** — hover-driven magnification with no touch equivalent. On mobile it must degrade to
a plain image or a tap-to-open lightbox, not a dead zone.

---

## 7. Self-check before shipping any component

- Did I verify this component's props against Context7 rather than assuming?
- Are there any `dark:`, `neutral-*`, `zinc-*`, `purple-*` or `cyan-*` classes left?
- Any radius above 2px I did not deliberately choose? Any resting shadow or glow?
- Is every interactive element a real button or link, focusable, labelled, 44px?
- Does it degrade correctly under `prefers-reduced-motion` — static and *complete*?
- Is this the only signature motion effect in its viewport?
- Are GSAP and Motion both animating this element? (If yes, remove one.)
