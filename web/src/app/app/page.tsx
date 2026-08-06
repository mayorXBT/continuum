"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "../../components/Logo";
import { WalletButton } from "../../components/WalletButton";
import { EnforcementStrip } from "../../components/EnforcementStrip";
import { VerifyPanel } from "../../components/VerifyPanel";
import { StakePanel } from "../../components/StakePanel";
import { TransferPanel } from "../../components/TransferPanel";
import { CompliancePanel } from "../../components/CompliancePanel";
import Reveal from "../../components/landing/Reveal";
import Footer from "../../components/landing/Footer";
import { contractsDeployed } from "../../lib/contracts";

const TABS = ["Verify", "Stake", "Transfer", "Console"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Verify");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      {/* Dedicated app header — focused tool, not marketing nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Logo href="/" />
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-inkfaint sm:inline-flex">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
              Monad testnet
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden text-sm text-inksoft transition-colors hover:text-ink sm:inline"
            >
              Docs
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-6 py-8">
        {!contractsDeployed && (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <p className="eyebrow text-inkfaint">Pre-deploy</p>
            <p className="mt-2 text-sm text-inksoft">
              Contracts aren&rsquo;t on Monad testnet yet. The interface is live;
              transactions will work once addresses land in{" "}
              <span className="font-mono text-ink">web/.env.local</span>.
            </p>
          </div>
        )}

        <Reveal>
          <EnforcementStrip />
        </Reveal>

        {/* Segmented tab control */}
        <div
          role="tablist"
          aria-label="App sections"
          className="inline-flex flex-wrap gap-1 rounded-[12px] border border-line bg-surface p-1 shadow-soft"
        >
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-[9px] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "bg-navy text-white"
                    : "text-inksoft hover:bg-sunken hover:text-ink",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>

        <Reveal key={tab} delay={40}>
          {tab === "Verify" && <VerifyPanel />}
          {tab === "Stake" && <StakePanel />}
          {tab === "Transfer" && <TransferPanel />}
          {tab === "Console" && <CompliancePanel />}
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
