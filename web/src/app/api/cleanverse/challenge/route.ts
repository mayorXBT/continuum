import { NextResponse } from "next/server";
import { issueChallenge, onboardingEnabled } from "../../../../lib/onboarding";

/**
 * GET /api/cleanverse/challenge?address=0x…
 *
 * Returns a one-time nonce and the exact message to sign. The wallet must
 * return a signature over this message before we will issue it a credential,
 * which stops anyone requesting credentials for wallets they don't control.
 */
export async function GET(request: Request) {
  if (!onboardingEnabled()) {
    return NextResponse.json(
      { error: "Demo access is not enabled on this deployment." },
      { status: 503 },
    );
  }

  const address = new URL(request.url).searchParams.get("address");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid 0x wallet address is required." },
      { status: 400 },
    );
  }

  const { message, token } = issueChallenge(address);
  return NextResponse.json({ message, token });
}
