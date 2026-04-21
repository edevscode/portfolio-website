import React from 'react'
import './ResumeViewer.css'

export default function ResumeViewer({ url, onClose, colors }) {
  if (!url) return null

  return (
    <div className="resume-viewer-overlay" onClick={onClose}>
      <div 
        className="resume-viewer-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--accent': colors.primary }}
      >
        <div className="resume-viewer-header">
          <h3>Resume / CV</h3>
          <div className="resume-viewer-actions">
            <a 
              href={url} 
              download 
              className="resume-download-btn"
              style={{ backgroundColor: colors.primary }}
            >
              Download PDF
            </a>
            <button className="resume-close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        <div className="resume-viewer-body">
          <iframe 
            src={`${url}#toolbar=0`} 
            title="Resume Viewer"
            width="100%" 
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}
