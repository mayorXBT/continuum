import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ProductDemoCardProps {
  children: ReactNode
  className?: string
  /** footer caption centered beneath the fragment */
  caption?: string
  chrome?: boolean
}

/** 16px white panel holding a realistic UI fragment — the primary storytelling device. */
export default function ProductDemoCard({ children, className, caption, chrome = false }: ProductDemoCardProps) {
  return (
    <figure className={cn('rounded-2xl border border-line bg-surface shadow-panel', className)}>
      {chrome && (
        <div aria-hidden className="flex items-center gap-1.5 border-b border-line px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
      )}
      <div className="p-6 sm:p-8">{children}</div>
      {caption && (
        <figcaption className="border-t border-line px-6 py-4 text-center text-[13px] leading-relaxed text-inkfaint">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
