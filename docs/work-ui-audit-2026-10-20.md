# Work UI audit — 20 October 2026

Scope: `/work`, existing shared navigation/footer, project-card structure. Preserve the approved dark Galaxy hero, image tunnel, scroll scene, three desktop columns and native screenshot proportions. Helper and Ponytail guided evidence and minimal implementation; UI/UX Pro Max and Impeccable guided readability, controls and alignment.

## Confirmed problems and changes

- Descriptions were 14.4px and metadata 10.72px. Raised to 16px and 12px.
- Desktop navigation had targets narrower than 44px. Added minimum target dimensions and explicit keyboard focus; added Skip to content on index/detail routes.
- Contact navigated back to Home although a shared local footer exists. It now targets the local contact section.
- Full-resolution index images were served into small frames. Switched index images to Next Image with responsive sizes; original assets remain available for detail views.
- Continuous image motion had no persistent touch/keyboard pause control. Added a native checkbox; reduced-motion users do not see a redundant pause control.
- Card-specific image ratios displaced caption baselines. Equal 4:3 presentation stages now contain the full images without cropping; each image retains its native proportions.
- Oversized titles and inline type/role/status metadata caused crowding and arbitrary wrapping. Smaller display titles, separate metadata lines and native CSS subgrid align the title, description and metadata rows. No new dependency or JS height measurement.
- The shared-image transition now measures the actual screenshot rather than its letterboxed stage, preserving the starting image proportions.

## Verification

- Production build: exit 0; TypeScript succeeds; all 11 routes generated.
- ESLint: exit 0; zero errors, four existing unused-variable warnings in About/LiquidEther.
- `node scripts/check-work-motion.mjs`: PASS arrival, cleanup, gallery restoration, focus, modified clicks, reduced motion and unmount. This test stubs browser boundaries; it does not certify felt animation quality.
- `node scripts/check-lanyard.mjs`: PASS release momentum, fixed anchor, finite physics, damping and static reset.
- Live desktop at 1440px: document width 1440px, three columns. First-row image stages all 302.398px high; title Y positions all 712.797px; description Y positions all 759.906px in the measured viewport.
- Full-image boxes: Lama Fuel 403.188 × 231.625; Thekuwa 258.039 × 302.398; Unitech 403.195 × 252. Their ratios match the supplied dimensions within subpixel rounding, and all fit inside the stage.
- Live mobile at 375px: document width 375px; each card 327px wide at left 24px; cards stack vertically. Menu opens, Escape closes it and returns focus to its summary.
- Native pause checkbox was checked in the browser: computed image animation play state became paused.
- `git diff --check`: clean. Backups and before/after diffs reviewed under `/private/tmp/portfolio-ui-audit.jazvQb/`.

Screenshots: `/private/tmp/portfolio-ui-audit.jazvQb/work-aligned-desktop.png` and `work-aligned-mobile.png`.

Not claimed: exhaustive WCAG compliance, a full cross-browser audit, measured image-network savings, or a site-wide copy rewrite. Copy research and fact checks are in `portfolio-copy-research-2026-10-20.md`.
