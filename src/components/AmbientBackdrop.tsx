/**
 * Persistent ambient texture behind the whole page.
 *
 * Why this exists: `backdrop-filter` is invisible over a flat colour. Glass cards
 * only read as glass when there is something behind them to distort. heynesh gets
 * this from a fixed, blurred hero photo; we use the same scene at low opacity so it
 * warms the cream instead of darkening it.
 */
export default function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-scene.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.09] blur-[70px]"
      />
      {/* Warm glows so the texture reads as light, not muddy */}
      <div className="absolute -left-[12%] top-[14%] h-[46vw] w-[46vw] rounded-full bg-signal/10 blur-[130px]" />
      <div className="absolute -right-[8%] bottom-[8%] h-[40vw] w-[40vw] rounded-full bg-ultra/10 blur-[140px]" />
    </div>
  );
}
