import { useEffect, useRef, useState } from 'react'
import { certsIntro, certifications } from '../data/certifications.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

/* -------------------------------------------------------- image viewer --- */

function CertModal({ cert, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const restoreTo = document.activeElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      if (restoreTo instanceof HTMLElement) restoreTo.focus()
    }
  }, [onClose])

  return (
    <div className="certModal__backdrop" onClick={onClose} role="presentation">
      <div
        className="certModal"
        role="dialog"
        aria-modal="true"
        aria-label={`${cert.title} certificate`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="certModal__head">
          <span className="mono">{cert.issuer}</span>
          <button
            ref={closeRef}
            type="button"
            className="certModal__close"
            onClick={onClose}
            aria-label="Close certificate image"
          >
            X
          </button>
        </div>
        <img className="certModal__img" src={cert.image} alt={cert.alt} />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- section --- */

export default function Certifications() {
  const ref = useRevealGroup()
  const [active, setActive] = useState(null)

  return (
    <section id="certs" className="section" aria-labelledby="certs-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{certsIntro.eyebrow}</span>
          <h2 id="certs-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text={certsIntro.heading} mode="chars" step="30ms" />
          </h2>
          <p>{certsIntro.body}</p>
        </div>

        <div className="certs__grid">
          {certifications.map((cert, i) => (
            <article
              key={cert.index}
              className="certs__card panel reveal"
              style={{ '--reveal-delay': `${i * 80}ms` }}
            >
              <button
                type="button"
                className="certs__preview"
                onClick={() => setActive(cert)}
                aria-label={`Open certificate image: ${cert.alt}`}
              >
                <img src={cert.image} alt="" loading="lazy" decoding="async" />
                <span className="certs__zoom" aria-hidden="true">
                  View
                </span>
              </button>

              <div className="certs__body">
                <span className="certs__index">{cert.index}</span>
                <h3>{cert.title}</h3>
                <p className="certs__issuer">{cert.issuer}</p>
                <dl className="certs__facts">
                  {cert.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                {cert.note ? <p className="certs__note">{cert.note}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      {active ? <CertModal cert={active} onClose={() => setActive(null)} /> : null}
    </section>
  )
}