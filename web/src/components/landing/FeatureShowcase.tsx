import Link from 'next/link'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'
import type { ReactNode } from 'react'

interface FeatureShowcaseProps {
  eyebrow: string
  headline: string
  copy: string
  linkText: string
  linkTo: string
  /** alternates background tint */
  tint?: boolean
  /** reverse column order on desktop */
  reverse?: boolean
  demo: ReactNode
  id?: string
}

/** Full-width alternating-tint section: text column + ProductDemoCard. */
export default function FeatureShowcase({
  eyebrow,
  headline,
  copy,
  linkText,
  linkTo,
  tint = false,
  reverse = false,
  demo,
  id,
}: FeatureShowcaseProps) {
  return (
    <section id={id} className={cn('section-pad', tint ? 'bg-tint' : 'bg-paper')}>
      <div className="container-cv grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(reverse && 'lg:order-2')}>
          <div>
            <p className="eyebrow text-navy">{eyebrow}</p>
            <h3 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
              {headline}
            </h3>
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-inksoft">{copy}</p>
            <Link
              href={linkTo}
              className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-navy transition-colors hover:text-navy-hover"
            >
              {linkText}
              <span aria-hidden className="transition-transform [transition-duration:250ms] group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={150} y={20} className={cn(reverse && 'lg:order-1')}>
          {demo}
        </Reveal>
      </div>
    </section>
  )
}
