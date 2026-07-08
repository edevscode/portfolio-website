import React, { useState } from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import ResumeViewer from './ResumeViewer'
import Prose from '../../../components/Prose'
import './About.css'

export default function About({ about }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const [showResume, setShowResume] = useState(false)

  const resumeFileUrl = (() => {
    const src = about?.resume_file
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    const origin = new URL(API_BASE_URL).origin
    return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
  })()

  const colors = theme ? {
    primary:    theme.primary_color    || seasonConfig?.colors?.primary    || '#1a472a',
    accent:     theme.accent_color     || seasonConfig?.colors?.accent     || '#6366f1',
    background: theme.background_color || seasonConfig?.colors?.background || '#ffffff',
    text:       theme.text_color       || seasonConfig?.colors?.text       || '#1e293b',
    secondary:  theme.secondary_color  || seasonConfig?.colors?.secondary  || '#f1f5f9',
  } : {
    primary:    seasonConfig?.colors?.primary    || '#1a472a',
    accent:     seasonConfig?.colors?.accent     || '#6366f1',
    background: seasonConfig?.colors?.background || '#ffffff',
    text:       seasonConfig?.colors?.text       || '#1e293b',
    secondary:  seasonConfig?.colors?.secondary  || '#f1f5f9',
  }

  const hasContent = about?.about_intro || about?.about_background
    || about?.about_specialization || about?.about_text

  return (
    <section
      className="about"
      id="about"
      style={{
        '--ap': colors.primary,
        '--aa': colors.accent,
        '--ab': colors.background,
        '--at': colors.text,
        '--as': colors.secondary,
      }}
    >
      <div className="about-inner">

        <div className="about-heading">
          <span className="about-label">About Me</span>
          <h2 className="about-title">Who I Am</h2>
          <p className="about-subtitle">
            A little about my background and what drives me
          </p>
        </div>

        {hasContent && (
          <div className="about-content">

            {about?.about_intro && (
              <div className="about-intro-text">
                <Prose style={{ color: colors.text }}>{about.about_intro}</Prose>
              </div>
            )}

            {about?.about_background && (
              <div className="about-block">
                <div className="about-block-label">Background</div>
                <Prose style={{ color: colors.text }}>
                  {about.about_background}
                </Prose>
              </div>
            )}

            {about?.about_specialization && (
              <div className="about-block">
                <div className="about-block-label">Specialization</div>
                <Prose style={{ color: colors.text }}>
                  {about.about_specialization}
                </Prose>
              </div>
            )}

            {about?.about_text && (
              <div className="about-block">
                <Prose style={{ color: colors.text }}>
                  {about.about_text}
                </Prose>
              </div>
            )}

            {resumeFileUrl && (
              <div className="about-actions">
                <button
                  className="view-resume-btn"
                  onClick={() => setShowResume(true)}
                  style={{ backgroundColor: colors.primary, color: '#fff' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  View Resume
                </button>
              </div>
            )}

          </div>
        )}

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
