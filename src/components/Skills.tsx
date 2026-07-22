"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Reveal from "./Reveal";
import CardIcon from "./CardIcon";
import {
  Database,
  ShieldCheck,
  LayoutDashboard,
  Server,
  PenTool,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    marker: "01",
    title: "Backend",
    icon: Database,
    detail:
      "Postgres schema design, Node and Express services, and the data models a product is actually built on.",
    tags: ["Node.js", "Express", "PostgreSQL", "Prisma"],
  },
  {
    marker: "02",
    title: "APIs & Auth",
    icon: ShieldCheck,
    detail:
      "Secured internal APIs, authentication and single sign-on with signed JWTs across separate codebases.",
    tags: ["REST APIs", "JWT / SSO", "Auth flows"],
  },
  {
    marker: "03",
    title: "Frontend",
    icon: LayoutDashboard,
    detail:
      "Next.js and React interfaces on top of my own APIs — typed, responsive, and built to stay maintainable.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    marker: "04",
    title: "Platform & data",
    icon: Server,
    detail:
      "Hosting, storage and scheduled work — the operational side that keeps a system running after launch.",
    tags: ["Vercel", "Supabase", "AWS S3", "Cron jobs"],
  },
  {
    marker: "05",
    title: "Design",
    icon: PenTool,
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
          duration: 0.5,
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
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.85"
          />
        </svg>

        <div className="flex flex-col gap-12 lg:gap-16">
          {skills.map((s, i) => (
            <article
              key={s.title}
              data-skill-card
              data-card
              className={`group relative w-full max-w-3xl rounded-xl border border-border-paper bg-paper-card/60 p-10 backdrop-blur-[20px] sm:p-12 ${
                i % 2 === 1 ? "lg:self-end" : "lg:self-start"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-12 hidden h-4 w-4 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-left-2" : "-right-2"
                }`}
              />

              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-sm tracking-[0.2em] text-muted-paper">
                  {s.marker}
                </span>
                <CardIcon icon={s.icon} className="h-11 w-11 shrink-0" />
              </div>

              <h3 className="font-display mt-4 text-6xl font-bold leading-none tracking-[-0.03em] text-ultra-bright sm:text-7xl">
                {s.title}
              </h3>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-paper">
                {s.detail}
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border-paper px-3.5 py-2 font-mono text-xs text-muted-paper"
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
