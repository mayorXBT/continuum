import type { Metadata } from "next";
import { LegalPage, type Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Continuum",
  description:
    "The terms governing use of Continuum, permissioned liquid staking on Monad testnet.",
};

const UPDATED = "6 August 2026";

const sections: Section[] = [
  {
    heading: "Introduction",
    body: (
      <>
        <p>
          Continuum is a permissioned liquid staking protocol deployed on the
          Monad test network. It lets a participant whose identity has been
          verified through the Cleanverse Compliance Protocol stake the network
          asset and receive <strong>stMON</strong>, a transferable receipt whose
          movement is gated by that participant&rsquo;s credential.
        </p>
        <p>
          These Terms govern your use of the Continuum interface, its smart
          contracts, and any related tooling (together, the &ldquo;Service&rdquo;).
          By using the Service you agree to them. If you do not agree, do not use
          the Service.
        </p>
        <p>
          <strong>
            Continuum is testnet software provided for evaluation. It handles no
            real money.
          </strong>{" "}
          Tokens on the Monad test network have no monetary value, staking
          rewards displayed by the Service are simulated, and nothing here is an
          offer of a financial product.
        </p>
      </>
    ),
  },
  {
    heading: "Definitions",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>A-Pass / CVI</strong> — a Cleanverse Verified Identity
          credential binding a verified person or institution to a wallet
          address.
        </li>
        <li>
          <strong>stMON</strong> — the liquid staking receipt minted by the
          Continuum vault. It represents a claim on staked assets and is
          policy-gated at the token layer.
        </li>
        <li>
          <strong>Compliance pool</strong> — a contract registered with the
          Cleanverse compliance validator, against which eligibility rules are
          evaluated on-chain.
        </li>
        <li>
          <strong>Controlled exit</strong> — the review process by which a holder
          whose credential has been revoked may redeem to a verified destination.
        </li>
        <li>
          <strong>Compliance officer</strong> — the role authorised to review and
          approve or reject exit requests.
        </li>
      </ul>
    ),
  },
  {
    heading: "Eligibility",
    body: (
      <>
        <p>
          You must be of legal age in your jurisdiction and legally permitted to
          use blockchain software. You may not use the Service if you are subject
          to sanctions, if you are located in a jurisdiction where the Service is
          prohibited, or if you have previously been suspended from it.
        </p>
        <p>
          You are responsible for the security of your wallet and private keys.
          Transactions on a blockchain are irreversible, and we cannot recover
          keys, reverse a transfer, or restore access to a wallet you no longer
          control.
        </p>
      </>
    ),
  },
  {
    heading: "Identity verification",
    body: (
      <>
        <p>
          Access requires a valid A-Pass bound to the wallet you are using.
          Verification is performed by Cleanverse and its verification partners,
          not by Continuum. We read the resulting credential; we do not collect
          or hold your identity documents.
        </p>
        <p>
          A credential is personal and non-transferable. Presenting a credential
          bound to a wallet you do not control, or permitting another person to
          transact under your credential, is a breach of these Terms.
        </p>
        <p>
          Credentials carry attributes such as tier and jurisdiction, and a pool
          may set a minimum threshold. Meeting the threshold at one moment does
          not guarantee continued eligibility: the check is re-run each time value
          moves.
        </p>
      </>
    ),
  },
  {
    heading: "How the protocol behaves",
    body: (
      <>
        <p>
          Staking mints stMON at the prevailing exchange rate. Rewards accrue by
          raising the redemption value of stMON rather than by minting additional
          units, so your balance stays constant while its claim grows.
        </p>
        <p>
          Every transfer of stMON re-checks the recipient&rsquo;s credential
          on-chain. Transfers to wallets without a valid credential, or that fail
          the pool&rsquo;s rules, will revert. This is the intended behaviour of
          the Service and not a defect.
        </p>
        <p>
          Eligibility is evaluated at the moment of each transaction. A change to
          your credential — expiry, revocation, or a change in the pool rule —
          takes effect on your next transaction, without notice.
        </p>
      </>
    ),
  },
  {
    heading: "Revocation and the controlled exit",
    body: (
      <>
        <p>
          If your credential is revoked, your position is frozen for circulation:
          you will not be able to transfer stMON. Your assets are{" "}
          <strong>not</strong> confiscated.
        </p>
        <p>
          You may submit a redemption request nominating a verified destination
          wallet. A compliance officer reviews the request, and eligibility of the
          destination is re-checked both at approval and again at settlement. On
          settlement, the receipt is burned and the underlying asset is delivered
          to the nominated wallet.
        </p>
        <p>
          A request may be rejected, or deferred if the destination ceases to be
          eligible before settlement. We do not guarantee any particular outcome
          or timescale for review.
        </p>
      </>
    ),
  },
  {
    heading: "Prohibited use",
    body: (
      <>
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            attempt to circumvent compliance checks, including by using
            intermediary contracts, wallets, or persons to move value that would
            otherwise be blocked;
          </li>
          <li>
            use the Service to launder proceeds of crime, finance terrorism, or
            evade sanctions;
          </li>
          <li>
            interfere with the Service&rsquo;s operation, including by exploiting
            a defect rather than reporting it;
          </li>
          <li>misrepresent your identity, jurisdiction, or eligibility.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Fees",
    body: (
      <p>
        Continuum charges no protocol fee on the test network. You are
        responsible for network gas costs on every transaction you submit,
        including transactions that revert because a compliance check failed.
      </p>
    ),
  },
  {
    heading: "Third parties",
    body: (
      <p>
        The Service depends on third parties including Cleanverse, the Monad
        network, wallet providers, and RPC operators. We do not control them and
        are not responsible for their availability, accuracy, or conduct. If the
        compliance validator is unreachable, the Service may refuse transactions
        rather than permit unchecked ones.
      </p>
    ),
  },
  {
    heading: "No advice",
    body: (
      <p>
        Nothing in the Service is financial, investment, legal, or tax advice. We
        are not a broker, exchange, or licensed financial institution. You are
        solely responsible for evaluating whether your use of the Service is
        lawful and appropriate for you.
      </p>
    ),
  },
  {
    heading: "Disclaimers and liability",
    body: (
      <>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranty of any kind. Smart contracts may
          contain defects. The contracts underlying this Service have{" "}
          <strong>not</strong> been independently audited.
        </p>
        <p>
          To the maximum extent permitted by law, we exclude liability for any
          indirect or consequential loss, and for loss of profits, assets, or
          data arising from your use of the Service. Nothing in these Terms
          excludes liability that cannot lawfully be excluded.
        </p>
      </>
    ),
  },
  {
    heading: "Suspension and changes",
    body: (
      <p>
        We may pause the protocol, change pool rules, alter which identity
        sources are authoritative, or withdraw the Service entirely, at any time
        and without notice, where we consider it necessary for security or
        compliance. We may amend these Terms; continued use after a change
        constitutes acceptance.
      </p>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about these Terms can be sent to the maintainers through the
        project repository linked in the footer.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <p>
          These Terms set out the basis on which you may use Continuum. They are
          written to be read, not to be skipped — the sections on revocation and
          the controlled exit describe what happens to your position if your
          credential changes, and are worth your attention.
        </p>
      }
      sections={sections}
    />
  );
}
