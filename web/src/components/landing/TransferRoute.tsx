'use client'
import { motion, useReducedMotion } from 'framer-motion'
import StatusChip from './StatusChip'
import { useInViewOnce } from '@/hooks/useInViewOnce'

/**
 * Horizontal SVG route: wallet A → wallet B → wallet C.
 * On reveal, a navy token travels A → B and is refused short of C, where a red
 * × appears and the refusal caption fades in. One-shot framer motion that
 * settles to a stable final state — no looping SMIL, so no cross-browser ghost
 * artifacts. Reduced motion: the same final state, rendered statically.
 */
export default function TransferRoute() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const show = inView || reduce

  const nodes = [
    { x: 90, label: 'wallet A', short: 'A', chip: 'A-PASS ✓', tone: 'verified' as const },
    { x: 500, label: 'wallet B', short: 'B', chip: 'A-PASS ✓', tone: 'verified' as const },
    { x: 910, label: 'wallet C', short: 'C', chip: 'BLOCKED', tone: 'blocked' as const },
  ]

  // token travel path A → B → halted short of C (stops at 840)
  const travel = reduce
    ? { cx: 840 }
    : { cx: [90, 90, 500, 500, 840, 840] }
  const travelTiming = { duration: 2.4, ease: 'linear' as const, times: [0, 0.1, 0.45, 0.6, 0.9, 1] }

  return (
    <div ref={ref}>
      <div className="relative" aria-hidden>
        <svg viewBox="0 0 1000 150" className="w-full" role="presentation">
          {/* baseline */}
          <motion.line
            x1="90"
            y1="60"
            x2="910"
            y2="60"
            stroke="var(--line-strong)"
            strokeWidth="1.5"
            initial={reduce ? false : { pathLength: 0 }}
            animate={show ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
          {/* nodes */}
          {nodes.map((n) => (
            <g key={n.label}>
              <circle cx={n.x} cy="60" r="20" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
              <text
                x={n.x}
                y="64"
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="13"
                fill="var(--ink-soft)"
              >
                {n.short}
              </text>
            </g>
          ))}
          {/* traveling token — one-shot, settles at 840 */}
          <motion.circle
            r="7"
            cy="60"
            fill="var(--cv-accent)"
            initial={reduce ? false : { cx: 90, opacity: 0 }}
            animate={show ? { ...travel, opacity: 1 } : undefined}
            transition={reduce ? undefined : travelTiming}
          />
          {/* refusal × at C — fades in after the token halts */}
          <motion.g
            stroke="var(--bad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={reduce ? false : { opacity: 0 }}
            animate={show ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: reduce ? 0 : 2.3 }}
          >
            <line x1="885" y1="49" x2="897" y2="71" />
            <line x1="897" y1="49" x2="885" y2="71" />
          </motion.g>
          {/* node captions */}
          {nodes.map((n) => (
            <text
              key={`${n.label}-cap`}
              x={n.x}
              y="106"
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="12"
              fill="var(--ink-faint)"
              className="max-sm:hidden"
            >
              {n.label}
            </text>
          ))}
        </svg>
        {/* status stamps under nodes */}
        <div className="mt-1 grid grid-cols-3 px-2">
          {nodes.map((n, i) => (
            <div
              key={`${n.label}-chip`}
              className={i === 0 ? 'justify-self-start' : i === 1 ? 'justify-self-center' : 'justify-self-end'}
            >
              <StatusChip tone={n.tone}>{n.chip}</StatusChip>
            </div>
          ))}
        </div>
      </div>

      {/* refusal caption — plain fade, no width animation */}
      <motion.p
        className="mt-5 min-h-[1.25rem] text-center font-mono text-xs text-bad"
        aria-live="polite"
        initial={reduce ? false : { opacity: 0 }}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: reduce ? 0 : 2.5 }}
      >
        transfer refused — recipient not verified (validator: 0xaC7e…1792)
      </motion.p>
      {/* screen-reader description */}
      <p className="sr-only">
        A token travels from wallet A to wallet B and passes both A-Pass checks. At wallet C the transfer is refused
        because the recipient is not verified.
      </p>
    </div>
  )
}
