"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const leftNav = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
];
const rightNav = [
  { label: "Services", href: "#services" },
  { label: "Clients", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const traits = ["Backend", "APIs & Auth", "Data models", "Frontend", "Shipped solo"];
const NAME = "SACHIT";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let safety: ReturnType<typeof setTimeout>;
    const ctx = gsap.context(() => {
      // Load-in: wordmark letters rise + unblur, staggered
      const intro = gsap.timeline();
      intro.from("[data-char]", {
        yPercent: 115,
        opacity: 0,
        filter: "blur(12px)",
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
      });
      intro.from(
        "[data-hero-fade]",
        {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.75"
      );
      // Safety: if the animation clock is throttled (backgrounded tab), timers
      // still fire — jump to the end so content can never strand invisible.
      safety = setTimeout(() => {
        if (intro.progress() < 1) intro.progress(1);
      }, 2500);

      // --- PINNED transition -------------------------------------------------
      // The hero holds still while the scene dissolves and the chrome migrates
      // into the rail. Without the pin the page scrolls away before any of it
      // is visible.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "+=130%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        // Scene demotes to ambient background texture
        tl.to(
          "[data-hero-media]",
          { scale: 1.16, filter: "blur(18px)", opacity: 0.32, ease: "none" },
          0
        )
          // Headline / CTAs / taglines leave upward
          .to("[data-hero-copy]", { yPercent: -60, opacity: 0, ease: "none" }, 0)
          // Wordmark collapses toward the rail's logo chip
          .to(
            "[data-wordmark]",
            { scale: 0.075, yPercent: -4, transformOrigin: "left top", ease: "none" },
            0
          )
          // Nav travels toward the rail menu
          .to(
            "[data-hero-nav]",
            {
              x: () => -window.innerWidth * 0.3,
              y: () => window.innerHeight * 0.1,
              scale: 0.8,
              opacity: 0,
              ease: "none",
            },
            0
          )
          // Stat cards drift toward the rail's stats block
          .to(
            "[data-hero-stats]",
            { y: () => -window.innerHeight * 0.2, scale: 0.78, opacity: 0, ease: "none" },
            0
          );
        return () => tl.scrollTrigger?.kill();
      });

      // Mobile: no pin, just a gentle dissolve
      mm.add("(max-width: 1023px)", () => {
        const t = gsap.to("[data-hero-media]", {
          scale: 1.1,
          filter: "blur(12px)",
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        return () => t.scrollTrigger?.kill();
      });
    }, scope);
    return () => {
      clearTimeout(safety);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="top"
      ref={scope}
      className="relative min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Layer 1 — room scene */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-hero-media
        src="/hero-scene.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center will-change-[transform,filter]"
      />

      {/* Layer 2 — full-bleed wordmark, left-aligned like the reference */}
      <div
        data-wordmark
        className="pointer-events-none absolute inset-x-0 top-[-1%] z-10 flex justify-start px-4 will-change-transform sm:px-6"
      >
        <h1 className="flex select-none text-[25.5vw] font-black leading-[0.78] tracking-[-0.055em] text-[#f5f1e8]">
          <span className="sr-only">Sachit Ghimire — Full Stack Developer</span>
          {NAME.split("").map((c, i) => (
            <span key={i} aria-hidden className="overflow-hidden">
              <span data-char className="inline-block will-change-[transform,filter]">
                {c}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* Layer 3 — subject cut-out in front of the wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-hero-media
        src="/hero-cutout.png"
        alt="Sachit Ghimire coding at night"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover object-center will-change-[transform,filter]"
      />

      {/* Layer 4 — scrim */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-ink from-2% via-ink/25 via-45% to-ink/10 to-100%" />

      <div className="absolute inset-0 z-30">
        {/* Split nav on the wordmark baseline */}
        <nav data-hero-nav className="absolute inset-x-0 top-[47%] hidden items-center justify-between px-6 text-base font-semibold text-[#f5f1e8] will-change-transform lg:flex lg:px-10">
          <div data-hero-fade className="flex items-center gap-5">
            {leftNav.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-signal">
                {l.label}
              </a>
            ))}
          </div>
          <div data-hero-fade className="flex items-center gap-5">
            {rightNav.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-signal">
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Frosted stat cards, left */}
        <div data-hero-stats className="absolute bottom-[26%] left-6 hidden flex-col gap-3 will-change-transform lg:flex lg:left-10">
          <div data-hero-fade className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 backdrop-blur-md">
            <span className="text-3xl font-extrabold text-signal">5</span>
            <span className="text-xs leading-tight text-[#f5f1e8]/80">
              Live production
              <br />
              systems
            </span>
          </div>
          <div data-hero-fade className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 backdrop-blur-md">
            <span className="text-3xl font-extrabold text-signal">1yr</span>
            <span className="text-xs leading-tight text-[#f5f1e8]/80">
              Sole dev at
              <br />
              Lama Group
            </span>
          </div>
        </div>

        {/* Traits card, right */}
        <div
          data-hero-fade
          data-hero-copy
          className="absolute bottom-[26%] right-6 hidden rounded-2xl border border-white/12 bg-white/5 px-5 py-4 backdrop-blur-md lg:right-10 lg:block"
        >
          <ul className="flex flex-col gap-2 text-sm font-medium text-[#f5f1e8]">
            {traits.map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Centred headline + CTAs */}
        <div data-hero-copy className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6 text-center will-change-transform">
          <p
            data-hero-fade
            className="max-w-3xl text-4xl font-extrabold leading-[1.0] tracking-[-0.025em] text-[#f5f1e8] sm:text-6xl"
          >
            I build the backend
            <br className="hidden sm:block" /> products run on.
          </p>
          <div data-hero-fade className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#work"
              className="rounded-full bg-signal px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-[#f5f1e8] transition-colors hover:border-signal hover:text-signal"
            >
              Get in touch
            </a>
          </div>
        </div>

        {/* Corner taglines */}
        <p
          data-hero-fade
          data-hero-copy
          className="absolute bottom-6 left-6 hidden font-mono text-xs leading-relaxed text-[#f5f1e8]/70 lg:left-10 lg:block"
        >
          The backend developer.
          <br />
          That&apos;s Sachit.
        </p>
        <p
          data-hero-fade
          data-hero-copy
          className="absolute bottom-6 right-6 hidden max-w-[15rem] text-right text-xs leading-relaxed text-[#f5f1e8]/70 lg:right-10 lg:block"
        >
          Building production systems remotely from Kathmandu — Node, PostgreSQL,
          and the APIs between them.
        </p>
      </div>
    </section>
  );
}
