# Continuum: A Summary

**Compliance that travels with the token.**
Staking you can stay in, that still follows the rules every time your money moves.
Built on Monad testnet for the Cleanverse Build: Trusted Assets Hackathon, DeFi track.

---

## The problem

Watching how traders actually move money on-chain, I kept running into the same thing. The
"compliant" apps they use check your ID once, at the door, and then never look again. That
leaves a trader two bad choices.

- Lock your money up to earn, and lose access to it.
- Keep it liquid, and risk that the day your status changes, the app just freezes your funds
  and keeps them.

So the people with real money to put in don't. They stay out.

## What we built

Continuum is staking where the rule lives inside the token, so it gets checked every time the
money moves, not just once at the start.

1. **Put in MON, get stMON back.** stMON is your staked money in liquid form. It earns while
   you hold it, using simulated testnet rewards, and you can use it right away. Nothing is
   locked.
2. **The token checks the rules by itself.** Every time you send stMON, the token asks
   Cleanverse whether the person is allowed before it moves. If they aren't, it won't go, and
   it tells you why.
3. **If your status is revoked, your money isn't stolen.** You can't freely move the token
   anymore, but you're not trapped. You ask to cash out to an approved wallet, a reviewer
   checks it, and your money comes back, everything you put in plus what it earned. In our
   live test, a revoked user got 1.1 MON back.

That last part is the whole point. Rules without losing your money. Most designs freeze and
confiscate. Continuum freezes and refunds.

## How Cleanverse powers it, the CVI and CVA part

Take Cleanverse out and there's no product. It isn't decoration. It's what does the checking.

**CVI, the identity check.** This part is fully live. Cleanverse's "A-Pass" is a verified ID
for a wallet. Continuum asks it on every move, not once at the door. Here's the clever part.
The rule that decides who's allowed lives on Cleanverse's side, not ours. Our pool requires a
minimum trust level. Two wallets can both hold valid IDs, but if one sits below that level,
the token refuses to move to it, and we couldn't wave them through even if we wanted to,
because we don't own that rule. If Cleanverse can't answer, the token says no by default,
never a silent yes.

**CVA, the compliant-asset format.** We're being straight here. Cleanverse has a standard for
issuing a fully compliant asset, called a CVA. stMON isn't a CVA yet. It's a receipt that
still obeys all the same ID rules. We plan to start building the full CVA version right after
the hackathon, and Cleanverse already documents the path, so we know exactly where we're
headed.

## Where it lives

Everything below is live on Monad testnet, chain 10143, and checkable on the explorer. 49
test trades pass, and the full flow was run end to end on-chain.

| What it is | Address |
| --- | --- |
| Rule-checker (ComplianceRouter) | `0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6` |
| Staking token (stMON) | `0x940d14C41d6F8E47549e51402219898398C8b31a` |
| Staking vault | `0x75dC8959c906679f477F9c8720A0656589B4A37a` |
| Cash-out queue | `0x1819cA49E22e143025eCb5689873D2155E7647Db` |
| Cleanverse identity validator (CVI) | `0xaC7e5179C2C7f03f209136886c172eb34F161792` |

Explorer at testnet.monadexplorer.com. Cleanverse's validator sits at the same address on
every hackathon chain, so this works beyond Monad too.

## See it

- Live on testnet at the addresses above.
- Demo video included with the submission.
- Live site at usecontinuum.cc.
