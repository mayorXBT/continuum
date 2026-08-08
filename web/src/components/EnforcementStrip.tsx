"use client";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, ROUTER_MODES } from "../lib/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const VALIDATOR = "0xaC7e5179C2C7f03f209136886c172eb34F161792";

/**
 * Which identity source is actually gating transactions right now. The whole
 * point of the router is that this is a live property of the deployment rather
 * than something you take on trust, so it is shown rather than described.
 */
export function EnforcementStrip() {
  const { address } = useAccount();

  const { data: mode } = useReadContract({
    ...CONTRACTS.router,
    functionName: "mode",
    query: { refetchInterval: 6000 },
  });
  const { data: available } = useReadContract({
    ...CONTRACTS.router,
    functionName: "validatorAvailable",
    args: [address ?? VALIDATOR],
    query: { refetchInterval: 6000 },
  });

  const modeIndex = typeof mode === "number" ? mode : undefined;
  // Shown until the mode read resolves, and if it fails. Deliberately neutral
  // rather than reassuring: an unread mode is not a known-good one.
  const label = modeIndex !== undefined ? ROUTER_MODES[modeIndex] : "Unknown";
  const usesValidator = modeIndex !== undefined && modeIndex !== 0;

  return (
    <Card className="rounded-2xl border-line bg-surface shadow-soft">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-inksoft">
            Enforcing now
          </p>
          <p className="font-display text-sm font-semibold text-ink">{label}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`rounded-sm px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
              usesValidator
                ? "border-seal/30 bg-seal-wash text-seal"
                : "border-line bg-paper text-inksoft"
            }`}
          >
            {usesValidator ? "CVI gate on" : "CVI gate off"}
          </Badge>
          <Badge
            variant="outline"
            className={`rounded-sm px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
              available
                ? "border-verified/30 bg-verified-wash text-verified"
                : "border-line bg-paper text-inksoft"
            }`}
          >
            {available ? "Validator responding" : "Validator unreachable"}
          </Badge>
        </div>

        <p className="w-full font-mono text-[0.7rem] break-all text-inksoft">
          Cleanverse validator {VALIDATOR}
        </p>
      </CardContent>
    </Card>
  );
}
