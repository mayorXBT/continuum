"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl border-line bg-surface shadow-soft">
      <CardContent className="space-y-1 p-5 text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {label}
        </p>
        <p className="font-mono text-2xl font-medium tabular-nums text-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Your stMON" value={fmt(balance)} />
        <Stat label="Rate · MON per stMON" value={fmt(rate)} />
        <Stat label="Vault assets · MON" value={fmt(totalAssets)} />
      </div>

      <Card className="rounded-2xl border-line bg-surface shadow-soft">
        <CardHeader className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft">
            Checkpoint 02 · Stake
          </p>
          <CardTitle className="font-display text-xl">Stake MON → stMON</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-32 border-line bg-paper font-mono tabular-nums"
              value={amount}
              aria-label="Amount in MON"
              inputMode="decimal"
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              className="bg-navy text-white hover:bg-navy-hover"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.vault,
                  functionName: "stake",
                  value: parseEther(amount),
                })
              }
            >
              Stake
            </Button>
            <Button
              variant="outline"
              className="border-line"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.vault,
                  functionName: "unstake",
                  args: [parseEther(amount)],
                })
              }
            >
              Unstake
            </Button>
            <Button
              variant="outline"
              className="border-dashed border-line text-inksoft"
              disabled={isPending}
              title="Owner only — raises the redemption rate"
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.vault,
                  functionName: "dripRewards",
                  value: parseEther("0.1"),
                })
              }
            >
              Drip simulated rewards (+0.1)
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">{error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs leading-relaxed text-inksoft">
            Rewards shown are simulated testnet rewards raising stMON redemption value.
            Staking and unstaking both re-check your A-Pass.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
