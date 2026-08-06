# Continuum — Hackathon Demo Video Prompt (HyperFrames)

Create a polished **80–90 second** hackathon demo video for **Continuum** using HyperFrames.

Narrative arc, in order: **a real problem normal users face → the consequences it
causes them → how Continuum solves it → the tech (and how Cleanverse is integrated),
explained so anyone understands.** Dramatic, high-trust, premium — hooks judges in the
first seven seconds.

---

## PROJECT

Continuum is **permissioned liquid staking** on Monad testnet.

A verified user stakes **MON** and receives **stMON** — a transferable receipt that keeps
earning while it's held. Unlike normal staking, it never locks up. And unlike most
"compliant" DeFi, the compliance rule lives **in the token, not the app**: every transfer
re-checks the recipient's identity credential on-chain. If a credential is ever revoked,
the position is frozen for circulation but **never confiscated** — the holder exits through
review and gets principal plus yield back.

Eligibility is not decided by Continuum. It's decided by **Cleanverse's on-chain
compliance validator**, which Continuum registers with as a compliance pool. Continuum
cannot wave anyone through.

- Live on Monad testnet (chain **10143**).
- 5 contracts, 53 passing tests, every demo beat verified on-chain.
- Built for the Cleanverse Build: Trusted Assets hackathon (DeFi track).

## CORE STORY (use these real, verified facts — do not fabricate)

Two proof moments carry the film:

**1. Blocked by the rule, not by us (the money shot).**
Two wallets, both holding a **valid, active Cleanverse A-Pass**:
- Wallet A — sub-tier **60** → transfer **settles**.
- Wallet C — sub-tier **10** → stMON transfer **reverts on-chain: `NotVerified`**.

The pool rule is `min_sub_tier 30`. The low-tier wallet is even verified in Continuum's own
local registry — so the *only* thing refusing it is **Cleanverse's rule**, enforced by
their validator contract. Continuum's code did not decide this.

**2. Compliance without confiscation.**
A revoked holder is frozen from circulating, requests a controlled exit to a verified
wallet, an officer reviews it, eligibility is re-checked at approval **and** at settlement,
the receipt burns, and the underlying MON is delivered. In the live test the revoked holder
walked away with **1.1 MON** — principal plus earned yield.

## ACCURACY REQUIREMENT (honesty, like a real submission)

- **Rewards are simulated on testnet** (a deterministic drip that raises redemption value).
  Say so on screen at least once. Do not imply real yield.
- **This is testnet.** Tokens have no monetary value. Do not claim production readiness.
- **stMON is a policy-gated receipt, not a CVA / A-Token.** Never call it a CVA on screen or
  in narration.
- **Do not fabricate transaction hashes or balances.** Use real product footage, the real
  explorer (testnet.monadexplorer.com), and the real deployed addresses below. Where a hash
  is shown, it must be a real one from the deployment.
- Include one tasteful disclosure line (see Scene 8): production A-Pass issuance runs through
  Cleanverse identity verification; the demo uses sandbox credentials under the hackathon's
  relaxed KYC.

Real deployed addresses (Monad testnet, chain 10143):
- ComplianceRouter — `0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6`
- StMON — `0x940d14C41d6F8E47549e51402219898398C8b31a`
- StakingVault — `0x75dC8959c906679f477F9c8720A0656589B4A37a`
- RedemptionQueue — `0x1819cA49E22e143025eCb5689873D2155E7647Db`
- Cleanverse validator (IAPassComplianceValidator) — `0xaC7e5179C2C7f03f209136886c172eb34F161792`

## OUTPUT SPECIFICATIONS

- Main video: **1920 × 1080**, 16:9, **30 fps**, ~**85 seconds**, H.264 MP4.
- Audio: professional English voiceover, subtle technical music, restrained UI sound.
- Compose so it can be adapted later to a **1080 × 1920** vertical cut — keep key text in a
  central safe area suitable for cropping.
- Burned-in captions, **one group at a time**, **3–5 words** per group.
- Highlight these keywords: **"stMON," "liquid," "NotVerified," "tier 30," "tier 10,"
  "FROZEN," "NEVER CONFISCATED," "1.1 MON," "fail-closed," "Cleanverse validator."**

## PRONUNCIATION

- Continuum → "con-TIN-you-um"
- stMON → "staked MON"
- MON → "mon"; Monad → "MOH-nad"
- Cleanverse → "CLEAN-verse"; A-Pass → "A pass"

---

## VISUAL IDENTITY

Create **DESIGN.md** before writing the composition. Match Continuum's actual site — a
premium "security-print on cool paper" system with dramatic dark-navy turns. Do **not**
invent a new style.

**Palette:**
- Paper canvas (base): `#F4F6F8`
- Surface (cards): `#FFFFFF`
- Dramatic dark (hook + turns): `#0A0F16`; ink navy `#0E1B2C`
- Primary text: `#0E1B2C`
- Muted text: `#57616E` / `#6B7480`
- Navy accent (the one brand accent): `#0E3A6B`
- Verified green: `#0E6B4F` (wash `#E3EFE9`)
- Revoked red: `#B3261E` (wash `#F7E6E4`)
- Seal violet — used *only* as a tiny accent: `#5B4FD1`
- Hairlines: `#C9D2DC` / `#E6E8EC`

**Typography:**
- Headlines: Space Grotesk (or Bricolage Grotesque), 700–800, ≥ 60px.
- Data / interface labels: IBM Plex Mono (or JetBrains Mono), 500–600, tabular numerals,
  uppercase + tracked for metadata labels, ≥ 16px.
- Supporting copy: Space Grotesk / Manrope 350–450, ≥ 20px.

**Visual character:**
- Premium financial / security-print. Light paper canvas with fine **guilloché** grid
  arcs; dramatic near-black navy for the hook and emotional turns.
- Recurring **wax-seal "stamp"** motif — a green `VERIFIED ✓` stamp and a red `REVOKED`
  stamp are the emotional language of the film (this is already Continuum's identity).
- The **hexagon C** mark as a recurring accent.
- Structured split-screens, hairline borders, large type, restrained motion.
- **No:** cyberpunk, purple/blue gradients, glassmorphism, floating 3D coins, robots or
  humanoid-AI imagery, stock footage, fake blockchain transactions, excessive glow,
  full-screen gradients, generic SaaS cards.

## ASSETS

- Continuum mark (navy, for light bg): `C:\Users\hp\Downloads\Continuum\web\public\continuum-mark.png`
- Continuum mark (paper, for dark bg): `C:\Users\hp\Downloads\Continuum\web\public\continuum-mark-light.png`
- Brand source: `C:\Users\hp\Downloads\Continuum\docs\brand-ink.png`, `brand-paper.png`
- Live product: run `npm run dev` in `web/` → `http://localhost:3000` (use the deployed URL
  if one exists).

Capture fresh product footage at 1920 × 1080, browser zoom 100%, no bookmarks/extensions/
personal info. Capture:
1. Landing hero — "Stake MON. Stay liquid. Stay verified."
2. The hero transfer-route demo (A → B pass, C blocked).
3. `/app` — Verify panel showing a **live A-Pass record** (tier, sub-tier, expiry).
4. `/app` — Stake: 10 MON → stMON; the rate readout.
5. `/app` — a transfer that **reverts** for the low-tier wallet (`NotVerified`).
6. `/app` — the **enforcement strip**: "Local AND Cleanverse · CVI GATE ON · VALIDATOR RESPONDING".
7. `/app` — Console: the redemption-request review queue (officer actions).
8. `/security` — the controlled-exit timeline + the 100% / 100% / 0-seizures guarantee strip.
9. `/docs` — the deployed-addresses table and the `complianceVerify` example.
10. The Monad explorer showing the ComplianceRouter or validator address.

---

## NARRATIVE STRUCTURE

### SCENE 1 — THE HOOK / THE PROBLEM (0:00–0:10)
**Visual:** near-black navy, fine guilloché arcs. A single green `VERIFIED ✓` stamp thunks
down at a stylized "door." Then time passes — a faint clock/blocks tick — and nothing
re-checks. Text block-reveals:
- "COMPLIANT CRYPTO CHECKS YOU ONCE."
- "AT THE DOOR."
- then, sharp: "THEN NEVER LOOKS AGAIN."

**Voiceover:** "Compliant crypto checks who you are once — at the door. After that, nothing
ever looks again."
**Transition:** 0.4s directional push.

### SCENE 2 — THE CONSEQUENCE FOR USERS (0:10–0:23)
**Visual:** split frame, two bad outcomes.
- Left: "TO EARN, LOCK IT AWAY" — a vault clamping shut over a balance (illiquid).
- Right: a later flag lands and a red `SEIZED` stamp slams over a wallet balance.
Small data lines animate in: "credential lapses → position frozen", "sanctioned → funds
stranded".

**Voiceover:** "So you get two bad options. Lock your money away to earn — or stay liquid
and risk it. And the day something changes about your status, most protocols just freeze
your funds. Your money, stuck behind a wall. That gap is why real capital stays off-chain."
**Transition:** primary push; the frame brightens from navy toward paper.

### SCENE 3 — INTRODUCE CONTINUUM (0:23–0:31)
**Visual:** paper canvas reveal. The hexagon mark draws in; the CONTINUUM wordmark.
- "COMPLIANCE THAT TRAVELS WITH THE TOKEN."
- three tracked labels sequence in: `STAY LIQUID` · `STAY VERIFIED` · `NEVER SEIZED`.

**Voiceover:** "Continuum is permissioned liquid staking — built so the rule travels with
the token, not the app."
**Transition:** restrained horizontal push into live product footage.

### SCENE 4 — HOW IT WORKS FOR A USER (0:31–0:45)
**Visual:** real `/app` footage. Stake **10 MON** → receive **10 stMON**. The rate reads
`1.0000` and ticks up; the balance stays flat while a small "redemption value" figure climbs
(caption: "rewards simulated on testnet"). Then a transfer to a verified wallet — a green
`A-PASS ✓` stamp, "settled".

**Voiceover:** "Stake MON, get stMON — a receipt that keeps earning while you hold it, and
stays usable from the very first block. No lockup. Send it to anyone verified, and the token
itself checks them — every single time."
**Transition:** controlled push into the split-wallet comparison.

### SCENE 5 — THE MONEY SHOT: BLOCKED BY THE RULE, NOT BY US (0:45–0:58)
**Visual:** two wallet cards side by side, **both stamped green `A-PASS ✓ · ACTIVE`**.
- Wallet A: `sub-tier 60` → transfer line completes, green.
- Wallet C: `sub-tier 10` → the transfer line halts; red `NotVerified` revert stamp.
Then a hairline connector points from the block to a small card: `Cleanverse validator
0xaC7e…1792 · rule: min sub-tier 30`. Text: "BOTH VERIFIED." → "ONE REFUSED." → "THE RULE
ISN'T OURS TO BEND."

**Voiceover:** "Here's the part that matters. Both of these wallets are verified. But our
pool requires tier thirty — and this one is ten. So the transfer reverts, on-chain. We
didn't write that limit into our contract. Cleanverse's validator did. We can't wave anyone
through."
**Transition:** mechanical shutter — from enforcement to the human stakes.

### SCENE 6 — COMPLIANCE WITHOUT CONFISCATION (0:58–1:11)
**Visual:** a red `REVOKED` stamp lands on a holder. Then the controlled-exit timeline
animates: `Revoked → Requested → Officer review → Re-check → Settled`. The receipt burns;
MON flows to a verified wallet. Big figure: **1.1 MON returned** with a small "principal +
yield" label. Text: "FROZEN FOR CIRCULATION." → "NEVER CONFISCATED."

**Voiceover:** "And if your credential is ever revoked? You're frozen from circulating — but
never confiscated. You request an exit to a verified wallet, an officer reviews it,
eligibility is re-checked, and your money comes back. In our live test, a revoked holder
walked away with one-point-one MON — everything they put in, plus what it earned.
Compliance without confiscation."
**Transition:** controlled zoom-through into the architecture.

### SCENE 7 — THE TECH & CLEANVERSE INTEGRATION (1:11–1:22)
**Visual:** a clean connected-node diagram. Core: `stMON token layer`. Router:
`ComplianceRouter`. A thin connector to `Cleanverse · IAPassComplianceValidator ·
0xaC7e…1792`. Every gated action (`stake` / `transfer` / `exit`) draws a line to the
validator and back. Then real footage of the enforcement strip: **"Local AND Cleanverse ·
CVI GATE ON · VALIDATOR RESPONDING."** Text: "EVERY ACTION ASKS THE SAME VALIDATOR." →
"CAN'T ANSWER? REFUSED." → `FAIL-CLOSED`.

**Voiceover:** "Under the hood, every stake, transfer, and exit asks the same on-chain
validator — the one Cleanverse deployed on Monad. Continuum registers as a compliance pool,
and if the validator can't answer, the transaction is refused. Fail-closed, by default."
**Transition:** gentle blur crossfade into the close.

### SCENE 8 — PROOF & CLOSE (1:22–1:26)
**Visual:** back to the mark and wordmark on paper. Quiet proof row: "Live on Monad testnet"
· "5 contracts, 53 tests" · real explorer glimpse. A small honest disclosure line at the
bottom (see below). Final lock-up:
- "STAKE. STAY LIQUID. STAY VERIFIED."
- "COMPLIANCE THAT TRAVELS WITH THE TOKEN."
- `continuum` · `Cleanverse Build: Trusted Assets` · `Built on Monad`

Disclosure (small, legible): "Live on Monad testnet. Rewards simulated. Production A-Pass
issuance runs through Cleanverse identity verification."

**Voiceover:** "Continuum is live on Monad testnet — gated by Cleanverse from the first
block to the last. Stake. Stay liquid. Stay verified. Compliance that travels with the
token."
Hold the final frame ≥ 2.5s; optional fade to black in the last 0.7s.

---

## FULL VOICEOVER SCRIPT

"Compliant crypto checks who you are once — at the door. After that, nothing ever looks
again.

So you get two bad options. Lock your money away to earn — or stay liquid and risk it. And
the day something changes about your status, most protocols just freeze your funds. Your
money, stuck behind a wall. That gap is why real capital stays off-chain.

Continuum is permissioned liquid staking — built so the rule travels with the token, not the
app.

Stake MON, get stMON — a receipt that keeps earning while you hold it, and stays usable from
the very first block. No lockup. Send it to anyone verified, and the token itself checks
them, every single time.

Here's the part that matters. Both of these wallets are verified. But our pool requires tier
thirty — and this one is ten. So the transfer reverts, on-chain. We didn't write that limit
into our contract. Cleanverse's validator did. We can't wave anyone through.

And if your credential is ever revoked? You're frozen from circulating — but never
confiscated. You request an exit to a verified wallet, an officer reviews it, eligibility is
re-checked, and your money comes back. In our live test, a revoked holder walked away with
one-point-one MON — everything they put in, plus what it earned. Compliance without
confiscation.

Under the hood, every stake, transfer, and exit asks the same on-chain validator — the one
Cleanverse deployed on Monad. Continuum registers as a compliance pool, and if the validator
can't answer, the transaction is refused. Fail-closed, by default.

Continuum is live on Monad testnet — gated by Cleanverse from the first block to the last.
Stake. Stay liquid. Stay verified. Compliance that travels with the token."

---

## VOICE AND AUDIO

- Generate narration with HyperFrames TTS. Preferred voice **af_nova**; alternative
  **af_heart**. Speed ~**1.02**. Confident, precise, conversational — not trailer-exaggerated.
- Generate `narration.wav`; transcribe to word-level timestamps; build captions from the
  actual timestamps.
- SFX: a satisfying **stamp "thunk"** on each `VERIFIED`/`REVOKED` stamp; restrained
  terminal clicks; low impacts on transitions. Keep them subtle.
- Music: minimal, modern, technical, tense-then-resolving; ~**18–22 dB below narration**;
  duck under key numbers and the final line. No copyrighted commercial music.

## CAPTION STYLE

- Lower safe area, never covering product controls. IBM Plex Mono or Space Grotesk.
- White captions with selected **navy / green / red** keywords. Tabular numerals.
- One group at a time, 3–5 words, hard kill after each. Subtle opacity + vertical entrance.
- Emphasize key numbers at scale ≤ 1.08. No karaoke, no per-word animation.

## MOTION DIRECTION

- Primary transition: horizontal push, 0.35–0.45s, `power3.inOut`.
- Accents: mechanical shutter (enforcement → human stakes); controlled zoom-through (into the
  exit / architecture); gentle blur crossfade (final wind-down).
- Every scene has entrance animations; no jump cuts; the transition handles the outgoing
  scene; only the final scene fades out. Deterministic animation only — no `Math.random()` /
  `Date.now()`, no infinite loops. Animate wrappers around media, not media dimensions.
- The recurring **stamp thunk** and a small **token-with-seal** that gets checked at each hop
  are the signature motions — reuse them, don't over-invent.

## HYPERFRAMES IMPLEMENTATION

Create: `DESIGN.md`, `index.html`, `compositions/` (if sub-comps help), `assets/`,
`narration.wav`, `transcript.json`, `final-continuum-demo.mp4`.

- Root composition: `data-composition-id`, `data-start="0"`, `data-duration`,
  `data-width="1920"`, `data-height="1080"`; consistent `data-track-index`.
- Timelines created synchronously, every GSAP timeline **paused**, registered via
  `window.__timelines`. Muted `playsinline` video clips; audio via a separate audio element;
  never manually control media playback; never `repeat: -1`.
- Build each scene's final layout first, then add animations. Flex layouts + safe padding;
  reserve absolute positioning for decoration and captions. CSS transitions over WebGL unless
  a shader is materially better; don't mix transition systems.

## QUALITY CONTROL

Before rendering: `npx hyperframes lint`, `npx hyperframes validate`,
`npx hyperframes inspect --samples 15`. Fix text overflow, caption collisions, unsafe
cropping, contrast, missing entrance animations, transition gaps, dead frames, broken media
paths. Generate + inspect the animation map. Preview end to end. Verify **every financial
number against this brief**, and verify the video **never claims real yield, production
readiness, or a CVA**. Then render `final-continuum-demo.mp4`.

## FINAL DELIVERABLES

- Rendered MP4 + HyperFrames source dir + `DESIGN.md` + full narration script + caption
  transcript + asset list + timestamped scene list + the disclosure text used.
- A **15–20 second teaser cut**: the hook ("checked once, at the door… then never looks
  again"), the two-verified-wallets-one-refused money shot, "1.1 MON returned — never
  confiscated," and the final logo lock-up.
