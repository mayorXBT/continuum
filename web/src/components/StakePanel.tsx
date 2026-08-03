"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

export function StakePanel() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("1");
  const { writeContract, isPending, error } = useWriteContract();

  const { data: balance } = useReadContract({
    ...CONTRACTS.stMon,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 4000 },
  });
  const { data: rate } = useReadContract({
    ...CONTRACTS.vault,
    functionName: "exchangeRate",
    query: { refetchInterval: 4000 },
  });
  const { data: totalAssets } = useReadContract({
    ...CONTRACTS.vault,
    functionName: "totalAssets",
    query: { refetchInterval: 4000 },
  });

  const fmt = (v?: unknown) =>
    v !== undefined ? Number(formatEther(v as bigint)).toFixed(4) : "—";

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="doc p-4 text-center">
          <p className="eyebrow">Your stMON</p>
          <p className="data mt-1 text-2xl font-medium">{fmt(balance)}</p>
        </div>
        <div className="doc p-4 text-center">
          <p className="eyebrow">Rate · MON per stMON</p>
          <p className="data mt-1 text-2xl font-medium">{fmt(rate)}</p>
        </div>
        <div className="doc p-4 text-center">
          <p className="eyebrow">Vault assets · MON</p>
          <p className="data mt-1 text-2xl font-medium">{fmt(totalAssets)}</p>
        </div>
      </div>
      <div className="doc space-y-4 p-6">
        <h2 className="display text-xl font-semibold">Stake MON → stMON</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="field w-32"
            value={amount}
            aria-label="Amount in MON"
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="btn btn-primary text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.vault,
                functionName: "stake",
                value: parseEther(amount),
              })
            }
          >
            Stake
          </button>
          <button
            className="btn btn-quiet text-sm"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.vault,
                functionName: "unstake",
                args: [parseEther(amount)],
              })
            }
          >
            Unstake
          </button>
          <button
            className="btn btn-quiet text-sm border-dashed"
            disabled={isPending}
            title="Owner only"
            onClick={() =>
              writeContract({
                ...CONTRACTS.vault,
                functionName: "dripRewards",
                value: parseEther("0.1"),
              })
            }
          >
            Drip simulated testnet rewards (+0.1)
          </button>
        </div>
        {error && <p className="text-sm text-revoked">{error.message}</p>}
        <p className="text-xs text-ink-soft">
          Rewards shown are simulated testnet rewards raising stMON redemption
          value. Staking and unstaking both re-check your A-Pass.
        </p>
      </div>
    </section>
  );
}
