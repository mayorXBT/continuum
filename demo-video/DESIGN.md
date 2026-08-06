# Continuum Demo Video — DESIGN.md

The video inherits Continuum's live design system (`web/src/app/globals.css`). A premium
"security-print on cool paper" look with dramatic near-black navy turns. One brand accent
(navy). Green/red **wax-seal stamps** carry the emotion. Violet is the **$MON coin only**.

## Palette (exact, from globals.css)

| Token | Hex | Use |
| --- | --- | --- |
| paper | `#F4F6F8` | base canvas (light scenes) |
| surface | `#FFFFFF` | cards / panels |
| dark | `#0A0F16` | dramatic scenes (hook, turns, tech) |
| ink navy | `#0E1B2C` | primary text on paper; deep panels |
| ink | `#0E1B2C` | primary text |
| inksoft | `#57616E` | secondary text |
| inkfaint | `#6B7480` | muted labels |
| navy (accent) | `#0E3A6B` | the one brand accent — CTAs, key lines |
| navy-hover | `#0A2B50` | pressed/again accent |
| navy-wash | `#EBF1F8` | tinted inset behind accents |
| line | `#C9D2DC` | hairline borders on paper |
| linestrong | `#C4CDD8` | stronger hairline |
| verified (green) | `#0E6B4F` | VERIFIED stamp / pass state |
| verified-wash | `#E3EFE9` | green stamp fill |
| revoked (red) | `#B3261E` | REVOKED / refused state |
| revoked-wash | `#F7E6E4` | red stamp fill |
| darksurface | `#101823` | cards on dark scenes |
| darkline | `#22303F` | borders on dark scenes |
| darktext | `#E9EEF4` | text on dark scenes |
| darkmuted | `#94A3B4` | muted text on dark scenes |
| seal (violet) | `#5B4FD1` | **$MON coin accent only** — never UI chrome |

Coin/violet families (from the supplied $MON renders): base `#6C5CE7`-ish violet, deep
`#4B3FBF`, highlight `#EDEBFF`. Keep the coin's own material; do not recolor it navy.

## Typography

- **Display / headlines:** Space Grotesk (fallback Bricolage Grotesque), weight 700–800.
  Tight tracking `-0.02em`. Min 60px; hero ≥ 84px.
- **Data / labels:** IBM Plex Mono (fallback JetBrains Mono), 500–600. **Tabular numerals**
  for every figure. Uppercase + `0.14em` tracking for metadata "eyebrow" labels. Min 16px.
- **Supporting copy:** Space Grotesk / Manrope 350–450, min 20px.

## Motif system

- **Wax-seal stamp** — a rounded-rect chip with a slight `-2deg` rotate; green
  `VERIFIED ✓` / red `REVOKED`. Lands with a "thunk" (scale 1.15→1, 120ms, backOut) + SFX.
- **Hexagon C mark** — the Continuum logo, recurring accent; draws in on the logo beats.
- **$MON coin** — the violet coin (supplied render) is the staked asset; it travels the
  transfer route carrying a tiny seal ("the rule travels with the token").
- **Guilloché grid** — fine concentric arc lines behind dark scenes (banknote-quiet, ~4%
  opacity), matching `.guilloche` in globals.css.

## Motion

- Primary transition: horizontal push, 0.35–0.45s, `power3.inOut`.
- Accents: mechanical shutter (enforcement→stakes), controlled zoom-through (into exit /
  architecture), gentle blur crossfade (final wind-down).
- Deterministic only (no `Math.random`/`Date.now`, no infinite loops). Reduced-motion safe.

## Layout / safety

- 1920×1080, 16:9. Keep all key text within a centered 1080×1350 safe box so a later
  1080×1920 vertical crop keeps everything. Captions in the lower safe band, never over
  a control being demoed.
