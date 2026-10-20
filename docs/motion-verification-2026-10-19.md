# Portfolio motion pass — 19 October 2026

## Current scope

The user's later correction supersedes the original tablet-rail and illustrated
motion-window requirements. SideRail is desktop-only: at least 1280px wide and
700px tall. Smaller screens use compact navigation. No new illustration panel
remains in the rail. Skills has one measured LED route around full card borders
on desktop and mobile, with static resolved borders under reduced motion.

## Final portfolio and spacing update

- Home folders → `/work` → `/work/[slug]` is implemented with screenshots, not video.
- Public roster: Lama Fuel, Thekuwa, Unitech Hydropower, Retail HR, QT Contracts,
  Lama Group. Lama Convenience is excluded from cards, folder previews and service copy.
- Sachit confirmed QT Contracts and HR screenshots are demo data cleared for public display.
  They are labeled as demo data. Thekuwa and QT Contracts are labeled in development;
  neither has an invented external live URL.
- Skills now says “What I build.”, uses concise capability copy, links each skill to
  a relevant project preview, and no longer mounts LiquidEther or a water reflection.
- Desktop rail: 280px wide (previously 236), content-sized and vertically centered,
  soft offset island shadows, six 44px navigation rows, menu height 282px.
  Desktop main-content inset is shared at 336px; rail remains absent below 1280px.
- At 1280×720, rail is 641.5px tall, top 39.25px / bottom 680.75px. At taller
  desktop sizes its height stays about 754px rather than stretching to fill the screen.
- Initial Work theme is dark from server markup. On fresh `#work`, active nav is
  Work, Work top is 0px, and no horizontal overflow was measured.
- Gallery and QT Contracts detail were measured at all seven required sizes:
  six gallery cards, main screenshot loaded at 3024px, no overflow at every size.
- All six case-study routes and screenshot assets pass the dependency-free HTTP
  check in `scripts/check-portfolio.mjs`; unknown and excluded slugs return 404.
- Fresh final QA tab console error query returned `[]`.

## Structural repair and beat map

Hero and SideRail previously owned separate timelines for one transition. Work
added another pin. SideRail now coordinates the single Hero pin; Work and Skills
follow in document flow. Lenis and ScrollTrigger share GSAP's ticker.

| Handoff progress | Beat |
| --- | --- |
| 0–.10 | Hero established; rail hidden and inert |
| .10–.27 | Copy releases; scene recedes without a blur tween |
| .24–.36 | Rail shell and identity establish |
| .30–.62 | Navigation labels travel through measured intermediate poses |
| .62–.76 | Proof statistics resolve and digits roll |
| .67–.84 | Skill meter travels and lands |
| .82–.92 | Supporting content settles |
| .92–1 | Rail becomes interactive; hold before pin releases |
| After release | Work heading, folders, controls; then Skills in normal flow |

Source/destination labels use a temporary visual overlay across stacking contexts.
Semantic originals remain in the page. The overlay is removed on unmount. Initial
hash navigation explicitly synchronizes interaction state: a settled rail must not
remain inert merely because initial timeline seeking suppressed an update callback.
Home navigation targets numeric scroll origin, not the pinned Hero's displaced rect.

## Changes made in this pass

- `Hero.tsx`: intro-ready contract; remove competing handoff; pause ambient effects during handoff/offscreen.
- `SideRail.tsx`: coordinated measured handoff, interaction gating, responsive cleanup and active-section tracking.
- `SmoothScroll.tsx`: lifecycle refresh, hash synchronization, correct Home origin, shared ticker cleanup.
- `WorkShowcase.tsx` and its CSS module: remove second pin; ordered arrival; visibility/focus/hover/route-gated idle loop.
- `Nav.tsx`: desktop rail state; compact tablet menu; no tablet SideRail.
- `Skills.tsx`: stable markup; full border routes; project evidence links; no fluid background; 8px corners.
- `lib/projects.ts`, `app/work/page.tsx`, `app/work/[slug]/page.tsx` and shared CSS: six screenshot-led projects, per-project metadata, next-project cycle, accurate status and demo-data captions.
- Three supplied screenshots copied into `public/work/`; original attachments left untouched.
- `globals.css`: responsive rail layout, digit geometry, compact-navigation rules and bounded LED glow.

Pre-existing uncommitted files were preserved. No dependency changes, commits, or PR.
Initial backups are in `/private/tmp/portfolio-motion-backup.kvEhux/`.

## HyperFrames / Remotion

HyperFrames was used only for an isolated 12-second choreography study at
`/private/tmp/portfolio-motion-animatic/`. Snapshots were inspected at established
Hero, release, settled rail, Work and Skills checkpoints. Its check reported no
lint/runtime/contrast failures; layout notices were informational overlaps.
Remotion was not installed. The study predates the user's removal of the rail
illustration panel and is not a pixel-accurate representation of the final UI.
It is not imported by the portfolio.

## Browser evidence

Actual server: PID 37631, port 3187. `lsof` resolved its cwd to this feature worktree.
Branch: `feat/portfolio-work-architecture`.

| Viewport | Navigation | Horizontal overflow |
| --- | --- | --- |
| 390×844 | Compact | 0px |
| 768×1024 | Compact | 0px |
| 1024×768 | Compact | 0px |
| 1280×800 | SideRail | 0px |
| 1440×900 | SideRail | 0px |
| 1512×982 | SideRail | 0px |
| 1728×1117 | SideRail | 0px |

- Fresh desktop `#work`: progress 1.000, rail ready, Work top 0px.
- Reverse Home: scrollY 0, progress 0.000, rail hidden/inert; Hero screenshot inspected.
- Midpoint: scrollY 1097, progress .655, rail not yet interactive; screenshot inspected.
- Work/Skills boundary: Work bottom and Skills top both 0px at the boundary; only the Hero pin remains.
- Folder click reached `/work`; after unmount, 0 overlay elements and 0 pin spacers.
- Folder idle index changed; hover paused it; leaving resumed it during manual browser testing.
- LED: scrollY 3150→3230 changed dash offset −1531.02→−1693.01. Reversing the same 80px restored −1531.02 exactly.
- Rendered SVG contains the measured card-edge turns, not the former straight crossing.
- Browser console error query returned `[]`; existing LiquidEther emits THREE.Clock deprecation warnings.

## Reduced motion

Temporarily enabled macOS Reduce Motion, verified the browser media query was true,
then restored the original off setting. Browser results: 0 pin spacers, all five
Skills cards opacity 1 / transform none, static trail offset 0, folder loop paused,
0 horizontal overflow. No rolling digits or element travel is created in this branch.

## Commands

- `npm ls --depth=0`: exit 0; installed dependency tree verified; package/lock files unchanged.
- `npm run build`: exit 0; TypeScript and static generation passed for `/` and `/work`.
- `npm run lint`: exit 0; 0 errors, 4 existing unused-variable warnings in About and LiquidEther.
- `git diff --check`: exit 0.
- Impeccable detector on changed UI targets: `[]`.

## Limits / remaining work

This is not an exhaustive device or performance certification. Hidden-tab timer
gating and full ScrollTrigger leak counts were inspected in code, not profiled.
Mobile/tablet use the same scroll-position ownership for a vertically connected
card-border route. No live deployments were verified or published. Project pages
contain only the real screenshots available; extra screens and invented outcome
metrics were not added. Existing unused-code lint warnings remain.

## Git status at verification

Modified: AGENTS.md, next.config.ts, globals.css, page.tsx, Contact, Hero,
LineTextReveal, Nav, Services, SideRail, SkillMeters, Skills, SmoothScroll,
Statement and Work. Untracked: bar.md, app/work/, WorkShowcase files, tmp/, and this
report. This includes work that existed before this pass; nothing was broadly staged.

Additional dirty paths: lib/projects.ts, Services, app/work/[slug]/, three new PNGs,
and scripts/check-portfolio.mjs. No commit or broad staging was performed.

QA: http://127.0.0.1:3187/#work and http://127.0.0.1:3187/work — server left running.
