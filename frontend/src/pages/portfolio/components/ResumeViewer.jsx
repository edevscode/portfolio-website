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
          <object 
            data={`${url}#toolbar=0&navpanes=0`} 
            type="application/pdf" 
            width="100%" 
            height="100%"
            className="resume-object"
          >
            <div className="resume-viewer-fallback">
              <p>It looks like your browser or an extension is blocking the PDF viewer.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="resume-fallback-link">
                Open Resume in New Tab
              </a>
            </div>
          </object>
        </div>
        <div className="resume-viewer-footer">
          <p>Trouble viewing? <a href={url} target="_blank" rel="noopener noreferrer">Click here to open in a new tab</a></p>
        </div>
      </div>
    </div>
  )
}
