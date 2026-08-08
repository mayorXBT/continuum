'use client'
import MarketingShell from '@/components/landing/MarketingShell'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Reveal from '@/components/landing/Reveal'
import SectionHeader from '@/components/landing/SectionHeader'
import StatusChip from '@/components/landing/StatusChip'
import PathCard from '@/components/landing/PathCard'
import ProductDemoCard from '@/components/landing/ProductDemoCard'
import { useInViewOnce } from '@/hooks/useInViewOnce'

/* ————————————————— Section 1 — Page hero ————————————————— */

function PageHero() {
  return (
    <section className="bg-paper">
      <div className="container-cv pt-[120px] pb-[clamp(80px,10vw,128px)] text-center">
        <Reveal>
          <p className="eyebrow text-navy">Protocol</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="mx-auto mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            Four checkpoints, one unbroken line.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-[56ch] text-[1.125rem] leading-relaxed text-inksoft sm:text-[1.2rem]">
            Verify once. Stake. Move freely among the verified. Exit on your terms. Every gated action asks the same
            on-chain validator, and refuses when it can't get an answer.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 2 — The lifecycle ————————————————— */

function VerifyDemo() {
  return (
    <ProductDemoCard>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs tracking-[0.12em] text-ink">A-PASS · TIER 2</p>
        <StatusChip tone="verified">Active</StatusChip>
      </div>
      <dl className="mt-6 space-y-3">
        {[
          ['holder', '0x7f3a…9c21'],
          ['issued by', 'Cleanverse'],
          ['expires', 'in 182 days'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between font-mono text-[13px]">
            <dt className="text-inkfaint">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="my-6 border-t border-line" />
      {/* tier gate row */}
      <div className="flex items-center justify-between rounded-[10px] border border-line bg-sunken px-3.5 py-2.5 font-mono text-[12px]">
        <span className="text-inksoft">required tier 2</span>
        <span className="flex items-center gap-2 text-ink">
          holder tier 2
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-ok">
            <path
              d="M2.5 7.5l3 3 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <p className="mt-4 font-mono text-[11px] text-inkfaint">a valid credential below the required tier is refused</p>
    </ProductDemoCard>
  )
}

function StakeDemo() {
  return (
    <ProductDemoCard>
      <div className="rounded-[10px] border border-line bg-sunken px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-ink">1,000</span>
          <span className="font-mono text-xs text-inksoft">MON</span>
        </div>
      </div>
      <div className="my-3 flex justify-center" aria-hidden>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v12M3.5 9.5L8 14l4.5-4.5" />
        </svg>
      </div>
      <div className="rounded-[10px] border border-navy/25 bg-navy-wash px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-ink">1,000</span>
          <span className="font-mono text-xs text-navy">stMON @ 1.0000</span>
        </div>
      </div>
      {/* mint receipt */}
      <div className="mt-4 flex items-center gap-2.5 rounded-[10px] border border-line bg-sunken px-3.5 py-2.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-ok">
          <path
            d="M2.5 7.5l3 3 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-mono text-[11px] leading-relaxed text-inksoft">
          minted 1,000 stMON @ 1.0000 · block #48,211,907
        </p>
      </div>
      <p className="mt-4 font-mono text-[11px] text-inkfaint">transferable from the first block · no unbonding queue</p>
    </ProductDemoCard>
  )
}

/** Compact two-row transfer route: one verified pass, one refused. */
function MoveDemo() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)

  const rows = [
    { to: '0x9b1e…77aa', pass: true, dur: '4s' },
    { to: '0xe812…3f9b', pass: false, dur: '4s' },
  ]

  return (
    <div ref={ref}>
      <ProductDemoCard>
        <div className="space-y-4" aria-hidden>
          {rows.map((r, i) => (
            <div key={r.to} className="relative">
              <svg viewBox="0 0 340 48" className="w-full">
                <line x1="28" y1="24" x2="312" y2="24" stroke="var(--line-strong)" strokeWidth="1.5" />
                {/* origin wallet */}
                <circle cx="28" cy="24" r="14" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
                <text
                  x="28"
                  y="28"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  fill="var(--ink-soft)"
                >
                  A
                </text>
                {/* destination wallet */}
                <circle cx="312" cy="24" r="14" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
                <text
                  x="312"
                  y="28"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  fill="var(--ink-soft)"
                >
                  {r.pass ? 'B' : 'C'}
                </text>
                {/* traveling token dot */}
                {inView && !reduce && (
                  <circle r="6" fill="var(--cv-accent)">
                    <animateMotion
                      dur={r.dur}
                      begin={`${i * 0.7}s`}
                      repeatCount="indefinite"
                      calcMode="linear"
                      keyPoints={r.pass ? '0;1;1;0' : '0;0.82;0.82;0'}
                      keyTimes={r.pass ? '0;0.5;0.85;1' : '0;0.45;0.8;1'}
                      path="M 28 24 H 312"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0;0"
                      keyTimes="0;0.06;0.82;0.92;1"
                      dur={r.dur}
                      begin={`${i * 0.7}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {reduce && <circle cx={r.pass ? 312 : 261} cy="24" r="6" fill="var(--cv-accent)" />}
                {/* outcome mark at destination */}
                {r.pass ? (
                  <g stroke="var(--ok)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <path d="M305 24l5 5 10-10">
                      {inView && !reduce && (
                        <animate
                          attributeName="opacity"
                          values="0;0;1;1;0;0"
                          keyTimes="0;0.5;0.56;0.86;0.94;1"
                          dur={r.dur}
                          begin={`${i * 0.7}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </path>
                  </g>
                ) : (
                  <g stroke="var(--bad)" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="294" y1="17" x2="304" y2="31">
                      {inView && !reduce && (
                        <animate
                          attributeName="opacity"
                          values="0;0;1;1;0;0"
                          keyTimes="0;0.45;0.5;0.82;0.9;1"
                          dur={r.dur}
                          begin={`${i * 0.7}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </line>
                    <line x1="304" y1="17" x2="294" y2="31">
                      {inView && !reduce && (
                        <animate
                          attributeName="opacity"
                          values="0;0;1;1;0;0"
                          keyTimes="0;0.45;0.5;0.82;0.9;1"
                          dur={r.dur}
                          begin={`${i * 0.7}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </line>
                  </g>
                )}
              </svg>
              <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                <span className="text-inkfaint">→ {r.to}</span>
                {r.pass ? (
                  <span className="text-ok">A-PASS ✓ · settled</span>
                ) : (
                  <span className="text-bad">not verified · refused</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="sr-only">
          Two transfers: one to a verified wallet settles, one to an unverified wallet is refused on-chain.
        </p>
        <p className="mt-4 font-mono text-[11px] text-inkfaint">recipient re-checked by the validator on every transfer</p>
      </ProductDemoCard>
    </div>
  )
}

function ExitDemo() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const steps = ['requested', 'officer review', 're-check', 'settled']

  return (
    <div ref={ref}>
      <ProductDemoCard caption="eligibility re-checked at approval and settlement ✓">
        <div className="flex items-start">
          {steps.map((s, i) => {
            const last = i === steps.length - 1
            const on = reduce || inView
            return (
              <div key={s} className={cn('flex items-start', !last && 'flex-1')}>
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] transition-all duration-300',
                      on
                        ? last
                          ? 'border-ok/40 bg-ok-wash text-ok'
                          : 'border-navy/30 bg-navy-wash text-navy'
                        : 'border-line bg-surface text-inkfaint',
                    )}
                    style={{ transitionDelay: reduce ? '0ms' : `${i * 300}ms` }}
                  >
                    {last ? (
                      <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
                        <path
                          d="M2.5 7.5l3 3 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      `0${i + 1}`
                    )}
                  </span>
                  <span
                    className={cn(
                      'mt-2.5 text-center font-mono text-[10px] uppercase leading-tight tracking-[0.08em] transition-colors duration-300 max-sm:max-w-[64px]',
                      on ? (last ? 'text-ok' : 'text-ink') : 'text-inkfaint',
                    )}
                    style={{ transitionDelay: reduce ? '0ms' : `${i * 300}ms` }}
                  >
                    {s}
                  </span>
                </div>
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      'mx-2 mt-4 h-px flex-1 transition-colors duration-300 sm:mx-3',
                      on ? 'bg-navy/40' : 'bg-line',
                    )}
                    style={{ transitionDelay: reduce ? '0ms' : `${i * 300 + 150}ms` }}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-[10px] border border-line bg-sunken px-3.5 py-2.5 font-mono text-[11px]">
          <span className="text-inkfaint">payout to nominated wallet</span>
          <span className="text-ink tabular-nums">principal + yield</span>
        </div>
      </ProductDemoCard>
    </div>
  )
}

const LIFECYCLE_STEPS = [
  {
    num: '01',
    name: 'Verify',
    copy: 'A Cleanverse A-Pass binds a verified identity to your wallet. Documents go to Cleanverse, never to Continuum. The pool sets a minimum tier; a valid credential below the tier is still refused.',
    demo: <VerifyDemo />,
  },
  {
    num: '02',
    name: 'Stake',
    copy: 'MON in, stMON out at the current redemption value. No lockup, no unbonding queue, and the receipt is transferable from the first block.',
    demo: <StakeDemo />,
  },
  {
    num: '03',
    name: 'Move',
    copy: 'Send stMON to any verified counterparty. The token re-checks the recipient with the validator on every transfer. A lapsed or missing credential is refused on-chain.',
    demo: <MoveDemo />,
  },
  {
    num: '04',
    name: 'Exit',
    copy: 'Unstake whenever you like. If your credential is revoked, circulation freezes but ownership doesn’t: request a reviewed exit to a wallet you nominate, and settle principal plus yield.',
    demo: <ExitDemo />,
  },
]

function Lifecycle() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const blockRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step ?? 0))
          }
        }
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: 0 },
    )
    blockRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const jumpTo = (i: number) => {
    blockRefs.current[i]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <section className="section-pad bg-tint">
      <div className="container-cv">
        <div className="grid gap-14 lg:grid-cols-[280px_1fr] lg:gap-20">
          {/* Sticky step rail */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <p className="eyebrow text-inkfaint">The lifecycle</p>
              <ol className="mt-6 space-y-1">
                {LIFECYCLE_STEPS.map((s, i) => {
                  const isActive = active === i
                  return (
                    <li key={s.num}>
                      <button
                        type="button"
                        onClick={() => jumpTo(i)}
                        aria-current={isActive ? 'step' : undefined}
                        className="relative flex w-full items-baseline gap-3 rounded-r-[10px] py-3 pl-5 text-left"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'absolute left-0 top-1/2 h-7 w-[4px] -translate-y-1/2 rounded-full bg-navy transition-all [transition-duration:250ms]',
                            isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0',
                            reduce && 'transition-none',
                          )}
                        />
                        <span
                          className={cn(
                            'font-mono text-sm font-medium transition-colors [transition-duration:250ms]',
                            isActive ? 'text-navy' : 'text-inkfaint',
                            reduce && 'transition-none',
                          )}
                        >
                          {s.num}
                        </span>
                        <span
                          className={cn(
                            'font-display text-lg font-semibold tracking-[-0.02em] transition-colors [transition-duration:250ms]',
                            isActive ? 'text-ink' : 'text-inkfaint',
                            reduce && 'transition-none',
                          )}
                        >
                          {s.name}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-6 border-t border-line pt-5 font-mono text-[11px] leading-relaxed text-inkfaint">
                every step asks the same
                <br />
                on-chain validator
              </p>
            </div>
          </div>

          {/* Step blocks */}
          <div className="space-y-16 lg:space-y-0">
            {LIFECYCLE_STEPS.map((s, i) => (
              <article
                key={s.num}
                data-step={i}
                ref={(el) => {
                  blockRefs.current[i] = el
                }}
                className="flex flex-col justify-center lg:min-h-[70vh] lg:py-10"
              >
                <Reveal y={20}>
                  <p className="eyebrow text-navy">
                    {s.num} · {s.name}
                  </p>
                  <h3 className="mt-4 max-w-[22ch] font-display text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.625rem]">
                    {s.name === 'Verify' && 'One credential, bound to your wallet.'}
                    {s.name === 'Stake' && 'MON in, stMON out, liquid from the first block.'}
                    {s.name === 'Move' && 'Send to anyone verified. Refused to anyone else.'}
                    {s.name === 'Exit' && 'Unstake on demand, or exit through review.'}
                  </h3>
                  <p className="mt-4 max-w-[60ch] leading-relaxed text-inksoft">{s.copy}</p>
                  <div className="mt-8 max-w-[480px]">{s.demo}</div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 3 — Redemption value mechanics ————————————————— */

const CHART = (() => {
  const DAYS = 90
  const W = 720
  const H = 300
  const PL = 58
  const PR = 14
  const PT = 14
  const PB = 34
  const MIN = 1.0
  const MAX = 1.0421
  const series: number[] = []
  for (let d = 0; d < DAYS; d++) {
    const t = d / (DAYS - 1)
    const base = MIN + (MAX - MIN) * Math.pow(t, 0.9)
    const wiggle = 0.0004 * Math.sin(d * 0.85) + 0.00025 * Math.sin(d * 0.29 + 1.7)
    series.push(Math.min(MAX, Math.max(MIN, base + wiggle)))
  }
  series[DAYS - 1] = MAX
  const x = (d: number) => PL + (d / (DAYS - 1)) * (W - PL - PR)
  const y = (v: number) => PT + (1 - (v - MIN) / (MAX - MIN)) * (H - PT - PB)
  const line = series.map((v, d) => `${d === 0 ? 'M' : 'L'} ${x(d).toFixed(2)} ${y(v).toFixed(2)}`).join(' ')
  const area = `${line} L ${x(DAYS - 1).toFixed(2)} ${H - PB} L ${PL} ${H - PB} Z`
  return { DAYS, W, H, PL, PR, PT, PB, MIN, MAX, series, x, y, line, area }
})()

function RedemptionChart() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.35)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const frac = (e.clientX - rect.left) / rect.width
    const plotFrac = (frac - CHART.PL / CHART.W) / ((CHART.W - CHART.PL - CHART.PR) / CHART.W)
    const d = Math.round(plotFrac * (CHART.DAYS - 1))
    const clamped = Math.max(0, Math.min(CHART.DAYS - 1, d))
    if (clamped !== hover) setHover(clamped)
  }

  const yTicks = [CHART.MIN, 1.021, CHART.MAX]
  const xTicks = [0, 30, 60, 89]

  const hoverX = hover === null ? 0 : (CHART.x(hover) / CHART.W) * 100
  const hoverY = hover === null ? 0 : (CHART.y(CHART.series[hover]) / CHART.H) * 100
  const tipLeft = Math.max(14, Math.min(86, hoverX))

  return (
    <div ref={ref}>
      <ProductDemoCard>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-[0.12em] text-ink">REDEMPTION VALUE · 90 DAYS</p>
          <StatusChip tone="neutral">Simulated</StatusChip>
        </div>

        <div
          ref={wrapRef}
          className="relative mt-5 cursor-crosshair"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg viewBox={`0 0 ${CHART.W} ${CHART.H}`} className="w-full" role="img" aria-label="Simulated 90-day redemption value chart rising from 1.0000 to 1.0421">
            {/* gridlines + y labels */}
            {yTicks.map((v) => (
              <g key={v}>
                <line
                  x1={CHART.PL}
                  y1={CHART.y(v)}
                  x2={CHART.W - CHART.PR}
                  y2={CHART.y(v)}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
                <text
                  x={CHART.PL - 8}
                  y={CHART.y(v) + 3.5}
                  textAnchor="end"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="11"
                  fill="var(--ink-faint)"
                >
                  {v.toFixed(4)}
                </text>
              </g>
            ))}
            {/* x labels */}
            {xTicks.map((d) => (
              <text
                key={d}
                x={CHART.x(d)}
                y={CHART.H - 10}
                textAnchor={d === CHART.DAYS - 1 ? 'end' : 'middle'}
                fontFamily="'JetBrains Mono', monospace"
                fontSize="11"
                fill="var(--ink-faint)"
              >
                day {d}
              </text>
            ))}
            {/* area fill */}
            <motion.path
              d={CHART.area}
              fill="var(--cv-accent)"
              fillOpacity={0.08}
              initial={reduce ? false : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : undefined}
              transition={{ duration: 0.8, delay: reduce ? 0 : 0.9 }}
            />
            {/* value line */}
            <motion.path
              d={CHART.line}
              fill="none"
              stroke="var(--cv-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
            <circle
              cx={CHART.x(CHART.DAYS - 1)}
              cy={CHART.y(CHART.MAX)}
              r="4"
              fill="var(--cv-accent)"
              className={reduce ? undefined : 'end-pulse'}
            />
          </svg>

          {/* pointer crosshair (transform/position only) */}
          {hover !== null && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute w-px bg-navy/30"
                style={{
                  left: `${hoverX}%`,
                  top: `${(CHART.PT / CHART.H) * 100}%`,
                  bottom: `${(CHART.PB / CHART.H) * 100}%`,
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-navy"
                style={{ left: `${hoverX}%`, top: `${hoverY}%` }}
              />
              <span
                className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink shadow-soft"
                style={{ left: `${tipLeft}%`, top: `calc(${hoverY}% - 34px)` }}
              >
                day {hover} · 1 stMON = {CHART.series[hover].toFixed(4)} MON
              </span>
            </>
          )}
        </div>

        {/* stat cells */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['supply unchanged', 'value accrues to redemption', 'nothing to harvest'].map((s, i) => (
            <Reveal key={s} delay={i * 80}>
              <div className="rounded-[10px] border border-line bg-sunken px-3.5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-inksoft">
                {s}
              </div>
            </Reveal>
          ))}
        </div>
      </ProductDemoCard>
    </div>
  )
}

function RedemptionSection() {
  return (
    <section className="section-pad bg-paper">
      <div className="container-cv">
        <div className="mx-auto max-w-[880px]">
          <SectionHeader
            eyebrow="Accrual"
            title="Yield with nothing to claim."
            align="left"
          />
          <Reveal delay={100}>
            <div className="mt-8 space-y-5 leading-relaxed text-inksoft">
              <p>
                Rewards accrue to what each stMON redeems for, rather than minting new units into your wallet. The
                redemption value starts at 1.0000 MON and climbs as validator rewards land in the pool.
              </p>
              <p>
                Your balance stays constant while its claim grows, which makes accounting, reporting, and integrations
                simpler. No harvest transactions, no compounding step, no reward token to track.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200} y={20}>
            <div className="mt-12 max-w-[960px]">
              <RedemptionChart />
              <p className="mt-4 text-center text-[13px] text-inkfaint">
                Testnet accrual is simulated. No yield is promised.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 4 — Policy rules ————————————————— */

function RuleCard({
  label,
  copy,
  children,
  delay,
}: {
  label: string
  copy: string
  children: (active: boolean) => ReactNode
  delay: number
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [deviceOn, setDeviceOn] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setDeviceOn(true), 200)
    return () => clearTimeout(t)
  }, [inView])

  return (
    <Reveal delay={delay} className="h-full">
      <div
        ref={ref}
        className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:shadow-softhover sm:p-7"
      >
        <p className="eyebrow text-inkfaint">{label}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-inksoft">{copy}</p>
        <div className="mt-auto pt-6">{children(deviceOn)}</div>
      </div>
    </Reveal>
  )
}

function OnChainDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const rows = ['stake', 'transfer', 'exit']
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r} className="flex items-center justify-between rounded-[10px] bg-sunken px-3.5 py-2.5">
          <span className="font-mono text-xs text-inksoft">{r}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden
            className={cn(
              'transition-all duration-300',
              reduce || active ? 'text-ok opacity-100' : 'text-inkfaint opacity-30',
            )}
            style={{ transitionDelay: reduce ? '0ms' : `${i * 200}ms` }}
          >
            <path
              d="M2.5 7.5l3 3 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
      <p className="pt-1 font-mono text-[11px] text-inkfaint">identity re-checked · every gated action</p>
    </div>
  )
}

function TierGateDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const tiers = [
    { name: 'T1', h: 'h-8' },
    { name: 'T2', h: 'h-12' },
    { name: 'T3', h: 'h-16' },
  ]
  return (
    <div>
      <div className="flex items-end gap-3">
        {tiers.map((t, i) => (
          <div key={t.name} className="relative flex flex-col items-center gap-2">
            {/* threshold marker between T1 and T2 */}
            {i === 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute -left-[7px] bottom-0 top-[-6px] w-[2px] bg-navy transition-all [transition-duration:400ms]',
                  reduce || active ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0',
                )}
              />
            )}
            <span
              className={cn(
                'flex w-14 items-start justify-center rounded-t-[10px] border border-b-2 pt-2 font-mono text-[11px]',
                t.h,
                i >= 1 ? 'border-navy/30 border-b-navy bg-navy-wash text-navy' : 'border-line border-b-line bg-sunken text-inkfaint',
              )}
            >
              {t.name}
            </span>
          </div>
        ))}
      </div>
      <p
        className={cn(
          'pt-3 font-mono text-[11px] transition-opacity [transition-duration:400ms]',
          reduce || active ? 'text-inksoft opacity-100' : 'opacity-0',
        )}
        style={{ transitionDelay: reduce ? '0ms' : '300ms' }}
      >
        minimum: <span className="text-navy">Tier 2</span>
      </p>
    </div>
  )
}

function FailClosedDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  // phase: 0 = query sent, 1 = timeout, 2 = revert
  const [phase, setPhase] = useState(reduce ? 2 : 0)

  useEffect(() => {
    if (!active || reduce) return
    const t1 = setTimeout(() => setPhase(1), 1000)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const loop = setInterval(() => {
      setPhase(0)
      setTimeout(() => setPhase(1), 1000)
      setTimeout(() => setPhase(2), 1600)
    }, 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearInterval(loop)
    }
  }, [active, reduce])

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-sunken px-3.5 py-3 font-mono text-[11.5px] leading-[1.9]">
      <p className="text-inksoft">
        <span className="text-inkfaint">→ </span>validator.query(<span className="text-ink">0x7f3a…9c21</span>)
      </p>
      <p className={cn('transition-opacity duration-300', phase >= 1 ? 'text-warn opacity-100' : 'opacity-0')}>
        <span className="text-inkfaint">… </span>awaiting response · 1,000ms
      </p>
      <p className={cn('transition-opacity duration-300', phase >= 2 ? 'text-bad opacity-100' : 'opacity-0')}>
        <span className="text-inkfaint">✕ </span>timeout → revert · refused
      </p>
      <p className="pt-1 text-[11px] text-inkfaint">silence is a “no” · loops every 4s</p>
    </div>
  )
}

function PolicyRules() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv">
        <SectionHeader
          eyebrow="Policy"
          title="The rule isn't ours to bend."
          sub="Continuum registers as a compliance pool with the Cleanverse validator. Three rules define every gated action."
        />
        <div className="mx-auto mt-14 grid max-w-[1080px] gap-5 md:grid-cols-3">
          <RuleCard
            delay={0}
            label="On-chain"
            copy="Identity re-checked on every stake, transfer, and exit. No frontend hiding, no cached allowances."
          >
            {(active) => <OnChainDevice active={active} />}
          </RuleCard>
          <RuleCard
            delay={90}
            label="Tier-gated"
            copy="A valid credential isn't enough. The pool sets a minimum tier."
          >
            {(active) => <TierGateDevice active={active} />}
          </RuleCard>
          <RuleCard
            delay={180}
            label="Fail-closed"
            copy="If the validator can't answer, gated transactions are refused. Silence is a 'no'."
          >
            {(active) => <FailClosedDevice active={active} />}
          </RuleCard>
        </div>
        <Reveal delay={200}>
          <p className="mt-12 break-all text-center font-mono text-[12px] leading-relaxed text-inkfaint">
            Cleanverse compliance validator · 0xaC7e5179C2C7f03f209136886c172eb34F161792
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 5 — Cross-links + CTA ————————————————— */

function CrossLinks() {
  return (
    <section className="section-pad bg-paper">
      <div className="container-cv">
        <div className="mx-auto grid max-w-[880px] gap-5 sm:grid-cols-2">
          <Reveal delay={0} className="h-full">
            <PathCard
              variant="solid"
              eyebrow="For builders"
              line="Contract surface, ABIs, and a three-call quickstart for integrating compliant staking rails."
              cta="Read the developer docs"
              to="/developers"
            />
          </Reveal>
          <Reveal delay={100} className="h-full">
            <PathCard
              variant="outline"
              eyebrow="Trust model"
              line="Fail-closed behavior, the validator of record, and exactly what a reviewed exit guarantees."
              cta="Security & exit guarantees"
              to="/security"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Page ————————————————— */

function ProductBody() {
  return (
    <>
      <PageHero />
      <Lifecycle />
      <RedemptionSection />
      <PolicyRules />
      <CrossLinks />
    </>
  )
}

export default function Product() {
  return (
    <MarketingShell>
      <ProductBody />
    </MarketingShell>
  )
}
