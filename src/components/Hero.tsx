"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import SkillCharts from "./SkillCharts";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

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

const NAME = "SACHIT";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let safety: ReturnType<typeof setTimeout>;
    const ctx = gsap.context(() => {
      // Load-in. Three interchangeable wordmark reveals, switched with ?fx=
      //   ?fx=a  rise + unblur (editorial, the safe one)
      //   ?fx=b  boot sequence (scramble) — DEFAULT
      //   ?fx=c  rise + specular sweep
      // Timing across all three sits at the ceiling of the motion tables, not
      // past it: 1.2s is the top of the "dramatic reveal" band (600-1200ms) and
      // 6 chars x 0.08 = 0.48s stagger is just under the hard 500ms limit.
      const fx = new URLSearchParams(window.location.search).get("fx") || "b";
      const intro = gsap.timeline();
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]");

      if (fx === "b") {
        // BOOT SEQUENCE.
        // ScrambleText rewrites textContent every tick, and glyph advance widths
        // differ wildly (W vs I). At 99.7% viewport fill that would make the
        // wordmark jitter and overflow mid-scramble, so each letter's final
        // width is locked BEFORE any scrambling starts.
        chars.forEach((c) => {
          c.style.display = "inline-block";
          c.style.width = `${c.getBoundingClientRect().width}px`;
          c.style.textAlign = "center";
        });
        intro.from(chars, {
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.08,
        });
        // One tween per letter — each resolves to its own character, offset by
        // the same 0.08 the fade uses so the word settles left to right.
        // KNOWINGLY over the motion tables, at Sachit's explicit request.
        // 1.5s per letter exceeds the 600-1200ms "dramatic reveal" band, and
        // 6 x 0.11 = 0.66s stagger exceeds the 500ms ceiling. Both are broken
        // deliberately: this plays once per visit, it is the page's opening
        // statement, and the tables assume repeated UI, not a title sequence.
        // `speed` is the glyph-churn rate — lowering it is what actually makes
        // the scramble legible rather than just making it last longer.
        chars.forEach((c, i) => {
          intro.to(
            c,
            {
              duration: 1.5,
              ease: "none",
              // Uppercase only; the full charset reads as static at this size.
              scrambleText: {
                text: NAME[i],
                chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                speed: 0.25,
              },
            },
            i * 0.11
          );
        });
      } else if (fx === "c") {
        // SPECULAR SWEEP. Letters rise, then a wave of light crosses them.
        // Per-char brightness + shadow bloom rather than a masked gradient
        // overlay: a duplicate text layer would not inherit the migration's
        // transform on the <h1> and would desync during the scroll handoff.
        intro.from(chars, {
          yPercent: 115,
          opacity: 0,
          filter: "blur(12px)",
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
        });
        intro.to(
          chars,
          {
            keyframes: [
              { filter: "brightness(1.9) blur(0px)", duration: 0.18, ease: "power2.out" },
              { filter: "brightness(1) blur(0px)", duration: 0.32, ease: "power2.in" },
            ],
            stagger: 0.05,
          },
          "-=0.35"
        );
      } else {
        // RISE + UNBLUR.
        intro.from(chars, {
          yPercent: 115,
          opacity: 0,
          filter: "blur(12px)",
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
        });
      }
      // The rest of the hero arrives as a SEQUENCE, not a single block. 0.11
      // between items (vs the old 0.06) is what makes the eye read it as
      // one-after-another instead of "everything faded in together". Starts
      // 0.6s before the wordmark finishes so the two overlap rather than the
      // page sitting dead while the name resolves.
      intro.from(
        "[data-hero-fade]",
        {
          opacity: 0,
          y: 18,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.11,
        },
        "-=0.6"
      );
      // Safety: if the animation clock is throttled (backgrounded tab), timers
      // still fire — jump to the end so content can never strand invisible.
      // Must stay comfortably longer than the full intro (~2.9s once the
      // wordmark and the staggered chrome are both counted).
      safety = setTimeout(() => {
        if (intro.progress() < 1) intro.progress(1);
      }, 5000);

      // --- PINNED transition -------------------------------------------------
      // The hero holds still while the scene dissolves and the chrome migrates
      // into the rail. Without the pin the page scrolls away before any of it
      // is visible.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        // MIGRATION TARGETS — measured, not guessed.
        // Each hero element flies to the on-screen box of its rail counterpart,
        // so the wordmark genuinely lands on the logo chip instead of shrinking
        // toward a hardcoded corner. Recomputed on every ScrollTrigger refresh
        // (resize, font swap, layout change) because all three are viewport-
        // relative. refreshInit fires while the timeline is reverted to its
        // start state, which is the only moment the "from" rects are untransformed.
        const targets = {
          wordmark: { x: 0, y: 0, scale: 0.08 },
          nav: { x: 0, y: 0 },
          stats: { x: 0, y: 0 },
          charts: { x: 0, y: 0 },
        };
        const delta = (fromEl: Element | null, toEl: Element | null) => {
          if (!fromEl || !toEl) return null;
          const f = fromEl.getBoundingClientRect();
          const t = toEl.getBoundingClientRect();
          if (!f.width || !t.width) return null;
          return { x: t.left - f.left, y: t.top - f.top, scale: t.width / f.width };
        };
        const measure = () => {
          const q = (s: string) => scope.current?.querySelector(s) ?? null;
          const wm = delta(q("[data-wordmark] h1"), document.querySelector("[data-rail-logo]"));
          if (wm) targets.wordmark = wm;
          const nav = delta(q("[data-hero-nav]"), document.querySelector("[data-rail-menu]"));
          if (nav) targets.nav = nav;
          const st = delta(q("[data-hero-stats]"), document.querySelector("[data-rail-stats]"));
          if (st) targets.stats = st;
          const ch = delta(q("[data-hero-charts]"), document.querySelector("[data-rail-charts]"));
          if (ch) targets.charts = ch;
        };
        measure();
        ScrollTrigger.addEventListener("refreshInit", measure);

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
        // PARALLAX: the room recedes further and faster than the subject, so the
        // sandwich reads as real depth instead of two flat layers moving together.
        tl.to(
          "[data-hero-scene]",
          {
            scale: 1.2,
            yPercent: -6,
            filter: "blur(20px)",
            opacity: 0.28,
            ease: "none",
            duration: 1,
          },
          0
        )
          // Subject holds longer and blurs less — it stays the focal point.
          .to(
            "[data-hero-subject]",
            {
              scale: 1.06,
              yPercent: 3,
              filter: "blur(8px)",
              opacity: 0.5,
              ease: "none",
              duration: 1,
            },
            0
          )
          // Headline / CTAs / taglines leave upward
          .to("[data-hero-copy]", { yPercent: -60, opacity: 0, ease: "none", duration: 1 }, 0)
          // Wordmark travels to the rail's logo chip and lands on it. It stays
          // fully opaque the whole way — the handoff only reads as "the same
          // element moved" if the eye can follow it the entire distance.
          .to(
            "[data-wordmark] h1",
            {
              x: () => targets.wordmark.x,
              y: () => targets.wordmark.y,
              scale: () => targets.wordmark.scale,
              transformOrigin: "left top",
              ease: "none",
              duration: 1,
            },
            0
          )
          // Nav travels to the rail menu, fading only at the very end so the
          // rail's own menu can take over without a visible gap.
          .to(
            "[data-hero-nav]",
            {
              x: () => targets.nav.x,
              y: () => targets.nav.y,
              scale: 0.85,
              ease: "none",
              duration: 1,
            },
            0
          )
          .to("[data-hero-nav]", { opacity: 0, ease: "none", duration: 0.28 }, 0.72)
          // Stat cards drift onto the rail's stats block, same handoff.
          .to(
            "[data-hero-stats]",
            {
              x: () => targets.stats.x,
              y: () => targets.stats.y,
              scale: 0.8,
              ease: "none",
              duration: 1,
            },
            0
          )
          .to("[data-hero-stats]", { opacity: 0, ease: "none", duration: 0.28 }, 0.72)
          // Charts travel to the rail's chart card, same handoff as the stats.
          .to(
            "[data-hero-charts]",
            {
              x: () => targets.charts.x,
              y: () => targets.charts.y,
              scale: 0.9,
              ease: "none",
              duration: 1,
            },
            0
          )
          .to("[data-hero-charts]", { opacity: 0, ease: "none", duration: 0.28 }, 0.72);
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", measure);
          tl.scrollTrigger?.kill();
        };
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

  // --- DEPTH RIG -----------------------------------------------------------
  // Two jobs in one loop: a continuous idle drift so the hero is alive even
  // when nobody touches the mouse, plus a cursor lean layered on top. Writes
  // only `transform`, and only to the [data-px] wrappers — never to the nodes
  // the scroll timeline owns.
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = gsap.utils.toArray<HTMLElement>("[data-px]", el).map((node) => ({
      node,
      depth: Number(node.dataset.pxDepth || 10),
      xTo: gsap.quickTo(node, "x", { duration: 0.7, ease: "power3.out" }),
      yTo: gsap.quickTo(node, "y", { duration: 0.7, ease: "power3.out" }),
    }));
    if (!layers.length) return;
    layers.forEach((l) => (l.node.style.willChange = "transform"));

    // Touch devices have no cursor. Skip the listener entirely rather than
    // shipping a dead handler — idle drift alone carries the effect there.
    const fine = window.matchMedia("(pointer: fine)").matches;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      for (const l of layers) {
        // 11s and 17s periods don't share a common multiple in any watchable
        // span, so the drift never visibly loops.
        const driftX = Math.sin(t / 11) * l.depth * 0.6;
        const driftY = Math.cos(t / 17) * l.depth * 0.45;
        // Negative: layers move against the cursor, like looking around a scene.
        l.xTo(driftX - px * l.depth);
        l.yTo(driftY - py * l.depth);
      }
    };
    // Same ticker Lenis runs on — one rAF loop for the whole page, not two.
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      if (fine) window.removeEventListener("pointermove", onMove);
      layers.forEach((l) => {
        gsap.killTweensOf(l.node);
        l.node.style.willChange = ""; // never leave will-change parked on
      });
    };
  }, []);

  return (
    <section
      id="top"
      ref={scope}
      className="relative min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Layer 1 — room scene.
          The wrapper carries PARALLAX, the <img> carries the scrub timeline.
          They must stay on separate elements: both write `transform`, so
          sharing one node means whichever ran last wins and the other is lost.
          scale-105 gives the parallax room to travel without exposing an edge. */}
      <div
        data-px
        data-px-depth="10"
        className="pointer-events-none absolute inset-0 scale-105"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hero-scene
          data-hero-media
          src="/hero-scene-red.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center will-change-[transform,filter]"
        />
      </div>

      {/* Layer 2 — full-bleed wordmark. 26.7vw is measured, not guessed: at
          Clash Display 700 with -0.055em tracking, "SACHIT" renders 932px at
          256px, so it needs 1.34x to reach the 1248px gutter. Both the size and
          the em-based tracking scale with vw, so this holds at every width.
          Re-measure if the name, weight, tracking, or font ever changes. */}
      <div
        data-wordmark
        className="pointer-events-none absolute inset-x-0 top-[2.5%] z-10 flex justify-center px-4 will-change-transform sm:px-6"
      >
        <h1
          className="font-display -mb-[0.12em] flex select-none items-end text-[26.7vw] font-bold leading-[0.82] tracking-[-0.055em] text-[#fff5f5]"
          style={{ textShadow: "0 18px 60px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)" }}
        >
          <span className="sr-only">Sachit Ghimire — Full Stack Developer</span>
          {NAME.split("").map((c, i) => (
            // The clip mask is what the intro slides letters out of. Its box is
            // the line box, and at leading 0.78 that box is shorter than the
            // glyphs — which sheared the tops and bottoms off. The padding gives
            // the mask room for the glyph overshoot; the negative margin keeps
            // the wordmark sitting where it did.
            // HORIZONTAL padding is as load-bearing as the vertical.
            // letter-spacing -0.055em (-21px here) makes each inline-block
            // mask NARROWER than the glyph's ink, and the mask clips: measured
            // 15.4px shaved off the S and 25px off the A. The padding gives the
            // mask room; the equal negative margin cancels it in layout, so the
            // wordmark's total width — and the measured 26.7vw full-bleed —
            // are unchanged.
            <span
              key={i}
              aria-hidden
              className="-mx-[0.09em] overflow-hidden px-[0.09em] pb-[0.12em] pt-[0.06em]"
            >
              <span data-char className="inline-block will-change-[transform,filter]">
                {c}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* Layer 3 — subject cut-out in front of the wordmark.
          Depth 22 vs the room's 10: the nearer layer travels further, which is
          what actually reads as depth. Same wrapper split as Layer 1. */}
      <div
        data-px
        data-px-depth="22"
        className="pointer-events-none absolute inset-0 z-20 scale-105"
      >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-hero-subject
        data-hero-media
        src="/hero-cutout-red.png"
        alt="Sachit Ghimire coding at night"
        className="absolute inset-0 h-full w-full object-cover object-center will-change-[transform,filter]"
        style={{ filter: "drop-shadow(0 24px 45px rgba(0,0,0,0.55))" }}
      />
      </div>

      {/* Layer 4 — scrim */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-ink from-2% via-ink/25 via-45% to-ink/10 to-100%" />

      {/* Layer 4b — cinematic finish: vignette, crimson grade, film grain.
          Pulls the eye to centre and stops the frame edges feeling flat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 42%, transparent 35%, rgba(10,4,6,0.45) 78%, rgba(10,4,6,0.8) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
        style={{
          background:
            "linear-gradient(180deg, rgba(201,42,42,0.35) 0%, transparent 45%, rgba(255,107,107,0.18) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-0 z-30">
        {/* Split nav on the wordmark baseline */}
        <nav data-hero-nav className="absolute inset-x-0 top-[47%] hidden items-center justify-between px-6 text-xl font-semibold text-[#fff5f5] will-change-transform lg:flex lg:px-10">
          <div data-hero-fade className="flex items-center">
            {leftNav.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-5 py-1 transition-colors hover:text-ultra-ink ${
                  i > 0 ? "border-l border-white/25" : ""
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div data-hero-fade className="flex items-center">
            {rightNav.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-5 py-1 transition-colors hover:text-ultra-ink ${
                  i > 0 ? "border-l border-white/25" : ""
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Frosted stat cards, left */}
        <div data-hero-stats className="absolute bottom-[26%] left-6 hidden flex-col gap-3 will-change-transform lg:flex lg:left-10">
          <div data-hero-fade className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 backdrop-blur-md">
            <span className="text-3xl font-extrabold text-ultra-ink">5</span>
            <span className="text-xs leading-tight text-[#fff5f5]/80">
              Live production
              <br />
              systems
            </span>
          </div>
          <div data-hero-fade className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 backdrop-blur-md">
            <span className="text-3xl font-extrabold text-ultra-ink">1yr</span>
            <span className="text-xs leading-tight text-[#fff5f5]/80">
              Sole dev at
              <br />
              Lama Group
            </span>
          </div>
        </div>

        {/* Traits card + Services card, right */}
        <div className="absolute bottom-[11%] right-6 hidden w-[16rem] flex-col gap-3 will-change-transform lg:right-10 lg:flex">
          <a
            href="#services"
            data-hero-fade
            data-hero-copy
            className="rounded-2xl border border-white/12 bg-white/5 px-5 py-4 backdrop-blur-md transition-colors hover:border-ultra-ink/50"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#fff5f5]/55">
              Services
            </span>
            <p className="mt-2 text-sm font-semibold leading-snug text-[#fff5f5]">
              Full-stack apps, APIs, and sites shipped end to end.
            </p>
          </a>

          {/* Skill charts — fills the dead space under the Services card.
              tone="ink" so the glow uses --ultra-ink, the only red that holds
              contrast on the dark hero. */}
          <div
            data-hero-fade
            data-hero-charts
            className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 backdrop-blur-md"
          >
            <SkillCharts tone="ink" variant="compact" />
          </div>
        </div>

        {/* Centred headline + CTAs */}
        <div data-hero-copy className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6 text-center will-change-transform">
          <p
            data-hero-fade
            className="font-display max-w-3xl text-4xl font-bold leading-[1.0] tracking-[-0.005em] text-[#fff5f5] sm:text-6xl"
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
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-[#fff5f5] transition-colors hover:border-ultra-ink hover:text-ultra-ink"
            >
              Get in touch
            </a>
          </div>
        </div>

        {/* Corner taglines */}
        <p
          data-hero-fade
          data-hero-copy
          className="absolute bottom-6 left-6 hidden font-mono text-xs leading-relaxed text-[#fff5f5]/70 lg:left-10 lg:block"
        >
          The backend developer.
          <br />
          That&apos;s Sachit.
        </p>
        <p
          data-hero-fade
          data-hero-copy
          className="absolute bottom-6 right-6 hidden max-w-[15rem] text-right text-xs leading-relaxed text-[#fff5f5]/70 lg:right-10 lg:block"
        >
          Building production systems remotely from Kathmandu — Node, PostgreSQL,
          and the APIs between them.
        </p>
      </div>
    </section>
  );
}
