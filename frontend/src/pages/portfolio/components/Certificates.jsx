import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { API_BASE_URL } from '../../../services/apiService'
import './Certificates.css'

function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  try {
    return `${new URL(API_BASE_URL).origin}${url.startsWith('/') ? '' : '/'}${url}`
  } catch {
    return url
  }
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function certFileType(url) {
  if (!url) return null
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'word'
  return 'image'
}

/* ─── DocViewer ─────────────────────────────────────────────────────────── */
function DocViewer({ file, type, caption, onClose }) {
  const src = type === 'pdf'
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(file)}&embedded=true`
    : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file)}`

  return (
    <div className="cert-lightbox" onClick={onClose}>
      <button className="cert-lb-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="cert-doc-frame" onClick={e => e.stopPropagation()}>
        <div className="cert-doc-toolbar">
          <span className="cert-doc-label">{type === 'pdf' ? 'PDF' : 'DOC'}{caption ? ` — ${caption}` : ''}</span>
          <a href={file} target="_blank" rel="noopener noreferrer" className="cert-doc-open-tab">
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={src}
          title={caption || 'Document viewer'}
          className="cert-doc-iframe"
        />
      </div>
    </div>
  )
}

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const [fading, setFading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const lbRef = useRef(null)

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  const navigate = useCallback((next) => {
    resetView()
    setFading(true)
    setTimeout(() => { setIdx(next); setFading(false) }, 160)
  }, [resetView])

  const prev = useCallback(() => navigate((idx - 1 + images.length) % images.length), [idx, images.length, navigate])
  const next = useCallback(() => navigate((idx + 1) % images.length), [idx, images.length, navigate])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
      else if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose, resetView])

  // Scroll-to-zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const el = lbRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      setZoom(prev => {
        const next = Math.min(Math.max(prev + (e.deltaY < 0 ? 0.25 : -0.25), 1), 5)
        if (next === 1) setPan({ x: 0, y: 0 })
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Drag-to-pan while zoomed
  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const src = e.touches ? e.touches[0] : e
      setPan({ x: src.clientX - dragOrigin.current.x, y: src.clientY - dragOrigin.current.y })
    }
    const onUp = () => setDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [dragging])

  const handleImgPointerDown = (e) => {
    e.stopPropagation()
    if (zoom <= 1) return
    dragOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    setDragging(true)
  }

  const handleImgClick = (e) => {
    e.stopPropagation()
    if (dragging) return
    setZoom(prev => {
      if (prev > 1) { setPan({ x: 0, y: 0 }); return 1 }
      return 2.5
    })
  }

  const current = images[idx]

  return (
    <div ref={lbRef} className="cert-lightbox" onClick={onClose}>
      <button className="cert-lb-close" onClick={onClose} aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {zoom > 1 && (
        <button className="cert-lb-zoom-badge" onClick={e => { e.stopPropagation(); resetView() }}>
          {Math.round(zoom * 10) / 10}× &nbsp;·&nbsp; click to reset
        </button>
      )}

      {images.length > 1 && (
        <>
          <button className="cert-lb-nav cert-lb-prev" onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="cert-lb-nav cert-lb-next" onClick={e => { e.stopPropagation(); next() }} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      <div className="cert-lb-content" onClick={e => e.stopPropagation()}>
        <img
          key={idx}
          src={current.file}
          alt={current.caption || ''}
          className={`cert-lb-img${fading ? ' cert-lb-img--out' : ''}`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: dragging ? 'opacity 0.16s ease' : 'opacity 0.16s ease, transform 0.22s ease',
          }}
          onClick={handleImgClick}
          onMouseDown={handleImgPointerDown}
          draggable={false}
        />
        {current.caption && (
          <p className="cert-lb-caption">{current.caption}</p>
        )}
        {images.length > 1 && (
          <div className="cert-lb-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`cert-lb-dot${i === idx ? ' cert-lb-dot--active' : ''}`}
                onClick={() => navigate(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
function CertCard({ cert, primary, accent, text }) {
  const [lightboxStart, setLightboxStart] = useState(null)
  const [viewingDoc, setViewingDoc] = useState(null)
  const [failedUrls, setFailedUrls] = useState(new Set())

  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date()
  const files = (cert.files || [])
    .map(f => ({ ...f, file: normalizeUrl(f.file) }))
    .filter(f => f.file)  // skip null/empty file URLs
  // Use server-side file_type when available (Cloudinary strips extensions from URLs)
  const getType = (f) => f.file_type || certFileType(f.file)
  const imageFiles = files.filter(f => getType(f) === 'image' && !failedUrls.has(f.file))
  const docFiles   = files.filter(f => getType(f) !== 'image')
  const firstImage = imageFiles[0]

  const onImgError = (url) => setFailedUrls(prev => new Set([...prev, url]))

  return (
    <>
      {lightboxStart !== null && (
        <Lightbox images={imageFiles} startIndex={lightboxStart} onClose={() => setLightboxStart(null)} />
      )}
      {viewingDoc && (
        <DocViewer {...viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <div className={`cert-card${cert.is_featured ? ' cert-card--featured' : ''}`} style={{ '--primary': primary, '--accent': accent }}>
        {cert.is_featured && <div className="cert-featured-ribbon">Featured</div>}

        {/* Top row: badge + meta tags */}
        <div className="cert-card-top">
          {/* Badge / first image thumbnail */}
          {firstImage ? (
            <img
              src={firstImage.file}
              alt={cert.title}
              className="cert-badge cert-badge--clickable"
              onClick={() => setLightboxStart(0)}
              title="Click to view"
              onError={() => onImgError(firstImage.file)}
            />
          ) : (
            <div className="cert-badge-placeholder" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}22)`, border: `2px solid ${primary}33` }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
          )}

          <div className="cert-meta">
            {files.length > 0 && (
              <span className="cert-tag cert-tag--files">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Text body */}
        <div className="cert-card-body">
          <h3 className="cert-title" style={{ color: text }}>{cert.title}</h3>
          <p className="cert-issuer" style={{ color: primary }}>{cert.issuer}</p>
          {cert.description && <p className="cert-desc" style={{ color: text }}>{cert.description}</p>}
          <div className="cert-dates" style={{ color: text }}>
            <span>Issued {formatDate(cert.issue_date)}</span>
          </div>
          {cert.credential_id && <p className="cert-id" style={{ color: text }}>ID: {cert.credential_id}</p>}
        </div>

        {/* Image strip (when there are multiple images) */}
        {imageFiles.length > 1 && (
          <div className="cert-img-strip">
            {imageFiles.map((img, i) => (
              <img
                key={img.id}
                src={img.file}
                alt={img.caption || `File ${i + 1}`}
                className="cert-strip-thumb"
                onClick={() => setLightboxStart(i)}
                title={img.caption || `View image ${i + 1}`}
                onError={() => onImgError(img.file)}
              />
            ))}
          </div>
        )}

        {/* Footer: view buttons for all file types + verify link */}
        {(imageFiles.length > 0 || docFiles.length > 0 || cert.credential_url) && (
          <div className="cert-card-footer">
            {imageFiles.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setLightboxStart(i)}
                className="cert-verify-btn cert-verify-btn--btn"
                style={{ '--btn-color': 'var(--primary)' }}
              >
                View Image
                {f.caption && <span style={{ fontWeight: 400, opacity: 0.75 }}> — {f.caption}</span>}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            ))}
            {docFiles.map(f => {
              const type = getType(f)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setViewingDoc({ file: f.file, type, caption: f.caption })}
                  className="cert-verify-btn cert-verify-btn--btn"
                  style={{ '--btn-color': type === 'word' ? '#2563eb' : '#dc2626' }}
                >
                  {type === 'pdf' ? 'View PDF' : 'View DOC'}
                  {f.caption && <span style={{ fontWeight: 400, opacity: 0.75 }}> — {f.caption}</span>}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </button>
              )
            })}
            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-verify-btn"
                style={{ '--btn-color': primary }}
              >
                Verify Credential
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function Certificates({ certificates }) {
  const { theme } = useTheme()
  const { config: seasonConfig } = useSeasonContext()

  if (!certificates?.length) return null

  const primary = theme?.primary_color || seasonConfig?.colors?.primary || '#6366f1'
  const accent  = theme?.accent_color  || seasonConfig?.colors?.accent  || '#4da6ff'
  const bg      = theme?.background_color || seasonConfig?.colors?.background || '#fff'
  const text    = theme?.text_color    || seasonConfig?.colors?.text    || '#111'

  return (
    <section className="certs-section" id="certificates" style={{ '--cert-primary': primary, '--cert-accent': accent, '--cert-bg': bg, '--cert-text': text }}>
      <div className="certs-inner">
        <div className="certs-heading">
          <span className="certs-label">Achievements</span>
          <h2 className="certs-title" style={{ color: primary }}>Certificates &amp; Credentials</h2>
          <p className="certs-subtitle" style={{ color: text }}>
            Verified skills and accomplishments earned through dedicated learning
          </p>
        </div>

        <div className="certs-grid">
          {certificates.map(cert => (
            <CertCard key={cert.id} cert={cert} primary={primary} accent={accent} text={text} />
          ))}
        </div>
      </div>
    </section>
  )
}
