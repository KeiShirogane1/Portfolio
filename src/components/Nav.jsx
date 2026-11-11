import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/profile.js'

export default function Nav({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
        </div>
      </div>
    </>
  )
}
