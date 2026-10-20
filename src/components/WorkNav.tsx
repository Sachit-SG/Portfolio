"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import styles from "@/app/work/work.module.css";

const links = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Skills", href: "/#skills" },
  { label: "Approach", href: "/#approach" },
  { label: "Contact", href: "#contact" },
];

export default function WorkNav() {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  const items = links.map(({ label, href }) => (
    <Link key={href} href={href} scroll={href === "/work" ? false : undefined} aria-current={href === "/work" ? "page" : undefined} onClick={close}>
      {label}
    </Link>
  ));

  return (
    <>
    <a href="#work-content" className={styles.skipLink}>Skip to content</a>
    <header className={styles.siteNav}>
      <Link href="/" className={styles.brand} aria-label="Sachit Ghimire home">SACHIT<span aria-hidden="true">®</span></Link>
      <nav aria-label="Main navigation" className={styles.desktopLinks}>{items}</nav>
      <a href="/sachit-ghimire-cv.pdf" className={styles.resume}>Resume <ArrowUpRight size={16} aria-hidden="true" /></a>
      <details ref={menu} className={styles.mobileMenu} onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
          menu.current?.querySelector("summary")?.focus();
        }
      }}>
        <summary>Menu <ChevronDown size={16} aria-hidden="true" /></summary>
        <nav aria-label="Mobile main navigation">{items}</nav>
      </details>
    </header>
    </>
  );
}
