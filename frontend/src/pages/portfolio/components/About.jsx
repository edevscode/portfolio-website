import React, { useState } from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import ResumeViewer from './ResumeViewer'
import './About.css'

export default function About({ about }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const [showResume, setShowResume] = useState(false)

  const profileImageUrl = (() => {
    const src = about?.profile_image
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    const origin = new URL(API_BASE_URL).origin
    return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
  })()

  const resumeFileUrl = (() => {
    const src = about?.resume_file
    if (!src) return ''
    
    // Construct full URL if it's a relative path
    if (!/^https?:\/\//i.test(src)) {
      const origin = new URL(API_BASE_URL).origin
      return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
    }
    
    return src
  })()

  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    text: theme.text_color || seasonConfig?.colors?.text || 'black'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black'
  }

  return (
    <section className="about" id="about" style={{
      backgroundColor: colors.background
    }}>
      <div className="container">
        <h2 style={{ color: colors.primary }}>About Me</h2>

        <div className="about-grid">
          <div className="about-media">
            {profileImageUrl ? (
              <img className="about-avatar" src={profileImageUrl} alt="Profile" />
            ) : (
              <div className="about-avatar placeholder" />
            )}
          </div>

          <div className="about-content">
            {about?.about_text && (
              <div className="about-block">
                <p style={{ color: colors.text }}>
                  {about.about_text}
                </p>
              </div>
            )}
            
            {resumeFileUrl && (
              <div className="about-actions">
                <button 
                  className="view-resume-btn" 
                  onClick={() => setShowResume(true)}
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  View Resume
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showResume && (
        <ResumeViewer 
          url={resumeFileUrl} 
          onClose={() => setShowResume(false)} 
          colors={colors}
        />
      )}
    </section>
  )
}
