import useRevealGroup from '../hooks/useRevealGroup.js'
import { eyebrow } from '../data/sections.js'
import SplitText from './SplitText.jsx'

/* ----------------------------------------------------------------------------
   SYSTEM — Source-of-truth QwerNFC architecture (GReview + TimeCapsule).
   Two independent applications with separate backends, data authorities, and
   security models, sharing only static public-router hosting on
   TheNFCGuy.github.io (with separate subpaths).
   -------------------------------------------------------------------------- */

const ICONS = {
  capacitor: '/icons/brands/capacitor.svg',
  cloudflare: '/icons/brands/cloudflare.svg',
  github: '/icons/brands/github.svg',
  json: '/icons/brands/json.svg',
  sqlite: '/icons/brands/sqlite.svg'
}

function Glyph({ icon, size = 24 }) {
  const src = ICONS[icon]
  if (!src) return null
  return <img className="sysGlyph" src={src} alt="" width={size} height={size} loading="lazy" />
}

function BoltGlyph({ color = '#ef5b5b' }) {
  return (
    <svg className="sysTriggerBolt" width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
      <path d="M8.2 1 2 9h4.4L5.2 15 12 7H7.6L8.2 1Z" fill={color} />
    </svg>
  )
}

function ScanGlyph({ muted = false }) {
  const stroke = muted ? '#929bad' : '#8ea4ff'
  const fill = muted ? '#929bad' : '#f4f6fa'
  return (
    <svg className="sysGlyph" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
        stroke={stroke}
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <rect x="8" y="8" width="3" height="3" rx="0.6" fill={fill} />
      <rect x="13" y="8" width="3" height="3" rx="0.6" fill={fill} />
      <rect x="8" y="13" width="3" height="3" rx="0.6" fill={fill} />
      <path d="M13 13h3v3h-3z" fill={stroke} />
    </svg>
  )
}

function DestinationGlyph() {
  return (
    <svg className="sysGlyph" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 5h5v5M19 5l-8.5 8.5M18 13v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18V7.5A1.5 1.5 0 0 1 5.5 6H11"
        stroke="#4ade80"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FirebaseGlyph() {
  return (
    <svg className="sysGlyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.2 17.5 8.4 4.2c.1-.7 1-.9 1.4-.3l2.4 4.3 2.7-2.6c.5-.5 1.3-.2 1.4.4l1.6 11.5L12 20.8l-5.8-3.3Z"
        stroke="#e08a5a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailGlyph() {
  return (
    <svg className="sysGlyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="#6aa6ff" strokeWidth="1.6" />
      <path d="m4.5 7 7.5 5.5L19.5 7" stroke="#6aa6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CameraGlyph() {
  return (
    <svg className="sysGlyph" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.3-2h6l1.3 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        stroke="#4cc9b8"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="#f4f6fa" strokeWidth="1.5" />
    </svg>
  )
}

function GalleryGlyph() {
  return (
    <svg className="sysGlyph" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="#8ea4ff" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.4" fill="#f4f6fa" />
      <path d="m5.5 17 4.2-4.2 3.1 3 2.5-2.3L18.5 17" stroke="#4cc9b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DriveGlyph() {
  return (
    <svg className="sysGlyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.8 5h6.4l5.3 9.2-3.1 5.3H6.6l-3.1-5.3L8.8 5Z"
        stroke="#4cc9b8"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M9.5 14.5h9.8M8.8 5l4.8 8.3" stroke="#8ea4ff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function OAuthGlyph() {
  return (
    <svg className="sysGlyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.8 18.5 6.5v5.2c0 4.1-2.8 7.3-6.5 8.5-3.7-1.2-6.5-4.4-6.5-8.5V6.5L12 3.8Z"
        stroke="#e2c08d"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" stroke="#f4f6fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocalDeviceGlyph() {
  return (
    <svg className="sysGlyph" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3.5" width="10" height="17" rx="2" stroke="#4cc9b8" strokeWidth="1.6" />
      <path d="M10.5 17.5h3" stroke="#f4f6fa" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GlobeLinkGlyph() {
  return (
    <svg className="sysGlyph" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="#4cc9b8" strokeWidth="1.55" />
      <path d="M4.5 12h15M12 4a11 11 0 0 1 0 16M12 4a11 11 0 0 0 0 16" stroke="#8ea4ff" strokeWidth="1.35" />
    </svg>
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
            <SplitText text="How the site connects to its services." mode="chars" step="34ms" />
          </h2>
          <p>
            Verified architecture across QwerNFC’s two independent products. GReview and TimeCapsule
            use separate Cloudflare Workers, databases, and authentication models — sharing only
            static public-router hosting on <code className="sysCode">TheNFCGuy.github.io</code>{' '}
            under distinct subpaths.
          </p>
        </div>

        <figure className="sysGraph reveal" style={{ '--reveal-delay': '120ms' }}>
          <span className="sysScrollHint mono" aria-hidden="true">
            scroll workflows →
          </span>

          <div className="sysTracks">
            {/* ==============================================================
                TRACK 01 — QwerNFC GReview
               ============================================================== */}
            <div className="sysTrack">
              <div className="sysTrackHead">
                <span className="sysTrackBadge mono">01 · GReview</span>
                <span className="sysTrackSub">Permanent QR / NFC management &amp; customer routing</span>
              </div>

              <div className="sysSubflows">
                {/* ---------- 1A. Admin Operations ---------- */}
                <div className="sysSubflow">
                  <span className="sysSubLabel mono">A · Admin operations</span>
                  <div className="sysScroll">
                    <div
                      className="sysBoard sysBoard--340"
                      role="img"
                      aria-label="GReview admin flow: Capacitor Admin App sends HTTPS requests to qwernfc-api Cloudflare Worker, which commits canonical QR records to GitHub JSON, stores operational and security state in Durable Objects SQLite, mirrors backups and reads Manager identity from Firebase RTDB, sends OTP and approval emails via Brevo, and publishes route updates to TheNFCGuy.github.io."
                    >
                      <svg className="sysEdges" viewBox="0 0 960 340" width="960" height="340" aria-hidden="true">
                        <defs>
                          <marker
                            id="sysArrow1A"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="rgba(244, 246, 250, 0.58)" />
                          </marker>
                        </defs>

                        <path className="sysContour" d="M 104 14 C 140 82, 70 162, 16 206" />

                        {/* Solid admin flow */}
                        <path className="sysEdge" d="M 128 88 L 266 88" markerEnd="url(#sysArrow1A)" />
                        <path className="sysEdge" d="M 536 88 L 696 88" markerEnd="url(#sysArrow1A)" />
                        <text className="sysEdgeLabel" x="576" y="76">
                          publish routes
                        </text>

                        {/* Dashed data, backup/auth, and email dependencies */}
                        <path className="sysEdgeDashed" d="M 312 150 C 312 184, 192 180, 192 210" />
                        <path className="sysEdgeDashed" d="M 372 150 C 372 184, 342 180, 342 210" />
                        <path className="sysEdgeDashed" d="M 432 150 C 432 184, 492 180, 492 210" />
                        <path className="sysEdgeDashed" d="M 492 150 C 492 184, 642 180, 642 210" />
                      </svg>

                      <div className="sysNode sysNode--trigger" style={{ left: 44, top: 50 }}>
                        <BoltGlyph color="#ef5b5b" />
                        <Glyph icon="capacitor" size={26} />
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 84, top: 132 }}>
                        <h3>Admin App</h3>
                        <p>Capacitor · Web</p>
                      </div>

                      <div className="sysNode sysNode--hub260" style={{ left: 272, top: 50 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="cloudflare" size={28} />
                        <div className="sysHubText">
                          <h3>qwernfc-api</h3>
                          <p>Cloudflare Worker · RBAC</p>
                        </div>
                        <span className="sysPort sysPort--out" aria-hidden="true" />

                        <span className="sysPortDiamond" style={{ left: 40 }} aria-hidden="true" />
                        <span className="sysPortDiamond" style={{ left: 100 }} aria-hidden="true" />
                        <span className="sysPortDiamond" style={{ left: 160 }} aria-hidden="true" />
                        <span className="sysPortDiamond" style={{ left: 220 }} aria-hidden="true" />

                        <span className="sysPortTag" style={{ left: 40 }}>
                          GitHub JSON
                        </span>
                        <span className="sysPortTag" style={{ left: 100 }}>
                          DO SQLite
                        </span>
                        <span className="sysPortTag" style={{ left: 160 }}>
                          Firebase
                        </span>
                        <span className="sysPortTag" style={{ left: 220 }}>
                          Brevo
                        </span>
                      </div>

                      <div className="sysNode sysNode--square" style={{ left: 702, top: 50 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="github" size={28} />
                      </div>
                      <div className="sysLabel" style={{ left: 740, top: 132 }}>
                        <h3>TheNFCGuy.github.io</h3>
                        <p>Public route updates</p>
                      </div>

                      <div className="sysCircle" style={{ left: 162, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <Glyph icon="json" size={22} />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 192, top: 280 }}>
                        <h3>GitHub JSON</h3>
                        <p>Primary QR DB · docs/qrs.json</p>
                      </div>

                      <div className="sysCircle" style={{ left: 312, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <Glyph icon="sqlite" size={22} />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 342, top: 280 }}>
                        <h3>Durable Objects</h3>
                        <p>SQLite · PIN, OTP, state, images</p>
                      </div>

                      <div className="sysCircle" style={{ left: 462, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <FirebaseGlyph />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 492, top: 280 }}>
                        <h3>Firebase RTDB</h3>
                        <p>Backup + Manager control plane</p>
                      </div>

                      <div className="sysCircle" style={{ left: 612, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <MailGlyph />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 642, top: 280 }}>
                        <h3>Brevo Email</h3>
                        <p>OTP &amp; approval transport</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------- 1B. Customer QR / NFC Resolution ---------- */}
                <div className="sysSubflow">
                  <span className="sysSubLabel mono">B · Customer QR / NFC resolution</span>
                  <div className="sysScroll">
                    <div
                      className="sysBoard sysBoard--276"
                      role="img"
                      aria-label="GReview customer scan flow: Physical QR or NFC opens legacy keishirogane1.github.io compatibility page, which probes qwernfc-api to read canonical GitHub JSON and redirect to the assigned destination, or falls back via dashed path to TheNFCGuy.github.io route.json and fallback.json if the Worker is unavailable."
                    >
                      <svg className="sysEdges" viewBox="0 0 960 276" width="960" height="276" aria-hidden="true">
                        <defs>
                          <marker
                            id="sysArrow1B"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="rgba(244, 246, 250, 0.58)" />
                          </marker>
                          <marker
                            id="sysArrow1BFallback"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="rgba(142, 164, 255, 0.65)" />
                          </marker>
                        </defs>

                        {/* Entry → Legacy Pages */}
                        <path className="sysEdge" d="M 128 114 L 222 114" markerEnd="url(#sysArrow1B)" />

                        {/* Primary solid path: Legacy Pages → qwernfc-api → Destination */}
                        <path
                          className="sysEdge"
                          d="M 308 98 C 362 98, 376 58, 434 58"
                          markerEnd="url(#sysArrow1B)"
                        />
                        <text className="sysEdgeLabel" x="336" y="64">
                          worker ok
                        </text>
                        <path
                          className="sysEdge"
                          d="M 668 58 C 722 58, 732 100, 780 100"
                          markerEnd="url(#sysArrow1B)"
                        />

                        {/* Dashed fallback path: Legacy Pages → TheNFCGuy.github.io → Destination */}
                        <path
                          className="sysEdgeDashed"
                          d="M 308 130 C 362 130, 376 174, 434 174"
                          markerEnd="url(#sysArrow1BFallback)"
                        />
                        <text className="sysEdgeLabel" x="342" y="168">
                          fallback
                        </text>
                        <path
                          className="sysEdgeDashed"
                          d="M 668 174 C 722 174, 732 128, 780 128"
                          markerEnd="url(#sysArrow1BFallback)"
                        />
                      </svg>

                      <div className="sysNode sysNode--trigger" style={{ left: 44, top: 76 }}>
                        <BoltGlyph color="#ef5b5b" />
                        <ScanGlyph />
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 84, top: 158 }}>
                        <h3>Physical QR / NFC</h3>
                        <p>keishirogane1.github.io</p>
                      </div>

                      <div className="sysNode sysNode--square" style={{ left: 228, top: 76 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="github" size={28} />
                        <span className="sysPort sysPort--out" style={{ top: 22 }} aria-hidden="true" />
                        <span className="sysPort sysPort--out" style={{ top: 54 }} aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 266, top: 158 }}>
                        <h3>Legacy Pages</h3>
                        <p>Probes Worker resolver</p>
                      </div>

                      <div className="sysNode sysNode--hub224" style={{ left: 440, top: 20 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="cloudflare" size={28} />
                        <div className="sysHubText">
                          <h3>qwernfc-api</h3>
                          <p>Reads canonical GitHub JSON</p>
                        </div>
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>

                      <div className="sysNode sysNode--hub224 sysNode--fallback" style={{ left: 440, top: 136 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="github" size={26} />
                        <div className="sysHubText">
                          <h3>TheNFCGuy.github.io</h3>
                          <p>route.json → fallback.json</p>
                        </div>
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>

                      <div className="sysNode sysNode--square sysNode--ok" style={{ left: 786, top: 76 }}>
                        <span className="sysPort sysPort--in" style={{ top: 24 }} aria-hidden="true" />
                        <span className="sysPort sysPort--in" style={{ top: 52 }} aria-hidden="true" />
                        <DestinationGlyph />
                      </div>
                      <div className="sysLabel" style={{ left: 824, top: 158 }}>
                        <h3>Destination</h3>
                        <p>HTTP 302 · review URL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================================================
                TRACK 02 — QwerNFC TimeCapsule (Staging)
               ============================================================== */}
            <div className="sysTrack">
              <div className="sysTrackHead">
                <span className="sysTrackBadge sysTrackBadge--teal mono">02 · TimeCapsule</span>
                <span className="sysStageBadge mono">STAGING</span>
                <span className="sysTrackSub">Event camera &amp; gallery · local device + cloud sync</span>
              </div>

              <div className="sysSubflows">
                {/* ---------- 2A. Organizer & Android App ---------- */}
                <div className="sysSubflow">
                  <span className="sysSubLabel mono">A · Organizer &amp; Android app</span>
                  <div className="sysScroll">
                    <div
                      className="sysBoard sysBoard--330"
                      role="img"
                      aria-label="TimeCapsule organizer flow: Capacitor Android app runs camera, QR, NFC, and local event store on-device, and communicates with qwernfc-timecapsule-staging Cloudflare Worker backed by Google OAuth, Cloudflare D1 WEDDINGS_DB, and Google Drive. Permanent QWED physical QR issuance is implemented in code but disabled in staging."
                    >
                      <svg className="sysEdges" viewBox="0 0 960 330" width="960" height="330" aria-hidden="true">
                        <defs>
                          <marker
                            id="sysArrow2A"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="rgba(244, 246, 250, 0.58)" />
                          </marker>
                        </defs>

                        {/* Android App → Staging Worker */}
                        <path className="sysEdge" d="M 128 88 L 266 88" markerEnd="url(#sysArrow2A)" />
                        <text className="sysEdgeLabel" x="166" y="76">
                          API / probe
                        </text>

                        {/* Disabled QWED QR issuance callout */}
                        <path className="sysEdgeDashed sysEdgeDashed--muted" d="M 536 88 L 696 88" />
                        <text className="sysEdgeLabel" x="580" y="76">
                          gated / disabled
                        </text>

                        {/* On-device local dependency */}
                        <path className="sysEdgeDashed sysEdgeDashed--local" d="M 84 172 L 84 210" />

                        {/* Cloud dependencies under Worker */}
                        <path className="sysEdgeDashed" d="M 322 150 C 322 184, 252 180, 252 210" />
                        <path className="sysEdgeDashed" d="M 402 150 L 402 210" />
                        <path className="sysEdgeDashed" d="M 482 150 C 482 184, 552 180, 552 210" />
                      </svg>

                      <div className="sysNode sysNode--trigger" style={{ left: 44, top: 50 }}>
                        <BoltGlyph color="#4cc9b8" />
                        <Glyph icon="capacitor" size={26} />
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 84, top: 132 }}>
                        <h3>Android App</h3>
                        <p>Capacitor · PIN lock</p>
                      </div>

                      <div className="sysCircle sysCircle--local" style={{ left: 54, top: 214 }}>
                        <span className="sysPort sysPort--top sysPort--local" aria-hidden="true" />
                        <LocalDeviceGlyph />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 84, top: 280 }}>
                        <h3>On-Device Local</h3>
                        <p>Camera · QR · NFC · Store</p>
                      </div>

                      <div className="sysNode sysNode--hub260" style={{ left: 272, top: 50 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="cloudflare" size={28} />
                        <div className="sysHubText">
                          <h3>TimeCapsule Worker</h3>
                          <p>qwernfc-timecapsule-staging</p>
                        </div>
                        <span className="sysPort sysPort--out" aria-hidden="true" />

                        <span className="sysPortDiamond" style={{ left: 50 }} aria-hidden="true" />
                        <span className="sysPortDiamond" style={{ left: 130 }} aria-hidden="true" />
                        <span className="sysPortDiamond" style={{ left: 210 }} aria-hidden="true" />

                        <span className="sysPortTag" style={{ left: 50 }}>
                          OAuth
                        </span>
                        <span className="sysPortTag" style={{ left: 130 }}>
                          D1
                        </span>
                        <span className="sysPortTag" style={{ left: 210 }}>
                          Drive
                        </span>
                      </div>

                      <div className="sysNode sysNode--square sysNode--disabled" style={{ left: 702, top: 50 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <ScanGlyph muted />
                      </div>
                      <div className="sysLabel" style={{ left: 740, top: 132 }}>
                        <h3>QWED Physical QR</h3>
                        <p>Disabled in staging</p>
                      </div>

                      <div className="sysCircle" style={{ left: 222, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <OAuthGlyph />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 252, top: 280 }}>
                        <h3>Google OAuth</h3>
                        <p>Admin &amp; Drive consent</p>
                      </div>

                      <div className="sysCircle" style={{ left: 372, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <Glyph icon="sqlite" size={22} />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 402, top: 280 }}>
                        <h3>Cloudflare D1</h3>
                        <p>WEDDINGS_DB · metadata</p>
                      </div>

                      <div className="sysCircle" style={{ left: 522, top: 214 }}>
                        <span className="sysPort sysPort--top" aria-hidden="true" />
                        <DriveGlyph />
                      </div>
                      <div className="sysLabel sysLabel--wide" style={{ left: 552, top: 280 }}>
                        <h3>Google Drive</h3>
                        <p>Actual owner photo files</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------- 2B. Public Guest Event Experience ---------- */}
                <div className="sysSubflow">
                  <span className="sysSubLabel mono">B · Public guest event web (staging)</span>
                  <div className="sysScroll">
                    <div
                      className="sysBoard sysBoard--244"
                      role="img"
                      aria-label="TimeCapsule guest event web flow: Guest opens a 32-hex handle on TheNFCGuy.github.io/timecapsule/event/, which redirects to the staging Worker /event/{id}/ endpoint, looks up the event in D1, and serves either Guest Camera (HttpOnly cookie, 10-shot cap, uploads to Google Drive + D1 metadata) or Event Gallery (D1 manifest + Drive images via Worker)."
                    >
                      <svg className="sysEdges" viewBox="0 0 960 244" width="960" height="244" aria-hidden="true">
                        <defs>
                          <marker
                            id="sysArrow2B"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="rgba(244, 246, 250, 0.58)" />
                          </marker>
                        </defs>

                        <path className="sysContour" d="M 862 224 C 900 176, 944 140, 956 96" />

                        <path className="sysEdge" d="M 128 118 L 220 118" markerEnd="url(#sysArrow2B)" />
                        <path className="sysEdge" d="M 306 118 L 392 118" markerEnd="url(#sysArrow2B)" />
                        <path
                          className="sysEdge"
                          d="M 626 102 C 674 102, 686 58, 734 58"
                          markerEnd="url(#sysArrow2B)"
                        />
                        <path
                          className="sysEdge"
                          d="M 626 134 C 674 134, 686 178, 734 178"
                          markerEnd="url(#sysArrow2B)"
                        />

                        <text className="sysEdgeLabel" x="648" y="64">
                          camera
                        </text>
                        <text className="sysEdgeLabel" x="646" y="168">
                          gallery
                        </text>
                      </svg>

                      <div className="sysNode sysNode--trigger" style={{ left: 44, top: 80 }}>
                        <BoltGlyph color="#4cc9b8" />
                        <GlobeLinkGlyph />
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 84, top: 162 }}>
                        <h3>Guest Event URL</h3>
                        <p>32-hex handle · not QWED</p>
                      </div>

                      <div className="sysNode sysNode--square" style={{ left: 226, top: 80 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="github" size={28} />
                        <span className="sysPort sysPort--out" aria-hidden="true" />
                      </div>
                      <div className="sysLabel" style={{ left: 264, top: 162 }}>
                        <h3>TheNFCGuy.github.io</h3>
                        <p>/timecapsule/event/?id=…</p>
                      </div>

                      <div className="sysNode sysNode--hub224" style={{ left: 398, top: 80 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <Glyph icon="cloudflare" size={28} />
                        <div className="sysHubText">
                          <h3>TimeCapsule Worker</h3>
                          <p>/event/&#123;32-hex&#125;/ · D1 lookup</p>
                        </div>
                        <span className="sysPort sysPort--out" style={{ top: 22 }} aria-hidden="true" />
                        <span className="sysPort sysPort--out" style={{ top: 54 }} aria-hidden="true" />
                      </div>

                      <div className="sysNode sysNode--compact sysNode--teal" style={{ left: 740, top: 20 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <CameraGlyph />
                        <div className="sysHubText">
                          <h3>Guest Camera</h3>
                          <p>10-shot cap → Drive + D1</p>
                        </div>
                      </div>

                      <div className="sysNode sysNode--compact sysNode--blue" style={{ left: 740, top: 140 }}>
                        <span className="sysPort sysPort--in" aria-hidden="true" />
                        <GalleryGlyph />
                        <div className="sysHubText">
                          <h3>Event Gallery</h3>
                          <p>D1 manifest → Drive proxy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================================================
                SHARED QWERNFC ECOSYSTEM LAYER
               ============================================================== */}
            <div className="sysShared" role="group" aria-label="Shared QwerNFC static hosting">
              <div className="sysShared__host">
                <Glyph icon="github" size={18} />
                <span className="mono">TheNFCGuy.github.io</span>
                <span className="sysShared__tag">Shared static website repo</span>
              </div>
              <span className="sysShared__sep" aria-hidden="true">
                →
              </span>
              <div className="sysShared__paths">
                <span className="sysShared__path">
                  <code className="sysCode">/permanent-qr-manager/</code>
                  <span>GReview public routes</span>
                </span>
                <span className="sysShared__path">
                  <code className="sysCode">/timecapsule/event/</code>
                  <span>TimeCapsule event entry</span>
                </span>
              </div>
            </div>
          </div>

          <figcaption className="sysCaption">
            <strong>Independent backends. Independent databases. Independent authentication.</strong>{' '}
            GReview and TimeCapsule share Capacitor 8 + Cloudflare Workers lineage and static
            subpath hosting on <code className="sysCode">TheNFCGuy.github.io</code>, with no
            direct cross-product API connection.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
