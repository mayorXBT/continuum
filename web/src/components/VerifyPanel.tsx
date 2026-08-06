"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useSignMessage, useWriteContract } from "wagmi";
import { CONTRACTS } from "../lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

/** Stamp-style status chip. Mirrors the wax-seal language of the print design. */
function StatusStamp({
  tone,
  children,
}: {
  tone: "verified" | "revoked" | "pending";
  children: React.ReactNode;
}) {
  const styles = {
    verified: "border-verified/30 bg-verified-wash text-verified",
    revoked: "border-revoked/30 bg-revoked-wash text-revoked",
    pending: "border-line bg-paper text-ink-soft",
  } as const;
  return (
    <Badge
      variant="outline"
      className={`${styles[tone]} rounded-sm px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]`}
    >
      {children}
    </Badge>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </dt>
      <dd className="font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}

/**
 * Live A-Pass record from the Cleanverse sandbox, read through our server
 * route (the api-id must not reach the browser). This is the real CVI
 * credential; the on-chain registry below is what the contracts enforce
 * against today.
 */
function CleanverseRecord({ address }: { address: `0x${string}` }) {
  const [status, setStatus] = useState<ApassStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const { signMessageAsync } = useSignMessage();

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
  }, [address, nonce]);

  async function getDemoAccess() {
    setJoining(true);
    setJoinError(null);
    try {
      // Prove wallet control first — a free signature, no transaction.
      const challengeRes = await fetch(
        `/api/cleanverse/challenge?address=${address}`,
      );
      const challenge = await challengeRes.json();
      if (!challengeRes.ok) {
        setJoinError(challenge.error ?? "Could not start verification.");
        return;
      }

      let signature: string;
      try {
        signature = await signMessageAsync({ message: challenge.message });
      } catch {
        setJoinError("Signature request was rejected.");
        return;
      }

      const res = await fetch("/api/cleanverse/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, token: challenge.token }),
      });
      const body = await res.json();
      if (!res.ok) {
        setJoinError(body.error ?? "Could not grant access.");
        return;
      }
      // On-chain registration lands a beat after the API returns; wait before
      // re-reading so the panel doesn't flash "not registered" again.
      setTimeout(() => setNonce((n) => n + 1), 3000);
    } catch {
      setJoinError("Could not reach the server.");
    } finally {
      setJoining(false);
    }
  }

  const stamp = !status ? null : !status.registered ? (
    <StatusStamp tone="pending">Not registered</StatusStamp>
  ) : status.frozen ? (
    <StatusStamp tone="revoked">Frozen</StatusStamp>
  ) : status.expired ? (
    <StatusStamp tone="revoked">Expired</StatusStamp>
  ) : (
    <StatusStamp tone="verified">Active</StatusStamp>
  );

  return (
    <Card className="border-line bg-paper-raised shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Cleanverse sandbox · live CVI
          </p>
          <CardTitle className="font-display text-xl">A-Pass record</CardTitle>
          <CardDescription className="font-mono text-xs break-all">
            {address}
          </CardDescription>
        </div>
        {stamp}
      </CardHeader>

      <CardContent className="space-y-4">
        {!status && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status?.registered && (
          <>
            <Separator className="bg-line" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Field label="Tier" value={status.tier != null ? `${status.tier}` : "—"} />
              <Field
                label="Sub-tier"
                value={status.subTier != null ? `${status.subTier}` : "—"}
              />
              <Field label="Group" value={status.group ?? "—"} />
              <Field label="Sub-group" value={status.subGroup ?? "—"} />
              <Field
                label="Countries"
                value={status.countries.length ? status.countries.join(", ") : "—"}
              />
              <Field label="Expires" value={status.expiresAt ?? "—"} />
            </dl>
          </>
        )}

        {status && !status.registered && (
          <>
            <Separator className="bg-line" />
            <div className="space-y-3">
              <p className="text-sm text-ink">{status.note}</p>
              <p className="text-xs leading-relaxed text-ink-soft">
                Continuum is permissioned, so a wallet needs a verified identity
                before it can stake. On testnet you can issue yourself a demo
                credential — one click, about fifteen seconds, written on-chain.
              </p>
              <Button onClick={getDemoAccess} disabled={joining}>
                {joining ? "Issuing credential…" : "Get demo access"}
              </Button>
              {joining && (
                <p className="text-xs text-ink-soft">
                  Registering your A-Pass with Cleanverse, then adding you to the
                  registry. Two transactions — please keep this tab open.
                </p>
              )}
              {joinError && (
                <Alert variant="destructive">
                  <AlertDescription>{joinError}</AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-xs leading-relaxed text-ink-soft">
          Read live from <span className="font-mono">query_apass</span> on Monad via
          the Cleanverse UAT API. Credential data is served through our own route so
          the institution api-id never reaches the browser.
        </p>
      </CardFooter>
    </Card>
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
      <Alert className="border-line bg-paper-raised">
        <AlertDescription className="text-ink-soft">
          Connect a wallet to check its A-Pass status.
        </AlertDescription>
      </Alert>
    );
  }

  const status = flagged ? "revoked" : verified ? "verified" : "unverified";

  return (
    <div className="space-y-6">
      <CleanverseRecord address={address} />

      <Card className="border-line bg-paper-raised shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              On-chain registry · enforced by contracts
            </p>
            <CardTitle className="font-display text-xl">Wallet credential</CardTitle>
            <CardDescription className="font-mono text-xs break-all">
              {address}
            </CardDescription>
          </div>
          {status === "verified" && <StatusStamp tone="verified">Verified</StatusStamp>}
          {status === "revoked" && <StatusStamp tone="revoked">Revoked</StatusStamp>}
          {status === "unverified" && <StatusStamp tone="pending">Unverified</StatusStamp>}
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          <div className="flex flex-wrap gap-2">
            <Button
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
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                writeContract({ ...CONTRACTS.apass, functionName: "revoke", args: [address] })
              }
            >
              Revoke credential
            </Button>
            <Button
              variant="outline"
              className="border-line"
              disabled={isPending}
              onClick={() =>
                writeContract({ ...CONTRACTS.apass, functionName: "reinstate", args: [address] })
              }
            >
              Reinstate
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">{error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs leading-relaxed text-ink-soft">
            This registry is what StMON and the vault gate on today — revoking here is
            what freezes a position on the next transaction. Admin actions run from the
            deployer wallet. It implements the same{" "}
            <span className="font-mono">ICleanverseIdentity</span> interface the
            Cleanverse validator adapter will.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
