"use client";
import { useState } from "react";
import Link from "next/link";
import { WalletButton } from "../../components/WalletButton";
import { VerifyPanel } from "../../components/VerifyPanel";
import { StakePanel } from "../../components/StakePanel";
import { TransferPanel } from "../../components/TransferPanel";
import { CompliancePanel } from "../../components/CompliancePanel";
import { contractsDeployed } from "../../lib/contracts";

const TABS = ["Verify", "Stake", "Transfer", "Console"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Verify");

  return (
    <div className="flex-1">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="data text-sm font-medium tracking-[0.22em]">
              CONTINUUM
            </Link>
            <span className="eyebrow hidden sm:inline">Monad testnet</span>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {!contractsDeployed && (
          <div className="doc border-seal p-4 text-sm text-ink-soft">
            <span className="stamp stamp-pending stamp-flat mr-2">Pre-deploy</span>
            Contracts aren’t on Monad testnet yet. The interface is live;
            transactions will work once addresses land in{" "}
            <span className="data">web/.env.local</span> (plan Task 8).
          </div>
        )}
        <nav className="flex gap-1 border-b border-line" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-ink text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        {tab === "Verify" && <VerifyPanel />}
        {tab === "Stake" && <StakePanel />}
        {tab === "Transfer" && <TransferPanel />}
        {tab === "Console" && <CompliancePanel />}
      </main>
    </div>
  );
}
