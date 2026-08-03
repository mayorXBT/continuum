# Continuum

**Compliance that travels with the token.** Permissioned liquid staking on
Monad testnet, built for the Cleanverse Build: Trusted Assets Hackathon
(DeFi track, deadline 2026-08-09).

Stake as a Cleanverse-verified user (A-Pass / CVI) and receive **stMON** — a
policy-gated liquid staking receipt whose every transfer re-checks the
counterparty's credential at the token layer. When a credential is revoked,
the position freezes for circulation but is never trapped: a controlled exit
delivers the underlying value to a verified receiver after compliance review.
**Compliance without confiscation.**

## Why this lane

The DeFi track brief names three themes: gated lending pools (~10 competing
teams), identity-based lending (~4 teams), and **permissioned staking — zero
registered teams**. Continuum occupies the named, empty lane.

## Repository layout

- `web/` — Next.js + wagmi frontend (landing page + dApp). Run with
  `npm run dev` inside `web/`.
- `contracts/` — Foundry contracts (pending; see the implementation plan
  Tasks 1–8).
- `docs/specs/2026-08-03-continuum-design.md` — approved design spec.
- `docs/specs/2026-08-03-continuum-plan.md` — task-by-task implementation
  plan (contracts, deployment, E2E, demo video, submission).

## Frontend status

The full interface is built and running in pre-deploy mode: landing page,
Verify / Stake / Transfer / Compliance Console panels. Wire it to the chain
by deploying the contracts (plan Task 8) and filling `web/.env.local` from
`web/.env.example`.

## Claims discipline

stMON is a Cleanverse **policy-gated liquid staking receipt**, not a
CVA/A-Token; CVA-native issuance is the target integration pending sandbox
confirmation. Rewards on testnet are simulated and labeled as such. Audit
exports are "audit attribution" unless the sandbox confirms an actual
Travel Rule reporting path.
