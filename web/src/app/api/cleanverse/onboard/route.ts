import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import {
  challengeMessage,
  grantDemoAccess,
  issuanceCap,
  onboardingEnabled,
  rateLimit,
  readChallenge,
} from "../../../../lib/onboarding";

/**
 * POST /api/cleanverse/onboard  { address }
 *
 * Grants demo access: a Cleanverse A-Pass at a sub-tier that clears the pool
 * rule, plus an entry in the local registry. Testnet only, rate limited, and
 * disabled entirely unless DEMO_ONBOARDING is set.
 */
export async function POST(request: Request) {
  if (!onboardingEnabled()) {
    return NextResponse.json(
      { error: "Demo access is not enabled on this deployment." },
      { status: 503 },
    );
  }

  let address: unknown;
  let signature: unknown;
  let token: unknown;
  try {
    ({ address, signature, token } = await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid 0x wallet address is required." },
      { status: 400 },
    );
  }

  if (typeof signature !== "string" || !/^0x[a-fA-F0-9]+$/.test(signature)) {
    return NextResponse.json(
      { error: "A wallet signature is required. Request a challenge first." },
      { status: 400 },
    );
  }

  // Prove control of the wallet. The token is HMAC-signed by us and carries a
  // short expiry, so it can be verified by any instance without shared state.
  if (typeof token !== "string") {
    return NextResponse.json(
      { error: "A challenge token is required. Request a challenge first." },
      { status: 400 },
    );
  }
  const nonce = readChallenge(address, token);
  if (!nonce) {
    return NextResponse.json(
      { error: "Challenge is invalid or expired. Please try again." },
      { status: 400 },
    );
  }

  let signerOk = false;
  try {
    signerOk = await verifyMessage({
      address: address as `0x${string}`,
      message: challengeMessage(address, nonce),
      signature: signature as `0x${string}`,
    });
  } catch {
    signerOk = false;
  }
  if (!signerOk) {
    return NextResponse.json(
      { error: "Signature does not match this wallet." },
      { status: 401 },
    );
  }

  // Hard ceiling, independent of the per-key limits.
  const cap = issuanceCap();
  if (!cap.ok) {
    return NextResponse.json(
      {
        error: `Demo access has reached its limit of ${cap.max} credentials for this deployment.`,
      },
      { status: 429 },
    );
  }

  // Limit per requester and per wallet: one stops a single client hammering
  // it, the other stops a spread-out client minting endless credentials.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  for (const key of [`ip:${ip}`, `addr:${address.toLowerCase()}`]) {
    const { ok, retryAfterMins } = rateLimit(key);
    if (!ok) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Try again in about ${retryAfterMins} minute${
            retryAfterMins === 1 ? "" : "s"
          }.`,
        },
        { status: 429 },
      );
    }
  }

  try {
    const result = await grantDemoAccess(address);
    if (!result.apass.ok) {
      return NextResponse.json(
        { error: `Cleanverse declined the credential: ${result.apass.detail}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ address, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cleanverse/onboard]", message);
    return NextResponse.json(
      { error: "Onboarding failed. Please try again." },
      { status: 500 },
    );
  }
}
