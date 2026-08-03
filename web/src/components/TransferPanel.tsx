"use client";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

export function TransferPanel() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [receiver, setReceiver] = useState("");
  const { writeContract, isPending, error, isSuccess } = useWriteContract();

  return (
    <section className="space-y-4">
      <div className="doc space-y-3 p-6">
        <h2 className="display text-xl font-semibold">Transfer stMON</h2>
        <p className="text-xs text-ink-soft">
          Every transfer re-checks the recipient’s A-Pass at the token layer.
          Unverified or revoked recipients are blocked — the error below is
          the product working.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className="field flex-1 min-w-48"
            placeholder="0xRecipient"
            aria-label="Recipient address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            className="field w-24"
            aria-label="Amount of stMON"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="btn btn-primary text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.stMon,
                functionName: "transfer",
                args: [to as `0x${string}`, parseEther(amount)],
              })
            }
          >
            Send
          </button>
        </div>
      </div>

      <div className="doc space-y-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="display text-xl font-semibold">Controlled exit</h2>
          <span className="stamp stamp-pending">For revoked holders</span>
        </div>
        <p className="text-xs text-ink-soft">
          A revoked wallet cannot transfer — but it can request redemption to
          a verified receiver. After officer review, the receipt is burned and
          the underlying MON is delivered. Compliance without confiscation.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className="field flex-1 min-w-48"
            placeholder="0xVerifiedReceiver"
            aria-label="Verified receiver address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <button
            className="btn btn-quiet text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.stMon,
                functionName: "approve",
                args: [CONTRACTS.queue.address, parseEther(amount)],
              })
            }
          >
            1 · Approve queue
          </button>
          <button
            className="btn btn-primary text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.queue,
                functionName: "requestRedemption",
                args: [parseEther(amount), receiver as `0x${string}`],
              })
            }
          >
            2 · Request redemption
          </button>
        </div>
      </div>

      {isSuccess && <p className="text-sm text-verified">Transaction confirmed.</p>}
      {error && <p className="text-sm text-revoked">{error.message}</p>}
    </section>
  );
}
