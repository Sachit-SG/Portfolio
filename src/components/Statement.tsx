import WordReveal from "./WordReveal";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";

export default function Statement() {
  return (
    <section className="bg-ink px-6 py-28 text-text-ink sm:px-10 sm:py-36">
      <LineReveal
        lines={["How I work"]}
        className="text-center text-[13.5vw] font-black leading-[0.82] tracking-[-0.055em] lg:text-[11vw]"
      />

      <Reveal className="mt-10 flex justify-center">
        <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-signal">
          The approach
        </span>
      </Reveal>

      <WordReveal
        text="I build the backend that products actually run on — Postgres schema, authentication and SSO, and the internal APIs a team leans on every day. Then the interface on top, when that's what ships the work."
        className="mx-auto mt-10 max-w-6xl text-center text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl"
      />
    </section>
  );
}
