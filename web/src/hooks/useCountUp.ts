import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Ease-out count-up from 0 to target once `start` is true. Honors reduced motion. */
export function useCountUp(target: number, start: boolean, duration = 1000) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)

  useEffect(() => {
    if (reduce) {
      setValue(target)
      return
    }
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration, reduce])

  return value
}
