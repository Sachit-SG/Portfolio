"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import LineReveal from "./LineReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Work() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // Desktop only: pin the section and translate the track horizontally.
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const t = track.current;
        const sec = section.current;
        if (!t || !sec) return;
        // Measure against the track's own container, not the window — the whole
        // page sits in a 332px left inset for the rail, so window.innerWidth
        // overstates the visible width and the track stops short.
        const distance = () =>
          Math.max(0, t.scrollWidth - (t.parentElement?.clientWidth ?? 0) + 40);
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: () => "+=" + distance(),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      }
    );
    return () => mm.revert();
  }, []);

  // Cards rise + scale into place as the track first comes into view.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-project-card]", {
        opacity: 0,
        y: 56,
        scale: 0.96,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: track.current, start: "top 90%", once: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      data-dark
      ref={section}
      className="relative bg-ink py-24 text-text-ink lg:pl-[388px] lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0"
    >
      <div className="mb-10 px-6 sm:px-10">
        <LineReveal
          lines={["Built for production.", "Made to last."]}
          className="font-display mt-5 max-w-4xl text-5xl font-medium leading-[0.92] tracking-[-0.015em] sm:text-7xl"
        />
      </div>

      {/* min-h-0 is what lets flex-1 actually shrink here — without it the track
          keeps its content height and overflows the pinned viewport. */}
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-10">
        <div
          ref={track}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 will-change-transform sm:px-10 lg:h-full lg:overflow-x-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
          <div className="w-2 shrink-0 sm:w-10" aria-hidden />
        </div>
      </div>
    </section>
  );
}
