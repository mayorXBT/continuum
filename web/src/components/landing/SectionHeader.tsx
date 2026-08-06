import { cn } from '@/lib/utils'
import Reveal from './Reveal'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  sub?: string
  align?: 'center' | 'left'
  dark?: boolean
}

export default function SectionHeader({ eyebrow, title, sub, align = 'center', dark = false }: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <Reveal>
      <div className={cn(centered ? 'mx-auto text-center' : 'text-left', 'max-w-[720px]')}>
        <p className={cn('eyebrow', dark ? 'text-[#8AB4F8]' : 'text-inkfaint')}>{eyebrow}</p>
        <h2
          className={cn(
            'mt-4 font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em]',
            dark ? 'text-darktext' : 'text-ink',
          )}
        >
          {title}
        </h2>
        {sub && (
          <p
            className={cn(
              'mt-5 text-[1.0625rem] leading-relaxed',
              centered && 'mx-auto max-w-[56ch]',
              dark ? 'text-darkmuted' : 'text-inksoft',
            )}
          >
            {sub}
          </p>
        )}
      </div>
    </Reveal>
  )
}
