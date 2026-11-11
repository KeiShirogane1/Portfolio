import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { projects, projectGroups, projectNotes } from '../data/projects.js'
import SplitText from './SplitText.jsx'
import useCardDepth from '../hooks/useCardDepth.js'
import useMagnetic from '../hooks/useMagnetic.js'
import useRevealGroup from '../hooks/useRevealGroup.js'

/* ---------------------------------------------------------------- card --- */

function StatusPill({ project }) {
  return (
    <span className={`statusPill statusPill--${project.statusTone}`}>
      <span className="statusPill__dot" aria-hidden="true" />
      {project.status}
    </span>
  )
}

function ProjectCard({ project, order, onOpen }) {
  const cardRef = useCardDepth({ strength: 9, scale: 1.02 })
  const btnRef = useMagnetic({ strength: 0.24, max: 9 })
  const hasShots = project.images.length > 0

  return (
    <article
      className="projectCard emerge"
      ref={cardRef}
      style={{
        '--emerge-delay': `${order * 90}ms`,
        '--media-ratio': project.mediaRatio || '4 / 3',
        '--accent': project.accent
      }}
    >
      <div className="cardLight" aria-hidden="true" />

      <div className={`projectCard__media${hasShots ? '' : ' isEmpty'}`}>
        {hasShots ? (
          <img
            src={project.images[0]}
            alt={`${project.title} preview`}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.dataset.failed = 'true'
            }}
          />
        ) : (
          <div className="projectCard__pending">
            <span className="projectCard__pendingGlyph" aria-hidden="true">
              ⌁
            </span>
            <span className="mono">Visuals in progress</span>
          </div>
        )}
        <span className="projectCard__index">{project.index}</span>
      </div>

      <div className="projectCard__body">
        <span className="mono projectCard__category">{project.category}</span>

        <div className="projectCard__titleRow">
          <h3>{project.title}</h3>
          <StatusPill project={project} />
        </div>

        <p>{project.summary}</p>

        {typeof project.progress === 'number' && (
          <div className="projectCard__progress">
            <div className="projectCard__progressTrack" aria-hidden="true">
              <span style={{ width: `${project.progress}%` }} />
            </div>
            <span className="mono">{project.progress}% · my estimate</span>
          </div>
        )}

        <ul className="projectCard__tech">
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
          {project.technologies.length > 4 && (
            <li className="projectCard__techMore">+{project.technologies.length - 4}</li>
          )}
        </ul>

        <button
          type="button"
          className="projectCard__open"
          ref={btnRef}
          onClick={() => onOpen(project)}
          aria-label={`View details for ${project.title}`}
        >
          View details
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </article>
  )
}

/* --------------------------------------------------------------- modal --- */

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)
  const [shot, setShot] = useState(0)
  const [closing, setClosing] = useState(false)

  const requestClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 200)
  }, [closing, onClose])

  useEffect(() => {
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event) => {
      if (event.key === 'Escape') {
        requestClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = document.querySelectorAll('.projectModal [data-focusable]')
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [requestClose])

  useEffect(() => {
    setShot(0)
  }, [project.id])

  const shown = project.images[shot]

  return (
    <div
      className={`projectModal__backdrop${closing ? ' isClosing' : ''}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        className="projectModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="projectModalTitle"
        style={{ '--accent': project.accent }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="projectModal__head">
          <div className="projectModal__headText">
            <span className="mono">{project.category}</span>
            <h3 id="projectModalTitle">{project.title}</h3>
          </div>
          <div className="projectModal__headActions">
            <StatusPill project={project} />
            <button
              type="button"
              className="projectModal__close"
              onClick={requestClose}
              aria-label="Close project details"
              data-focusable
              ref={closeRef}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="projectModal__scroll">
          {project.images.length > 0 ? (
            <div className="projectModal__gallery">
              <div className="projectModal__shot">
                <img key={shown} src={shown} alt={`${project.title} visual ${shot + 1}`} loading="lazy" />
              </div>
              {project.illustrationNote && (
                <p className="projectModal__caption mono">{project.illustrationNote}</p>
              )}
              {project.images.length > 1 && (
                <div className="projectModal__thumbs">
                  {project.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      className="projectModal__thumb"
                      data-active={i === shot}
                      onClick={() => setShot(i)}
                      aria-label={`Show visual ${i + 1}`}
                      data-focusable
                    >
                      <img src={img} alt="" aria-hidden="true" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="projectModal__pending">
              <span className="mono">Visuals in progress</span>
              <p>This product is not far enough along to show real captures yet.</p>
            </div>
          )}

          <p className="projectModal__desc">{project.description}</p>

          {project.purpose && (
            <div className="projectModal__purpose">
              <h4>Why it exists</h4>
              <p>{project.purpose}</p>
            </div>
          )}

          {typeof project.progress === 'number' && (
            <div className="projectModal__progress">
              <div className="projectModal__progressHead">
                <span className="mono">Development progress</span>
                <span className="projectModal__progressValue">{project.progress}%</span>
              </div>
              <div className="projectCard__progressTrack" aria-hidden="true">
                <span style={{ width: `${project.progress}%` }} />
              </div>
              <p className="mono projectModal__progressNote">{project.progressNote}</p>
            </div>
          )}

          {project.roleSections && (
            <div className="projectModal__roles">
              <h4>Three roles, one platform</h4>
              <div className="projectModal__roleGrid">
                {project.roleSections.map((role) => (
                  <div key={role.label} className="projectModal__role">
                    <h5>{role.label}</h5>
                    <ul className="projectModal__list">
                      {role.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.mlNote && (
            <div className="projectModal__ml">
              <h4>{project.mlNote.title}</h4>
              <p>{project.mlNote.body}</p>
              <ul className="projectModal__list projectModal__mlStack">
                {project.mlNote.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="projectModal__cols">
            {project.technologies.length > 0 && (
              <div>
                <h4>Technologies</h4>
                <ul className="projectModal__list">
                  {project.technologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.features.length > 0 && (
              <div>
                <h4>Key features</h4>
                <ul className="projectModal__list">
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.contributions.length > 0 && (
              <div>
                <h4>My contributions</h4>
                <ul className="projectModal__list">
                  {project.contributions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {project.detail && (
            <div className="projectModal__detail">
              <h4>Development notes</h4>
              {project.detail.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          <div className="projectModal__access">
            <span className="mono">Access</span>
            <p>
              {project.group === 'qwernfc'
                ? 'Source lives in a private QwerNFC repository and nothing here is publicly deployed, so no repository or live link is shown. Screenshots and demonstrations are the public record.'
                : 'Internship repository access stays with the team it was built for. This page describes verified behaviour without publishing source or credentials.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ section --- */

export default function Projects() {
  const ref = useRevealGroup()
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  const grouped = useMemo(
    () =>
      projectGroups.map((group) => ({
        ...group,
        items: projects.filter((project) => project.group === group.key)
      })),
    []
  )

  return (
    <section id="projects" className="section" aria-labelledby="projects-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">04 — Selected Work</span>
          <h2 id="projects-title" className="splitText reveal">
            <SplitText text="Products, experiments, and software I've helped build." mode="words" step="40ms" />
          </h2>
          <p>
            Five products from the QwerNFC ecosystem, alongside an internship project focused on OJT
            and classroom management.
          </p>
        </div>

        {grouped.map((group, groupIndex) => (
          <div key={group.key} className={`projectGroup projectGroup--${group.key}`}>
            <div className="projectGroup__head reveal">
              <div className="projectGroup__titleRow">
                <span className="projectGroup__index mono">Group {group.index}</span>
                <h3>{group.label}</h3>
                <span className="projectGroup__count mono">
                  {group.items.length} {group.items.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
              <p>{group.blurb}</p>
              <span className="projectGroup__rule" aria-hidden="true" />
            </div>

            <div
              className={`projects__grid${group.key === 'internship' ? ' projects__grid--single' : ''}`}
            >
              {group.items.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  order={groupIndex * 5 + i}
                  onOpen={setOpen}
                />
              ))}
            </div>
          </div>
        ))}

        <ul className="projects__notes reveal">
          {projectNotes.map((note) => (
            <li key={note}>
              <span className="projects__noteDot" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      </div>

      {open && <ProjectModal project={open} onClose={close} />}
    </section>
  )
}
