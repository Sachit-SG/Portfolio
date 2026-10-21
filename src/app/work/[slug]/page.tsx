import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import styles from "../work.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return { title: `${project.name} — Sachit Ghimire`, description: project.blurb };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return <main id="work-content" tabIndex={-1} className={styles.page} data-work-page={`/work/${project.slug}`}>
    <Link href="/work" scroll={false} className={styles.back}><ArrowLeft size={16} /> All projects</Link>
    <div className={styles.detailIntro}>
      <div className={styles.detailHeading} data-work-title>
        <h1 tabIndex={-1}>{project.name}</h1>
        <p>{project.blurb}</p>
      </div>
      <div className={styles.detailIndex}>
        <span className={styles.caseNumber}>CASE {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
        <span>{project.type}</span>
        <span>{project.role} · {project.year}</span>
        {project.href && <a href={project.href} target="_blank" rel="noopener noreferrer">{slug === "hr-management-system" ? "Open sign-in page" : "Visit live site"} <ArrowUpRight size={18} /></a>}
      </div>
    </div>
    <figure className={styles.projectHero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-project-hero src={project.media} alt={`${project.name} ${project.type.toLowerCase()} screenshot`} width={project.mediaWidth ?? 1200} height={project.mediaHeight ?? 750} fetchPriority="high" />
      <figcaption><span>{project.mediaCaption ?? `${project.name} interface.`}</span><a href={project.media} target="_blank" rel="noopener noreferrer">View full-size image <ArrowUpRight size={16} /></a></figcaption>
    </figure>
    <section className={styles.story} data-work-reveal aria-label="Project context and contribution">
      <dl className={styles.facts}>
        <div><dt>My role</dt><dd>{project.role}</dd></div>
        <div><dt>Built with</dt><dd>{project.stack.join(" · ")}</dd></div>
        {project.status && <div><dt>Status</dt><dd>{project.status}</dd></div>}
        {project.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
      </dl>
      <div className={styles.narrative}>
        <div>
          <span className={styles.narrativeLabel}>The brief</span>
          <h2>What the project needed</h2>
          <p>{project.problem}</p>
        </div>
        <div>
          <span className={styles.narrativeLabel}>My part</span>
          <h2>What I built</h2>
          <p>{project.contribution}</p>
        </div>
      </div>
    </section>
    <section className={styles.next} data-work-reveal aria-label="Next project">
      <Link href={`/work/${next.slug}`} data-project-link={next.slug}>
        <div><span>Continue to the next project</span><h2>{next.name} <ArrowUpRight aria-hidden="true" /></h2></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className={styles.nextMedia} data-project-frame><img src={next.media} alt={`${next.name} preview`} width={next.mediaWidth ?? 1200} height={next.mediaHeight ?? 750} loading="lazy" /></div>
      </Link>
    </section>
  </main>;
}
