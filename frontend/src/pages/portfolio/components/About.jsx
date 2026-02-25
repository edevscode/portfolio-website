import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import './About.css'

export default function About({ about }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

  const profileImageUrl = (() => {
    const src = about?.profile_image
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    const origin = new URL(API_BASE_URL).origin
    return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
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
          </div>
        </div>
      </div>
    </section>
  )
}
