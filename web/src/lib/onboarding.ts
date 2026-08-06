import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "./wagmi";
import { encrypt, queryApass, CHAIN } from "./cleanverse";

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

// ───────────────────────── issuance cap ─────────────────────────
// A hard ceiling on credentials issued, so a runaway script bounds out even
// if it defeats the per-key rate limits. Counts this process's issuance; a
// restart resets it, which is the trade for not adding a datastore.

let issued = 0;

export function issuanceCap(): { ok: boolean; issued: number; max: number } {
  const max = Number(process.env.DEMO_ONBOARDING_MAX ?? 250);
  return { ok: issued < max, issued, max };
}

function recordIssuance() {
  issued += 1;
}

// ───────────────────────── sign-in challenge ─────────────────────────
// Onboarding used to accept any address, so anyone could mint credentials
// bound to wallets they did not control — polluting Cleanverse's registry
// under our institution's name. A wallet must now prove control by signing a
// one-time nonce.

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

/**
 * The challenge is a signed token rather than server-side state.
 *
 * Holding it in a Map only works on a single long-lived process: on a
 * serverless host the request that issues the challenge and the request that
 * redeems it routinely land on different instances, and the second one would
 * never find it. An HMAC token carries its own proof, so any instance can
 * verify one issued by any other.
 */
function challengeSecret(): string {
  // Falls back to the operator key so the route still works without extra
  // configuration; a dedicated secret is preferable.
  const s = process.env.CHALLENGE_SECRET ?? process.env.OPERATOR_PRIVATE_KEY;
  if (!s) throw new Error("No CHALLENGE_SECRET or OPERATOR_PRIVATE_KEY set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", challengeSecret()).update(payload).digest("base64url");
}

export function issueChallenge(address: string): { message: string; token: string } {
  const payload = JSON.stringify({
    a: address.toLowerCase(),
    n: randomUUID(),
    e: Date.now() + CHALLENGE_TTL_MS,
  });
  const body = Buffer.from(payload).toString("base64url");
  const token = `${body}.${sign(body)}`;
  const { n } = JSON.parse(payload);
  return { message: challengeMessage(address, n), token };
}

export function challengeMessage(address: string, nonce: string): string {
  return [
    "Continuum — testnet demo access",
    "",
    "Sign this message to prove you control this wallet.",
    "This is free and does not authorise any transaction.",
    "",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

/**
 * Verify a token belongs to `address`, is unexpired, and was issued by us.
 * Returns the nonce so the caller can rebuild the exact signed message.
 */
export function readChallenge(address: string, token: string): string | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  // Constant-time compare, so a wrong MAC leaks nothing through timing.
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { a: addr, n, e } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (addr !== address.toLowerCase()) return null;
    if (Date.now() > e) return null;
    return n as string;
  } catch {
    return null;
  }
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
  // Idempotent at the resource, not the request. A stateless challenge token
  // is replayable inside its short TTL, and making it single-use would need
  // shared state we deliberately avoided — so instead, re-running this for a
  // wallet that already holds a credential costs nothing: no API quota, no
  // gas. That makes a replay a genuine no-op rather than a way to burn quota.
  const existing = await queryApass(address);
  if (existing.registered && existing.verified) {
    const local = await verifyLocally(address);
    return { apass: { ok: true, detail: "already holds an A-Pass" }, local };
  }

  // Cleanverse first: it's the gate we don't control, so if it fails there is
  // no point spending gas on the local half.
  const apass = await issueApass(address);
  if (!apass.ok) {
    return { apass, local: { ok: false, detail: "skipped" } };
  }
  const local = await verifyLocally(address);
  if (local.ok) recordIssuance();
  return { apass, local };
}
