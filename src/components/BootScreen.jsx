import { useEffect, useState } from 'react'
import { buildManifest, preloadAssets } from '../lib/assets.js'
import { prefersReducedMotion } from '../lib/motion.js'

/**
 * Boot sequence.
 *
 * The percentage is measured, not performed: it counts the portrait, the 36
 * eye frames and the project screenshots as they actually finish loading.
 * The orbit rings assemble and the counter leaves with the site fading in.
 */
export default function BootScreen({ onReady }) {
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(0)
  const [phase, setPhase] = useState('loading') // loading | leaving | gone

  useEffect(() => {
    let cancelled = false
    const reduced = prefersReducedMotion()
    const started = performance.now()

    preloadAssets(buildManifest(), (value, info) => {
      if (cancelled) return
      setProgress(value)
      if (info) setFailed(info.failed)
    }).then((result) => {
      if (cancelled) return
      setFailed(result?.failed ?? 0)
      setProgress(1)

      // Hold long enough to read the number, never long enough to annoy.
      const elapsed = performance.now() - started
      const minimum = reduced ? 120 : 900
      const wait = Math.max(0, minimum - elapsed)

      window.setTimeout(() => {
        if (cancelled) return
        setPhase('leaving')
        window.setTimeout(() => {
          if (cancelled) return
          setPhase('gone')
          onReady?.()
        }, reduced ? 60 : 780)
      }, wait)
    })

    return () => {
      cancelled = true
    }
  }, [onReady])

  if (phase === 'gone') return null

  const percent = Math.round(progress * 100)

  return (
    <div className="boot" data-phase={phase} role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="boot__aurora" aria-hidden="true" />

      <div className="boot__orbit" aria-hidden="true" data-phase={phase}>
        <span className="boot__orbitRing boot__orbitRing--a" />
        <span className="boot__orbitRing boot__orbitRing--b" />
        <span className="boot__orbitRing boot__orbitRing--c" />
        <span className="boot__orbitCore" />
        <span className="boot__orbitSatellite" />
      </div>

      <div className="boot__readout">
        <span className="boot__mark">M·M</span>
        <span className="boot__percent" aria-hidden="true">
          {String(percent).padStart(3, '0')}
          <i>%</i>
        </span>
        <span className="boot__meter" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
        <span className="boot__label">
          {failed > 0 ? `${failed} file${failed === 1 ? '' : 's'} could not load` : 'Assembling environment'}
        </span>
      </div>

      <div className="boot__curtain" aria-hidden="true" />
    </div>
  )
}
