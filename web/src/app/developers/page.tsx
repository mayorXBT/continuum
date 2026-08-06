'use client'
import MarketingShell from '@/components/landing/MarketingShell'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Copy } from 'lucide-react'
import Reveal from '@/components/landing/Reveal'
import SectionHeader from '@/components/landing/SectionHeader'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { cn } from '@/lib/utils'

/* ————— Copy-with-feedback helper ————— */

function useCopyFeedback(timeout = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        /* clipboard unavailable — still show feedback */
      }
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), timeout)
    },
    [timeout],
  )
  return { copied, copy }
}

/* ————— Syntax tokens (dark palette, design.md §2) ————— */

type Tok = [string, 'kw' | 'str' | 'num' | 'com' | 'pun' | 'fn' | 'plain']
type Line = Tok[]

const COLORS: Record<Tok[1], string> = {
  kw: '#8AB4F8',
  str: '#9ECB9B',
  num: '#E3B57E',
  com: '#5B6B7E',
  pun: '#94A3B4',
  fn: '#C9A7F5',
  plain: '#E9EEF4',
}

const SAMPLES: Record<string, Line[]> = {
  Stake: [
    [['import ', 'kw'], ['{ continuum }', 'pun'], [' from ', 'kw'], ['"@continuum/sdk"', 'str'], [';', 'pun']],
    [],
    [['// SDK checks the A-Pass credential before building the tx', 'com']],
    [['const ', 'kw'], ['wallet', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['connect', 'fn'], ['({ ', 'pun'], ['chainId', 'plain'], [': ', 'pun'], ['10143', 'num'], [' });', 'pun']],
    [['const ', 'kw'], ['pass', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['wallet', 'plain'], ['.', 'pun'], ['apass', 'plain'], ['.', 'pun'], ['status', 'fn'], ['();', 'pun']],
    [['if ', 'kw'], ['(!', 'pun'], ['pass', 'plain'], ['.', 'pun'], ['valid', 'plain'], [') ', 'pun'], ['throw new ', 'kw'], ['Error', 'fn'], ['(', 'pun'], ['"A-Pass required"', 'str'], [');', 'pun']],
    [],
    [['const ', 'kw'], ['tx', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['stake', 'fn'], ['({', 'pun']],
    [['  amount', 'plain'], [': ', 'pun'], ['"1000"', 'str'], [',', 'pun'], ['                  ', 'plain'], ['// MON', 'com']],
    [['  receiver', 'plain'], [': ', 'pun'], ['wallet', 'plain'], ['.', 'pun'], ['address', 'plain'], [',', 'pun']],
    [['});', 'pun']],
    [],
    [['// rate readback: redemption value at the moment of mint', 'com']],
    [['console', 'plain'], ['.', 'pun'], ['log', 'fn'], ['(', 'pun'], ['tx', 'plain'], ['.', 'pun'], ['rate', 'plain'], [');', 'pun'], ['            ', 'plain'], ['// 1 stMON = 1.0421 MON', 'com']],
  ],
  Transfer: [
    [['import ', 'kw'], ['{ stmon }', 'pun'], [' from ', 'kw'], ['"@continuum/sdk/contracts"', 'str'], [';', 'pun']],
    [],
    [['// the token re-checks the recipient against the validator', 'com']],
    [['try ', 'kw'], ['{', 'pun']],
    [['  const ', 'kw'], ['tx', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['stmon', 'plain'], ['.', 'pun'], ['transfer', 'fn'], ['(', 'pun'], ['receiver', 'plain'], [', ', 'pun'], ['amount', 'plain'], [');', 'pun']],
    [['  await ', 'kw'], ['tx', 'plain'], ['.', 'pun'], ['wait', 'fn'], ['();', 'pun']],
    [['} ', 'pun'], ['catch ', 'kw'], ['(', 'pun'], ['err', 'plain'], [') {', 'pun']],
    [['  const ', 'kw'], ['reason', 'plain'], [' = ', 'pun'], ['stmon', 'plain'], ['.', 'pun'], ['decodeRevert', 'fn'], ['(', 'pun'], ['err', 'plain'], [');', 'pun']],
    [['  if ', 'kw'], ['(', 'pun'], ['reason', 'plain'], ['.', 'pun'], ['name', 'plain'], [' === ', 'pun'], ['"NotEligible"', 'str'], [') {', 'pun']],
    [['    // receiver failed the Cleanverse eligibility check', 'com']],
    [['    console', 'plain'], ['.', 'pun'], ['warn', 'fn'], ['(', 'pun'], ['`blocked: ${', 'str'], ['reason', 'plain'], ['.', 'pun'], ['args', 'plain'], ['.', 'pun'], ['receiver', 'plain'], ['}`', 'str'], [');', 'pun']],
    [['    // route them to verification — do not retry blindly', 'com']],
    [['    await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['verify', 'plain'], ['.', 'pun'], ['request', 'fn'], ['(', 'pun'], ['reason', 'plain'], ['.', 'pun'], ['args', 'plain'], ['.', 'pun'], ['receiver', 'plain'], [');', 'pun']],
    [['  }', 'pun']],
    [['}', 'pun']],
  ],
  Exit: [
    [['import ', 'kw'], ['{ continuum }', 'pun'], [' from ', 'kw'], ['"@continuum/sdk"', 'str'], [';', 'pun']],
    [],
    [['// reviewed settlement — principal + yield, never seized', 'com']],
    [['const ', 'kw'], ['exit', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['exits', 'plain'], ['.', 'pun'], ['request', 'fn'], ['({', 'pun']],
    [['  to', 'plain'], [': ', 'pun'], ['nominatedWallet', 'plain'], [',', 'pun'], ['           ', 'plain'], ['// must hold a valid A-Pass', 'com']],
    [['});', 'pun']],
    [],
    [['// status: requested → officer review → settled', 'com']],
    [['continuum', 'plain'], ['.', 'pun'], ['exits', 'plain'], ['.', 'pun'], ['on', 'fn'], ['(', 'pun'], ['"Settled"', 'str'], [', (', 'pun'], ['id', 'plain'], [', ', 'pun'], ['to', 'plain'], [', ', 'pun'], ['amount', 'plain'], [') ', 'pun'], ['=> ', 'kw'], ['{', 'pun']],
    [['  if ', 'kw'], ['(', 'pun'], ['id', 'plain'], [' === ', 'pun'], ['exit', 'plain'], ['.', 'pun'], ['id', 'plain'], [') {', 'pun']],
    [['    console', 'plain'], ['.', 'pun'], ['log', 'fn'], ['(', 'pun'], ['`settled ${', 'str'], ['amount', 'plain'], ['} MON to ${', 'str'], ['to', 'plain'], ['}`', 'str'], [');', 'pun']],
    [['  }', 'pun']],
    [['});', 'pun']],
  ],
  'Read state': [
    [['import ', 'kw'], ['{ continuum, stmon, sleep }', 'pun'], [' from ', 'kw'], ['"@continuum/sdk"', 'str'], [';', 'pun']],
    [],
    [['const ', 'kw'], ['rate', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['redemptionValue', 'fn'], ['();', 'pun'], ['  ', 'plain'], ['// MON per stMON', 'com']],
    [['const ', 'kw'], ['balance', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['stmon', 'plain'], ['.', 'pun'], ['balanceOf', 'fn'], ['(', 'pun'], ['wallet', 'plain'], ['.', 'pun'], ['address', 'plain'], [');', 'pun']],
    [],
    [['// poll an exit until the review desk settles it', 'com']],
    [['for ', 'kw'], ['(;;) {', 'pun']],
    [['  const ', 'kw'], ['{ state }', 'pun'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['exits', 'plain'], ['.', 'pun'], ['status', 'fn'], ['(', 'pun'], ['exitId', 'plain'], [');', 'pun']],
    [['  if ', 'kw'], ['(', 'pun'], ['state', 'plain'], [' === ', 'pun'], ['"settled"', 'str'], [') ', 'pun'], ['break', 'kw'], [';', 'pun']],
    [['  if ', 'kw'], ['(', 'pun'], ['state', 'plain'], [' === ', 'pun'], ['"rejected"', 'str'], [') ', 'pun'], ['throw new ', 'kw'], ['Error', 'fn'], ['(', 'pun'], ['"exit rejected"', 'str'], [');', 'pun']],
    [['  await ', 'kw'], ['sleep', 'fn'], ['(', 'pun'], ['5000', 'num'], [');', 'pun'], ['             ', 'plain'], ['// review typically completes < 1 epoch', 'com']],
    [['}', 'pun']],
  ],
}

const CODE_TABS = [
  { id: 'Stake', file: 'stake.ts' },
  { id: 'Transfer', file: 'transfer.ts' },
  { id: 'Exit', file: 'exit.ts' },
  { id: 'Read state', file: 'read-state.ts' },
]

const codeDomId = (id: string) => id.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/* ————— Expanded four-tab code demo (page centerpiece) ————— */

function DevCodeDemo() {
  const [tab, setTab] = useState('Stake')
  const { copied, copy } = useCopyFeedback(1500)
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25)

  const active = CODE_TABS.find((t) => t.id === tab) ?? CODE_TABS[0]

  const copyCode = () =>
    copy(SAMPLES[tab].map((l) => l.map(([t]) => t).join('')).join('\n'))

  return (
    <Reveal y={24}>
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-darkline bg-darksurface shadow-panel"
      >
        {/* tab bar */}
        <div className="flex items-center justify-between gap-3 border-b border-darkline px-4">
          <div
            role="tablist"
            aria-label="Integration code samples"
            className="flex overflow-x-auto"
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
              const i = CODE_TABS.findIndex((t) => t.id === tab)
              const next =
                e.key === 'ArrowRight'
                  ? (i + 1) % CODE_TABS.length
                  : (i - 1 + CODE_TABS.length) % CODE_TABS.length
              setTab(CODE_TABS[next].id)
              document.getElementById(`dev-code-tab-${codeDomId(CODE_TABS[next].id)}`)?.focus()
            }}
          >
            {CODE_TABS.map((t) => (
              <button
                key={t.id}
                id={`dev-code-tab-${codeDomId(t.id)}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`dev-code-panel-${codeDomId(t.id)}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative whitespace-nowrap px-4 py-3.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors',
                  tab === t.id ? 'text-darktext' : 'text-darkmuted hover:text-darktext',
                )}
              >
                {t.id}
                {tab === t.id && (
                  <motion.span
                    layoutId="dev-code-tab-underline"
                    className="absolute inset-x-3 bottom-0 h-[2px] bg-[#8AB4F8]"
                    transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden font-mono text-[11px] text-[#5B6B7E] sm:block">{active.file}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-md border border-darkline px-2.5 py-1.5 font-mono text-[11px] text-darkmuted transition-colors hover:border-[#8AB4F8]/40 hover:text-darktext"
            >
              {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* code */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={tab}
            className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7] sm:text-[13px]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            id={`dev-code-panel-${codeDomId(tab)}`}
            role="tabpanel"
            aria-labelledby={`dev-code-tab-${codeDomId(tab)}`}
            tabIndex={0}
            aria-label={`${tab} code sample (${active.file})`}
          >
            <code>
              {SAMPLES[tab].map((line, li) => (
                <motion.div
                  key={li}
                  initial={reduce || !inView ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.15 + li * 0.03 }}
                  className="flex min-h-[1.7em]"
                >
                  <span aria-hidden className="w-7 shrink-0 select-none pr-4 text-right text-[#3A4A5C]">
                    {li + 1}
                  </span>
                  <span className="whitespace-pre">
                    {line.map(([text, kind], ti) => (
                      <span key={ti} style={{ color: COLORS[kind] }}>
                        {text}
                      </span>
                    ))}
                  </span>
                </motion.div>
              ))}
            </code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

/* ————— Contract surface ————— */

const CONTRACTS = [
  {
    name: 'StakingPool',
    role: 'MON ↔ stMON mint/burn at redemption value.',
    methods: ['stake', 'unstake', 'redemptionValue'],
    address: '0x7a3E9d…c41D',
    full: '0x7a3E9d2B48f0A6c1D5e7930B2f4C8aE61c41D0aB',
  },
  {
    name: 'stMON token',
    role: 'Policy-enforced receipt; validator-checked transfers.',
    methods: ['transfer', 'balanceOf', 'isEligible'],
    address: '0x9Bc14a…8eF0',
    full: '0x9Bc14aD07f2E83b6C5d1A9e4F7083B2c6d5e8eF0',
  },
  {
    name: 'ExitQueue',
    role: 'Reviewed settlement for revoked credentials.',
    methods: ['request', 'status', 'settle'],
    address: '0xD2f76b…3aB9',
    full: '0xD2f76b1E94aC30d8F5e2B7c9A1d4E6f08b3aB9c2',
  },
]

function ContractCard({ contract, index }: { contract: (typeof CONTRACTS)[number]; index: number }) {
  const { copied, copy } = useCopyFeedback(1500)
  return (
    <Reveal delay={index * 100} y={16}>
      <div className="flex h-full flex-col rounded-2xl border border-darkline bg-darksurface p-6">
        <p className="font-mono text-[13px] font-medium text-darktext">{contract.name}</p>
        <p className="mt-2 text-sm leading-relaxed text-darkmuted">{contract.role}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {contract.methods.map((m) => (
            <span
              key={m}
              className="rounded-md border border-darkline px-2 py-1 font-mono text-[11px] text-[#8AB4F8]"
            >
              {m}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => copy(contract.full)}
          aria-label={`Copy ${contract.name} testnet address`}
          className="mt-6 flex items-center justify-between gap-2 self-stretch rounded-md border border-darkline px-2.5 py-2 font-mono text-[11px] text-darkmuted transition-colors hover:border-[#8AB4F8]/40 hover:text-darktext"
        >
          <span className={cn('truncate', copied && 'text-[#9ECB9B]')}>
            {copied ? 'Copied ✓' : contract.address}
          </span>
          {copied ? <Check className="h-3 w-3 shrink-0" aria-hidden /> : <Copy className="h-3 w-3 shrink-0" aria-hidden />}
        </button>
      </div>
    </Reveal>
  )
}

/* ————— Resources ————— */

const RESOURCES = [
  { title: 'Quickstart', body: 'Full lifecycle on testnet in ~2 minutes.' },
  { title: 'SDK reference', body: 'Every method, typed and annotated.' },
  { title: 'Compliance model', body: 'Tier rules, the validator, and fail-closed semantics.' },
  { title: 'Exit desk operations', body: 'How reviewed settlement works for integrators.' },
]

/* ————— Page ————— */

function DevelopersBody() {
  const install = useCopyFeedback(1500)

  return (
    <>
      {/* Section 1–3 — dark developer canvas */}
      <div className="bg-dark">
        {/* Section 1 — hero + quickstart */}
        <section className="pb-20 pt-[140px] sm:pb-24" aria-labelledby="dev-hero-title">
          <div className="container-cv grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal y={20} className="min-w-0">
              <div>
                <p className="eyebrow text-[#8AB4F8]">Developers</p>
                <h1
                  id="dev-hero-title"
                  className="mt-4 max-w-[16ch] font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-darktext"
                >
                  Compliant staking in three calls.
                </h1>
                <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-darkmuted">
                  A typed SDK over a minimal contract surface. Eligibility is enforced by the
                  Cleanverse validator on every gated action — your integration can't bypass it, and
                  neither can we.
                </p>
                <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-[#5B6B7E]">
                  <span>testnet chainId 10143</span>
                  <span aria-hidden>·</span>
                  <span>sdk v0.4.2</span>
                  <span aria-hidden>·</span>
                  <span>MIT</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={150} y={24} className="min-w-0">
              <div className="rounded-2xl border border-darkline bg-darksurface p-6 shadow-panel">
                <div className="flex items-center justify-between gap-3 rounded-[10px] border border-darkline bg-dark px-4 py-3.5">
                  <code className="truncate font-mono text-[13px] text-darktext">
                    <span className="text-[#5B6B7E]">$ </span>npm i @continuum/sdk
                  </code>
                  <button
                    type="button"
                    onClick={() => install.copy('npm i @continuum/sdk')}
                    aria-label="Copy install command"
                    className="flex shrink-0 items-center gap-1.5 rounded-md border border-darkline px-2.5 py-1.5 font-mono text-[11px] text-darkmuted transition-colors hover:border-[#8AB4F8]/40 hover:text-darktext"
                  >
                    {install.copied ? (
                      <Check className="h-3 w-3" aria-hidden />
                    ) : (
                      <Copy className="h-3 w-3" aria-hidden />
                    )}
                    {install.copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <ol className="mt-5 space-y-3">
                  {['connect wallet', 'hold A-Pass', 'stake()'].map((step, i) => (
                    <li key={step} className="flex items-center gap-3 font-mono text-[13px]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-darkline text-[11px] text-[#8AB4F8]">
                        {i + 1}
                      </span>
                      <span className="text-darkmuted">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 2 — expanded CodeDemo */}
        <section className="pb-24 sm:pb-28" aria-label="Code samples">
          <div className="container-cv">
            <div className="mx-auto max-w-[1080px]">
              <DevCodeDemo />
              <Reveal delay={120}>
                <p className="mt-5 text-center text-[13px] leading-relaxed text-darkmuted">
                  All examples run against Monad testnet. Get a sandbox A-Pass in one click from the
                  app.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 3 — contract surface */}
        <section className="pb-24 sm:pb-32" aria-labelledby="contracts-title">
          <div className="container-cv">
            <SectionHeader
              eyebrow="Contracts"
              title="A surface small enough to audit in an afternoon."
              dark
            />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {CONTRACTS.map((c, i) => (
                <ContractCard key={c.name} contract={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Section 4 — resource cards (back to light) */}
      <section className="section-pad bg-paper" aria-labelledby="resources-title">
        <div className="container-cv">
          <SectionHeader eyebrow="Resources" title="Go deeper." />
          <div className="mx-auto mt-14 grid max-w-[880px] gap-5 sm:grid-cols-2">
            {RESOURCES.map((r, i) => (
              <Reveal key={r.title} delay={i * 80} y={16}>
                <Link
                  href="/docs"
                  className="group block h-full rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all [transition-duration:250ms] hover:-translate-y-1 hover:shadow-softhover"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-navy">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-inksoft">{r.body}</p>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-inkfaint transition-all [transition-duration:250ms] group-hover:translate-x-1 group-hover:text-navy"
                      aria-hidden
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — dark CTA strip */}
      <section className="bg-dark py-20 sm:py-24" aria-labelledby="dev-cta-title">
        <div className="container-cv text-center">
          <Reveal y={16}>
            <h2
              id="dev-cta-title"
              className="mx-auto max-w-[20ch] font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-darktext"
            >
              Build on rails that refuse to misbehave.
            </h2>
          </Reveal>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Reveal delay={100} y={16}>
              <Link
                href="/app"
                className="block rounded-[10px] bg-darktext px-6 py-3 text-sm font-medium text-dark transition-colors hover:bg-white active:scale-[.98]"
              >
                Launch the testnet app
              </Link>
            </Reveal>
            <Reveal delay={200} y={16}>
              <Link
                href="/docs"
                className="block rounded-[10px] border border-darkline px-6 py-3 text-sm font-medium text-darktext transition-colors hover:border-darkmuted hover:bg-darksurface active:scale-[.98]"
              >
                Read the docs
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}

export default function Developers() {
  return (
    <MarketingShell>
      <DevelopersBody />
    </MarketingShell>
  )
}
