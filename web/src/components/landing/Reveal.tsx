'use client'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** stagger delay in ms */
  delay?: number
  /** initial upward offset in px */
  y?: number
  className?: string
}

/**
 * Shared scroll-reveal wrapper: opacity 0→1, y 16→0, 600ms,
 * cubic-bezier(.16,1,.3,1), triggers at 15% of viewport, once.
 * Reduced motion renders content statically.
 */
export default function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  const reduce = useReducedMotion()
  if (reduce) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
