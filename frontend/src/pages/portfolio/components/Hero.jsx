import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import './Hero.css'

export default function Hero({ about }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

  const profileImageUrl = (() => {
    const src = about?.profile_image
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    const origin = new URL(API_BASE_URL).origin
    return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
  })()

  // Use admin theme if available, otherwise use season theme
  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    secondary: theme.secondary_color || seasonConfig?.colors?.secondary || '#e8f4f8',
    text: theme.text_color || seasonConfig?.colors?.text || 'black'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    accent: seasonConfig?.colors?.accent || '#4da6ff',
    background: seasonConfig?.colors?.background || 'white',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    text: seasonConfig?.colors?.text || 'black'
  }

  return (
    <section className="hero" id="hero" style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      color: colors.background
    }}>
      <div className="hero-content">
        {profileImageUrl ? (
          <img className="hero-avatar" src={profileImageUrl} alt="Profile" />
        ) : (
          <div className="hero-avatar placeholder" />
        )}
        <h1 style={{ color: colors.background }}>
          {about?.hero_name || about?.hero_heading || 'Your Name'}
        </h1>
        <p style={{ color: colors.secondary }}>
          {about?.hero_role || about?.hero_subheading || 'Your Role'}
        </p>
        <p className="bio" style={{ color: colors.background }}>
          {about?.hero_tagline || about?.about_text || ''}
        </p>
      </div>
    </section>
  )
}
