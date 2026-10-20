# Approach text — approved 2026-10-20

Keep the existing paragraph and red keyword emphasis. Use IBM Plex Sans for reading text and preserve Clash Display on the heading. Replace the mouse-following floated circle and font-size reveal with a local scramble. All words retain the same size.

Revision after the supplied React Bits source: mouse hover affects every character within 100px. Duration is 1.2 * (1 - distance / 100) seconds, speed 0.5, ease none, overwrite true. No character cap or cooldown. Pointer work is coalesced to one animation frame. Only periods and colons are used. Original glyphs stay in normal flow and decorative glyphs are positioned absolutely, so scrambling cannot change line wrapping.

Use the reference's intersection-triggered intro decode and outward click wave. No scroll pin or idle ticker. Touch and reduced motion retain static text; this accessibility adaptation deliberately differs from the supplied implementation. Keep complete accessible copy outside the decorative glyph layer. Existing React glyph markup replaces SplitText solely to retain keyword styling and server-rendered accessible content; no physical lift/blur/magnify modes are included.

Use the already-installed GSAP ScrambleTextPlugin. No new package or commit.

## Implementation and verification

- Replaced the behavior in LineTextReveal; retained the existing Statement call site.
- Updated Statement to a consistent 1.4 line height.
- Run node scripts/check-scramble.mjs to check accessible copy, original glyphs, invisible absolute overlays, and absence of the floated exclusion or inline font sizing.
- Production build passes.
- Browser geometry, hover feel and live preference switching remain unverified because browser automation access was denied earlier.
