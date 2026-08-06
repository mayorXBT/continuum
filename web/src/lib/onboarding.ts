import "server-only";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "./wagmi";
import { encrypt, CHAIN } from "./cleanverse";

/**
 * Demo-access onboarding.
 *
 * Grants a wallet the two credentials Continuum gates on, so anyone evaluating
 * the protocol can move a position through it without us onboarding them by
 * hand. Deliberately scoped:
 *
 *   - testnet only, and off unless DEMO_ONBOARDING is set;
 *   - rate limited, because it spends our institutional API quota and gas;
 *   - idempotent — an address that already holds both credentials is a no-op.
 *
 * This is a demo convenience, not the production model. Real onboarding is
 * mediated by the institution holding the Cleanverse relationship.
 */

const SUB_TIER = 60; // comfortably over the pool's min_sub_tier of 30
const LOCAL_TIER = 60;
const JURISDICTION = "0x5347"; // "SG"

const BASE =
  process.env.CLEANVERSE_BASE_URL ?? "https://uatapi.cleanverse.com/api/cooperate";

export function onboardingEnabled(): boolean {
  return Boolean(
    process.env.DEMO_ONBOARDING &&
      process.env.OPERATOR_PRIVATE_KEY &&
      process.env.CLEANVERSE_API_ID &&
      process.env.NEXT_PUBLIC_APASS,
  );
}

// ───────────────────────── rate limiting ─────────────────────────
// In-memory, so it resets on redeploy and doesn't survive multiple instances.
// Adequate for a single-instance testnet demo; a real deployment wants Redis.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 6;

export function rateLimit(key: string): { ok: boolean; retryAfterMins: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterMins: 0 };
  }
  if (b.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfterMins: Math.ceil((b.resetAt - now) / 60000) };
  }
  b.count += 1;
  return { ok: true, retryAfterMins: 0 };
}

// ───────────────────────── steps ─────────────────────────

const apassAbi = [
  {
    type: "function",
    name: "verify",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "tier", type: "uint8" },
      { name: "jurisdiction", type: "bytes2" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

function operator() {
  const pk = process.env.OPERATOR_PRIVATE_KEY!;
  return privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);
}

function customerId(address: string) {
  return `continuum${address.slice(2, 10)}${Date.now().toString(36)}`.replace(
    /[^A-Za-z0-9]/g,
    "",
  );
}

/** Issue a Cleanverse A-Pass at a sub-tier that satisfies the pool rule. */
async function issueApass(address: string): Promise<{ ok: boolean; detail: string }> {
  const payload = {
    customerId: customerId(address),
    expirationTime: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    subTier: SUB_TIER,
    subGroup: "AB",
    wallet: { address, chain: CHAIN },
  };

  const res = await fetch(`${BASE}/generate_apass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": process.env.CLEANVERSE_API_ID!,
      "X-Request-ID": crypto.randomUUID(),
    },
    body: JSON.stringify(encrypt(payload)),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) return { ok: false, detail: `Cleanverse returned HTTP ${res.status}` };
  const body = await res.json();
  if (body.code !== "0000") return { ok: false, detail: body.message ?? body.code };
  return { ok: true, detail: "A-Pass issued" };
}

/** Add the wallet to the local registry, which the router also consults. */
async function verifyLocally(address: string): Promise<{ ok: boolean; detail: string }> {
  const account = operator();
  const registry = process.env.NEXT_PUBLIC_APASS as `0x${string}`;

  const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

  const already = await publicClient.readContract({
    address: registry,
    abi: apassAbi,
    functionName: "isVerified",
    args: [address as `0x${string}`],
  });
  if (already) return { ok: true, detail: "already in local registry" };

  const wallet = createWalletClient({ account, chain: monadTestnet, transport: http() });
  const hash = await wallet.writeContract({
    address: registry,
    abi: apassAbi,
    functionName: "verify",
    args: [address as `0x${string}`, LOCAL_TIER, JURISDICTION],
  });
  await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
  return { ok: true, detail: hash };
}

export type OnboardResult = {
  apass: { ok: boolean; detail: string };
  local: { ok: boolean; detail: string };
};

export async function grantDemoAccess(address: string): Promise<OnboardResult> {
  // Cleanverse first: it's the gate we don't control, so if it fails there is
  // no point spending gas on the local half.
  const apass = await issueApass(address);
  if (!apass.ok) {
    return { apass, local: { ok: false, detail: "skipped" } };
  }
  const local = await verifyLocally(address);
  return { apass, local };
}
