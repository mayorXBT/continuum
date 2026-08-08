# Deployment — Monad testnet (chain 10143)

Redeployed 2026-08-06 to introduce `ComplianceRouter`. The earlier set is
superseded; these are the live addresses.

| Contract | Address |
| --- | --- |
| MockAPass | `0xfC15b21eAD5D556455F562376a2D92EccBFeB677` |
| **ComplianceRouter** | `0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6` |
| StMON | `0x940d14C41d6F8E47549e51402219898398C8b31a` |
| StakingVault | `0x75dC8959c906679f477F9c8720A0656589B4A37a` |
| RedemptionQueue | `0x1819cA49E22e143025eCb5689873D2155E7647Db` |

Owner / deployer: `0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a`

> **Note on MockAPass.** `Deploy.s.sol` originally deployed the registry at
> `0x5cFcF818a46d483C400E3Ebd7B82e97e5B612897` (still recorded in
> `contracts/broadcast/`). It was later replaced by a hardened build with an
> `operator` role for self-serve onboarding, and pointed in via
> `ComplianceRouter.setLocal`. The address above is the live one. Verify with
> `ComplianceRouter.local()`, which currently returns it.

## Cleanverse

| Item | Value |
| --- | --- |
| IAPassComplianceValidator | `0xaC7e5179C2C7f03f209136886c172eb34F161792` |
| Pool registered | `ComplianceRouter`, tx `0x8115fe99a63c3e030f1cbf36e4b48e37881498760a78e8a2e5c47bfe30913975` |
| Rule | `min_sub_tier 30` — tx `0xae15603ddbe173f2e9652264c640c1c918dc9828e8092e9b1b23eb329687b30d` |
| Router mode | `2` = RequireBoth (local registry **AND** Cleanverse) |

### Rule management goes through the API, not the contract

`ComplianceRouter.setRuleV2` (which forwards to `setRuleV2FromContract`)
reverts with empty data for a pool registered through `/validator/register` —
that on-chain path appears to need a registrar/factory role we do not hold.
Use `scripts/set-rule.mjs`, which calls `/validator/set_rule`:

```bash
node scripts/set-rule.mjs --show
node scripts/set-rule.mjs --min-sub-tier 30
node scripts/set-rule.mjs --min-sub-tier 30 --add   # append; rules are OR'd
```

The validator lives at the same address on every chain in the hackathon set.

### Owner signature for /validator/register

Two schemes are documented and only one works.

- **CVI guide** — `keccak256(chain + contract_address)` signed as a digest → rejected, `0001 Invalid contract owner signature`.
- **API docs** — EIP-191 `personal_sign` over the literal lowercase string `monad0x…` → **accepted**.

`scripts/register-pool.mjs` tries both and reports which was taken, so this
does not need rediscovering.

## Verified end to end

```
isRegistered(router)                       true
complianceVerify(router, deployer)         true      # false before the A-Pass, reverted before registration
router.mode()                              2
router.isVerified(deployer)                true      # local AND Cleanverse
router.isVerified(0x1111…1111)             false     # has a Cleanverse A-Pass but no local record
stake 1 MON                                success   tx 0x3ed001937c959d1ffbffb5a2bb67a4cbe3026072f4cf59427900e12b2b202aa4
transfer -> wallet with no A-Pass          reverted  NotVerified
```

Before registration, `complianceVerify` reverted with `0x739f4185` for an
unregistered pool — which is why the router wraps the call in `try/catch`
rather than calling it directly.

## Sandbox A-Passes issued

| Wallet | Sub-tier | Note |
| --- | --- | --- |
| `0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a` | 60 | deployer, record 996 — **passes** the rule |
| `0x5C6CCA4C687C60B15bf83EAE5843a77a325EEda9` | 10 | demo wallet, record 999 — **fails** the rule |
| `0xAE0EbFa13882160d19Ef4fC747564e7f9eDFC958` | 60 | superseded MockAPass contract address, not a wallet — issued in error, harmless |

## The tier demo

The low-tier wallet is deliberately **verified in the local registry**, so the
only thing that can refuse it is the Cleanverse rule. That makes the block
unambiguous on camera:

```
local isVerified(low-tier)            true      # local registry is happy
cleanverse verify(deployer,  st 60)   true      # 60 >= 30
cleanverse verify(low-tier,  st 10)   false     # 10 <  30
router isVerified(deployer)           true
router isVerified(low-tier)           false     # refused on tier alone
transfer stMON -> low-tier            reverted  NotVerified
```

Both wallets hold a valid, active, unexpired A-Pass. The difference is
entirely the sub-tier, and the rule lives on Cleanverse — not in our code.

## Rerun

```bash
# deploy
cd contracts && forge script script/Deploy.s.sol:Deploy --rpc-url $MONAD_RPC --private-key $PRIVATE_KEY --broadcast

# register the router as a compliance pool
cd web && node scripts/register-pool.mjs --contract <router>

# issue an A-Pass
node scripts/generate-apass.mjs --address <wallet> --sub-tier 60 --sub-group AB

# turn the CVI gate on (2 = RequireBoth, 0 = LocalOnly)
cast send <router> "setMode(uint8)" 2 --rpc-url $MONAD_RPC --private-key $PRIVATE_KEY
```

If the sandbox is unreachable during the demo, `setMode 0` returns the
protocol to registry-only enforcement without redeploying.
