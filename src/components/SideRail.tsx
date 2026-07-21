"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

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

const stack = ["Node", "PostgreSQL", "Next.js", "TypeScript", "Prisma", "Supabase"];

export default function SideRail() {
  const [shown, setShown] = useState(false);
  const scope = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cards slide in, then the stat numbers count up — once.
  useEffect(() => {
    if (!shown || played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.current = true;
    const ctx = gsap.context(() => {
      gsap.from("[data-rail-card]", {
        x: -28,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.07,
      });
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
        });
      });
    }, scope);
    return () => ctx.revert();
  }, [shown]);

  return (
    <aside
      ref={scope}
      aria-label="Site navigation"
      className={`fixed bottom-6 left-6 top-6 z-50 hidden w-[276px] flex-col gap-3 transition-opacity duration-300 lg:flex ${
        shown ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Name-as-logo + socials */}
      <div
        data-rail-card
        className="flex items-center justify-between rounded-2xl border border-border-paper bg-paper-card/55 px-4 py-3 backdrop-blur-[20px]"
      >
        <a
          href="#top"
          className="rounded-lg bg-signal px-3 py-1.5 text-base font-extrabold tracking-tight text-white"
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
        className="rounded-2xl border border-border-paper bg-paper-card/40 px-4 py-3.5 text-[13px] leading-relaxed text-muted-paper backdrop-blur-[20px]"
      >
        Backend and full stack developer building production systems — schema,
        auth, and the APIs products run on.
      </div>

      {/* Stats with count-up */}
      <div
        data-rail-card
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border-paper bg-paper-card/40 px-3 py-3.5 text-center backdrop-blur-[20px]"
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-2xl font-extrabold leading-none text-signal">
              <span data-count={s.value}>0</span>
              {s.suffix}
            </div>
            <div className="mt-1.5 whitespace-pre-line text-[10px] leading-tight text-muted-paper">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu — grows to fill the rail height */}
      <nav
        data-rail-card
        className="flex flex-1 flex-col justify-center gap-1 rounded-2xl border border-border-paper bg-paper-card/55 p-2 backdrop-blur-[20px]"
      >
        {menu.map((m) => (
          <a
            key={m.label}
            href={m.href}
            className="rounded-xl px-4 py-2.5 text-base font-semibold text-text-paper transition-colors hover:bg-signal hover:text-white"
          >
            {m.label}
          </a>
        ))}
      </nav>

      {/* Stack */}
      <div
        data-rail-card
        className="rounded-2xl border border-border-paper bg-paper-card/40 px-3.5 py-3 backdrop-blur-[20px]"
      >
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-paper">
          Stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border-paper px-2.5 py-1 font-mono text-[10px] text-muted-paper"
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
        <span className="font-mono text-[11px] text-muted-paper">
          Open to work — remote / KTM
        </span>
      </div>

      <a
        href="#contact"
        data-rail-card
        className="rounded-2xl bg-signal px-4 py-3.5 text-center text-base font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        Let&apos;s talk
      </a>
    </aside>
  );
}
