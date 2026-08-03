"use client";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "../lib/contracts";

export function VerifyPanel() {
  const { address } = useAccount();
  const { writeContract, isPending, error } = useWriteContract();

  const { data: verified } = useReadContract({
    ...CONTRACTS.apass,
    functionName: "isVerified",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 4000 },
  });
  const { data: flagged } = useReadContract({
    ...CONTRACTS.apass,
    functionName: "isFlagged",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  if (!address) {
    return (
      <p className="text-sm text-ink-soft">
        Connect a wallet to check its A-Pass status.
      </p>
    );
  }

  const status = flagged ? "revoked" : verified ? "verified" : "unverified";

  return (
    <section className="doc p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">A-Pass · mock CVI registry</p>
          <h2 className="display text-xl font-semibold">Wallet credential</h2>
        </div>
        {status === "verified" && <span className="stamp stamp-verified">Verified</span>}
        {status === "revoked" && <span className="stamp stamp-revoked">Revoked</span>}
        {status === "unverified" && <span className="stamp stamp-pending">Unverified</span>}
      </div>
      <p className="data text-sm break-all text-ink-soft">{address}</p>
      <div className="doc-rule flex flex-wrap gap-2 pt-4">
        <button
          className="btn btn-primary text-sm"
          disabled={isPending}
          onClick={() =>
            writeContract({
              ...CONTRACTS.apass,
              functionName: "verify",
              args: [address, 1, "0x5347"], // tier 1, jurisdiction "SG"
            })
          }
        >
          Verify this wallet
        </button>
        <button
          className="btn btn-danger text-sm"
          disabled={isPending}
          onClick={() =>
            writeContract({ ...CONTRACTS.apass, functionName: "revoke", args: [address] })
          }
        >
          Revoke credential
        </button>
        <button
          className="btn btn-quiet text-sm"
          disabled={isPending}
          onClick={() =>
            writeContract({ ...CONTRACTS.apass, functionName: "reinstate", args: [address] })
          }
        >
          Reinstate
        </button>
      </div>
      {error && <p className="text-sm text-revoked">{error.message}</p>}
      <p className="text-xs text-ink-soft">
        Demo registry: admin actions run from the deployer wallet. Swaps for
        the Cleanverse sandbox A-Pass adapter behind the same interface.
      </p>
    </section>
  );
}
