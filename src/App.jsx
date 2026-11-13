import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import AIExperiments from './components/AIExperiments.jsx'
import Certifications from './components/Certifications.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BootScreen from './components/BootScreen.jsx'
import { navLinks } from './data/profile.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [progress, setProgress] = useState(0)

  /* Track the current section for the nav, plus scroll progress. */
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: [0.05, 0.25, 0.5] }
    )

    sections.forEach((section) => observer.observe(section))

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      {!ready ? (
        <BootScreen onReady={() => setReady(true)} />
      ) : (
        <>
          <div className="progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>

          <Nav activeSection={activeSection} />

          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Education />
            <AIExperiments />
            <Certifications />
            <Contact />
          </main>

          <Footer />
        </>
      )}
    </>
  )
}
