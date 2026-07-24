import WordReveal from "./WordReveal";
import LineReveal from "./LineReveal";

export default function Statement() {
  return (
    <section className="bg-paper px-6 py-28 text-text-paper sm:px-10 sm:py-36 lg:pl-[388px]">
      <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-ultra">
        The approach
      </p>
      <LineReveal
        lines={["How I work"]}
        className="font-display text-center text-[13.5vw] font-bold leading-[0.82] tracking-[-0.03em] lg:text-[11vw]"
      />

      {/* WordReveal already does the word-by-word appear-on-scroll. */}
      <WordReveal
        text="I build the backend that products actually run on — Postgres schema, authentication and SSO, and the internal APIs a team leans on every day. Then the interface on top, when that's what ships the work."
        className="font-display mx-auto mt-10 max-w-6xl text-center text-3xl font-medium leading-[1.12] tracking-[-0.005em] sm:text-5xl"
      />
    </section>
  );
}
