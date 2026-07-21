# Reference study — heynesh.com (NESH® / Nenad Popadic)

The structural + motion reference for this portfolio. We borrow the **grammar**
(how sections move and stack), not the look — different palette, different content,
honest full-stack framing instead of a Webflow-agency pitch.

## Tech engine
- **Lenis smooth-scroll** across the whole page (intercepts the wheel — this is why
  remote scroll-wheel hangs; drive with `lenis.scrollTo`).
- Page is **~14× viewport tall** (12,180px). Long, deliberate scroll journey.
- Sections are **GSAP ScrollTrigger**: several are **pinned + scrubbed** (animation
  progress tied to scroll position, not time). Jumping scroll instantly shows
  mid-animation empty states — confirms scrub.

## Section-by-section

### 1. Preloader
Full warm-cream screen → content reveals (letters + photo settle in).

### 2. Hero — depth compositing
- Giant **"NESH"** wordmark, chartreuse yellow, spanning full width.
- **Cutout photo of the person sits IN FRONT of the letters** (masked PNG over type) —
  the single strongest move. Creates real depth.
- **Frosted-glass cards** float around the photo (dark translucent + backdrop-blur):
  "80+ Projects" (Webflow mark), "7+ Years", and a right-side list
  Creative / Reliable / Strategist / Builder / Efficient with yellow icons.
- Split nav sits on the wordmark baseline: HOME | ABOUT ME | PROJECTS (left) …
  WHAT YOU GET | SERVICES | CLIENTS | FAQ (right).
- Headline "Webflow, Applied Differently." bottom-center + yellow "Book a Call" CTA.
- On scroll: parallax — photo and letters move at different rates.

### 3. Sticky sidebar (morphs from nav)
After hero, the nav condenses into a **floating left sidebar of rounded cards** that
persists through the mid-page: logo+socials card · stats card · icon nav menu
(HOME/ABOUT/PROJECTS/…) · client-logo marquee · copy-email field · Book a Call.

### 4. About Me (& My Journey) — animated timeline
- "START SMALL GROW BIG" outline pill → giant heading.
- Vertical **timeline**: milestone cards ('19 '20 '21 …) connected by a **curved black
  SVG path with yellow dot nodes**. The **path draws on scroll** (strokeDashoffset
  scrub). Cards alternate sides, fade+slide in on enter.
- Huge **blurred silhouette/orb** behind everything for depth.
- Year numbers = big yellow.

### 5. Selected Work — horizontal scroll (background flips to BLACK)
- Bg flips cream → black. "SELECTED WORK / Built in Webflow, Made to Perform".
- **Pinned horizontal gallery**: vertical scroll drives horizontal translation of the
  card track (classic GSAP horizontal scroll).
- Cards: number badge (01…), tag pills (Components/GSAP/SEO), a **device mockup floating
  above a themed card bg**, name + description, yellow circular arrow button.

### 6. What You Get? — scrubbed text fill
- Back to cream. GIANT "What You Get?" display type + "CAPABILITIES OVERVIEW" pill.
- Big paragraph with **inline yellow icon chips embedded in the text flow**.
- Text does a **word-by-word color reveal on scroll** (ghost/faded words fill to solid
  as you scroll — visible at the section bottom).

### 7. Services (Solutions That Deliver)
- 3 cards: Ongoing Support / Starter Build / Custom Project — icon, price, checklist.
- NOTE FOR OURS: **drop the prices.** We list capabilities derived from real projects.

### 8. Clients / FAQ / Footer (below the fold, not captured)

## The moves worth stealing (rebuilt in our own identity)
1. **Depth compositing** — subject/element in front of giant type.
2. **Frosted-glass floating info cards.**
3. **Morphing nav → sticky card sidebar.**
4. **SVG-path-draw timeline** for the journey.
5. **Pinned horizontal work gallery** with floating device mockups (→ our hover
   mockup clips from Higgsfield).
6. **Scrubbed word-by-word text reveal** for a statement section.
7. **Alternating cream/black section backgrounds** for rhythm.
8. **Big confident display type + one accent color.**

## What we deliberately DON'T copy
- The chartreuse-on-cream palette (we pick our own — see design tokens).
- Webflow-agency positioning / pricing tiers.
- The exact card copy, icons, mascot-style personality.
Litmus test: with the logo covered, it must NOT read as "a NESH clone."
