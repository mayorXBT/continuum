import Link from "next/link";
import { Logo } from "./Logo";

const PRODUCT = [
  { label: "Launch app", href: "/app" },
  { label: "Docs", href: "/docs" },
  { label: "How it works", href: "/docs#how" },
  { label: "Controlled exit", href: "/docs#exit" },
];

const LEGAL = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Monad testnet", href: "https://testnet.monadexplorer.com", external: true },
  { label: "Cleanverse", href: "https://cleanverse.com", external: true },
];

function Social({ label, href, d }: { label: string; href: string; d: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="text-ink-soft transition-colors hover:text-ink"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d={d} />
      </svg>
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 px-6 pb-10">
      <div className="mx-auto max-w-5xl rounded-sm border border-line bg-paper-raised/70 p-8 sm:p-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo href="/" />
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              Continuum is permissioned liquid staking on Monad. Stake with a
              verified identity, hold a receipt that re-checks its counterparty
              on every transfer, and exit through review rather than seizure.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <Social
                label="GitHub"
                href="https://github.com"
                d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
              />
              <Social
                label="X"
                href="https://x.com"
                d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z"
              />
              <Social
                label="Telegram"
                href="https://telegram.org"
                d="M11.94 15.4 8.2 19.1c-.4.4-1.1.14-1.15-.42l-.34-4.13 8.9-8.02c.2-.18-.05-.47-.28-.32L4.53 12.6l-3.9-1.23c-.72-.23-.73-1.25 0-1.5L21.5 2.06c.64-.22 1.27.35 1.1 1.01l-4.1 15.9c-.16.62-.9.86-1.4.45L11.94 15.4Z"
              />
            </div>
          </div>

          <nav aria-label="Product">
            <h2 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Product
            </h2>
            <ul className="space-y-2.5">
              {PRODUCT.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal and resources">
            <h2 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Legal
            </h2>
            <ul className="space-y-2.5">
              {LEGAL.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Continuum. All rights reserved.</p>
          <p>
            Testnet software. Rewards shown are simulated and stMON has no
            monetary value.
          </p>
        </div>
      </div>
    </footer>
  );
}
