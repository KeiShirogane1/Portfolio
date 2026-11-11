import { about, goals, profile } from '../data/profile.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

const revealStyle = (ms) => ({ '--reveal-delay': `${ms}ms` })

export default function About() {
  const ref = useRevealGroup()

  return (
    <section id="about" className="section" aria-labelledby="about-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{about.eyebrow}</span>
          <h2 id="about-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text={about.heading} mode="chars" step="30ms" />
          </h2>
        </div>

        <div className="about__grid">
          <div className="about__prose">
            <p className="about__lead reveal">{about.intro}</p>

            {about.paragraphs.map((text, i) => (
              <p key={text.slice(0, 24)} className="reveal" style={revealStyle(80 * (i + 1))}>
                {text}
              </p>
            ))}

            <div className="about__goals reveal" style={revealStyle(320)}>
              <span className="mono">Looking for</span>
              <ul>
                {goals.map((goal) => (
                  <li key={goal}>
                    <span className="about__bullet" aria-hidden="true" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="about__side">
            <div className="about__card panel reveal">
              <span className="mono">Profile</span>
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>Title</dt>
                  <dd>{profile.title}</dd>
                </div>
                <div>
                  <dt>Program</dt>
                  <dd>{profile.degree}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{profile.location}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{profile.status}</dd>
                </div>
              </dl>
            </div>

            <ul className="about__interests">
              {about.interests.map((item, i) => (
                <li key={item.label} className="reveal" style={revealStyle(90 * i)}>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
