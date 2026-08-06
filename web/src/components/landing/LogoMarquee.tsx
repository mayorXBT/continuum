const ITEMS = ['MONAD', 'CLEANVERSE', 'A-PASS', 'stMON', 'MONAD TESTNET']

/** Grayscale mono wordmark marquee, pause on hover. aria-hidden with an sr-only static list. */
export default function LogoMarquee() {
  return (
    <div className="marquee relative overflow-hidden" role="region" aria-label="Ecosystem">
      {/* screen-reader static equivalent */}
      <ul className="sr-only">
        {ITEMS.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <div aria-hidden className="marquee-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {ITEMS.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="mx-6 whitespace-nowrap font-mono text-[28px] font-medium tracking-[0.08em] text-inkfaint first:ml-6 last:mr-6 sm:mx-12"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
      {/* edge fades */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-tint to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-tint to-transparent" />
    </div>
  )
}
