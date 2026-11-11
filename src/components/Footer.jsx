import { profile } from '../data/profile.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <span className="footer__mark" aria-hidden="true" />
          <div>
            <strong>{profile.name}</strong>
            <span className="mono">{profile.title}</span>
          </div>
        </div>

        <p className="footer__line">{profile.tagline}</p>

        <div className="footer__right">
          <a href="#home">Back to top</a>
          <span className="mono">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
