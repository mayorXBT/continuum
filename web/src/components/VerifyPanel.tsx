"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "../lib/contracts";

type ApassStatus = {
  registered: boolean;
  verified: boolean;
  frozen: boolean;
  expired: boolean;
  tier: number | null;
  subTier: number | null;
  group: string | null;
  subGroup: string | null;
  countries: string[];
  expiresAt: string | null;
  note: string;
};

/**
 * Live A-Pass record from the Cleanverse sandbox, read through our server
 * route (the api-id must not reach the browser). This is the real CVI
 * credential; the on-chain registry below is what the contracts enforce
 * against today.
 */
function CleanverseRecord({ address }: { address: `0x${string}` }) {
  const [status, setStatus] = useState<ApassStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus(null);
    setError(null);
    fetch(`/api/cleanverse/apass?address=${address}`)
      .then(async (r) => {
        const body = await r.json();
        if (cancelled) return;
        if (!r.ok) setError(body.error ?? "Lookup failed.");
        else setStatus(body);
      })
      .catch(() => !cancelled && setError("Could not reach the sandbox."));
    return () => {
      cancelled = true;
    };
  }, [address]);

  const rows: [string, string][] = status?.registered
    ? [
        ["Tier", status.tier != null ? `${status.tier}` : "—"],
        ["Sub-tier", status.subTier != null ? `${status.subTier}` : "—"],
        ["Group", status.group ?? "—"],
        ["Sub-group", status.subGroup ?? "—"],
        ["Countries", status.countries.length ? status.countries.join(", ") : "—"],
        ["Expires", status.expiresAt ?? "—"],
      ]
    : [];

  return (
    <section className="doc p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Cleanverse sandbox · live CVI</p>
          <h2 className="display text-xl font-semibold">A-Pass record</h2>
        </div>
        {status?.registered && status.verified && (
          <span className="stamp stamp-verified">Active</span>
        )}
        {status?.registered && status.frozen && (
          <span className="stamp stamp-revoked">Frozen</span>
        )}
        {status?.registered && status.expired && !status.frozen && (
          <span className="stamp stamp-revoked">Expired</span>
        )}
        {status && !status.registered && (
          <span className="stamp stamp-pending">Not registered</span>
        )}
      </div>

      {!status && !error && (
        <p className="text-sm text-ink-soft">Querying the Cleanverse sandbox…</p>
      )}
      {error && <p className="text-sm text-revoked">{error}</p>}

      {status?.registered && (
        <dl className="doc-rule grid grid-cols-2 gap-x-6 gap-y-2 pt-4 sm:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow text-xs">{label}</dt>
              <dd className="data text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {status && <p className="text-xs text-ink-soft">{status.note}</p>}
      <p className="text-xs text-ink-soft">
        Read live from <span className="data">query_apass</span> on Monad via the
        Cleanverse UAT API. Credential data is served through our own route so the
        institution api-id never reaches the browser.
      </p>
    </section>
  );
}

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
    <div className="space-y-6">
    <CleanverseRecord address={address} />
    <section className="doc p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">On-chain registry · enforced by contracts</p>
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
        This registry is what StMON and the vault gate on today — revoking here
        is what freezes a position on the next transaction. Admin actions run
        from the deployer wallet. It implements the same{" "}
        <span className="data">ICleanverseIdentity</span> interface the
        Cleanverse validator adapter will.
      </p>
    </section>
    </div>
  );
}
