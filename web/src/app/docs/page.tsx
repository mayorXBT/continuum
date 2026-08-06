import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell, DocSection, type DocSection as S } from "@/components/DocsShell";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Docs — Continuum",
  description:
    "How Continuum works: permissioned liquid staking on Monad, gated by the Cleanverse CVI compliance validator, with a controlled exit instead of confiscation.",
};

const CHAIN_ID = "10143";
const EXPLORER = "https://testnet.monadexplorer.com";

const ADDRESSES = [
  ["ComplianceRouter", "0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6", "Identity source the protocol binds to"],
  ["StMON", "0x940d14C41d6F8E47549e51402219898398C8b31a", "Policy-gated liquid staking receipt"],
  ["StakingVault", "0x75dC8959c906679f477F9c8720A0656589B4A37a", "Holds staked MON, mints and burns stMON"],
  ["RedemptionQueue", "0x1819cA49E22e143025eCb5689873D2155E7647Db", "Controlled exit, officer review"],
  ["Registry (local)", "0xfC15b21eAD5D556455F562376a2D92EccBFeB677", "Demo credential registry, revocation lever"],
  ["Cleanverse validator", "0xaC7e5179C2C7f03f209136886c172eb34F161792", "IAPassComplianceValidator (Cleanverse)"],
] as const;

const sections: S[] = [
  { id: "overview", title: "Overview" },
  { id: "problem", title: "The problem" },
  { id: "how", title: "How it works" },
  { id: "start", title: "Getting started" },
  { id: "cleanverse", title: "Cleanverse integration" },
  { id: "exit", title: "The controlled exit" },
  { id: "architecture", title: "Architecture" },
  { id: "addresses", title: "Deployed addresses" },
  { id: "security", title: "Security model" },
  { id: "api", title: "Public API" },
  { id: "limits", title: "Limitations" },
  { id: "faq", title: "FAQ" },
];

function Addr({ children }: { children: string }) {
  return (
    <a
      href={`${EXPLORER}/address/${children}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs break-all text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
    >
      {children}
    </a>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-sm border border-line bg-paper-raised p-4 font-mono text-xs leading-relaxed text-ink">
      {children}
    </pre>
  );
}

function Note({ children, tone = "quiet" }: { children: React.ReactNode; tone?: "quiet" | "warn" }) {
  return (
    <div
      className={`rounded-sm border p-4 text-sm leading-relaxed ${
        tone === "warn"
          ? "border-revoked/30 bg-revoked-wash text-ink"
          : "border-line bg-paper-raised text-ink-soft"
      }`}
    >
      {children}
    </div>
  );
}

export default function Docs() {
  return (
    <>
      <DocsShell sections={sections}>
        <div className="mb-12">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Documentation
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
            Continuum
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Permissioned liquid staking on Monad testnet, where the compliance
            rule lives in the token rather than the interface — and a revoked
            holder exits through review instead of losing their funds.
          </p>
        </div>

        <div className="space-y-12">
          <DocSection id="overview" title="Overview">
            <p>
              Continuum lets a verified participant stake MON and receive{" "}
              <strong>stMON</strong>, a transferable receipt that earns as it is
              held. Every movement of that receipt re-checks the counterparty&rsquo;s
              identity credential on-chain, against a rule registered with
              Cleanverse.
            </p>
            <p>Three properties define it:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Liquid.</strong> Staking does not lock. stMON is
                transferable to any eligible counterparty from the moment it is
                minted.
              </li>
              <li>
                <strong>Continuously checked.</strong> Eligibility is evaluated at
                every stake, transfer, and exit — not once at signup.
              </li>
              <li>
                <strong>Non-confiscatory.</strong> A revoked holder stops
                circulating, but keeps principal and yield, and can exit to a
                verified destination after review.
              </li>
            </ul>
            <Note>
              Continuum runs on <strong>Monad testnet</strong> (chain {CHAIN_ID}).
              Tokens have no monetary value and staking rewards are simulated.
            </Note>
          </DocSection>

          <DocSection id="problem" title="The problem">
            <p>
              Most compliant DeFi checks identity <em>once</em>, at the door. After
              that, nothing that happens to the credential matters. A certificate
              lapses, a holder is sanctioned, a credential is revoked outright —
              and the position keeps trading as though nothing changed.
            </p>
            <p>
              Where a check does exist, it usually lives in the application: an
              allowlist in a frontend, or a database consulted by one venue. Move
              the asset somewhere else and the rule does not travel with it.
            </p>
            <p>
              Continuum puts the check in the asset. The rule holds anywhere the
              token goes, because the token is what enforces it.
            </p>
          </DocSection>

          <DocSection id="how" title="How it works">
            <p>Four checkpoints, each re-reading the credential:</p>
            <ol className="space-y-3">
              {[
                ["01 · Verify", "A Cleanverse A-Pass (CVI) binds a verified identity to a wallet. Identity documents go to Cleanverse, never to Continuum."],
                ["02 · Stake", "Deposit MON, receive stMON at the current rate. Rewards raise the redemption value rather than minting new units, so balances stay constant while their claim grows."],
                ["03 · Move", "Transfers re-check the recipient at the token layer. An ineligible recipient causes the transfer to revert on-chain."],
                ["04 · Exit", "Eligible holders unstake freely. Revoked holders take the controlled exit."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-sm border border-line bg-paper-raised p-4">
                  <p className="font-mono text-xs font-semibold tracking-[0.1em] text-seal">{t}</p>
                  <p className="mt-1.5 text-ink-soft">{d}</p>
                </li>
              ))}
            </ol>
          </DocSection>

          <DocSection id="start" title="Getting started">
            <p>
              <strong>1. Get testnet MON.</strong> You need MON on Monad testnet
              (chain {CHAIN_ID}) for gas and staking. Use a Monad testnet faucet.
            </p>
            <p>
              <strong>2. Connect your wallet.</strong> Open the{" "}
              <Link href="/app" className="text-ink underline decoration-line underline-offset-2">
                app
              </Link>{" "}
              and connect. Add Monad testnet to your wallet if prompted.
            </p>
            <p>
              <strong>3. Get a credential.</strong> Continuum is permissioned, so
              an unverified wallet cannot stake. On testnet the Verify panel
              offers one-click demo access: you sign a free message proving you
              control the wallet, and a sandbox A-Pass is issued to it. This takes
              about fifteen seconds and is written on-chain.
            </p>
            <p>
              <strong>4. Stake, move, exit.</strong> Stake MON for stMON, transfer
              it to another eligible wallet, and unstake whenever you like.
            </p>
            <Note>
              Demo access issues a <em>sandbox</em> credential under hackathon
              rules where Cleanverse relaxed the KYC requirement. A production
              A-Pass is issued by Cleanverse against real identity verification.
              See <a href="#limits" className="text-ink underline decoration-line underline-offset-2">Limitations</a>.
            </Note>
          </DocSection>

          <DocSection id="cleanverse" title="Cleanverse integration">
            <p>
              Remove Cleanverse and there is no product. The integration is
              enforcement, not display.
            </p>
            <p>
              <strong>Registered compliance pool.</strong> Continuum&rsquo;s
              ComplianceRouter is registered with the Cleanverse CVI compliance
              validator on Monad. Registration is authorised by an EIP-191
              signature from the contract owner.
            </p>
            <p>
              <strong>A rule we cannot bend.</strong> The pool carries a RuleV2 of{" "}
              <code className="font-mono text-ink">min_sub_tier 30</code>. A wallet
              holding a valid, active A-Pass at sub-tier 10 is refused — the
              threshold lives on Cleanverse&rsquo;s contract, so Continuum cannot
              quietly wave anyone through.
            </p>
            <p>
              <strong>On-chain, on every state change.</strong> Gated paths call{" "}
              <code className="font-mono text-ink">complianceVerify(pool, user)</code>{" "}
              on the validator. That call is a view function and permissionless —
              anyone can independently verify any wallet against our pool.
            </p>
            <Code>{`# Check any wallet against the Continuum pool
cast call 0xaC7e5179C2C7f03f209136886c172eb34F161792 \\
  "complianceVerify(address,address)(bool)" \\
  0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6 \\
  <WALLET> --rpc-url <MONAD_TESTNET_RPC>`}</Code>
            <p>
              <strong>Live credential reads.</strong> The Verify panel shows the
              real A-Pass record — tier, sub-tier, group, countries, expiry — read
              through Cleanverse&rsquo;s <code className="font-mono text-ink">query_apass</code>{" "}
              endpoint, proxied server-side so institutional credentials never
              reach the browser.
            </p>
          </DocSection>

          <DocSection id="exit" title="The controlled exit">
            <p>
              Freezing a revoked wallet is straightforward. The harder question is
              the one a regulator asks immediately afterwards: so you seize the
              funds?
            </p>
            <p>Continuum&rsquo;s answer is no.</p>
            <ol className="space-y-3">
              {[
                ["Revoked", "The position freezes for circulation on the next transaction. Transfers revert. Nothing is taken."],
                ["Under review", "The holder submits a redemption request nominating a verified destination wallet. A compliance officer reviews it."],
                ["Settled", "Eligibility is re-checked at approval and again at settlement. The receipt is burned and the underlying asset is delivered to the nominated wallet — principal plus earned yield."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-sm border border-line bg-paper-raised p-4">
                  <p className="font-mono text-xs font-semibold tracking-[0.1em] text-ink-soft">
                    0{i + 1} · {t}
                  </p>
                  <p className="mt-1.5 text-ink-soft">{d}</p>
                </li>
              ))}
            </ol>
            <p>
              If the nominated destination stops being eligible between approval
              and settlement, the request is deferred rather than settled to an
              ineligible wallet. Value is never released to a destination that
              fails the check at the moment of release.
            </p>
          </DocSection>

          <DocSection id="architecture" title="Architecture">
            <p>Four contracts, plus the Cleanverse validator:</p>
            <Code>{`         ┌──────────────────────────────┐
         │  Cleanverse CVI validator    │  (Cleanverse)
         │  complianceVerify(pool,user)  │
         └───────────────▲──────────────┘
                         │ view call
         ┌───────────────┴──────────────┐
         │      ComplianceRouter        │  implements ICleanverseIdentity
         │  local registry + validator  │
         └───▲───────────▲───────────▲──┘
             │           │           │
        ┌────┴───┐  ┌────┴─────┐  ┌──┴──────────────┐
        │ StMON  │  │  Vault   │  │ RedemptionQueue │
        └────────┘  └──────────┘  └─────────────────┘`}</Code>
            <p>
              <strong>ComplianceRouter</strong> implements the same identity
              interface the protocol contracts already depended on, so StMON, the
              vault, and the queue bind to it unchanged. It consults two sources
              and combines them according to a mode:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><code className="font-mono text-ink">LocalOnly</code> — registry only, validator ignored</li>
              <li><code className="font-mono text-ink">ValidatorOnly</code> — Cleanverse is authoritative</li>
              <li><code className="font-mono text-ink">RequireBoth</code> — both must pass <em>(current setting)</em></li>
              <li><code className="font-mono text-ink">EitherPasses</code> — either suffices</li>
            </ul>
            <p>
              The validator call is wrapped, because{" "}
              <code className="font-mono text-ink">complianceVerify</code> reverts
              for a pool that is not registered. An unreachable validator therefore
              degrades by mode rather than bricking every gated path:{" "}
              <strong>fail-closed</strong> for the strict modes, ignored for the
              permissive ones.
            </p>
            <p>
              Revocation deliberately stays local. The validator answers pass or
              fail only; it has no notion of a known-but-revoked holder — and that
              distinction is exactly what makes a controlled exit possible rather
              than indistinguishable from a stranger being refused.
            </p>
          </DocSection>

          <DocSection id="addresses" title="Deployed addresses">
            <p>Monad testnet, chain {CHAIN_ID}. All verifiable on-chain.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-2 pr-4 font-medium text-ink">Contract</th>
                    <th className="py-2 pr-4 font-medium text-ink">Address</th>
                    <th className="py-2 font-medium text-ink">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {ADDRESSES.map(([name, addr, role]) => (
                    <tr key={addr} className="border-b border-line/60 align-top">
                      <td className="py-3 pr-4 whitespace-nowrap text-ink">{name}</td>
                      <td className="py-3 pr-4"><Addr>{addr}</Addr></td>
                      <td className="py-3 text-ink-soft">{role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection id="security" title="Security model">
            <p><strong>What enforces what:</strong></p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Eligibility is enforced <em>in the contracts</em>. The interface
                cannot grant access the chain would refuse, and refusing in the UI
                would not stop a direct contract call — so the check lives where it
                cannot be bypassed.
              </li>
              <li>
                The Cleanverse rule is stored on Cleanverse&rsquo;s validator.
                Continuum cannot edit it from its own contracts.
              </li>
              <li>
                Compliance calls fail closed. If the validator cannot answer,
                strict modes refuse rather than permit.
              </li>
            </ul>
            <p><strong>Privileged roles:</strong></p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Owner</strong> — can set the router mode, pause the vault,
                revoke credentials in the local registry, and act as compliance
                officer on redemption requests.
              </li>
              <li>
                <strong>Operator</strong> — a deliberately narrow role used by the
                demo-access endpoint. It can admit a wallet to the local registry
                and nothing else: it cannot revoke, cannot change the compliance
                mode, and cannot touch the vault.
              </li>
            </ul>
            <p><strong>Demo access is constrained:</strong> it requires a wallet
              signature proving control of the address, is rate limited per address
              and per requester, is capped in total issuance, and can be switched
              off entirely by configuration.</p>
            <Note tone="warn">
              These contracts have <strong>not</strong> been independently audited.
              This is testnet software. Do not treat it as production-grade, and do
              not deploy it to a network holding real value without a review.
            </Note>
          </DocSection>

          <DocSection id="api" title="Public API">
            <p>
              The app exposes read endpoints you can call directly. Institutional
              credentials stay server-side and are never returned.
            </p>
            <Code>{`GET /api/cleanverse/apass?address=0x...

{
  "address":    "0x...",
  "chain":      "monad",
  "registered": true,
  "verified":   true,
  "frozen":     false,
  "expired":    false,
  "tier":       50,
  "subTier":    60,
  "group":      null,
  "subGroup":   "AB",
  "countries":  [],
  "expiresAt":  "2027-08-06",
  "note":       "A-Pass is active."
}`}</Code>
            <p>
              Prefer to trust the chain over our server? Call the validator
              directly — see{" "}
              <a href="#cleanverse" className="text-ink underline decoration-line underline-offset-2">
                Cleanverse integration
              </a>
              . Everything the interface asserts is independently checkable.
            </p>
          </DocSection>

          <DocSection id="limits" title="Limitations">
            <p>
              Continuum works end to end on Monad testnet. It is not production
              software, and the reasons are worth stating plainly.
            </p>
            <p>
              <strong>1. Sandbox credentials are not real KYC.</strong> Cleanverse
              relaxed its KYC requirement for the hackathon, which is the only
              reason one-click demo access can work. In production, an A-Pass is an
              institutional attestation: a licensed member asserts it verified the
              person and cites the provider and reference. Issuing one for an
              anonymous wallet would be a false attestation — precisely what the
              credential exists to prevent. The real path is Cleanverse KYC
              registration, or becoming a Gateway Member with genuine KYC
              references.
            </p>
            <p>
              <strong>2. Rewards are simulated.</strong> Testnet yield is a
              deterministic drip that raises redemption value. There is no
              validator delegation behind it.
            </p>
            <p>
              <strong>3. The local registry is scaffolding.</strong> It exists so
              revocation can be demonstrated on command, and because it expresses a
              known-but-revoked state the validator&rsquo;s pass/fail answer cannot.
              A production deployment would make Cleanverse the sole authority.
            </p>
            <p>
              <strong>4. Roles are not yet separated.</strong> On testnet, one
              party holds both the holder and compliance-officer keys. In
              production these are necessarily different parties.
            </p>
            <p>
              <strong>5. stMON is a receipt, not a CVA.</strong> Cleanverse&rsquo;s
              A-Token issuance is an approval-gated flow we did not complete. The
              CCP guide&rsquo;s contract-template route is the documented upgrade
              path.
            </p>
          </DocSection>

          <DocSection id="faq" title="FAQ">
            {[
              ["Does Continuum see my identity documents?", "No. Verification is performed by Cleanverse and its partners. Continuum reads pseudonymous credential attributes attached to a wallet address — tier, group, country codes, expiry, status — and nothing else."],
              ["Why did my transfer revert?", "The recipient did not satisfy the pool rule at that moment. Either they hold no A-Pass, their credential is frozen or expired, or their sub-tier is below the pool minimum of 30. The revert is the product working."],
              ["My wallet is verified but still refused — why?", "Check the sub-tier. A valid, active credential below the pool's minimum is still refused. This is deliberate: it demonstrates that the tier rule is enforced by Cleanverse rather than by us."],
              ["What happens to my funds if my credential is revoked?", "Nothing is taken. Your position freezes for circulation, and you can request an exit to a verified destination wallet. After review, the receipt is burned and the underlying asset — principal plus yield — is delivered there."],
              ["Can I verify the compliance claims myself?", "Yes. The validator's complianceVerify is a permissionless view function, so you can check any wallet against our pool from your own node without trusting our interface."],
              ["Is my stMON balance supposed to stay flat while earning?", "Yes. Rewards raise what each stMON redeems for rather than minting new units, so the balance is constant while its claim grows. Nothing to claim or compound."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-sm border border-line bg-paper-raised p-4">
                <p className="font-medium text-ink">{q}</p>
                <p className="mt-1.5 text-ink-soft">{a}</p>
              </div>
            ))}
          </DocSection>
        </div>
      </DocsShell>
      <SiteFooter />
    </>
  );
}
