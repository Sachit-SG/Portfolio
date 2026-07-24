"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Phone, Mail } from "lucide-react";
import SkillMeters from "./SkillMeters";
import EmailTab from "./EmailTab";

const menu = [
  { label: "Home", href: "#top" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
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
      gsap.set(el.querySelectorAll("[data-rail-card], [data-rail-link]"), {
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
            // NESH frame 4: the menu container forms first, THEN each link
            // arrives and materialises one by one. Starts at 0.72 — after the
            // menu card has mostly grown — so links populate a formed surface
            // rather than a still-scaling one. This is the "assembling
            // piece-by-piece" read, not "a card faded in".
            gsap.set("[data-rail-link]", { opacity: 0, x: -14 });
            tl.to(
              "[data-rail-link]",
              {
                opacity: 1,
                x: 0,
                stagger: 0.05,
                duration: 0.35,
                ease: "none",
              },
              0.72,
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
      className="pointer-events-none fixed bottom-4 left-6 top-4 z-50 hidden w-[332px] flex-col gap-2 lg:flex"
    >
      {/* Name-as-logo + socials */}
      <div
        data-rail-card
        className="flex items-center justify-between rounded-card border border-[var(--rail-border)] bg-[var(--rail-card)] px-4 py-3 backdrop-blur-[20px]"
      >
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

      {/* Stats with count-up */}
      <div
        data-rail-card
        data-rail-stats
        className="grid grid-cols-3 gap-1 rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)] px-3 py-2.5 text-center backdrop-blur-[20px]"
      >
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

      {/* Menu — grows to fill the rail height */}
      <nav
        data-rail-card
        data-rail-menu
        className="flex flex-1 flex-col justify-between rounded-card border border-[var(--rail-border)] bg-[var(--rail-card)] px-3 py-3 backdrop-blur-[20px]"
      >
        {menu.map((m, i) => (
          <a
            key={m.label}
            href={m.href}
            data-rail-link
            className={`px-4 py-3 text-lg font-semibold text-[var(--rail-fg)] transition-colors hover:text-ultra-bright ${
              i > 0 ? "border-t border-[var(--rail-border)]" : ""
            }`}
          >
            {m.label}
          </a>
        ))}
      </nav>

      {/* Skill meters — the rail counterpart of the hero cluster. Keeps the
          data-rail-charts hook so the hero cluster still has a migration
          target. tone="paper": --ultra-ink fails contrast on this light
          surface, so filled segments use --signal. */}
      <div
        data-rail-card
        data-rail-charts
        className="rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)] px-3.5 py-3 backdrop-blur-[20px]"
      >
        <SkillMeters tone="auto" compact />
      </div>

      {/* Email tab — real photo (public/sachit.jpg) beside the address. */}
      <div data-rail-card>
        <EmailTab
          tone="auto"
          className="rounded-card border border-[var(--rail-border)] bg-[var(--rail-card-soft)] px-3.5 py-3 backdrop-blur-[20px]"
        />
      </div>

      {/* Two contact buttons, heynesh-style: solid red for the primary call,
          outline for email. Call = phone icon, email = mail icon. */}
      <div data-rail-card className="grid grid-cols-2 gap-2">
        <a
          href="tel:+9779845913643"
          className="flex items-center justify-center gap-2 rounded-card bg-signal px-3 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Phone className="h-4 w-4" strokeWidth={2.4} />
          Contact me
        </a>
        <a
          href="mailto:sachitghimire2@gmail.com"
          className="flex items-center justify-center gap-2 rounded-card border border-signal/50 px-3 py-3.5 text-sm font-bold text-signal transition-colors hover:bg-signal hover:text-white"
        >
          <Mail className="h-4 w-4" strokeWidth={2.4} />
          Get in touch
        </a>
      </div>
    </aside>
  );
}
