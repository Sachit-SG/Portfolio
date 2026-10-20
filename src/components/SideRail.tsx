"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SkillMeters from "./SkillMeters";
import { projects } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

const menu = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];
const stats = [
  { value: String(projects.length), label: "Selected\nprojects" },
  { value: "1yr", label: "Sole dev\nat Lama" },
  { value: "2yrs", label: "Design\nbefore dev" },
];

// Normalized beats: a single clock owns the pin and every handoff property.
const beats = { release: .10, shell: .24, identity: .28, nav: .30, proof: .62, meter: .67, support: .82, ready: .92 };
const ease = "power3.out";

export default function SideRail() {
  const scope = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const rail = scope.current;
    const hero = document.querySelector<HTMLElement>("#top");
    if (!rail || !hero) return;
    const mm = gsap.matchMedia();
    let cancelled = false;
    let built = false;
    let fontsReady = false;
    let hashAligned = false;
    let ready = false;
    const setReady = (value: boolean) => {
      rail.inert = !value;
      rail.setAttribute("aria-hidden", String(!value));
      rail.dataset.ready = String(value);
      if (ready === value) return;
      ready = value;
      window.dispatchEvent(new CustomEvent("portfolio:rail-state", { detail: value }));
    };
    setReady(false);

    const build = () => {
      if (cancelled || built || !fontsReady || hero.dataset.heroReady !== "true") return;
      built = true;
      mm.add({
        all: "all",
        rail: "(min-width: 1280px) and (min-height: 700px)",
        desktop: "(min-width: 1280px)",
        reduce: "(prefers-reduced-motion: reduce)",
      }, (context) => {
        const { rail: available, desktop, reduce } = context.conditions!;
        setReady(false);
        if (!available) {
          const frame = requestAnimationFrame(() => {
            if (window.location.hash && !hashAligned) {
              hashAligned = true;
              document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
            }
            window.dispatchEvent(new Event("portfolio:layout-ready"));
            rail.dataset.layoutReady = "true";
          });
          return () => cancelAnimationFrame(frame);
        }
        rail.dataset.behind = "dark";
        const sourceNav = hero.querySelector<HTMLElement>("[data-hero-nav]");
        const cards = rail.querySelectorAll<HTMLElement>("[data-rail-card]");
        const labels = rail.querySelectorAll<HTMLElement>("[data-rail-link-label]");
        const proof = rail.querySelectorAll<HTMLElement>("[data-rail-proof]");
        const meter = rail.querySelector<HTMLElement>("[data-rail-meters] [data-skill-meters]");
        const support = rail.querySelectorAll<HTMLElement>("[data-rail-content]");
        let overlay: HTMLDivElement | undefined;
        let alignFrame = 0;
        let handoff: gsap.core.Timeline | undefined;
        const syncHandoff = (progress: number) => {
          hero.dataset.handoffProgress = progress.toFixed(3);
          const moving = String(progress > .08);
          if (hero.dataset.handoffActive !== moving) {
            hero.dataset.handoffActive = moving;
            window.dispatchEvent(new Event("portfolio:handoff-state"));
          }
          if (sourceNav) sourceNav.inert = progress > .64;
          setReady(progress >= beats.ready);
        };

        if (desktop && !reduce) {
          const sourceLabels = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-link-label]"));
          const sourceMeter = hero.querySelector<HTMLElement>("[data-hero-charts] [data-skill-meters]");
          const sourceName = hero.querySelector<HTMLElement>("[data-wordmark] h1");
          const targetName = rail.querySelector<HTMLElement>("[data-rail-wordmark]");
          // A fixed visual layer crosses the Hero and rail stacking contexts.
          // Originals remain the semantic links; only one visual is painted at a time.
          overlay = document.createElement("div");
          overlay.setAttribute("aria-hidden", "true");
          overlay.dataset.handoffOverlay = "";
          Object.assign(overlay.style, { position: "fixed", inset: "0", zIndex: "90", pointerEvents: "none" });
          document.body.append(overlay);
          const makePair = (source: HTMLElement, target: HTMLElement) => {
            const visual = source.cloneNode(true) as HTMLElement;
            visual.removeAttribute("data-hero-link-label");
            Object.assign(visual.style, { position: "absolute", margin: "0", opacity: "0", transformOrigin: "top left" });
            overlay!.append(visual);
            return { source, visual, target, x: 0, y: 0, sx: 1, sy: 1 };
          };
          const pairs = sourceLabels.map((source, i) => makePair(source, labels[i]));
          const namePair = sourceName && targetName ? makePair(sourceName, targetName) : null;
          if (namePair) pairs.push(namePair);
          if (sourceMeter && meter) pairs.push(makePair(sourceMeter, meter));
          // Measure resting geometry without resetting an in-progress timeline.
          // Subtract Hero's rect so measurements also work below the unpinned Hero.
          const measure = () => {
            const heroBox = hero.getBoundingClientRect();
            pairs.forEach((pair) => {
              const from = pair.source.getBoundingClientRect();
              const to = pair.target.getBoundingClientRect();
              const style = getComputedStyle(pair.source);
              Object.assign(pair.visual.style, {
                left: `${from.left - heroBox.left}px`, top: `${from.top - heroBox.top}px`,
                width: `${from.width}px`, height: `${from.height}px`, font: style.font,
                color: style.color, letterSpacing: style.letterSpacing,
              });
              pair.x = to.left - (from.left - heroBox.left);
              pair.y = to.top - (from.top - heroBox.top);
              pair.sx = to.width / (from.width || 1);
              pair.sy = to.height / (from.height || 1);
            });
          };
          gsap.set(rail, { opacity: 1 });
          gsap.set(cards, { autoAlpha: 0 });
          gsap.set([...labels, ...proof, ...support, ...(meter ? [meter] : []), ...(targetName ? [targetName] : []), ...rail.querySelectorAll("[data-rail-identity]")], { opacity: 0 });
          measure();
          const tl = gsap.timeline({
            defaults: { ease },
            scrollTrigger: {
              id: "hero-handoff", trigger: hero, start: "top top", end: "+=150%",
              pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
              onRefreshInit: measure,
              onRefresh: (self) => { self.animation?.progress(self.progress); syncHandoff(self.progress); },
              onUpdate: (self) => syncHandoff(self.progress),
            },
          });
          handoff = tl;
          const scene = hero.querySelectorAll("[data-hero-scene]");
          const subject = hero.querySelectorAll("[data-hero-subject]");
          // Keep spatial progress through the entire pin, including the late
          // meter/support beats. Linear travel follows scroll in both directions.
          tl.to(scene, { yPercent: -18, duration: 1 - beats.release, ease: "none" }, beats.release)
            .to(subject, { yPercent: -22, duration: 1 - beats.release, ease: "none" }, beats.release)
            .to(scene, { scale: 1.025, opacity: .24, duration: .36 }, beats.release)
            .to(subject, { scale: 1.015, opacity: .22, duration: .34 }, beats.release + .03)
            .to([...scene, ...subject], { opacity: 0, duration: .22, ease: "power2.in" }, .78)
            .to(hero.querySelectorAll("[data-hero-copy]"), { opacity: 0, y: -12, duration: .17, ease: "power2.in" }, beats.release)
            .to(hero.querySelectorAll("[data-hero-stat]"), { opacity: 0, duration: .12, stagger: .02 }, beats.release + .05)
            .to(cards, { autoAlpha: 1, duration: .12, stagger: .012 }, beats.shell)
            .to(rail.querySelectorAll("[data-rail-identity]"), { opacity: 1, duration: .1 }, beats.shell + .03);
          const flyPair = (pair: typeof pairs[number], at: number) => {
            tl.to(pair.source, { opacity: 0, duration: .005 }, at)
              .to(pair.visual, { opacity: 1, duration: .005 }, at)
              .to(pair.visual, { x: () => pair.x * .55, y: () => pair.y * .35, scaleX: () => Math.sqrt(pair.sx), scaleY: () => Math.sqrt(pair.sy), duration: .13, ease: "power2.in" }, at)
              .to(pair.visual, { x: () => pair.x, y: () => pair.y, scaleX: () => pair.sx, scaleY: () => pair.sy, duration: .15 }, at + .13)
              .to(pair.visual, { opacity: 0, duration: .025 }, at + .255)
              .to(pair.target, { opacity: 1, duration: .025 }, at + .26);
          };
          if (namePair) flyPair(namePair, beats.identity);
          sourceLabels.forEach((_, i) => {
            flyPair(pairs[i], beats.nav + (i < 3 ? i * .012 : .09 + (i - 3) * .012));
          });
          tl.to(proof, { opacity: 1, duration: .1, stagger: .008 }, beats.proof);
          const tracks = rail.querySelectorAll<HTMLElement>("[data-rail-digit-track]");
          tl.fromTo(tracks, { y: 0, yPercent: 0 }, {
            yPercent: 0,
            y: (_, track: HTMLElement) => -Number(track.dataset.target) * (track.firstElementChild?.getBoundingClientRect().height ?? 0),
            duration: .12, stagger: .015,
          }, beats.proof);
          if (sourceMeter && meter) {
            const pair = pairs[pairs.length - 1];
            tl.to(hero.querySelectorAll("[data-hero-charts]"), { opacity: 0, duration: .01 }, beats.meter)
              .to(sourceMeter, { opacity: 0, duration: .005 }, beats.meter)
              .to(pair.visual, { opacity: 1, duration: .005 }, beats.meter)
              .to(pair.visual, { x: () => pair.x * .52, y: () => pair.y * .25, scale: .92, duration: .075, ease: "power2.in" }, beats.meter)
              .to(pair.visual, { x: () => pair.x, y: () => pair.y, scaleX: () => pair.sx, scaleY: () => pair.sy, duration: .09 }, beats.meter + .075)
              .to(pair.visual, { opacity: 0, duration: .025 }, beats.meter + .14)
              .to(meter, { opacity: 1, duration: .025 }, beats.meter + .145);
          }
          tl.to(sourceNav, { opacity: 0, duration: .03 }, .69)
            .to(support, { opacity: 1, duration: .1 }, beats.support)
            .to({}, { duration: .08 }, beats.ready);
        } else {
          gsap.set(rail, { opacity: 0 });
          const boundary = ScrollTrigger.create({
            id: "rail-boundary", trigger: hero,
            start: reduce ? "bottom top" : "bottom 20%", end: "max",
            onToggle: (self) => { gsap.set(rail, { opacity: self.isActive ? 1 : 0 }); setReady(self.isActive); },
          });
          gsap.set(rail, { opacity: boundary.isActive ? 1 : 0 });
          setReady(boundary.isActive);
        }

        const activate = (id: string) => {
          rail.querySelectorAll<HTMLAnchorElement>("[data-rail-link]").forEach((link) => {
            const active = link.hash === `#${id}`;
            link.dataset.active = String(active);
            if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
          });
          const section = document.querySelector<HTMLElement>(`#${id}`);
          rail.dataset.behind = section?.hasAttribute("data-dark") ? "dark" : "light";
        };
        menu.forEach(({ href }) => {
          const section = document.querySelector<HTMLElement>(href);
          if (!section) return;
          ScrollTrigger.create({ trigger: section, start: "top 50%", end: "bottom 50%",
            onEnter: () => activate(href.slice(1)), onEnterBack: () => activate(href.slice(1)),
            onRefresh: (self) => { if (self.isActive) activate(href.slice(1)); } });
        });
        activate("top");
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
        alignFrame = requestAnimationFrame(() => {
          if (window.location.hash && !hashAligned) {
            hashAligned = true;
            document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
          }
          window.dispatchEvent(new Event("portfolio:layout-ready"));
          ScrollTrigger.update();
          // A deep link can put the empty ScrollTrigger at progress 1 before
          // its timeline has been populated. Resolve that initial pose explicitly.
          if (handoff?.scrollTrigger) {
            handoff.progress(handoff.scrollTrigger.progress);
            syncHandoff(handoff.scrollTrigger.progress);
          }
          rail.dataset.layoutReady = "true";
        });
        return () => {
          cancelAnimationFrame(alignFrame);
          overlay?.remove();
          setReady(false);
          if (sourceNav) sourceNav.inert = false;
          delete hero.dataset.handoffProgress;
          delete hero.dataset.handoffActive;
          window.dispatchEvent(new Event("portfolio:handoff-state"));
        };
      });
    };
    window.addEventListener("portfolio:hero-ready", build);
    document.fonts.ready.then(() => { fontsReady = true; build(); });
    return () => {
      cancelled = true;
      window.removeEventListener("portfolio:hero-ready", build);
      mm.revert();
      setReady(false);
    };
  }, []);

  return <aside ref={scope} aria-label="Site navigation" data-rail-root data-ready="false" data-behind="dark" className="portfolio-rail">
    <div data-rail-card className="rail-card relative flex items-center justify-between px-3 py-2.5">
      <a href="#top" data-rail-identity className="inline-block rounded-[6px] bg-[var(--rail-fill)] px-2.5 py-1.5 text-lg font-semibold tracking-tight text-white"><span data-rail-wordmark className="inline-block font-display font-bold tracking-[-0.055em]">SACHIT</span><sup className="text-[9px]">®</sup></a>
      <div data-rail-identity className="flex gap-1.5">
        <a href="https://www.linkedin.com/in/sachit-ghimire-0b77651b3/" target="_blank" rel="noopener noreferrer" aria-label="Sachit on LinkedIn" className="rail-social">in</a>
        <a href="https://github.com/Sachit-SG?tab=repositories" target="_blank" rel="noopener noreferrer" aria-label="Sachit's GitHub repositories" className="rail-social">gh</a>
      </div>
    </div>
    <div data-rail-card className="rail-card rail-bio px-4 py-3">
      <p data-rail-content className="text-[13px] leading-[1.5] text-[var(--rail-muted)]">I&apos;m Sachit, a developer based in Kathmandu. I spent two years in design before moving into development.</p>
    </div>
    <div data-rail-card data-rail-stats className="rail-card grid grid-cols-3 px-2 py-3 text-center">
      {stats.map((s) => {
        const numeral = Number.parseInt(s.value, 10);
        const suffix = s.value.replace(/^\d+/, "");
        return <div data-rail-stat key={s.label} className="min-w-0">
          <div data-rail-proof data-rail-stat-value className="flex h-7 items-baseline justify-center gap-px font-sans text-[23px] font-bold leading-none text-[var(--rail-accent)] [font-variant-numeric:tabular-nums]">
            <span className="rail-digit-window" aria-hidden="true"><span data-rail-digit-track data-target={numeral} className="rail-digit-track" style={{ "--digit-offset": `-${numeral}em` } as CSSProperties}>
              {Array.from({ length: numeral + 1 }, (_, digit) => <span key={digit} className="rail-digit-step">{digit}</span>)}
            </span></span>
            {suffix && <span className="text-[13px] font-semibold">{suffix}</span>}
            <span className="sr-only">{s.value}</span>
          </div>
          <div data-rail-proof data-rail-stat-label className="mt-1 whitespace-pre-line text-[10px] leading-[1.2] text-[var(--rail-muted)]">{s.label}</div>
        </div>;
      })}
    </div>
    <nav data-rail-card data-rail-menu className="rail-card flex min-h-0 flex-col px-3.5 py-2">
      {menu.map((m) => <a key={m.label} href={m.href} data-rail-link data-active={m.href === "#top" ? "true" : "false"} className="group relative flex flex-1 items-center border-b border-[var(--rail-border)] text-[18px] font-semibold text-[var(--rail-fg)] last:border-0">
        <span data-rail-link-label className="transition-colors duration-150 group-hover:text-[var(--rail-accent)]">{m.label}</span>
      </a>)}
    </nav>
    <div data-rail-card data-rail-meters className="rail-card px-3 py-2.5">
      <p data-rail-content className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--rail-muted)]">Developer · Designer</p>
      <SkillMeters tone="auto" compact dense />
    </div>
    <div data-rail-card className="rail-card p-2"><a data-rail-content href="mailto:sachitghimire2@gmail.com" className="rail-email">sachitghimire2@gmail.com</a></div>
  </aside>;
}
