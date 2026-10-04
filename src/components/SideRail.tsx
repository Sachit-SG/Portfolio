"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Phone, Mail } from "lucide-react";
import SkillMeters from "./SkillMeters";
import EmailTab from "./EmailTab";

gsap.registerPlugin(ScrollTrigger);

// "Approach" links to Statement.tsx ("How I work") — a real section that
// already exists on the page but had no nav entry at all. Filling that gap
// is what restores 6 items, not padding the list with something invented.
const menu = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

// TODO: swap for Sachit's real profile URLs.
const socials = [
  { label: "in", title: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "gh", title: "GitHub", href: "https://github.com/" },
];

const stats = [
  { value: 5, suffix: "", label: "Live\nsystems" },
  { value: 1, suffix: "yr", label: "Sole dev\nat Lama" },
  { value: 2, suffix: "yrs", label: "Design\nbefore dev" },
];

export default function SideRail() {
  const scope = useRef<HTMLElement>(null);

  // The rail is driven by the SAME scroll range as the hero's pin, so the cards
  // grow into place while the hero's wordmark/nav/stats are still flying toward
  // them. Previously this popped in at an unrelated scrollY threshold, long
  // after the hero was gone — which is what made it read as two separate designs
  // instead of one continuous handoff.
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    // Safety: if the timeline never gets built (no GSAP, JS error, throttled
    // clock), reveal the rail anyway rather than stranding it invisible.
    // Only fires if the scroll timeline was never built. It must NOT fire just
    // because the cards are hidden — at scroll 0 they are *supposed* to be
    // hidden, and revealing them there would defeat the whole handoff.
    let built = false;
    const safety = setTimeout(() => {
      if (built) return;
      gsap.set(el, { opacity: 1 });
      gsap.set(
        el.querySelectorAll(
          "[data-rail-card], [data-rail-link], [data-rail-surface], [data-rail-content]",
        ),
        { clearProps: "opacity,transform" },
      );
      el.style.pointerEvents = "auto";
    }, 3000);

    const mm = gsap.matchMedia();
    // The rail markup commits before <main>, so #top (the hero) may not exist
    // yet when this effect runs — ScrollTrigger then builds against a null
    // trigger and the whole handoff silently does nothing. Wait for it.
    let raf = 0;
    // Resolve the actual node once, up front — a string selector gets
    // re-queried by ScrollTrigger internally, which is what raced against
    // Hero's mount and warned "Element not found: #top". A captured
    // element reference can't go stale that way.
    const whenHeroExists = (go: (hero: HTMLElement) => void) => {
      const hero = document.querySelector<HTMLElement>("#top");
      if (hero) return go(hero);
      raf = requestAnimationFrame(() => whenHeroExists(go));
    };

    whenHeroExists((hero) => {
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          built = true;
          let measure = () => {};
          const ctx = gsap.context(() => {
            gsap.set(el, { opacity: 1 });
            const heroLinks = Array.from(
              document.querySelectorAll<HTMLElement>("[data-hero-nav] a"),
            );
            const railLinks = Array.from(
              el.querySelectorAll<HTMLElement>("[data-rail-link]"),
            );
            const deltas = railLinks.map(() => ({ x: 0, y: 0 }));
            // HeyNesh, measured on the live menu: each horizontal hero label
            // travels into its side slot. Home lands at 30% of the hero, each
            // next row 1% later. The row surface scales across the last 2%,
            // and the word scales across the last 1% into 1% after landing.
            const travelStart = [0.07, 0.06, 0.04, 0.05, 0.03, 0.02];
            const travelEnd = [0.3, 0.31, 0.32, 0.33, 0.34, 0.35];
            const measureTravel = () => {
              heroLinks.forEach((a) => gsap.set(a, { x: 0, y: 0 }));
              heroLinks.forEach((a, i) => {
                const rail = railLinks[i];
                if (!rail) return;
                const from = a.getBoundingClientRect();
                const to = rail.getBoundingClientRect();
                deltas[i].x = to.left + 16 - from.left;
                deltas[i].y =
                  to.top + to.height / 2 - (from.top + from.height / 2);
              });
            };
            ScrollTrigger.addEventListener("refreshInit", measureTravel);
            measure = measureTravel;
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                // Must match Hero's pin end and the 2.15s pad at the bottom.
                end: "+=190%",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  // First label lands near 30% of the pin.
                  el.style.pointerEvents = self.progress > 0.32 ? "auto" : "none";
                },
              },
            });
            // Words travel first. Each section's box then grows from small
            // to full size across the scroll. The type stays at its final
            // size and just sits. A full-size fade is what read as a zap.
            // Scrubbed progress is linear (timing table: rotation/progress = linear).
            // Card entrance starts at 95% scale, never from 0. Stagger is the
            // standard 50-80ms band, mapped onto this 2.15 clock.
            gsap.set("[data-rail-surface]", {
              scale: 0.95,
              opacity: 0,
              transformOrigin: "left center",
            });
            gsap.set("[data-rail-content]", { opacity: 0 });
            tl.to(
              "[data-rail-surface]",
              {
                scale: 1,
                opacity: 1,
                stagger: 0.04,
                duration: 0.5,
                ease: "none",
              },
              0.62,
            );
            tl.to(
              "[data-rail-content]",
              {
                opacity: 1,
                stagger: 0.04,
                duration: 0.5,
                ease: "none",
              },
              0.62,
            );
            gsap.set("[data-rail-link-bg]", {
              opacity: 0,
              scaleX: 0,
              transformOrigin: "left center",
            });
            gsap.set("[data-rail-link-label]", { opacity: 0, scale: 1 });
            measureTravel();
            heroLinks.forEach((heroA, i) => {
              const rail = railLinks[i];
              if (!rail) return;
              const startPct = travelStart[i] ?? 0.02;
              const endPct = travelEnd[i] ?? 0.35;
              const start = startPct * 2.15;
              const end = endPct * 2.15;
              const bg = rail.querySelector("[data-rail-link-bg]");
              const label = rail.querySelector("[data-rail-link-label]");
              tl.to(
                heroA,
                {
                  x: () => deltas[i].x,
                  y: () => deltas[i].y,
                  ease: "none",
                  duration: end - start,
                },
                start,
              );
              tl.to(
                heroA,
                { autoAlpha: 0, ease: "none", duration: 0.02 * 2.15 },
                (endPct - 0.02) * 2.15,
              );
              if (bg) {
                tl.to(
                  bg,
                  {
                    opacity: 1,
                    scaleX: 1,
                    ease: "none",
                    duration: 0.02 * 2.15,
                  },
                  (endPct - 0.02) * 2.15,
                );
              }
              if (label) {
                tl.to(
                  label,
                  {
                    opacity: 1,
                    ease: "none",
                    duration: 0.02 * 2.15,
                  },
                  (endPct - 0.01) * 2.15,
                );
              }
            });
            tl.set({}, {}, 2.15);
          }, scope);
          return () => {
            ScrollTrigger.removeEventListener("refreshInit", measure);
            ctx.revert();
          };
        },
      );
      // Reduced motion / below lg: no choreography, just present.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        built = true;
        gsap.set(el.querySelectorAll("[data-rail-surface]"), {
          opacity: 1,
          scale: 1,
        });
        gsap.set(el.querySelectorAll("[data-rail-content], [data-rail-link]"), {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        });
        gsap.set(el, { opacity: 0 });
        const reducedTrigger = ScrollTrigger.create({
          trigger: hero,
          start: "bottom top",
          onEnter: () => {
            gsap.set(el, { opacity: 1 });
            el.style.pointerEvents = "auto";
          },
          onLeaveBack: () => {
            gsap.set(el, { opacity: 0 });
            el.style.pointerEvents = "none";
          },
        });
        return () => reducedTrigger.kill();
      });
    });

    return () => {
      clearTimeout(safety);
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, []);

  // Adaptive theme: flip the rail dark/light based on the section behind it, so
  // its translucent panels never turn muddy and drop text below readable
  // contrast (the problem over the dark hero). Probes the section at the rail's
  // vertical centre; [data-dark] sections (hero, statement, contact) → dark.
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const darks = Array.from(document.querySelectorAll<HTMLElement>("[data-dark]"));
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-rail-card]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      // Each card decides its own theme from ITS OWN centre — so a card only
      // flips once it is actually in contact with the dark section, and the rail
      // recolours card-by-card in sequence, not all at once.
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const dark = darks.some((s) => {
          const sr = s.getBoundingClientRect();
          return sr.top <= cy && sr.bottom >= cy;
        });
        card.dataset.behind = dark ? "dark" : "light";
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside
      ref={scope}
      aria-label="Site navigation"
      data-rail-root
      className="pointer-events-none fixed bottom-4 left-6 top-4 z-50 hidden w-[332px] flex-col gap-2 lg:flex"
    >
      {/* Name-as-logo + socials. The surface grows. The type does not. */}
      <div data-rail-card className="relative">
        <div
          data-rail-surface
          className="pointer-events-none absolute inset-0 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card)]"
        />
        <div data-rail-content className="relative flex items-center justify-between px-4 py-3">
          <a
            href="#top"
            data-rail-logo
            className="rounded-[6px] bg-signal px-3.5 py-2 text-lg font-semibold tracking-tight text-white"
          >
            SACHIT<sup className="text-[9px]">®</sup>
          </a>
          <div className="flex gap-1.5">
            {socials.map((s) => (
              <a
                key={s.title}
                href={s.href}
                title={s.title}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-[6px] bg-[var(--rail-fg)] font-mono text-[11px] font-bold lowercase text-[var(--rail-card)] transition-colors hover:bg-signal"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div data-rail-card data-rail-stats className="relative">
        <div
          data-rail-surface
          className="pointer-events-none absolute inset-0 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)]"
        />
        <div data-rail-content className="relative grid grid-cols-3 gap-1 px-3 py-2.5 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-bold leading-none text-ultra-bright">
                <span data-count={s.value}>{s.value}</span>
                {s.suffix}
              </div>
              <div className="mt-1 whitespace-pre-line text-[10px] leading-tight text-[var(--rail-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu is its own section. Each row is a hairline, then the word.
          Hover turns the word red. */}
      <nav data-rail-card data-rail-menu className="relative flex flex-1 flex-col">
        <div
          data-rail-surface
          className="pointer-events-none absolute inset-0 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card)]"
        />
        <div className="relative flex flex-1 flex-col justify-between px-3 py-3">
          {menu.map((m, i) => (
            <a
              key={m.label}
              href={m.href}
              data-rail-link
              className="group relative block px-4 py-3 text-lg font-semibold"
            >
              {i > 0 && (
                <span
                  data-rail-link-bg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-[var(--rail-border)]"
                />
              )}
              <span
                data-rail-link-label
                className="block text-[var(--rail-fg)] transition-colors duration-150 group-hover:text-ultra-bright"
              >
                {m.label}
              </span>
            </a>
          ))}
        </div>
      </nav>

      <div data-rail-card data-rail-charts className="relative">
        <div
          data-rail-surface
          className="pointer-events-none absolute inset-0 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)]"
        />
        <div data-rail-content className="relative px-3.5 py-3">
          <SkillMeters tone="auto" compact />
        </div>
      </div>

      <div data-rail-card className="relative">
        <div
          data-rail-surface
          className="pointer-events-none absolute inset-0 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)]"
        />
        <div data-rail-content className="relative">
          <EmailTab tone="auto" className="px-3.5 py-3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href="tel:+9779845913643"
          className="relative flex items-center justify-center px-3 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <span data-rail-surface className="absolute inset-0 rounded-card bg-signal" />
          <span data-rail-content className="relative flex items-center gap-2">
            <Phone className="h-4 w-4" strokeWidth={2.4} />
            Contact me
          </span>
        </a>
        <a
          href="mailto:sachitghimire2@gmail.com"
          className="group relative flex items-center justify-center px-3 py-3.5 text-sm font-bold text-signal"
        >
          <span
            data-rail-surface
            className="absolute inset-0 rounded-card border border-signal/50 transition-colors group-hover:bg-signal"
          />
          <span data-rail-content className="relative flex items-center gap-2 transition-colors group-hover:text-white">
            <Mail className="h-4 w-4" strokeWidth={2.4} />
            Get in touch
          </span>
        </a>
      </div>
    </aside>
  );
}
