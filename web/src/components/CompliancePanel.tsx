"use client";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

const STATUS = ["None", "Pending", "Approved", "Settled", "Rejected", "Cancelled"];
const STATUS_STAMP: Record<string, string> = {
  Pending: "stamp-pending",
  Approved: "stamp-verified",
  Settled: "stamp-verified",
  Rejected: "stamp-revoked",
  Cancelled: "stamp-revoked",
};

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
    <tr className="doc-rule text-sm">
      <td className="data p-2">{id.toString()}</td>
      <td className="data p-2">{requester.slice(0, 8)}…</td>
      <td className="data p-2">{receiver.slice(0, 8)}…</td>
      <td className="data p-2">{Number(formatEther(shares)).toFixed(2)}</td>
      <td className="p-2">
        <span className={`stamp stamp-flat ${STATUS_STAMP[label] ?? "stamp-pending"}`}>
          {label}
        </span>
      </td>
      <td className="p-2">
        <div className="flex flex-wrap gap-1">
          <button
            className="btn btn-quiet px-2 py-1 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ ...CONTRACTS.queue, functionName: "approveRedemption", args: [id] })
            }
          >
            Approve
          </button>
          <button
            className="btn btn-quiet px-2 py-1 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ ...CONTRACTS.queue, functionName: "settleRedemption", args: [id] })
            }
          >
            Settle
          </button>
          <button
            className="btn btn-danger px-2 py-1 text-xs"
            disabled={isPending}
            onClick={() =>
              writeContract({ ...CONTRACTS.queue, functionName: "rejectRedemption", args: [id] })
            }
          >
            Reject
          </button>
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
    <section className="space-y-4">
      <div className="doc space-y-3 p-6">
        <p className="eyebrow">Officer</p>
        <h2 className="display text-xl font-semibold">Identity registry</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="field flex-1 min-w-48"
            placeholder="0xWallet"
            aria-label="Wallet to verify or revoke"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button
            className="btn btn-primary text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.apass,
                functionName: "verify",
                args: [target as `0x${string}`, 1, "0x5347"],
              })
            }
          >
            Verify
          </button>
          <button
            className="btn btn-danger text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.apass,
                functionName: "revoke",
                args: [target as `0x${string}`],
              })
            }
          >
            Revoke
          </button>
        </div>
        {error && <p className="text-sm text-revoked">{error.message.slice(0, 120)}</p>}
      </div>

      <div className="doc space-y-3 p-6">
        <p className="eyebrow">Review queue</p>
        <h2 className="display text-xl font-semibold">Redemption requests</h2>
        {ids.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No redemption requests yet. When a revoked holder requests a
            controlled exit, it appears here for review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="eyebrow p-2 font-normal">ID</th>
                  <th className="eyebrow p-2 font-normal">Requester</th>
                  <th className="eyebrow p-2 font-normal">Receiver</th>
                  <th className="eyebrow p-2 font-normal">Shares</th>
                  <th className="eyebrow p-2 font-normal">Status</th>
                  <th className="eyebrow p-2 font-normal">Actions</th>
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
        <p className="text-xs text-ink-soft">
          Audit attribution: every request, approval, deferral, and settlement
          is an on-chain event with requester and receiver attribution,
          exportable from the explorer event log.
        </p>
      </div>
    </section>
  );
}
