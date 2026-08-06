'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { useInViewOnce } from '@/hooks/useInViewOnce'

interface TestimonialProps {
  quote: string
  attribution: string
}

/** Large Space Grotesk quote with word-level staggered reveal and mono attribution. */
export default function Testimonial({ quote, attribution }: TestimonialProps) {
  const reduce = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLElement>(0.4)
  const words = quote.split(' ')

  return (
    <figure ref={ref} className="mx-auto max-w-[880px] border-t border-linestrong pt-12 text-center">
      <blockquote className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium leading-[1.3] tracking-[-0.02em] text-ink">
        &ldquo;
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
        &rdquo;
      </blockquote>
      <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-inkfaint">{attribution}</figcaption>
    </figure>
  )
}
