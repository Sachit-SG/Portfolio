# Portfolio design memory

Last updated: 2026-09-11

Read this before researching references or changing the portfolio's visual structure. This
file records the decisions that should survive across sessions.

## What consistency means here

Consistency is shared authorship, not visual sameness. The page should feel as if one person
designed every scene, even when the scenes use different compositions.

Keep these invariants across the site:

- the locked red / paper / ink color roles;
- Clash Display, Switzer/Archivo, and Geist Mono in their established roles;
- direct, evidence-first writing;
- one coherent motion vocabulary and interaction physics;
- repeated surface, border, depth, and spacing logic;
- one or two recurring motifs that create continuity;
- proof before unsupported claims.

Allow these to vary when the content benefits:

- grid, editorial spread, horizontal gallery, timeline, deck, or focused carousel;
- section density and amount of whitespace;
- light or dark scene;
- media size and card proportion;
- reveal, scrub, pin, or static presentation;
- playful or restrained emphasis.

The test: if screenshots from different sections have their text and images replaced, they
should still feel made by the same designer, but they should not look like duplicate templates.

## Change boundaries

- **Protected:** the Hero's current concept and composition. Only small, named craft,
  responsive, accessibility, or reliability improvements are allowed unless Sachit explicitly
  reopens it.
- **Tune:** the navigation/SideRail handoff and site-wide motion, spacing, transitions, and
  accessibility. Hero navigation and SideRail navigation must remain synchronized.
- **Redesign:** every section below the Hero may change structure, sequence, and interaction as
  part of one coherent page journey.

The project's PRD and design system outrank any new reference. References donate mechanics,
not identity.

## Current product truth

- Audience: skeptical recruiters and hiring managers for backend, full-stack, and AI workflow
  automation roles.
- Goal: establish quickly that Sachit shipped real production systems alone.
- Strongest evidence: five live systems with working URLs.
- Current page order: Hero → Skills → Work → Statement → Services → Contact.
- Current structural issue: Skills arrives before the strongest proof, while the PRD requires
  proof to register quickly.
- `About.tsx` exists but is not mounted in `src/app/page.tsx`, so the live sequence currently
  lacks a clear personal-story scene.
- The Services close speaks partly like a freelance offer, while the primary product goal is
  landing a job. Decide its role during the below-the-fold redesign.
- Do not invent AI automation outcomes, profile URLs, testimonials, or metrics.

## Reference knowledge already extracted

### HeyNesh

Files: `docs/reference-heynesh.md`, `docs/heynesh-motion-teardown.md`.

Keep the structural lessons: sticky rail, identity handoff, selective pinned/scrubbed scenes,
GPU-cheap transforms, large scale contrast, and one dominant element per viewport. Do not copy
its chartreuse palette, Webflow-agency positioning, pricing, or exact card treatment.

### Zainab Kabira portfolio

Source inspected live: `https://zainabkabira.com/` — Home, About, and Playground on 2026-09-11.

Observed mechanics:

- The home page is paced as distinct scenes: identity hero, quiet thesis, work proof, social
  proof, and direct close.
- The hero keeps static surrounding language while one word/letter area supplies the dominant
  expressive effect.
- A paper-plane/path motif links distant sections, so decoration also carries continuity.
- Work uses asymmetric card proportions to make a grid feel composed rather than generated.
- Testimonials use a stacked deck; Playground uses a centered carousel. Each format follows
  the content instead of forcing every section into one card system.
- About is short: positioning, support, personal images, and contact. It stops when its job is
  finished.
- Shared type roles, color roles, rounded surfaces, illustrations, and elastic feedback create
  consistency even though the section layouts differ.
- The implementation observed HTML/CSS, SVG, and video rather than defaulting to WebGL. The
  homepage exposed many media elements, so its media volume is not a default to copy.

Translate those mechanics into this portfolio's red/paper/ink system. Do not import Zainab's
cream/blue/yellow palette, fonts, cloud/flower/plane illustrations, exact radii, or copy.

### Refero portfolio reference pass

Source inspected on 2026-09-29: ten full-homepage style records and captured homepage views
from Refero Styles: Studio.Design, Contra, destroytoday.com, Maelan Le Meur, PORTO ROCHA,
Nathan Riley, Little Troop, Creative Giants, TWOMUCH.STUDIO, and School.

Primary craft bar: Studio.Design. It sets the hardest relevant standard for this project:
motion-rich and image-led, but still readable as a professional portfolio. Its useful mechanic
is an achromatic interface that lets overlapping, differently scaled project imagery carry
the color and depth.

Adopt:

- make real project imagery the visual proof rather than decorating text claims;
- keep one dominant focal element per viewport and make interface chrome quieter;
- vary image scale and overlap to create depth while keeping text on a stable grid;
- use a fixed or persistent navigation structure to keep long-form work scannable;
- let project facts, role, and outcomes sit next to the visual rather than behind a click.

Adapt:

- destroytoday's text-first case-study rhythm for concise problem, role, build, and result
  narration;
- PORTO ROCHA's fixed index and dense image field into the existing SideRail plus project
  journey;
- School's desktop/widget metaphor only where a real internal tool or automation can be
  demonstrated with authentic UI;
- Contra's image-led directory density into a recruiter-friendly selected-work sequence;
- Studio.Design's overlapping gallery into the locked red/paper/ink system, not its gray skin.

Reject:

- importing any reference palette, font, stock imagery, or canned prompt;
- extreme display-serif scale from Maelan Le Meur, Nathan Riley, or Creative Giants;
- a floating-object canvas from TWOMUCH.STUDIO that hides project evidence;
- a pure gallery with weak explanation, because recruiters must understand ownership and
  production scope quickly;
- fake dashboards or invented automation outcomes to fill the current evidence gap.

The reusable, project-independent method is stored at
`~/.agents/skills/website-system/references/reference-engineering.md`.

## Default below-the-fold hypothesis

This is a starting hypothesis, not a locked design:

1. Protected Hero — identity and positioning.
2. Immediate proof — strongest live work and outcomes.
3. Personal bridge — the designer-to-engineer story in a concise scene.
4. Capability/process — show how the work gets built; reuse evidence from projects.
5. Range or experiments — only if real material exists.
6. Trust — verified quotes, facts, or a compact evidence summary; omit if unsupported.
7. Recruiter-focused contact — role availability, resume, real profiles, and email.

Sachit's section ideas override this hypothesis once supplied. Rebuild the scene map around
their purpose instead of attaching them as extra sections.

## When Sachit says “do a small research”

Run a compact reference pass:

1. Re-read this file and `PRODUCT.md`.
2. Inspect the named reference's rendered desktop and mobile behavior. Inspect implementation
   evidence when available; label inference as inference.
3. Capture only five layers: content architecture, layout, motion/state, visual skin, and
   implementation/performance cost.
4. Produce `adopt / adapt / reject` decisions against this portfolio's constraints.
5. State which protected, tune, or redesign area each finding affects.
6. Add only durable new findings to this file or a focused reference file under `docs/`.
7. Do not edit the Hero or start implementation unless the task explicitly requests it.

Research output should answer: what makes the reference work, why it works, how it maps into
Sachit's identity, what should be rejected, and what concrete section or interaction it may
improve.

# Typography and Work surfaces — 2026-10-20

- Fonts In Use reference: Ana Blagojevic's gallery-like portfolio uses Neue Montreal and BC Steiner: https://fontsinuse.com/uses/45863/ana-blagojevic-website . Relevant for a quiet interface around dominant project imagery.
- Matteo Sacchi's portfolio pairs Founders Grotesk with IBM Plex Mono: https://fontsinuse.com/uses/23632/matteo-sacchi-portfolio . This is evidence for the pairing, not a claim that it uses Plex Sans.
- IBM Plex Sans typeface reference: https://fontsinuse.com/typefaces/48059/ibm-plex-sans . Selected for the reading/interface layer and skill tags using Next's existing font loader. Neue Montreal and Founders remain reference candidates, not downloaded or licensed project assets.
- Preserve Clash Display headings and the protected Hero. Use Plex Sans on Work routes, skill chips and the Approach paragraph rather than replacing the whole identity.
- Work gallery moves to paper; detail pages use paper for explanatory content between ink image and next-project stages. Browser appearance remains to be reviewed; compilation does not certify the composition.

## Imageworks reference adaptation — 2026-10-20

- On `/work`, keep the opening scene ink/dark; the actual project index returns to paper.
- Use a continuously moving perspective field of authentic project screenshots in the hero,
  paused offscreen and in hidden tabs. Follow it with one pinned image transition: the small
  image rises and grows while the text leaves, with both motions overlapping.
- The work hero uses React Bits Galaxy with sparse warm-white/red stars, low glow and slow
  drift. The red particle canvas starts below the hero, brighter over the paper project index
  and restrained over ink. Use the existing CSS/GSAP stack for this sequence.
- The live Imageworks page supplies pacing and image-depth mechanics only; preserve this
  portfolio's red/paper/ink system, Clash Display identity, and factual project descriptions.

## Copy evidence and voice — 2026-10-20

- Ten primary-source portfolio studies and proposed drafts live in
  `docs/portfolio-copy-research-2026-10-20.md`. Use their writing principles, not their claims.
- Project copy should name the artifact, individual contribution, actual status and a real
  technical decision. Present behavior in present tense; describe completed work in past tense.
- Separate demo values and client-business context from Sachit's results. The old evidence
  inventory needs reconciling with current project status before reusing its totals.
- Do not claim shipped AI automation until a concrete shipped example is documented.
  Keep role interest distinct from delivered capability. Do not redesign the protected Hero
  merely to apply these copy recommendations.
