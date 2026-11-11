import { experience, internshipWork } from '../data/experience.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

export default function Experience() {
  const ref = useRevealGroup()

  return (
    <section id="experience" className="section" aria-labelledby="experience-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{experience.eyebrow}</span>
          <h2 id="experience-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text="Three years behind the counter." mode="chars" step="30ms" />
          </h2>
          <p>{experience.summary}</p>
        </div>

        <div className="xp__layout">
          <div className="xp__rail reveal">
            <span className="xp__railDot" aria-hidden="true" />
            <span className="xp__railLine" aria-hidden="true" />
          </div>

          <div className="xp__card panel reveal" style={{ '--reveal-delay': '80ms' }}>
            <div className="xp__cardHead">
              <div>
                <span className="mono">{experience.role} · {experience.duration}</span>
                <h3>{experience.workplace}</h3>
              </div>
              <span className="xp__badge">~3 yrs</span>
            </div>

            <p className="xp__note">{experience.note}</p>

            <ul className="xp__skills">
              {experience.skills.map((skill, i) => (
                <li key={skill.label} style={{ '--reveal-delay': `${40 * i}ms` }}>
                  <h4>{skill.label}</h4>
                  <p>{skill.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="xp__intern panel reveal" style={{ '--reveal-delay': '120ms' }}>
          <span className="mono xp__internLabel">{internshipWork.label}</span>
          <h3>{internshipWork.title}</h3>
          <p className="xp__note">{internshipWork.context}</p>
          <ul className="xp__internList">
            {internshipWork.carryOver.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className="btn btn--ghost" href="#projects">
            Read the Nexora breakdown
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
