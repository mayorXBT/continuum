import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type StatusTone = 'verified' | 'blocked' | 'review' | 'neutral'

const toneStyles: Record<StatusTone, string> = {
  verified: 'border-ok/25 bg-ok-wash text-ok',
  blocked: 'border-bad/25 bg-bad-wash text-bad',
  review: 'border-warn/25 bg-warn-wash text-warn',
  neutral: 'border-line bg-sunken text-inksoft',
}

const dotStyles: Record<StatusTone, string> = {
  verified: 'bg-ok',
  blocked: 'bg-bad',
  review: 'bg-warn',
  neutral: 'bg-inkfaint',
}

interface StatusChipProps {
  tone?: StatusTone
  children: ReactNode
  className?: string
}

/** 6px-radius status rect with a 6px dot. Used only inside UI fragments. */
export default function StatusChip({ tone = 'neutral', children, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em]',
        toneStyles[tone],
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dotStyles[tone])} />
      {children}
    </span>
  )
}
