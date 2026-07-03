import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useSeasonContext } from '../../../context/useSeasonContext'
import './Certificates.css'

function certFileType(url) {
  if (!url) return null
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'word'
  return 'image'
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

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
          {certificates.map((cert) => (
            <CertCard key={cert.id} cert={cert} primary={primary} accent={accent} text={text} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CertFileBadge({ url, title, primary, accent }) {
  const type = certFileType(url)
  if (!url) {
    return (
      <div className="cert-badge-placeholder" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}22)`, border: `2px solid ${primary}33` }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      </div>
    )
  }
  if (type === 'pdf') {
    return (
      <div className="cert-badge-placeholder cert-badge-doc" style={{ background: '#fff1f0', border: '2px solid #fca5a5' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
        <span className="cert-badge-doc-label" style={{ color: '#dc2626' }}>PDF</span>
      </div>
    )
  }
  if (type === 'word') {
    return (
      <div className="cert-badge-placeholder cert-badge-doc" style={{ background: '#eff6ff', border: '2px solid #93c5fd' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
        <span className="cert-badge-doc-label" style={{ color: '#2563eb' }}>DOC</span>
      </div>
    )
  }
  return <img src={url} alt={title} className="cert-badge" />
}

function CertCard({ cert, primary, accent, text }) {
  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date()
  const hasLink = cert.credential_url
  const fileUrl = cert.image
  const docType = certFileType(fileUrl)
  const hasDoc = fileUrl && (docType === 'pdf' || docType === 'word')

  return (
    <div className={`cert-card${cert.is_featured ? ' cert-card--featured' : ''}`} style={{ '--primary': primary, '--accent': accent }}>
      {cert.is_featured && <div className="cert-featured-ribbon">Featured</div>}

      <div className="cert-card-top">
        <CertFileBadge url={cert.image} title={cert.title} primary={primary} accent={accent} />

        <div className="cert-meta">
          {isExpired && <span className="cert-tag cert-tag--expired">Expired</span>}
          {!cert.expiry_date && <span className="cert-tag cert-tag--lifetime">No Expiry</span>}
        </div>
      </div>

      <div className="cert-card-body">
        <h3 className="cert-title" style={{ color: text }}>{cert.title}</h3>
        <p className="cert-issuer" style={{ color: primary }}>{cert.issuer}</p>

        {cert.description && (
          <p className="cert-desc" style={{ color: text }}>{cert.description}</p>
        )}

        <div className="cert-dates" style={{ color: text }}>
          <span>Issued {formatDate(cert.issue_date)}</span>
          {cert.expiry_date && <span> · Expires {formatDate(cert.expiry_date)}</span>}
        </div>

        {cert.credential_id && (
          <p className="cert-id" style={{ color: text }}>ID: {cert.credential_id}</p>
        )}
      </div>

      {(hasLink || hasDoc) && (
        <div className="cert-card-footer">
          {hasDoc && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-verify-btn"
              style={{ '--btn-color': docType === 'word' ? '#2563eb' : '#dc2626' }}
            >
              {docType === 'pdf' ? 'View PDF' : 'Download Doc'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          )}
          {hasLink && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-verify-btn"
              style={{ '--btn-color': primary }}
            >
              Verify Credential
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
