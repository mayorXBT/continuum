# Deployments

## Monad testnet (chainId 10143)

Deployed 2026-08-03. Deployer / owner / compliance officer:
`0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a`

| Contract | Address |
| --- | --- |
| MockAPass | `0xAE0EbFa13882160d19Ef4fC747564e7f9eDFC958` |
| StMON | `0x5e07E3E3D48D51ea476069e88e069b64d67e0864` |
| StakingVault | `0xb4c65c3f9485ff6B2d8D270BdE1D5338e54FBA72` |
| RedemptionQueue | `0x7c1272e901a2C5d2A783f6Ee8A4322B55f89278e` |

Explorer: https://testnet.monadexplorer.com

Wiring verified on-chain after deploy:

- `StMON.vault()` → StakingVault
- `StMON.redemptionQueue()` → RedemptionQueue
- `StakingVault.redemptionQueue()` → RedemptionQueue
- `StakingVault.exchangeRate()` → 1e18 (empty vault)

The deployer address owns MockAPass (identity registry), StakingVault (pause,
reward drip), and RedemptionQueue (compliance officer review). Demo flows that
verify/revoke wallets or approve redemptions must be sent from this wallet.
