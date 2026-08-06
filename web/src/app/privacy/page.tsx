import type { Metadata } from "next";
import { LegalPage, type Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Continuum",
  description:
    "What Continuum does and does not collect, and how identity data is handled through the Cleanverse Compliance Protocol.",
};

const UPDATED = "6 August 2026";

const sections: Section[] = [
  {
    heading: "Our approach",
    body: (
      <>
        <p>
          Continuum is designed so that we hold as little about you as possible.
          The protocol needs to know one thing — whether the wallet in front of it
          currently satisfies a compliance rule. It does not need your name, your
          documents, or your history, and it does not receive them.
        </p>
        <p>
          Identity verification is performed by Cleanverse and its verification
          partners. Personally identifying material is submitted to them, not to
          us, and is governed by their privacy policy in addition to this one.
        </p>
      </>
    ),
  },
  {
    heading: "What we do not collect",
    body: (
      <>
        <p>We do not collect, store, or process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>identity documents, passport or ID numbers, or images of them;</li>
          <li>biometric data;</li>
          <li>bank account or payment card details;</li>
          <li>your name, address, date of birth, or contact details;</li>
          <li>private keys or seed phrases — we never ask for them.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "What the protocol reads",
    body: (
      <>
        <p>
          When you interact with Continuum, we read the following credential
          attributes from the Cleanverse compliance validator and from the
          Cleanverse API, for the wallet address you present:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>whether a credential exists and is currently active;</li>
          <li>tier and sub-tier;</li>
          <li>group and sub-group;</li>
          <li>issuing country codes, where present;</li>
          <li>expiry date;</li>
          <li>whether the credential is frozen.</li>
        </ul>
        <p>
          These are pseudonymous attributes attached to a wallet address. We use
          them to answer a single question — may this transaction proceed — and
          for nothing else.
        </p>
      </>
    ),
  },
  {
    heading: "On-chain data",
    body: (
      <>
        <p>
          Blockchains are public and permanent. Your wallet address, your
          balances, your transactions, and any redemption requests you submit are
          recorded on the Monad network, visible to anyone, and cannot be edited
          or deleted by us or by you.
        </p>
        <p>
          Please treat a wallet address as long-lived pseudonymous data. If it is
          ever linked to your real-world identity by any party, its entire
          transaction history becomes linkable too.
        </p>
      </>
    ),
  },
  {
    heading: "Credential lookups",
    body: (
      <p>
        Credential lookups are proxied through our own server so that our
        institutional API identifier is never exposed to your browser. The wallet
        address you are checking is transmitted to Cleanverse as part of that
        lookup. We do not attach your IP address, browser fingerprint, or any
        account of ours to the request, and we do not retain a log of lookups
        beyond ordinary short-lived server output.
      </p>
    ),
  },
  {
    heading: "Cookies and analytics",
    body: (
      <p>
        The interface sets no advertising or tracking cookies and runs no
        third-party analytics. Your wallet connection state is held locally in
        your browser so the interface can remember it between visits; clearing
        site data removes it.
      </p>
    ),
  },
  {
    heading: "Sharing",
    body: (
      <>
        <p>We share data only in these circumstances:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            with Cleanverse, to perform the credential lookup you have triggered;
          </li>
          <li>
            with the Monad network, inherently, when you submit a transaction;
          </li>
          <li>where we are legally required to do so.</li>
        </ul>
        <p>We do not sell data, and we do not share it for advertising.</p>
      </>
    ),
  },
  {
    heading: "Compliance review",
    body: (
      <p>
        If you submit a redemption request, a compliance officer sees the request
        itself — the requesting wallet, the nominated destination, the amount, and
        the credential status of both wallets. That is what a review consists of.
        They do not see identity documents, because we do not hold any.
      </p>
    ),
  },
  {
    heading: "Retention",
    body: (
      <p>
        We hold no personal database, so there is nothing for us to retain or
        delete on request. Credential attributes are read at the moment they are
        needed and are not stored by us. On-chain records persist indefinitely by
        the nature of the network and cannot be erased.
      </p>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        <p>
          Rights of access, correction, deletion, and portability apply to the
          party that actually holds your identity data — Cleanverse — and should
          be exercised with them. To revoke a credential or correct an attribute,
          contact Cleanverse.
        </p>
        <p>
          You can stop using Continuum at any time by disconnecting your wallet.
          Doing so removes nothing from the blockchain.
        </p>
      </>
    ),
  },
  {
    heading: "Children",
    body: (
      <p>
        The Service is not directed at anyone under 18, and eligibility requires a
        verified adult credential.
      </p>
    ),
  },
  {
    heading: "Changes and contact",
    body: (
      <p>
        We may update this policy; the date at the top reflects the current
        version. Questions can be sent to the maintainers through the project
        repository linked in the footer.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <p>
          The short version: Continuum never sees your identity documents. It
          reads a yes-or-no answer about a wallet from the Cleanverse compliance
          validator, and acts on it. This page explains precisely what that means
          in practice.
        </p>
      }
      sections={sections}
    />
  );
}
