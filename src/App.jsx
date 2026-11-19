import { useEffect, useState } from 'react'
import IDEShell from './components/IDEShell.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import ContributionGraph from './components/ContributionGraph.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import AIExperiments from './components/AIExperiments.jsx'
import Certifications from './components/Certifications.jsx'
import Contact from './components/Contact.jsx'
import BootScreen from './components/BootScreen.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { sections } from './data/sections.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [progress, setProgress] = useState(0)

  /* Track the current section for the explorer, plus scroll progress.
     Both observe the editor pane, because that is what scrolls now — the
     window itself never moves. */
  useEffect(() => {
    /* The editor pane only exists once the boot screen is gone. Running this
       before that makes the observer fall back to the window, which never
       scrolls here, so the active file would stay on home forever. */
    if (!ready) return

    const pane = document.querySelector('.ide__viewport')
    const sectionEls = sections
      .map((link) => document.getElementById(link.id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      {
        root: pane || null,
        rootMargin: '-30% 0px -45% 0px',
        threshold: [0.05, 0.25, 0.5]
      }
    )

    sectionEls.forEach((section) => observer.observe(section))

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        // The page content now scrolls inside the editor pane, so progress
        // has to be read from that element, not from the window.
        const pane = document.querySelector('.ide__viewport')
        if (!pane) {
          setProgress(0)
          return
        }
        const max = pane.scrollHeight - pane.clientHeight
        setProgress(max > 0 ? Math.min(1, pane.scrollTop / max) : 0)
      })
    }
    onScroll()

    if (pane) pane.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      if (pane) pane.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [ready])

  return (
    <>
      {!ready ? (
        <BootScreen onReady={() => setReady(true)} />
      ) : (
        <ErrorBoundary>
          <>
            <IDEShell
              activeSection={activeSection}
              progressBar={
                <div className="progress" aria-hidden="true">
                  <span style={{ transform: `scaleX(${progress})` }} />
                </div>
              }
            >
              <Hero />
              <About />
              <ContributionGraph />
              <Projects />
              <Skills />
              <Experience />
              <AIExperiments />
              <Education />
              <Certifications />
              <Contact />
            </IDEShell>
          </>
        </ErrorBoundary>
      )}
    </>
  )
}
