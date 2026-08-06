import Link from 'next/link'

const COLUMNS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Launch app', to: '/app' },
      { label: 'How it works', to: '/docs#how' },
      { label: 'Controlled exit', to: '/docs#exit' },
      { label: 'Getting started', to: '/docs#start' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'Docs', to: '/docs' },
      { label: 'Architecture', to: '/docs#architecture' },
      { label: 'Deployed addresses', to: '/docs#addresses' },
      { label: 'Public API', to: '/docs#api' },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { label: 'Cleanverse integration', to: '/docs#cleanverse' },
      { label: 'Security model', to: '/docs#security' },
      { label: 'Limitations', to: '/docs#limits' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-dark text-darktext">
      <div className="container-cv py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/continuum-mark-light.png" alt="" className="h-8 w-8" width={32} height={32} />
              <span className="font-mono text-[13px] font-medium tracking-[0.22em]">CONTINUUM</span>
            </div>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-darkmuted">
              Permissioned liquid staking for verified wallets — compliance that travels with the token.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="eyebrow text-darkmuted">{col.heading}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.to} className="text-sm text-darkmuted transition-colors hover:text-darktext">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-darkline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-darkmuted">validator 0xaC7e…1792</p>
          <p className="flex items-center gap-2 font-mono text-xs text-darkmuted">
            <span aria-hidden className="breathe inline-block h-1.5 w-1.5 rounded-full bg-ok" />
            Monad testnet
          </p>
          <p className="font-mono text-xs text-darkmuted">© {new Date().getFullYear()} Continuum</p>
        </div>
      </div>
    </footer>
  )
}
