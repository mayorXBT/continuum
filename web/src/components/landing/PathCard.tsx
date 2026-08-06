import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PathCardProps {
  eyebrow: string
  line: string
  cta: string
  to: string
  variant: 'solid' | 'outline'
}

/** Dual audience CTA card: one solid navy, one white-outline. */
export default function PathCard({ eyebrow, line, cta, to, variant }: PathCardProps) {
  const solid = variant === 'solid'
  return (
    <Link
      href={to}
      className={cn(
        'group flex flex-col rounded-2xl p-6 text-left transition-all [transition-duration:250ms] ease-out hover:-translate-y-1 sm:p-7',
        solid
          ? 'bg-navy text-white shadow-soft hover:bg-navy-hover hover:shadow-softhover'
          : 'border border-linestrong bg-surface text-ink shadow-soft hover:shadow-softhover',
      )}
    >
      <p className={cn('eyebrow', solid ? 'text-white/60' : 'text-inkfaint')}>{eyebrow}</p>
      <p className={cn('mt-3 flex-1 text-[15px] leading-relaxed', solid ? 'text-white/90' : 'text-inksoft')}>{line}</p>
      <span
        className={cn(
          'mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-transform [transition-duration:250ms] group-hover:translate-x-1',
          solid ? 'text-white' : 'text-navy',
        )}
      >
        {cta}
        <span aria-hidden>→</span>
      </span>
    </Link>
  )
}
