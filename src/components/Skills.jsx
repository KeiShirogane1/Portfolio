import { useEffect, useRef, useState } from 'react'
import { skillCategories } from '../data/skills.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

/* ------------------------------------------------------------------ brand icons */
/* Local, color-authentic SVG assets sourced from Devicon and Simple Icons.
   Keeping the files in public/ means no runtime CDN dependency. */

const BRAND_ICONS = {
  python: '/icons/brands/python.svg',
  javascript: '/icons/brands/javascript.svg',
  java: '/icons/brands/java.svg',
  php: '/icons/brands/php.svg',
  html5: '/icons/brands/html5.svg',
  css3: '/icons/brands/css3.svg',
  react: '/icons/brands/react.svg',
  json: '/icons/brands/json.svg',
  flask: '/icons/brands/flask.svg',
  nodejs: '/icons/brands/nodejs.svg',
  capacitor: '/icons/brands/capacitor.svg',
  sqlite: '/icons/brands/sqlite.svg',
  postgresql: '/icons/brands/postgresql.svg',
  git: '/icons/brands/git.svg',
  github: '/icons/brands/github.svg',
  vscode: '/icons/brands/vscode.svg',
  powershell: '/icons/brands/powershell.svg',
  cloudflare: '/icons/brands/cloudflare.svg',
  render: '/icons/brands/render.svg'
}

function GenericSkillIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m14 5-4 14" />
    </svg>
  )
}

export default function Skills() {
  const ref = useRevealGroup()
  const [active, setActive] = useState(skillCategories[0].key)
  const listRef = useRef(null)
  const current = skillCategories.find((c) => c.key === active) ?? skillCategories[0]

  const iconFor = (iconName) => {
    const iconSrc = BRAND_ICONS[iconName]
    return iconSrc ? (
      <img src={iconSrc} alt="" width="18" height="18" loading="lazy" decoding="async" />
    ) : (
      <GenericSkillIcon />
    )
  }

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
          <span className="eyebrow">06 — Technical Skills</span>
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
                className="skills__tab breath-border"
                style={{ '--breath-delay': `${cat.index.charCodeAt(0) * 0.13}s` }}
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
              className="skills__panel panel breath-border reveal"
              role="tabpanel"
              id={`panel-${current.key}`}
              aria-labelledby={`tab-${current.key}`}
              key={current.key}
            >
            <div className="skills__panelHead">
              <span className="mono">{current.index} / {current.title.toUpperCase()}</span>
              <p>{current.blurb}</p>
            </div>

            <ul className="skills__chips">
              {current.tools.map((tool, i) => (
                <li key={tool.name} style={{ '--i': i, '--breath-delay': `${i * 0.17}s` }} className="skills__chip breath-border">
                  <span className="skills__chipIcon" aria-hidden="true">
                    {iconFor(tool.icon)}
                  </span>
                  <span className="skills__chipLabel">{tool.name}</span>
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