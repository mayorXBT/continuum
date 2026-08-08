'use client'
import MarketingShell from '@/components/landing/MarketingShell'
import { memo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Reveal from '@/components/landing/Reveal'
import SectionHeader from '@/components/landing/SectionHeader'
import StatusChip from '@/components/landing/StatusChip'
import type { StatusTone } from '@/components/landing/StatusChip'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useCountUp } from '@/hooks/useCountUp'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ————————————————— Section 1 — Hero ————————————————— */

function Hero() {
  return (
    <section className="bg-paper pt-[120px] pb-[clamp(80px,10vw,128px)]">
      <div className="container-cv max-w-[880px] text-center">
        <Reveal y={20}>
          <p className="eyebrow text-inkfaint">Security &amp; Compliance</p>
        </Reveal>
        <Reveal y={20} delay={100}>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            Fail closed. Return everything.
          </h1>
        </Reveal>
        <Reveal y={20} delay={200}>
          <p className="mx-auto mt-6 max-w-[56ch] text-[1.125rem] leading-relaxed text-inksoft sm:text-[1.25rem]">
            Continuum's safety model in two sentences: if the validator can't confirm eligibility, the action is
            refused. And if your credential lapses, your assets are returned through review, never seized.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 2 — Trust model ————————————————— */

function CheckRowsDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const rows = ['stake', 'transfer', 'exit']
  return (
    <div className="space-y-2" aria-hidden>
      {rows.map((action, i) => {
        const on = reduce || active
        return (
          <div key={action} className="flex items-center justify-between rounded-[10px] bg-sunken px-3.5 py-2.5">
            <span className="font-mono text-xs text-inksoft">{action}</span>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'font-mono text-xs transition-opacity duration-300',
                  on ? 'text-ok opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: reduce ? '0ms' : `${200 + i * 250}ms` }}
              >
                eligible
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden
                className={cn(
                  'transition-all duration-300',
                  on ? 'text-ok opacity-100' : 'text-inkfaint opacity-30',
                )}
                style={{ transitionDelay: reduce ? '0ms' : `${200 + i * 250}ms` }}
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
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TierLadderDevice({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active
  const tiers = [
    { label: 'tier 4', width: '100%', eligible: true },
    { label: 'tier 3', width: '72%', eligible: true },
    { label: 'tier 2', width: '46%', eligible: false },
    { label: 'tier 1', width: '22%', eligible: false },
  ]
  return (
    <div className="space-y-2" aria-hidden>
      {tiers.map((t, i) => (
        <div key={t.label} className="relative flex items-center gap-3">
          <span className="w-12 shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-inkfaint">
            {t.label}
          </span>
          <div className="relative h-6 flex-1 rounded-[6px] bg-sunken">
            <div
              className={cn(
                'h-full rounded-[6px] transition-all duration-500',
                t.eligible ? 'bg-navy/85' : 'bg-linestrong/70',
                on ? 'opacity-100' : 'opacity-0',
              )}
              style={{ width: t.width, transitionDelay: reduce ? '0ms' : `${150 + i * 150}ms` }}
            />
            {t.label === 'tier 3' && (
              <span
                className={cn(
                  'absolute -top-1.5 right-2 rounded-[6px] border border-navy/25 bg-navy-wash px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-navy transition-opacity duration-300',
                  on ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: reduce ? '0ms' : '700ms' }}
              >
                pool minimum
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Looping query → timeout → revert log. Isolated + memoized perpetual animation. */
const FailClosedLogDevice = memo(function FailClosedLogDevice() {
  const reduce = useReducedMotion()
  const lines = [
    { text: '→ query eligibility(0x8f3…a91c)', tone: 'text-inksoft' },
    { text: '… validator silence · timeout 12s', tone: 'text-warn' },
    { text: '✕ revert: FAIL_CLOSED', tone: 'text-bad' },
  ]
  return (
    <div className="space-y-1.5 rounded-[10px] bg-sunken px-3.5 py-3 font-mono text-xs" aria-hidden>
      {lines.map((l, i) =>
        reduce ? (
          <p key={l.text} className={l.tone}>
            {l.text}
          </p>
        ) : (
          <motion.p
            key={l.text}
            className={l.tone}
            animate={{ opacity: [0.25, 1, 1, 0.25] }}
            transition={{ duration: 4.8, times: [0, 0.18 + i * 0.18, 0.82, 1], delay: i * 0.6, repeat: Infinity }}
          >
            {l.text}
          </motion.p>
        ),
      )}
    </div>
  )
})

function PrincipleCard({
  label,
  title,
  copy,
  device,
}: {
  label: string
  title: string
  copy: string
  device: 'onchain' | 'tier' | 'failclosed'
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  return (
    <div
      ref={ref}
      className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:shadow-softhover sm:p-7"
    >
      <p className="eyebrow text-inkfaint">{label}</p>
      <h3 className="mt-3 font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
      <p className="mt-2.5 text-[15px] leading-relaxed text-inksoft">{copy}</p>
      <div className="mt-auto pt-6">
        {device === 'onchain' && <CheckRowsDevice active={inView} />}
        {device === 'tier' && <TierLadderDevice active={inView} />}
        {device === 'failclosed' && <FailClosedLogDevice />}
      </div>
    </div>
  )
}

/** Live validator status: ticking "last checked" counter via textContent only. */
function LiveValidatorStatus() {
  const reduce = useReducedMotion()
  const tickRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reduce) return
    let seconds = 0
    const el = tickRef.current
    if (el) el.textContent = '0s'
    const id = setInterval(() => {
      seconds = (seconds + 1) % 13
      if (tickRef.current) tickRef.current.textContent = `${seconds}s`
    }, 1000)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <div className="mt-12 flex flex-col gap-3 rounded-[10px] border border-line bg-sunken p-3 font-mono text-xs text-inksoft sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
      <p className="break-all">
        Cleanverse compliance validator · 0xaC7e5179C2C7f03f209136886c172eb34F161792 · Monad testnet
      </p>
      <p className="flex shrink-0 items-center gap-2">
        {reduce ? (
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
        ) : (
          <motion.span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-ok"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          />
        )}
        {!reduce && <span className="uppercase tracking-[0.12em] text-ok">live</span>}
        <span>
          responding · last checked{' '}
          <span ref={tickRef} className="tabular-nums">
            12s
          </span>{' '}
          ago
        </span>
      </p>
    </div>
  )
}

function TrustModel() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv">
        <SectionHeader
          eyebrow="The rule"
          title="The rule isn't ours to bend."
          sub="Eligibility is decided by Cleanverse's on-chain compliance validator, not by Continuum's contracts. Continuum registers as a compliance pool, a tier rule is set against it, and every gated action asks the validator directly."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <Reveal delay={0}>
            <PrincipleCard
              label="On-chain"
              title="Re-checked every time"
              copy="Eligibility is re-checked on every stake, transfer, and exit. Never cached, never assumed."
              device="onchain"
            />
          </Reveal>
          <Reveal delay={90}>
            <PrincipleCard
              label="Tier-gated"
              title="One threshold, set once"
              copy="The minimum credential tier is set at the pool. Every counterparty is measured against the same bar."
              device="tier"
            />
          </Reveal>
          <Reveal delay={180}>
            <PrincipleCard
              label="Fail-closed"
              title="Silence means refusal"
              copy="If the validator doesn't answer, the action reverts. No answer is treated as a no."
              device="failclosed"
            />
          </Reveal>
        </div>
        <Reveal delay={120}>
          <LiveValidatorStatus />
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 3 — Controlled exit ————————————————— */

const EXIT_STAGES: { chip: string; tone: StatusTone; desc: string; caption: string }[] = [
  {
    chip: 'Revoked',
    tone: 'blocked',
    desc: 'Position frozen for circulation on the next transaction.',
    caption: 'Ownership unchanged. Yield already accrued stays yours.',
  },
  {
    chip: 'Requested',
    tone: 'neutral',
    desc: 'You nominate a verified destination wallet and request an exit.',
    caption: 'No new credential needed to ask.',
  },
  {
    chip: 'Under review',
    tone: 'review',
    desc: 'A compliance officer reviews the request; eligibility is re-checked at approval.',
    caption: 'Reviewed by a human, bounded by policy.',
  },
  {
    chip: 'Settled',
    tone: 'verified',
    desc: 'Re-check at settlement, receipt burns, underlying lands in the nominated wallet.',
    caption: 'Principal + yield, intact.',
  },
]

function ExitTimeline() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3)
  const show = reduce || inView

  return (
    <div ref={ref} className="flex flex-col md:flex-row md:items-stretch">
      {EXIT_STAGES.map((s, i) => (
        <div key={s.chip} className="flex flex-col md:flex-1 md:flex-row md:items-start">
          {/* Stage node */}
          <motion.div
            className="flex-1 rounded-[10px] border border-line bg-sunken p-4"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.2, ease: EASE }}
          >
            <div className="flex items-center justify-between gap-2">
              <StatusChip tone={s.tone}>{s.chip}</StatusChip>
              <span className="font-mono text-[11px] text-inkfaint">0{i + 1}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink">{s.desc}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-inkfaint">{s.caption}</p>
          </motion.div>
          {/* Connector */}
          {i < EXIT_STAGES.length - 1 && (
            <div aria-hidden className="flex items-center justify-center px-0 py-1 md:w-10 md:shrink-0 md:py-0">
              <motion.span
                className="block h-6 w-px bg-linestrong md:h-px md:w-full md:origin-left"
                initial={reduce ? false : { scaleY: 0 }}
                animate={show ? { scaleY: 1 } : undefined}
                style={{ transformOrigin: 'top' }}
                transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.2 + 0.15, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function GuaranteeCell({
  label,
  target,
  suffix,
  note,
  delay,
  start,
}: {
  label: string
  target: number
  suffix?: string
  note?: string
  delay: number
  start: boolean
}) {
  const reduce = useReducedMotion()
  const counted = useCountUp(target, start, 1000)
  return (
    <div className="px-5 py-5 text-center">
      <p className="font-mono text-2xl font-medium text-ink tabular-nums sm:text-3xl">
        {target === 0 ? (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={start ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: reduce ? 0 : delay }}
          >
            0
          </motion.span>
        ) : (
          Math.round(counted)
        )}
        {suffix}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-inksoft">
        {label}{note && <span className="text-inkfaint">, {note}</span>}
      </p>
    </div>
  )
}

function GuaranteeStrip() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  return (
    <div
      ref={ref}
      className="mt-8 grid grid-cols-1 divide-y divide-line rounded-[10px] border border-line bg-sunken sm:grid-cols-3 sm:divide-x sm:divide-y-0"
    >
      <GuaranteeCell label="principal returned" target={100} suffix="%" delay={0} start={inView} />
      <GuaranteeCell label="accrued yield returned" target={100} suffix="%" delay={0.15} start={inView} />
      <GuaranteeCell label="seizure events" note="by design" target={0} delay={0.3} start={inView} />
    </div>
  )
}

function ControlledExit() {
  return (
    <section className="section-pad bg-paper">
      <div className="container-cv">
        <SectionHeader
          eyebrow="When credentials lapse"
          title="Freezing is easy. Giving it back is the hard part."
          sub="Most compliant protocols stop at blocking a revoked wallet, quietly stranding the money. Continuum treats revocation as a reason to review an exit, not a reason to keep assets."
        />
        <Reveal delay={100} className="mx-auto mt-14 max-w-[960px]">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-8">
            <ExitTimeline />
            <GuaranteeStrip />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 4 — Trust assumptions ————————————————— */

const ASSUMPTIONS: { who: string; what: string }[] = [
  {
    who: 'Cleanverse',
    what: 'Issues and revokes A-Pass credentials, and answers eligibility queries. Continuum cannot override its answers.',
  },
  {
    who: 'Continuum contracts',
    what: 'Hold stake, mint receipts, and route exit requests. No admin key can move user funds; the fail-closed flag is locked on.',
  },
  {
    who: 'Monad testnet',
    what: 'Current deployment is a testnet with simulated accrual. No real funds are at risk; no yield is promised.',
  },
  {
    who: 'Exit review desk',
    what: 'A human review step bounds settlement time. Policy requires re-checks at approval and settlement.',
  },
]

function TrustAssumptions() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv max-w-[880px]">
        <SectionHeader eyebrow="Assumptions" title="What you have to trust, stated plainly." />
        <div className="mt-12">
          {ASSUMPTIONS.map((a, i) => (
            <Reveal key={a.who} delay={i * 60} y={12}>
              <div className="grid gap-1.5 border-t border-line py-5 last:border-b sm:grid-cols-[200px_1fr] sm:gap-6">
                <p className="font-mono text-sm text-ink">{a.who}</p>
                <p className="text-[15px] leading-relaxed text-inksoft">{a.what}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 5 — FAQ ————————————————— */

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What happens if Cleanverse goes offline?',
    a: 'Gated actions fail closed: stakes, transfers, and exits are refused until the validator responds. Existing balances are untouched.',
  },
  {
    q: 'Can Continuum unblock a wallet on its own?',
    a: "No. Eligibility answers come from the validator; the pool can't wave anyone through.",
  },
  {
    q: 'Do I lose my yield if my credential is revoked?',
    a: 'No. Accrued redemption value is yours and is delivered with principal at settlement.',
  },
  {
    q: 'Who reviews exits?',
    a: 'A compliance officer under the exit desk policy, with eligibility re-checked at approval and at settlement.',
  },
  {
    q: 'Is there a lockup or unbonding period?',
    a: 'None. stMON is transferable to verified counterparties from the first block.',
  },
  {
    q: 'Is this live money?',
    a: 'No. Continuum is on Monad testnet with simulated accrual. Production A-Pass issuance runs through Cleanverse identity verification.',
  },
]

function FaqItem({
  q,
  a,
  open,
  onToggle,
  index,
}: {
  q: string
  a: string
  open: boolean
  onToggle: () => void
  index: number
}) {
  const reduce = useReducedMotion()
  const panelId = `faq-panel-${index}`
  return (
    <div className="border-t border-line last:border-b">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[1.0625rem] font-medium text-ink">{q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden
          className={cn(
            'shrink-0 text-inkfaint transition-transform duration-300',
            open && 'rotate-180',
            reduce && 'transition-none',
          )}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-[64ch] pb-5 text-[15px] leading-relaxed text-inksoft">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <section className="section-pad bg-paper">
      <div className="container-cv max-w-[880px]">
        <SectionHeader eyebrow="Questions" title="Hard questions, short answers." />
        <div className="mt-12">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60} y={12}>
              <FaqItem
                q={item.q}
                a={item.a}
                index={i}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 6 — CTA ————————————————— */

function Cta() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv max-w-[880px] text-center">
        <Reveal y={16}>
          <h2 className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            See the policy run, not the promise.
          </h2>
        </Reveal>
        <Reveal y={16} delay={100}>
          <p className="mx-auto mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-inksoft">
            Every claim on this page is executable on testnet.
          </p>
        </Reveal>
        <Reveal y={16} delay={200}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app"
              className="rounded-[10px] bg-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover active:scale-[.98]"
            >
              Launch app
            </Link>
            <Link
              href="/docs"
              className="rounded-[10px] border border-linestrong px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-inkfaint hover:bg-sunken active:scale-[.98]"
            >
              Read the docs
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Page ————————————————— */

function SecurityBody() {
  return (
    <>
      <Hero />
      <TrustModel />
      <ControlledExit />
      <TrustAssumptions />
      <Faq />
      <Cta />
    </>
  )
}

export default function Security() {
  return (
    <MarketingShell>
      <SecurityBody />
    </MarketingShell>
  )
}
