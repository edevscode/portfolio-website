import React, { useEffect } from 'react'
import { ensureReadableColor } from '../../../utils/color'
import './ResumeViewer.css'

export default function ResumeViewer({ url, onClose, colors }) {
  useEffect(() => {
    if (!url) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [url, onClose])

  if (!url) return null

  const footerLinkColor = ensureReadableColor(colors?.primary || '#0066cc', '#fcfcfc', '#111827', 4.5)

  return (
    <div
      className="resume-viewer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Resume viewer"
      onClick={onClose}
    >
      <div 
        className="resume-viewer-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--accent': footerLinkColor }}
      >
        <div className="resume-viewer-header">
          <h3>Resume / CV</h3>
          <div className="resume-viewer-actions">
            <a 
              href={url} 
              download 
              className="resume-download-btn"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--theme-on-primary)' }}
            >
              Download PDF
            </a>
            <button type="button" className="resume-close-btn" onClick={onClose} aria-label="Close resume viewer">
              &times;
            </button>
          </div>
        </div>
        <div className="resume-viewer-body">
          <iframe 
            src={`${url}#toolbar=0&navpanes=0`} 
            title="Resume Viewer"
            width="100%" 
            height="100%"
            frameBorder="0"
          />
        </div>
        <div className="resume-viewer-footer">
          <p>Trouble viewing? <a href={url} target="_blank" rel="noopener noreferrer">Click here to open in a new tab</a></p>
        </div>
      </div>
    </div>
  )
}
