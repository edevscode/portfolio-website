import React, { useState, useEffect, useCallback } from 'react'
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

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  return (
    <div className="cert-lightbox" onClick={onClose}>
      <button className="cert-lb-close" onClick={onClose} aria-label="Close">✕</button>
      {images.length > 1 && (
        <>
          <button className="cert-lb-nav cert-lb-prev" onClick={e => { e.stopPropagation(); prev() }}>‹</button>
          <button className="cert-lb-nav cert-lb-next" onClick={e => { e.stopPropagation(); next() }}>›</button>
        </>
      )}
      <img
        src={images[idx].file}
        alt={images[idx].caption || ''}
        className="cert-lb-img"
        onClick={e => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="cert-lb-counter">{idx + 1} / {images.length}</div>
      )}
    </div>
  )
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
function CertCard({ cert, primary, accent, text }) {
  const [lightboxStart, setLightboxStart] = useState(null)
  const [failedUrls, setFailedUrls] = useState(new Set())

  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date()
  const files = (cert.files || [])
    .map(f => ({ ...f, file: normalizeUrl(f.file) }))
    .filter(f => f.file)  // skip null/empty file URLs
  const imageFiles = files.filter(f => certFileType(f.file) === 'image' && !failedUrls.has(f.file))
  const docFiles   = files.filter(f => certFileType(f.file) !== 'image')
  const firstImage = imageFiles[0]

  const onImgError = (url) => setFailedUrls(prev => new Set([...prev, url]))

  return (
    <>
      {lightboxStart !== null && (
        <Lightbox images={imageFiles} startIndex={lightboxStart} onClose={() => setLightboxStart(null)} />
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
            {isExpired && <span className="cert-tag cert-tag--expired">Expired</span>}
            {!cert.expiry_date && <span className="cert-tag cert-tag--lifetime">No Expiry</span>}
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
            {cert.expiry_date && <span> · Expires {formatDate(cert.expiry_date)}</span>}
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

        {/* Footer: doc downloads + verify link */}
        {(docFiles.length > 0 || cert.credential_url) && (
          <div className="cert-card-footer">
            {docFiles.map(f => {
              const type = certFileType(f.file)
              return (
                <a
                  key={f.id}
                  href={f.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-verify-btn"
                  style={{ '--btn-color': type === 'word' ? '#2563eb' : '#dc2626' }}
                >
                  {type === 'pdf' ? 'View PDF' : 'Download DOC'}
                  {f.caption && <span style={{ fontWeight: 400, opacity: 0.75 }}> — {f.caption}</span>}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </a>
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
