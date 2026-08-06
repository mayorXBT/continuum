'use client'
import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import StatusChip from './StatusChip'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useEffect, useState } from 'react'

/**
 * Horizontal SVG route: wallet A → wallet B → wallet C.
 * A navy token dot travels the line, pauses at A and B, and is refused
 * 16px short of C, where a red × appears and a mono caption types in.
 * Reduced motion: static final state.
 */
export default function TransferRoute() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    if (!inView || reduce) return
    const t = setTimeout(() => setTyped(true), 4200) // types in near first refusal
    return () => clearTimeout(t)
  }, [inView, reduce])

  const nodes = [
    { x: 90, label: 'wallet A', short: 'A', chip: 'A-PASS ✓', tone: 'verified' as const },
    { x: 500, label: 'wallet B', short: 'B', chip: 'A-PASS ✓', tone: 'verified' as const },
    { x: 910, label: 'wallet C', short: 'C', chip: 'BLOCKED', tone: 'blocked' as const },
  ]

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
            animate={inView ? { pathLength: 1 } : undefined}
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
          {/* traveling token dot */}
          {inView && !reduce && (
            <circle r="7" fill="var(--cv-accent)">
              <animateMotion
                dur="5s"
                repeatCount="indefinite"
                calcMode="linear"
                keyPoints="0;0;0.519;0.519;1;1;0"
                keyTimes="0;0.3;0.46;0.6;0.78;0.95;1"
                path="M 90 60 H 880"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0;0"
                keyTimes="0;0.05;0.9;0.95;1"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          {reduce && <circle cx="880" cy="60" r="7" fill="var(--cv-accent)" />}
          {/* refusal mark at C */}
          {inView && !reduce && (
            <g stroke="var(--bad)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="885" y1="49" x2="897" y2="71">
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.76;0.8;0.92;0.96;1" dur="5s" repeatCount="indefinite" />
              </line>
              <line x1="897" y1="49" x2="885" y2="71">
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.76;0.8;0.92;0.96;1" dur="5s" repeatCount="indefinite" />
              </line>
            </g>
          )}
          {reduce && (
            <g stroke="var(--bad)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="885" y1="49" x2="897" y2="71" />
              <line x1="897" y1="49" x2="885" y2="71" />
            </g>
          )}
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

      {/* refusal caption */}
      <p className="mt-5 min-h-[1.25rem] text-center font-mono text-xs text-bad" aria-live="polite">
        {(typed || (reduce && inView) || reduce) && (
          <span className={typed && !reduce ? 'typewriter-inline' : undefined}>
            transfer refused — recipient not verified (validator: 0xaC7e…1792)
          </span>
        )}
      </p>
      {/* screen-reader description */}
      <p className="sr-only">
        A token travels from wallet A to wallet B and passes both A-Pass checks. At wallet C the transfer is refused
        because the recipient is not verified.
      </p>
    </div>
  )
}
