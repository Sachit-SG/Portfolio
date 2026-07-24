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
    title: "Backend",
    icon: Database,
    detail:
      "Postgres schema design, Node and Express services, and the data models a product is actually built on.",
    tags: ["Node.js", "Express", "PostgreSQL", "Prisma"],
  },
  {
    title: "APIs & Auth",
    icon: ShieldCheck,
    detail:
      "Secured internal APIs, authentication and single sign-on with signed JWTs across separate codebases.",
    tags: ["REST APIs", "JWT / SSO", "Auth flows"],
  },
  {
    title: "Frontend",
    icon: LayoutDashboard,
    detail:
      "Next.js and React interfaces on top of my own APIs — typed, responsive, and built to stay maintainable.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    title: "Platform & data",
    icon: Server,
    detail:
      "Hosting, storage and scheduled work — the operational side that keeps a system running after launch.",
    tags: ["Vercel", "Supabase", "AWS S3", "Cron jobs"],
  },
  {
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = scope.current;
    if (!root) return;
    const wrap = root.querySelector<HTMLElement>("[data-skill-line-wrap]");
    const svg = root.querySelector<SVGSVGElement>("[data-skill-svg]");
    const path = root.querySelector<SVGPathElement>("[data-skill-line]");
    let len = 0;

    // Build the path from the ACTUAL node dots, in 1:1 pixel space, so the line
    // genuinely connects card→card in a smooth weave instead of a guessed curve
    // stretched by preserveAspectRatio. Recomputed whenever the layout changes.
    const buildLine = () => {
      if (!wrap || !svg || !path) return;
      const wr = wrap.getBoundingClientRect();
      const nodes = Array.from(
        wrap.querySelectorAll<HTMLElement>("[data-skill-node]")
      );
      if (nodes.length < 2 || wr.width === 0) return;
      const pts = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - wr.left,
          y: r.top + r.height / 2 - wr.top,
        };
      });
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const my = (a.y + b.y) / 2; // vertical S between alternating-side nodes
        d += ` C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      svg.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`);
      path.setAttribute("d", d);
      len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      // Drawn at rest under reduced motion; hidden (draws on scroll) otherwise.
      path.style.strokeDashoffset = reduce ? "0" : String(len);
    };

    buildLine();
    const ro = new ResizeObserver(() => {
      buildLine();
      ScrollTrigger.refresh();
    });
    ro.observe(wrap ?? root);

    const ctx = gsap.context(() => {
      if (reduce) return;
      // The line draws as the section scrolls. onUpdate reads `len` live, so a
      // resize that rebuilds the path is picked up without recreating anything.
      ScrollTrigger.create({
        trigger: root,
        start: "top 70%",
        end: "bottom 80%",
        scrub: 0.6,
        onUpdate: (self) => {
          if (path) path.style.strokeDashoffset = String(len * (1 - self.progress));
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-skill-card]").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 52,
          x: i % 2 === 1 ? 30 : -30,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
        // Icon lights red as the line reaches the card; reverts on scroll-up.
        ScrollTrigger.create({
          trigger: card,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) =>
            card.classList.toggle("line-reached", self.isActive),
        });
      });
    }, scope);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section id="skills" ref={scope} className="px-6 py-32 sm:px-10 lg:pl-[388px]">
      <Reveal>
        <span className="inline-block w-fit rounded-full border border-border-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ultra">
          What I work with
        </span>
      </Reveal>

      <div data-skill-line-wrap className="relative mt-20">
        {/* Running line — path computed at runtime from the node dots (see
            effect). viewBox is set to the container's pixel size so it draws 1:1
            with no distortion. */}
        <svg
          data-skill-svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          fill="none"
        >
          <path
            data-skill-line
            stroke="var(--ultra)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>

        <div className="flex flex-col gap-12 lg:gap-16">
          {skills.map((s, i) => (
            <article
              key={s.title}
              data-skill-card
              data-card
              className={`group relative w-full max-w-3xl rounded-card border border-border-paper bg-paper-card/60 p-10 backdrop-blur-[20px] sm:p-12 ${
                i % 2 === 1 ? "lg:self-end" : "lg:self-start"
              }`}
            >
              <span
                data-skill-node
                aria-hidden="true"
                className={`absolute top-12 hidden h-4 w-4 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-left-2" : "-right-2"
                }`}
              />

              <div className="flex justify-end">
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
