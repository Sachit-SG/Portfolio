# Design-loop bar: desktop navigation and Hero handoff

Reference: https://heynesh.com/ (settled desktop rail inspected 2026-10-06 at 1280 x 720). This is a mechanism bar, not a palette or component-copy brief. The user's explicit exclusion is the pill behind every navigation label.

1. **Thin, persistent rail.** The settled reference rail occupies roughly 200px of a 1280px viewport, begins near the left edge, and leaves the main scene with a clear gap. Ours should reclaim useful content width from the current 332px rail without clipping its logo, labels, meters, or CTA.
2. **One vertical reading path.** Identity, proof, navigation, and contact form a top-to-bottom sequence. Each zone has its own spacing, but the rail reads as one instrument rather than a stack of equally loud cards.
3. **One dominant scene.** The main content is much larger than navigation text; the rail remains readable but secondary. At a settled scroll position, the rail must not compete with selected-work media or the Hero headline.
4. **Active place is unmistakable.** Exactly one section is visually active. Adapt this with Sachit's red marker or rule, not HeyNesh's pill backgrounds on every link. Inactive labels stay plain text.
5. **Motion resolves into a fixed place.** The Hero holds while the rail assembles, then the destination remains stable as the next scene enters. The reverse scroll must disassemble in the opposite order without jumps or duplicate proof.
6. **Proof is continuous, not multiplied.** The same three real stats and the existing SkillMeters remain present across the handoff. Their source and destination versions must not be visibly readable at the same time. Do not animate meter fill or imply proficiency has changed.
7. **Brand skin stays ours.** Keep the established warm paper, ink, red accent, typography roles, and radius logic. Reject HeyNesh yellow, icon/pill menu styling, Webflow-agency copy, and client-logo strip.

Verification for the loop: inspect initial Hero, mid-handoff, settled rail, reverse scroll, and reduced-motion states at laptop and wide-desktop widths. Compare rendered frames with the reference, not source code alone.
