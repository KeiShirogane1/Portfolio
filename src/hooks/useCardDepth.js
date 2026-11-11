import { useEffect, useRef } from 'react'
import { hasFinePointer, prefersReducedMotion, subscribePointer } from '../lib/motion.js'

/**
 * Cards that exist in space.
 *
 * Each card is tilted on its own perspective plane and carries a light that
 * follows the cursor across its surface. Tilting is skipped entirely for touch
 * and reduced-motion visitors, where the card keeps its flat, readable form.
 */
export default function useCardDepth({ strength = 9, scale = 1.02 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const card = ref.current
    if (!card) return
    if (prefersReducedMotion() || !hasFinePointer()) return

    let raf = 0
    let target = { rx: 0, ry: 0, px: 0.5, py: 0.5, lift: 0, active: false }
    let current = { ...target }
    let pointer = { x: 0, y: 0, active: false }

    const measure = () => {
      const rect = card.getBoundingClientRect()
      if (!rect.width || !rect.height) return null
      return {
        rect,
        px: (pointer.x - rect.left) / rect.width,
        py: (pointer.y - rect.top) / rect.height
      }
    }

    const tick = () => {
      raf = 0
      const inside = measure()
      if (inside && pointer.active) {
        const px = Math.min(1, Math.max(0, inside.px))
        const py = Math.min(1, Math.max(0, inside.py))
        target = {
          rx: (0.5 - py) * strength * 2,
          ry: (px - 0.5) * strength * 2,
          px,
          py,
          lift: 1,
          active: true
        }
      }

      current.rx += (target.rx - current.rx) * 0.12
      current.ry += (target.ry - current.ry) * 0.12
      current.px += (target.px - current.px) * 0.12
      current.py += (target.py - current.py) * 0.12
      current.lift += (target.lift - current.lift) * 0.1
      current.active = target.active

      card.style.setProperty('--tilt-x', `${current.rx.toFixed(2)}deg`)
      card.style.setProperty('--tilt-y', `${current.ry.toFixed(2)}deg`)
      card.style.setProperty('--light-x', `${(current.px * 100).toFixed(1)}%`)
      card.style.setProperty('--light-y', `${(current.py * 100).toFixed(1)}%`)
      card.style.setProperty('--lift', current.lift.toFixed(3))
      card.style.setProperty('--card-scale', (1 + (scale - 1) * current.lift).toFixed(3))

      if (Math.abs(current.rx) > 0.01 || Math.abs(current.ry) > 0.01 || current.lift > 0.01) {
        raf = window.requestAnimationFrame(tick)
      }
    }

    const wake = () => {
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    const unsubscribe = subscribePointer((state) => {
      pointer = state
      if (!state.active) {
        target.rx = 0
        target.ry = 0
        target.lift = 0
      }
      wake()
    })

    const onEnter = () => {
      card.dataset.depth = 'on'
      wake()
    }
    const onLeave = () => {
      card.dataset.depth = 'off'
      target.rx = 0
      target.ry = 0
      target.lift = 0
      wake()
    }

    card.addEventListener('pointerenter', onEnter)
    card.addEventListener('pointerleave', onLeave)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      unsubscribe()
    }
  }, [strength, scale])

  return ref
}
