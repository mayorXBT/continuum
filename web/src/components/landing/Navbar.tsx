'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Center nav points at on-page sections (always valid on the landing);
 *  the two buttons go to the real app and docs routes. */
const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#operate', label: 'Operate' },
  { href: '#developers', label: 'Developers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[border-color,background-color] duration-300',
        open ? 'bg-paper' : 'bg-paper/85 backdrop-blur-md',
        scrolled || open ? 'border-line' : 'border-line/50',
      )}
    >
      <div className="container-cv flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Continuum home">
          <img src="/continuum-mark.png" alt="" className="h-7 w-7" width={28} height={28} />
          <span className="font-mono text-[13px] font-medium tracking-[0.22em] text-ink">CONTINUUM</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-inksoft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/docs"
            className="rounded-[10px] border border-linestrong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-inkfaint hover:bg-sunken"
          >
            Docs
          </Link>
          <Link
            href="/app"
            className="rounded-[10px] bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover active:scale-[.98]"
          >
            Launch app
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            {open ? (
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-paper px-6 pb-10 pt-6 md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {[...NAV_LINKS, { href: '/docs', label: 'Docs' }].map((l, i) => (
              <motion.div
                key={l.label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-4 font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
                >
                  {l.label}
                </a>
              </motion.div>
            ))}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="mt-auto"
            >
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="block rounded-[10px] bg-navy px-4 py-3 text-center text-sm font-medium text-white"
              >
                Launch app
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
