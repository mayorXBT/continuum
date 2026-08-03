# Continuum â€” Design Spec

**Date:** 2026-08-03
**Target:** Cleanverse Build: Trusted Assets Hackathon (deadline 2026-08-09), DeFi track
**Chain:** Monad testnet
**Deliverable:** Full dApp (Solidity contracts + web UI) + 3-minute demo video

## One-liner

Permissioned liquid staking where compliance travels with the token: stake as a
Cleanverse-verified user, receive **stMON** â€” a policy-gated liquid staking
receipt whose every transfer is checked against the holder's verified identity â€”
with a controlled-exit path so revocation freezes circulation without
confiscating value.

## Positioning

- The DeFi track brief names three wishes: gated lending pools (~10 competing
  teams), identity-based lending (~4 teams), and **permissioned staking (0 of 40
  registered teams)**. Continuum occupies the empty, named lane.
- Judging weights CVI/CVA integration depth at 30/100. Continuum uses identity
  (A-Pass / CVI) as a live control on every state change, not a one-time door
  check, and targets CVA-native issuance of the receipt as the ideal
  integration.
- Differentiator vs. freeze-only competitors (Revoca, CleanCredit, VeriLend):
  **compliance without confiscation** â€” a revoked holder's position cannot
  circulate but can be redeemed to a verified destination after review.

## Claims discipline

- stMON is described as a **"Cleanverse policy-gated liquid staking receipt."**
  We do NOT claim it is a true CVA/A-Token unless sandbox docs confirm
  Cleanverse supports issuing a custom yield-bearing asset that way.
- "CVA-issued stMON" is documented and pitched as the **ideal integration
  path**; if the sandbox supports custom asset issuance, we upgrade and say so.
- Rewards are labeled **"simulated testnet rewards"** in the UI and the video.
- Cleanverse vocabulary used correctly throughout: A-Pass (CVI), A-Token (CVA),
  CCP (pre-transaction compliance check), Travel Rule.

## Architecture

Four contracts + web app. Mock-first adapter layer so we build immediately;
real sandbox wiring swapped in when API keys arrive (registered, keys pending).

### 1. Cleanverse adapter layer

- `ICleanverseIdentity` interface: `isVerified(addr)`, `tierOf(addr)`,
  `jurisdictionOf(addr)`, `isFlagged(addr)`.
- `MockAPass`: soulbound ERC-721-style registry with admin functions to
  verify / set tier / set jurisdiction / revoke â€” drives the demo.
- `SandboxAPassAdapter` (day 4, keys permitting): same interface backed by the
  Cleanverse sandbox API v3+ (attestation posted on-chain by a relayer or read
  via signed proof â€” final mechanism decided after reading sandbox docs).
- All protocol contracts depend only on the interface; swapping mock â†’ sandbox
  is a constructor argument.

### 2. StakingVault

- `stake()` payable: native testnet MON in, stMON minted at current exchange
  rate. Caller must pass the identity gate (CCP-style pre-check).
- `unstake(shares)`: burns stMON, returns MON at current exchange rate. Gated.
- Exchange-rate accounting (`totalAssets / totalShares`); no per-user reward
  ledgers.
- `RewardDistributor` role: deterministic drip function callable by an admin/
  keeper that deposits simulated rewards into the vault, visibly increasing
  stMON redemption value. Clearly labeled simulated.

### 3. stMON token (the centerpiece)

- ERC-20 with a compliance gate in `_update`: on every transfer, recipient must
  be verified, jurisdiction-eligible, and unflagged; flagged/revoked senders
  are blocked from transferring.
- **Sole exception to the sender block:** any holder â€” including a revoked/
  flagged one â€” may transfer shares to the approved `RedemptionQueue` address
  and nowhere else. This is the escape hatch that makes controlled exit
  reachable; without it, `requestRedemption` would revert against the gate.
  The queue immediately locks the shares and later burns them; it never
  forwards stMON onward.
- Mint/burn only by StakingVault (and RedemptionQueue burn path).
- This is the "policy-gated receipt." CVA-native issuance is the upgrade path.

### 4. RedemptionQueue (controlled exit)

- `requestRedemption(shares, verifiedReceiver)`: callable even by a revoked/
  flagged holder. Pulls the shares into the queue via the gate's
  redemption-queue exception and locks them in a pending-redemption state
  (cannot circulate). Receiver eligibility is checked at request time.
- `approveRedemption(id)` / `rejectRedemption(id)`: compliance-officer role
  reviews. Receiver eligibility is **re-checked at approval and again at
  settlement** â€” if the receiver has since become ineligible, settlement
  reverts and the request returns to pending. On approval + settlement, the
  stMON is **burned** and the **underlying MON** is delivered to the verified,
  eligible receiver â€” the frozen receipt never re-enters circulation. On
  rejection or cancellation, shares return to the requester (still frozen for
  circulation if the holder remains revoked).
- Every request/approve/reject/settle emits audit events with reason codes.

### Web app

- Next.js + wagmi/viem on Monad testnet.
- Views: (1) Verify â€” mock A-Pass onboarding; (2) Stake dashboard â€” position,
  exchange rate, simulated-rewards badge; (3) Transfer demo â€” send stMON,
  showing pass/block outcomes with the compliance reason; (4) Compliance
  console â€” officer approves redemptions, auditor exports the event trail
  with sender/receiver attribution on payouts. (Described as "audit
  attribution" â€” we only call it Travel Rule reporting if the sandbox
  confirms an actual Cleanverse Travel Rule reporting path; see open
  questions.)

## Data flow (happy path + control paths)

1. Wallet connects â†’ adapter checks A-Pass â†’ unverified wallets see only the
   Verify view.
2. Verified wallet stakes MON â†’ vault mints stMON.
3. Simulated rewards drip â†’ exchange rate rises.
4. stMON transfer to verified wallet â†’ passes; to unverified wallet â†’ reverts
   with reason ("recipient not verified").
5. Credential revoked â†’ holder's transfers/stake/unstake blocked.
6. Revoked holder calls `requestRedemption(verifiedReceiver)` â†’ officer
   approves â†’ stMON burned, MON delivered to eligible receiver â†’ audit events.

## Error handling

- Every gated entry point reverts with a machine-readable reason
  (`NotVerified`, `JurisdictionBlocked`, `CredentialRevoked`, ...) surfaced
  verbatim in the UI.
- Pausable guard on the vault (admin) for demo-day safety.
- Redemption requests are idempotent and cancelable by the requester before
  review.

## Testing

- Foundry unit tests: gate coverage on every state-changing function; exchange
  rate math; redemption lifecycle (request â†’ approve/reject â†’ settle).
- Invariants: `address(vault).balance >= totalAssets` accounting consistency;
  exchange rate never decreases from reward drips; sum of pending redemption
  shares equals shares locked in the queue; no path transfers stMON to an
  unverified address, with the approved RedemptionQueue as the single allowed
  exception (and the queue can only lock or burn, never forward).
- Manual E2E on Monad testnet with two wallets before recording the video.

## Demo arc (3-minute video, two wallets)

1. Verify wallet A â†’ stake MON â†’ receive stMON.
2. Simulated rewards drip â†’ redemption value rises on screen.
3. Transfer stMON to verified wallet B â†’ passes.
4. Attempt transfer to unverified wallet C â†’ **blocked at the border** with
   reason shown.
5. Revoke wallet B's credential â†’ its position freezes in one block.
6. Wallet B requests redemption to a verified receiver â†’ compliance officer
   approves â†’ underlying MON delivered, receipt burned. **"Compliance without
   confiscation."**
7. Auditor exports the full event trail.

## Build plan (6 days)

- **Day 1â€“2:** contracts + Foundry tests (adapter, vault, stMON, queue).
- **Day 3:** deploy to Monad testnet; frontend skeleton (connect, verify,
  stake).
- **Day 4:** UI polish; read sandbox docs; swap in `SandboxAPassAdapter` if
  keys + docs allow; decide the CVA-issuance upgrade question.
- **Day 5:** full E2E on testnet; record demo video.
- **Day 6:** buffer, submission text (use Cleanverse vocabulary; state claims
  discipline explicitly), submit.

## Open questions (resolve on day 4 against sandbox docs)

1. Does the sandbox support issuing a custom yield-bearing asset as a CVA/
   A-Token? If yes â†’ issue stMON as a CVA and update claims. If no â†’ receipt
   framing stands.
2. What attestation mechanism does the sandbox expose (on-chain registry,
   signed proof, API-only)? Determines `SandboxAPassAdapter` internals.
3. Does the CCP pre-transaction check API accept third-party protocol calls we
   can invoke per-transfer, or is it settlement-rail only? Determines whether
   transfers call CCP live or mirror its rules locally.
4. Does Cleanverse expose an actual Travel Rule reporting path (API or export
   format) third-party protocols can feed? If yes â†’ wire audit attribution
   into it and name it Travel Rule reporting. If no â†’ keep the "audit
   attribution" framing.

## Out of scope (first build)

- Reward escrow / re-verification routing (overlaps Talon; accounting risk).
- Real validator delegation; cross-chain anything; secondary market for stMON.
- AI/agent features (crowded lane: 5 competing teams).

