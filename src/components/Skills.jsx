import { useEffect, useRef, useState } from 'react'
import { skillCategories } from '../data/skills.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

export default function Skills() {
  const ref = useRevealGroup()
  const [active, setActive] = useState(skillCategories[0].key)
  const listRef = useRef(null)
  const current = skillCategories.find((c) => c.key === active) ?? skillCategories[0]

  // Arrow keys move between category tabs (roving tabindex pattern).
  const onKeyDown = (event) => {
    const index = skillCategories.findIndex((c) => c.key === active)
    let next = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % skillCategories.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + skillCategories.length) % skillCategories.length
    if (next === null) return
    event.preventDefault()
    const key = skillCategories[next].key
    setActive(key)
    listRef.current?.querySelector(`[data-key="${key}"]`)?.focus()
  }

  return (
    <section id="skills" className="section" aria-labelledby="skills-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">03 — Technical Skills</span>
          <h2 id="skills-title" className="splitText reveal" style={{ '--reveal-delay': '60ms' }}>
            <SplitText text="The stack I build with." mode="chars" step="34ms" />
          </h2>
          <p>
            Grouped by where each tool sits in a project. No percentages — just the technologies I have
            actually worked with, and what I use them for.
          </p>
        </div>

        <div className="skills__grid">
          <div className="skills__tabs reveal" role="tablist" aria-label="Skill categories" aria-orientation="vertical" ref={listRef}>
            {skillCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                role="tab"
                data-key={cat.key}
                id={`tab-${cat.key}`}
                aria-selected={cat.key === active}
                aria-controls={`panel-${cat.key}`}
                tabIndex={cat.key === active ? 0 : -1}
                className="skills__tab"
                onClick={() => setActive(cat.key)}
                onKeyDown={onKeyDown}
              >
                <span className="skills__tabIndex">{cat.index}</span>
                <span className="skills__tabLabel">{cat.title}</span>
                <span className="skills__tabCount">{cat.tools.length}</span>
              </button>
            ))}
          </div>

          <div
            className="skills__panel panel reveal"
            role="tabpanel"
            id={`panel-${current.key}`}
            aria-labelledby={`tab-${current.key}`}
            key={current.key}
          >
            <div className="skills__panelHead">
              <span className="mono">{current.index} / {current.title}</span>
              <p>{current.blurb}</p>
            </div>

            <ul className="skills__chips">
              {current.tools.map((tool, i) => (
                <li key={tool} style={{ '--i': i }}>
                  <span className="skills__chipBar" aria-hidden="true" />
                  {tool}
                </li>
              ))}
            </ul>

            <div className="skills__matrix" aria-hidden="true">
              {skillCategories.map((cat) => (
                <span
                  key={cat.key}
                  className="skills__node"
                  data-active={cat.key === current.key}
                  style={{ '--i': skillCategories.indexOf(cat) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
