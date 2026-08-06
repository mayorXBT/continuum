"use client";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "../lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export function TransferPanel() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [receiver, setReceiver] = useState("");
  const { writeContract, isPending, error, isSuccess } = useWriteContract();

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-line bg-surface shadow-soft">
        <CardHeader className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft">
            Checkpoint 03 · Move
          </p>
          <CardTitle className="font-display text-xl">Transfer stMON</CardTitle>
          <CardDescription className="text-inksoft">
            Every transfer re-checks the recipient&rsquo;s A-Pass at the token layer.
            Unverified or revoked recipients are blocked — the error below is the
            product working.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-48 flex-1 border-line bg-paper font-mono"
              placeholder="0xRecipient"
              aria-label="Recipient address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <Input
              className="w-24 border-line bg-paper font-mono tabular-nums"
              aria-label="Amount of stMON"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              className="bg-navy text-white hover:bg-navy-hover"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.stMon,
                  functionName: "transfer",
                  args: [to as `0x${string}`, parseEther(amount)],
                })
              }
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-line bg-surface shadow-soft">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft">
              Checkpoint 04 · Exit
            </p>
            <CardTitle className="font-display text-xl">Controlled exit</CardTitle>
            <CardDescription className="text-inksoft">
              A revoked wallet cannot transfer — but it can request redemption to a
              verified receiver. After officer review, the receipt is burned and the
              underlying MON is delivered. Compliance without confiscation.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 rounded-sm border-line bg-paper px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft"
          >
            For revoked holders
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator className="bg-line" />
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-48 flex-1 border-line bg-paper font-mono"
              placeholder="0xVerifiedReceiver"
              aria-label="Verified receiver address"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <Button
              variant="outline"
              className="border-line"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.stMon,
                  functionName: "approve",
                  args: [CONTRACTS.queue.address, parseEther(amount)],
                })
              }
            >
              1 · Approve queue
            </Button>
            <Button
              className="bg-navy text-white hover:bg-navy-hover"
              disabled={isPending}
              onClick={() =>
                writeContract({ chainId: 10143,
                  ...CONTRACTS.queue,
                  functionName: "requestRedemption",
                  args: [parseEther(amount), receiver as `0x${string}`],
                })
              }
            >
              2 · Request redemption
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSuccess && (
        <Alert className="border-verified/30 bg-verified-wash">
          <AlertDescription className="text-verified">
            Transaction confirmed.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="break-all">{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
