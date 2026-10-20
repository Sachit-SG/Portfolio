# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers screening for backend / full-stack developer and AI-automation roles, remote or Kathmandu-based. First pass is fast and skeptical — they're checking "did this person actually ship, or is this template/AI-generated." They need proof to register in seconds, not paragraphs.

## Product Purpose

Sachit's personal portfolio. It exists to land him a job by proving — not claiming — that he ships production software solo: real live URLs, real client work, no invented metrics.

## Positioning

Full-stack development with a design background: company websites and internal tools using Node.js, PostgreSQL and Next.js. Sachit reports one year as sole developer at Lama Group and two years of design experience before development. AI workflow automation is a role interest and a stated capability, not yet a demonstrated shipped AI product. The current selection includes six projects with mixed development/public-preview status; do not call them six production systems.

## Operating Context

Single long-scroll page, viewed cold by someone who has never met Sachit. Desktop-first review is the primary path (recruiters), mobile is a real secondary path. Motion is the site's whole visual identity — a static or stale treatment on any one element reads as inconsistent with the rest, not neutral.

## Capabilities and Constraints

- Next.js 16 (App Router, TypeScript, Turbopack) + Tailwind v4, GSAP/ScrollTrigger + Lenis smooth-scroll throughout.
- Palette is LOCKED: red accent family (`--ultra` deep red on paper, `--ultra-ink` bright red on dark) over warm paper (`#fdf4f3`) / ink (`#140a0c`), all pairs contrast-measured. Do not introduce a second accent hue.
- Type: Archivo/Switzer (body/sans), Clash Display (display/headlines), Geist Mono (small labels/data).
- Reference grammar (not literal look): heynesh.com — borrowed motion/structure patterns (sticky rail, pinned horizontal scroll, scroll-triggered handoffs), not visual skin.
- SideRail (desktop nav) and Hero's own nav/menu must stay in sync — they've drifted out of sync before and it silently broke navigation to whole sections.
- Hero composition is a protected zone. Preserve its current visual concept and layout; only make small, named craft or reliability improvements unless Sachit explicitly reopens the composition.
- Sections below the hero are open to structural redesign as one coherent page sequence. New references may contribute pacing, layout, and interaction mechanics, but the locked palette, typography, positioning, and hero identity still govern them.

## Brand Commitments

Name: Sachit Ghimire. Voice: direct, evidence-first, no marketing fluff. Name the actual websites, interfaces, APIs and tools rather than promising autonomous systems. Motion-first is a standing identity decision, not a default — every new section should carry deliberate motion, not just the ones someone remembered to animate.

## Evidence on Hand

- Current project selection: Lama Fuel, Thekuwa, Unitech Hydropower, Retail HR, QT Contracts and Lama Group. `src/lib/projects.ts` supplies the visible scope, links and status. Thekuwa and QT are in development; public Retail HR screenshots contain demo data.
- Count shown on-site: six selected projects, derived from the project array, not a claim about production deployments. One year sole development at Lama Group and two years design are user-supplied background facts.
- Screenshot values are not adoption or performance metrics. Client asset capacity and company age are not Sachit's personal results. These figures were removed from project metrics on 2026-10-20.
- Current source includes specific LinkedIn/GitHub profile URLs. Do not replace them with generic platform homepages or invent new profiles.
- AI-automation evidence is currently claim-only for the specific stack tags shown (workflow automation is the one Sachit confirmed he can defend; the site does not yet have a shipped example an interviewer could click into).

## Product Principles

1. Proof over claims — a real live URL beats a described feature every time.
2. Positioning widens (headline, meta, contact line); capability labels stay specific (Services/Skills cards keep exact tech names — "Backend & APIs," not "Systems").
3. Motion is identity, applied consistently — a static element next to animated ones reads as a bug, not a choice.
4. Don't claim what can't survive a follow-up question in an interview.
5. Consistency means shared design grammar, not identical sections. Keep typography roles, color roles, motion physics, interaction character, voice, and recurring motifs coherent while letting each section use the composition best suited to its content.

## Accessibility & Inclusion

No specific standard has been set by Sachit. Existing work has kept contrast AA-compliant (measured, e.g. muted text ≥4.5:1) as a baseline practice, not a stated requirement.
