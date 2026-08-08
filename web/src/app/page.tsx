'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Reveal from '@/components/landing/Reveal'
import SectionHeader from '@/components/landing/SectionHeader'
import StatusChip from '@/components/landing/StatusChip'
import MetricCard from '@/components/landing/MetricCard'
import PathCard from '@/components/landing/PathCard'
import ProductDemoCard from '@/components/landing/ProductDemoCard'
import TransferRoute from '@/components/landing/TransferRoute'
import FeatureShowcase from '@/components/landing/FeatureShowcase'
import EcosystemDiagram from '@/components/landing/EcosystemDiagram'
import LogoMarquee from '@/components/landing/LogoMarquee'
import Testimonial from '@/components/landing/Testimonial'
import CaseStudyCard from '@/components/landing/CaseStudyCard'
import CodeDemo from '@/components/landing/CodeDemo'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useCountUp } from '@/hooks/useCountUp'

/* ————————————————— Section 1 — Hero ————————————————— */

function ProofStat({ to, format, label }: { to: number; format: (v: number) => string; label: string }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.6)
  const v = useCountUp(to, inView, 1000)
  return (
    <div ref={ref} className="px-2 py-5 sm:px-6">
      <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink tabular-nums sm:text-3xl">
        {format(v)}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase leading-snug tracking-[0.12em] text-inkfaint">{label}</p>
    </div>
  )
}

function Hero() {
  return (
    <section className="bg-paper">
      <div className="container-cv pt-[clamp(96px,12vw,144px)] pb-[clamp(80px,10vw,128px)] text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-6 bg-linestrong" />
            <p className="eyebrow text-inkfaint">Permissioned liquid staking · Monad testnet</p>
            <span aria-hidden className="h-px w-6 bg-linestrong" />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mx-auto mt-7 max-w-[14ch] font-display text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink">
            Stake MON. Stay liquid. <span className="text-navy">Stay verified.</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-inksoft sm:text-[1.2rem]">
            Verify once, stake, and hold stMON, a liquid receipt that keeps earning while you hold it and re-checks
            every counterparty before it moves. If your credential ever lapses, you exit through review. Funds are
            never seized.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mx-auto mt-10 grid max-w-[560px] gap-4 text-left sm:grid-cols-2">
            <PathCard
              variant="solid"
              eyebrow="For stakers"
              line="Launch the app and move through all four checkpoints in about two minutes."
              cta="Launch app"
              to="/app"
            />
            <PathCard
              variant="outline"
              eyebrow="For builders"
              line="Read the protocol and integrate compliant staking rails with three calls."
              cta="Read the docs"
              to="/docs"
            />
          </div>
        </Reveal>

        <Reveal delay={350}>
          <p className="mt-5 text-center text-sm text-inksoft">
            Bringing a verified identity?{" "}
            <a
              href="https://cleanverse.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:decoration-navy"
            >
              Get a real Cleanverse A-Pass
              <span aria-hidden> ↗</span>
            </a>
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="mx-auto mt-14 max-w-[960px] border-t border-line">
            <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
              <ProofStat to={4} format={(v) => `${Math.round(v)}`} label="checkpoints: verify → stake → move → exit" />
              <ProofStat to={100} format={(v) => `${Math.round(v)}%`} label="of transfers policy-checked at the token layer" />
              <ProofStat to={0} format={() => '0'} label="lockup or unbonding queue" />
              <ProofStat to={2} format={() => '~2 min'} label="full lifecycle on testnet" />
            </div>
            <p className="flex items-center justify-center gap-2 border-t border-line pt-4 text-[13px] text-inkfaint">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
              Live on Monad testnet · Eligibility by Cleanverse A-Pass · Fail-closed policy
            </p>
          </div>
        </Reveal>

        <Reveal delay={500} y={24}>
          <div className="mx-auto mt-14 max-w-[1040px] text-left">
            <ProductDemoCard caption="Every transfer re-checks the recipient at the token layer. Unverified wallets are refused on-chain, not hidden by a frontend.">
              <TransferRoute />
            </ProductDemoCard>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 2 — Proof wall ————————————————— */

function ProofWall() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv">
        <SectionHeader
          eyebrow="Why Continuum"
          title="Compliance usually costs liquidity. Here it doesn't."
          sub="Four properties of the protocol, stated as numbers you can verify on testnet."
        />
        <div className="mx-auto mt-14 grid max-w-[980px] gap-5 md:grid-cols-2">
          <Reveal delay={0}>
            <MetricCard
              label="Unbonding queue"
              numeral="0 blocks"
              copy="stMON is transferable to any verified counterparty the moment it's minted."
              device="status-line"
            />
          </Reveal>
          <Reveal delay={90}>
            <MetricCard
              label="Of transfers re-checked"
              count={{ to: 100, format: (v) => `${Math.round(v)}%` }}
              copy="The token asks the Cleanverse validator about the recipient on every single transfer."
              device="gauge"
            />
          </Reveal>
          <Reveal delay={180}>
            <MetricCard
              label="Redemption value (simulated, testnet)"
              numeral="1.0000 → 1.0421"
              copy="Rewards raise what each stMON redeems for. Your balance stays put while its claim grows."
              device="area-chart"
            />
          </Reveal>
          <Reveal delay={270}>
            <MetricCard
              label="Of principal + yield returned via reviewed exit"
              count={{ to: 100, format: (v) => `${Math.round(v)}%` }}
              copy="A lapsed credential freezes circulation, never ownership. Exit is reviewed, not confiscated."
              device="exit-row"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 3 — Feature modules ————————————————— */

function CredentialDemo() {
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
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-sunken" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink-soft)" strokeWidth="1.4">
            <rect x="1.5" y="4" width="13" height="9" rx="2" />
            <path d="M11 8.5h2" strokeLinecap="round" />
          </svg>
        </span>
        <svg viewBox="0 0 120 4" className="h-1 flex-1" aria-hidden>
          <line x1="0" y1="2" x2="120" y2="2" stroke="var(--cv-accent)" strokeWidth="1.5" className="recheck-line" />
        </svg>
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-navy/30 bg-navy-wash" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--cv-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2l4.5 1.8v3.2c0 2.8-1.9 5.3-4.5 6.2-2.6-.9-4.5-3.4-4.5-6.2V3.8L8 2z" />
            <path d="M6 8l1.4 1.4L10.2 6.6" />
          </svg>
        </span>
      </div>
      <p className="mt-4 font-mono text-[11px] text-inkfaint">wallet bound · re-checked continuously</p>
    </ProductDemoCard>
  )
}

const RATE_VALUES = ['1.0000', '1.0001', '1.0002']

function StakeDemo() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const id = setInterval(() => setTick((t) => (t + 1) % RATE_VALUES.length), 2000)
    return () => clearInterval(id)
  }, [inView, reduce])

  return (
    <div ref={ref}>
      <ProductDemoCard>
        <div className="rounded-[10px] border border-line bg-sunken px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-ink">1,000</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs text-inksoft">MON</span>
              <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase text-inkfaint">Max</span>
            </span>
          </div>
        </div>
        <div className="my-3 flex justify-center" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v12M3.5 9.5L8 14l4.5-4.5" />
          </svg>
        </div>
        <div className="rounded-[10px] border border-navy/25 bg-navy-wash px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-ink">1,000</span>
            <span className="font-mono text-xs text-navy">stMON @ 1.0000</span>
          </div>
        </div>
        <p className="mt-4 flex items-center justify-between font-mono text-xs">
          <span className="text-inkfaint">redemption value</span>
          <span className="text-ink tabular-nums">
            {RATE_VALUES[tick]}
            <span className={cn('ml-2 text-ok transition-opacity duration-500', tick === 0 && !reduce ? 'opacity-0' : 'opacity-100')}>
              +0.0001
            </span>
          </span>
        </p>
        <button
          type="button"
          disabled
          className="mt-5 w-full cursor-not-allowed rounded-[10px] bg-navy/40 px-4 py-3 text-sm font-medium text-white/80"
        >
          Testnet demo
        </button>
      </ProductDemoCard>
    </div>
  )
}

function TransferTableDemo() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [refused, setRefused] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setRefused(true), 800 + 2 * 200 + 400)
    return () => clearTimeout(t)
  }, [inView])

  const rows = [
    { to: '0x9b…77aa', ok: true },
    { to: '0x4d…c102', ok: true },
    { to: '0xe8…3f9b', ok: false },
  ]

  return (
    <div ref={ref}>
      <ProductDemoCard>
        <div className="overflow-hidden rounded-[10px] border border-line">
          {rows.map((r, i) => {
            const visible = reduce || inView
            return (
              <motion.div
                key={r.to}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3.5',
                  i > 0 && 'border-t border-line',
                  i % 2 === 0 && 'bg-sunken/60',
                )}
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={visible ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.4, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-mono text-[13px] text-ink">→ {r.to}</span>
                {r.ok ? (
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                    <span className="text-ok">A-Pass ✓</span>
                    <span className="text-inkfaint">settled</span>
                  </span>
                ) : refused || reduce ? (
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                    <span className="text-inkfaint">not verified</span>
                    <span className="text-bad">refused</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                    <span className="text-inkfaint">not verified</span>
                    <span className="text-warn">checking…</span>
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
        <p className="mt-4 font-mono text-[11px] text-inkfaint">recipient re-checked at the token layer · every transfer</p>
      </ProductDemoCard>
    </div>
  )
}

function FeatureModules() {
  return (
    <>
      <FeatureShowcase
        id="credential"
        eyebrow="Credential"
        headline="One credential, bound to your wallet."
        copy="A Cleanverse A-Pass binds a verified identity to your address. Your documents go to Cleanverse, never to Continuum."
        linkText="How credentials work"
        linkTo="/docs#cleanverse"
        demo={<CredentialDemo />}
      />
      <FeatureShowcase
        id="stake"
        eyebrow="Stake"
        headline="MON in, stMON out, liquid from the first block."
        copy="Stake at the current rate and rewards accrue to the redemption value from that moment. Nothing to harvest, nothing to compound."
        linkText="See the mechanics"
        linkTo="/docs#how"
        tint
        reverse
        demo={<StakeDemo />}
      />
      <FeatureShowcase
        id="move"
        eyebrow="Circulate & Exit"
        headline="Send to anyone verified. Leave whenever you like."
        copy="The token itself checks the recipient on every transfer. Unstake on demand, or, if your credential is revoked, request a reviewed exit to a wallet you nominate."
        linkText="The controlled exit, step by step"
        linkTo="/docs#exit"
        demo={<TransferTableDemo />}
      />
    </>
  )
}

/* ————————————————— Section 4 — Ecosystem ————————————————— */

function Ecosystem() {
  return (
    <section id="how" className="section-pad bg-tint">
      <div className="container-cv">
        <SectionHeader
          eyebrow="How it works"
          title="Four checkpoints, one unbroken line."
          sub="Every module hangs off the same token layer. The rule isn't ours to bend. It lives in the validator."
        />
        <div className="mt-14">
          <EcosystemDiagram />
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 5 — Dashboard sequence ————————————————— */

function Sparkline({ points, delay, active }: { points: string; delay: number; active: boolean }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 72 20" className="h-5 w-[72px]" aria-hidden>
      <motion.path
        d={points}
        fill="none"
        stroke="var(--cv-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={active ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, delay, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function MonitorCard({ active }: { active: boolean }) {
  const rows = [
    { wallet: '0x7f3a…9c21', bal: '12,400', rate: '1.0421', spark: 'M 1 16 C 14 14, 24 12, 36 10 S 60 5, 71 3', flash: true },
    { wallet: '0x9b1e…77aa', bal: '3,050', rate: '1.0418', spark: 'M 1 17 C 14 15, 24 13, 36 11 S 60 6, 71 4', flash: false },
    { wallet: '0x4d07…c102', bal: '58,900', rate: '1.0422', spark: 'M 1 15 C 14 14, 24 11, 36 9 S 60 4, 71 2', flash: false },
  ]
  return (
    <ProductDemoCard className="h-full">
      <p className="eyebrow text-inkfaint">01 · Monitor</p>
      <div className="mt-5 overflow-hidden rounded-[10px] border border-line">
        <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-line bg-sunken px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-inkfaint">
          <span>wallet · balance</span>
          <span>30d</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.wallet} className={cn('grid grid-cols-[1fr_auto] items-center gap-x-3 px-3 py-3', i > 0 && 'border-t border-line')}>
            <div className="min-w-0">
              <p className="truncate font-mono text-[12px] text-ink">{r.wallet}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-[11px]">
                <span className={cn('px-1 tabular-nums text-ink', r.flash && 'tick-flash')}>{r.bal} stMON</span>
                <span className="text-inkfaint">@ {r.rate}</span>
                <span className="text-ok">earning</span>
              </p>
            </div>
            <Sparkline points={r.spark} delay={0.15 + i * 0.15} active={active} />
          </div>
        ))}
      </div>
    </ProductDemoCard>
  )
}

function ConfigureCard() {
  const rows = [
    ['minimum tier', 'Tier 2'],
    ['transfer checks', 'enforced'],
    ['validator', '0xaC7e…1792'],
  ]
  return (
    <ProductDemoCard className="h-full">
      <p className="eyebrow text-inkfaint">02 · Configure</p>
      <div className="mt-5 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-[10px] bg-sunken px-3.5 py-3">
            <span className="font-mono text-[12px] text-inksoft">{k}</span>
            <span className="font-mono text-[12px] font-medium text-ink">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-[10px] border border-line px-3.5 py-3">
          <span className="font-mono text-[12px] text-inksoft">fail-closed</span>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-inkfaint">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <rect x="2" y="5" width="8" height="5.5" rx="1" />
              <path d="M4 5V3.5a2 2 0 014 0V5" />
            </svg>
            locked on
            <span aria-hidden className="relative inline-flex h-4 w-7 items-center rounded-full bg-navy/80 px-0.5">
              <span className="ml-auto h-3 w-3 rounded-full bg-white" />
            </span>
          </span>
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] leading-relaxed text-inkfaint">enforced by the validator, cannot be switched off</p>
    </ProductDemoCard>
  )
}

function TroubleshootCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const steps = ['requested', 'officer review', 're-check', 'settled']
  return (
    <ProductDemoCard className="h-full">
      <p className="eyebrow text-inkfaint">03 · Troubleshoot</p>
      <div className="mt-5 rounded-[10px] border border-line p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[12px] text-ink">exit #0417</p>
          <p className="font-mono text-[12px] text-ink tabular-nums">12,400 stMON</p>
        </div>
        <div className="mt-5">
          <div className="relative flex justify-between" aria-hidden>
            <span className="absolute left-0 right-0 top-[5px] h-px bg-line" />
            <motion.span
              className="absolute left-0 top-[5px] h-px bg-navy"
              initial={reduce ? false : { width: '0%' }}
              animate={active ? { width: '50%' } : undefined}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              style={reduce ? { width: '50%' } : undefined}
            />
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  'relative z-10 h-[11px] w-[11px] rounded-full border-2 bg-surface',
                  i < 2 ? 'border-navy' : i === 2 ? 'border-warn' : 'border-line',
                )}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  'w-1/4 font-mono text-[9.5px] uppercase tracking-[0.06em]',
                  i === 0 && 'text-left',
                  i === 3 ? 'text-right' : 'text-center',
                  i === 2 ? 'text-warn' : i < 2 ? 'text-ink' : 'text-inkfaint',
                )}
              >
                {i === 2 ? 'in review' : s}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-5 border-t border-line pt-3 font-mono text-[11px] text-ok">eligibility re-checked at approval ✓</p>
      </div>
    </ProductDemoCard>
  )
}

function DashboardSequence() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25)
  return (
    <section id="operate" className="section-pad bg-paper">
      <div className="container-cv">
        <SectionHeader
          eyebrow="Operate"
          title="Watch every position, policy, and exit in one place."
          sub="The Continuum app is an operations surface, not a black box. Monitor outcomes, manage configuration, and troubleshoot with real states."
        />
        <div ref={ref} className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal delay={0} y={20} className="h-full">
            <MonitorCard active={inView} />
          </Reveal>
          <Reveal delay={120} y={20} className="h-full">
            <ConfigureCard />
          </Reveal>
          <Reveal delay={240} y={20} className="h-full">
            <TroubleshootCard active={inView} />
          </Reveal>
        </div>
        <Reveal delay={320}>
          <p className="mt-10 text-center">
            <Link
              href="/app"
              className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-navy transition-colors hover:text-navy-hover"
            >
              Open the live testnet app
              <span aria-hidden className="transition-transform [transition-duration:250ms] group-hover:translate-x-1">→</span>
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ————————————————— Section 6 — Developer contrast ————————————————— */

const RESOURCES = [
  { title: 'Quickstart', desc: 'Connect a testnet wallet and run the full lifecycle in ~2 minutes.', href: '/docs#start' },
  { title: 'Contract surface', desc: 'Staking pool, stMON token, exit queue, with addresses and ABIs.', href: '/docs#addresses' },
  { title: 'Compliance model', desc: 'How tier rules and the validator gate every action.', href: '/docs#cleanverse' },
]

function DeveloperSection() {
  return (
    <section id="developers" className="section-pad bg-dark">
      <div className="container-cv">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow text-[#8AB4F8]">For developers</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-darktext">
                Three calls. The token does the rest.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-darkmuted">
                Stake, transfer, and exit through a minimal surface. Eligibility is enforced by the Cleanverse
                validator on every gated action. If it can&rsquo;t answer, the transaction is refused.
              </p>
              <ul className="mt-7 space-y-2.5 font-mono text-[13px] text-darktext">
                {['fail-closed by default', 'no custodial keys', 'typed SDK + ABI'].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <span aria-hidden className="h-1 w-3 bg-[#8AB4F8]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={150} y={24} className="min-w-0">
            <CodeDemo />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <Link
                href={r.href}
                className="group block h-full rounded-2xl border border-darkline bg-darksurface p-6 transition-all [transition-duration:250ms] hover:-translate-y-1 hover:border-[#8AB4F8]/40"
              >
                <h3 className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-darktext">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-darkmuted">{r.desc}</p>
                <span
                  aria-hidden
                  className="mt-4 inline-block text-[#8AB4F8] transition-transform [transition-duration:250ms] group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ————————————————— Section 7 — Social proof ————————————————— */

const USE_CASES = [
  { n: '01', title: 'Treasury staking', copy: 'Keep operational MON liquid while it earns.' },
  { n: '02', title: 'Compliant DeFi', copy: 'Plug a policy-enforced receipt into verified-only venues.' },
  { n: '03', title: 'Regulated custody', copy: 'Hold stMON for clients behind A-Pass tiers.' },
  { n: '04', title: 'Validator operations', copy: 'Delegate stake without an unbonding queue.' },
  { n: '05', title: 'Funds & allocators', copy: 'Report positions by redemption value, not reward claims.' },
]

function UseCaseGallery() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2)
  return (
    <div ref={ref} className="relative mt-16">
      <div
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]"
        role="list"
        aria-label="Use cases"
      >
        {USE_CASES.map((u, i) => (
          <motion.article
            key={u.n}
            role="listitem"
            className="w-[300px] flex-none snap-start rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:shadow-softhover"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] tracking-[0.14em] text-inkfaint">{u.n}</p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-ink">{u.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-inksoft">{u.copy}</p>
            <span aria-hidden className="mt-5 inline-block text-navy">→</span>
          </motion.article>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-tint to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-tint to-transparent" />
    </div>
  )
}

function SocialProof() {
  return (
    <section className="section-pad bg-tint">
      <div className="container-cv">
        <Reveal>
          <p className="eyebrow text-center text-inkfaint">Ecosystem</p>
        </Reveal>
        <div className="mt-10">
          <LogoMarquee />
        </div>

        <div className="mt-24">
          <Testimonial
            quote="Freezing is easy. Giving it back is the hard part. Continuum treats revocation as a reason to review an exit, not a reason to keep your assets."
            attribution="Continuum protocol thesis · Design principle 04"
          />
        </div>

        <div className="mt-24">
          <Reveal>
            <CaseStudyCard />
          </Reveal>
        </div>

        <UseCaseGallery />
      </div>
    </section>
  )
}

/* ————————————————— Section 8 — Final CTA ————————————————— */

function FinalCta() {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  return (
    <section className="section-pad bg-paper">
      <div ref={ref} className="container-cv text-center">
        <motion.img
          src="/continuum-mark.png"
          alt=""
          width={56}
          height={56}
          className="mx-auto h-14 w-14"
          initial={reduce ? false : { scale: 0.9, rotate: 0, opacity: 0 }}
          animate={inView ? { scale: 1, rotate: [0, 8, 0], opacity: 1 } : undefined}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <Reveal delay={100}>
          <h2 className="mx-auto mt-8 max-w-[18ch] font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            Compliance that travels with the token.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-inksoft">
            Live on Monad testnet. Connect a verified wallet and move a position through all four checkpoints in about
            two minutes.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-[10px] bg-navy px-6 py-3 text-sm font-medium text-white transition-all hover:bg-navy-hover active:scale-[.98]"
            >
              Launch app
            </Link>
            <Link
              href="/docs"
              className="rounded-[10px] border border-linestrong px-6 py-3 text-sm font-medium text-ink transition-all hover:border-inkfaint hover:bg-sunken active:scale-[.98]"
            >
              Read the docs
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProofWall />
        <FeatureModules />
        <Ecosystem />
        <DashboardSequence />
        <DeveloperSection />
        <SocialProof />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
