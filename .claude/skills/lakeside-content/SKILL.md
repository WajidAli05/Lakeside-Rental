---
name: lakeside-content
description: Content, pricing-data and copy-voice rules for the Lakeside Party Rental site. Points at the canonical source file LAKESIDE-CURRENT-WEBSITE-INFO.md and enforces the single typed pricing config, dance-floor size/finish constraints, wedding-collection "Starting at" phrasing with its scope footnote, the quote-form schema, and the banned-phrase list. Use whenever writing copy, building or editing a pricing component, populating the configurator or quote builder, or naming a package, product, size or inclusion.
---

# Lakeside Content Rules

## 1. The canonical source

**`LAKESIDE-CURRENT-WEBSITE-INFO.md` in the project root is the single source of truth.**

It holds every package, price, product size, inclusion, booking step, wedding collection and
the full tier comparison matrix, transcribed from the client's live site.

**Read it before writing any component that displays a price, a size or an inclusion.
Re-read it whenever you are unsure. Do not answer from memory. Never invent a price, a size
or an inclusion that does not appear there.**

This skill deliberately does **not** restate the pricing. Two copies of a price list drift.
There is one copy, it is that file, and this skill governs how it is used.

### Source validity

Only `lakeside-party-rental.com` and the Lakeside Party Rental LLC Facebook page (Howell,
Michigan) are valid sources. Several unrelated businesses share similar names — Lakeside
Party Rentals of Port Huron MI, Clinton Township MI, Indiana, and San Diego CA. **Never pull
product data from any of them.** If a web search surfaces a price that is not in the
canonical file, it is the wrong company. Discard it.

---

## 2. One typed pricing config

All pricing lives in **one typed config file** — `src/config/pricing.ts` — derived from
`LAKESIDE-CURRENT-WEBSITE-INFO.md`.

**Never hardcode a price, a size, a capacity or an inclusion in JSX.** The configurator, the
quote builder, the package cards, the rental category pages and the wedding collection cards
all read from this one module.

This file is the single place a **non-technical owner** edits prices. Structure and comment
it for that reader:

- Group by the same sections the canonical file uses, in the same order.
- Comment each group with a plain-English note about what it is and what depends on it.
- Prices as integers in cents, or as plain numbers with a documented unit — pick one, state
  it at the top of the file, never mix.
- Every entry carries the unit it is priced in (`each`, `per strand`, `per set`,
  `per linear foot`, `per table`, `quote`).
- Items priced "Quote" or "Price on request" are a **first-class variant in the type**, not a
  `0` or a `null`. The UI must render them as "Quote" and exclude them from any running
  total, while still letting the user add them to the request.

```ts
type Price =
  | { kind: 'fixed'; amount: number; unit: PriceUnit }
  | { kind: 'from';  amount: number; unit: PriceUnit }   // "Starting at"
  | { kind: 'quote' };                                    // no number shown, excluded from totals
```

Anything the quote builder cannot price must be visibly flagged in the running total as
"plus items quoted separately" so the number is never mistaken for a final figure.

---

## 3. Dance floors — the size/finish constraint

Finishes vary by size. From the canonical file:

- **12x12** and **16x16** — White, Black, Checkered
- **20x20** — White, Checkered (**no black**)
- **24x24** and **28x28** — **Checkered only**

**The size/finish selector must disable unavailable combinations, not offer them and fail.**
Model this as data in the pricing config — a finish list per size — and drive the control
from it. A disabled option needs a visible reason on hover/focus, not just a greyed pill,
and disabled state must never be communicated by color alone.

Changing size while an unavailable finish is selected must **snap the finish to a valid one**
and say so, never leave an impossible pair in state.

### The subfloor constraint

> Dance floors require a flat, level surface. Outdoor setups may require a subfloor for
> stability, at additional cost.

State this **on the dance floor product page and again in the configurator at the moment a
floor is placed.** It is an expectation-setting constraint that prevents a bad booking — do
not bury it in a footnote.

---

## 4. Wedding management collections

- Three tiers, **now booking 2026 and 2027**.
- Use **"Starting at"** phrasing **exactly**. These are not fixed prices. Never render a
  wedding tier price as a bare number, and never as "from $X" or "$X+".
- **Every appearance of a tier price carries this footnote, verbatim:**

  > *Final pricing is based on guest count, venue complexity, timeline and overall scope of work.*

- **The décor-setup asterisk on each tier is a contractual scope limit.** Reproduce it in
  full wherever that tier's inclusions are listed — the cards, the comparison matrix, the
  quote builder, and any summary. **Do not summarise them away, shorten them, or move them
  to a single shared footnote.** Each tier's asterisk is specific to that tier.
- Tier colors: **Essentials = Forest Green · Signature = Brand Navy · Masterpiece = Brand Gold.**
- Wedding management is available **exclusively to couples booking rentals with Lakeside.**
  That exclusivity is a selling point, not fine print — state it plainly on the page.

Every tier is built around custom 3D and 2D layouts (1, up to 3, up to 7). That is the
commercial justification for the layout configurator — **the configurator should link
directly to these collections**, and the collections should reference the configurator.

---

## 5. The quote form schema

**Booking Step 1's field list is the exact schema for the quote form. Do not add or drop fields.**

| Field | Notes |
|---|---|
| Event type | graduation party, wedding, etc. |
| Event date | |
| Event location | full address |
| Guest count | |
| Items of interest | the quote builder populates this |
| Name | |
| Phone number | |
| Email | |

No newsletter opt-in, no "how did you hear about us", no budget-range dropdown. The client
asked for these eight things. Adding fields costs conversions; dropping them costs the owners
a phone call to fill the gap.

The four booking steps map onto the Aceternity `Timeline` component, which takes
`data: { title: string; content: React.ReactNode }[]`.

---

## 6. Always-on offers vs. seasonal promos

Surface permanently:

- **10% military discount** for veterans and active service members. This is personally
  meaningful to the owners — family members actively serving and who have served. Write it
  with that weight, not as a coupon.
- **Lake Chemung discount** — events within half a mile of Lake Chemung qualify.

**Seasonal delivery promotions are CMS-editable promo slots, never hardcoded.** Build the
slot with an empty/absent state that renders nothing and shifts no layout. A stale
"MAY ONLY!" banner in August is worse than no banner.

---

## 7. The availability checker — honest by construction

**It is JSON/CMS-backed, not a live booking system, and it must never pretend otherwise.**

- Data: `src/data/blocked-dates.json`, maintained by the owners.
- Logic and required copy: `src/lib/availability.ts`.
- **Exceptions only.** A date with no entry is Available. Asking the owners to maintain a
  list of *open* dates guarantees the file goes stale; asking them to add the handful of days
  they book is maintainable. Never invert this.

**Three honest states, and no fourth:**

| State | Meaning |
|---|---|
| **Available** | No entry for that date. |
| **Limited** | Some inventory left. Carries `remainingGuestCapacity` and usually a note. |
| **Booked** | Nothing left. **Must offer the next three open dates.** |

A **Limited** date requested for a party larger than `remainingGuestCapacity` resolves to
**Booked** and offers alternatives. Inviting a request that cannot be filled is worse than
saying no. Alternatives are always fully-available dates — never Limited ones.

**Guest count cross-checks package capacity**, using capacities read from
`src/config/pricing.ts`. **Never duplicate capacity numbers into the availability module** —
that would break the single-source rule in §2. Capacity is passed in.

A guest count above the largest single package is a **capacity note, not an availability
answer.** The date may be perfectly open. Never conflate the two in the UI.

**Required copy on every rendered result — both lines, every time:**

> Availability current as of {lastUpdated}.
> We confirm every date within 24 hours.

Use the strings in `AVAILABILITY_COPY`; do not re-word them per component. `lastUpdated`
comes from the JSON file and is shown verbatim. If it is ever missing, render the checker in
an unavailable state rather than an undated claim.

**Never** show a spinner implying a live lookup, a "real-time" label, a seat/inventory
counter, or a countdown. The checker's credibility is the product.

---

## 8. Copy voice

Warm, confident, specific, local. Short sentences. Lead with numbers and concrete benefits.
Write like a capable neighbour who runs a tight business, not a marketing department.

- "Seats 80 under a 20x40 high peak tent. $775, set up the day before." — good.
- "Transform your celebration into something extraordinary." — delete.

Prefer the concrete noun to the abstract one: *tent*, *chairs*, *dance floor*, *Saturday*,
*Howell* — not *experience*, *solution*, *offering*, *space*.

Their genuine differentiator is **high peak frame tents with no center poles** — open floor,
nothing blocking sightlines, dance floor anywhere you want it. Use it; it is a real,
checkable fact about the product, not a claim.

### Banned phrases — never generate these

`elevate your experience` · `unforgettable memories` · `we've got you covered` · `nestled` ·
`take your event to the next level` · `seamless` · `curated`

**The client's own dance floor copy uses "elevated" and "elevates". Do not carry those
across.** Rewrite in the voice above. This is the one place where deviating from their live
site's wording is correct.

---

## 9. Self-check before shipping any content or pricing component

- Did I read `LAKESIDE-CURRENT-WEBSITE-INFO.md` for every number on this screen?
- Does every price here come from `src/config/pricing.ts`, with zero hardcoded values?
- Does every wedding tier price say "Starting at" and carry the scope footnote?
- Is each tier's own décor asterisk reproduced in full?
- Does the dance floor selector disable — not merely hide — invalid size/finish pairs?
- Does the quote form have exactly the eight Step 1 fields?
- Any banned phrase, including "elevated"?
- Any placeholder text, lorem ipsum, or invented testimonial left in?
- Does every availability result carry both the freshness line and the 24-hour line?
- Does a Booked date actually offer three fully-open alternatives?
