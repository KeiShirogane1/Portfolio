import { useEffect, useRef } from 'react'
import { prefersReducedMotion, subscribeScroll } from '../lib/motion.js'

/**
 * Scroll parallax by depth.
 *
 * Writes one transform value per frame for elements that should travel at a
 * different speed from the page. `speed` is in pixels per viewport scrolled,
 * so 60 means the element lags about 60px behind as it crosses the screen.
 */
export default function useParallax(speed = 60, { axis = 'y', max = 220 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const axisKey = axis === 'x' ? 'translateX' : 'translateY'
    let current = 0

    const apply = (value) => {
      el.style.transform = `${axisKey}(${value.toFixed(2)}px)`
    }

    const unsubscribe = subscribeScroll((state) => {
      const rect = el.getBoundingClientRect()
      const centre = rect.top + rect.height / 2
      const fromCentre = (centre - state.vh / 2) / state.vh // roughly -1 .. 1
      const offset = Math.max(-max, Math.min(max, -fromCentre * speed))
      current = offset
      apply(current)
    })

    return () => {
      unsubscribe()
      apply(0)
    }
  }, [speed, axis, max])

  return ref
}
