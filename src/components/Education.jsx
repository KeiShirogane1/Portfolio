import { education } from '../data/experience.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

export default function Education() {
  const ref = useRevealGroup()

  return (
    <section id="education" className="section" aria-labelledby="education-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{education.eyebrow}</span>
          <h2 id="education-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text="Where the foundation is being built." mode="chars" step="30ms" />
          </h2>
        </div>

        <div className="edu__grid">
          <article className="edu__card panel reveal">
            <div className="edu__cardHead">
              <span className="mono">Degree</span>
              <h3>{education.degree}</h3>
            </div>

            <dl className="edu__facts">
              <div>
                <dt>School</dt>
                <dd className="edu__placeholder">{education.school}</dd>
              </div>
              <div>
                <dt>Academic year</dt>
                <dd className="edu__placeholder">{education.period}</dd>
              </div>
              <div>
                <dt>Expected graduation</dt>
                <dd className="edu__placeholder">{education.graduation}</dd>
              </div>
            </dl>

            <p className="edu__note">{education.note}</p>
          </article>

          <div className="edu__side">
            <div className="panel reveal edu__courses" style={{ '--reveal-delay': '100ms' }}>
              <span className="mono">Coursework grounding</span>
              <ul>
                {education.courses.map((course) => (
                  <li key={course}>
                    <span aria-hidden="true">/</span>
                    {course}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel reveal edu__goals" style={{ '--reveal-delay': '180ms' }}>
              <span className="mono">After graduation</span>
              <ul>
                {education.goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
