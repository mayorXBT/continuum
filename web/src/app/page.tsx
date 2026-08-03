import Link from "next/link";

export default function Landing() {
  return (
    <div className="guilloche flex-1">
      {/* ————— Nav ————— */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="data text-sm font-medium tracking-[0.22em]">
          CONTINUUM
        </span>
        <nav className="flex items-center gap-4">
          <a href="#how" className="text-sm text-ink-soft hover:text-ink">
            How it works
          </a>
          <a href="#exit" className="text-sm text-ink-soft hover:text-ink">
            Controlled exit
          </a>
          <Link href="/app" className="btn btn-primary text-sm">
            Launch app
          </Link>
        </nav>
      </header>

      {/* ————— Hero ————— */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20">
        <p className="eyebrow mb-5">
          Permissioned liquid staking · Monad testnet · Cleanverse Build ’26
        </p>
        <h1 className="display max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
          Compliance that travels with&nbsp;the&nbsp;token.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Most compliant DeFi checks identity once, at the door. Continuum
          checks it at every hop: stake as a Cleanverse-verified user and
          receive <span className="data">stMON</span> — a policy-gated liquid
          staking receipt that verifies the counterparty on every single
          transfer. And when a credential is revoked, value isn’t trapped:
          it exits through review, to a verified destination.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/app" className="btn btn-primary">
            Launch app
          </Link>
          <a href="#how" className="btn btn-quiet">
            See the checkpoints
          </a>
          <span className="stamp stamp-verified ml-2">Verified at every hop</span>
        </div>

        {/* Transfer strip: token hops wallets; last hop is blocked */}
        <div className="doc mt-14 px-6 py-10">
          <div className="strip h-20">
            <div className="strip-path" />
            <div className="strip-token" aria-hidden />
            <div className="absolute left-[4%] top-full flex -translate-x-1/2 flex-col items-center gap-1 pt-1">
              <span className="data text-xs">wallet A</span>
              <span className="stamp stamp-verified stamp-flat">A-Pass ✓</span>
            </div>
            <div className="absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center gap-1 pt-1">
              <span className="data text-xs">wallet B</span>
              <span className="stamp stamp-verified stamp-flat">A-Pass ✓</span>
            </div>
            <div className="absolute left-[82%] top-full flex -translate-x-1/2 flex-col items-center gap-1 pt-1">
              <span className="data text-xs">wallet C</span>
              <span className="stamp stamp-revoked stamp-flat">Blocked</span>
            </div>
          </div>
          <div className="h-14" />
          <p className="doc-rule pt-4 text-center text-xs text-ink-soft">
            Every transfer of stMON re-checks the recipient’s A-Pass at the
            token layer. Unverified wallets are blocked at the border — no
            allowlist drift, no stale KYC database.
          </p>
        </div>
      </section>

      {/* ————— The problem ————— */}
      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">The status quo</p>
            <h2 className="display text-2xl font-semibold">
              Identity as a door check
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              A wallet verifies once, enters the protocol, and after that
              nothing that happens to the credential matters. Certificates
              lapse, sanctions land, credentials get revoked — and the
              position keeps trading as if nothing happened. That gap is why
              regulated capital stays out.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Continuum</p>
            <h2 className="display text-2xl font-semibold">
              Identity as a live control
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              The receipt itself carries the rules. Minting, transferring,
              unstaking, and exiting each re-check the credential the moment
              value moves. Revocation takes effect on the next block — across
              every venue the token touches, because the check lives in the
              token, not the venue.
            </p>
          </div>
        </div>
      </section>

      {/* ————— How it works: checkpoints on the continuity line ————— */}
      <section id="how" className="mx-auto max-w-5xl px-6 py-20">
        <p className="eyebrow mb-3">The journey of a stake</p>
        <h2 className="display mb-12 text-3xl font-semibold">
          Four checkpoints, one unbroken line
        </h2>
        <div className="continuity space-y-12">
          <div className="checkpoint checkpoint-seal">
            <p className="eyebrow mb-1">Checkpoint 01 · Verify</p>
            <h3 className="display text-xl font-semibold">
              Bind identity to the wallet
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              A Cleanverse A-Pass (CVI) attests the wallet: bank-verified,
              revocable, PII kept off-chain. No credential, no entry — the
              vault won’t take the stake.
            </p>
          </div>
          <div className="checkpoint checkpoint-seal">
            <p className="eyebrow mb-1">Checkpoint 02 · Stake</p>
            <h3 className="display text-xl font-semibold">
              MON in, stMON out
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              Stake native MON, receive stMON at the current exchange rate.
              Simulated testnet rewards raise the redemption value over time —
              no per-user ledgers, one rate for everyone.
            </p>
          </div>
          <div className="checkpoint checkpoint-seal">
            <p className="eyebrow mb-1">Checkpoint 03 · Move</p>
            <h3 className="display text-xl font-semibold">
              The receipt re-checks every hop
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              stMON’s transfer hook verifies the recipient’s credential on
              every movement. Compliance survives pools, wallets, and
              secondary transfers — the exact place where door-check systems
              lose the trail.
            </p>
          </div>
          <div className="checkpoint checkpoint-verified">
            <p className="eyebrow mb-1">Checkpoint 04 · Exit</p>
            <h3 className="display text-xl font-semibold">
              Unstake — or exit through review
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              Verified holders unstake freely. Revoked holders take the
              controlled exit below: frozen for circulation, never trapped.
            </p>
          </div>
        </div>
      </section>

      {/* ————— Controlled exit ————— */}
      <section id="exit" className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="eyebrow mb-3">The part everyone else skips</p>
          <h2 className="display max-w-2xl text-3xl font-semibold">
            Compliance without confiscation
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            Freezing a revoked wallet is table stakes. The harder question is
            the one a regulator asks next: <em>“so you seize the funds?”</em>{" "}
            Continuum’s answer is a controlled exit — the position cannot
            circulate, but its value can leave, to a verified destination,
            after human review.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="doc p-5">
              <span className="stamp stamp-revoked">Revoked</span>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                Credential revoked. Transfers, stakes, and unstakes all block
                on the next transaction. The receipt is frozen for
                circulation.
              </p>
            </div>
            <div className="doc p-5">
              <span className="stamp stamp-pending">Under review</span>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                The holder requests redemption to a verified receiver. A
                compliance officer reviews; eligibility is re-checked at
                approval and again at settlement.
              </p>
            </div>
            <div className="doc p-5">
              <span className="stamp stamp-verified">Settled</span>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                The receipt is burned, the underlying MON is delivered to the
                eligible destination, and every step is an on-chain audit
                event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ————— Stack ————— */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="eyebrow mb-3">Built on</p>
        <h2 className="display mb-8 text-3xl font-semibold">
          Cleanverse primitives, Monad speed
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="doc p-5">
            <p className="data text-sm font-medium">A-Pass · CVI</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Wallet-bound, bank-verified, revocable identity. Continuum reads
              it as a live signal on every state change.
            </p>
          </div>
          <div className="doc p-5">
            <p className="data text-sm font-medium">A-Token · CVA</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Verified assets with embedded rules. stMON mirrors this model as
              a policy-gated receipt; CVA-native issuance is the target
              integration.
            </p>
          </div>
          <div className="doc p-5">
            <p className="data text-sm font-medium">Monad testnet</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Per-transfer identity checks cost gas on every hop — parallel
              execution makes continuous compliance cheap enough to be the
              default.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 rounded-sm border border-line bg-paper-raised p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="display text-xl font-semibold">
              See the whole journey in three minutes
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Verify, stake, get blocked, get revoked, exit through review.
            </p>
          </div>
          <Link href="/app" className="btn btn-primary shrink-0 self-start sm:self-auto">
            Launch app
          </Link>
        </div>
      </section>

      {/* ————— Footer ————— */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span className="data tracking-[0.22em]">CONTINUUM</span>
          <p className="max-w-xl leading-relaxed">
            stMON is a Cleanverse policy-gated liquid staking receipt, not a
            CVA/A-Token; CVA-native issuance is the target integration.
            Rewards shown on testnet are simulated. Built for the Cleanverse
            Build: Trusted Assets Hackathon, 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
