---
name: r3f-3d-scene
description: react-three-fiber and three.js rules for the Lakeside Party Rental 3D tent hero and the 2D/3D event layout configurator — instanced meshes for repeated furniture, draco-compressed low-poly assets, lazy loading with next/dynamic, render-loop pausing, disposal on unmount, mobile and reduced-motion fallbacks, the parametric high-peak tent geometry, and the orthographic top-view 2D floor-plan toggle. Use whenever touching 3D, the canvas, geometry, materials, GLB assets, the configurator scene, or anything under react-three-fiber or drei.
---

# 3D Scene Rules — r3f

Two 3D surfaces exist in this project:

1. **The hero** — a rendered high-peak tent at dusk with volumetric string lights.
2. **The layout configurator** — the mandatory differentiator. The customer builds a tent
   layout in the browser, in 3D, and flips it to a 2D floor plan.

The client sells custom 3D layouts by hand — 1, up to 3, and up to 7 across the three wedding
collections. The configurator is the browser version of a thing they already charge for. It
has to work, on a phone, over rural cellular.

---

## 1. Performance contract

**Instanced meshes for all repeated furniture. Non-negotiable.**
The 20x80 package is 144 chairs and 18 tables. **144 chairs must not be 144 draw calls.**
One `InstancedMesh` per furniture type, with per-instance matrices. Budget: **under 60 draw
calls** for a fully populated layout.

- Use `<Instances>` / `<Instance>` from drei, or a raw `InstancedMesh` with
  `instanceMatrix.needsUpdate = true` after a batch write.
- Never `.map()` a mesh component over an array of chairs.
- Update matrices in a batch on state change, **not per frame** in `useFrame`.

**Assets**
- Low-poly, **draco-compressed GLB**. Chair under ~500 triangles; table under ~300. The
  customer is judging a layout, not inspecting upholstery.
- **One shared texture atlas** across furniture so instanced materials batch.
- Target the whole 3D payload, all assets combined, under **1.5 MB transferred**.
- Preload only what the initial view needs; fetch the rest on demand.

**Canvas settings**

```tsx
<Canvas
  dpr={[1, 2]}                       // never uncapped on a 3x phone
  gl={{ antialias: true, powerPreference: 'high-performance' }}
  frameloop={active ? 'always' : 'demand'}
  camera={{ position: [0, 12, 24], fov: 45 }}
/>
```

**Pause the render loop when off-screen.** An IntersectionObserver on the canvas wrapper
switches `frameloop` to `'demand'` (or `'never'`) when the section leaves the viewport. A
3D scene rendering at 60fps behind a footer is a battery bug.

For the configurator, `frameloop="demand"` plus an explicit `invalidate()` on state change is
usually correct — the scene is static between user actions. Only go to `'always'` while the
camera is actively being orbited or something is genuinely animating.

**Dispose on unmount.** Geometries, materials and textures created imperatively must be
`.dispose()`d. Anything from `useLoader`/`useGLTF` is cached by r3f — do not dispose those,
use `useGLTF.preload` / `clear` deliberately.

---

## 2. Loading and fallback ladder

```tsx
const TentScene = dynamic(() => import('./TentScene'), {
  ssr: false,
  loading: () => <StaticHeroRender />,
});
```

**`ssr: false` always.** three.js does not server-render and will crash the build if you try.

The ladder, in order:

1. **A static optimized render ships first** and is the LCP element — real `<Image>` with
   `priority`, explicit dimensions, AVIF/WebP. The page is complete and beautiful with zero
   JavaScript.
2. **3D hydrates after** and cross-fades over the static image. Never before interactive.
3. **Mobile** (under 768px): a simplified scene — fewer lights, no shadows, no post-processing,
   reduced instance counts for background dressing — or the static render only if the device
   fails the capability check.
4. **`prefers-reduced-motion`:** the canvas never initializes. The static render is the final
   state. Auto-orbit and any idle camera drift are off everywhere it is set.
5. **No WebGL / context lost:** catch it, render the static image, tell the user plainly.
   Listen for `webglcontextlost` — mobile browsers do kill contexts under memory pressure,
   and a dead black rectangle is the worst possible outcome.

**The configurator needs a real non-3D path**, not just a placeholder. Where 3D is unavailable,
the **2D top-down plan (§4) becomes the primary interface.** It is plain DOM/SVG, works
everywhere, and is arguably the more useful view for planning anyway. Build 2D first, and
treat 3D as the view layer on top of the same layout state.

---

## 3. The parametric high-peak tent

The client's stated specialty is **high peak frame tents — no center poles.** The geometry
must *prove* that claim: an unobstructed floor, visible from any camera angle.

Build the tent **parametrically**, not as five separate models. One function takes width,
length and peak count and rebuilds the geometry across the five package sizes:

**20x20 · 20x30 · 20x40 · 20x60 · 20x80**

- Perimeter frame legs only. **Zero interior vertical supports.** If a center pole appears in
  any render at any size, the model is wrong and the sales claim is contradicted on screen.
- Peaks repeat along the length — roughly one per 20ft bay — with fabric catenary sag between
  them. The silhouette is the product; get the peak-to-eave ratio right.
- Fabric: a single-sided translucent white material with mild subsurface-ish falloff so it
  glows when lit from beneath at dusk. Not a flat white `MeshBasicMaterial`.
- Sidewalls are a toggle, since they are a real rentable item.

**String lights** run peak to peak. Use an emissive material plus a cheap bloom, or sprite
billboards — **not** a real light source per bulb. Soft Gold `#E3C97A` is the bulb color.
Two or three actual lights in the whole scene, maximum.

Shadows: one directional light casting, `shadow-mapSize` capped at 1024, tight shadow camera
bounds. Everything else unlit-shadowed. Disable shadows entirely on mobile.

Dusk look comes from the environment and fog, not from post-processing stacks. Background
Midnight Navy `#0B1730`.

---

## 4. The 2D / 3D toggle

One layout state. Two renderers over it.

**3D view** — perspective camera, orbit constrained (no going below the ground plane, clamped
polar angle, clamped zoom).

**2D floor plan view** — switch to an **orthographic camera looking straight down**, snap to a
top-down position, and animate the transition (~0.6s, `power2.inOut`) so the user keeps their
bearings. In 2D:

- Dimension labels and a foot-based grid become visible.
- Furniture renders as clean top-down silhouettes.
- It must be printable / screenshot-able — this is what a customer sends to their planner,
  and it is exactly the deliverable the wedding collections sell.

This mirrors the client's own product: every collection includes "Custom 3D Layouts +
Matching 2D Layouts". **Link the configurator to the wedding collections and back.**

Constraints to enforce in the layout state, not just visually:

- Furniture cannot be placed outside the tent footprint.
- Dance floors snap to the foot grid and cannot overlap tables.
- When a dance floor is placed, surface the flat-level-surface and possible-subfloor-cost
  note — required by `lakeside-content`.
- Every placed item maps to a priced line in `src/config/pricing.ts` and feeds the running
  total. The configurator and the quote builder share one state source.

---

## 5. Accessibility

A WebGL canvas is opaque to assistive technology. It cannot be the only way to do anything.

- The canvas gets a meaningful `aria-label` and, where feasible, `role="img"` with a text
  description of the current layout.
- **Every configurator action has a DOM control** — add/remove/rotate via real buttons and
  number inputs, with the canvas as direct-manipulation *enhancement*, not the sole interface.
- The layout is mirrored as a **live text summary** ("20x40 tent, 10 tables, 80 chairs,
  16x16 checkered dance floor") in an `aria-live="polite"` region. That summary is also what
  goes into the quote.
- Keyboard: tab to a placed item, arrow keys to nudge, Delete to remove.
- Never convey state by color alone in the 2D plan.

---

## 6. Self-check before shipping any 3D work

- Are all repeated items instanced? What is the actual draw call count — measured, not assumed?
- Is the static render the LCP element, with 3D strictly after hydration?
- Does the render loop stop when the canvas is off-screen?
- Is `ssr: false` set on the dynamic import?
- Is there a center pole in any tent size? (There must not be.)
- Does it fall back correctly with reduced motion, on mobile, and with WebGL unavailable?
- Can the whole configurator be driven from the keyboard, without the canvas?
- Measured frame rate on a throttled mobile profile — what number?
