---
name: gsap-motion
description: GSAP animation rules for the Lakeside Party Rental site, adapted from GreenSock's official AI skills — useGSAP with scope and cleanup, contextSafe event handlers, gsap.matchMedia breakpoints that disable all pinning and scrubbing below 768px, the prefers-reduced-motion kill switch, standard easings and durations, and the known ScrollTrigger failure modes. Use whenever writing, editing, debugging or reviewing any animation, scroll effect, pin, parallax, stagger, timeline or transition.
---

# GSAP Motion Rules

Adapted from GreenSock's official agent-targeted guidance. **When you need detail beyond this
file, pull `/greensock/gsap-skills` via Context7 rather than answering from memory** — GSAP's
React integration and ScrollTrigger semantics have changed more than once.

Setup: `gsap`, `@gsap/react`, `ScrollTrigger`. Register once at module level.

```ts
gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ duration: 0.6, ease: 'power2.out' });
```

---

## 1. `useGSAP()` with scope and cleanup — always

Every animation in a React component goes inside `useGSAP()` with a `scope` ref. The hook
reverts everything it created on unmount. **Never call bare `gsap.to()` in a component body,
a `useEffect`, or an event handler.**

```tsx
'use client';
const container = useRef<HTMLDivElement>(null);

const { contextSafe } = useGSAP(() => {
  // selectors are scoped to container — no global leakage
  gsap.from('.hero-title', { y: 50, autoAlpha: 0, duration: 0.8, ease: 'power3.out' });
  gsap.from('.hero-sub',   { y: 30, autoAlpha: 0, duration: 0.6, delay: 0.2 });
}, { scope: container });
```

**Animations created inside event handlers must be wrapped in `contextSafe()`**, or they
escape the context and never get reverted:

```tsx
const onEnter = contextSafe(() => {
  gsap.to('.cta', { scale: 1.02, duration: 0.2 });
});
```

If you add a listener manually inside `useGSAP`, remove it in the returned cleanup function.

Use `autoAlpha` rather than `opacity` for fade-ins — it also toggles `visibility`, so a
faded-out element is removed from the accessibility tree instead of being an invisible
focus trap.

---

## 2. `gsap.matchMedia()` — the breakpoint contract

**All pinning and all scrubbing are disabled below 768px. No exceptions.**

Pinned sections on touch devices fight the browser's native scroll, break momentum scrolling,
and are the single most common way a site like this becomes unusable on a phone. The client's
customers are outdoors in rural Michigan on mid-range Android phones.

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add({
    isDesktop:    '(min-width: 768px)',
    isMobile:     '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (ctx) => {
    const { isDesktop, reduceMotion } = ctx.conditions as Record<string, boolean>;

    if (reduceMotion) return;            // §3 — nothing runs

    if (isDesktop) {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 1,
      });
    } else {
      // mobile: a simple, unpinned, un-scrubbed reveal
      gsap.from('.item', {
        y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.08,
        scrollTrigger: { trigger: section.current, start: 'top 80%' },
      });
    }
  });
}, { scope: container });
```

`matchMedia` reverts its own animations when conditions stop matching — that is what makes a
desktop-to-mobile resize safe. **Never hand-roll a `window.innerWidth` check instead.**

---

## 3. `prefers-reduced-motion` — full kill switch

Reduced motion is not "the same animation, faster". It means **no motion**: elements start and
stay in their final, complete, readable state.

- Add `reduceMotion: '(prefers-reduced-motion: reduce)'` to every `matchMedia` call and return
  early from it.
- Nothing may depend on an animation having run. Anything animated `from` a hidden state must
  be visible in its resting CSS, with GSAP animating *from* elsewhere — never `to` visible.
  If the JS never runs, the page must still read correctly.
- Scroll-triggered reveals become plain static content.
- The 3D hero does not initialize at all. See `r3f-3d-scene`.
- Autoplaying loops (Infinite Moving Cards, Fireworks, Stars) stop entirely, not slow down.

Verify by emulating the setting in DevTools and screenshotting — not by reading the code.

---

## 4. Easings and durations

| Use | Ease | Duration |
|---|---|---|
| Entrance / reveal | `power3.out` | 0.6–0.8s |
| Exit | `power2.in` | 0.3–0.4s |
| Hover / micro-interaction | `power2.out` | 0.15–0.25s |
| Scroll-scrubbed | `none` (linear) | governed by `scrub: 1` |
| Emphasis / arrival | `back.out(1.4)` | 0.5s, sparingly |

Stagger 0.06–0.1s. Above ~8 items, use `stagger: { each: 0.05, from: 'start' }` and cap total
run time near 1s — a 144-chair stagger is not a design, it is a wait.

**No bounce, no elastic.** This is a wedding vendor, not a toy brand.

---

## 5. One signature effect per viewport

A pin, a scrub, a horizontal scroll, a SplitText reveal, an Animate UI background — each is a
"signature effect". **One per viewport.** Everything else in that screen is a plain fade or
nothing at all. Two competing effects read as a template demo, not a designed page.

---

## 6. Known failure modes

**Never animate a pinned element itself.**
ScrollTrigger wraps a pinned element in a `pin-spacer` and controls its transform. Animating
that same element fights the pin and produces jitter. **Pin a wrapper, animate its children.**

**ScrollTrigger measures before images load.**
Every start/end position computed against an unloaded image is wrong, and the page breaks
halfway down. Call `ScrollTrigger.refresh()` after images and fonts settle:

```ts
useGSAP(() => {
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener('load', onLoad);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  return () => window.removeEventListener('load', onLoad);
}, { scope: container });
```

Give every image explicit `width`/`height` (or an aspect-ratio box) so layout is stable
before load. This is the CLS fix and the ScrollTrigger fix at once.

**SplitText before fonts load** splits the fallback font's glyphs, then reflows into the real
font — visible jump, wrong line breaks. **Always `await document.fonts.ready` before
splitting.** Revert the split on cleanup, and set the container's accessible text so screen
readers do not read a stream of single characters — or `aria-hidden` the split copy and keep
an unsplit visually-hidden original.

**ScrollTrigger and Next.js App Router navigation.** Client-side route changes do not
remount everything. `useGSAP` handles component-scoped cleanup, but call
`ScrollTrigger.refresh()` after a route transition completes, and confirm no triggers
survive from the previous page.

**Layout shift from `will-change`.** Do not blanket-apply it. GSAP manages its own
compositing; a permanent `will-change: transform` on many elements costs memory and can
*cause* the jank you added it to prevent.

**Nested ScrollTriggers with `scrub`** inside a pinned parent compound their positions.
If a scrubbed thing lives in a pinned section, use `containerAnimation` rather than nesting.

---

## 7. Self-check before shipping any animation

- Is it inside `useGSAP()` with a `scope` ref?
- Is every handler-created animation wrapped in `contextSafe()`?
- Is every pin and every scrub inside a `matchMedia` `isDesktop` branch?
- Does `prefers-reduced-motion` produce a complete, readable, static page — and did I
  screenshot it to confirm, not just read the code?
- Is `ScrollTrigger.refresh()` called after images and fonts load?
- Am I animating a pinned element instead of its children?
- Is this the only signature effect in the viewport?
- Did I watch it run at 390px and at 1440px, or am I assuming?
