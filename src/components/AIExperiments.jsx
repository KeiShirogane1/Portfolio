import { aiIntro, experiments } from '../data/ai.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

export default function AIExperiments() {
  const ref = useRevealGroup()

  return (
    <section id="ai" className="section" aria-labelledby="ai-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{aiIntro.eyebrow}</span>
          <h2 id="ai-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text={aiIntro.heading} mode="chars" step="30ms" />
          </h2>
          <p>{aiIntro.body}</p>
        </div>

        <div className="ai__grid">
          {experiments.map((item, i) => (
            <article key={item.title} className="ai__card panel reveal" style={{ '--reveal-delay': `${i * 80}ms` }}>
              <span className="ai__index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <ul className="ai__tags">
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="ai__disclaimer reveal">
          <span aria-hidden="true">※</span> These are explorations and practice. No AI model was trained, fine-tuned
          or published as part of this portfolio.
        </p>
      </div>
    </section>
  )
}
