import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, Pause } from "lucide-react";
import { projects } from "@/lib/projects";
import Galaxy from "@/components/Galaxy";
import styles from "./work.module.css";

export const metadata = {
  title: "Work — Sachit Ghimire",
  description: "Selected websites and internal tools by Sachit Ghimire, with project scope, role and development status.",
};

const heroFrames = Array.from({ length: 30 }, (_, index) => {
  const offset = index / 30;
  const position = offset * 2 - 1;
  return { project: projects[(index + 2) % projects.length], position, offset, index };
});

export default function WorkPage() {
  return (
    <main id="work-content" tabIndex={-1} className={styles.page} data-work-page="/work">
      <section className={styles.workHero} aria-labelledby="work-title">
        <Galaxy
          className={styles.heroGalaxy}
          aria-hidden="true"
          data-work-galaxy
          density={0.8}
          starColors={["#F6ECE9", "#F6ECE9", "#BDA8A8", "#D92626"]}
          glowIntensity={0.22}
          flareIntensity={0.2}
          starSize={0.75}
          twinkleIntensity={0.15}
          starSpeed={0.35}
          speed={0.55}
          rotationSpeed={0.015}
          layers={3}
          repulsionStrength={0.3}
          clickWarp={false}
          intro
          opacity={0.62}
          dpr={1.25}
        />
        <h1 id="work-title" tabIndex={-1}>Work, in the wild.</h1>
        <div className={styles.heroDeck} data-hero-deck aria-hidden="true">
          {heroFrames.map(({ project, position, offset, index }) => (
            <div
              className={styles.heroFrame}
              key={`${index}-${project.slug}`}
              style={{
                zIndex: Math.round(Math.abs(position) * 10),
                aspectRatio: `${project.mediaWidth ?? 1200} / ${project.mediaHeight ?? 750}`,
                "--frame-left": `${-20 + offset * 140}%`,
                "--frame-offset": String(offset),
                "--frame-scale": String(0.36 + Math.abs(position) * 0.64),
                "--frame-yaw": `${-position * 34}deg`,
              } as CSSProperties}
            >
              {/* These repeats form the visual image tunnel; the project list below is the source of truth. */}
              <Image src={project.media} alt="" width={project.mediaWidth ?? 1200} height={project.mediaHeight ?? 750} sizes="(max-width: 700px) 220px, 310px" loading={index < 6 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <p className={styles.heroSummary}>Selected websites and internal tools, including work in development.</p>
        <div className={styles.heroControls}>
          <a className={styles.exploreLink} href="#projects">Explore the projects <ArrowDown size={17} aria-hidden="true" /></a>
          <label className={styles.motionControl}>
            <input type="checkbox" aria-label="Pause project image animation" />
            <Pause size={14} aria-hidden="true" /> Pause images
          </label>
        </div>
      </section>

      <section className={styles.imageScene} data-work-scene aria-labelledby="scene-title">
        <div className={styles.sceneStage}>
          <div className={styles.sceneCopy} data-scene-copy>
            <h2 id="scene-title">Design. Build.</h2>
          </div>
          <div className={styles.sceneImage} data-scene-image>
            <Image src={projects[0].media} alt="Lama Fuel website" width={projects[0].mediaWidth ?? 1200} height={projects[0].mediaHeight ?? 750} sizes="100vw" />
          </div>
          <span className={styles.sceneIndex} aria-hidden="true">01 <i /> 06</span>
        </div>
      </section>

      <section className={styles.projectSection} id="projects" tabIndex={-1} aria-labelledby="projects-title">
        <div className={styles.projectHeading}>
          <h2 id="projects-title">Projects</h2>
          <span>{String(projects.length).padStart(2, "0")} projects</span>
        </div>
        <aside className={styles.workContext} aria-label="Employment context">
          <span>Experience</span>
          <p><strong>Software Engineer</strong> · Beez Consulting, Nepal · part of Lama Group, Texas</p>
        </aside>
        <div className={styles.gallery}>
        {projects.map((project) => (
          <Link key={project.slug} href={`/work/${project.slug}`} className={styles.project} data-project-link={project.slug} data-work-reveal>
            <div className={styles.media}>
              <Image data-project-frame src={project.media} alt={`${project.name} ${project.type.toLowerCase()} screenshot`} width={project.mediaWidth ?? 1200} height={project.mediaHeight ?? 750} sizes="(max-width: 700px) 90vw, (max-width: 1000px) 44vw, 28vw" />
            </div>
            <div className={styles.caption}>
              <div className={styles.projectCopy}>
                <div className={styles.captionTitle}><h3>{project.name}</h3><ArrowUpRight size={21} aria-hidden="true" /></div>
                <p>{project.blurb}</p>
                <span className={styles.projectMeta}><span>{project.type}</span><span>{project.role}</span>{project.status && <span className={styles.projectStatus}>{project.status}</span>}</span>
              </div>
            </div>
          </Link>
        ))}
        </div>
        <span id="projects-end" aria-hidden="true" />
      </section>
    </main>
  );
}
