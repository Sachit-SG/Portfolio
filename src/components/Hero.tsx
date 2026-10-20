"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import SkillMeters from "./SkillMeters";
import EmailTab from "./EmailTab";
import { projects } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

// Split 3/3 across the wordmark baseline, and kept in sync with SideRail's
// menu — the two used to disagree, which is how Skills (the biggest section on
// the page) ended up unreachable from the hero. "Clients" is gone: it was an
// invented label pointing at #work, so the nav had two names for one section
// and no name for two others.
const leftNav = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
];
const rightNav = [
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const NAME = "SACHIT";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = scope.current;
    const ready = () => {
      if (hero) hero.dataset.heroReady = "true";
      window.dispatchEvent(new Event("portfolio:hero-ready"));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ready();
      return;
    }
    let safety: ReturnType<typeof setTimeout>;
    let cancelled = false;
    let finishIntro = () => {};
    const ctx = gsap.context(() => {}, scope);

    // Everything below — the width-lock especially — depends on the REAL
    // display font (Clash Display, loaded with next/font's display:"swap")
    // being what's actually rendering when it measures. "swap" paints a
    // fallback font first and swaps in the real one whenever it's ready; on a
    // slow/cold load this effect could measure FALLBACK glyph widths, lock
    // them via c.style.width, then have the real font swap in a moment later
    // with different glyph shapes — the box stays locked to the wrong width
    // and clips/squeezes the letter. That's what "only see C sometimes,
    // reload fixes it" was: a warm cache loads the font fast enough to win
    // the race; a cold one doesn't. document.fonts.ready guarantees this
    // only runs once the real font is the one being measured.
    const run = () => {
      if (cancelled) return;
      ctx.add(() => runIntro());
    };
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(run);
    } else {
      run();
    }

    function runIntro() {
      // Load-in. Three interchangeable wordmark reveals, switched with ?fx=
      //   ?fx=a  rise + unblur (editorial, the safe one)
      //   ?fx=b  boot sequence (scramble) — DEFAULT
      //   ?fx=c  rise + specular sweep
      // Timing across all three sits at the ceiling of the motion tables, not
      // past it: 1.2s is the top of the "dramatic reveal" band (600-1200ms) and
      // 6 chars x 0.08 = 0.48s stagger is just under the hard 500ms limit.
      const fx = new URLSearchParams(window.location.search).get("fx") || "b";
      const intro = gsap.timeline();
      intro.eventCallback("onComplete", ready);
      finishIntro = () => { if (window.scrollY > 0) intro.progress(1); };
      window.addEventListener("scroll", finishIntro, { once: true, passive: true });
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

        // STATIC BURST + PHOTO/SUBJECT GLITCH — the image and the cutout of
        // Sachit resolve out of noise, NOT the name (that stays a clean
        // scramble). One beat: static clears as the scene starts appearing,
        // the glitch settles to clean by ~2s, roughly the same window the
        // name's own scramble is still finishing in.
        // "steps()" easing on the displacement, not a smooth ease — abrupt
        // value jumps read as glitch; a smooth decay reads as blur.
        const burst = scope.current?.querySelector<HTMLElement>("[data-hero-static]");
        if (burst) {
          intro.set(burst, { opacity: 0.92, backgroundPositionX: "0px" }, 0);
          intro.to(burst, { backgroundPositionX: "43px", duration: 0.09 }, 0.09);
          intro.to(burst, { backgroundPositionX: "-21px", duration: 0.09 }, 0.19);
          intro.to(burst, { opacity: 0, duration: 0.2, ease: "power1.in" }, 0.3);
        }
        const displace = scope.current?.querySelector("#hero-displace");
        if (displace) {
          intro.set(displace, { attr: { scale: 55 } }, 0);
          intro.to(displace, { attr: { scale: 0 }, duration: 1.9, ease: "steps(6)" }, 0.1);
        }
        // The filter itself — not just the displacement scale — only needs
        // to be ON for this ~2s boot window. Leaving `filter: url(...)`
        // resident on these two full-viewport layers for the component's
        // whole lifetime forces them into the slow rasterize/filter
        // compositing path permanently, even once scale is 0 and the effect
        // is visually inert. Applied here, removed the instant this settles.
        const pxLayers = scope.current?.querySelectorAll<HTMLElement>("[data-px]");
        if (pxLayers?.length) {
          intro.set(pxLayers, { filter: "url(#hero-glitch)" }, 0);
          intro.set(pxLayers, { filter: "none" }, 2.0);
        }
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
      // TWO groups, not one — this is the actual fix for "buttons come up too
      // late", not just an earlier position. Everything used to be one
      // stagger chain anchored to "-=0.6" (0.6s before the wordmark finishes,
      // ~2.05s under the fx=b scramble) — so the paragraph+CTA, sitting 7th
      // and 8th of 10 in DOM order, didn't finish appearing until ~2.5s in.
      // Sachit wants the slow, cinematic name kept exactly as-is, so the fix
      // isn't shortening the scramble — it's giving the PRIMARY content (the
      // headline and the two buttons someone actually clicks) its own fast,
      // guaranteed-early group, independent of both the name's duration and
      // the secondary chrome's stagger position.
      intro.from(
        "[data-hero-primary]",
        {
          opacity: 0,
          y: 18,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
        },
        0.5
      );
      // Secondary chrome (nav, stat cards, chart, email, corner taglines) —
      // same visual treatment, starts alongside the primary group rather than
      // waiting for it, so nothing about the scramble's length holds this up
      // either.
      intro.from(
        "[data-hero-fade]:not([data-hero-primary])",
        {
          opacity: 0,
          y: 18,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.11,
        },
        0.5
      );
      // Safety: if the animation clock is throttled (backgrounded tab), timers
      // still fire — jump to the end so content can never strand invisible.
      // Must stay comfortably longer than the full intro (~2.9s once the
      // wordmark and the staggered chrome are both counted).
      safety = setTimeout(() => {
        if (intro.progress() < 1) intro.progress(1);
      }, 5000);

      // SideRail owns the complete scroll handoff. The intro owns only load-in.
      if (window.location.hash) intro.progress(1);
    }

    return () => {
      cancelled = true;
      clearTimeout(safety);
      window.removeEventListener("scroll", finishIntro);
      if (hero) delete hero.dataset.heroReady;
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

    // Gated on visibility — this used to run via gsap.ticker.add(tick) for
    // the component's whole mounted lifetime, which for Hero is the entire
    // session: sin/cos math plus 4 quickTo setters, every single frame, even
    // with the user scrolled 5 screens down at Contact and Hero fully
    // off-screen. Same pattern the Ambient Glitch effect below already uses
    // correctly — only the trigger differs (continuous loop vs. random pulse
    // timer).
    let ticking = false;
    let inView = false;
    const sync = () => {
      const shouldTick = inView && !document.hidden && el.dataset.handoffActive !== "true";
      if (shouldTick === ticking) return;
      ticking = shouldTick;
      if (ticking) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);
    window.addEventListener("portfolio:handoff-state", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      window.removeEventListener("portfolio:handoff-state", sync);
      document.removeEventListener("visibilitychange", sync);
      if (ticking) gsap.ticker.remove(tick);
      if (fine) window.removeEventListener("pointermove", onMove);
      layers.forEach((l) => {
        gsap.killTweensOf(l.node);
        l.node.style.willChange = ""; // never leave will-change parked on
      });
    };
  }, []);

  // --- AMBIENT GLITCH --------------------------------------------------------
  // The photo + subject cutout flicker briefly, at random, for as long as the
  // hero is on screen — not a one-shot, and not continuous (continuous would
  // read as broken, not stylistic). Reuses the SAME #hero-displace filter the
  // intro drives; safe because the first pulse can't fire for 3.5s+ and the
  // intro's own tween finishes by ~2.5s, so they never fight over the same
  // attribute. Gated on IntersectionObserver, not scroll math — this only
  // needs to know "is any of the hero visible", nothing more precise.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = scope.current;
    const displace = section?.querySelector("#hero-displace");
    if (!section || !displace) return;
    const pxLayers = section.querySelectorAll<HTMLElement>("[data-px]");

    let active = false;
    let pending: gsap.core.Tween | null = null;

    // Short and punchy — a flicker, not the intro's slow "emerging from
    // noise" resolve. Two stepped jumps and back to clean inside ~0.3s.
    // Filter is switched on for exactly this ~0.28s window and back to
    // "none" the instant it ends — same reasoning as the intro: a resident
    // SVG filter costs on every frame regardless of whether it's visually
    // doing anything, so it should only be present while actually glitching.
    const pulse = () => {
      gsap
        .timeline()
        .set(pxLayers, { filter: "url(#hero-glitch)" })
        .set(displace, { attr: { scale: 26 } })
        .to(displace, { attr: { scale: 4 }, duration: 0.09, ease: "steps(3)" })
        .to(displace, { attr: { scale: 18 }, duration: 0.06, ease: "steps(2)" })
        .to(displace, { attr: { scale: 0 }, duration: 0.13, ease: "steps(2)" })
        .set(pxLayers, { filter: "none" });
    };

    const scheduleNext = () => {
      if (!active || document.hidden || section.dataset.handoffActive === "true") return;
      // 3.5-8s, randomised — a fixed interval reads mechanical, not glitchy.
      const delay = 3.5 + Math.random() * 4.5;
      pending = gsap.delayedCall(delay, () => {
        if (!document.hidden && section.dataset.handoffActive !== "true") pulse();
        scheduleNext();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!active) {
            active = true;
            scheduleNext();
          }
        } else {
          active = false;
          pending?.kill();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);
    const resume = () => { pending?.kill(); scheduleNext(); };
    window.addEventListener("portfolio:handoff-state", resume);
    document.addEventListener("visibilitychange", resume);

    return () => {
      active = false;
      pending?.kill();
      io.disconnect();
      window.removeEventListener("portfolio:handoff-state", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  return (
    <section
      id="top"
      ref={scope}
      data-dark
      className="relative min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Hidden SVG filter for the boot-sequence glitch on the PHOTO + subject
          cutout (fx=b only) — not the name. Default scale=0 so both layers
          render clean if JS never runs; GSAP tweens the scale attribute during
          the intro. One shared filter applied to both wrapper divs, so a
          single tween on the one feDisplacementMap distorts both in sync.
          The `filter: url(...)` CSS itself is applied and removed via GSAP
          (intro + the ambient pulse below), NOT resident in the JSX — an SVG
          filter forces its element into software rasterize/composite for as
          long as it's present, whether or not it's currently displacing
          anything, so it should only be on during the ~2s boot window and
          each ~0.3s ambient pulse, not for the component's entire lifetime. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="hero-glitch">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.8" numOctaves="1" seed="3" result="noise" />
          <feDisplacementMap
            id="hero-displace"
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

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

      {/* Layer 4c — boot-sequence static burst (fx=b only). Same feTurbulence
          noise recipe as the permanent grain above, but opaque and brief —
          clears within ~0.5s as the name starts resolving. Defaults to
          opacity 0 so if JS never runs, nothing appears; GSAP drives the
          reveal + decay from inside the intro timeline, gated to fx==="b". */}
      <div
        data-hero-static
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          opacity: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='ns'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23ns)'/%3E%3C/svg%3E\")",
          backgroundSize: "140px 140px",
        }}
      />

      {/* Outside the z-30 hero layer so these words can travel above the rail. */}
      <nav
        data-hero-nav
        className="absolute inset-x-0 top-[47%] z-[70] hidden items-center justify-between px-6 text-xl font-semibold text-[#fff5f5] lg:flex lg:px-10"
      >
          <div data-hero-fade data-hero-nav-left className="flex items-center will-change-[transform,filter]">
            {leftNav.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-5 py-1 transition-colors hover:text-ultra-ink ${
                  i > 0 ? "border-l border-white/25" : ""
                }`}
              >
                <span data-hero-link-label className="inline-block">{l.label}</span>
              </a>
            ))}
          </div>
          <div data-hero-fade data-hero-nav-right className="flex items-center will-change-[transform,filter]">
            {rightNav.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-5 py-1 transition-colors hover:text-ultra-ink ${
                  i > 0 ? "border-l border-white/25" : ""
                }`}
              >
                <span data-hero-link-label className="inline-block">{l.label}</span>
              </a>
            ))}
          </div>
        </nav>

      <div className="absolute inset-0 z-30">
        {/* Frosted stat cards, left */}
        {/* bottom-[26%] with 2 cards never collided with the nav above (which
            is pinned to the wordmark baseline at top-47%). Adding the 3rd
            card grew this block ~76px taller without anyone re-checking that
            headroom — on any laptop-height screen (1366x768 and smaller are
            common, not edge cases) the two now overlap. Pushed lower
            (bottom-[26%] -> [15%]) and tightened (gap-3->gap-2, py-3->py-2.5
            on each card) rather than moving the nav, which is deliberately
            anchored to the wordmark. */}
        <div data-hero-stats className="absolute bottom-[15%] left-6 hidden flex-col gap-2 will-change-transform lg:flex lg:left-10">
          <div data-hero-fade data-hero-stat className="flex items-center gap-3 rounded-card border border-white/10 bg-ink/55 px-5 py-2.5 backdrop-blur-md">
            <span data-hero-stat-value className="text-3xl font-extrabold text-ultra-ink">{projects.length}</span>
            <span data-hero-stat-label className="text-xs leading-tight text-[#fff5f5]/80">
              Selected
              <br />
              projects
            </span>
          </div>
          <div data-hero-fade data-hero-stat className="flex items-center gap-3 rounded-card border border-white/10 bg-ink/55 px-5 py-2.5 backdrop-blur-md">
            <span data-hero-stat-value className="text-3xl font-extrabold text-ultra-ink">1yr</span>
            <span data-hero-stat-label className="text-xs leading-tight text-[#fff5f5]/80">
              Sole dev at
              <br />
              Lama Group
            </span>
          </div>
          {/* Third stat, matching SideRail's `stats` array exactly — this one
              was missing from the hero even though the rail (which these fly
              into on scroll) has had it all along. */}
          <div data-hero-fade data-hero-stat className="flex items-center gap-3 rounded-card border border-white/10 bg-ink/55 px-5 py-2.5 backdrop-blur-md">
            <span data-hero-stat-value className="text-3xl font-extrabold text-ultra-ink">2yrs</span>
            <span data-hero-stat-label className="text-xs leading-tight text-[#fff5f5]/80">
              Design before
              <br />
              dev
            </span>
          </div>
        </div>

        {/* Skill meters + email tab, right. Replaces the old radial chart and
            Services card. tone="ink" for the dark hero. */}
        <div className="absolute bottom-[11%] right-6 hidden w-[17rem] flex-col gap-3 will-change-transform lg:right-10 lg:flex">
          <div
            data-hero-fade
            data-hero-charts
            className="rounded-card border border-white/10 bg-ink/55 px-4 py-4 backdrop-blur-md"
          >
            <SkillMeters tone="ink" compact />
          </div>
          {/* data-hero-copy: the email has no fly-to-rail morph, so it floats
              up and fades with the headline instead of sitting static; the rail
              email takes over. */}
          <div data-hero-fade data-hero-copy>
            <EmailTab
              tone="ink"
              className="rounded-card border border-white/10 bg-ink/55 px-4 py-3 backdrop-blur-md transition-colors hover:border-signal/60"
            />
          </div>
        </div>

        {/* Centred headline + CTAs. data-hero-primary (in ADDITION to
            data-hero-fade): these two get their own fast, guaranteed-early
            timing — see the intro timeline. Left in the general stagger
            group they were 7th/8th of 10, so even an early absolute position
            still landed the actual clickable CTA around 1.77s in. */}
        <div data-hero-copy className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6 text-center will-change-transform">
          <p
            data-hero-fade
            data-hero-primary
            className="font-display max-w-3xl text-4xl font-bold leading-[1.0] tracking-[-0.005em] text-[#fff5f5] sm:text-6xl"
          >
            I build websites
            <br className="hidden sm:block" /> and internal tools.
          </p>
          <div
            data-hero-fade
            data-hero-primary
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#work"
              className="rounded-[8px] bg-signal px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="rounded-[8px] border border-white/25 px-7 py-3.5 text-sm font-bold text-[#fff5f5] transition-colors hover:border-ultra-ink hover:text-ultra-ink"
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
          The systems developer.
          <br />
          That&apos;s Sachit.
        </p>
        <p
          data-hero-fade
          data-hero-copy
          className="absolute bottom-6 right-6 hidden max-w-[15rem] text-right text-xs leading-relaxed text-[#fff5f5]/70 lg:right-10 lg:block"
        >
          Based in Kathmandu. Working with Next.js, Node.js and PostgreSQL.
        </p>
      </div>
    </section>
  );
}
