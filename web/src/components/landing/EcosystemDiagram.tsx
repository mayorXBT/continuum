'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useInViewOnce } from '@/hooks/useInViewOnce'

const MODULES = [
  { tag: 'binds', title: 'A-Pass credential', desc: 'Cleanverse-issued identity bound to your wallet.' },
  { tag: 'asks', title: 'Compliance validator', desc: 'On-chain eligibility oracle; answers or the action fails.', addr: '0xaC7e…1792' },
  { tag: 'mints/burns', title: 'Staking pool', desc: 'MON ↔ stMON at the current redemption value.' },
  { tag: 'settles', title: 'Exit review desk', desc: 'Reviewed withdrawal to a nominated verified wallet.' },
]

/**
 * Connected-node diagram: stMON token layer core with four module cards
 * joined by thin labeled connectors. Lines draw in on scroll; a small navy
 * dot then travels each connector toward the core. Stacks vertically on mobile.
 */
export default function EcosystemDiagram() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3)

  return (
    <div ref={ref} className="mx-auto max-w-[1080px]">
      {/* Desktop: horizontal grid, core left, modules right in 2×2 */}
      <div className="relative hidden items-center gap-0 md:grid md:grid-cols-[300px_1fr_1fr] md:gap-x-24 md:gap-y-8">
        {/* connectors (desktop, absolute SVG behind cards) */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 460"
          preserveAspectRatio="none"
        >
          {[
            'M 300 230 L 460 95',
            'M 300 230 L 460 365',
            'M 300 230 L 770 95',
            'M 300 230 L 770 365',
          ].map((d, i) => (
            <g key={d}>
              <motion.path
                d={d}
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.15, ease: 'easeOut' }}
              />
              {inView && !reduce && (
                <circle r="4" fill="var(--cv-accent)">
                  <animateMotion dur={`${4.5 + i * 0.5}s`} begin={`${1 + i * 0.7}s`} repeatCount="indefinite" path={d} />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.85;1"
                    dur={`${4.5 + i * 0.5}s`}
                    begin={`${1 + i * 0.7}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          ))}
        </svg>

        {/* Core card */}
        <motion.div
          className="relative row-span-2 flex h-full flex-col justify-center rounded-2xl border-2 border-navy bg-surface p-6 shadow-soft"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/continuum-mark.png" alt="" className="h-10 w-10" width={40} height={40} />
          <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-ink">stMON token layer</h3>
          <p className="mt-1.5 font-mono text-xs text-inkfaint">policy-enforced ERC-20</p>
        </motion.div>

        {/* Module cards */}
        {MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            className={cn(
              'group relative rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:border-navy/50 hover:shadow-softhover',
            )}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.45, delay: 0.55 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-navy">{m.tag}</p>
            <h4 className="mt-2 font-mono text-[13px] font-medium text-ink">{m.title}</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-inksoft">{m.desc}</p>
            {m.addr && <p className="mt-2 font-mono text-[11px] text-inkfaint">{m.addr}</p>}
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical chain */}
      <div className="md:hidden">
        <div className="rounded-2xl border-2 border-navy bg-surface p-6 shadow-soft">
          <img src="/continuum-mark.png" alt="" className="h-10 w-10" width={40} height={40} />
          <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-ink">stMON token layer</h3>
          <p className="mt-1.5 font-mono text-xs text-inkfaint">policy-enforced ERC-20</p>
        </div>
        {MODULES.map((m) => (
          <div key={m.title} className="flex flex-col items-stretch">
            <div aria-hidden className="mx-auto flex h-10 flex-col items-center">
              <span className="h-full w-px bg-linestrong" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-inkfaint">{m.tag}</span>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <h4 className="font-mono text-[13px] font-medium text-ink">{m.title}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-inksoft">{m.desc}</p>
              {m.addr && <p className="mt-2 font-mono text-[11px] text-inkfaint">{m.addr}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
