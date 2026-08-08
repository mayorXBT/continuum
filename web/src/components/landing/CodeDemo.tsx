'use client'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useInViewOnce } from '@/hooks/useInViewOnce'

type Tok = [string, 'kw' | 'str' | 'num' | 'com' | 'pun' | 'fn' | 'plain']

const COLORS: Record<Tok[1], string> = {
  kw: '#8AB4F8',
  str: '#9ECB9B',
  num: '#E3B57E',
  com: '#5B6B7E',
  pun: '#94A3B4',
  fn: '#C9A7F5',
  plain: '#E9EEF4',
}

type Line = Tok[]

const SAMPLES: Record<string, Line[]> = {
  Stake: [
    [['import ', 'kw'], ['{ continuum }', 'pun'], [' from ', 'kw'], ['"@continuum/sdk"', 'str'], [';', 'pun']],
    [],
    [['// A-Pass is verified on-chain before anything moves', 'com']],
    [['const ', 'kw'], ['tx', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['stake', 'fn'], ['({', 'pun']],
    [['  amount', 'plain'], [': ', 'pun'], ['"1000"', 'str'], [',', 'pun'], ['           ', 'plain'], ['// MON', 'com']],
    [['  receiver', 'plain'], [': ', 'pun'], ['wallet', 'plain'], ['.', 'pun'], ['address', 'plain'], [',', 'pun'], [' ', 'plain'], ['// must hold a valid A-Pass', 'com']],
    [['});', 'pun']],
    [],
    [['// stMON is liquid from the first block', 'com']],
    [['console', 'plain'], ['.', 'pun'], ['log', 'fn'], ['(', 'pun'], ['tx', 'plain'], ['.', 'pun'], ['rate', 'plain'], [');', 'pun'], [' ', 'plain'], ['// redemption value at mint', 'com']],
  ],
  Transfer: [
    [['// the token re-checks the recipient on every transfer', 'com']],
    [['const ', 'kw'], ['tx', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['stmon', 'plain'], ['.', 'pun'], ['transfer', 'fn'], ['(', 'pun'], ['to', 'plain'], [', ', 'pun'], ['amount', 'plain'], [');', 'pun']],
    [],
    [['// reverts if recipient fails the validator check', 'com']],
  ],
  Exit: [
    [['// reviewed settlement returns principal + yield, never seized', 'com']],
    [['const ', 'kw'], ['exit', 'plain'], [' = ', 'pun'], ['await ', 'kw'], ['continuum', 'plain'], ['.', 'pun'], ['exits', 'plain'], ['.', 'pun'], ['request', 'fn'], ['({', 'pun']],
    [['  to', 'plain'], [': ', 'pun'], ['nominatedWallet', 'plain'], [',', 'pun'], [' ', 'plain'], ['// must be verified', 'com']],
    [['});', 'pun']],
    [],
    [['// status: requested → officer review → settled', 'com']],
  ],
}

const TABS = Object.keys(SAMPLES)

/** Dark code panel with underline-slide tabs, syntax-highlighted TS, and copy feedback. */
export default function CodeDemo() {
  const [tab, setTab] = useState('Stake')
  const [copied, setCopied] = useState(false)
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3)

  const copy = async () => {
    const text = SAMPLES[tab].map((l) => l.map(([t]) => t).join('')).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div ref={ref} className="rounded-2xl border border-darkline bg-darksurface shadow-panel">
      {/* tab bar */}
      <div className="flex items-center justify-between border-b border-darkline px-4">
        <div role="tablist" aria-label="Code samples" className="flex" onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          const i = TABS.indexOf(tab)
          const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length
          setTab(TABS[next])
          document.getElementById(`code-tab-${TABS[next]}`)?.focus()
        }}>
          {TABS.map((t) => (
            <button
              key={t}
              id={`code-tab-${t}`}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`code-panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={cn(
                'relative px-4 py-3.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors',
                tab === t ? 'text-darktext' : 'text-darkmuted hover:text-darktext',
              )}
            >
              {t}
              {tab === t && (
                <motion.span
                  layoutId="code-tab-underline"
                  className="absolute inset-x-3 bottom-0 h-[2px] bg-[#8AB4F8]"
                  transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-darkline px-2.5 py-1.5 font-mono text-[11px] text-darkmuted transition-colors hover:border-[#8AB4F8]/40 hover:text-darktext"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
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
          id={`code-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`code-tab-${tab}`}
          tabIndex={0}
          aria-label={`${tab} code sample`}
        >
          <code>
            {SAMPLES[tab].map((line, li) => (
              <motion.div
                key={li}
                initial={reduce || !inView ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.15 + li * 0.04 }}
                className="min-h-[1.7em] whitespace-pre"
              >
                {line.map(([text, kind], ti) => (
                  <span key={ti} style={{ color: COLORS[kind] }}>
                    {text}
                  </span>
                ))}
              </motion.div>
            ))}
          </code>
        </motion.pre>
      </AnimatePresence>
    </div>
  )
}
