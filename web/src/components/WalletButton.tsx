"use client";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EXPLORER = "https://testnet.monadexplorer.com/address/";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });
  const [copied, setCopied] = useState(false);

  // Wallet state only exists in the browser, so the server and the first client
  // render must agree on the neutral label; anything else is a hydration
  // mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected || !address) {
    return (
      <Button
        size="sm"
        disabled={mounted && isConnecting}
        onClick={() => connect({ connector: injected() })}
      >
        {mounted && isConnecting ? "Connecting…" : "Connect wallet"}
      </Button>
    );
  }

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DropdownMenu>
      {/* Base UI (not Radix) — composition uses `render`, not `asChild`. */}
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2.5 rounded-sm border border-line bg-paper px-3 py-1.5 transition-colors hover:bg-paper-raised"
            aria-label="Wallet menu"
          />
        }
      >
          <span
            className="size-1.5 shrink-0 rounded-full bg-verified"
            aria-hidden="true"
          />
          <span className="font-mono text-xs tabular-nums text-ink">
            {truncate(address)}
          </span>
          <span className="hidden text-xs text-ink-soft sm:inline" aria-hidden="true">
            |
          </span>
          <span className="hidden font-mono text-xs tabular-nums text-ink-soft sm:inline">
            {balance ? `${Number(formatEther(balance.value)).toFixed(3)} MON` : "—"}
          </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 border-line bg-paper-raised">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Connected · Monad testnet
          </p>
          <p className="font-mono text-xs break-all font-normal text-ink">{address}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-line" />

        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); copy(); }}>
          {copied ? "Copied" : "Copy address"}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a href={`${EXPLORER}${address}`} target="_blank" rel="noreferrer" />
          }
        >
          View on explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-line" />

        <DropdownMenuItem
          className="text-revoked focus:text-revoked"
          onSelect={() => disconnect()}
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
