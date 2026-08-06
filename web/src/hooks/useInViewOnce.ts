import { useRef } from 'react'
import { useInView } from 'framer-motion'

/** Ref + one-shot in-view flag for triggering device animations on reveal. */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(amount = 0.35) {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, amount })
  return { ref, inView }
}
