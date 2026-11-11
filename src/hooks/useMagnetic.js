import { useEffect, useRef } from 'react'
import { hasFinePointer, prefersReducedMotion, subscribePointer } from '../lib/motion.js'

/**
 * Magnetic pull for buttons and small anchors.
 *
 * The control leans a few pixels toward the cursor, then snaps back with a
 * deliberate ease when the pointer leaves. Touch and reduced-motion keep it
 * perfectly still so nothing jumps under a finger.
 */
export default function useMagnetic({ strength = 0.28, max = 12 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !hasFinePointer()) return

    let raf = 0
    let pointer = { x: 0, y: 0, active: false }
    let state = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }
    let active = false

    const tick = () => {
      raf = 0
      if (active && pointer.active) {
        const rect = el.getBoundingClientRect()
        const dx = pointer.x - (rect.left + rect.width / 2)
        const dy = pointer.y - (rect.top + rect.height / 2)
        target.x = Math.max(-max, Math.min(max, dx * strength))
        target.y = Math.max(-max, Math.min(max, dy * strength))
      } else {
        target.x = 0
        target.y = 0
      }

      state.x += (target.x - state.x) * 0.16
      state.y += (target.y - state.y) * 0.16
      el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`

      if (active || Math.abs(state.x) > 0.05 || Math.abs(state.y) > 0.05) {
        raf = window.requestAnimationFrame(tick)
      }
    }

    const wake = () => {
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    const unsubscribe = subscribePointer((p) => {
      pointer = p
      if (active) wake()
    })

    const onEnter = () => {
      active = true
      wake()
    }
    const onLeave = () => {
      active = false
      wake()
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      unsubscribe()
      el.style.transform = ''
    }
  }, [strength, max])

  return ref
}
