import { useEffect, useRef } from 'react'

const SPEED_PER_60HZ_FRAME = 3.75
const REACH_THRESHOLD = 10
const FRAME_INTERVAL_MS = 90
const SPRITE_SCALE = 1.25

const SPRITE_DATA = {
  Left: { size: [32, 28], frames: [[129, 64], [128, 99]] },
  Right: { size: [32, 28], frames: [[95, 0], [96, 33]] },
  UP: { size: [32, 32], frames: [[32, 64], [32, 96]] },
  Down: { size: [32, 32], frames: [[193, 96], [224, 63]] },
  TopLeft: { size: [32, 32], frames: [[34, 0], [33, 30]] },
  TopRight: { size: [32, 32], frames: [[0, 64], [0, 96]] },
  BottomLeft: { size: [32, 32], frames: [[160, 96], [128, 96]] },
  BottomRight: { size: [32, 32], frames: [[160, 33], [162, 62]] }
}

function directionFromAngle(angleDeg) {
  if (angleDeg > -22.5 && angleDeg <= 22.5) return 'Right'
  if (angleDeg > 22.5 && angleDeg <= 67.5) return 'BottomRight'
  if (angleDeg > 67.5 && angleDeg <= 112.5) return 'Down'
  if (angleDeg > 112.5 && angleDeg <= 157.5) return 'BottomLeft'
  if (angleDeg > 157.5 || angleDeg <= -157.5) return 'Left'
  if (angleDeg > -157.5 && angleDeg <= -112.5) return 'TopLeft'
  if (angleDeg > -112.5 && angleDeg <= -67.5) return 'UP'
  return 'TopRight'
}

/**
 * GPU-composited pixel-art cursor pet (based on DixitRam/Cursor-Pet) that
 * chases the pointer using translate3d without triggering layout/paint per frame.
 */
export default function CursorCat() {
  const catRef = useRef(null)

  useEffect(() => {
    const el = catRef.current
    if (!el) return undefined

    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (coarsePointer.matches || reducedMotion.matches) return undefined

    let active = true
    let hasMoved = false
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let catX = mouseX
    let catY = mouseY
    let direction = 'Right'
    let frameIndex = 0
    let lastFrameTime = 0
    let lastTickTime = 0
    let isIdle = false
    let reachTime = 0
    let renderWidth = 32
    let renderHeight = 32
    let lastPosX = -1
    let lastPosY = -1
    let lastW = 32
    let lastH = 32
    let lastX = Number.NaN
    let lastY = Number.NaN
    let animFrame = 0

    const onMouseMove = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
      if (!hasMoved) {
        hasMoved = true
        el.style.opacity = '1'
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const update = (timestamp) => {
      if (!active) return

      const dtScale = lastTickTime
        ? Math.min(2.5, Math.max(0.25, (timestamp - lastTickTime) / (1000 / 60)))
        : 1
      lastTickTime = timestamp

      const dx = mouseX - catX
      const dy = mouseY - catY
      const distance = Math.hypot(dx, dy)

      if (distance > REACH_THRESHOLD) {
        const angleRad = Math.atan2(dy, dx)
        const step = Math.min(distance - REACH_THRESHOLD * 0.5, SPEED_PER_60HZ_FRAME * dtScale)
        catX += Math.cos(angleRad) * step
        catY += Math.sin(angleRad) * step
        direction = directionFromAngle(angleRad * (180 / Math.PI))
      }

      if (timestamp - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = timestamp
        let posX = 96
        let posY = 96
        let frameWidth = 32
        let frameHeight = 32

        if (distance > REACH_THRESHOLD) {
          isIdle = false
          const sprite = SPRITE_DATA[direction]
          const frameNum = frameIndex % 2
          frameIndex += 1
          ;[posX, posY] = sprite.frames[frameNum]
          ;[frameWidth, frameHeight] = sprite.size
        } else {
          if (!isIdle) {
            isIdle = true
            reachTime = timestamp
            frameIndex = 0
          }
          const timeSinceReach = timestamp - reachTime
          if (timeSinceReach < 2000) {
            posX = 96
            posY = 96
          } else {
            const idleTime = timeSinceReach - 2000
            if (idleTime < 200) {
              posX = 96
              posY = 63
            } else {
              const loopFrame = Math.floor((idleTime - 200) / 200) % 2
              posX = 64
              posY = loopFrame === 0 ? 0 : 32
            }
          }
        }

        renderWidth = frameWidth
        renderHeight = frameHeight
        if (frameWidth !== lastW) {
          lastW = frameWidth
          el.style.width = `${frameWidth}px`
        }
        if (frameHeight !== lastH) {
          lastH = frameHeight
          el.style.height = `${frameHeight}px`
        }
        if (posX !== lastPosX || posY !== lastPosY) {
          lastPosX = posX
          lastPosY = posY
          el.style.backgroundPosition = `-${posX}px -${posY}px`
        }
      }

      const x = Math.round((catX - (renderWidth * SPRITE_SCALE) / 2) * 100) / 100
      const y = Math.round((catY - (renderHeight * SPRITE_SCALE) / 2) * 100) / 100
      if (x !== lastX || y !== lastY) {
        lastX = x
        lastY = y
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${SPRITE_SCALE})`
      }

      animFrame = window.requestAnimationFrame(update)
    }

    animFrame = window.requestAnimationFrame(update)

    return () => {
      active = false
      window.removeEventListener('mousemove', onMouseMove)
      if (animFrame) window.cancelAnimationFrame(animFrame)
    }
  }, [])

  return (
    <div
      ref={catRef}
      className="cursor-cat"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '32px',
        height: '32px',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 180ms ease-out',
        willChange: 'transform',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        backgroundImage: 'url("/cursor-cat.gif")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '256px 128px',
        backgroundPosition: '-96px -96px',
        transform: `translate3d(0px, 0px, 0) scale(${SPRITE_SCALE})`,
        transformOrigin: 'top left',
        imageRendering: 'pixelated'
      }}
    />
  )
}
