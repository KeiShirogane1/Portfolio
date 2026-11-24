import SplitText from './SplitText.jsx'
import ParticleField from './ParticleField.jsx'
import EyeProtractor from './EyeProtractor.jsx'
import { profile } from '../data/profile.js'

/**
 * Hero.
 *
 * One straight line of navigation comes from the fixed <Nav> in App — this
 * section deliberately holds no navigation of its own, so there is no second
 * bar to wrap or overlap the real one.
 *
 * Layout: copy on the left, the eye-tracking ring on the right. Below 980px
 * the two columns stack and the ring sits first, because the portrait is the
 * reason people stop scrolling.
 */
export default function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__mesh" aria-hidden="true" />
      <div className="hero__aurora" aria-hidden="true" />

      <div className="hero__atmosphere" aria-hidden="true">
        <ParticleField density={42} className="hero__particles" tint="#548cff" />
      </div>

      <div className="hero__inner shell">
        <div className="hero__stage">
          <EyeProtractor />
          <p className="hero__hint">
            <span aria-hidden="true">◆</span> Move your cursor — the eyes follow.
          </p>
        </div>

        <div className="hero__copy">
          <p className="hero__eyebrow hero__eyebrow--live">
            <span className="hero__dot" aria-hidden="true" />
            Open to OJT, internship and freelance work
          </p>

          <SplitText
            as="h1"
            id="hero-title"
            className="hero__title"
            mode="chars"
            step={22}
            lines={[
              { text: 'Building ideas into', accent: false },
              { text: 'digital experiences.', accent: true }
            ]}
          />

          <p className="hero__subhead">
            I'm {profile.name}, a software developer and fourth-year Information
            Technology student. I build web, mobile and AI-assisted software that
            people can actually use.
          </p>

          <div className="hero__actions">
            <a className="btn btn--primary breath-border" href="#projects" style={{ '--breath-delay': '0.08s' }}>
              Explore my work
            </a>
            <a className="btn btn--outline breath-border" href={profile.resumeHref} download={profile.resumeFileName} style={{ '--breath-delay': '0.22s' }}>
              Download resume
            </a>
            <a className="hero__textLink breath-border" href="#contact" style={{ '--breath-delay': '0.36s' }}>
              Contact me <span aria-hidden="true">→</span>
            </a>
          </div>

          <dl className="hero__facts">
            <div>
              <dt>Program</dt>
              <dd>BS Information Technology</dd>
            </div>
            <div>
              <dt>OJT</dt>
              <dd>486 hours required</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
