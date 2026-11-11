import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/profile.js'
import ShareSheet from './ShareSheet.jsx'

export default function Nav({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 981px)')
    const onChange = (event) => {
      if (event.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Lock scrolling and allow Escape to close while the menu is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <a className="skipLink" href="#about">
        Skip to content
      </a>

      <header className="nav" data-scrolled={scrolled} data-open={open}>
        <div className="nav__inner shell">
          <a className="nav__brand" href="#home" aria-label="Mark John Rey — back to top">
            <span className="nav__mark" aria-hidden="true">
              <span className="nav__markRing" />
              <span className="nav__markDot" />
            </span>
            <span className="nav__brandText">
              <strong>{profile.shortName}</strong>
              <small>Software Developer</small>
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="nav__link"
                data-current={activeSection === link.id}
              >
                <span className="nav__linkIndex">{link.index}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__share"
              onClick={() => setShareOpen(true)}
              aria-label="Share this portfolio"
              aria-haspopup="dialog"
              title="Share this portfolio"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path
                  d="M18 8a3 3 0 1 0-2.8-4.1L8.9 6.9a3 3 0 1 0 0 4.2l7.3 3.6A3 3 0 1 0 18 16a3 3 0 0 0-2.2 1l-7.1-3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="nav__shareText">Share</span>
            </button>
            <a className="nav__cta" href="#contact">
              Hire / Intern
            </a>
            <button
              type="button"
              className="nav__toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />

      <div id="mobile-menu" className="menu" data-open={open} aria-hidden={!open}>
        <div className="menu__head shell">
          <span className="mono">Navigation</span>
          <button type="button" className="menu__close" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <nav className="menu__list shell" aria-label="Mobile">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="menu__link"
              style={{ '--i': i }}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <span className="menu__index">{link.index}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu__foot shell">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <span className="mono">{profile.location}</span>
          <button
            type="button"
            className="menu__share"
            onClick={() => {
              setOpen(false)
              setShareOpen(true)
            }}
          >
            Share this portfolio
          </button>
        </div>
      </div>
    </>
  )
}
