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

  const colors = theme ? {
    primary:    theme.primary_color    || seasonConfig?.colors?.primary    || '#1a472a',
    accent:     theme.accent_color     || seasonConfig?.colors?.accent     || '#6366f1',
    background: theme.background_color || seasonConfig?.colors?.background || '#ffffff',
    secondary:  theme.secondary_color  || seasonConfig?.colors?.secondary  || '#f1f5f9',
    text:       theme.text_color       || seasonConfig?.colors?.text       || '#1e293b',
  } : {
    primary:    seasonConfig?.colors?.primary    || '#1a472a',
    accent:     seasonConfig?.colors?.accent     || '#6366f1',
    background: seasonConfig?.colors?.background || '#ffffff',
    secondary:  seasonConfig?.colors?.secondary  || '#f1f5f9',
    text:       seasonConfig?.colors?.text       || '#1e293b',
  }

  const primaryCta = {
    text: about?.hero_cta_primary_text   || 'View My Work',
    href: about?.hero_cta_primary_link   || '#projects',
  }
  const secondaryCta = {
    text: about?.hero_cta_secondary_text || 'Get In Touch',
    href: about?.hero_cta_secondary_link || '#contact',
  }

  return (
    <section
      className="hero-section"
      id="hero"
      style={{
        '--hp': colors.primary,
        '--ha': colors.accent,
        '--hb': colors.background,
        '--ht': colors.text,
        '--hs': colors.secondary,
      }}
    >
      {/* Background orbs */}
      <span className="hero-orb hero-orb--1" aria-hidden="true" />
      <span className="hero-orb hero-orb--2" aria-hidden="true" />
      <span className="hero-orb hero-orb--3" aria-hidden="true" />

      <div className="hero-inner">

        {/* ── Left: text ── */}
        <div className="hero-text">
          <span className="hero-greeting">Hello, I'm</span>

          <h1 className="hero-name">
            {about?.hero_name || about?.hero_heading || 'Your Name'}
          </h1>

          {(about?.hero_role || about?.hero_subheading) && (
            <p className="hero-role">
              {about.hero_role || about.hero_subheading}
            </p>
          )}

          {about?.hero_tagline && (
            <p className="hero-tagline">{about.hero_tagline}</p>
          )}

          <div className="hero-ctas">
            <a href={primaryCta.href} className="hero-btn-primary">
              {primaryCta.text}
            </a>
            <a href={secondaryCta.href} className="hero-btn-secondary">
              {secondaryCta.text}
            </a>
          </div>
        </div>

        {/* ── Right: photo ── */}
        <div className="hero-visual">
          <div className="hero-photo-frame">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={about?.hero_name || 'Profile'}
                className="hero-photo"
              />
            ) : (
              <div className="hero-photo hero-photo--empty" />
            )}
          </div>
          {/* Decorative floating chips */}
          <span className="hero-deco hero-deco--tl" aria-hidden="true" />
          <span className="hero-deco hero-deco--br" aria-hidden="true" />
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll-track">
          <span className="hero-scroll-thumb" />
        </span>
      </div>
    </section>
  )
}
