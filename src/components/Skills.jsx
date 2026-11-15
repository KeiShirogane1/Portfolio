import { useEffect, useRef, useState } from 'react'
import { skillCategories } from '../data/skills.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

/* ------------------------------------------------------------------ icons */
/* Brand-colour inline SVGs for technology chips. Tools without a brand
   mark (phrase-style entries such as "API integration") fall back to a
   generic code/slash icon. All icons use fill="currentColor" so the chip
   text colour drives the icon colour, then we override per-brand where
   the brand colour is distinctive enough to carry on its own. */

const ICONS = {
  python: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#3776AB">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m-1.75 9.339L10.25 11l-1.061 1.061L9 8zM7.05 13l1.061 1.061L12 10.939l-1.061-1.061L11 8l-2 2zM11 16l-1.061-1.061L10 15z" />
    </svg>
  ),
  javascript: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#F7DF1E">
      <path d="M24 12.069c0-4.393-2.011-8.295-5.194-11.002C16.129 1.678 13.523 0 10.743 0C3.359 0 0 4.36 0 9.743c0 3.268 1.761 6.14 4.461 7.816-.077.352-.119.71-.119 1.074 0 2.868 1.485 5.425 3.868 7.097 1.463 1.023 3.166 1.557 4.956 1.557h2.537c-1.746-4.113-.214-8.373 2.474-10.006l2.602-1.584c3.572-2.167 5.69-6.391 5.69-10.972 0-4.144-2.371-7.762-5.925-9.492-2.737-1.338-5.896-2.009-8.626-2.009-2.842 0-5.526.967-7.833 2.875-2.774 2.308-3.96 5.84-3.078 9.066l-2.332 1.42C0 17.101 2.361 19.531 5.835 20.877c3.609 1.384 7.469 1.053 10.674-.662l.507-.27c2.618-1.587 4.084-3.925 4.084-6.609 0-1.139-.482-2.17-1.275-2.956-2.438-2.41-6.112-2.41-8.55 0-2.422 2.41-3.148 4.803-2.228 7.257l.23.614c1.219 3.057 4.279 5.006 7.592 5.006 4.59 0 7.245-2.687 7.245-6.012 0-2.322-1.527-4.322-3.79-5.714-2.089-1.293-4.612-1.951-7.274-1.951-3.144 0-5.971 1.253-8.101 3.431-1.248 1.27-1.886 2.837-1.563 4.478.327 1.634 1.293 3.128 2.487 4.323 2.419 2.392 6.093 2.392 8.504 0 1.191-1.182 2.372-2.365 2.27-2.372-.102 0-.244-.025-.346-.049 1.997-1.274 3.18-3.506 3.18-5.972 0-3.359-2.683-6.093-5.987-6.093-2.081 0-4.032.835-5.482 2.25-1.904 1.859-2.487 4.797-1.337 7.306 1.293 2.859 4.013 4.797 7.103 4.797 4.337 0 6.739-2.389 6.739-5.321 0-1.429-.316-2.703-.842-3.868 1.826-1.532 2.946-3.63 2.946-5.895 0-4.322-2.338-7.902-5.514-9.747C10.618 1.491 9.368 1.253 8.064 1.253c-3.042 0-5.903 1.152-7.903 3.191-2.502 2.535-3.573 6.112-2.535 9.386 0 3.268 1.527 6.131 4.032 8.133l-.507 2.993c-2.67-1.733-4.186-3.692-4.186-6.093 0-2.371 1.182-4.415 3.191-5.835 1.485-1.113 3.229-1.678 5.071-1.678 3.309 0 5.903 1.678 7.227 4.477 1.912 4.084-.614 8.504-4.761 10.22-2.918 1.202-5.955 1.827-8.945 1.827-4.091 0-7.666-1.509-10.409-4.186-2.494-2.494-3.668-6.024-3.112-9.386.507-3.166 3.042-5.698 6.075-7.103 2.227-1.017 4.655-1.527 6.967-1.527 4.421 0 7.097 2.338 7.097 5.194 0 1.634-.419 3.203-1.113 4.477-2.494 4.522-6.112 7.023-10.326 7.023-5.194 0-7.833-2.729-7.833-6.093 0-2.167 1.061-4.123 2.828-5.508 2.117-1.722 4.59-2.597 7.048-2.597 2.989 0 5.573 1.253 7.544 3.498 1.121 1.299 1.696 2.842 1.374 4.441-.293 1.681-.967 3.191-1.912 4.497-1.678 2.331-4.112 3.498-6.533 3.498-4.329 0-6.935-2.487-6.935-5.508 0-1.773.58-3.359 1.563-4.612 1.099-1.331 2.523-2.09 4.033-2.298 1.61-.209 3.144-.209 4.585-.013" />
    </svg>
  ),
  java: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#007396">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16zm-1.5 13.5V11h1.5v4.5zm3-4.5V7h-1.5v4.5zM12 8c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2zm4 4c0 1.103-.897 2-2 2s-2-.897-2-2 .897-2 2-2 2 .897 2 2z" />
    </svg>
  ),
  php: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#777BB4">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  sql: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#002F6F">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  html5: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#E34F26">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  css3: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#1572B6">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  react: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#61DAFB">
      <path d="M6.667 9.531a1.515 1.515 0 002.588 1.58c2.224-2.361 4.751-4.274 7.485-5.202a4.75 4.75 0 00-1.195-.616l-.182-.084a4.44 4.44 0 00-.97-.441l-.432-.202a4.7 4.7 0 00-1.395-.61l-.47-.225a4.9 4.9 0 00-1.56-.542L12 4.336a4.7 4.7 0 00-1.58.55l-.448.231a4.7 4.7 0 00-1.384.6l-.47.225a4.7 4.7 0 00-1.394.61l-.432.202a4.44 4.44 0 00-.97.44l-.182.084a4.75 4.75 0 00-1.196.616c2.732.928 5.262 2.84 7.486 5.202a1.515 1.515 0 002.588-1.58c-.699-4.762-3.607-8.373-8.295-8.373s-7.596 3.61-8.295 8.373z" />
    </svg>
  ),
  json: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#292929">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  generic: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#929BAD">
      <path d="M12 2L3 7v10l9 5 9-5V7z" />
    </svg>
  ),
  flask: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#000000">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  nodejs: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#339933">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  capacitor: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#4698FF">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  sqlite: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#003F5F">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  postgresql: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#336791">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  git: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#F05032">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  github: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#181717">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  vscode: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#007ACC">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  powershell: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#5391FE">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  cloudflare: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#F38020">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  ),
  render: (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#3B0594">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  )
}

export default function Skills() {
  const ref = useRevealGroup()
  const [active, setActive] = useState(skillCategories[0].key)
  const listRef = useRef(null)
  const current = skillCategories.find((c) => c.key === active) ?? skillCategories[0]

  const iconFor = (iconName) => ICONS[iconName] || ICONS.generic

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
                <li key={tool.name} style={{ '--i': i }} className="skills__chip breath-border">
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