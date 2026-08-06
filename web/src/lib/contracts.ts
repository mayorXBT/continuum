/**
 * Contract bindings. Addresses come from env; until the contracts are deployed
 * (plan Task 8) they fall back to the zero address and the app shows a
 * "not deployed" notice. ABIs are hand-written minimal surfaces matching
 * docs/specs/2026-08-03-continuum-plan.md — replace with `forge inspect`
 * output after the contracts land.
 */

const apassAbi = [
  {
    type: "function", name: "isVerified", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function", name: "isFlagged", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function", name: "verify", stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "tier", type: "uint8" },
      { name: "jurisdiction", type: "bytes2" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "revoke", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function", name: "reinstate", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
] as const;

const stMonAbi = [
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "transfer", stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function", name: "approve", stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const vaultAbi = [
  { type: "function", name: "stake", stateMutability: "payable", inputs: [], outputs: [] },
  {
    type: "function", name: "unstake", stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function", name: "exchangeRate", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "totalAssets", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
  { type: "function", name: "dripRewards", stateMutability: "payable", inputs: [], outputs: [] },
] as const;

const queueAbi = [
  {
    type: "function", name: "requestRedemption", stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "approveRedemption", stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "rejectRedemption", stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "settleRedemption", stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "requests", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "requester", type: "address" },
      { name: "receiver", type: "address" },
      { name: "shares", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
  },
  {
    type: "function", name: "nextId", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
] as const;

const routerAbi = [
  {
    type: "function", name: "mode", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint8" }],
  },
  {
    type: "function", name: "validatorAvailable", stateMutability: "view",
    inputs: [{ name: "probe", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function", name: "validator", stateMutability: "view",
    inputs: [], outputs: [{ type: "address" }],
  },
] as const;

/** Mirrors ComplianceRouter.Mode. */
export const ROUTER_MODES = [
  "Local registry only",
  "Cleanverse validator only",
  "Local AND Cleanverse",
  "Local OR Cleanverse",
] as const;

const ZERO = "0x0000000000000000000000000000000000000000" as const;

const addr = (v: string | undefined) => (v ?? ZERO) as `0x${string}`;

export const CONTRACTS = {
  apass: { address: addr(process.env.NEXT_PUBLIC_APASS), abi: apassAbi },
  stMon: { address: addr(process.env.NEXT_PUBLIC_STMON), abi: stMonAbi },
  vault: { address: addr(process.env.NEXT_PUBLIC_VAULT), abi: vaultAbi },
  queue: { address: addr(process.env.NEXT_PUBLIC_QUEUE), abi: queueAbi },
  router: { address: addr(process.env.NEXT_PUBLIC_ROUTER), abi: routerAbi },
} as const;

export const contractsDeployed = CONTRACTS.apass.address !== ZERO;
