# heynesh.com — motion & structure teardown

Runtime-confirmed (loaded libs + computed styles) and source-confirmed (custom bundle
`f1.js`, 111KB, ~123 gsap calls). Purpose: extract the mechanics, rebuild in our own system.

## 1. Stack detected

| Layer | What |
|---|---|
| Smooth scroll | **Lenis 1.1.18** (normalizes wheel, drives ScrollTrigger) |
| Animation | **GSAP 3.15.0** + ScrollTrigger, Flip, SplitText, ScrollToPlugin, ScrollSmoother, MotionPathPlugin, DrawSVGPlugin |
| Carousel | Swiper 11 |
| Base | jQuery + Webflow IX2 |

## 2. Animation vocabulary (counted in the bundle)

- `gsap.set` 66 · `gsap.to` 34 · `gsap.timeline` 9
- Animated properties: **scale 81 · opacity 57 · blur 22 · yPercent 19 · clipPath 4**
- **Zero** width/height/top/left animation → everything is GPU-cheap (transform/opacity/filter)
- `scrub` **5** vs `toggleActions` **3** → most reveals are ONE-SHOT on enter; scrub is
  reserved for a few hero/statement moments
- `SplitText` 8 → text split into lines/words for staggered reveals
- **`position: sticky` ×30** → the backbone of the "rearranging" feel

**Eases:** `power2.out` / `power3.out` (default), `expo.out` (snappy), `back.out` (pop),
`none` (scrubbed).
**Trigger starts:** `top 90%`, `top 92%`, `top 80%` (reveal as element nears viewport bottom),
`top top` (pin), `top bottom`, `left right` (horizontal).
**Ends:** `bottom top`, `50% top`, `top 25%`.

## 3. The "elements rearrange / name flows into a logo" effect — how it ACTUALLY works

It is **not** a morph. Flip is loaded but there are **no `Flip.getState` / `Flip.from` calls** in
the bundle. The perceived migration is a designed illusion built from two cheap parts:

1. **A `position: sticky` left rail.** The sidebar column sticks in the viewport while main
   content scrolls past — that's why the logo, socials and menu "sit there."
2. **The hero wordmark and the rail logo are two separate elements.** As the hero leaves
   (scrubbed scale + blur + fade), the rail's cards stagger in. Because both are the same
   brand mark, same color, and both sit left, the eye stitches them into ONE object moving.

**Takeaway:** continuity of *identity* (same mark/color/position) sells the migration.
No expensive FLIP needed.

## 4. Hero image dissolve

At `scrollY 0`: `filter: none`, `opacity: 1`, `transform: scale(1.001)`.
On scroll it runs a **scrubbed scale + blur + opacity** tween, ending around `bottom top`.
The photo is demoted from *subject* to *ambient background texture* — which is exactly why the
About copy stays readable on top of it. The blur is the key move; a plain fade would look flat.

## 5. Layout & hierarchy

- **Nav links are deliberately small** (~14–16px) and understated so the giant wordmark owns
  the hierarchy. Hierarchy comes from *contrast in scale*, not from everything being big.
- Headline centered, huge; body copy small (~15–16px) on a narrow measure.
- Cards: generous radius, frosted (translucent + `backdrop-filter`), consistent inner padding.
- One dominant element per screen.

## 6. Extractable patterns (apply to ours)

1. **Sticky rail + separate hero mark** = perceived migration, for free.
2. **Scrubbed blur+scale** to demote a hero image to background instead of just fading it.
3. **Staggered line/word reveals** at `top 90%` with `power3.out` — one-shot, not scrubbed.
4. **Animate only transform / opacity / filter.** Never layout properties.
5. **Ration the scrub.** Most things pop in once; only hero + one statement are scroll-linked.
   Over-scrubbing makes a site feel sticky and slow.

## 7. What we build from this

- **Sticky left rail** replacing the hidden navbar: name/logo card + LinkedIn/GitHub socials,
  menu below, CTA at the bottom.
- **Hero scene** gets a scrubbed blur + scale + fade as Work approaches.
- **Journey cards** staggered reveal + drawn SVG connector (DrawSVG equivalent).
