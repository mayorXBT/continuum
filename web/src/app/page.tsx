import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";

const VALIDATOR = "0xaC7e5179C2C7f03f209136886c172eb34F161792";

function Chip({ children, tone = "quiet" }: { children: React.ReactNode; tone?: "quiet" | "verified" | "seal" }) {
  const styles = {
    quiet: "border-line bg-paper-raised text-ink-soft",
    verified: "border-verified/30 bg-verified-wash text-verified",
    seal: "border-seal/30 bg-seal-wash text-seal",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export default function Landing() {
  return (
    <div className="flex-1">
      {/* ————— Nav ————— */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo href="/" />
          <nav className="flex items-center gap-5">
            <a href="#why" className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline">
              Why Continuum
            </a>
            <a href="#how" className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline">
              How it works
            </a>
            <a href="#exit" className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline">
              Controlled exit
            </a>
            <Link
              href="/app"
              className="rounded-sm bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Launch app
            </Link>
          </nav>
        </div>
      </header>

      {/* ————— Hero ————— */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden />
        <div className="absolute inset-0 grid-field" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Chip tone="seal">Monad testnet</Chip>
              <Chip tone="verified">Cleanverse verified</Chip>
              <Chip>Permissioned liquid staking</Chip>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display max-w-3xl text-5xl leading-[1.04] font-semibold tracking-tight sm:text-6xl">
              Stake MON. Stay liquid.{" "}
              <span className="shimmer">Stay compliant.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Verify once, stake, and hold <span className="font-mono text-ink">stMON</span> — a
              receipt that keeps earning while you hold it and checks every
              counterparty before it moves. If your credential ever lapses, you
              exit through review. Your funds are never seized.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="rounded-sm bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Launch app
              </Link>
              <a
                href="#how"
                className="rounded-sm border border-line bg-paper-raised px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                See how it works
              </a>
            </div>
          </Reveal>

          {/* Animated transfer strip */}
          <Reveal delay={320}>
            <div className="mt-16 rounded-sm border border-line bg-paper-raised/80 px-6 pt-10 pb-6 shadow-sm backdrop-blur-sm">
              <p className="mb-8 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Verified at every hop
              </p>
              <div className="relative mx-auto h-16 max-w-3xl">
                <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-line" />
                <div className="token-dot" aria-hidden />
                {[
                  { pos: "4%", label: "wallet A", tone: "verified" as const, stamp: "A-Pass ✓" },
                  { pos: "50%", label: "wallet B", tone: "verified" as const, stamp: "A-Pass ✓" },
                  { pos: "82%", label: "wallet C", tone: "revoked" as const, stamp: "Blocked" },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="absolute top-full flex -translate-x-1/2 flex-col items-center gap-1.5 pt-3"
                    style={{ left: n.pos }}
                  >
                    <span className="font-mono text-xs text-ink-soft">{n.label}</span>
                    <span
                      className={`rounded-sm border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
                        n.tone === "verified"
                          ? "border-verified/30 bg-verified-wash text-verified"
                          : "border-revoked/30 bg-revoked-wash text-revoked"
                      }`}
                    >
                      {n.stamp}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-16" />
              <p className="border-t border-line pt-5 text-center text-xs leading-relaxed text-ink-soft">
                Every transfer re-checks the recipient at the token layer.
                Unverified wallets are refused on-chain — not hidden by a
                frontend.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— Why ————— */}
      <section id="why" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
        <Reveal>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Why Continuum
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Compliance usually costs you liquidity. Here it doesn&rsquo;t.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Liquid from the first block",
              body: "Your stake never locks. stMON is transferable to any verified counterparty the moment it's minted — no unbonding queue, no waiting period.",
              chip: "No lockup",
            },
            {
              title: "Yield with nothing to claim",
              body: "Rewards raise what each stMON redeems for, rather than minting new units. Your balance stays put while its claim grows. Nothing to harvest, nothing to compound.",
              chip: "Simulated on testnet",
            },
            {
              title: "Frozen, never confiscated",
              body: "If your credential lapses you stop circulating — but you keep your principal and everything it earned, and you exit through review to a wallet you nominate.",
              chip: "Compliance without seizure",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <article className="h-full rounded-sm border border-line bg-paper-raised p-6 shadow-sm">
                <Chip>{c.chip}</Chip>
                <h3 className="font-display mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ————— How ————— */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-paper-raised/60">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              How it works
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Four checkpoints, one unbroken line.
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Verify",
                d: "A Cleanverse A-Pass binds a verified identity to your wallet. Your documents go to Cleanverse — never to us.",
              },
              {
                n: "02",
                t: "Stake",
                d: "MON in, stMON out at the current rate. Rewards accrue to the redemption value from that moment.",
              },
              {
                n: "03",
                t: "Move",
                d: "Send stMON to anyone who's also verified. The token itself checks them — every single transfer.",
              },
              {
                n: "04",
                t: "Exit",
                d: "Unstake whenever you like. And if your credential is ever revoked, request a reviewed exit instead.",
              },
            ].map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80}>
                <div className="h-full rounded-sm border border-line bg-paper-raised p-6 shadow-sm">
                  <span className="font-mono text-xs font-semibold tracking-[0.14em] text-seal">
                    {s.n}
                  </span>
                  <h3 className="font-display mt-3 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ————— Controlled exit ————— */}
      <section id="exit" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              The part everyone else skips
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Freezing is easy. Giving it back is the hard part.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Most compliant protocols stop at blocking a revoked wallet, which
              quietly leaves your money stranded. Continuum treats revocation as
              a reason to review an exit — not a reason to keep your assets.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              You nominate a verified destination. A compliance officer reviews
              it. Eligibility is re-checked at approval and again at settlement.
              Then the receipt burns and the underlying asset lands in your
              nominated wallet — principal and yield intact.
            </p>
            <Link
              href="/app"
              className="mt-7 inline-flex rounded-sm border border-line bg-paper-raised px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
            >
              Try it on testnet
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <ol className="space-y-3">
              {[
                { s: "Revoked", d: "Position frozen for circulation on the next transaction.", tone: "revoked" },
                { s: "Under review", d: "You request an exit to a verified wallet. An officer reviews it.", tone: "seal" },
                { s: "Settled", d: "Receipt burned, underlying delivered — principal plus earned yield.", tone: "verified" },
              ].map((r, i) => (
                <li
                  key={r.s}
                  className="flex gap-4 rounded-sm border border-line bg-paper-raised p-5 shadow-sm"
                >
                  <span className="font-mono text-xs text-ink-soft">0{i + 1}</span>
                  <div>
                    <Chip tone={r.tone === "revoked" ? "quiet" : (r.tone as "verified" | "seal")}>
                      {r.s}
                    </Chip>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ————— Trust ————— */}
      <section id="trust" className="scroll-mt-20 border-t border-line bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#9BB0C4]">
              Built on Cleanverse
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              The rule isn&rsquo;t ours to bend.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#C7D3DE]">
              Eligibility is decided by Cleanverse&rsquo;s on-chain compliance
              validator, not by our contracts. We register as a compliance pool,
              a tier rule is set against it, and every gated action asks the
              validator directly. We can&rsquo;t quietly wave someone through.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { k: "On-chain", v: "Identity re-checked on every stake, transfer, and exit" },
              { k: "Tier-gated", v: "A valid credential isn't enough — the pool sets a minimum tier" },
              { k: "Fail-closed", v: "If the validator can't answer, gated transactions are refused" },
            ].map((s, i) => (
              <Reveal key={s.k} delay={i * 90}>
                <div className="h-full rounded-sm border border-[#2A3B50] bg-[#1B2C41] p-6">
                  <p className="font-display text-lg font-semibold text-paper">{s.k}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#9BB0C4]">{s.v}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={280}>
            <p className="mt-8 font-mono text-xs break-all text-[#6E8299]">
              Cleanverse compliance validator · {VALIDATOR}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ————— CTA ————— */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <Reveal>
          <div className="drift mx-auto mb-8 w-fit">
            <Logo href={null} size={44} className="!gap-3" />
          </div>
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Compliance that travels with the token.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Live on Monad testnet. Connect a verified wallet and move a position
            through all four checkpoints in about two minutes.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Launch app
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
