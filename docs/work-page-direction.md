# Work pages — approved direction

Scope: /work and /work/[slug]. Visitor mode: Experience.
Audience: recruiters checking what Sachit built and which part was his.

## Visual and structural contract

- Keep the established red, paper, ink and Clash Display identity. IBM Plex Sans supplies the work-page reading/interface layer; the home Hero is unchanged.
- The all-work route opens on ink. Its centered image-led hero uses a receding, perspective-framed field of real project screenshots; repeated frames are decorative composition, never extra project entries. The field should read as an image tunnel inspired by the Imageworks reference, not as flat, looping strips.
- A short, scroll-scrubbed transition follows: “From first screen to live product” and the small lead screenshot arrive together over ink. The image rises and expands while the text clears in an overlapping handoff. The project list follows in ordinary flow; this is the only pinned/sticky scroll beat on `/work`.
- The project list transitions from the ink scene to paper, with red particles brighter over paper and quieter over ink. Each real project has its screenshot, name, concise blurb, type, role and status where supplied. Project details retain an ink image stage, then switch to paper for contribution and stack before the ink next-project close. Surface changes follow content purpose, not arbitrary alternating stripes.
- Keep compact top navigation on these routes, including mobile; the home rail belongs to home.
- Work hero: “Work, in the wild.” with project screenshots receding toward the center and expanding toward the screen edges, a short supporting line and a clear jump to the list.
- Hero background: React Bits Galaxy, customized to sparse warm-white stars with occasional red, restrained glow, slow drift and soft cursor response. No click warp or intro burst. It is contained to the work hero; the red-dot effect resumes below it.
- Project list: varied screenshot compositions, then name, short description, role and status alongside each.
- Detail: name and purpose, actual screenshot at natural proportions, concise contribution and stack, next project.
- Dashboard interfaces remain legible. Thekuwa keeps its longer composition.
- Show available real imagery. Do not fabricate extra screens, results, or client claims.
- Close with next-project navigation and a direct contact link.

## Motion contract

- One persistent GSAP owner under /work handles image handoffs.
- Gallery and next-project previews become the destination's main screenshot in 550ms.
- Title settles afterward in 280ms; entering content resolves in 300ms.
- Hover feedback uses 180ms. The `/work` image tunnel continuously travels through its perspective corridor using one CSS animation, paused offscreen and in hidden tabs. The ink image scene is scrubbed with GSAP ScrollTrigger and releases before the paper project list. No other section is pinned.
- The all-projects and browser-back navigation restore the gallery's last position.
- Modified clicks retain normal browser behavior.
- Reduced motion uses ordinary navigation and complete, visible content; the tunnel stops and the scrubbed scene becomes a compact static image/content layout.
- Unmount, resize, interrupted navigation and a bounded timeout remove temporary images.
- Native scrolling on these routes avoids the home-only Lenis component's reset behavior.

## Verification on 2026-10-20

- `npm run build` passes, including `/work` and all six project detail routes.
- `npm run lint`: no errors; four existing warnings remain in About and LiquidEther.
- `node scripts/check-work-motion.mjs` passes. It covers arrival, cleanup, scroll restoration, focus, modified clicks, reduced motion and unmount.
- Controlled production-browser checks at 1440×900 and 390×844: the hero and mobile project list render without horizontal clipping; clicking QT Contracts reaches `/work/qt-contracts`; no console or page errors were reported.
- Reduced-motion browser capture shows the static scene and image; no scroll-linked travel is used there.
- Cross-browser behavior and final timing approval remain unverified.

Home follow-up: the existing particle canvas now uses the Skills-to-Contact paper bounds to apply a brighter, more visible red on paper and a quieter red over ink. It remains one canvas.

## Motion correction and Galaxy verification — 2026-10-20

- Cause of the static hero: the preceding art-direction pass removed the ribbon loop without adding tunnel travel. The tunnel now uses a 48-second CSS loop with staggered phases; one card moved 38.8px in a one-second browser sample.
- Cause of the rigid scene: text exited before image growth started. At scrollY 1060 in a 1440×900 viewport, the old text opacity was 0 with a 422px image. The overlapping sequence measured text opacity 0.44 with a 752px image, which was already rising. Explicit zero pixel Y removes the stale 114.8px CSS translation.
- The tunnel reports paused offscreen. Crossing the mobile breakpoint clears the sticky scene and its inline image transform.
- Galaxy comes from the published React Bits code, uses native WebGL, and adds no package. Warm-white/red palette, three layers, DPR cap 1.25, low glow, weak repulsion, no intro or click warp. It pauses offscreen and when the document is hidden; reduced-motion changes are handled dynamically.
- Browser checks: 1440×900 and 390×844. The mobile document width measured exactly 390px. The red-dot canvas reports display:none in the hero and resumes below it. Console warning/error capture returned an empty list.
- Fresh production build, motion regression script, and diff whitespace check pass. Lint has zero errors and the same four existing About/LiquidEther warnings. Galaxy's reduced-motion branch was inspected in source but was not re-emulated in this browser pass.
