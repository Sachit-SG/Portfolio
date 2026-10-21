"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./Contact.module.css";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import SectionTexture from "./SectionTexture";

const EMAIL = "sachitghimire2@gmail.com";
const PHONE = "9845913643";

const Lanyard = dynamic(() => import("./Lanyard"), { ssr: false });

function ContactBadge() {
  const host = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "160px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={host} className={styles.badge} aria-label="Sachit Ghimire illustrated ID badge">
      {visible && <Lanyard frontImage="/avatar-portrait.png" cardColor="#f6ece9" size={0.65} strapLength={0.45} strapColor="#38242a" strapWidth={0.65} damping={0.5} elasticity={0.5} breeze={0.3} intro={false} />}
    </figure>
  );
}

export default function Contact({ railInset = true }: { railInset?: boolean }) {
  return (
    <section
      data-dark
      id="contact"
      className={`relative mt-10 overflow-hidden rounded-t-[24px] bg-ink px-6 pb-8 pt-14 text-text-ink sm:px-10 sm:pt-16 ${railInset ? "lg:pl-[288px]" : ""}`}
    >
      <SectionTexture variant="grid" tone="ink" />
      <ContactBadge />

      <div className={`${styles.body} relative mx-auto grid max-w-[1500px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12`}>
        <div>
          <h2 className="inline-flex max-w-full items-center gap-3 font-display text-[clamp(3.25rem,6vw,7rem)] font-bold leading-none tracking-[-0.025em]">
            <span>Let&apos;s talk</span>
            <ArrowUpRight aria-hidden="true" className="mt-2 h-[0.55em] w-[0.55em] shrink-0 stroke-[1.6]" />
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-ink">
            Open to full-stack engineering and workflow automation roles, remote or Kathmandu-based.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${EMAIL}`} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ultra focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Mail aria-hidden="true" size={17} /> {EMAIL}
            </a>
            <a href={`tel:${PHONE}`} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-text-ink transition-colors hover:border-ultra-ink hover:text-ultra-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Phone aria-hidden="true" size={17} /> {PHONE}
            </a>
          </div>
        </div>
        <div aria-hidden="true" className="hidden h-[318px] lg:block" />
      </div>

      <div className="relative mx-auto mt-8 flex max-w-[1500px] flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted-ink">Sachit Ghimire — {new Date().getFullYear()}</p>
        <nav aria-label="Footer links" className="flex flex-wrap gap-x-7 gap-y-3 font-mono text-sm text-muted-ink">
          <a href="https://www.linkedin.com/in/sachit-ghimire-0b77651b3/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-ultra-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">LinkedIn</a>
          <a href="https://github.com/Sachit-SG?tab=repositories" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-ultra-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">GitHub</a>
          <a href="/sachit-ghimire-cv.pdf" className="inline-flex min-h-11 items-center transition-colors hover:text-ultra-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Resume</a>
        </nav>
      </div>
    </section>
  );
}
