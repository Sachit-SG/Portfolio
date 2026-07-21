"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    marker: "01",
    title: "Backend",
    detail:
      "Postgres schema design, Node and Express services, and the data models a product is actually built on.",
    tags: ["Node.js", "Express", "PostgreSQL", "Prisma"],
  },
  {
    marker: "02",
    title: "APIs & Auth",
    detail:
      "Secured internal APIs, authentication and single sign-on with signed JWTs across separate codebases.",
    tags: ["REST APIs", "JWT / SSO", "Auth flows"],
  },
  {
    marker: "03",
    title: "Frontend",
    detail:
      "Next.js and React interfaces on top of my own APIs — typed, responsive, and built to stay maintainable.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    marker: "04",
    title: "Platform & data",
    detail:
      "Hosting, storage and scheduled work — the operational side that keeps a system running after launch.",
    tags: ["Vercel", "Supabase", "AWS S3", "Cron jobs"],
  },
  {
    marker: "05",
    title: "Design",
    detail:
      "Two years of design before development — interface systems, layout and motion, without waiting on a designer.",
    tags: ["Figma", "UI systems", "Motion / GSAP"],
  },
];

export default function Skills() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const path = scope.current?.querySelector<SVGPathElement>("[data-skill-line]");
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 65%",
            end: "bottom 85%",
            scrub: 0.6,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-skill-card]").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 52,
          x: i % 2 === 1 ? 30 : -30,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={scope} className="px-6 py-32 sm:px-10">
      <Reveal>
        <span className="inline-block w-fit rounded-full border border-border-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ultra">
          What I work with
        </span>
      </Reveal>

      <LineReveal
        lines={["Skills, and where", "they actually get used."]}
        className="mt-6 max-w-4xl text-5xl font-extrabold leading-[0.92] tracking-[-0.03em] sm:text-7xl"
      />

      <div className="relative mt-20">
        {/* Running line weaving between the cards */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            data-skill-line
            d="M 28 1 C 28 14, 72 17, 72 30 C 72 43, 28 46, 28 59 C 28 72, 72 75, 72 88 C 72 95, 55 97, 48 99"
            stroke="var(--ultra)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
        </svg>

        <div className="flex flex-col gap-10 lg:gap-14">
          {skills.map((s, i) => (
            <article
              key={s.title}
              data-skill-card
              className={`relative w-full max-w-lg rounded-[28px] border border-border-paper bg-paper-card/60 p-8 backdrop-blur-[20px] ${
                i % 2 === 1 ? "lg:self-end" : "lg:self-start"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-10 hidden h-3.5 w-3.5 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-left-1.5" : "-right-1.5"
                }`}
              />

              <span className="font-mono text-xs tracking-[0.2em] text-muted-paper">
                {s.marker}
              </span>

              <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
                {s.title}
              </h3>

              <p className="mt-3 text-[15px] leading-relaxed text-muted-paper">
                {s.detail}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border-paper px-3 py-1.5 font-mono text-[11px] text-muted-paper"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
