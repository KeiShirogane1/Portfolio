import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks, profile } from '../data/profile.js'
import { sections } from '../data/sections.js'
import ShareSheet from './ShareSheet.jsx'

/**
 * IDEShell
 *
 * Wraps the whole portfolio in a code-editor frame:
 *
 *   [activity bar] [explorer] [ tabs | breadcrumb | page content ]
 *                              [ status bar ]
 *
 * The explorer tree IS the navigation. Clicking a "file" scrolls to the
 * matching section and opens it as the active tab, so there is one control
 * list, not two competing ones.
 *
 * Below 900px the explorer becomes a slide-over drawer opened from the
 * activity bar, so the page content keeps the full width of the phone.
 */

/* One page per nav link. The extension is part of the fiction: .jsx for the
   interactive sections, .md for prose, .json for structured data. */
/* Line numbers for the editor gutter. The page is long, so the list is a
   fixed run of numbers that rides with the scroll — a VS Code style margin. */
const LINE_NUMBERS = Array.from({ length: 600 }, (_, index) => index + 1)

const FILES = {
  home: { name: 'home.jsx', kind: 'jsx' },
  about: { name: 'about.md', kind: 'md' },
  activity: { name: 'activity.json', kind: 'json' },
  projects: { name: 'projects.jsx', kind: 'jsx' },
  system: { name: 'system-flow.jsx', kind: 'jsx' },
  skills: { name: 'skills.json', kind: 'json' },
  experience: { name: 'experience.md', kind: 'md' },
  education: { name: 'education.md', kind: 'md' },
  ai: { name: 'ai-experiments.jsx', kind: 'jsx' },
  certs: { name: 'certifications.md', kind: 'md' },
  contact: { name: 'contact.jsx', kind: 'contact' }
}

const KIND_COLOR = {
  jsx: 'var(--id-yellow)',
  md: 'var(--id-text)',
  json: 'var(--id-orange)',
  contact: 'var(--id-blue)'
}

function FileIcon({ kind }) {
  return (
    <svg
      className="ide__fileIcon"
      width="13"
      height="13"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ color: KIND_COLOR[kind] || 'var(--id-muted)' }}
    >
      {kind === 'json' ? (
        <path
          d="M5.5 2.5H4A1.5 1.5 0 0 0 2.5 4v1.2c0 .9-.4 1.3-1.1 1.3v.9c.7 0 1.1.4 1.1 1.3V10A1.5 1.5 0 0 0 4 11.5h1.5M10.5 2.5H12A1.5 1.5 0 0 1 13.5 4v1.2c0 .9.4 1.3 1.1 1.3v.9c-.7 0-1.1.4-1.1 1.3V10a1.5 1.5 0 0 1-1.5 1.5h-1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : kind === 'md' ? (
        <path
          d="M2.6 4.2h10.8v7.6H2.6z M4.6 9.6V6.4l1.3 1.6 1.3-1.6v3.2M10.2 6.4v3.2M9.3 8.5l.9 1.1.9-1.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10.8 7.6 5.6 2.9v2.6H2.4v4.2h3.2v2.6z M12.1 5.9h1.4l.4 4.4h-1.1l-.2-2.5-1 2.5h-.6l-.9-2.5-.2 2.5H8.8l.4-4.4h1.4l.7 1.7z"
          fill="currentColor"
          opacity="0.95"
        />
      )}
    </svg>
  )
}

function Chevron({ open }) {
  return (
    <svg
      className="ide__chevron"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      data-open={open}
    >
      <path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/* The five activity-bar glyphs: explorer, search, source control, projects,
   contact. Only the first and the last do something real; the middle ones
   scroll to their own section so nothing is a dead button. */
const ACTIVITIES = [
  { key: 'files', label: 'Explorer', target: null },
  { key: 'search', label: 'Search', target: 'skills' },
  { key: 'source', label: 'Source control', target: 'activity' },
  { key: 'run', label: 'Projects', target: 'projects' },
  { key: 'person', label: 'Contact', target: 'contact' }
]

function ActivityIcon({ name }) {
  const paths = {
    files: 'M2.5 1.8h5.2L12.4 6v8.2H2.5z M7.7 1.8V6h4.6',
    search: 'M7 2.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6z M10.6 10.6 14 14',
    source: 'M4 2.6v5.2a2.4 2.4 0 0 0 2.4 2.4H10 M11.4 2.6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M11.4 8.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M4 .9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    run: 'M4.2 2.8h7.6a1.6 1.6 0 0 1 1.6 1.6v7.6a1.6 1.6 0 0 1-1.6 1.6H4.2a1.6 1.6 0 0 1-1.6-1.6V4.4A1.6 1.6 0 0 1 4.2 2.8z M2.6 6.4h10.8 M5.6 2.8v3.6',
    person: 'M8 2.4a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z M2.8 14c0-2.9 2.3-4.7 5.2-4.7s5.2 1.8 5.2 4.7'
  }
  return (
    <svg width="19" height="19" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function IDEShell({ activeSection, progressBar, children }) {
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [treeOpen, setTreeOpen] = useState({ src: true, pages: true })
  const [scrollTop, setScrollTop] = useState(0)
  const viewportRef = useRef(null)
  const frameRef = useRef(0)
  /* Line numbers ride along with the content: the gutter is fixed, only its
     inner list moves. rAF keeps it to one write per frame. */
  const onScroll = useCallback((event) => {
    const top = event.currentTarget.scrollTop
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      setScrollTop(top)
    })
  }, [])

  const active = sections.find((link) => link.id === activeSection) || sections[0]
  const activeFile = FILES[active.id] || FILES.home

  /* Escape closes the drawer; the page underneath must not scroll behind it. */
  useEffect(() => {
    if (!explorerOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') setExplorerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [explorerOpen])

  /* Any viewport wide enough for the real sidebar closes the drawer, so it
     cannot stay stuck open behind the desktop layout. */
  useEffect(() => {
    const query = window.matchMedia('(min-width: 901px)')
    const onChange = (event) => {
      if (event.matches) setExplorerOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const go = (id) => {
    setExplorerOpen(false)
    const target = document.getElementById(id)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pages = sections

  return (
    <div className="ide" data-explorer={explorerOpen}>
      {/* ---------- Activity bar ---------- */}
      <div className="ide__activity" role="toolbar" aria-label="Activity bar">
        {ACTIVITIES.map((item) => (
          <button
            key={item.key}
            type="button"
            className="ide__activityBtn"
            data-active={item.key === 'files'}
            aria-label={item.label}
            title={item.label}
            onClick={() => {
              if (item.key === 'files') {
                setExplorerOpen((v) => !v)
              } else if (item.target) {
                go(item.target)
              }
            }}
            aria-expanded={item.key === 'files' ? explorerOpen : undefined}
          >
            <ActivityIcon name={item.key} />
          </button>
        ))}
        <span className="ide__activitySpacer" />
        <button
          type="button"
          className="ide__activityBtn"
          aria-label="Share this portfolio"
          title="Share this portfolio"
          onClick={() => setShareOpen(true)}
        >
          <svg width="19" height="19" viewBox="0 0 16 16" aria-hidden="true" fill="none">
            <path
              d="M11.6 5.4a1.9 1.9 0 1 0-1.8-2.5L6.2 4.7a1.9 1.9 0 1 0 0 2.6l3.6 1.8a1.9 1.9 0 1 0 .8-1.2L7 6.1"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ---------- Explorer ---------- */}
      <aside
        className="ide__explorer"
        aria-label="Explorer"
        aria-hidden={false}
      >
        <div className="ide__explorerHead">
          <span className="ide__explorerTitle">Explorer</span>
          <button
            type="button"
            className="ide__drawerClose"
            onClick={() => setExplorerOpen(false)}
            aria-label="Close explorer"
          >
            ✕
          </button>
        </div>

        <div className="ide__panel">
          <div className="ide__panelHead">
            <span className="ide__panelTitle">
              <Chevron open={treeOpen.src} />
              <button
                type="button"
                className="ide__treeToggle"
                onClick={() => setTreeOpen((s) => ({ ...s, src: !s.src }))}
                aria-expanded={treeOpen.src}
              >
                portfolio
              </button>
            </span>
          </div>

          <div className="ide__tree" data-open={treeOpen.src}>
            <div className="ide__treeGroup">
              <span className="ide__treeGroupHead">
                <Chevron open={treeOpen.pages} />
                <button
                  type="button"
                  className="ide__treeToggle"
                  onClick={() => setTreeOpen((s) => ({ ...s, pages: !s.pages }))}
                  aria-expanded={treeOpen.pages}
                >
                  src
                </button>
              </span>

              <ul
                className="ide__fileList"
                data-open={treeOpen.pages}
                role="list"
              >
                {pages.map((link) => {
                  const file = FILES[link.id] || { name: link.id, kind: 'md' }
                  return (
                    <li key={link.id}>
                      <button
                        type="button"
                        className="ide__file"
                        data-current={activeSection === link.id}
                        onClick={() => go(link.id)}
                        aria-current={activeSection === link.id ? 'true' : undefined}
                      >
                        <FileIcon kind={file.kind} />
                        <span className="ide__fileName">{file.name}</span>
                        {activeSection === link.id && (
                          <span className="ide__fileDot" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="ide__treeLeaf">
              <FileIcon kind="json" />
              <span>portfolio.json</span>
            </div>
            <div className="ide__treeLeaf">
              <FileIcon kind="md" />
              <span>README.md</span>
            </div>
          </div>
        </div>

        <div className="ide__explorerFoot">
          <a className="ide__sideBtn" href={profile.resumeHref} download>
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path
                d="M8 2v8m0 0 3-3m-3 3L5 7M2.6 12.4v1.2h10.8v-1.2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            resume.pdf
          </a>
          <a className="ide__sideBtn ide__sideBtn--ghost" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
      </aside>

      <div
        className="ide__scrim"
        onClick={() => setExplorerOpen(false)}
        aria-hidden="true"
      />

      {/* ---------- Editor ---------- */}
      <div className="ide__editor">
        <div className="ide__tabs" role="tablist" aria-label="Open pages">
          <button
            type="button"
            className="ide__tabsToggle"
            onClick={() => setExplorerOpen((v) => !v)}
            aria-label="Open explorer"
            aria-expanded={explorerOpen}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path
                d="M2.5 4h11M2.5 8h11M2.5 12h11"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="ide__tab" data-active="true">
            <FileIcon kind={activeFile.kind} />
            <span className="ide__tabName">{activeFile.name}</span>
            <span className="ide__tabMark" aria-hidden="true">
              ✕
            </span>
          </div>
          <div className="ide__tabFade" aria-hidden="true" />
        </div>

        {/* Scroll hairline, inside the editor column so it never reaches the
            explorer or the activity bar. */}
        {progressBar}

        <div className="ide__crumbs" aria-hidden="true">
          <span>portfolio</span>
          <span className="ide__crumbSep">›</span>
          <span>src</span>
          <span className="ide__crumbSep">›</span>
          <span className="ide__crumbFile">{activeFile.name}</span>
          <span className="ide__crumbSep">›</span>
          <span className="ide__crumbSymbol">{active.label.replace(/\s+/g, '')}</span>
        </div>

        <div className="ide__code">
          <div className="ide__gutter" aria-hidden="true">
            <div className="ide__gutterInner" style={{ transform: `translateY(${-scrollTop}px)` }}>
              {LINE_NUMBERS.map((line) => (
                <span key={line} className="ide__lineNo">
                  {line}
                </span>
              ))}
            </div>
          </div>

          <div className="ide__viewport" ref={viewportRef} onScroll={onScroll}>
            {children}
          </div>
        </div>

        {/* ---------- Status bar ---------- */}
        <div className="ide__status" role="contentinfo">
          <div className="ide__statusLeft">
            <button
              type="button"
              className="ide__statusBtn"
              onClick={() => setExplorerOpen((v) => !v)}
              aria-label="Toggle explorer"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                <path
                  d="M2.4 2.6h5.2L12 5.8v8.2H2.4z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="ide__statusItem ide__statusBranch">
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                <path
                  d="M4.6 3.4v5.2a2 2 0 0 0 2 2h3.4M11 2.4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM11 8.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM4.6 2.1a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              main
            </span>
            <span className="ide__statusItem">0 errors</span>
            <span className="ide__statusItem ide__statusHide">486h OJT</span>
          </div>
          <div className="ide__statusRight">
            <span className="ide__statusItem ide__statusHide">UTF-8</span>
            <span className="ide__statusItem ide__statusHide">LF</span>
            <span className="ide__statusItem">{active.label}</span>
            <span className="ide__statusItem ide__statusBell" aria-hidden="true">
              ●
            </span>
          </div>
        </div>
      </div>

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
