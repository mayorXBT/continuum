import { NextResponse } from "next/server";
import { queryApass, CHAIN } from "../../../../lib/cleanverse";

/**
 * GET /api/cleanverse/apass?address=0x...
 *
 * Proxies POST /query_apass so the api-id stays server-side — it must never
 * reach the browser bundle.
 */
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid 0x wallet address is required." },
      { status: 400 },
    );
  }

  if (!process.env.CLEANVERSE_API_ID) {
    return NextResponse.json(
      { error: "Cleanverse sandbox credentials are not configured." },
      { status: 503 },
    );
  }

  try {
    const status = await queryApass(address);
    return NextResponse.json({ address, chain: CHAIN, ...status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cleanverse/apass]", message);
    return NextResponse.json(
      { error: "Could not reach the Cleanverse sandbox." },
      { status: 502 },
    );
  }
}
