"use client";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const STATUS = ["None", "Pending", "Approved", "Settled", "Rejected", "Cancelled"];

type Tone = "verified" | "revoked" | "pending";
const STATUS_TONE: Record<string, Tone> = {
  Pending: "pending",
  Approved: "verified",
  Settled: "verified",
  Rejected: "revoked",
  Cancelled: "revoked",
};

function StatusStamp({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const styles = {
    verified: "border-verified/30 bg-verified-wash text-verified",
    revoked: "border-revoked/30 bg-revoked-wash text-revoked",
    pending: "border-line bg-sunken text-inksoft",
  } as const;
  return (
    <Badge
      variant="outline"
      className={`${styles[tone]} rounded-sm px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em]`}
    >
      {children}
    </Badge>
  );
}

function RequestRow({ id }: { id: bigint }) {
  const { writeContract, isPending, error } = useWriteContract();
  const { data } = useReadContract({
    ...CONTRACTS.queue,
    functionName: "requests",
    args: [id],
    query: { refetchInterval: 4000 },
  });
  if (!data) return null;
  const [requester, receiver, shares, status] = data as unknown as [
    string,
    string,
    bigint,
    number,
  ];
  const label = STATUS[status] ?? "None";
  return (
    <tr className="border-t border-line align-middle">
      <td className="p-2 font-mono text-[13px] text-ink">{id.toString()}</td>
      <td className="p-2 font-mono text-[13px] text-inksoft">{requester.slice(0, 8)}…</td>
      <td className="p-2 font-mono text-[13px] text-inksoft">{receiver.slice(0, 8)}…</td>
      <td className="p-2 font-mono text-[13px] tabular-nums text-ink">
        {Number(formatEther(shares)).toFixed(2)}
      </td>
      <td className="p-2">
        <StatusStamp tone={STATUS_TONE[label] ?? "pending"}>{label}</StatusStamp>
      </td>
      <td className="p-2">
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-linestrong px-2.5 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ chainId: 10143, ...CONTRACTS.queue, functionName: "approveRedemption", args: [id] })
            }
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-linestrong px-2.5 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ chainId: 10143, ...CONTRACTS.queue, functionName: "settleRedemption", args: [id] })
            }
          >
            Settle
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2.5 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ chainId: 10143, ...CONTRACTS.queue, functionName: "rejectRedemption", args: [id] })
            }
          >
            Reject
          </Button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-revoked">{error.message.slice(0, 90)}</p>
        )}
      </td>
    </tr>
  );
}

export function CompliancePanel() {
  const [target, setTarget] = useState("");
  const { writeContract, isPending, error } = useWriteContract();
  const { data: nextId } = useReadContract({
    ...CONTRACTS.queue,
    functionName: "nextId",
    query: { refetchInterval: 4000 },
  });

  const ids: bigint[] = [];
  for (let i = 1n; i <= ((nextId as bigint) ?? 0n); i++) ids.push(i);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-line bg-surface shadow-soft">
        <CardHeader className="space-y-1">
          <p className="eyebrow text-inkfaint">Officer</p>
          <CardTitle className="font-display text-xl">Identity registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-48 flex-1 border-line bg-paper font-mono"
              placeholder="0xWallet"
              aria-label="Wallet to verify or revoke"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Button
              className="bg-navy text-white hover:bg-navy-hover"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.apass,
                  functionName: "verify",
                  args: [target as `0x${string}`, 1, "0x5347"],
                })
              }
            >
              Verify
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.apass,
                  functionName: "revoke",
                  args: [target as `0x${string}`],
                })
              }
            >
              Revoke
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">
                {error.message.slice(0, 120)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-line bg-surface shadow-soft">
        <CardHeader className="space-y-1">
          <p className="eyebrow text-inkfaint">Review queue</p>
          <CardTitle className="font-display text-xl">Redemption requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          {ids.length === 0 ? (
            <p className="text-sm text-inksoft">
              No redemption requests yet. When a revoked holder requests a controlled exit,
              it appears here for review.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem]">
                <thead>
                  <tr className="text-left">
                    {["ID", "Requester", "Receiver", "Shares", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="p-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-inkfaint"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ids.map((id) => (
                    <RequestRow key={id.toString()} id={id} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs leading-relaxed text-inkfaint">
            Audit attribution: every request, approval, deferral, and settlement is an
            on-chain event with requester and receiver attribution, exportable from the
            explorer event log.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
