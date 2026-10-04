# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers screening for backend / full-stack developer and AI-automation roles, remote or Kathmandu-based. First pass is fast and skeptical — they're checking "did this person actually ship, or is this template/AI-generated." They need proof to register in seconds, not paragraphs.

## Product Purpose

Sachit's personal portfolio. It exists to land him a job by proving — not claiming — that he ships production software solo: real live URLs, real client work, no invented metrics.

## Positioning

Not a generalist "full-stack developer" portfolio. The claim is narrower and backed by evidence: sole developer on 5 live production systems (Node/Postgres/Next.js), 2 years of design experience before writing code (so the design and the engineering are both his, not outsourced), and — as of Aug 2026 — a widened claim into AI automation (workflow automation specifically; the broader "AI-first" language was deliberately cut because he couldn't defend it in an interview yet).

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

Name: Sachit Ghimire. Voice: direct, evidence-first, no marketing fluff ("I build systems that run themselves" over generic "passionate developer" language). Motion-first is a standing identity decision, not a default — every new section should carry deliberate motion, not just the ones someone remembered to animate.

## Evidence on Hand

- 5 real, live case studies with working URLs: Lama Fuel (la-ma-fuel.vercel.app), Lama Convenience (lamaconvenience.org), Unitech Hydropower (unitechhydropower.com — 20.8MW, richest real data), Retail HR (hr-management-system-azure.vercel.app — 341 employees), Lama Group (lama.group).
- Real stats used on-site: 5 live systems, 1yr sole dev at Lama Group, 2yrs design before dev.
- **Gap, not yet filled — do not fabricate:** LinkedIn and GitHub links in `SideRail.tsx` are still placeholders (`linkedin.com/`, `github.com/`), explicitly marked `TODO: swap for Sachit's real profile URLs`. Treat as absent until he supplies the real ones.
- AI-automation evidence is currently claim-only for the specific stack tags shown (workflow automation is the one Sachit confirmed he can defend; the site does not yet have a shipped example an interviewer could click into).

## Product Principles

1. Proof over claims — a real live URL beats a described feature every time.
2. Positioning widens (headline, meta, contact line); capability labels stay specific (Services/Skills cards keep exact tech names — "Backend & APIs," not "Systems").
3. Motion is identity, applied consistently — a static element next to animated ones reads as a bug, not a choice.
4. Don't claim what can't survive a follow-up question in an interview.
5. Consistency means shared design grammar, not identical sections. Keep typography roles, color roles, motion physics, interaction character, voice, and recurring motifs coherent while letting each section use the composition best suited to its content.

## Accessibility & Inclusion

No specific standard has been set by Sachit. Existing work has kept contrast AA-compliant (measured, e.g. muted text ≥4.5:1) as a baseline practice, not a stated requirement.
