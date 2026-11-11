import { useState } from 'react'
import { profile } from '../data/profile.js'
import SplitText from './SplitText.jsx'
import useRevealGroup from '../hooks/useRevealGroup.js'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const ref = useRevealGroup()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sent | copied

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please add your name.'
    if (!form.email.trim()) next.email = 'Please add an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'That email address looks incomplete.'
    if (!form.message.trim()) next.message = 'Please write a short message.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!validate()) {
      setStatus('idle')
      return
    }
    // No backend is wired up: the form hands the message to the visitor's
    // own email client through a mailto link, so nothing is silently lost.
    const subject = form.subject.trim() || `Portfolio enquiry from ${form.name.trim()}`
    const body = `${form.message.trim()}\n\n—\n${form.name.trim()}\n${form.email.trim()}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('sent')
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setStatus('copied')
      window.setTimeout(() => setStatus('idle'), 2200)
    } catch {
      setStatus('idle')
    }
  }

  return (
    <section id="contact" className="section" aria-labelledby="contact-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">08 — Contact</span>
          <h2 id="contact-title" className="splitText reveal" style={{ '--reveal-delay': '80ms' }}>
            <SplitText text="Let&rsquo;s build something worth showing." mode="chars" step="30ms" />
          </h2>
          <p>
            I am looking for OJT and internship placements, and I take freelance software work. Tell me
            what you are building and I will reply.
          </p>
        </div>

        <div className="contact__grid">
          <div className="contact__info">
            <div className="contact__card panel reveal">
              <span className="mono">Direct email</span>
              <button type="button" className="contact__email" onClick={copyEmail} aria-live="polite">
                {profile.email}
                <span className="contact__copyHint">
                  {status === 'copied' ? 'Copied' : 'Click to copy'}
                </span>
              </button>
              <a className="contact__mailLink" href={`mailto:${profile.email}`}>
                Or open your mail app
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </a>
            </div>

            <div className="contact__card panel reveal" style={{ '--reveal-delay': '90ms' }}>
              <span className="mono">Resume</span>
              <p>One page, listing the same projects and skills shown here.</p>
              <a className="btn btn--ghost contact__resume" href={profile.resumeHref} download={profile.resumeFileName}>
                Download Resume
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M6 2v7M3 6.5L6 9.5l3-3M2 11h8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </a>
            </div>

            <div className="contact__card panel reveal" style={{ '--reveal-delay': '140ms' }}>
              <span className="mono">Elsewhere</span>
              <ul className="contact__socials">
                <li>
                  <span>GitHub</span>
                  <em>Private repos — only Nexora is public</em>
                </li>
                <li>
                  <span>LinkedIn</span>
                  <em>No profile yet — reserved for later</em>
                </li>
              </ul>
              <a
                className="contact__mailLink"
                href="https://github.com/KeiShirogane1/Nexora"
                target="_blank"
                rel="noreferrer noopener"
              >
                Nexora on GitHub
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </a>
              <p className="contact__socialNote">
                Nexora is the only public repository. No placeholder social links are published — these stay
                open until there is a real profile to point at.
              </p>
            </div>
          </div>

          <form className="contact__form panel reveal" onSubmit={onSubmit} noValidate style={{ '--reveal-delay': '60ms' }}>
            <div className="contact__formHead">
              <span className="mono">Message form</span>
              <p>
                Submitting opens your own email app with the message ready to send — nothing is stored on
                this site.
              </p>
            </div>

            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'err-name' : undefined}
                placeholder="Your name"
              />
              {errors.name && (
                <span className="field__error" id="err-name">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'err-email' : undefined}
                placeholder="you@example.com"
              />
              {errors.email && (
                <span className="field__error" id="err-email">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="contact-subject">Subject <span className="field__optional">(optional)</span></label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={update('subject')}
                placeholder="Internship, project, or question"
              />
            </div>

            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={form.message}
                onChange={update('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'err-message' : undefined}
                placeholder="A short note about what you have in mind"
              />
              {errors.message && (
                <span className="field__error" id="err-message">
                  {errors.message}
                </span>
              )}
            </div>

            <div className="contact__formFoot">
              <button type="submit" className="btn btn--primary">
                Send Message
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 10L10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
              <span className="contact__formStatus" aria-live="polite">
                {status === 'sent' ? 'Opening your email app…' : ''}
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
