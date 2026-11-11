import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { profile } from '../data/profile.js'

/* The link the QR code encodes. When profile.siteUrl is filled in, every
   visitor shares that permanent address no matter where they are browsing
   from. Before the site is online it falls back to the current address, which
   keeps the local preview honest instead of encoding a link that goes nowhere. */
function currentUrl() {
  const fixed = (profile.siteUrl || '').trim()
  if (fixed) return fixed.replace(/\/$/, '')
  if (typeof window === 'undefined') return ''
  return window.location.href.split('#')[0]
}

export default function ShareSheet({ open, onClose }) {
  const [closing, setClosing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('')
  const [qrSrc, setQrSrc] = useState('')
  const [qrError, setQrError] = useState('')
  const panelRef = useRef(null)
  const url = useMemo(() => (open ? currentUrl() : ''), [open])

  /* A localhost address only opens on this PC, so the caption must not promise
     a permanent link that no phone can reach. */
  const isLocal = useMemo(() => {
    try {
      const host = new URL(url).hostname
      return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
    } catch {
      return false
    }
  }, [url])

  /* Close runs through the exit animation before the parent unmounts it. */
  const requestClose = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 200)
  }

  useEffect(() => {
    if (!open) {
      setClosing(false)
      setCopied(false)
      setStatus('')
      return
    }
    const onKey = (event) => {
      if (event.key === 'Escape') requestClose()
      if (event.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll('[data-focusable]')
        if (!focusables || focusables.length === 0) return
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
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector('[data-focusable]')?.focus()
    }, 60)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* Build the QR from the real address, and say so if it cannot be built. */
  useEffect(() => {
    if (!open || !url) return
    let cancelled = false
    setQrError('')
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 560,
      color: { dark: '#080b12', light: '#f4f6fa' }
    })
      .then((dataUrl) => {
        if (!cancelled) setQrSrc(dataUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setQrSrc('')
          setQrError('Could not draw the code. Use the link or copy it instead.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [open, url])

  const copyLink = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setStatus('Link copied.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard refused (no permission or insecure origin): show the link so
      // it can be selected by hand rather than pretending the copy worked.
      setStatus('Could not copy automatically — select the link below and copy it.')
    }
  }

  const nativeShare = async () => {
    if (!url || !navigator.share) return
    try {
      await navigator.share({
        title: `${profile.name} — ${profile.title}`,
        text: profile.tagline,
        url
      })
      setStatus('Shared.')
    } catch {
      // The user dismissed the sheet; nothing to report.
    }
  }

  const downloadQr = () => {
    if (!qrSrc) return
    const link = document.createElement('a')
    link.href = qrSrc
    link.download = 'mark-john-rey-portfolio-qr.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setStatus('QR saved as a PNG.')
  }

  if (!open) return null

  return (
    <div
      className={`shareSheet__backdrop${closing ? ' isClosing' : ''}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <div
        ref={panelRef}
        className="shareSheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shareSheetTitle"
      >
        <div className="shareSheet__head">
          <div>
            <span className="mono shareSheet__eyebrow">Share</span>
            <h2 id="shareSheetTitle">Pass this portfolio on</h2>
          </div>
          <button
            type="button"
            className="shareSheet__close"
            onClick={requestClose}
            aria-label="Close share panel"
            data-focusable
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
        </div>

        <div className="shareSheet__body">
          <div className="shareSheet__qr">
            {qrSrc ? (
              <img src={qrSrc} alt={`QR code that opens ${url}`} width="220" height="220" />
            ) : (
              <div className="shareSheet__qrEmpty">
                <span className="mono">{qrError ? 'QR unavailable' : 'Building code…'}</span>
              </div>
            )}
            <p className="shareSheet__caption mono">
              {isLocal ? 'Local preview link — opens on this PC' : 'Permanent link — scan to open'}
            </p>
          </div>

          <div className="shareSheet__controls">
            <label className="shareSheet__field">
              <span className="mono">Link</span>
              <input
                type="text"
                value={url}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
                data-focusable
              />
            </label>

            <div className="shareSheet__buttons">
              <button type="button" className="shareSheet__btn isPrimary" onClick={copyLink} data-focusable>
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                className="shareSheet__btn"
                onClick={downloadQr}
                disabled={!qrSrc}
                data-focusable
              >
                Download QR
              </button>
              {typeof navigator !== 'undefined' && navigator.share ? (
                <button type="button" className="shareSheet__btn" onClick={nativeShare} data-focusable>
                  Share…
                </button>
              ) : null}
            </div>

            <p className="shareSheet__status mono" role="status" aria-live="polite">
              {status}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
