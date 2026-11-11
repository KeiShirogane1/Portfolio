import { profile } from '../data/profile.js'
import EyeProtractor from './EyeProtractor.jsx'
import SplitText from './SplitText.jsx'
import ParticleField from './ParticleField.jsx'
import useParallax from '../hooks/useParallax.js'
import useRevealGroup from '../hooks/useRevealGroup.js'

export default function Hero() {
  const ref = useRevealGroup()
  const stageRef = useParallax(40)

  return (
    <section id="home" className="hero section section--flush" aria-labelledby="hero-title" ref={ref}>
      <div className="hero__grid shell">
        <div className="hero__copy">
          <div className="hero__status reveal">
            <span className="hero__dot" aria-hidden="true" />
            <span>{profile.status}</span>
          </div>

          <p className="hero__kicker reveal" style={{ '--reveal-delay': '60ms' }}>
            BS Information Technology · {profile.location}
          </p>

          <h1 id="hero-title" className="hero__name reveal" style={{ '--reveal-delay': '120ms' }}>
            <SplitText text={profile.name} mode="chars" delay="300ms" step="36ms" />
          </h1>

          <p className="hero__role reveal" style={{ '--reveal-delay': '180ms' }}>
            <span>{profile.title}</span>
            <span className="hero__roleLine" aria-hidden="true" />
          </p>

          <p className="hero__tagline reveal" style={{ '--reveal-delay': '240ms' }}>
            &ldquo;{profile.tagline}&rdquo;
          </p>

          <p className="hero__support reveal" style={{ '--reveal-delay': '300ms' }}>
            {profile.supporting}
          </p>

          <div className="hero__actions reveal" style={{ '--reveal-delay': '360ms' }}>
            <a className="btn btn--primary" href="#projects">
              Explore My Projects
              <svg className="btn__arrow" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
            <a className="btn btn--ghost" href="#about">
              About Me
            </a>
            <a className="btn btn--ghost" href={profile.resumeHref} download={profile.resumeFileName}>
              Download Resume
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M6 2v7M3 6.5L6 9.5l3-3M2 11h8" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </a>
            <a className="btn btn--ghost" href="#contact">
              Contact Me
            </a>
          </div>

          <dl className="hero__stats reveal" style={{ '--reveal-delay': '420ms' }}>
            <div>
              <dt>Focus</dt>
              <dd>Full-stack &amp; AI-assisted builds</dd>
            </div>
            <div>
              <dt>Available for</dt>
              <dd>OJT, internship, freelance</dd>
            </div>
            <div>
              <dt>Signature</dt>
              <dd>Eyes that follow your cursor</dd>
            </div>
          </dl>
        </div>

        <div className="hero__stageWrap reveal" style={{ '--reveal-delay': '260ms' }}>
          <div className="parallax hero__atmosphere" ref={stageRef}>
            <ParticleField density={44} tint="#548cff" />
          </div>
          <EyeProtractor />
          <p className="hero__hint">
            <span aria-hidden="true">↳</span> Move your cursor anywhere on the page — the eyes follow it.
          </p>
        </div>
      </div>

      <div className="hero__scroll shell" aria-hidden="true">
        <span className="mono">Scroll</span>
        <span className="hero__scrollLine" />
      </div>
    </section>
  )
}
