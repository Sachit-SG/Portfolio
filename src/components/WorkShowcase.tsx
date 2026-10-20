"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./WorkShowcase.module.css";
import { projects } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

// Entry points into the same /work gallery, not filters or case-study routes.
const folders = [
  { name: "Websites", images: ["thekuwa", "unitech-hydropower"] },
  { name: "Dashboards", images: ["hr-management-system", "qt-contracts"] },
  { name: "Company sites", images: ["lama-fuel", "lama-group"] },
] as const;

export default function WorkShowcase() {
  const section = useRef<HTMLElement>(null);
  const hoverLocked = useRef(false);
  const held = useRef(false);
  const visible = useRef(false);
  const reduced = useRef(false);
  const resumeAt = useRef(0);
  const routing = useRef(false);
  const restart = useRef<(delay?: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (delay = 3400) => {
      clearTimeout(timer);
      const allowed = visible.current && !document.hidden && !reduced.current && !held.current && !routing.current;
      if (section.current) section.current.dataset.loopState = allowed ? "running" : "paused";
      if (!allowed) return;
      timer = setTimeout(() => {
        setActive((current) => (current + 1) % folders.length);
        schedule();
      }, Math.max(delay, resumeAt.current - Date.now()));
    };
    restart.current = schedule;
    const sync = () => { reduced.current = media.matches; schedule(); };
    sync();
    media.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting && entry.intersectionRatio >= .6; schedule(); }, { threshold: [0, .6] });
    const stage = section.current?.querySelector("[data-folder-stage]");
    if (stage) observer.observe(stage);
    const visibility = () => schedule(1800);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", sync); observer.disconnect(); clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); restart.current = () => {}; };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!section.current) return;
      const tl = gsap.timeline({ scrollTrigger: { id: "work-arrival", trigger: section.current, start: "top 86%", end: "top 18%", scrub: .45 } });
      tl.fromTo(section.current.querySelector(`.${styles.intro}`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: "power3.out" })
        .fromTo(section.current.querySelector(`.${styles.stage}`), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "power3.out" }, .2)
        .fromTo(section.current.querySelector(`.${styles.footer}`), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: "power3.out" }, .5);
    });
    return () => mm.revert();
  }, []);

  const choose = (step: number) => {
    resumeAt.current = Date.now() + 6500;
    setActive((current) => (current + step + folders.length) % folders.length);
    restart.current(6500);
  };

  return (
    <section id="work" data-dark data-active-folder={active} ref={section} className={styles.section} aria-labelledby="work-heading">
      <div className={styles.intro}>
        <div><span className={styles.eyebrow}>Selected work</span><h2 id="work-heading">Websites &<br />internal tools.</h2></div>
        <p>Move through the folders to explore real projects. Each opens the full gallery.</p>
      </div>
      <div
        className={`${styles.stage} ${focused ? styles.isFocused : ""}`}
        data-folder-stage
        aria-label="Project folders"
        onPointerLeave={(event) => {
          hoverLocked.current = false;
          if (!event.currentTarget.contains(document.activeElement)) {
            held.current = false;
            setFocused(false);
            resumeAt.current = Date.now() + 1500;
            restart.current(1500);
          }
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node) && !hoverLocked.current) {
            held.current = false;
            setFocused(false);
            resumeAt.current = Date.now() + 1500;
            restart.current(1500);
          }
        }}
      >
        {folders.map((folder, index) => {
          const offset = (index - active + folders.length) % folders.length;
          const place = ["center", "right", "left"][offset];
          return <Link
            key={folder.name}
            href="/work"
            onNavigate={() => { routing.current = true; restart.current(); }}
            className={styles.folder}
            data-place={place}
            aria-label={`${folder.name} — view all projects`}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse" || hoverLocked.current || !window.matchMedia("(hover: hover)").matches) return;
              hoverLocked.current = true;
              held.current = true;
              restart.current();
              setFocused(true);
              setActive(index);
            }}
            onFocus={() => { held.current = true; restart.current(); setFocused(true); setActive(index); }}
          >
            <span className={styles.back} aria-hidden="true"><span className={styles.tab} /></span>
            {folder.images.map((image, paperIndex) => <span className={styles.paper} key={image} data-paper={paperIndex} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={projects.find((project) => project.slug === image)?.media} alt="" draggable="false" />
            </span>)}
            <span className={styles.front}><strong>{folder.name}</strong><span>Explore ↗</span></span>
          </Link>;
        })}
      </div>
      <div className={styles.footer}>
        <div className={styles.current}><strong aria-live="polite">{folders[active].name}</strong><span>Use the arrows to browse</span></div>
        <div className={styles.controls} aria-label="Choose a folder">
          <button type="button" onClick={() => choose(-1)} aria-label="Previous folder"><ArrowLeft size={18} /></button>
          <span>{String(active + 1).padStart(2, "0")} / 0{folders.length}</span>
          <button type="button" onClick={() => choose(1)} aria-label="Next folder"><ArrowRight size={18} /></button>
        </div>
        <Link href="/work" onNavigate={() => { routing.current = true; restart.current(); }} className={styles.viewAll}>View all projects <ArrowUpRight size={20} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
