import { useEffect, useRef } from 'react'

/**
 * The hero: your portrait inside a circular ring, with pupils that follow the
 * pointer. No degree labels, no readout — only the eyes tracking.
 *
 * Layers, in order:
 *   1. portrait-base.png   your photo with the eye openings painted to eye-white
 *   2. portrait-iris.png   both irises cut from your real photo
 *   (the irises are clipped by eyes-mask.png, which is the exact shape of the
 *    openings in your eyeless photo, so a pupil can never paint over the lids)
 *   3. the SVG ring        the circular border and tick marks
 *   4. the breathing halo  blue-violet light pulse sitting on the border
 *
 * Pupil travel is driven by the pointer's offset from the ring centre, eased
 * with requestAnimationFrame on transform only, so the face itself never moves.
 */

const CX = 200 // ring centre, in the 400-unit SVG box
const CY = 200
const R_OUT = 194
const R_TICK_OUT = 186
const R_TICK_MAJOR = 170
const R_TICK_MINOR = 178
const R_ARC_IN = 164

/** Pupil travel, as a percentage of the square frame. */
const RANGE_X = 2.9
const RANGE_Y = 0.95
/** Easing per animation frame. */
const EASE = 0.18

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5)

const rad = (deg) => ((deg - 90) * Math.PI) / 180
const point = (r, deg) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))]

export default function EyeProtractor() {
  const stageRef = useRef(null)
  const irisRef = useRef(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const place = (x, y) => {
      const node = irisRef.current
      if (node) node.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0)`
    }

    const step = () => {
      const c = current.current
      const t = target.current
      const k = reduced ? 1 : EASE

      c.x += (t.x - c.x) * k
      c.y += (t.y - c.y) * k

      if (Math.abs(t.x - c.x) < 0.01 && Math.abs(t.y - c.y) < 0.01) {
        c.x = t.x
        c.y = t.y
        place(c.x, c.y)
        raf.current = 0
        return
      }

      place(c.x, c.y)
      raf.current = requestAnimationFrame(step)
    }

    const aim = (clientX, clientY) => {
      const node = stageRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = clientX - cx
      const dy = clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist < 4) {
        target.current = { x: 0, y: 0 }
        if (!raf.current) raf.current = requestAnimationFrame(step)
        return
      }

      // Pupils lean toward the pointer, shortening near the centre.
      const reach = Math.max(180, rect.width * 1.1)
      const push = Math.min(1, dist / reach)
      const ux = (dx / dist) * push
      const uy = (dy / dist) * push

      target.current = { x: ux * RANGE_X, y: uy * RANGE_Y }

      if (!raf.current) raf.current = requestAnimationFrame(step)
    }

    const onMove = (e) => aim(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches?.[0]
      if (t) aim(t.clientX, t.clientY)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })

    // Pointer leaves the page: eyes settle back to a calm, upright rest.
    const rest = () => {
      target.current = { x: 0, y: 0 }
      if (!raf.current) raf.current = requestAnimationFrame(step)
    }
    document.addEventListener('pointerleave', rest)
    window.addEventListener('blur', rest)

    place(0, 0)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchstart', onTouch)
      document.removeEventListener('pointerleave', rest)
      window.removeEventListener('blur', rest)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div className="eyeStage" ref={stageRef}>
      <div className="eyeStage__glow" aria-hidden="true" />
      <div className="eyeStage__breath" aria-hidden="true" />

      <svg className="eyeStage__dial" viewBox="0 0 400 400" aria-hidden="true">
        <circle className="dial__edge" cx={CX} cy={CY} r={R_OUT} />
        <circle className="dial__inner" cx={CX} cy={CY} r={R_ARC_IN} />

        {TICKS.map((t) => {
          const major = t % 30 === 0
          const inner = major ? R_TICK_MAJOR : R_TICK_MINOR
          const [x1, y1] = point(inner, t)
          const [x2, y2] = point(R_TICK_OUT, t)
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={major ? 'dial__tick dial__tick--major' : 'dial__tick'}
            />
          )
        })}
      </svg>

      <div className="eyeStage__window">
        <img
          className="eyeStage__base"
          src="/portrait-base.png"
          alt="Portrait of Mark John Rey F. Mana-ay"
          width="1440"
          height="1440"
          fetchpriority="high"
          draggable="false"
        />
        <div className="eyeStage__pupils" aria-hidden="true">
          <img
            className="eyeStage__iris"
            ref={irisRef}
            src="/portrait-iris.png"
            alt=""
            width="1440"
            height="1440"
            draggable="false"
          />
        </div>
      </div>

      <span className="visually-hidden">The portrait's pupils follow the pointer.</span>
    </div>
  )
}
