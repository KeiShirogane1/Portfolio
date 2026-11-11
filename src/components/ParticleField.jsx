import { useEffect, useRef } from 'react'
import { prefersReducedMotion, subscribePointer } from '../lib/motion.js'

/**
 * Atmospheric particle field.
 *
 * Canvas 2D rather than WebGL: a few dozen glowing motes cost almost nothing,
 * keep the page free of a 3D dependency, and never compete with the portrait.
 * The field drifts, parallaxes by depth against the pointer, and stops drawing
 * when it leaves the screen or the tab is hidden.
 */
export default function ParticleField({ density = 46, className = '', tint = '#548cff' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const small = window.matchMedia('(max-width: 760px)').matches
    const count = reduced ? 0 : small ? Math.min(density, 22) : density

    let width = 0
    let height = 0
    let dpr = 1
    let motes = []
    let frame = 0
    let visible = true
    let pointer = { nx: 0, ny: 0, active: false }
    let parallax = { x: 0, y: 0 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      motes = Array.from({ length: count }, () => {
        const depth = 0.25 + Math.random() * 0.75
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          r: 0.6 + depth * 1.9,
          drift: 0.08 + depth * 0.22,
          phase: Math.random() * Math.PI * 2,
          tone: Math.random()
        }
      })
    }

    const draw = (time) => {
      frame = 0
      ctx.clearRect(0, 0, width, height)
      const t = time / 1000

      for (const mote of motes) {
        const twinkle = 0.35 + 0.35 * Math.sin(t * 0.9 + mote.phase)
        const x = mote.x + parallax.x * mote.depth + Math.sin(t * 0.14 + mote.phase) * 6 * mote.depth
        const y = mote.y + parallax.y * mote.depth + Math.cos(t * 0.11 + mote.phase) * 5 * mote.depth
        const alpha = twinkle * (0.3 + mote.depth * 0.5)

        ctx.beginPath()
        ctx.globalAlpha = alpha
        ctx.fillStyle = mote.tone > 0.72 ? '#9b70ff' : tint
        ctx.arc(((x % width) + width) % width, ((y % height) + height) % height, mote.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (time) => {
      if (!visible || document.hidden) return
      if (pointer.active) {
        parallax.x += ((pointer.nx * -34) - parallax.x) * 0.06
        parallax.y += ((pointer.ny * -24) - parallax.y) * 0.06
      }
      draw(time)
      frame = window.requestAnimationFrame(loop)
    }

    resize()
    seed()

    if (!count) {
      // Reduced motion: one quiet, static frame instead of a drifting field.
      draw(0)
      return () => {}
    }

    const onResize = () => {
      resize()
      seed()
    }

    frame = window.requestAnimationFrame(loop)

    const unsubscribePointer = subscribePointer((state) => {
      pointer = state
    })

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false
        if (visible && !frame) frame = window.requestAnimationFrame(loop)
      },
      { threshold: 0.01 }
    )
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      } else if (!frame && visible) {
        frame = window.requestAnimationFrame(loop)
      }
    }

    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      unsubscribePointer()
      io.disconnect()
    }
  }, [density, tint])

  return <canvas ref={canvasRef} className={`particleField ${className}`.trim()} aria-hidden="true" />
}
