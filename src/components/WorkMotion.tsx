"use client";

import { useEffect, useLayoutEffect, useRef, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "@/app/work/work.module.css";
import Antigravity from "@/components/Antigravity";

gsap.registerPlugin(ScrollTrigger);

type Flight = {
  frame: HTMLDivElement;
  source: HTMLImageElement;
  destination?: HTMLImageElement;
  slug: string;
  timeout: ReturnType<typeof setTimeout>;
};

// This layout persists between work routes; the temporary image has one owner.
export default function WorkMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight | null>(null);
  const galleryScroll = useRef(0);
  const lastProject = useRef<string | null>(null);
  const previousPath = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearFlight = () => {
    const current = flight.current;
    if (!current) return;
    clearTimeout(current.timeout);
    gsap.killTweensOf(current.frame);
    current.frame.remove();
    current.source.style.removeProperty("visibility");
    current.destination?.style.removeProperty("visibility");
    flight.current = null;
  };

  useEffect(() => {
    return () => clearFlight();
  }, []);

  useLayoutEffect(() => {
    const returning = pathname === "/work" && previousPath.current !== null;
    if (previousPath.current !== null) {
      window.scrollTo({ top: returning ? galleryScroll.current : 0, behavior: "instant" });
    }
    previousPath.current = pathname;
    const page = root.current?.querySelector<HTMLElement>('[data-work-page="' + pathname + '"]');
    const current = flight.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const context = gsap.context(() => {
      if (current && pathname === "/work/" + current.slug) {
        const target = page?.querySelector<HTMLImageElement>("[data-project-hero]");
        if (!target || reduced.matches) {
          clearFlight();
          return;
        }
        current.destination = target;
        target.style.visibility = "hidden";
        const bounds = target.getBoundingClientRect();
        gsap.to(current.frame, {
          left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height,
          duration: 0.55, ease: "power3.inOut",
          onComplete: () => {
            clearFlight();
            page?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
          },
        });
        const title = page?.querySelector("[data-work-title]");
        if (title) gsap.fromTo(title, { y: 12, opacity: 0.65 }, {
          y: 0, opacity: 1, duration: 0.28, delay: 0.4, ease: "power3.out",
          clearProps: "transform,opacity",
        });
      } else if (current) {
        clearFlight();
      }
    }, root);

    const media = gsap.matchMedia(root);
    media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 701px)" }, (mediaContext) => {
      if (!mediaContext.conditions?.motion) return;
      const scene = page?.querySelector<HTMLElement>("[data-work-scene]");
      const deck = page?.querySelector<HTMLElement>("[data-hero-deck]");
      const projectSection = page?.querySelector<HTMLElement>("#projects");
      const copy = scene?.querySelector<HTMLElement>("[data-scene-copy]");
      const image = scene?.querySelector<HTMLElement>("[data-scene-image]");
      const atmosphere = root.current?.querySelector<HTMLElement>("[data-work-atmosphere]");
      if (!scene || !projectSection || !atmosphere) return;

      let deckVisible = false;
      const syncDeck = () => {
        deck?.setAttribute("data-running", String(deckVisible && document.visibilityState === "visible"));
        atmosphere.hidden = deckVisible;
      };
      const deckObserver = new IntersectionObserver(([entry]) => {
        deckVisible = entry.isIntersecting;
        syncDeck();
      });
      if (deck) deckObserver.observe(deck);
      document.addEventListener("visibilitychange", syncDeck);

      const desktop = mediaContext.conditions.desktop;
      let timeline: gsap.core.Timeline | undefined;
      if (desktop && copy && image) {
        scene.classList.add(styles.sceneMotion);
        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: "top 80px",
            end: "bottom bottom",
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .fromTo(image, { scale: 0.26, y: 0, yPercent: 14, autoAlpha: 1, borderRadius: "10px" }, { scale: 1.06, y: 0, yPercent: 0, borderRadius: "0px", duration: 1, ease: "none" }, 0)
          .fromTo(copy, { y: 0, autoAlpha: 1 }, { y: -48, autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 0.1)
          .to(atmosphere, { opacity: 0.3, duration: 1, ease: "none" }, 0);
      } else {
        gsap.to(atmosphere, {
          opacity: 0.3,
          scrollTrigger: { trigger: scene, start: "top 85%", end: "top 25%", scrub: 0.65 },
        });
      }

      gsap.fromTo(atmosphere, { opacity: 0.3 }, {
        opacity: 0.38,
        immediateRender: false,
        scrollTrigger: { trigger: projectSection, start: "top 85%", end: "top 45%", scrub: 0.65 },
      });

      let active = true;
      const refresh = () => { if (active) ScrollTrigger.refresh(); };
      const refreshFrame = requestAnimationFrame(refresh);
      document.fonts?.ready.then(refresh);
      return () => {
        active = false;
        cancelAnimationFrame(refreshFrame);
        deckObserver.disconnect();
        document.removeEventListener("visibilitychange", syncDeck);
        deck?.removeAttribute("data-running");
        atmosphere.hidden = false;
        timeline?.kill();
        scene.classList.remove(styles.sceneMotion);
      };
    });

    // Reveals start only when content intersects; content stays visible if JS fails.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!reduced.matches) context.add(() => gsap.fromTo(entry.target,
          { y: 16, opacity: 0.7 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power3.out", clearProps: "transform,opacity" },
        ));
      }
    }, { threshold: 0.08 });
    page?.querySelectorAll("[data-work-reveal]").forEach((node) => observer.observe(node));
    const onPreference = () => { if (reduced.matches) { clearFlight(); context.revert(); } };
    const onResize = () => clearFlight();
    reduced.addEventListener("change", onPreference);
    window.addEventListener("resize", onResize);
    if (returning && lastProject.current) {
      page?.querySelector<HTMLElement>('[data-project-link="' + lastProject.current + '"]')?.focus({ preventScroll: true });
    }
    return () => {
      observer.disconnect();
      media.revert();
      reduced.removeEventListener("change", onPreference);
      window.removeEventListener("resize", onResize);
      context.revert();
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/work") return;
    const remember = () => { galleryScroll.current = window.scrollY; };
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [pathname]);

  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-project-link]");
    if (!link || link.target === "_blank") return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/work/") || url.pathname === pathname) return;
    const source = link.querySelector<HTMLImageElement>("img");
    const frame = source?.closest<HTMLElement>("[data-project-frame]") ?? source;
    if (!source || !frame) return;
    if (pathname === "/work") {
      galleryScroll.current = window.scrollY;
      lastProject.current = link.dataset.projectLink ?? null;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = frame.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    event.preventDefault();
    event.stopPropagation();
    clearFlight();
    const overlay = document.createElement("div");
    overlay.className = styles.flight;
    overlay.setAttribute("aria-hidden", "true");
    Object.assign(overlay.style, {
      left: bounds.left + "px", top: bounds.top + "px",
      width: bounds.width + "px", height: bounds.height + "px",
    });
    const image = source.cloneNode() as HTMLImageElement;
    image.removeAttribute("id");
    image.removeAttribute("data-project-hero");
    image.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;object-position:top";
    overlay.append(image);
    document.body.append(overlay);
    source.style.visibility = "hidden";
    flight.current = {
      frame: overlay, source, slug: link.dataset.projectLink!,
      timeout: setTimeout(clearFlight, 2500),
    };
    router.push(url.pathname, { scroll: false });
  };

  return (
    <div ref={root} className={styles.shell} data-work-theme="ink" onClickCapture={navigate}>
      {pathname === "/work" && (
        <div className={styles.workAtmosphere} data-work-atmosphere aria-hidden="true">
          <Antigravity
            count={460}
            paperRange={["projects", "projects-end"]}
            colors={["#D92626", "#E03131", "#AD2121"]}
            colorMode="radial"
            colorSpeed={0}
            magnetRadius={6}
            ringRadius={4.4}
            particleSize={0.46}
            particleVariance={0.12}
            fieldStrength={10}
            waveAmplitude={0.08}
            waveCount={2}
            waveSpeed={0.08}
            rotationSpeed={0}
            pulseSpeed={0.2}
            depthFactor={0.08}
            ambient={0.2}
            lerpSpeed={0.08}
            interactive
            autoAnimate
            clickBurst={false}
            intro={false}
            lightMode={false}
            opacity={0.72}
            maxDevicePixelRatio={1.25}
            className="absolute inset-0"
          />
        </div>
      )}
      {children}
    </div>
  );
}
