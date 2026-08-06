# Deployment — Monad testnet (chain 10143)

Redeployed 2026-08-06 to introduce `ComplianceRouter`. The earlier set is
superseded; these are the live addresses.

| Contract | Address |
| --- | --- |
| MockAPass | `0x5cFcF818a46d483C400E3Ebd7B82e97e5B612897` |
| **ComplianceRouter** | `0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6` |
| StMON | `0x940d14C41d6F8E47549e51402219898398C8b31a` |
| StakingVault | `0x75dC8959c906679f477F9c8720A0656589B4A37a` |
| RedemptionQueue | `0x1819cA49E22e143025eCb5689873D2155E7647Db` |

Owner / deployer: `0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a`

## Cleanverse

| Item | Value |
| --- | --- |
| IAPassComplianceValidator | `0xaC7e5179C2C7f03f209136886c172eb34F161792` |
| Pool registered | `ComplianceRouter`, tx `0x8115fe99a63c3e030f1cbf36e4b48e37881498760a78e8a2e5c47bfe30913975` |
| Rule | `min_tier 0`, `min_sub_tier 0` — any valid A-Pass |
| Router mode | `2` = RequireBoth (local registry **AND** Cleanverse) |

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

| Wallet | Note |
| --- | --- |
| `0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a` | deployer, sub-tier 60, record 996 |
| `0xAE0EbFa13882160d19Ef4fC747564e7f9eDFC958` | **superseded MockAPass contract address, not a wallet** — issued in error, harmless |

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
