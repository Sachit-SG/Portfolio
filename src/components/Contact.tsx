import LineReveal from "./LineReveal";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section
      data-dark
      id="contact"
      className="mt-24 flex flex-col items-start rounded-t-[40px] bg-ink px-6 py-32 text-text-ink sm:px-10 lg:pl-[388px]"
    >

      <a
        href="mailto:sachitghimire2@gmail.com"
        className="group block transition-colors hover:text-ultra-ink"
      >
        <LineReveal
          as="p"
          lines={["Let's talk ↗"]}
          className="font-display text-[11vw] font-bold leading-none tracking-[-0.015em] sm:text-[7vw]"
        />
      </a>

      <Reveal className="mt-16 flex w-full flex-col justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row">
        <p className="max-w-sm text-sm text-muted-ink">
          Open to backend and full stack roles, remote or Kathmandu-based.
        </p>
        <div className="flex gap-8 font-mono text-sm text-muted-ink">
          {/* TODO: swap for Sachit's real profile URLs. */}
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ultra-ink"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ultra-ink"
          >
            GitHub
          </a>
          <a
            href="/sachit-ghimire-cv.pdf"
            className="transition-colors hover:text-ultra-ink"
          >
            Resume
          </a>
        </div>
      </Reveal>

      <p className="mt-24 w-full text-center font-mono text-xs text-muted-ink">
        Sachit Ghimire — {new Date().getFullYear()}
      </p>
    </section>
  );
}
