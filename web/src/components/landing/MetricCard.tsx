'use client'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import StatusChip from './StatusChip'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useCountUp } from '@/hooks/useCountUp'

export type MetricDevice = 'status-line' | 'gauge' | 'area-chart' | 'exit-row'

interface MetricCardProps {
  label: string
  /** static numeral text, used when no `count` is given */
  numeral?: string
  /** animated count-up target; formatted via `format` */
  count?: { to: number; format: (v: number) => string }
  copy: string
  device: MetricDevice
  className?: string
}

/* ————— Devices ————— */

function StatusLineDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const rows = [
    { action: 'stake', time: '+0s' },
    { action: 'mint', time: '+0s' },
  ]
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const on = reduce || active
        return (
          <div key={r.action} className="flex items-center justify-between rounded-[10px] bg-sunken px-3.5 py-2.5">
            <span className="font-mono text-xs text-inksoft">{r.action}</span>
            <span className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden
                className={cn('transition-all duration-300', on ? 'text-ok opacity-100' : 'text-inkfaint opacity-30')}
                style={{ transitionDelay: reduce ? '0ms' : `${200 + i * 200}ms` }}
              >
                <path d="M2.5 7.5l3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className={cn('font-mono text-xs transition-opacity duration-300', on ? 'text-ok opacity-100' : 'opacity-0')}
                style={{ transitionDelay: reduce ? '0ms' : `${200 + i * 200}ms` }}
              >
                {r.time}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function GaugeDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const C = 2 * Math.PI * 44
  return (
    <div className="relative mx-auto h-[104px] w-[104px]">
      <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
        <circle cx="52" cy="52" r="44" fill="none" stroke="var(--line)" strokeWidth="6" />
        <motion.circle
          cx="52"
          cy="52"
          r="44"
          fill="none"
          stroke="var(--cv-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={reduce ? false : { strokeDashoffset: C }}
          animate={active ? { strokeDashoffset: 0 } : undefined}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-navy" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
    </div>
  )
}

function AreaChartDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const line = 'M 4 44 C 30 42, 50 40, 76 34 S 130 26, 156 20 S 210 12, 236 8'
  const area = `${line} L 236 52 L 4 52 Z`
  return (
    <svg viewBox="0 0 240 56" className="h-14 w-full" aria-hidden>
      <defs>
        <linearGradient id="mc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cv-accent)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--cv-accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#mc-fill)"
        initial={reduce ? false : { opacity: 0 }}
        animate={active ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--cv-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={active ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
      />
      <circle cx="236" cy="8" r="4" fill="var(--cv-accent)" className={reduce ? undefined : 'end-pulse'} />
    </svg>
  )
}

function ExitRowDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const steps = [
    { label: 'Revoked', tone: 'blocked' as const },
    { label: 'Under review', tone: 'review' as const },
    { label: 'Settled', tone: 'verified' as const },
  ]
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center last:flex-none">
          <div
            className={cn(
              'transition-all duration-300',
              reduce || active ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-40',
            )}
            style={{ transitionDelay: reduce ? '0ms' : `${200 + i * 250}ms` }}
          >
            <StatusChip tone={s.tone}>{s.label}</StatusChip>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                'mx-2 h-px flex-1 transition-colors duration-300',
                reduce || active ? 'bg-navy/40' : 'bg-line',
              )}
              style={{ transitionDelay: reduce ? '0ms' : `${300 + i * 250}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/* ————— Card ————— */

export default function MetricCard({ label, numeral, count, copy, device, className }: MetricCardProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [deviceOn, setDeviceOn] = useState(false)
  const counted = useCountUp(count?.to ?? 0, inView && !!count, 1000)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setDeviceOn(true), 200)
    return () => clearTimeout(t)
  }, [inView])

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:shadow-softhover sm:p-7',
        className,
      )}
    >
      <p className="eyebrow text-inkfaint">{label}</p>
      <p className="mt-3 font-display text-[clamp(2.4rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
        {count ? count.format(counted) : numeral}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-inksoft">{copy}</p>
      <div className="mt-auto pt-6" aria-hidden={device !== 'exit-row'}>
        {device === 'status-line' && <StatusLineDevice active={deviceOn} />}
        {device === 'gauge' && <GaugeDevice active={deviceOn} />}
        {device === 'area-chart' && <AreaChartDevice active={deviceOn} />}
        {device === 'exit-row' && <ExitRowDevice active={deviceOn} />}
      </div>
    </div>
  )
}
