'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useCountUp } from '@/hooks/useCountUp'

const STATS = [
  { to: 4, suffix: '', label: 'gated transactions' },
  { to: 5, suffix: '', label: 'validator calls' },
]

const TIMELINE = [
  { label: 'verify', note: 'A-Pass issued · 1 call' },
  { label: 'stake 1,000 MON', note: '2 calls · confirmed in 1s' },
  { label: 'transfer to verified wallet', note: 'recipient re-checked ✓' },
  { label: 'unstake', note: 'exit settled · 1s finality' },
]

function Stat({ to, label, active, suffix }: { to: number; label: string; active: boolean; suffix: string }) {
  const v = useCountUp(to, active, 1000)
  return (
    <div>
      <p className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
        {Math.round(v)}
        {suffix}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-inkfaint">{label}</p>
    </div>
  )
}

/** Quantified testnet walkthrough: 3-stat row + timeline. */
export default function CaseStudyCard() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.35)

  return (
    <div ref={ref} className="mx-auto max-w-[960px] rounded-2xl border border-line bg-surface p-6 shadow-panel sm:p-10">
      <p className="eyebrow text-navy">TESTNET WALKTHROUGH</p>
      <h3 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.03em] text-ink">
        The full lifecycle in four transactions.
      </h3>

      <div className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 sm:gap-8">
        {STATS.map((s) => (
          <Stat key={s.label} to={s.to} suffix={s.suffix} label={s.label} active={inView} />
        ))}
        <div>
          <p className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
            ~2 min
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-inkfaint">end-to-end</p>
        </div>
      </div>

      {/* mini timeline */}
      <ol className="mt-8 space-y-0">
        {TIMELINE.map((t, i) => (
          <li key={t.label} className="relative flex gap-4 pb-6 last:pb-0">
            {i < TIMELINE.length - 1 && <span aria-hidden className="absolute left-[9px] top-6 h-full w-px bg-line" />}
            <motion.span
              aria-hidden
              className="relative z-10 mt-0.5 flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full bg-ok-wash"
              initial={reduce ? false : { scale: 0 }}
              animate={inView ? { scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.2, ease: 'backOut' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M1.5 5.5l2.5 2.5 4.5-4.5" fill="none" stroke="var(--ok)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-mono text-[13px] font-medium text-ink">{t.label}</p>
              <p className={cn('font-mono text-[11px] text-inkfaint')}>{t.note}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href="/app"
        className="group mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-navy transition-colors hover:text-navy-hover"
      >
        Replay it in the app
        <span aria-hidden className="transition-transform [transition-duration:250ms] group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  )
}
