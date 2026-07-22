"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SkillCharts from "./SkillCharts";

const menu = [
  { label: "Home", href: "#top" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
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

const stack = [
  "Node",
  "PostgreSQL",
  "Next.js",
  "TypeScript",
  "Prisma",
  "Supabase",
];

export default function SideRail() {
  const [shown, setShown] = useState(false);
  const scope = useRef<HTMLElement>(null);
  const played = useRef(false);

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
      gsap.set(el.querySelectorAll("[data-rail-card]"), {
        clearProps: "opacity,transform",
      });
      el.style.pointerEvents = "auto";
    }, 3000);

    const mm = gsap.matchMedia();
    // The rail markup commits before <main>, so #top (the hero) may not exist
    // yet when this effect runs — ScrollTrigger then builds against a null
    // trigger and the whole handoff silently does nothing. Wait for it.
    let raf = 0;
    const whenHeroExists = (go: () => void) => {
      if (document.querySelector("#top")) return go();
      raf = requestAnimationFrame(() => whenHeroExists(go));
    };

    whenHeroExists(() => {
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          built = true;
          const ctx = gsap.context(() => {
            gsap.set(el, { opacity: 1 });
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: "#top",
                start: "top top",
                end: "+=130%",
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  // Only clickable once it has actually arrived.
                  el.style.pointerEvents =
                    self.progress > 0.55 ? "auto" : "none";
                  if (self.progress > 0.8) setShown(true);
                },
              },
            });
            // Explicit set + .to(), NOT .from(). A .from() placed at position 0.45
            // leaves the cards in their natural state for the first 45% of the
            // scrub, so the whole rail sat visible on top of the hero at load.
            gsap.set("[data-rail-card]", {
              opacity: 0,
              x: -40,
              scaleY: 0.55,
              transformOrigin: "left top",
            });
            // Cards grow up out of the left edge rather than sliding in as
            // finished blocks — the panel height expanding is what sells "this
            // surface was always here, it just unfolded".
            tl.to(
              "[data-rail-card]",
              {
                opacity: 1,
                x: 0,
                scaleY: 1,
                stagger: 0.07,
                duration: 0.55,
                ease: "none",
              },
              0.45,
            );
          }, scope);
          return () => ctx.revert();
        },
      );
      // Reduced motion / below lg: no choreography, just present.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        built = true;
        gsap.set(el, { opacity: 1 });
        el.style.pointerEvents = "auto";
        setShown(true);
      });
    });

    return () => {
      clearTimeout(safety);
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, []);

  // Stat numbers count up — once, when the rail has arrived.
  useEffect(() => {
    if (!shown || played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.current = true;
    const ctx = gsap.context(() => {
      // The markup already renders the real number, so this only ever counts
      // UP TO a value that is correct the whole time. Previously the DOM shipped
      // a literal "0" and relied on the tween to replace it — when the rail
      // scrolled out of view, this context reverted, and the `played` guard then
      // blocked the tween from re-running, leaving the stats stuck on 0 forever.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 1.1,
          ease: "power2.out",
          delay: 0.35,
          onUpdate: () => {
            el.textContent = String(Math.round(obj.n));
          },
          onComplete: () => {
            el.textContent = String(target);
          },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, [shown]);

  return (
    <aside
      ref={scope}
      aria-label="Site navigation"
      data-rail-root
      className="pointer-events-none fixed bottom-6 left-6 top-6 z-50 hidden w-[332px] flex-col gap-3 lg:flex"
    >
      {/* Name-as-logo + socials */}
      <div
        data-rail-card
        className="flex items-center justify-between rounded-2xl border border-border-paper bg-paper-card/55 px-4 py-3 backdrop-blur-[20px]"
      >
        <a
          href="#top"
          data-rail-logo
          className="rounded-lg bg-signal px-3.5 py-2 text-lg font-semibold tracking-tight text-white"
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
              className="grid h-8 w-8 place-items-center rounded-lg bg-text-paper font-mono text-[11px] font-bold lowercase text-paper transition-colors hover:bg-signal"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Positioning line */}
      <div
        data-rail-card
        className="rounded-2xl border border-border-paper bg-paper-card/40 px-4 py-4 text-sm leading-relaxed text-muted-paper backdrop-blur-[20px]"
      >
        Backend and full stack developer building production systems — schema,
        auth, and the APIs products run on.
      </div>

      {/* Stats with count-up */}
      <div
        data-rail-card
        data-rail-stats
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border-paper bg-paper-card/40 px-3 py-3.5 text-center backdrop-blur-[20px]"
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-display text-3xl font-bold leading-none text-ultra-bright">
              <span data-count={s.value}>{s.value}</span>
              {s.suffix}
            </div>
            <div className="mt-2 whitespace-pre-line text-[11px] leading-tight text-muted-paper">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu — grows to fill the rail height */}
      <nav
        data-rail-card
        data-rail-menu
        className="flex flex-1 flex-col justify-center rounded-2xl border border-border-paper bg-paper-card/55 px-3 py-2 backdrop-blur-[20px]"
      >
        {menu.map((m, i) => (
          <a
            key={m.label}
            href={m.href}
            className={`px-4 py-4 text-xl font-semibold text-text-paper transition-colors hover:text-ultra-bright ${
              i > 0 ? "border-t border-border-paper" : ""
            }`}
          >
            {m.label}
          </a>
        ))}
      </nav>

      {/* Skill charts — the rail counterpart of the hero cluster.
          tone="paper": --ultra-ink fails contrast on this light surface. */}
      <div
        data-rail-card
        data-rail-charts
        className="rounded-2xl border border-border-paper bg-paper-card/40 px-3.5 py-3.5 backdrop-blur-[20px]"
      >
        <SkillCharts tone="paper" />
      </div>

      {/* Stack */}
      <div
        data-rail-card
        className="rounded-2xl border border-border-paper bg-paper-card/40 px-3.5 py-3 backdrop-blur-[20px]"
      >
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-paper">
          Stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border-paper px-3 py-1.5 font-mono text-[11px] text-muted-paper"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div
        data-rail-card
        className="flex items-center gap-2 rounded-2xl border border-border-paper bg-paper-card/40 px-3.5 py-2.5 backdrop-blur-[20px]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
        <span className="font-mono text-xs text-muted-paper">
          Open to work — remote / KTM
        </span>
      </div>

      <a
        href="#contact"
        data-rail-card
        className="rounded-2xl bg-signal px-4 py-4 text-center text-lg font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        Let&apos;s talk
      </a>
    </aside>
  );
}
