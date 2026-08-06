# BRIEF.md — Continuum hackathon demo

workflow: general-video
flow: standalone

## Deliverable
An ~85s narrated hackathon demo video (1920×1080, 30fps, H.264 MP4) for **Continuum**,
permissioned liquid staking on Monad testnet. Native HTML/SVG recreation of the app UI
states (no screen-captured footage). Burned captions, TTS narration, subtle technical
music + restrained UI SFX. Also composable into a 1080×1920 vertical crop and a 15–20s
teaser.

## Source of truth
Full shot list, narration, palette, and accuracy rules: `../docs/demo-video-prompt.md`.
Design tokens: `./DESIGN.md`. Do not deviate from the accuracy rules.

## Narrative (8 scenes)
1. Hook / problem — "checked once, at the door… then never looks again" (dark).
2. Consequence — lock it away to earn, or stay liquid and risk it; a flag freezes funds.
3. Introduce Continuum — "compliance that travels with the token".
4. How it works — stake MON → stMON, liquid, earns; transfer to verified passes.
5. Money shot — two verified wallets, one refused (tier 30 vs tier 10); Cleanverse's rule.
6. Compliance without confiscation — revoked → reviewed exit → 1.1 MON returned.
7. Tech & Cleanverse — every action asks the on-chain validator; fail-closed.
8. Proof & close — live on Monad testnet; "compliance that travels with the token".

## Accuracy (must hold)
- Rewards are simulated on testnet (say so). Testnet only; no production claims.
- stMON is a policy-gated receipt, NOT a CVA. Never call it a CVA.
- No fabricated tx hashes/balances. Real addresses from the prompt only.
- Cleanverse validator `0xaC7e5179C2C7f03f209136886c172eb34F161792` decides eligibility.

## Assets
- Continuum mark: `../web/public/continuum-mark.png` (navy), `continuum-mark-light.png` (paper).
- $MON coin: user-supplied violet render → drop into `./assets/mon-coin.png` (vector
  fallback used until then).

## Voice
HyperFrames TTS, voice `af_nova` (alt `af_heart`), speed ~1.02. Confident, precise,
conversational — not trailer-exaggerated.
