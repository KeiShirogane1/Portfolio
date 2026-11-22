import useRevealGroup from '../hooks/useRevealGroup.js'
import { eyebrow } from '../data/sections.js'
import SplitText from './SplitText.jsx'

/* ----------------------------------------------------------------------------
   SYSTEM FLOW — the node graph, drawn like the reference:

   One horizontal run across the top (trigger → build → Cloudflare → branch),
   Success/Failure stacked on the far right, dashed drops down to resources
   underneath. Every shape is fill and shadow only — no borders anywhere.
   -------------------------------------------------------------------------- */

const ICONS = {
  github: '/icons/brands/github.svg',
  cloudflare: '/icons/brands/cloudflare.svg',
  react: '/icons/brands/react.svg',
  nodejs: '/icons/brands/nodejs.svg',
  postgresql: '/icons/brands/postgresql.svg',
  powershell: '/icons/brands/powershell.svg'
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <path d="M13.4 2.2 5.6 13.1h5.1L9.4 21.8 18 10.6h-5.3z" fill="#7c9cff" stroke="#7c9cff" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function Plate({ size = 'md', tone = 'dark', children }) {
  const base = 'flowPlate flowPlate--' + tone
  return (
    <span className={size === 'big' ? base + ' flowPlate--big' : base} aria-hidden="true">
      {children}
    </span>
  )
}

function BrandGlyph({ name }) {
  const src = ICONS[name]
  if (!src) {
    return <span className="flowGlyph flowGlyph--code" aria-hidden="true">{'</>'}</span>
  }
  return <img className="flowGlyph" src={src} alt="" width="22" height="22" loading="lazy" />
}

function Node({ icon, label, note, className = '', plateSize = 'md' }) {
  return (
    <div className={'flowNode ' + className}>
      <Plate size={plateSize}>
        {icon ? <BrandGlyph name={icon} /> : null}
      </Plate>
      <h3 className="flowNode__label">{label}</h3>
      {note ? <p className="flowNode__note">{note}</p> : null}
    </div>
  )
}

function Link({ word }) {
  return (
    <div className="flowLinkCell">
      {word ? <span className="flowLinkWord">{word}</span> : null}
      <span className="flowLink" aria-hidden="true" />
    </div>
  )
}

function Resource({ icon, label, note }) {
  return (
    <div className="flowResource">
      <span className="flowDrop" aria-hidden="true" />
      <Plate size="sm">
        {icon ? <BrandGlyph name={icon} /> : null}
      </Plate>
      <h3 className="flowNode__label">{label}</h3>
      {note ? <p className="flowNode__note">{note}</p> : null}
    </div>
  )
}

export default function SystemFlow() {
  const ref = useRevealGroup()

  return (
    <section id="system" className="section flowSection" aria-labelledby="system-title" ref={ref}>
      <div className="shell">
        <div className="sectionHead reveal">
          <span className="eyebrow">{eyebrow('system')}</span>
          <h2 id="system-title" className="splitText reveal" style={{ '--reveal-delay': '60ms' }}>
            <SplitText text="How the page reaches the internet." mode="chars" step="34ms" />
          </h2>
          <p>
            One request, followed from the moment a browser asks for this portfolio to the moment a
            page comes back. Dashed lines are resources a service depends on; solid lines are the
            order things run in.
          </p>
        </div>

        <figure className="flow reveal" style={{ '--reveal-delay': '120ms' }}>
          <div className="flow__label">
            <span className="flow__labelTitle">Deploy pipeline</span>
            <span className="flow__labelNote">Static assets over Cloudflare, data refreshed nightly</span>
          </div>

          <div className="flowRun reveal" style={{ '--reveal-delay': '320ms' }}>
            {/* main chain */}
            <Node plateSize="big" label="Push to bbmain" note="A commit lands" className="flowNode--trigger" />
            <Link word="source" />
            <Node icon="github" label="Build" note="Vite compiles the site" className="flowNode--chain" />
            <Link word="role" />
            <Node icon="cloudflare" label="Cloudflare" note="Worker serves dist" className="flowNode--chain" />

            {/* branch + outcomes */}
            <div className="flowBranch">
              <div className="flowBranchRow">
                <span className="flowBranchWord">true</span>
                <span className="flowLink" aria-hidden="true" />
              </div>
              <div className="flowBranchRow">
                <span className="flowBranchWord">false</span>
                <span className="flowLink" aria-hidden="true" />
              </div>
            </div>

            <div className="flowOutcomes">
              <div className="flowOutcome flowOutcome--ok">
                <Node icon="react" tone="ok" label="Success" note="Assets served" />
              </div>
              <div className="flowOutcome flowOutcome--fail">
                <Node icon="react" tone="fail" label="Failure" note="Retry in Actions" />
              </div>
            </div>
          </div>

          {/* resources row underneath */}
          <div className="flowResources">
            <Resource icon="nodejs" label="Actions job" note="Runs the refresh" />
            <Resource icon="postgresql" label="Contribution data" note="Committed JSON" />
            <Resource icon="powershell" label="Local builder" note="Runs on this PC" />
          </div>

          <figcaption className="flow__caption">
            Deploy notes and the request path are written up in{' '}
            <span className="flow__captionFile">generated/connection-notes.md</span>.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}