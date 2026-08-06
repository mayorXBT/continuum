"use client";
import { useAccount, useSwitchChain } from "wagmi";
import { monadTestnet } from "../lib/wagmi";
import { Button } from "@/components/ui/button";

/**
 * Safety rail against the "10 ETH on Ethereum" trap: if a connected wallet is
 * on any chain other than Monad testnet, a native `stake` call would otherwise
 * be built for that chain's native asset (real ETH on mainnet). Writes are
 * already pinned to chainId 10143 so they can never *send* on the wrong chain,
 * but this surfaces the problem and offers a one-click switch rather than a
 * cryptic chain-mismatch error.
 */
export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === monadTestnet.id) return null;

  return (
    <div className="rounded-2xl border border-revoked/30 bg-revoked-wash p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="eyebrow text-revoked">Wrong network</p>
          <p className="text-sm text-ink">
            Your wallet is on another chain. Continuum runs on Monad testnet —
            switch before staking so transactions use MON, not the other
            chain&rsquo;s native asset.
          </p>
        </div>
        <Button
          className="bg-navy text-white hover:bg-navy-hover"
          disabled={isPending}
          onClick={() => switchChain({ chainId: monadTestnet.id })}
        >
          {isPending ? "Switching…" : "Switch to Monad testnet"}
        </Button>
      </div>
    </div>
  );
}
