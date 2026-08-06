import "server-only";
import { createCipheriv, createDecipheriv } from "node:crypto";

/**
 * Server-only client for the Cleanverse cooperate API (sandbox/UAT).
 *
 * Two credentials, and they are NOT interchangeable:
 *   - api-id  — sent as a request header, identifies the institution.
 *   - api-key — a base64 AES key used LOCALLY to encrypt request bodies.
 *               It must never be transmitted or reach the browser.
 *
 * Read endpoints we rely on (query_apass, validator verify/rules/is_paused)
 * take plain JSON. Only the write endpoints need `encrypt()`.
 */

const BASE =
  process.env.CLEANVERSE_BASE_URL ?? "https://uatapi.cleanverse.com/api/cooperate";

/** Chain slug as Cleanverse names it. Monad testnet is chain id 10143. */
export const CHAIN = process.env.CLEANVERSE_CHAIN ?? "monad";

/**
 * IAPassComplianceValidator — the on-chain contract that evaluates A-Pass
 * rules for registered compliance pools. Cleanverse confirmed the same address
 * is deployed on every hackathon network, Monad testnet included.
 */
export const VALIDATOR_ADDRESS =
  "0xaC7e5179C2C7f03f209136886c172eb34F161792" as const;

function apiId(): string {
  const id = process.env.CLEANVERSE_API_ID;
  if (!id) throw new Error("CLEANVERSE_API_ID is not set");
  return id;
}

/**
 * AES/CBC/PKCS5Padding with a fixed 16-zero-byte IV, per the Encryption
 * section of the cooperate API docs. Used by the write endpoints
 * (generate_apass, validator grant/register/rules, atoken/*).
 */
export function encrypt(payload: unknown): { data: string } {
  const raw = process.env.CLEANVERSE_API_KEY;
  if (!raw) throw new Error("CLEANVERSE_API_KEY is not set");
  const key = Buffer.from(raw, "base64");
  const iv = Buffer.alloc(16, 0);
  const cipher = createCipheriv("aes-128-cbc", key, iv);
  const out = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return { data: out.toString("base64") };
}

export function decrypt(ciphertext: string): unknown {
  const raw = process.env.CLEANVERSE_API_KEY;
  if (!raw) throw new Error("CLEANVERSE_API_KEY is not set");
  const key = Buffer.from(raw, "base64");
  const iv = Buffer.alloc(16, 0);
  const decipher = createDecipheriv("aes-128-cbc", key, iv);
  const out = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(out.toString("utf8"));
}

type Envelope<T> = { code: string; message: string; data: T };

async function post<T>(path: string, body: unknown): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": apiId(),
      "X-Request-ID": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Surface the status only — the body may echo request detail we'd rather
    // not spill into client-visible errors.
    throw new Error(`Cleanverse ${path} returned HTTP ${res.status}`);
  }
  return (await res.json()) as Envelope<T>;
}

/** Raw shape returned by POST /query_apass (flat fields only). */
type ApassRecord = {
  cvRecordId: string;
  tier: string;
  subTier: number;
  group: string;
  subGroup: string;
  /** 1 = active, 2 = frozen */
  status: number;
  /** Unix seconds */
  expirationTime: number;
  currentKycHash: string;
  countries: string[];
};

export type ApassStatus = {
  /** Whether Cleanverse holds a registered A-Pass for this wallet at all. */
  registered: boolean;
  /** Active, unexpired credential — the condition Continuum gates on. */
  verified: boolean;
  /** status === 2, i.e. frozen by the issuer. */
  frozen: boolean;
  expired: boolean;
  tier: number | null;
  subTier: number | null;
  group: string | null;
  subGroup: string | null;
  countries: string[];
  expiresAt: string | null;
  /** Cleanverse's own message, useful when registered is false. */
  note: string;
};

const NOT_REGISTERED: ApassStatus = {
  registered: false,
  verified: false,
  frozen: false,
  expired: false,
  tier: null,
  subTier: null,
  group: null,
  subGroup: null,
  countries: [],
  expiresAt: null,
  note: "No A-Pass registered for this wallet on this chain.",
};

/**
 * Look up a wallet's A-Pass. Returns a normalised view rather than the raw
 * envelope so the UI never has to interpret Cleanverse status integers.
 */
export async function queryApass(address: string): Promise<ApassStatus> {
  const res = await post<ApassRecord | string>("/query_apass", {
    chain: CHAIN,
    address,
  });

  // A wallet with no A-Pass comes back as a business failure (0002) rather
  // than an HTTP error, and `data` may be an empty string.
  if (res.code !== "0000" || !res.data || typeof res.data === "string") {
    return { ...NOT_REGISTERED, note: res.message || NOT_REGISTERED.note };
  }

  const r = res.data;
  const nowSec = Math.floor(Date.now() / 1000);
  const expired = typeof r.expirationTime === "number" && r.expirationTime <= nowSec;
  const frozen = r.status === 2;

  return {
    registered: true,
    verified: !frozen && !expired,
    frozen,
    expired,
    tier: r.tier != null && r.tier !== "" ? Number(r.tier) : null,
    subTier: r.subTier ?? null,
    group: r.group || null,
    subGroup: r.subGroup || null,
    countries: r.countries ?? [],
    expiresAt: r.expirationTime
      ? new Date(r.expirationTime * 1000).toISOString().slice(0, 10)
      : null,
    note: frozen
      ? "A-Pass is frozen by the issuer."
      : expired
        ? "A-Pass has expired."
        : "A-Pass is active.",
  };
}

/**
 * POST /validator/verify — asks the IAPassComplianceValidator whether a wallet
 * satisfies the rules of a registered compliance pool. Plain JSON.
 *
 * HTTP 200 + code 0000 means the *check ran*; `valid` is the outcome.
 */
export async function verifyAgainstPool(
  poolAddress: string,
  userAddress: string,
): Promise<{ ran: boolean; valid: boolean; note: string }> {
  const res = await post<{ valid: boolean }>("/validator/verify", {
    chain: CHAIN,
    contract_address: poolAddress,
    user_address: userAddress,
  });
  if (res.code !== "0000" || !res.data) {
    return { ran: false, valid: false, note: res.message || "Pool check failed." };
  }
  return {
    ran: true,
    valid: Boolean(res.data.valid),
    note: res.data.valid ? "Satisfies pool rules." : "Does not satisfy pool rules.",
  };
}
