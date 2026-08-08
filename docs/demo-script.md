# Continuum — 3-minute demo script

Live on Monad testnet. Every beat below was verified on-chain on 2026-08-06, against the
deployment in `docs/deployment.md`.

## Before you hit record

- Dev server running: `npm run dev` in `web/`, app at http://localhost:3000
- Wallet connected: `0xe6D5…8d6a` (the deployer — owns the registry, the vault,
  and the officer role)
- Wallet has MON for gas and staking
- Clean state: credential reinstated, vault empty, stMON supply 0
- Three addresses ready to paste:
  - **Receiver (verified, sub-tier 60):** `0x1111111111111111111111111111111111111111`
  - **Low-tier (valid A-Pass, sub-tier 10):** `0x5C6CCA4C687C60B15bf83EAE5843a77a325EEda9`
  - **Stranger (no A-Pass at all):** `0x000000000000000000000000000000000000dEaD`
- Enforcement strip on `/app` reads **Local AND Cleanverse · CVI GATE ON ·
  VALIDATOR RESPONDING**. If it doesn't, the pool rule or mode is off — fix
  before recording (see `docs/deployment.md`).
- Browser zoom ~110% so revert messages are readable on video

**One honesty note to say out loud:** on testnet a single wallet holds both the
holder and compliance-officer keys. In production these are separate parties.
Say it once, early — judges notice, and owning it costs nothing.

---

## Beat 1 — The thesis (0:00–0:20)

**Screen:** landing page hero, transfer strip animating.

> "Most compliant DeFi checks identity once, at the door. After that, the
> credential can lapse, get sanctioned, get revoked — and the position keeps
> trading as if nothing happened.
>
> Continuum checks identity every time value moves. This is permissioned
> liquid staking on Monad, built on Cleanverse A-Pass and verified assets."

Scroll once so the checkpoint line is visible, then go to the app.

---

## Beat 2 — Verify (0:20–0:38)

**Screen:** app, Verify tab.

**Do:** show the wallet reading VERIFIED from the on-chain A-Pass registry.

> "This wallet holds a Cleanverse A-Pass — bank-verified, wallet-bound,
> revocable, and the PII never touches the chain. Without it, the vault
> won't take a stake at all."

---

## Beat 3 — Stake (0:38–0:55)

**Screen:** Stake tab.

**Do:** enter `1`, click **Stake**, confirm in wallet, wait for balance to show
`1.0000` stMON and rate `1.0000`.

> "Stake one MON, receive one stMON — a policy-gated liquid staking receipt.
> Note the word receipt: we do not claim this is a CVA. Issuing it natively
> as a CVA is our target integration, pending sandbox confirmation."

---

## Beat 4 — Yield (0:55–1:08)

**Do:** click **Drip simulated testnet rewards (+0.1)**. Rate moves
`1.0000 → 1.1000`.

> "Rewards raise the redemption value rather than minting new shares. On
> testnet these are simulated, and we label them that way everywhere."

---

## Beat 5 — A good transfer (1:08–1:22)

**Screen:** Transfer tab.

**Do:** paste the **receiver** address, amount `0.5`, click **Send**. Succeeds.

> "Transfer to a verified wallet. The token checks the recipient's A-Pass and
> lets it through."

---

## Beat 6 — Blocked: no credential (1:22–1:40) ★

**Do:** paste the **stranger** address, click **Send**. Wallet simulation
fails; the red `NotVerified` error appears in the panel.

**Leave the error on screen for a full three seconds.**

> "Same token, unverified recipient — blocked at the token layer. Not by our
> frontend, not by an allowlist that drifts out of sync. The rule lives in the
> asset, so it holds anywhere the token goes."

---

## Beat 7 — Blocked: real credential, wrong tier (1:40–2:00) ★ the Cleanverse beat

**Screen:** Verify tab, then Transfer tab.

**Do:** paste the **low-tier** address into the Verify panel's lookup — or just
have it ready — and point at the live A-Pass record: **ACTIVE**, sub-tier
**10**. This wallet is genuinely verified. Then go to Transfer, paste it, and
click **Send**. It reverts with `NotVerified`.

> "This one is different. That wallet holds a real, active Cleanverse A-Pass —
> you can see it right there. It's also verified in our own registry. The only
> thing wrong with it is its tier: our pool requires sub-tier 30, and this
> wallet is 10."

> "I didn't write that threshold into my contract. It's a rule registered
> against our pool on Cleanverse's compliance validator, and their contract is
> the one saying no. That's the difference between reading an API and actually
> being governed by it."

**Why this beat earns its 20 seconds:** every other project can show a verified
and an unverified wallet. Showing two *verified* wallets where one is refused
on a policy attribute is the clearest possible evidence the integration is
load-bearing.

---

## Beat 8 — Revocation (2:00–2:15)

**Screen:** Console tab.

**Do:** paste your own connected address into the officer field, click
**Revoke**. Switch to Verify tab — the stamp flips to REVOKED. Try any transfer
from Transfer tab — blocked.

> "Now the credential is revoked. The position freezes on the very next
> transaction. Most compliant-DeFi demos stop here — and that is exactly where
> the hard question starts."

---

## Beat 9 — Controlled exit (2:15–2:45) ★ the differentiator

**Screen:** Transfer tab, controlled-exit section.

**Do:**
1. Paste the **receiver** address into the exit field
2. Click **1 · Approve queue**, confirm
3. Click **2 · Request redemption**, confirm
4. Switch to Console tab — request appears as **Pending**
5. Click **Approve** → status **Approved**
6. Click **Settle** → status **Settled**

> "The regulator's next question is: so you seize the funds? No.
>
> The revoked holder can't circulate the position — but they can request an
> exit to a verified destination. A compliance officer reviews it, and
> eligibility is re-checked at approval and again at settlement. On approval
> the receipt is burned and the underlying MON goes to the eligible receiver.
>
> And they keep the yield they earned. One stMON became 1.1 MON.
> Compliance without confiscation."

---

## Beat 10 — Audit trail + close (2:45–3:00)

**Screen:** Monad explorer, the settlement transaction's event log.

> "Every step — request, approval, settlement — is an on-chain event with
> requester and receiver attribution.
>
> Permissioned staking was named in the DeFi track brief and nobody else built
> it. Four contracts, 40 passing tests, live on Monad testnet.
>
> Continuum. Compliance that travels with the token."

---

## If something breaks on camera

- **Transaction stuck pending:** Monad testnet is fast; if it hangs past ~10s,
  cut and retry. Don't narrate over a spinner.
- **Wrong wallet connected:** admin actions (verify, revoke, approve, settle)
  only work from `0xe6D5…8d6a`. Any other wallet reverts with an ownership
  error.
- **Settle appears to do nothing:** that is the deferral path — the receiver
  became ineligible, so the request bounced back to Pending with shares still
  locked. That is correct behavior and worth showing if it happens.
- **Rate shows 1.0000 after a drip:** the read refreshes on a 4s interval.
  Wait one beat.

## Reset between takes

```bash
cd C:/Users/hp/Downloads/Continuum/contracts && export PATH="$HOME/.foundry/bin:$PATH" && set -a && source .env && set +a && cast send 0xfC15b21eAD5D556455F562376a2D92EccBFeB677 'reinstate(address)' 0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a --rpc-url $MONAD_RPC --private-key $PRIVATE_KEY
```
